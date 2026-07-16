const STEP_MINOR = 50;

export function priceMarketProduct(product) {
  if (!product.isLive || product.isSoldOut) {
    return decision(product, product.currentPriceMinor, "hold", "Product is not currently tradable.");
  }

  const rawNext = product.salesVelocity >= 7
    ? product.currentPriceMinor + STEP_MINOR
    : product.salesVelocity <= 2
      ? product.currentPriceMinor - STEP_MINOR
      : product.currentPriceMinor;
  const newPriceMinor = Math.max(product.floorPriceMinor, Math.min(product.ceilingPriceMinor, rawNext));
  const movement = newPriceMinor > product.currentPriceMinor ? "up" : newPriceMinor < product.currentPriceMinor ? "down" : "hold";

  if (movement === "up") return decision(product, newPriceMinor, movement, "Strong recent sales velocity pushed the price up one step.");
  if (movement === "down") return decision(product, newPriceMinor, movement, "Soft recent sales velocity pulled the price down one step.");
  if (product.currentPriceMinor === product.floorPriceMinor) return decision(product, newPriceMinor, movement, "Price held at the product floor.");
  if (product.currentPriceMinor === product.ceilingPriceMinor) return decision(product, newPriceMinor, movement, "Price held at the product ceiling.");
  return decision(product, newPriceMinor, movement, "Sales velocity was steady, so the price held.");
}

export function salesVelocityByPosProduct(sales) {
  return sales.reduce((velocities, sale) => {
    velocities.set(sale.pos_product_id, (velocities.get(sale.pos_product_id) ?? 0) + sale.quantity);
    return velocities;
  }, new Map());
}

function decision(product, newPriceMinor, movement, reason) {
  return {
    productId: product.id,
    oldPriceMinor: product.currentPriceMinor,
    newPriceMinor,
    movement,
    reason,
  };
}
