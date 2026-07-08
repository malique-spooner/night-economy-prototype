import { describe, expect, it } from "vitest";
import type { MarketProduct } from "../../engine/types";
import {
  categoryChangePercent,
  categoryClass,
  categoryLabel,
  formatChangePercent,
  getFeaturedProducts,
  getStoryProduct,
  groupProductsByCategory,
  marketBoardLabel,
  marketStatusLabel,
  movementLabel,
  mobilePriceStatusLabel,
  productTrend,
} from "./tvHelpers";

const baseProduct: MarketProduct = {
  id: "product_base",
  symbol: "BASE",
  name: "Base Drink",
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

function product(overrides: Partial<MarketProduct>): MarketProduct {
  return { ...baseProduct, ...overrides };
}

describe("tvHelpers", () => {
  it("formats category and movement display values", () => {
    expect(categoryLabel("classic-cocktails")).toBe("Classic Cocktails");
    expect(categoryClass("Classic Cocktails!")).toBe("classic-cocktails");
    expect(productTrend(product({ currentPriceMinor: 1100 }))).toBe("up");
    expect(productTrend(product({ currentPriceMinor: 900 }))).toBe("dn");
    expect(formatChangePercent(product({ currentPriceMinor: 1125 }))).toBe("+12.5%");
    expect(formatChangePercent(product({ currentPriceMinor: 875 }))).toBe("-12.5%");
  });

  it("chooses movement labels from product state and price movement", () => {
    expect(movementLabel(product({ isSoldOut: true }))).toBe("Sold out");
    expect(movementLabel(product({ priority: true }))).toBe("House signal");
    expect(movementLabel(product({ currentPriceMinor: 1100 }))).toBe("Fast mover");
    expect(movementLabel(product({ currentPriceMinor: 1040 }))).toBe("Heating up");
    expect(movementLabel(product({ currentPriceMinor: 900 }))).toBe("Value window");
    expect(movementLabel(product({ currentPriceMinor: 960 }))).toBe("Cooling off");
    expect(movementLabel(product({ currentPriceMinor: 1000 }))).toBe("Steady trade");
  });

  it("groups products by category in source order", () => {
    const groups = groupProductsByCategory([
      product({ id: "a", category: "classic-cocktails" }),
      product({ id: "b", category: "mocktails" }),
      product({ id: "c", category: "classic-cocktails" }),
    ]);

    expect(groups.map(([category]) => category)).toEqual(["classic-cocktails", "mocktails"]);
    expect(groups[0][1].map(item => item.id)).toEqual(["a", "c"]);
  });

  it("averages category movement", () => {
    expect(
      categoryChangePercent([
        product({ id: "up", currentPriceMinor: 1100 }),
        product({ id: "down", currentPriceMinor: 900 }),
      ]),
    ).toBe(0);
    expect(categoryChangePercent([])).toBe(0);
  });

  it("features priority products first, then largest movers, and skips sold out products", () => {
    const featured = getFeaturedProducts([
      product({ id: "sold-out", currentPriceMinor: 1500, isSoldOut: true }),
      product({ id: "small-move", currentPriceMinor: 1030 }),
      product({ id: "priority", currentPriceMinor: 990, priority: true }),
      product({ id: "large-move", currentPriceMinor: 850 }),
      product({ id: "medium-move", currentPriceMinor: 1100 }),
    ]);

    expect(featured.map(item => item.id)).toEqual(["priority", "large-move", "medium-move"]);
  });

  it("uses the first featured product as the story product", () => {
    const products = [
      product({ id: "steady", currentPriceMinor: 1000 }),
      product({ id: "leader", currentPriceMinor: 1200 }),
    ];

    expect(getStoryProduct(products)?.id).toBe("leader");
    expect(getStoryProduct([])).toBeNull();
  });

  it("labels the venue market status", () => {
    expect(marketStatusLabel({ marketLive: true })).toBe("Market open");
    expect(marketStatusLabel({ marketLive: false })).toBe("Market paused");
    expect(marketBoardLabel({ marketLive: true })).toBe("Live Market Board");
    expect(marketBoardLabel({ marketLive: false })).toBe("Paused Market Board");
    expect(mobilePriceStatusLabel({ marketLive: true })).toBe("Live prices");
    expect(mobilePriceStatusLabel({ marketLive: false })).toBe("Paused prices");
  });
});
