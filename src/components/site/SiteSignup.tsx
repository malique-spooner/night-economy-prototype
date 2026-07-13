import { useState, type FormEvent } from "react";
import { defaultSitePlanId, sitePlans } from "../../content/siteContent";
import { prepareSiteLead } from "../../api/leadForm";
import { createSiteLead, type SiteLeadPlan } from "../../api/leads";

const initialForm = {
  venueName: "",
  ownerName: "",
  email: "",
};

export function SiteSignup() {
  const [form, setForm] = useState(initialForm);
  const [selectedPlan, setSelectedPlan] = useState<SiteLeadPlan>(defaultSitePlanId);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const preparedLead = prepareSiteLead({ ...form, plan: selectedPlan });
    if (!preparedLead.ok) {
      setStatus("error");
      setMessage(preparedLead.message);
      return;
    }

    try {
      setStatus("submitting");
      const result = await createSiteLead(preparedLead.payload);

      setStatus("success");
      setMessage(
        result.persisted
          ? "Request received. We will help you set up the venue."
          : "Request ready locally. Connect Supabase to save live leads.",
      );
      setForm(initialForm);
      setSelectedPlan(defaultSitePlanId);
    } catch {
      setStatus("error");
      setMessage("We could not save that request. Please try again.");
    }
  }

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
            <article
              className={`site-price-pill ${plan.id === selectedPlan ? "active" : ""}`}
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              onKeyDown={event => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                setSelectedPlan(plan.id);
              }}
              role="button"
              tabIndex={0}
            >
              <strong>{plan.name}</strong>
              <span>{plan.copy}</span>
            </article>
          ))}
        </div>
        <form className="site-signup-form" onSubmit={handleSubmit}>
          <label>
            <span>Venue name</span>
            <input
              type="text"
              placeholder="Pickle House Shoreditch"
              value={form.venueName}
              onChange={event => setForm(current => ({ ...current, venueName: event.target.value }))}
              required
            />
          </label>
          <label>
            <span>Owner name</span>
            <input
              type="text"
              placeholder="Alex Morgan"
              value={form.ownerName}
              onChange={event => setForm(current => ({ ...current, ownerName: event.target.value }))}
              required
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              placeholder="owner@venue.com"
              value={form.email}
              onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label>
            <span>Plan</span>
            <select value={selectedPlan} onChange={event => setSelectedPlan(event.target.value as SiteLeadPlan)}>
              {sitePlans.map(plan => (
                <option value={plan.id} key={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </label>
          {message ? (
            <p className={`site-signup-message ${status === "error" ? "error" : ""}`} aria-live="polite">
              {message}
            </p>
          ) : null}
          <button className="site-primary" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting" : "Buy Now"}
          </button>
        </form>
      </div>
    </section>
  );
}
