const MARKET_INTENSITY = 1.25;

export function priceMarket(products, sales) {
  const active = products.filter(product => product.isLive && !product.isSoldOut);
  const byCategory = new Map();
  const sold = new Map();
  for (const product of active) byCategory.set(product.category, [...(byCategory.get(product.category) ?? []), product]);
  for (const sale of sales) {
    if (sale.quantity > 0) sold.set(sale.pos_product_id, (sold.get(sale.pos_product_id) ?? 0) + sale.quantity);
  }

  return products.map(product => {
    if (!product.isLive || product.isSoldOut) return decision(product, product.currentPriceMinor, "hold", "Product is not currently tradable.");
    const peers = byCategory.get(product.category) ?? [product];
    if (peers.length === 1) return decision(product, product.currentPriceMinor, "hold", "This is the only live product in its category, so the price held.");
    const categoryUnits = peers.reduce((sum, peer) => sum + (sold.get(peer.posProductId) ?? 0), 0);
    if (!categoryUnits) return decision(product, product.currentPriceMinor, "hold", "No orders were recorded in this category, so the price held.");

    const ownUnits = sold.get(product.posProductId) ?? 0;
    const marketPoints = peers.length * ownUnits - categoryUnits;
    const marketSignal = marketPoints / (peers.length * categoryUnits);
    const activityFactor = categoryUnits / (categoryUnits + peers.length);
    const allowedRange = (product.ceilingPriceMinor - product.floorPriceMinor) / (product.basePriceMinor ?? product.currentPriceMinor);
    const percentageChange = MARKET_INTENSITY * allowedRange * activityFactor * marketSignal;
    const next = Math.max(product.floorPriceMinor, Math.min(product.ceilingPriceMinor, Math.round(product.currentPriceMinor * (1 + percentageChange))));
    const movement = next > product.currentPriceMinor ? "up" : next < product.currentPriceMinor ? "down" : "hold";
    const reason = movement === "hold"
      ? "Orders were evenly balanced within this category, so the price held."
      : `This drink ${movement === "up" ? "gained" : "lost"} market points against its category peers.`;
    return decision(product, next, movement, reason);
  });
}

function decision(product, newPriceMinor, movement, reason) {
  return { productId: product.id, oldPriceMinor: product.currentPriceMinor, newPriceMinor, movement, reason };
}
