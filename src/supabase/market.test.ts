import { describe, expect, it } from "vitest";
import { mapMarketProductRow, mapVenueRow, type MarketProductRow, type VenueRow } from "./market";

const venueRow: VenueRow = {
  id: "venue_123",
  slug: "pickled-pub",
  name: "The Pickled Pub",
  currency: "GBP",
  timezone: "Europe/London",
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
    });
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
