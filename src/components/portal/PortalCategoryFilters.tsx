import { portalCategoryLabel } from "./portalHelpers";

type Props = {
  categories: string[];
};

export function PortalCategoryFilters({ categories }: Props) {
  return (
    <div className="portal-filter-row">
      <button className="range-chip active" type="button">All drinks</button>
      {categories.map(category => (
        <button className="range-chip" type="button" key={category}>
          {portalCategoryLabel(category)}
        </button>
      ))}
    </div>
  );
}
