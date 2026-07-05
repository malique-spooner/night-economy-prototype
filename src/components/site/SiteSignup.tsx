const plans = [
  ["starter", "Starter", "Pilot venue"],
  ["growth", "Growth", "Live venue"],
  ["premium", "Premium", "Group rollout"],
] as const;

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
          {plans.map(([id, name, copy]) => (
            <article className={`site-price-pill ${id === "growth" ? "active" : ""}`} key={id}>
              <strong>{name}</strong>
              <span>{copy}</span>
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
            <select defaultValue="growth">
              {plans.map(([id, name]) => (
                <option value={id} key={id}>
                  {name}
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
