import { useEffect, useState } from "react";
import { formatMoney } from "../components/format";
import { getMarketState, type MarketState } from "../supabase/market";
import { PageSwitcher } from "./PageSwitcher";

type Props = {
  venueSlug: string;
};

export function Tv({ venueSlug }: Props) {
  const [state, setState] = useState<MarketState | null>(null);

  useEffect(() => {
    void getMarketState(venueSlug).then(setState);
  }, [venueSlug]);

  if (!state) return <main className="page">Loading market...</main>;

  return (
    <>
      <PageSwitcher active="tv" />
      <div className="app-bg">
        <div className="grid"></div>
        <div className="wash"></div>
        <div className="vignette"></div>
        <div className="scanlines"></div>
      </div>
      <div className="root">
        <div className="ui">
          <div className="topbar">
            <div className="brand">Night Economy</div>
            <div className="live-pill"><div className="live-dot"></div><span>Market open</span></div>
            <div className="top-right">
              <div className="trade-count">{state.source === "supabase" ? "Live data" : "Seed fallback"}</div>
              <div className="clk">22:48:00</div>
            </div>
          </div>
          <div className="body">
            <div className="board">
              <div className="board-hdr">
                <span className="slbl">Live Market Board</span>
                <div className="board-view-indicator">
                  <span className="board-view-lbl">COCKTAILS</span>
                  <div className="board-dots"><div className="bdot active"></div><div className="bdot"></div><div className="bdot"></div><div className="bdot"></div></div>
                </div>
                <span className="updt">{state.venue.name}</span>
              </div>
              <div className="col-hdr">
                <div className="ch">Drink</div>
                <div className="ch">Price</div>
                <div className="ch">Trend</div>
                <div className="ch">Change</div>
                <div className="ch"></div>
              </div>
              <div className="board-scroll">
                <div className="board-inner">
                  {state.products.map(product => (
                    <div className="row" key={product.id}>
                      <div className="dname">{product.name}</div>
                      <div className="dprice up">{formatMoney(product.currentPriceMinor)}</div>
                      <div className="spark-cell">▁▂▃▅▆</div>
                      <div className="dpct up">+0.0%</div>
                      <div className="darr up">▲</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="divv"></div>
            <div className="rpanel">
              <div className="pview active">
                <div className="bulletin-art" aria-hidden="true"></div>
                <div className="panel-tag tag-market">Breaking News</div>
                <div className="bulletin-layout">
                  <div className="bulletin-stack">
                    <div className="story-a-kicker">Room signal</div>
                    <div className="story-a-headline">Cocktails are setting the pace.</div>
                    <div className="story-a-copy">A short read on where the room is leaning next.</div>
                  </div>
                </div>
                <div className="bulletin-price"><span>Current price</span><strong>{formatMoney(state.products[0]?.currentPriceMinor ?? 0)}</strong></div>
              </div>
            </div>
          </div>
          <div className="ticker ticker-bottom">
            <div className="t-badge">Live prices</div>
            <div className="t-track"><div className="t-inner">{state.products.map(product => `${product.name} ${formatMoney(product.currentPriceMinor)}`).join(" · ")}</div></div>
          </div>
        </div>
      </div>
    </>
  );
}
