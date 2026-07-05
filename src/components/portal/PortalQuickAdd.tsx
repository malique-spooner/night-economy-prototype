import { portalCategoryLabel } from "./portalHelpers";

type Props = {
  categories: string[];
};

export function PortalQuickAdd({ categories }: Props) {
  return (
    <div className="portal-add-drink">
      <input type="text" placeholder="Drink" />
      <select defaultValue={categories[0] ?? ""}>
        {categories.map(category => (
          <option value={category} key={category}>{portalCategoryLabel(category)}</option>
        ))}
      </select>
      <input type="number" step="0.01" min="0" placeholder="Price" />
      <input type="number" step="0.01" min="0" placeholder="Floor" />
      <input type="number" step="0.01" min="0" placeholder="Ceiling" />
      <label className="portal-quick-checkbox" title="Sold out">
        <input type="checkbox" />
        <span>Sold out</span>
      </label>
      <button type="button">Add</button>
      <button className="portal-import-btn" type="button">CSV</button>
    </div>
  );
}
