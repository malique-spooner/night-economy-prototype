import { describe, expect, it } from "vitest";
import type { MarketProduct } from "../../../../src/engine/types";
import {
  applyMarketProductPatch,
  applyVenueSettingsPatch,
  canEditMarketProducts,
  canManageVenueSettings,
  normalizeMarketProductPatch,
  portalAccessMessage,
  prepareMarketProductConfiguration,
  venueSettingsAccessMessage,
} from "../../../../src/components/portal/portalHelpers";

const product: MarketProduct = {
  id: "mp_test",
  posProductId: "pos_test",
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

describe("prepareMarketProductConfiguration", () => {
  it("creates market settings from a POS-owned product without changing the POS data", () => {
    expect(
      prepareMarketProductConfiguration({
        id: "mp_new",
        posProduct: {
          id: "pos_new",
          externalId: "pos_new",
          sku: "COCK-009",
          name: "Peach Highball",
          basePriceMinor: 1250,
          currentPriceMinor: 1250,
          currency: "GBP",
          isAvailable: true,
        },
        products: [product],
      }),
    ).toMatchObject({
      id: "mp_new",
      posProductId: "pos_new",
      name: "Peach Highball",
      basePriceMinor: 1250,
      currentPriceMinor: 1250,
      floorPriceMinor: 813,
      ceilingPriceMinor: 2063,
      isLive: false,
      isSoldOut: false,
    });
  });

  it("marks a market configuration unavailable when the POS product is sold out", () => {
    const configured = prepareMarketProductConfiguration({
      id: "mp_new",
      posProduct: { id: "pos_new", externalId: "pos_new", sku: "COCK-009", name: "Peach Highball", basePriceMinor: 1250, currentPriceMinor: 1250, currency: "GBP", isAvailable: false },
      products: [],
    });
    expect(configured.isSoldOut).toBe(true);
  });
});

describe("normalizeMarketProductPatch", () => {
  it("keeps the POS-controlled current price inside configured floor and ceiling", () => {
    expect(normalizeMarketProductPatch(product, { floorPriceMinor: 1600 })).toMatchObject({ floorPriceMinor: 1100, ceilingPriceMinor: 1500 });
    expect(normalizeMarketProductPatch(product, { ceilingPriceMinor: 900 })).toMatchObject({ floorPriceMinor: 800, ceilingPriceMinor: 1100 });
  });

  it("normalizes editable display name and symbol only", () => {
    expect(normalizeMarketProductPatch(product, { name: "  Better Drink  ", symbol: "b-d!" })).toEqual({ name: "Better Drink", symbol: "BD" });
  });
});

describe("market configuration access", () => {
  it("updates only the selected market product", () => {
    expect(applyMarketProductPatch([product, { ...product, id: "mp_other" }], "mp_test", { symbol: "NEW" })[0].symbol).toBe("NEW");
  });

  it("keeps venue settings separate from product settings", () => {
    expect(applyVenueSettingsPatch({ id: "ven_demo", slug: "demo", name: "Demo", currency: "GBP", timezone: "Europe/London", marketLive: false, crashIntervalMinutes: 30, launchDate: "2026-07-12", launchStartTime: "18:00", launchEndTime: "23:00" }, { marketLive: true })).toMatchObject({ marketLive: true, launchStartTime: "18:00" });
  });

  it("requires a membership to configure live POS-backed products", () => {
    expect(canEditMarketProducts({ isSignedIn: false, role: null, source: "supabase" })).toBe(false);
    expect(canEditMarketProducts({ isSignedIn: true, role: "staff", source: "supabase" })).toBe(true);
    expect(canManageVenueSettings({ role: "staff", source: "supabase" })).toBe(false);
  });

  it("explains access in market-configuration language", () => {
    expect(portalAccessMessage({ isSignedIn: false, isCheckingAccess: false, role: null, source: "seed" })).toBe("Demo changes stay local");
    expect(portalAccessMessage({ isSignedIn: true, isCheckingAccess: false, role: "owner", source: "supabase" })).toBe("Can configure as owner");
    expect(venueSettingsAccessMessage({ role: "staff", source: "supabase" })).toBe("Owner or admin access required");
  });
});
