import { describe, expect, it } from "vitest";
import type { MarketProduct } from "../../../../src/engine/types";
import {
  applyMarketProductPatch,
  applyVenueSettingsPatch,
  canEditMarketProducts,
  canManageVenueSettings,
  normalizeMarketProductPatch,
  portalAccessMessage,
  preparePortalCsvProducts,
  prepareQuickAddProduct,
  venueSettingsAccessMessage,
} from "../../../../src/components/portal/portalHelpers";

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

describe("applyMarketProductPatch", () => {
  it("updates only the selected product", () => {
    const products = [product, { ...product, id: "mp_other", name: "Other Drink" }];

    expect(applyMarketProductPatch(products, "mp_test", { name: "Renamed" })).toEqual([
      { ...product, name: "Renamed" },
      { ...product, id: "mp_other", name: "Other Drink" },
    ]);
  });
});

describe("applyVenueSettingsPatch", () => {
  it("updates venue launch settings without changing the rest of the venue", () => {
    expect(
      applyVenueSettingsPatch(
        {
          id: "ven_demo",
          slug: "demo-venue",
          name: "Demo Venue",
          currency: "GBP",
          timezone: "Europe/London",
          marketLive: false,
          crashIntervalMinutes: 30,
          launchDate: "2026-07-12",
          launchStartTime: "18:00",
          launchEndTime: "23:00",
        },
        { marketLive: true, crashIntervalMinutes: 60 },
      ),
    ).toMatchObject({
      id: "ven_demo",
      marketLive: true,
      crashIntervalMinutes: 60,
      launchStartTime: "18:00",
    });
  });
});

describe("prepareQuickAddProduct", () => {
  it("creates a normalized product from quick-add input", () => {
    expect(
      prepareQuickAddProduct({
        id: "mp_new",
        name: "  Peach Highball ",
        category: "signature-cocktails",
        price: "12.50",
        floorPrice: "",
        ceilingPrice: "",
        isSoldOut: false,
        products: [product],
      }),
    ).toEqual({
      ok: true,
      product: {
        id: "mp_new",
        symbol: "PH",
        name: "Peach Highball",
        category: "signature-cocktails",
        basePriceMinor: 1250,
        currentPriceMinor: 1250,
        floorPriceMinor: 813,
        ceilingPriceMinor: 2063,
        salesVelocity: 4,
        isLive: true,
        isSoldOut: false,
        priority: false,
      },
    });
  });

  it("rejects missing names", () => {
    expect(
      prepareQuickAddProduct({
        id: "mp_new",
        name: " ",
        category: "signature-cocktails",
        price: "12",
        floorPrice: "",
        ceilingPrice: "",
        isSoldOut: false,
        products: [],
      }),
    ).toEqual({ ok: false, message: "Enter a drink name" });
  });

  it("keeps generated symbols unique", () => {
    const result = prepareQuickAddProduct({
      id: "mp_new",
      name: "Test Drink",
      category: "classic-cocktails",
      price: "10",
      floorPrice: "8",
      ceilingPrice: "12",
      isSoldOut: true,
      products: [{ ...product, symbol: "TD" }],
    });

    expect(result.ok ? result.product.symbol : "").toBe("TD2");
  });
});

describe("preparePortalCsvProducts", () => {
  it("imports products from CSV rows", () => {
    const result = preparePortalCsvProducts({
      csv: [
        "name,category,price,floor,ceiling,soldOut",
        "Peach Highball,signature-cocktails,12.5,8,18,false",
        "\"Spicy, Margarita\",classic-cocktails,11,,,yes",
      ].join("\n"),
      idFactory: (() => {
        let index = 0;
        return () => `mp_csv_${index += 1}`;
      })(),
      products: [product],
    });

    expect(result.errors).toEqual([]);
    expect(result.products).toMatchObject([
      {
        id: "mp_csv_1",
        name: "Peach Highball",
        category: "signature-cocktails",
        currentPriceMinor: 1250,
        floorPriceMinor: 800,
        ceilingPriceMinor: 1800,
        isSoldOut: false,
      },
      {
        id: "mp_csv_2",
        name: "Spicy, Margarita",
        category: "classic-cocktails",
        currentPriceMinor: 1100,
        isSoldOut: true,
      },
    ]);
  });

  it("reports invalid CSV rows", () => {
    expect(
      preparePortalCsvProducts({
        csv: "name,price\n,12",
        idFactory: () => "mp_csv_1",
        products: [],
      }),
    ).toEqual({ errors: ["Row 2: Enter a drink name"], products: [] });
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

describe("canManageVenueSettings", () => {
  it("limits Supabase venue settings to owners and admins", () => {
    expect(canManageVenueSettings({ role: null, source: "seed" })).toBe(true);
    expect(canManageVenueSettings({ role: "owner", source: "supabase" })).toBe(true);
    expect(canManageVenueSettings({ role: "admin", source: "supabase" })).toBe(true);
    expect(canManageVenueSettings({ role: "staff", source: "supabase" })).toBe(false);
    expect(canManageVenueSettings({ role: null, source: "supabase" })).toBe(false);
  });
});

describe("venueSettingsAccessMessage", () => {
  it("explains who can save launch settings", () => {
    expect(venueSettingsAccessMessage({ role: null, source: "seed" })).toBe("Demo launch settings");
    expect(venueSettingsAccessMessage({ role: "admin", source: "supabase" })).toBe("Launch settings can be saved");
    expect(venueSettingsAccessMessage({ role: "staff", source: "supabase" })).toBe(
      "Owner or admin access required",
    );
    expect(venueSettingsAccessMessage({ role: null, source: "supabase" })).toBe("Sign in as an owner or admin");
  });
});
