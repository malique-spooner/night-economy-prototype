import type { MarketProduct } from "../../engine/types";
import type { PosProduct } from "../../api/market";
import { formatMoney } from "../format";

type Props = { onConfigure: (posProduct: PosProduct) => void; posProducts: PosProduct[]; products: MarketProduct[] };

export function PortalPosProductSetup({ onConfigure, posProducts, products }: Props) {
  const mapped = new Set(products.flatMap(product => (product.posProductId ? [product.posProductId] : [])));
  const unmatched = posProducts.filter(product => !mapped.has(product.id));
  if (!unmatched.length) return null;
  const groups = unmatched.reduce<Record<string, PosProduct[]>>((result, product) => { const key = product.productGroup ?? product.name; (result[key] ??= []).push(product); return result; }, {});
  return <section className="portal-pos-setup"><div className="portal-drink-group-head"><strong>POS products awaiting market setup</strong><span>{unmatched.length} available to configure</span></div>{Object.entries(groups).map(([group, variants]) => <div key={group}>{variants.length > 1 && <h3>{group}</h3>}{variants.map(product => <article className="portal-pos-setup-row" key={product.id}><div><strong>{variants.length > 1 ? product.serveSize ?? product.name : product.name}</strong><span>{product.category}{product.subcategory ? ` · ${product.subcategory}` : ""} · {formatMoney(product.basePriceMinor)}</span></div><span className={product.isAvailable ? "portal-pos-available" : "portal-pos-unavailable"}>{product.isAvailable ? "Available" : "Sold out"}</span><button onClick={() => onConfigure(product)} type="button">Configure market</button></article>)}</div>)}</section>;
}
