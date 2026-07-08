import type { MarketProduct } from "../../engine/types";
import type { MarketProductPatch } from "../../supabase/market";
import type { VenueMemberRole } from "../../supabase/memberships";
import { categoryLabel, groupProductsByCategory } from "../tv/tvHelpers";

const quickAddDefaultPriceMinor = 1200;
const quickAddSafeMinMinor = 25;

export function portalCategories(products: MarketProduct[]) {
  return groupProductsByCategory(products).map(([category]) => category);
}

export function portalCategoryOptions(products: MarketProduct[], currentCategory: string) {
  return [...new Set([...portalCategories(products), currentCategory].filter(Boolean))];
}

export function portalCategoryLabel(category: string) {
  return categoryLabel(category);
}

export function formatInputMoney(valueMinor: number) {
  return (valueMinor / 100).toFixed(2);
}

export type QuickAddProductInput = {
  category: string;
  ceilingPrice: string;
  floorPrice: string;
  id: string;
  isSoldOut: boolean;
  name: string;
  price: string;
  products: MarketProduct[];
};

export type QuickAddProductResult =
  | { ok: true; product: MarketProduct }
  | { ok: false; message: string };

export type PortalCsvImportResult = {
  errors: string[];
  products: MarketProduct[];
};

export function prepareQuickAddProduct(input: QuickAddProductInput): QuickAddProductResult {
  const name = input.name.trim();
  if (!name) return { ok: false, message: "Enter a drink name" };

  const currentPriceMinor = parseMoneyMinor(input.price, quickAddDefaultPriceMinor);
  const floorPriceMinor = parseMoneyMinor(input.floorPrice, Math.round(currentPriceMinor * 0.65));
  const ceilingPriceMinor = Math.max(
    floorPriceMinor,
    parseMoneyMinor(input.ceilingPrice, Math.round(currentPriceMinor * 1.65)),
  );
  const clampedCurrentPriceMinor = Math.min(Math.max(currentPriceMinor, floorPriceMinor), ceilingPriceMinor);
  const category = input.category || input.products[0]?.category || "signature-cocktails";

  return {
    ok: true,
    product: {
      id: input.id,
      symbol: nextMarketSymbol(name, input.products),
      name,
      category,
      basePriceMinor: clampedCurrentPriceMinor,
      currentPriceMinor: clampedCurrentPriceMinor,
      floorPriceMinor,
      ceilingPriceMinor,
      salesVelocity: 4,
      isLive: true,
      isSoldOut: input.isSoldOut,
      priority: false,
    },
  };
}

export function preparePortalCsvProducts({
  csv,
  idFactory,
  products,
}: {
  csv: string;
  idFactory: () => string;
  products: MarketProduct[];
}): PortalCsvImportResult {
  const [headerLine, ...lines] = csv.split(/\r?\n/).filter(line => line.trim());
  if (!headerLine) return { errors: ["CSV is empty"], products: [] };

  const headers = parseCsvLine(headerLine).map(header => normalizeCsvHeader(header));
  const importedProducts: MarketProduct[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    const cells = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex] ?? ""]));
    const result = prepareQuickAddProduct({
      id: idFactory(),
      name: row.name ?? row.drink ?? row.product ?? "",
      category: row.category ?? row.cat ?? products[0]?.category ?? "signature-cocktails",
      price: row.price ?? row.saleprice ?? row.currentprice ?? "",
      floorPrice: row.floor ?? row.floorprice ?? "",
      ceilingPrice: row.ceiling ?? row.ceilingprice ?? "",
      isSoldOut: parseCsvBoolean(row.soldout ?? row.sold_out ?? row.paused),
      products: [...products, ...importedProducts],
    });

    if (result.ok) {
      importedProducts.push(result.product);
      return;
    }

    errors.push(`Row ${index + 2}: ${result.message}`);
  });

  return { errors, products: importedProducts };
}

export function normalizeMarketProductPatch(product: MarketProduct, patch: MarketProductPatch): MarketProductPatch {
  const next = { ...product, ...patch };

  const floorPriceMinor = Math.max(0, next.floorPriceMinor);
  const ceilingPriceMinor = Math.max(floorPriceMinor, next.ceilingPriceMinor);
  const currentPriceMinor = Math.min(Math.max(next.currentPriceMinor, floorPriceMinor), ceilingPriceMinor);

  return {
    ...patch,
    ...(hasPricePatch(patch)
      ? {
          floorPriceMinor,
          currentPriceMinor,
          ceilingPriceMinor,
        }
      : {}),
    ...(patch.name !== undefined ? { name: patch.name.trim() || product.name } : {}),
  };
}

export function canEditMarketProducts({
  isSignedIn,
  role,
  source,
}: {
  isSignedIn: boolean;
  role: VenueMemberRole | null;
  source: "seed" | "supabase";
}) {
  return source === "seed" || (isSignedIn && role !== null);
}

export function canManageVenueSettings({
  role,
  source,
}: {
  role: VenueMemberRole | null;
  source: "seed" | "supabase";
}) {
  return source === "seed" || role === "owner" || role === "admin";
}

export function venueSettingsAccessMessage({
  role,
  source,
}: {
  role: VenueMemberRole | null;
  source: "seed" | "supabase";
}) {
  if (source === "seed") return "Demo launch settings";
  if (role === "owner" || role === "admin") return "Launch settings can be saved";
  if (role === "staff") return "Owner or admin access required";

  return "Sign in as an owner or admin";
}

export function portalAccessMessage({
  isSignedIn,
  isCheckingAccess,
  role,
  source,
}: {
  isSignedIn: boolean;
  isCheckingAccess: boolean;
  role: VenueMemberRole | null;
  source: "seed" | "supabase";
}) {
  if (source === "seed") return "Demo changes stay local";
  if (!isSignedIn) return "Sign in to save changes";
  if (isCheckingAccess) return "Checking venue access";
  if (!role) return "No access to this venue";

  return `Can edit as ${role}`;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
}

function normalizeCsvHeader(header: string) {
  return header.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function parseCsvBoolean(value = "") {
  return ["1", "true", "yes", "y", "soldout", "sold out", "paused"].includes(value.trim().toLowerCase());
}

function parseMoneyMinor(value: string, fallbackMinor: number) {
  if (!value.trim()) return Math.max(quickAddSafeMinMinor, fallbackMinor);
  const parsed = Number(value);
  const minor = Number.isFinite(parsed) ? Math.round(parsed * 100) : fallbackMinor;
  return Math.max(quickAddSafeMinMinor, minor);
}

function nextMarketSymbol(name: string, products: MarketProduct[]) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map(word => word[0])
    .join("")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();
  const compact = name.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase();
  const base = (initials || compact || "NE").slice(0, 4);
  const used = new Set(products.map(product => product.symbol.toUpperCase()));

  if (!used.has(base)) return base;

  for (let index = 2; index < 100; index += 1) {
    const suffix = String(index);
    const candidate = `${base.slice(0, Math.max(1, 4 - suffix.length))}${suffix}`;
    if (!used.has(candidate)) return candidate;
  }

  return `${base.slice(0, 2)}${products.length + 1}`;
}

function hasPricePatch(patch: MarketProductPatch) {
  return (
    patch.floorPriceMinor !== undefined ||
    patch.currentPriceMinor !== undefined ||
    patch.ceilingPriceMinor !== undefined
  );
}
