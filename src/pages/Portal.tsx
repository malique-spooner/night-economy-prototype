import { useEffect, useState } from "react";
import { PortalAuthPanel } from "../components/portal/PortalAuthPanel";
import { PortalSidebar } from "../components/portal/PortalSidebar";
import { PortalStartPage } from "../components/portal/PortalStartPage";
import { useMarketState } from "../hooks/useMarketState";
import { supabaseStatus } from "../supabase/client";
import { getCurrentSession, onAuthStateChange, signInWithEmail, signOut } from "../supabase/auth";
import {
  updateMarketProduct,
  type MarketProductPatch,
} from "../supabase/market";
import { PageSwitcher } from "./PageSwitcher";

type Props = {
  venueSlug: string;
};

export function Portal({ venueSlug }: Props) {
  const { error, setState, state } = useMarketState(venueSlug);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [lastSavedMessage, setLastSavedMessage] = useState("");

  useEffect(() => {
    void refreshSession();
    return onAuthStateChange(() => {
      void refreshSession();
    });
  }, []);

  if (error) return <main className="page">Could not load portal: {error}</main>;
  if (!state) return <main className="page">Loading portal...</main>;

  const liveCount = state.products.filter(product => !product.isSoldOut && product.isLive).length;
  const canPersist = state.source === "seed" || isSignedIn;

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

    if (!canPersist) {
      setLastSavedMessage("Sign in to save");
      return;
    }

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

  async function refreshSession() {
    const session = await getCurrentSession();
    setIsSignedIn(Boolean(session));
  }

  async function handleSignIn() {
    try {
      setAuthError("");
      await signInWithEmail(email, password);
      setPassword("");
      await refreshSession();
      setLastSavedMessage("Signed in");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign in");
    }
  }

  async function handleSignOut() {
    try {
      setAuthError("");
      await signOut();
      await refreshSession();
      setLastSavedMessage("Signed out");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign out");
    }
  }

  return (
    <>
      <PageSwitcher active="portal" />
      <section id="portalView" className="alt-view portal-view active">
        <div className="portal-shell">
          <div className="portal-layout">
            <PortalSidebar
              authSlot={
                <PortalAuthPanel
                  email={email}
                  error={authError}
                  isConfigured={supabaseStatus.ready}
                  isSignedIn={isSignedIn}
                  onEmailChange={setEmail}
                  onPasswordChange={setPassword}
                  onSignIn={handleSignIn}
                  onSignOut={handleSignOut}
                  password={password}
                />
              }
              liveCount={liveCount}
              onSignOut={handleSignOut}
              totalCount={state.products.length}
            />
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
