import type { MarketProduct } from "../../engine/types";
import { formatMoney } from "../format";
import { productTrend } from "./tvHelpers";

type Props = {
  product: MarketProduct;
  currency: string;
};

export function PricePosition({ product, currency }: Props) {
  const range = Math.max(product.ceilingPriceMinor - product.floorPriceMinor, 1);
  const current = clamp(((product.currentPriceMinor - product.floorPriceMinor) / range) * 100);
  const base = clamp(((product.basePriceMinor - product.floorPriceMinor) / range) * 100);
  const windowStart = Math.min(base, current);
  const windowWidth = Math.max(Math.abs(current - base), 4);
  const trend = productTrend(product);

  return (
    <div className="pos-cell">
      <div className="pos-track">
        <div className="pos-range"></div>
        <div className="pos-window" style={{ left: `${windowStart}%`, width: `${windowWidth}%` }}></div>
        <div className="pos-base" style={{ left: `${base}%` }}></div>
        <div className={`pos-current ${trend}`} style={{ left: `${current}%` }}></div>
      </div>
      <div className="pos-scale">
        <span>{formatMoney(product.floorPriceMinor, currency)}</span>
        <span>{formatMoney(product.ceilingPriceMinor, currency)}</span>
      </div>
    </div>
  );
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}
