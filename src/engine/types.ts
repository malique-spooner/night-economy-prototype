export type Venue = {
  id: string;
  slug: string;
  name: string;
  currency: string;
  timezone: string;
};

export type MarketProduct = {
  id: string;
  symbol: string;
  name: string;
  category: string;
  basePriceMinor: number;
  currentPriceMinor: number;
  floorPriceMinor: number;
  ceilingPriceMinor: number;
  salesVelocity: number;
  isLive: boolean;
  isSoldOut: boolean;
  priority: boolean;
};

export type PriceDecision = {
  productId: string;
  oldPriceMinor: number;
  newPriceMinor: number;
  movement: "up" | "down" | "hold";
  reason: string;
};
