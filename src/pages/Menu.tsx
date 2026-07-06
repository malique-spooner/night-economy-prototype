import { MobileCategoryRail } from "../components/mobile/MobileCategoryRail";
import { MobileHero } from "../components/mobile/MobileHero";
import { MobileMarketBrief } from "../components/mobile/MobileMarketBrief";
import { MobileMarketSection } from "../components/mobile/MobileMarketSection";
import { mobileCategorySectionId } from "../components/mobile/mobileHelpers";
import { categoryLabel, groupProductsByCategory } from "../components/tv/tvHelpers";
import { useMarketState } from "../hooks/useMarketState";
import { PageSwitcher } from "./PageSwitcher";

type Props = {
  venueSlug: string;
};

export function Menu({ venueSlug }: Props) {
  const { error, state } = useMarketState(venueSlug);

  if (error) return <main className="page">Could not load menu: {error}</main>;
  if (!state) return <main className="page">Loading menu...</main>;

  const groups = groupProductsByCategory(state.products);
  const categoryLinks = groups.map(([category]) => ({
    id: mobileCategorySectionId(category),
    label: categoryLabel(category),
  }));

  return (
    <>
      <PageSwitcher active="mobile" />
      <section id="mobileView" className="alt-view mobile-view active">
        <div className="mobile-shell">
          <MobileHero />
          <main className="mobile-menu">
            <MobileMarketBrief products={state.products} />
            <MobileCategoryRail categories={categoryLinks} />
            {groups.map(([category, products]) => (
              <MobileMarketSection category={category} products={products} venue={state.venue} key={category} />
            ))}
          </main>
        </div>
      </section>
    </>
  );
}
