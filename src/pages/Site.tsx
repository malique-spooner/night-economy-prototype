import { PageSwitcher } from "./PageSwitcher";

type Props = {
  venueSlug: string;
};

export function Site({ venueSlug }: Props) {
  return (
    <>
      <PageSwitcher active="site" />
      <section id="siteView" className="alt-view site-view active">
        <div className="site-shell">
          <section id="site-hero" className="site-hero">
            <div className="site-hero-inner">
              <div className="site-kicker">Night Economy</div>
              <h1>Turn your menu into a live market.</h1>
              <p>Live pricing for bars and venues: a room display, guest menu, and operator portal that move together.</p>
              <div className="site-hero-stats" aria-label="Live market stats">
                <span>Live index +12.4%</span>
                <span>Volume 1,840 orders</span>
                <span>Volatility controlled</span>
              </div>
              <div className="site-hero-foot">Built for bars, hotels, members clubs, and hospitality groups</div>
            </div>
          </section>

          <section id="site-why" className="site-section site-why">
            <div className="site-why-shell">
              <div className="site-section-split site-why-grid">
                <div className="site-why-copy">
                  <div className="site-kicker">Why it wins</div>
                  <h2>Software the room can feel.</h2>
                  <p>Guests see momentum. Staff see where to steer demand. Operators keep the market playful, profitable, and under control.</p>
                  <div className="site-why-panel" aria-label="Why Night Economy works">
                    {[
                      ["01", "Instantly legible", "Big prices and clear movement make the board readable from across the bar."],
                      ["02", "Calm under pressure", "Guardrails keep the game lively without letting prices run away."],
                      ["03", "Guides demand, not just price", "Spotlights and events help move guests toward the right drinks at the right time."],
                    ].map(([num, title, copy], index) => (
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
                      <div className="site-display-top"><span>Market open</span><strong>22:48</strong></div>
                      <div className="site-display-hero"><span>Instantly legible</span><strong>£9.80</strong></div>
                      <div className="site-display-rows"><i></i><i></i><i></i><i></i></div>
                      <div className="site-display-note">Big prices and clear movement make the board readable from across the bar.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="site-decks" className="site-section site-decks">
            <div className="site-section-intro">
              <div className="site-kicker">Product flow</div>
              <h2>Drag through the venue stack.</h2>
              <p>Shuffle through the live room display, guest menu, operator portal, and market event view.</p>
            </div>
            <div className="site-deck-track" data-drag-scroll aria-label="Venue stack carousel">
              <DeckSlide tone="display" src="./?view=tv" title="Night Economy TV view preview" />
              <DeckSlide tone="mobile" src="./?view=mobile" title="Night Economy mobile view preview" phone />
              <DeckSlide tone="portal" src="./?view=portal" title="Night Economy portal preview" />
              <DeckSlide tone="event" src="./?view=tv&mode=crash" title="Night Economy crash preview" />
            </div>
          </section>

          <section id="site-subscribe" className="site-section site-subscribe">
            <div className="site-subscribe-copy">
              <div className="site-kicker">Get started</div>
              <h2>Start your first venue.</h2>
              <p>Pick a plan, create the venue, and open the operator portal.</p>
            </div>
            <div className="site-signup-panel">
              <div className="site-pricing-minimal">
                {["Starter", "Growth", "Premium"].map(plan => (
                  <article className={`site-price-pill ${plan === "Growth" ? "active" : ""}`} key={plan}>
                    <strong>{plan}</strong>
                    <span>{plan === "Starter" ? "Pilot venue" : plan === "Growth" ? "Live venue" : "Group rollout"}</span>
                  </article>
                ))}
              </div>
              <form className="site-signup-form">
                <label><span>Venue name</span><input type="text" placeholder="Pickle House Shoreditch" /></label>
                <label><span>Owner name</span><input type="text" placeholder="Alex Morgan" /></label>
                <label><span>Email</span><input type="email" placeholder="owner@venue.com" /></label>
                <label>
                  <span>Plan</span>
                  <select defaultValue="growth">
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="premium">Premium</option>
                  </select>
                </label>
                <button className="site-primary" type="submit">Buy Now</button>
              </form>
            </div>
          </section>

          <footer className="site-footer">
            <div className="site-footer-brand">
              <div className="site-kicker">Night Economy</div>
              <h2>Make the room worth watching.</h2>
            </div>
            <div className="site-footer-cols">
              <div><span>Product</span><a href="#site-why">Why it works</a><a href="#site-decks">Product moments</a></div>
              <div><span>Surfaces</span><a href={`/tv/${venueSlug}`}>Room display</a><a href={`/menu/${venueSlug}`}>Guest mobile</a></div>
              <div><span>Company</span><a href="mailto:hello@nighteconomy.app">hello@nighteconomy.app</a><a href="#site-hero">Back to top</a></div>
            </div>
          </footer>
        </div>
      </section>
    </>
  );
}

function DeckSlide({ tone, src, title, phone = false }: { tone: string; src: string; title: string; phone?: boolean }) {
  return (
    <article className={`site-deck-slide tone-${tone}`}>
      <div className={`site-deck-screen site-deck-preview ${phone ? "phone" : ""}`}>
        <iframe src={src} title={title} loading="lazy"></iframe>
      </div>
    </article>
  );
}
