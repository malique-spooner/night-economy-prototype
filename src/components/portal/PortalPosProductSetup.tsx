import type { MarketProduct } from "../../engine/types";
import type { PosProduct } from "../../api/market";
import { formatMoney } from "../format";

type Props = { onConfigure: (posProduct: PosProduct) => void; posProducts: PosProduct[]; products: MarketProduct[] };

export function PortalPosProductSetup({ onConfigure, posProducts, products }: Props) {
  const mapped = new Set(products.flatMap(product => (product.posProductId ? [product.posProductId] : [])));
  const unmatched = posProducts.filter(product => !mapped.has(product.id));
  if (!unmatched.length) return null;
  return <section className="portal-pos-setup"><div className="portal-drink-group-head"><strong>POS products awaiting market setup</strong><span>{unmatched.length} available to configure</span></div>{unmatched.map(product => <article className="portal-pos-setup-row" key={product.id}><div><strong>{product.name}</strong><span>{product.sku} · {formatMoney(product.basePriceMinor)}</span></div><span className={product.isAvailable ? "portal-pos-available" : "portal-pos-unavailable"}>{product.isAvailable ? "Available" : "Sold out"}</span><button onClick={() => onConfigure(product)} type="button">Configure market</button></article>)}</section>;
}
