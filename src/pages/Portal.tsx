import { useEffect, useState } from "react";
import { PortalSidebar } from "../components/portal/PortalSidebar";
import { PortalStartPage } from "../components/portal/PortalStartPage";
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

  const liveCount = state.products.filter(product => !product.isSoldOut && product.isLive).length;

  return (
    <>
      <PageSwitcher active="portal" />
      <section id="portalView" className="alt-view portal-view active">
        <div className="portal-shell">
          <div className="portal-layout">
            <PortalSidebar liveCount={liveCount} totalCount={state.products.length} />
            <main className="portal-main">
              <div className="portal-workspace">
                <PortalStartPage products={state.products} source={state.source} venue={state.venue} />
              </div>
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
