import type { MarketProduct, Venue } from "../../engine/types";

export type ProductTrend = "up" | "dn";

export function productTrend(product: MarketProduct): ProductTrend {
  return product.currentPriceMinor >= product.basePriceMinor ? "up" : "dn";
}

export function productChangePercent(product: MarketProduct) {
  if (!product.basePriceMinor) return 0;
  return ((product.currentPriceMinor - product.basePriceMinor) / product.basePriceMinor) * 100;
}

export function formatChangePercent(product: MarketProduct) {
  const change = productChangePercent(product);
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
}

export function categoryLabel(category: string) {
  return category.replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

export function categoryClass(category: string) {
  return category
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function marketStatusLabel(venue: Pick<Venue, "marketLive">) {
  return venue.marketLive ? "Market open" : "Market paused";
}

export function marketBoardLabel(venue: Pick<Venue, "marketLive">) {
  return venue.marketLive ? "Live Market Board" : "Paused Market Board";
}

export function mobilePriceStatusLabel(venue: Pick<Venue, "marketLive">) {
  return venue.marketLive ? "Live prices" : "Paused prices";
}

export function movementLabel(product: MarketProduct) {
  if (product.isSoldOut) return "Sold out";
  if (product.priority) return "House signal";

  const change = productChangePercent(product);
  if (change >= 8) return "Fast mover";
  if (change >= 3) return "Heating up";
  if (change <= -8) return "Value window";
  if (change <= -3) return "Cooling off";
  return "Steady trade";
}

export function groupProductsByCategory(products: MarketProduct[]) {
  return Object.entries(
    products.reduce<Record<string, MarketProduct[]>>((groups, product) => {
      groups[product.category] ??= [];
      groups[product.category].push(product);
      return groups;
    }, {}),
  );
}

export function categoryChangePercent(products: MarketProduct[]) {
  if (!products.length) return 0;
  return products.reduce((total, product) => total + productChangePercent(product), 0) / products.length;
}

export function getFeaturedProducts(products: MarketProduct[]) {
  return [...products]
    .filter(product => product.isLive && !product.isSoldOut)
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority ? -1 : 1;
      return Math.abs(productChangePercent(b)) - Math.abs(productChangePercent(a));
    })
    .slice(0, 3);
}

export function getStoryProduct(products: MarketProduct[]) {
  return getFeaturedProducts(products)[0] ?? products.find(product => product.isLive) ?? null;
}
