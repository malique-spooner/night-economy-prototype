import { describe, expect, it } from "vitest";
import type { MarketProduct } from "../../engine/types";
import { normalizeMarketProductPatch } from "./portalHelpers";

const product: MarketProduct = {
  id: "mp_test",
  symbol: "TEST",
  name: "Test Drink",
  category: "classic-cocktails",
  basePriceMinor: 1000,
  currentPriceMinor: 1100,
  floorPriceMinor: 800,
  ceilingPriceMinor: 1500,
  salesVelocity: 3,
  isLive: true,
  isSoldOut: false,
  priority: false,
};

describe("normalizeMarketProductPatch", () => {
  it("clamps current price between floor and ceiling", () => {
    expect(normalizeMarketProductPatch(product, { currentPriceMinor: 500 })).toMatchObject({
      floorPriceMinor: 800,
      currentPriceMinor: 800,
      ceilingPriceMinor: 1500,
    });

    expect(normalizeMarketProductPatch(product, { currentPriceMinor: 1800 })).toMatchObject({
      floorPriceMinor: 800,
      currentPriceMinor: 1500,
      ceilingPriceMinor: 1500,
    });
  });

  it("keeps ceiling above the floor when the floor is raised", () => {
    expect(normalizeMarketProductPatch(product, { floorPriceMinor: 1600 })).toMatchObject({
      floorPriceMinor: 1600,
      currentPriceMinor: 1600,
      ceilingPriceMinor: 1600,
    });
  });

  it("keeps current price inside the new ceiling", () => {
    expect(normalizeMarketProductPatch(product, { ceilingPriceMinor: 900 })).toMatchObject({
      floorPriceMinor: 800,
      currentPriceMinor: 900,
      ceilingPriceMinor: 900,
    });
  });

  it("trims names and keeps the old name when the edit is blank", () => {
    expect(normalizeMarketProductPatch(product, { name: "  Better Drink  " })).toEqual({ name: "Better Drink" });
    expect(normalizeMarketProductPatch(product, { name: "  " })).toEqual({ name: "Test Drink" });
  });
});
