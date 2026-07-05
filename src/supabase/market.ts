import { seedProducts, seedVenue } from "../data/seed";
import type { MarketProduct, Venue } from "../engine/types";
import { supabase } from "./client";

export type MarketState = {
  venue: Venue;
  products: MarketProduct[];
  source: "seed" | "supabase";
};

export async function getMarketState(venueSlug: string): Promise<MarketState> {
  if (!supabase) return { venue: seedVenue, products: seedProducts, source: "seed" };

  const { data: venue } = await supabase.from("venues").select("*").eq("slug", venueSlug).maybeSingle();
  if (!venue) return { venue: seedVenue, products: seedProducts, source: "seed" };

  const { data: products } = await supabase
    .from("market_products")
    .select("*")
    .eq("venue_id", venue.id)
    .order("display_name");

  return {
    venue: {
      id: venue.id,
      slug: venue.slug,
      name: venue.name,
      currency: venue.currency,
      timezone: venue.timezone,
    },
    products: (products ?? []).map(row => ({
      id: row.id,
      symbol: row.market_symbol,
      name: row.display_name,
      category: row.category,
      basePriceMinor: row.base_price_minor,
      currentPriceMinor: row.current_price_minor,
      floorPriceMinor: row.floor_price_minor,
      ceilingPriceMinor: row.ceiling_price_minor,
      salesVelocity: 0,
      isLive: row.is_live,
      isSoldOut: row.is_sold_out,
      priority: row.priority,
    })),
    source: "supabase",
  };
}
