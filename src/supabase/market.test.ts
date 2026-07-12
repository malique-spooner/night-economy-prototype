import { describe, expect, it } from "vitest";
import {
  mapMarketProductRow,
  mapVenueRow,
  throwIfSupabaseQueryError,
  toMarketProductRowPatch,
  toVenueMarketSettingsRowPatch,
  type MarketProductRow,
  type VenueRow,
} from "./market";

const venueRow: VenueRow = {
  id: "venue_123",
  slug: "pickled-pub",
  name: "The Pickled Pub",
  currency: "GBP",
  timezone: "Europe/London",
  market_live: true,
  crash_interval_minutes: 60,
  launch_date: "2026-07-08",
  launch_start_time: "20:00:00",
  launch_end_time: "01:00:00",
};

const productRow: MarketProductRow = {
  id: "product_123",
  market_symbol: "LGR",
  display_name: "Lager",
  category: "Draught",
  base_price_minor: 500,
  current_price_minor: 550,
  floor_price_minor: 400,
  ceiling_price_minor: 700,
  sales_velocity: 9,
  is_live: true,
  is_sold_out: false,
  priority: true,
};

describe("mapVenueRow", () => {
  it("maps Supabase venue rows into app venues", () => {
    expect(mapVenueRow(venueRow)).toEqual({
      id: "venue_123",
      slug: "pickled-pub",
      name: "The Pickled Pub",
      currency: "GBP",
      timezone: "Europe/London",
      marketLive: true,
      crashIntervalMinutes: 60,
      launchDate: "2026-07-08",
      launchStartTime: "20:00",
      launchEndTime: "01:00",
    });
  });

  it("defaults missing market settings for older venue rows", () => {
    const mapped = mapVenueRow({
      id: "venue_123",
      slug: "pickled-pub",
      name: "The Pickled Pub",
      currency: "GBP",
      timezone: "Europe/London",
    });

    expect(mapped.marketLive).toBe(false);
    expect(mapped.crashIntervalMinutes).toBe(30);
    expect(mapped.launchDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(mapped.launchStartTime).toMatch(/^\d{2}:\d{2}$/);
    expect(mapped.launchEndTime).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("mapMarketProductRow", () => {
  it("maps Supabase product rows into app products", () => {
    expect(mapMarketProductRow(productRow)).toEqual({
      id: "product_123",
      symbol: "LGR",
      name: "Lager",
      category: "Draught",
      basePriceMinor: 500,
      currentPriceMinor: 550,
      floorPriceMinor: 400,
      ceilingPriceMinor: 700,
      salesVelocity: 9,
      isLive: true,
      isSoldOut: false,
      priority: true,
    });
  });

  it("defaults missing sales velocity for older rows", () => {
    expect(mapMarketProductRow({ ...productRow, sales_velocity: null }).salesVelocity).toBe(4);
  });
});

describe("throwIfSupabaseQueryError", () => {
  it("does nothing when Supabase returns no error", () => {
    expect(() => throwIfSupabaseQueryError(null, "Could not load venue")).not.toThrow();
  });

  it("keeps Supabase query failures visible instead of silently falling back to seed data", () => {
    expect(() =>
      throwIfSupabaseQueryError({ message: "permission denied for table market_products" }, "Could not load products"),
    ).toThrow("Could not load products: permission denied for table market_products");
  });

  it("uses the fallback message when Supabase does not provide detail", () => {
    expect(() => throwIfSupabaseQueryError({}, "Could not load venue")).toThrow("Could not load venue");
  });
});

describe("toMarketProductRowPatch", () => {
  it("returns an empty row patch when there are no product changes", () => {
    expect(toMarketProductRowPatch({})).toEqual({});
  });

  it("maps product patches to database columns and adds updated_at only for real changes", () => {
    expect(toMarketProductRowPatch({ name: "House Lager", isLive: false })).toMatchObject({
      display_name: "House Lager",
      is_live: false,
      updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
  });
});

describe("toVenueMarketSettingsRowPatch", () => {
  it("returns an empty row patch when there are no venue setting changes", () => {
    expect(toVenueMarketSettingsRowPatch({})).toEqual({});
  });

  it("maps venue setting patches to database columns and adds updated_at only for real changes", () => {
    expect(toVenueMarketSettingsRowPatch({ marketLive: true, crashIntervalMinutes: 60 })).toMatchObject({
      market_live: true,
      crash_interval_minutes: 60,
      updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
  });
});
