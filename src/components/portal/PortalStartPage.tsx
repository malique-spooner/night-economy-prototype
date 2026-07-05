import type { MarketProduct, Venue } from "../../engine/types";
import { groupProductsByCategory } from "../tv/tvHelpers";
import { PortalCategoryFilters } from "./PortalCategoryFilters";
import { PortalDrinkGroup } from "./PortalDrinkGroup";
import { PortalLaunchStrip } from "./PortalLaunchStrip";
import { PortalQuickAdd } from "./PortalQuickAdd";
import { portalCategories } from "./portalHelpers";

type Props = {
  products: MarketProduct[];
  source: "seed" | "supabase";
  venue: Venue;
};

export function PortalStartPage({ products, source, venue }: Props) {
  const groups = groupProductsByCategory(products);
  const categories = portalCategories(products);

  return (
    <section className="portal-start-page">
      <h1 className="portal-page-title">Portal</h1>
      <PortalLaunchStrip />
      <PortalCategoryFilters categories={categories} />
      <div className="portal-drink-list">
        <section className="portal-drink-group">
          <div className="portal-drink-group-head">
            <strong>{venue.name}</strong>
            <span>{source === "supabase" ? "Supabase live" : "Seed fallback"}</span>
          </div>
        </section>
        {groups.map(([category, categoryProducts]) => (
          <PortalDrinkGroup allProducts={products} category={category} products={categoryProducts} key={category} />
        ))}
      </div>
      <PortalQuickAdd categories={categories} />
    </section>
  );
}
