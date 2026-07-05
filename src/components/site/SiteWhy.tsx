const reasons = [
  ["01", "Instantly legible", "Big prices and clear movement make the board readable from across the bar."],
  ["02", "Calm under pressure", "Guardrails keep the game lively without letting prices run away."],
  ["03", "Guides demand, not just price", "Spotlights and events help move guests toward the right drinks at the right time."],
] as const;

export function SiteWhy() {
  return (
    <section id="site-why" className="site-section site-why">
      <div className="site-why-shell">
        <div className="site-section-split site-why-grid">
          <div className="site-why-copy">
            <div className="site-kicker">Why it wins</div>
            <h2>Software the room can feel.</h2>
            <p>Guests see momentum. Staff see where to steer demand. Operators keep the market playful, profitable, and under control.</p>
            <div className="site-why-panel" aria-label="Why Night Economy works">
              {reasons.map(([num, title, copy], index) => (
                <article className={`site-why-card ${index === 0 ? "site-why-card-primary" : ""}`} key={num}>
                  <span>{num}</span>
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="site-why-visual-wrap">
            <div className="site-why-visual" data-scene="1" aria-hidden="true">
              <div className="site-display-mock">
                <div className="site-display-top">
                  <span>Market open</span>
                  <strong>22:48</strong>
                </div>
                <div className="site-display-hero">
                  <span>Instantly legible</span>
                  <strong>£9.80</strong>
                </div>
                <div className="site-display-rows">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
                <div className="site-display-note">Big prices and clear movement make the board readable from across the bar.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
