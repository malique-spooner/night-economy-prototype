import { useEffect, useState } from "react";
import { MobileCategoryRail } from "../components/mobile/MobileCategoryRail";
import { MobileHero } from "../components/mobile/MobileHero";
import { MobileMarketBrief } from "../components/mobile/MobileMarketBrief";
import { MobileMarketSection } from "../components/mobile/MobileMarketSection";
import { categoryLabel, groupProductsByCategory } from "../components/tv/tvHelpers";
import { getMarketState, type MarketState } from "../supabase/market";
import { PageSwitcher } from "./PageSwitcher";

type Props = {
  venueSlug: string;
};

export function Menu({ venueSlug }: Props) {
  const [state, setState] = useState<MarketState | null>(null);

  useEffect(() => {
    void getMarketState(venueSlug).then(setState);
  }, [venueSlug]);

  if (!state) return <main className="page">Loading menu...</main>;

  const groups = groupProductsByCategory(state.products);
  const categoryLabels = groups.map(([category]) => categoryLabel(category));

  return (
    <>
      <PageSwitcher active="mobile" />
      <section id="mobileView" className="alt-view mobile-view active">
        <div className="mobile-shell">
          <MobileHero />
          <main className="mobile-menu">
            <MobileMarketBrief products={state.products} />
            <MobileCategoryRail categories={categoryLabels} />
            {groups.map(([category, products]) => (
              <MobileMarketSection category={category} products={products} venue={state.venue} key={category} />
            ))}
          </main>
        </div>
      </section>
    </>
  );
}
