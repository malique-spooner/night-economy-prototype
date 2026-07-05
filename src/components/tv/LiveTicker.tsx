import type { MarketProduct, Venue } from "../../engine/types";
import { formatMoney } from "../format";
import { productTrend } from "./tvHelpers";

type Props = {
  products: MarketProduct[];
  venue: Venue;
};

export function LiveTicker({ products, venue }: Props) {
  const tickerProducts = [...products, ...products];

  return (
    <div className="ticker ticker-bottom">
      <div className="t-badge">Live prices</div>
      <div className="t-track">
        <div className="t-inner">
          {tickerProducts.map((product, index) => {
            const trend = productTrend(product);
            return (
              <div className="ti" key={`${product.id}-${index}`}>
                <span className="tn">{product.name}</span>
                <span className="tv">{formatMoney(product.currentPriceMinor, venue.currency)}</span>
                <span className={`t${trend === "up" ? "u" : "d"}`}>{trend === "up" ? "▲" : "▼"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
