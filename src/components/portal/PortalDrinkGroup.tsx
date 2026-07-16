import type { MarketProduct } from "../../engine/types";
import type { MarketProductPatch, PosProduct } from "../../api/market";
import { portalCategoryLabel } from "./portalHelpers";
import { PortalDrinkRow } from "./PortalDrinkRow";

type Props = {
  allProducts: MarketProduct[];
  category: string;
  onProductChange: (productId: string, patch: MarketProductPatch, options?: { persist?: boolean }) => void;
  posProducts: PosProduct[];
  products: MarketProduct[];
};

export function PortalDrinkGroup({ allProducts, category, onProductChange, posProducts, products }: Props) {
  return (
    <section className="portal-drink-group">
      <div className="portal-drink-group-head">
        <strong>{portalCategoryLabel(category)}</strong>
        <span>{products.length} drinks</span>
      </div>
      {products.map(product => (
        <PortalDrinkRow allProducts={allProducts} onChange={onProductChange} posProduct={posProducts.find(posProduct => posProduct.id === product.posProductId)} product={product} key={product.id} />
      ))}
    </section>
  );
}
