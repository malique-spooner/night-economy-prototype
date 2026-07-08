import { useEffect, useState } from "react";
import { LiveTicker } from "../components/tv/LiveTicker";
import { MarketBoard } from "../components/tv/MarketBoard";
import { TvBackground } from "../components/tv/TvBackground";
import { TvStoryPanel } from "../components/tv/TvStoryPanel";
import { TvTopBar } from "../components/tv/TvTopBar";
import { marketStatusLabel } from "../components/tv/tvHelpers";
import { useMarketState } from "../hooks/useMarketState";
import { PageSwitcher } from "./PageSwitcher";

type Props = {
  venueSlug: string;
};

export function Tv({ venueSlug }: Props) {
  const { error, state } = useMarketState(venueSlug);
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (error) return <main className="page">Could not load market: {error}</main>;
  if (!state) return <main className="page">Loading market...</main>;

  const sourceLabel = state.source === "supabase" ? "Live data" : "Seed fallback";

  return (
    <>
      <PageSwitcher active="tv" />
      <TvBackground />
      <div className="root">
        <div className="ui">
          <TvTopBar clock={clock} marketStatusLabel={marketStatusLabel(state.venue)} sourceLabel={sourceLabel} />
          <div className="body">
            <MarketBoard products={state.products} venue={state.venue} />
            <div className="divv"></div>
            <TvStoryPanel products={state.products} venue={state.venue} />
          </div>
          <LiveTicker products={state.products} venue={state.venue} />
        </div>
      </div>
    </>
  );
}

function formatClock(date: Date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
