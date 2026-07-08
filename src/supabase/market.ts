import { seedProducts, seedVenue } from "../data/seed";
import type { CrashIntervalMinutes, MarketProduct, Venue, VenueMarketSettings } from "../engine/types";
import { defaultVenueMarketSettings, isCrashIntervalMinutes, normalizeTimeInput } from "../engine/venueSettings";
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

export type VenueMarketSettingsPatch = Partial<VenueMarketSettings>;

export type MarketProductCreate = MarketProduct;

export type VenueRow = {
  id: string;
  slug: string;
  name: string;
  currency: string;
  timezone: string;
  market_live?: boolean | null;
  crash_interval_minutes?: number | null;
  launch_date?: string | null;
  launch_start_time?: string | null;
  launch_end_time?: string | null;
};

export type MarketProductRow = {
  id: string;
  market_symbol: string;
  display_name: string;
  category: string;
  base_price_minor: number;
  current_price_minor: number;
  floor_price_minor: number;
  ceiling_price_minor: number;
  sales_velocity?: number | null;
  is_live: boolean;
  is_sold_out: boolean;
  priority: boolean;
};

export function mapVenueRow(row: VenueRow): Venue {
  const defaults = defaultVenueMarketSettings();
  const crashIntervalMinutes = isCrashIntervalMinutes(row.crash_interval_minutes)
    ? row.crash_interval_minutes
    : defaults.crashIntervalMinutes;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    currency: row.currency,
    timezone: row.timezone,
    marketLive: row.market_live ?? defaults.marketLive,
    crashIntervalMinutes,
    launchDate: row.launch_date ?? defaults.launchDate,
    launchStartTime: normalizeTimeInput(row.launch_start_time, defaults.launchStartTime),
    launchEndTime: normalizeTimeInput(row.launch_end_time, defaults.launchEndTime),
  };
}

export function mapMarketProductRow(row: MarketProductRow): MarketProduct {
  return {
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
  };
}

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
    venue: mapVenueRow(venue),
    products: (products ?? []).map(mapMarketProductRow),
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

export async function createMarketProduct(venueId: string, product: MarketProductCreate) {
  if (!supabase) return { persisted: false as const, product };

  const { data, error } = await supabase
    .from("market_products")
    .insert(toMarketProductInsertRow(venueId, product))
    .select("*")
    .single();
  if (error) throw error;

  return { persisted: true as const, product: mapMarketProductRow(data) };
}

export async function updateVenueMarketSettings(venueId: string, patch: VenueMarketSettingsPatch) {
  if (!supabase) return { persisted: false as const };

  const rowPatch = toVenueMarketSettingsRowPatch(patch);
  if (!Object.keys(rowPatch).length) return { persisted: true as const };

  const { error } = await supabase.from("venues").update(rowPatch).eq("id", venueId);
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

function toMarketProductInsertRow(venueId: string, product: MarketProductCreate) {
  return {
    id: product.id,
    venue_id: venueId,
    market_symbol: product.symbol,
    display_name: product.name,
    category: product.category,
    base_price_minor: product.basePriceMinor,
    current_price_minor: product.currentPriceMinor,
    floor_price_minor: product.floorPriceMinor,
    ceiling_price_minor: product.ceilingPriceMinor,
    sales_velocity: product.salesVelocity,
    is_live: product.isLive,
    is_sold_out: product.isSoldOut,
    priority: product.priority,
  };
}

function toVenueMarketSettingsRowPatch(patch: VenueMarketSettingsPatch) {
  return {
    ...(patch.marketLive !== undefined ? { market_live: patch.marketLive } : {}),
    ...(patch.crashIntervalMinutes !== undefined
      ? { crash_interval_minutes: patch.crashIntervalMinutes as CrashIntervalMinutes }
      : {}),
    ...(patch.launchDate !== undefined ? { launch_date: patch.launchDate } : {}),
    ...(patch.launchStartTime !== undefined ? { launch_start_time: patch.launchStartTime } : {}),
    ...(patch.launchEndTime !== undefined ? { launch_end_time: patch.launchEndTime } : {}),
    updated_at: new Date().toISOString(),
  };
}
