import { describe, expect, it } from "vitest";
import { mobileCategorySectionId, mobileTickerSymbol } from "./mobileHelpers";

describe("mobileTickerSymbol", () => {
  it("uses the first two words as a compact drink mark", () => {
    expect(mobileTickerSymbol("Classic Espresso Martini")).toBe("CE");
    expect(mobileTickerSymbol("Spritz")).toBe("S");
  });
});

describe("mobileCategorySectionId", () => {
  it("creates stable category section ids", () => {
    expect(mobileCategorySectionId("classic-cocktails")).toBe("mobile-category-classic-cocktails");
    expect(mobileCategorySectionId("Bloody Mary")).toBe("mobile-category-bloody-mary");
  });

  it("falls back for empty category values", () => {
    expect(mobileCategorySectionId(" ")).toBe("mobile-category-menu");
  });
});
