import type { MarketProduct, PriceDecision } from "./types";

const STEP_MINOR = 50;

export function clampPrice(product: MarketProduct, priceMinor: number) {
  return Math.max(product.floorPriceMinor, Math.min(product.ceilingPriceMinor, priceMinor));
}

export function priceProduct(product: MarketProduct): PriceDecision {
  if (!product.isLive || product.isSoldOut) {
    return {
      productId: product.id,
      oldPriceMinor: product.currentPriceMinor,
      newPriceMinor: product.currentPriceMinor,
      movement: "hold",
      reason: "Product is not currently tradable.",
    };
  }

  const rawNext =
    product.salesVelocity >= 7
      ? product.currentPriceMinor + STEP_MINOR
      : product.salesVelocity <= 2
        ? product.currentPriceMinor - STEP_MINOR
        : product.currentPriceMinor;

  const nextPrice = clampPrice(product, rawNext);
  const movement =
    nextPrice > product.currentPriceMinor ? "up" : nextPrice < product.currentPriceMinor ? "down" : "hold";

  return {
    productId: product.id,
    oldPriceMinor: product.currentPriceMinor,
    newPriceMinor: nextPrice,
    movement,
    reason: getReason(product, movement),
  };
}

export function priceMarket(products: MarketProduct[]) {
  return products.map(priceProduct);
}

function getReason(product: MarketProduct, movement: PriceDecision["movement"]) {
  if (movement === "up") return "Strong recent sales velocity pushed the price up one step.";
  if (movement === "down") return "Soft recent sales velocity pulled the price down one step.";
  if (product.currentPriceMinor === product.floorPriceMinor) return "Price held at the product floor.";
  if (product.currentPriceMinor === product.ceilingPriceMinor) return "Price held at the product ceiling.";
  return "Sales velocity was steady, so the price held.";
}
