type Props = {
  categories: string[];
};

export function MobileCategoryRail({ categories }: Props) {
  return (
    <nav className="mobile-rail" aria-label="Menu categories">
      {categories.map((category, index) => (
        <button className={`mobile-rail-chip ${index === 0 ? "active" : ""}`} type="button" key={category}>
          {category}
        </button>
      ))}
    </nav>
  );
}
