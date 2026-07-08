import { useEffect, useRef, useState } from "react";
import type { MarketProduct } from "../../engine/types";
import { portalCategoryLabel, preparePortalCsvProducts, prepareQuickAddProduct } from "./portalHelpers";

type Props = {
  categories: string[];
  onProductAdd: (product: MarketProduct) => boolean | Promise<boolean>;
  products: MarketProduct[];
};

export function PortalQuickAdd({ categories, onProductAdd, products }: Props) {
  const categoryOptions = categories.length ? categories : ["signature-cocktails"];
  const csvInputRef = useRef<HTMLInputElement>(null);
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

  async function handleCsvFile(file: File | undefined) {
    if (!file) return;

    const result = preparePortalCsvProducts({
      csv: await file.text(),
      idFactory: () => `mp_${crypto.randomUUID()}`,
      products,
    });

    if (!result.products.length) {
      setMessage(result.errors[0] ?? "CSV did not include any drinks");
      return;
    }

    let addedCount = 0;
    for (const product of result.products) {
      const accepted = await onProductAdd(product);
      if (!accepted) break;
      addedCount += 1;
    }

    setMessage(
      result.errors.length
        ? `Imported ${addedCount}; ${result.errors.length} row${result.errors.length === 1 ? "" : "s"} skipped`
        : `Imported ${addedCount} drink${addedCount === 1 ? "" : "s"}`,
    );
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
      <button className="portal-import-btn" onClick={() => csvInputRef.current?.click()} type="button">CSV</button>
      <input
        accept=".csv,text/csv"
        hidden
        onChange={event => {
          void handleCsvFile(event.target.files?.[0]);
          event.target.value = "";
        }}
        ref={csvInputRef}
        type="file"
      />
      {message ? <span className="portal-quick-message">{message}</span> : null}
    </div>
  );
}
