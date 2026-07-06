import { seedProducts, seedVenue } from "../data/seed";
import type { MarketProduct, Venue } from "../engine/types";
import { supabase } from "./client";

export type MarketState = {
  venue: Venue;
  products: MarketProduct[];
  source: "seed" | "supabase";
};

export type MarketProductPatch = Partial<
  Pick<
    MarketProduct,
    | "name"
    | "category"
    | "basePriceMinor"
    | "currentPriceMinor"
    | "floorPriceMinor"
    | "ceilingPriceMinor"
    | "isLive"
    | "isSoldOut"
    | "priority"
  >
>;

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
      salesVelocity: row.sales_velocity ?? 4,
      isLive: row.is_live,
      isSoldOut: row.is_sold_out,
      priority: row.priority,
    })),
    source: "supabase",
  };
}

export async function updateMarketProduct(productId: string, patch: MarketProductPatch) {
  if (!supabase) return { persisted: false as const };

  const rowPatch = toMarketProductRowPatch(patch);
  if (!Object.keys(rowPatch).length) return { persisted: true as const };

  const { error } = await supabase.from("market_products").update(rowPatch).eq("id", productId);
  if (error) throw error;

  return { persisted: true as const };
}

function toMarketProductRowPatch(patch: MarketProductPatch) {
  return {
    ...(patch.name !== undefined ? { display_name: patch.name } : {}),
    ...(patch.category !== undefined ? { category: patch.category } : {}),
    ...(patch.basePriceMinor !== undefined ? { base_price_minor: patch.basePriceMinor } : {}),
    ...(patch.currentPriceMinor !== undefined ? { current_price_minor: patch.currentPriceMinor } : {}),
    ...(patch.floorPriceMinor !== undefined ? { floor_price_minor: patch.floorPriceMinor } : {}),
    ...(patch.ceilingPriceMinor !== undefined ? { ceiling_price_minor: patch.ceilingPriceMinor } : {}),
    ...(patch.isLive !== undefined ? { is_live: patch.isLive } : {}),
    ...(patch.isSoldOut !== undefined ? { is_sold_out: patch.isSoldOut } : {}),
    ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
    updated_at: new Date().toISOString(),
  };
}
