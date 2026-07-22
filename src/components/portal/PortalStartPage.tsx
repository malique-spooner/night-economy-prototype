import type { ReactNode } from "react";
import type { MarketProduct, Venue, VenueMarketSettings } from "../../engine/types";
import type { MarketPriceHistoryPoint, MarketProductPatch, PosProduct, VenueMarketSettingsPatch } from "../../api/market";
import { groupProductsByCategory } from "../tv/tvHelpers";
import { PortalCategoryFilters } from "./PortalCategoryFilters";
import { PortalDrinkGroup } from "./PortalDrinkGroup";
import { PortalLaunchStrip } from "./PortalLaunchStrip";
import { PortalMarketDetail } from "./PortalMarketDetail";
import { PortalPosProductSetup } from "./PortalPosProductSetup";
import { portalCategories } from "./portalHelpers";

type Props = {
  lastSavedMessage: string;
  onProductChange: (productId: string, patch: MarketProductPatch, options?: { persist?: boolean }) => void;
  onSelectProduct: (productId: string) => void;
  onConfigurePosProduct: (posProduct: PosProduct) => void;
  onVenueSettingsChange: (patch: VenueMarketSettingsPatch) => void;
  products: MarketProduct[];
  priceHistory: MarketPriceHistoryPoint[];
  priceHistoryLoading: boolean;
  posProducts: PosProduct[];
  source: "seed" | "supabase";
  selectedProductId: string | null;
  simulatorControls?: ReactNode;
  venue: Venue;
};

export function PortalStartPage({
  lastSavedMessage,
  onConfigurePosProduct,
  onProductChange,
  onSelectProduct,
  onVenueSettingsChange,
  products,
  priceHistory,
  priceHistoryLoading,
  selectedProductId,
  posProducts,
  source,
  simulatorControls,
  venue,
}: Props) {
  const groups = groupProductsByCategory(products);
  const selectedProduct = products.find(product => product.id === selectedProductId)
    ?? products.find(product => product.isLive && !product.isSoldOut)
    ?? products[0]
    ?? null;
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
      {simulatorControls}
      <PortalMarketDetail history={priceHistory} isLoading={priceHistoryLoading} product={selectedProduct} />
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
            onSelectProduct={onSelectProduct}
            posProducts={posProducts}
            products={categoryProducts}
            selectedProductId={selectedProductId}
            key={category}
          />
        ))}
      </div>
      <PortalPosProductSetup onConfigure={onConfigurePosProduct} posProducts={posProducts} products={products} />
    </section>
  );
}
