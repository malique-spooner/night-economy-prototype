import type { MarketProduct } from "../../engine/types";
import { portalCategoryLabel, portalCategoryOptions } from "./portalHelpers";
import { PortalMoneyField } from "./PortalMoneyField";

type Props = {
  allProducts: MarketProduct[];
  product: MarketProduct;
};

export function PortalDrinkRow({ allProducts, product }: Props) {
  const categoryOptions = portalCategoryOptions(allProducts, product.category);

  return (
    <article className={`portal-drink-row ${product.isSoldOut ? "paused" : ""}`}>
      <div className="portal-drink-image-action">
        <button
          className="portal-drink-image-btn empty"
          type="button"
          aria-label="Add drink image"
          title="Add image"
        >
          <span className="portal-drink-image-icon add">+</span>
          <span className="portal-drink-image-icon ok">✓</span>
          <span className="portal-drink-image-icon remove">×</span>
        </button>
      </div>
      <div className="portal-drink-live">
        <div className="portal-live-actions">
          <button className={`portal-live-toggle ${product.isSoldOut ? "off" : "on"}`} type="button">
            {product.isSoldOut ? "Paused" : "Live"}
          </button>
          <label className="portal-priority-toggle" title="Mark as high priority">
            <input type="checkbox" checked={product.priority} readOnly />
            <span>Priority</span>
          </label>
        </div>
      </div>
      <label className="portal-drink-name">
        <span>Drink</span>
        <input value={product.name} readOnly />
      </label>
      <label className="portal-drink-cat">
        <span>Category</span>
        <select value={product.category} disabled>
          {categoryOptions.map(category => (
            <option value={category} key={category}>{portalCategoryLabel(category)}</option>
          ))}
        </select>
      </label>
      <PortalMoneyField label="Sale" valueMinor={product.currentPriceMinor} />
      <PortalMoneyField label="Floor" valueMinor={product.floorPriceMinor} />
      <PortalMoneyField label="Ceiling" valueMinor={product.ceilingPriceMinor} />
      <button className="portal-remove-drink" type="button">Remove</button>
    </article>
  );
}
