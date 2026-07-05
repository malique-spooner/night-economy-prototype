const metrics = [
  {
    tone: "room",
    value: "3",
    label: "Connected surfaces",
    copy: "The board, menu, and portal share one live market state.",
  },
  {
    tone: "guest",
    value: "1,840+",
    label: "Orders shaped by demand",
    copy: "Guests react to movement, not a static list.",
  },
  {
    tone: "ops",
    value: "+12%",
    label: "Market lift without chaos",
    copy: "Pricing rules and event controls keep the floor safe.",
  },
] as const;

export function SiteMetrics() {
  return (
    <section id="site-what" className="site-section">
      <div className="site-section-intro">
        <div className="site-kicker">The payoff</div>
        <h2>More attention, cleaner control.</h2>
      </div>
      <div className="site-metric-grid">
        {metrics.map(metric => (
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
