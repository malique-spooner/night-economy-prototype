import type { MarketProduct } from "../../engine/types";
import type { MarketProductPatch } from "../../supabase/market";
import { categoryLabel, groupProductsByCategory } from "../tv/tvHelpers";

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

function hasPricePatch(patch: MarketProductPatch) {
  return (
    patch.floorPriceMinor !== undefined ||
    patch.currentPriceMinor !== undefined ||
    patch.ceilingPriceMinor !== undefined
  );
}
