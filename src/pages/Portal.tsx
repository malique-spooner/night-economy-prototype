import { useEffect, useState } from "react";
import { PortalSidebar } from "../components/portal/PortalSidebar";
import { PortalStartPage } from "../components/portal/PortalStartPage";
import {
  getMarketState,
  updateMarketProduct,
  type MarketProductPatch,
  type MarketState,
} from "../supabase/market";
import { PageSwitcher } from "./PageSwitcher";

type Props = {
  venueSlug: string;
};

export function Portal({ venueSlug }: Props) {
  const [state, setState] = useState<MarketState | null>(null);
  const [lastSavedMessage, setLastSavedMessage] = useState("");

  useEffect(() => {
    void getMarketState(venueSlug).then(setState);
  }, [venueSlug]);

  if (!state) return <main className="page">Loading portal...</main>;

  const liveCount = state.products.filter(product => !product.isSoldOut && product.isLive).length;

  async function handleProductChange(
    productId: string,
    patch: MarketProductPatch,
    options: { persist?: boolean } = {},
  ) {
    if (!state) return;

    setState({
      ...state,
      products: state.products.map(product => (product.id === productId ? { ...product, ...patch } : product)),
    });

    if (options.persist === false) {
      setLastSavedMessage("Unsaved edit");
      return;
    }

    try {
      const result = await updateMarketProduct(productId, patch);
      setLastSavedMessage(result.persisted ? "Saved to Supabase" : "Demo change only");
    } catch (error) {
      setLastSavedMessage(error instanceof Error ? `Not saved: ${error.message}` : "Not saved");
    }
  }

  return (
    <>
      <PageSwitcher active="portal" />
      <section id="portalView" className="alt-view portal-view active">
        <div className="portal-shell">
          <div className="portal-layout">
            <PortalSidebar liveCount={liveCount} totalCount={state.products.length} />
            <main className="portal-main">
              <div className="portal-workspace">
                <PortalStartPage
                  lastSavedMessage={lastSavedMessage}
                  onProductChange={handleProductChange}
                  products={state.products}
                  source={state.source}
                  venue={state.venue}
                />
              </div>
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
