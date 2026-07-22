import type { MarketProduct } from "../../engine/types";
import type { MarketProductPatch, PosProduct } from "../../api/market";
import { formatMoney } from "../format";
import { portalCategoryLabel, portalCategoryOptions } from "./portalHelpers";
import { PortalMoneyField } from "./PortalMoneyField";

type Props = {
  allProducts: MarketProduct[];
  onChange: (productId: string, patch: MarketProductPatch, options?: { persist?: boolean }) => void;
  onSelect: (productId: string) => void;
  posProduct?: PosProduct;
  product: MarketProduct;
  selected: boolean;
};

export function PortalDrinkRow({ allProducts, onChange, onSelect, posProduct, product, selected }: Props) {
  const categoryOptions = portalCategoryOptions(allProducts, product.category);
  const change = product.basePriceMinor
    ? ((product.currentPriceMinor - product.basePriceMinor) / product.basePriceMinor) * 100
    : 0;
  const index = product.basePriceMinor ? (product.currentPriceMinor / product.basePriceMinor) * 100 : 100;
  const atFloor = product.currentPriceMinor <= product.floorPriceMinor;
  const atCeiling = product.currentPriceMinor >= product.ceilingPriceMinor;

  return (
    <article className={`portal-drink-row ${product.isSoldOut ? "paused" : ""} ${selected ? "selected" : ""}`}>
      <div className="portal-product-identity">
        <div className="portal-pos-source">
          <span>From POS</span>
          <strong>{posProduct?.name ?? product.name}</strong>
          <small>{posProduct?.sku ?? "Synced market product"}</small>
        </div>
        <label className="portal-drink-name">
          <span>Market name</span>
          <input value={product.name} onChange={event => onChange(product.id, { name: event.target.value }, { persist: false })} onBlur={event => onChange(product.id, { name: event.target.value })} />
        </label>
      </div>

      <div className="portal-product-market">
        <div className="portal-live-actions">
          <button
            className={`portal-live-toggle ${product.isLive ? "on" : "off"}`}
            type="button"
            onClick={() => onChange(product.id, { isLive: !product.isLive })}
          >
            {product.isLive ? "Market live" : "Market off"}
          </button>
          <label className="portal-priority-toggle" title="Mark as high priority">
            <input checked={product.priority} onChange={event => onChange(product.id, { priority: event.target.checked })} type="checkbox" />
            <span>Priority</span>
          </label>
        </div>
        <div className="portal-pos-price">
          <span>Live price</span>
          <strong>{formatMoney(product.currentPriceMinor)}</strong>
          <small className={change >= 0 ? "up" : "down"}>Index {index.toFixed(1)} · {change >= 0 ? "+" : ""}{change.toFixed(1)}%</small>
          {(atFloor || atCeiling) && <em className={atFloor ? "floor" : "ceiling"}>{atFloor ? "At floor" : "At ceiling"}</em>}
        </div>
        <button className="portal-history-button" type="button" onClick={() => onSelect(product.id)}>View history</button>
      </div>

      <div className="portal-product-settings">
        <label className="portal-drink-symbol">
          <span>Symbol</span>
          <input value={product.symbol} maxLength={4} onChange={event => onChange(product.id, { symbol: event.target.value.toUpperCase() }, { persist: false })} onBlur={event => onChange(product.id, { symbol: event.target.value.toUpperCase() })} />
        </label>
        <label className="portal-drink-cat">
          <span>Category</span>
          <select value={product.category} onChange={event => onChange(product.id, { category: event.target.value })}>
            {categoryOptions.map(category => <option value={category} key={category}>{portalCategoryLabel(category)}</option>)}
          </select>
        </label>
        <PortalMoneyField label="Floor" valueMinor={product.floorPriceMinor} onChange={floorPriceMinor => onChange(product.id, { floorPriceMinor })} />
        <PortalMoneyField label="Ceiling" valueMinor={product.ceilingPriceMinor} onChange={ceilingPriceMinor => onChange(product.id, { ceilingPriceMinor })} />
      </div>
    </article>
  );
}
