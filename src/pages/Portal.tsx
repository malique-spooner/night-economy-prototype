import { useEffect, useState } from "react";
import { formatMoney } from "../components/format";
import { getMarketState, type MarketState } from "../supabase/market";
import { PageSwitcher } from "./PageSwitcher";

type Props = {
  venueSlug: string;
};

export function Portal({ venueSlug }: Props) {
  const [state, setState] = useState<MarketState | null>(null);

  useEffect(() => {
    void getMarketState(venueSlug).then(setState);
  }, [venueSlug]);

  if (!state) return <main className="page">Loading portal...</main>;

  return (
    <>
      <PageSwitcher active="portal" />
      <section id="portalView" className="alt-view portal-view active">
        <div className="portal-shell">
          <div className="portal-layout">
            <aside className="portal-sidebar">
              <div className="portal-sidebar-brand">
                <div className="portal-sidebar-kicker">Night Economy</div>
                <strong>Night Economy</strong>
              </div>
              <nav className="portal-nav" aria-label="Portal sections">
                <button className="portal-nav-item active" type="button"><span>Start</span></button>
                <button className="portal-nav-item" type="button"><span>Account</span></button>
              </nav>
              <div className="portal-sidebar-foot">
                <button className="portal-signout" type="button">Sign out</button>
              </div>
            </aside>
            <main className="portal-main">
              <div className="portal-workspace">
                <section className="portal-start-page">
                  <h1 className="portal-page-title">Portal</h1>
                  <section className="portal-start-strip">
                    <div className="portal-start-head">
                      <div>
                        <div className="portal-start-kicker">Start</div>
                        <h2>Launch window</h2>
                      </div>
                      <div className="portal-start-status paused">Paused</div>
                    </div>
                    <div className="portal-start-controls">
                      <button className="portal-start-btn paused" type="button">Start</button>
                      <label className="portal-launch-control"><span>Crash interval</span><select defaultValue="30"><option>30 min</option></select></label>
                      <label className="portal-launch-control"><span>Date</span><input type="date" /></label>
                      <label className="portal-launch-control"><span>Start time</span><input type="time" /></label>
                      <label className="portal-launch-control"><span>End time</span><input type="time" /></label>
                    </div>
                  </section>
                  <div className="portal-filter-row">
                    <button className="range-chip active" type="button">All drinks</button>
                  </div>
                  <div className="portal-drink-list">
                    <section className="portal-drink-group">
                      <div className="portal-drink-group-head">
                        <h2>{state.venue.name}</h2>
                        <span>{state.source === "supabase" ? "Supabase live" : "Seed fallback"}</span>
                      </div>
                      {state.products.map(product => (
                        <article className={`portal-drink-row ${product.isSoldOut ? "paused" : ""}`} key={product.id}>
                          <div className="portal-drink-live">
                            <div className="portal-live-actions">
                              <button className={`portal-live-toggle ${product.isSoldOut ? "off" : "on"}`} type="button">
                                {product.isSoldOut ? "Paused" : "Live"}
                              </button>
                            </div>
                          </div>
                          <label className="portal-drink-name">
                            <span>Name</span>
                            <input value={product.name} readOnly />
                          </label>
                          <label className="portal-money-field">
                            <span>Sale</span>
                            <input value={formatMoney(product.currentPriceMinor)} readOnly />
                          </label>
                          <label className="portal-money-field">
                            <span>Floor</span>
                            <input value={formatMoney(product.floorPriceMinor)} readOnly />
                          </label>
                          <label className="portal-money-field">
                            <span>Ceiling</span>
                            <input value={formatMoney(product.ceilingPriceMinor)} readOnly />
                          </label>
                        </article>
                      ))}
                    </section>
                  </div>
                </section>
              </div>
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
