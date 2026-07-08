import { useEffect, useState } from "react";
import type { MarketProduct } from "../../engine/types";
import { portalCategoryLabel, prepareQuickAddProduct } from "./portalHelpers";

type Props = {
  categories: string[];
  onProductAdd: (product: MarketProduct) => boolean | Promise<boolean>;
  products: MarketProduct[];
};

export function PortalQuickAdd({ categories, onProductAdd, products }: Props) {
  const categoryOptions = categories.length ? categories : ["signature-cocktails"];
  const [category, setCategory] = useState(categoryOptions[0]);
  const [ceilingPrice, setCeilingPrice] = useState("");
  const [floorPrice, setFloorPrice] = useState("");
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (categoryOptions.includes(category)) return;
    setCategory(categoryOptions[0]);
  }, [categoryOptions, category]);

  async function handleAdd() {
    const result = prepareQuickAddProduct({
      category,
      ceilingPrice,
      floorPrice,
      id: `mp_${crypto.randomUUID()}`,
      isSoldOut,
      name,
      price,
      products,
    });

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    const accepted = await onProductAdd(result.product);
    if (!accepted) return;

    setCeilingPrice("");
    setFloorPrice("");
    setIsSoldOut(false);
    setMessage("");
    setName("");
    setPrice("");
  }

  return (
    <div className="portal-add-drink">
      <input onChange={event => setName(event.target.value)} type="text" placeholder="Drink" value={name} />
      <select onChange={event => setCategory(event.target.value)} value={category}>
        {categoryOptions.map(category => (
          <option value={category} key={category}>{portalCategoryLabel(category)}</option>
        ))}
      </select>
      <input onChange={event => setPrice(event.target.value)} type="number" step="0.01" min="0" placeholder="Price" value={price} />
      <input onChange={event => setFloorPrice(event.target.value)} type="number" step="0.01" min="0" placeholder="Floor" value={floorPrice} />
      <input onChange={event => setCeilingPrice(event.target.value)} type="number" step="0.01" min="0" placeholder="Ceiling" value={ceilingPrice} />
      <label className="portal-quick-checkbox" title="Sold out">
        <input checked={isSoldOut} onChange={event => setIsSoldOut(event.target.checked)} type="checkbox" />
        <span>Sold out</span>
      </label>
      <button onClick={handleAdd} type="button">Add</button>
      <button className="portal-import-btn" type="button">CSV</button>
      {message ? <span className="portal-quick-message">{message}</span> : null}
    </div>
  );
}
