type Props = {
  active: "site" | "tv" | "mobile" | "portal";
  venueSlug: string;
};

type PageSwitcherLink = {
  href: string;
  id: Props["active"];
  label: string;
};

export function buildPageSwitcherLinks(venueSlug: string): PageSwitcherLink[] {
  const slug = encodeURIComponent(venueSlug);

  return [
    { id: "site", label: "Site", href: `/venue/${slug}` },
    { id: "tv", label: "TV", href: `/tv/${slug}` },
    { id: "mobile", label: "Mobile", href: `/menu/${slug}` },
    { id: "portal", label: "Portal", href: `/app/${slug}` },
  ];
}

export function PageSwitcher({ active, venueSlug }: Props) {
  const links = buildPageSwitcherLinks(venueSlug);

  return (
    <nav className="page-switcher" aria-label="Page switcher">
      {links.map(({ href, id, label }) => (
        <a className={`page-chip ${active === id ? "active" : ""}`} href={href} data-view={id} key={id}>
          {label}
        </a>
      ))}
    </nav>
  );
}
