import type { MarketProduct, Venue, VenueMarketSettings } from "../../engine/types";
import type { MarketProductPatch, VenueMarketSettingsPatch } from "../../supabase/market";
import { groupProductsByCategory } from "../tv/tvHelpers";
import { PortalCategoryFilters } from "./PortalCategoryFilters";
import { PortalDrinkGroup } from "./PortalDrinkGroup";
import { PortalLaunchStrip } from "./PortalLaunchStrip";
import { PortalQuickAdd } from "./PortalQuickAdd";
import { portalCategories } from "./portalHelpers";

type Props = {
  lastSavedMessage: string;
  onProductChange: (productId: string, patch: MarketProductPatch, options?: { persist?: boolean }) => void;
  onProductAdd: (product: MarketProduct) => boolean | Promise<boolean>;
  onVenueSettingsChange: (patch: VenueMarketSettingsPatch) => void;
  products: MarketProduct[];
  source: "seed" | "supabase";
  venue: Venue;
};

export function PortalStartPage({
  lastSavedMessage,
  onProductAdd,
  onProductChange,
  onVenueSettingsChange,
  products,
  source,
  venue,
}: Props) {
  const groups = groupProductsByCategory(products);
  const categories = portalCategories(products);
  const settings: VenueMarketSettings = {
    marketLive: venue.marketLive,
    crashIntervalMinutes: venue.crashIntervalMinutes,
    launchDate: venue.launchDate,
    launchStartTime: venue.launchStartTime,
    launchEndTime: venue.launchEndTime,
  };

  return (
    <section className="portal-start-page">
      <h1 className="portal-page-title">Portal</h1>
      <PortalLaunchStrip onSettingsChange={onVenueSettingsChange} settings={settings} />
      <PortalCategoryFilters categories={categories} />
      <div className="portal-drink-list">
        <section className="portal-drink-group">
          <div className="portal-drink-group-head">
            <strong>{venue.name}</strong>
            <span>{lastSavedMessage || (source === "supabase" ? "Supabase live" : "Seed fallback")}</span>
          </div>
        </section>
        {groups.map(([category, categoryProducts]) => (
          <PortalDrinkGroup
            allProducts={products}
            category={category}
            onProductChange={onProductChange}
            products={categoryProducts}
            key={category}
          />
        ))}
      </div>
      <PortalQuickAdd categories={categories} onProductAdd={onProductAdd} products={products} />
    </section>
  );
}
