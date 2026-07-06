import { siteReasons } from "../../content/siteContent";

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
              {siteReasons.map((reason, index) => (
                <article className={`site-why-card ${index === 0 ? "site-why-card-primary" : ""}`} key={reason.number}>
                  <span>{reason.number}</span>
                  <strong>{reason.title}</strong>
                  <p>{reason.copy}</p>
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
                <div className="site-display-note">{siteReasons[0].copy}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
