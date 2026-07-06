import { siteHero } from "../../content/siteContent";

export function SiteHero() {
  return (
    <section id="site-hero" className="site-hero">
      <div className="site-hero-inner">
        <div className="site-kicker">{siteHero.kicker}</div>
        <h1>{siteHero.title}</h1>
        <p>{siteHero.copy}</p>
        <div className="site-hero-stats" aria-label="Live market stats">
          {siteHero.stats.map(stat => (
            <span key={stat}>{stat}</span>
          ))}
        </div>
        <div className="site-hero-foot">{siteHero.footnote}</div>
      </div>
    </section>
  );
}
