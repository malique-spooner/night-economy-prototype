import type { MarketProduct, Venue } from "../../engine/types";
import { FeaturedProductTile } from "./FeaturedProductTile";
import { MarketProductRow } from "./MarketProductRow";
import {
  categoryChangePercent,
  categoryClass,
  categoryLabel,
  getFeaturedProducts,
  groupProductsByCategory,
  marketBoardLabel,
} from "./tvHelpers";

type Props = {
  products: MarketProduct[];
  venue: Venue;
};

export function MarketBoard({ products, venue }: Props) {
  const featuredProducts = getFeaturedProducts(products);
  const groups = groupProductsByCategory(products);

  return (
    <div className="board">
      <div className="board-hdr">
        <span className="slbl">{marketBoardLabel(venue)}</span>
        <div className="board-view-indicator">
          <span className="board-view-lbl">COCKTAILS</span>
          <div className="board-dots">
            <div className="bdot active"></div>
            <div className="bdot"></div>
            <div className="bdot"></div>
            <div className="bdot"></div>
          </div>
        </div>
        <span className="updt">{venue.name}</span>
      </div>

      <div className="board-featured">
        {featuredProducts.map((product, index) => (
          <FeaturedProductTile currency={venue.currency} product={product} rank={index + 1} key={product.id} />
        ))}
      </div>

      <div className="col-hdr">
        <div className="ch">Drink</div>
        <div className="ch">Price</div>
        <div className="ch">Trend</div>
        <div className="ch">Change</div>
        <div className="ch"></div>
      </div>

      <div className="board-scroll">
        <div className="board-inner">
          {groups.map(([category, categoryProducts]) => {
            const categoryChange = categoryChangePercent(categoryProducts);
            return (
              <section className="cat-section" key={category}>
                <div className="cat-header">
                  <span className={`cat-name ${categoryClass(category)}`}>◆ {categoryLabel(category)}</span>
                  <span className="cat-meta">{categoryChange >= 0 ? "+" : ""}{categoryChange.toFixed(1)}%</span>
                </div>
                {categoryProducts.map(product => (
                  <MarketProductRow currency={venue.currency} product={product} key={product.id} />
                ))}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
