import type { MarketProduct, PriceDecision } from "./types";

// The market uses each drink's manager-set range as its scale. This setting
// determines how readily normal service explores that range; there is no
// separate per-round cap beyond the product's own floor and ceiling.
const MARKET_INTENSITY = 1.25;

export type MarketSale = { productId: string; quantity: number };

export function clampPrice(product: MarketProduct, priceMinor: number) {
  return Math.max(product.floorPriceMinor, Math.min(product.ceilingPriceMinor, priceMinor));
}

export function priceProduct(product: MarketProduct): PriceDecision {
  return hold(product, "No market sales were supplied, so the price held.");
}

export function priceMarket(products: MarketProduct[], sales: MarketSale[] = []): PriceDecision[] {
  const active = products.filter(product => product.isLive && !product.isSoldOut);
  if (!active.length) return products.map(product => hold(product, "Product is not currently tradable."));

  const byCategory = active.reduce<Map<string, MarketProduct[]>>((groups, product) => {
    const peers = groups.get(product.category) ?? [];
    peers.push(product);
    groups.set(product.category, peers);
    return groups;
  }, new Map());
  const salesByProduct = new Map<string, number>();
  for (const sale of sales) {
    if (sale.quantity > 0) salesByProduct.set(sale.productId, (salesByProduct.get(sale.productId) ?? 0) + sale.quantity);
  }

  return products.map(product => {
    if (!product.isLive || product.isSoldOut) return hold(product, "Product is not currently tradable.");
    const peers = byCategory.get(product.category) ?? [product];
    if (peers.length === 1) return hold(product, "This is the only live product in its category, so the price held.");

    const categoryUnits = peers.reduce((sum, peer) => sum + (salesByProduct.get(peer.id) ?? 0), 0);
    if (!categoryUnits) return hold(product, "No orders were recorded in this category, so the price held.");

    // Every sale gives the sold drink +(N-1) points and each other live drink
    // -1. This is the same zero-sum game as +1 / shared -1, written as whole
    // numbers so it can be normalised against the category's own activity.
    const ownUnits = salesByProduct.get(product.id) ?? 0;
    const marketPoints = peers.length * ownUnits - categoryUnits;
    const marketSignal = marketPoints / (peers.length * categoryUnits);
    const activityFactor = categoryUnits / (categoryUnits + peers.length);
    const allowedRange = (product.ceilingPriceMinor - product.floorPriceMinor) / product.basePriceMinor;
    const percentageChange = MARKET_INTENSITY * allowedRange * activityFactor * marketSignal;
    const next = clampPrice(product, Math.round(product.currentPriceMinor * (1 + percentageChange)));
    const movement = next > product.currentPriceMinor ? "up" : next < product.currentPriceMinor ? "down" : "hold";
    const reason = movement === "hold"
      ? "Orders were evenly balanced within this category, so the price held."
      : `This drink ${movement === "up" ? "gained" : "lost"} market points against its category peers.`;
    return { productId: product.id, oldPriceMinor: product.currentPriceMinor, newPriceMinor: next, movement, reason };
  });
}

function hold(product: MarketProduct, reason: string): PriceDecision {
  return { productId: product.id, oldPriceMinor: product.currentPriceMinor, newPriceMinor: product.currentPriceMinor, movement: "hold", reason };
}
