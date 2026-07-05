import type { MarketProduct } from "../../engine/types";
import { portalCategoryLabel } from "./portalHelpers";
import { PortalDrinkRow } from "./PortalDrinkRow";

type Props = {
  allProducts: MarketProduct[];
  category: string;
  products: MarketProduct[];
};

export function PortalDrinkGroup({ allProducts, category, products }: Props) {
  return (
    <section className="portal-drink-group">
      <div className="portal-drink-group-head">
        <strong>{portalCategoryLabel(category)}</strong>
        <span>{products.length} drinks</span>
      </div>
      {products.map(product => (
        <PortalDrinkRow allProducts={allProducts} product={product} key={product.id} />
      ))}
    </section>
  );
}
