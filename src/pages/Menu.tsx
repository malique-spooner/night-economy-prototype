import { useEffect, useState } from "react";
import { formatMoney } from "../components/format";
import { getMarketState, type MarketState } from "../supabase/market";
import { PageSwitcher } from "./PageSwitcher";

type Props = {
  venueSlug: string;
};

export function Menu({ venueSlug }: Props) {
  const [state, setState] = useState<MarketState | null>(null);

  useEffect(() => {
    void getMarketState(venueSlug).then(setState);
  }, [venueSlug]);

  if (!state) return <main className="page">Loading menu...</main>;

  const upCount = state.products.filter(product => product.currentPriceMinor >= product.basePriceMinor).length;
  const downCount = state.products.length - upCount;
  const groups = Object.entries(
    state.products.reduce<Record<string, typeof state.products>>((acc, product) => {
      acc[product.category] ??= [];
      acc[product.category].push(product);
      return acc;
    }, {}),
  );

  return (
    <>
      <PageSwitcher active="mobile" />
      <section id="mobileView" className="alt-view mobile-view active">
        <div className="mobile-shell">
          <section className="mobile-hero">
            <div className="brand mobile-hero-title">Night Economy</div>
          </section>
          <main className="mobile-menu">
            <section className="mobile-market-brief" aria-label="Live market summary">
              <div>
                <span className="mobile-kicker">Live prices</span>
                <h1>Tonight&apos;s market</h1>
              </div>
              <div className="mobile-market-tape">
                <span>{upCount} up · {downCount} down</span>
                <strong>{state.source === "supabase" ? "LIVE" : "DEMO"} ▲ 0.0%</strong>
              </div>
            </section>
            <nav className="mobile-rail" aria-label="Menu categories">
              {groups.map(([category], index) => (
                <button className={`mobile-rail-chip ${index === 0 ? "active" : ""}`} type="button" key={category}>
                  {labelCategory(category)}
                </button>
              ))}
            </nav>
            {groups.map(([category, products]) => (
              <section className="mobile-menu-section mobile-market-section" key={category}>
                <div className="mobile-menu-section-head">
                  <div>
                    <h2>{labelCategory(category)}</h2>
                    <p>{products.length} live prices</p>
                  </div>
                  <span className="mobile-section-move up">+0.0%</span>
                </div>
                <div className="mobile-market-list">
                  {products.map(product => {
                    const up = product.currentPriceMinor >= product.basePriceMinor;
                    return (
                      <article className={`mobile-market-row ${up ? "up" : "dn"} accent-classic`} key={product.id}>
                        <div className="mobile-drink-mark" aria-hidden="true">{product.symbol.slice(0, 2)}</div>
                        <div className="mobile-market-main">
                          <div className="mobile-market-name">{product.name}</div>
                          <div className={`mobile-market-price ${up ? "up" : "dn"}`}>{formatMoney(product.currentPriceMinor)}</div>
                        </div>
                        <div className="mobile-market-meta">
                          <span>{up ? "▲" : "▼"} 0.0%</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </main>
        </div>
      </section>
    </>
  );
}

function labelCategory(category: string) {
  return category.replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}
