import { describe, expect, it } from "vitest";
import type { MarketProduct } from "../../engine/types";
import { canEditMarketProducts, normalizeMarketProductPatch, portalAccessMessage } from "./portalHelpers";

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

describe("canEditMarketProducts", () => {
  it("allows seed edits without auth", () => {
    expect(canEditMarketProducts({ isSignedIn: false, role: null, source: "seed" })).toBe(true);
  });

  it("requires a venue membership role for Supabase edits", () => {
    expect(canEditMarketProducts({ isSignedIn: true, role: null, source: "supabase" })).toBe(false);
    expect(canEditMarketProducts({ isSignedIn: true, role: "staff", source: "supabase" })).toBe(true);
  });
});

describe("portalAccessMessage", () => {
  it("explains the current portal access state", () => {
    expect(portalAccessMessage({ isSignedIn: false, isCheckingAccess: false, role: null, source: "seed" })).toBe(
      "Demo changes stay local",
    );
    expect(portalAccessMessage({ isSignedIn: false, isCheckingAccess: false, role: null, source: "supabase" })).toBe(
      "Sign in to save changes",
    );
    expect(portalAccessMessage({ isSignedIn: true, isCheckingAccess: true, role: null, source: "supabase" })).toBe(
      "Checking venue access",
    );
    expect(portalAccessMessage({ isSignedIn: true, isCheckingAccess: false, role: null, source: "supabase" })).toBe(
      "No access to this venue",
    );
    expect(portalAccessMessage({ isSignedIn: true, isCheckingAccess: false, role: "owner", source: "supabase" })).toBe(
      "Can edit as owner",
    );
  });
});
