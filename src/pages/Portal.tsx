import { useEffect, useState } from "react";
import { PortalAuthPanel } from "../components/portal/PortalAuthPanel";
import { PortalSidebar } from "../components/portal/PortalSidebar";
import { PortalStartPage } from "../components/portal/PortalStartPage";
import { canEditMarketProducts, normalizeMarketProductPatch, portalAccessMessage } from "../components/portal/portalHelpers";
import { useMarketState } from "../hooks/useMarketState";
import { supabaseStatus } from "../supabase/client";
import { getCurrentSession, onAuthStateChange, signInWithEmail, signOut } from "../supabase/auth";
import { getVenueMemberRole, type VenueMemberRole } from "../supabase/memberships";
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
  const [memberRole, setMemberRole] = useState<VenueMemberRole | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  useEffect(() => {
    void refreshSession();
    return onAuthStateChange(() => {
      void refreshSession();
    });
  }, []);

  useEffect(() => {
    if (!state) return;
    const { source, venue } = state;

    let cancelled = false;

    async function refreshVenueAccess() {
      if (source === "seed") {
        setMemberRole(null);
        setIsCheckingAccess(false);
        return;
      }

      if (!isSignedIn) {
        setMemberRole(null);
        setIsCheckingAccess(false);
        return;
      }

      try {
        setIsCheckingAccess(true);
        const role = await getVenueMemberRole(venue.id);
        if (!cancelled) setMemberRole(role);
      } catch (error) {
        if (!cancelled) {
          setMemberRole(null);
          setAuthError(error instanceof Error ? error.message : "Could not check venue access");
        }
      } finally {
        if (!cancelled) setIsCheckingAccess(false);
      }
    }

    void refreshVenueAccess();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, state?.source, state?.venue.id]);

  if (error) return <main className="page">Could not load portal: {error}</main>;
  if (!state) return <main className="page">Loading portal...</main>;

  const liveCount = state.products.filter(product => !product.isSoldOut && product.isLive).length;
  const canPersist = canEditMarketProducts({ isSignedIn, role: memberRole, source: state.source });
  const accessMessage = portalAccessMessage({
    isCheckingAccess,
    isSignedIn,
    role: memberRole,
    source: state.source,
  });

  async function handleProductChange(
    productId: string,
    patch: MarketProductPatch,
    options: { persist?: boolean } = {},
  ) {
    if (!state) return;
    const currentProduct = state.products.find(product => product.id === productId);
    if (!currentProduct) return;
    const normalizedPatch = normalizeMarketProductPatch(currentProduct, patch);

    if (!canPersist) {
      setLastSavedMessage(accessMessage);
      return;
    }

    setState({
      ...state,
      products: state.products.map(product => (product.id === productId ? { ...product, ...normalizedPatch } : product)),
    });

    if (options.persist === false) {
      setLastSavedMessage("Unsaved edit");
      return;
    }

    try {
      const result = await updateMarketProduct(productId, normalizedPatch);
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
      setLastSavedMessage("Checking venue access");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign in");
    }
  }

  async function handleSignOut() {
    try {
      setAuthError("");
      await signOut();
      await refreshSession();
      setMemberRole(null);
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
                  statusMessage={accessMessage}
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
