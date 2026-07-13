import { describe, expect, it } from "vitest";
import { priceProduct } from "../../../src/engine/pricing";
import type { MarketProduct } from "../../../src/engine/types";

const baseProduct: MarketProduct = {
  id: "mp_test",
  symbol: "TEST",
  name: "Test Drink",
  category: "classic-cocktails",
  basePriceMinor: 1000,
  currentPriceMinor: 1000,
  floorPriceMinor: 700,
  ceilingPriceMinor: 1500,
  salesVelocity: 4,
  isLive: true,
  isSoldOut: false,
  priority: false,
};

describe("priceProduct", () => {
  it("moves up when sales velocity is strong", () => {
    expect(priceProduct({ ...baseProduct, salesVelocity: 8 }).newPriceMinor).toBe(1050);
  });

  it("moves down when sales velocity is soft", () => {
    expect(priceProduct({ ...baseProduct, salesVelocity: 1 }).newPriceMinor).toBe(950);
  });

  it("does not move outside floor and ceiling", () => {
    expect(priceProduct({ ...baseProduct, currentPriceMinor: 1500, salesVelocity: 9 }).newPriceMinor).toBe(1500);
    expect(priceProduct({ ...baseProduct, currentPriceMinor: 700, salesVelocity: 0 }).newPriceMinor).toBe(700);
  });
});
