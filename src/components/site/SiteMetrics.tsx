import { siteMetrics } from "../../content/siteContent";

export function SiteMetrics() {
  return (
    <section id="site-what" className="site-section">
      <div className="site-section-intro">
        <div className="site-kicker">The payoff</div>
        <h2>More attention, cleaner control.</h2>
      </div>
      <div className="site-metric-grid">
        {siteMetrics.map(metric => (
          <article className={`site-metric-card tone-${metric.tone}`} key={metric.label}>
            <span>{metric.value}</span>
            <strong>{metric.label}</strong>
            <p>{metric.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
