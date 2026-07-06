import { defaultSitePlanId, sitePlans } from "../../content/siteContent";

export function SiteSignup() {
  return (
    <section id="site-subscribe" className="site-section site-subscribe">
      <div className="site-subscribe-copy">
        <div className="site-kicker">Get started</div>
        <h2>Start your first venue.</h2>
        <p>Pick a plan, create the venue, and open the operator portal.</p>
      </div>
      <div className="site-signup-panel">
        <div className="site-pricing-minimal">
          {sitePlans.map(plan => (
            <article className={`site-price-pill ${plan.id === defaultSitePlanId ? "active" : ""}`} key={plan.id}>
              <strong>{plan.name}</strong>
              <span>{plan.copy}</span>
            </article>
          ))}
        </div>
        <form className="site-signup-form">
          <label>
            <span>Venue name</span>
            <input type="text" placeholder="Pickle House Shoreditch" />
          </label>
          <label>
            <span>Owner name</span>
            <input type="text" placeholder="Alex Morgan" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" placeholder="owner@venue.com" />
          </label>
          <label>
            <span>Plan</span>
            <select defaultValue={defaultSitePlanId}>
              {sitePlans.map(plan => (
                <option value={plan.id} key={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </label>
          <button className="site-primary" type="submit">Buy Now</button>
        </form>
      </div>
    </section>
  );
}
