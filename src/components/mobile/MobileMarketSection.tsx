import type { MarketProduct, Venue } from "../../engine/types";
import { categoryLabel } from "../tv/tvHelpers";
import { MobileMarketRow } from "./MobileMarketRow";
import { sectionTone } from "./mobileHelpers";

type Props = {
  category: string;
  products: MarketProduct[];
  venue: Venue;
};

export function MobileMarketSection({ category, products, venue }: Props) {
  const stats = sectionTone(products);

  return (
    <section className="mobile-menu-section mobile-market-section">
      <div className="mobile-menu-section-head">
        <div>
          <h2>{categoryLabel(category)}</h2>
          <p>{products.length} live prices</p>
        </div>
        <span className={`mobile-section-move ${stats.tone}`}>
          {stats.average >= 0 ? "+" : ""}
          {stats.average.toFixed(1)}%
        </span>
      </div>
      <div className="mobile-market-list">
        {products.map((product, index) => (
          <MobileMarketRow currency={venue.currency} product={product} rank={index + 1} key={product.id} />
        ))}
      </div>
    </section>
  );
}
