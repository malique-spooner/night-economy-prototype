import type { MarketProduct } from "../../engine/types";
import type { MarketProductPatch, PosProduct } from "../../api/market";
import { formatMoney } from "../format";
import { portalCategoryLabel, portalCategoryOptions } from "./portalHelpers";
import { PortalMoneyField } from "./PortalMoneyField";

type Props = {
  allProducts: MarketProduct[];
  onChange: (productId: string, patch: MarketProductPatch, options?: { persist?: boolean }) => void;
  posProduct?: PosProduct;
  product: MarketProduct;
};

export function PortalDrinkRow({ allProducts, onChange, posProduct, product }: Props) {
  const categoryOptions = portalCategoryOptions(allProducts, product.category);

  return (
    <article className={`portal-drink-row ${product.isSoldOut ? "paused" : ""}`}>
      <div className="portal-pos-source">
        <span>From POS</span>
        <strong>{posProduct?.name ?? "POS product unavailable"}</strong>
        <small>{posProduct?.sku ?? product.posProductId ?? "Unmapped"}</small>
      </div>
      <div className="portal-drink-live">
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
      </div>
      <label className="portal-drink-name">
        <span>Market name</span>
        <input value={product.name} onChange={event => onChange(product.id, { name: event.target.value }, { persist: false })} onBlur={event => onChange(product.id, { name: event.target.value })} />
      </label>
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
      <div className="portal-pos-price"><span>POS price</span><strong>{formatMoney(posProduct?.currentPriceMinor ?? product.currentPriceMinor)}</strong></div>
      <PortalMoneyField label="Floor" valueMinor={product.floorPriceMinor} onChange={floorPriceMinor => onChange(product.id, { floorPriceMinor })} />
      <PortalMoneyField label="Ceiling" valueMinor={product.ceilingPriceMinor} onChange={ceilingPriceMinor => onChange(product.id, { ceilingPriceMinor })} />
    </article>
  );
}
