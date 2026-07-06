type Props = {
  categories: Array<{
    id: string;
    label: string;
  }>;
};

export function MobileCategoryRail({ categories }: Props) {
  function scrollToCategory(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className="mobile-rail" aria-label="Menu categories">
      {categories.map((category, index) => (
        <button
          aria-controls={category.id}
          className={`mobile-rail-chip ${index === 0 ? "active" : ""}`}
          onClick={() => scrollToCategory(category.id)}
          type="button"
          key={category.id}
        >
          {category.label}
        </button>
      ))}
    </nav>
  );
}
