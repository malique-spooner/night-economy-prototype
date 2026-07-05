import type { MarketProduct } from "../../engine/types";
import { formatChangePercent, getStoryProduct, productTrend } from "../tv/tvHelpers";
import { mobileTickerSymbol } from "./mobileHelpers";

type Props = {
  products: MarketProduct[];
};

export function MobileMarketBrief({ products }: Props) {
  const upCount = products.filter(product => productTrend(product) === "up").length;
  const downCount = products.length - upCount;
  const highestMover = getStoryProduct(products);

  return (
    <section className="mobile-market-brief" aria-label="Live market summary">
      <div>
        <span className="mobile-kicker">Live prices</span>
        <h1>Tonight&apos;s market</h1>
      </div>
      <div className="mobile-market-tape">
        <span>{upCount} up · {downCount} down</span>
        <strong>
          {highestMover ? mobileTickerSymbol(highestMover.name) : "NE"}{" "}
          {highestMover ? formatChangePercent(highestMover).replace("+", "▲ ") : "▲ 0.0%"}
        </strong>
      </div>
    </section>
  );
}
