type Props = {
  active: "site" | "tv" | "mobile" | "portal";
};

const links = [
  ["site", "Site", "/react-preview.html?view=site"],
  ["tv", "TV", "/react-preview.html?view=tv"],
  ["mobile", "Mobile", "/react-preview.html?view=mobile"],
  ["portal", "Portal", "/react-preview.html?view=portal"],
] as const;

export function PageSwitcher({ active }: Props) {
  return (
    <nav className="page-switcher" aria-label="Page switcher">
      {links.map(([id, label, href]) => (
        <a className={`page-chip ${active === id ? "active" : ""}`} href={href} data-view={id} key={id}>
          {label}
        </a>
      ))}
    </nav>
  );
}
