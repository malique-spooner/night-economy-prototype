import { useEffect, useState } from "react";
import { PortalAccountPage } from "../components/portal/PortalAccountPage";
import { PortalAuthPanel } from "../components/portal/PortalAuthPanel";
import { PortalSidebar, type PortalTab } from "../components/portal/PortalSidebar";
import { PortalStartPage } from "../components/portal/PortalStartPage";
import {
  applyMarketProductPatch,
  applyVenueSettingsPatch,
  canEditMarketProducts,
  canManageVenueSettings,
  normalizeMarketProductPatch,
  portalAccessMessage,
  venueSettingsAccessMessage,
} from "../components/portal/portalHelpers";
import { useMarketState } from "../hooks/useMarketState";
import { supabaseStatus } from "../api/client";
import { getCurrentSession, onAuthStateChange, signInWithEmail, signOut } from "../api/auth";
import { getVenueMemberRole, type VenueMemberRole } from "../api/memberships";
import {
  createMarketProductConfiguration,
  getMarketProductPriceHistory,
  getPosProducts,
  updateMarketProduct,
  updateVenueMarketSettings,
  type MarketProductConfiguration,
  type MarketPriceHistoryPoint,
  type MarketProductPatch,
  type PosProduct,
  type VenueMarketSettingsPatch,
} from "../api/market";
import { prepareMarketProductConfiguration } from "../components/portal/portalHelpers";
import { PageSwitcher } from "./PageSwitcher";
import { controlSimulator, getSimulatorState, simulatorStatus, updateSimulatorService, type SimulatorCrowd, type SimulatorState } from "../api/simulator";
import { PortalSimulatorControls } from "../components/portal/PortalSimulatorControls";

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
  const [activeTab, setActiveTab] = useState<PortalTab>("start");
  const [signedInEmail, setSignedInEmail] = useState("");
  const [posProducts, setPosProducts] = useState<PosProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<MarketPriceHistoryPoint[]>([]);
  const [priceHistoryLoading, setPriceHistoryLoading] = useState(false);
  const [simulatorState, setSimulatorState] = useState<SimulatorState | null>(null);
  const [simulatorError, setSimulatorError] = useState("");

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

  useEffect(() => {
    if (!simulatorStatus.ready) return undefined;
    let cancelled = false;
    async function refreshSimulator() {
      try {
        const nextState = await getSimulatorState();
        if (!cancelled) {
          setSimulatorState(nextState);
          setSimulatorError("");
        }
      } catch (error) {
        if (!cancelled) setSimulatorError(error instanceof Error ? error.message : "Could not reach the local POS simulator");
      }
    }
    void refreshSimulator();
    const timer = window.setInterval(() => { void refreshSimulator(); }, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    if (selectedProductId && state.products.some(product => product.id === selectedProductId)) return;
    setSelectedProductId(state.products.find(product => product.isLive && !product.isSoldOut)?.id ?? state.products[0]?.id ?? null);
  }, [selectedProductId, state]);

  useEffect(() => {
    if (!state || !selectedProductId || state.source === "seed") {
      setPriceHistory([]);
      setPriceHistoryLoading(false);
      return;
    }

    let cancelled = false;
    setPriceHistoryLoading(true);
    void getMarketProductPriceHistory(state.venue.id, selectedProductId)
      .then(history => {
        if (!cancelled) setPriceHistory(history);
      })
      .catch(error => {
        if (!cancelled) {
          setPriceHistory([]);
          setLastSavedMessage(error instanceof Error ? error.message : "Could not load price history");
        }
      })
      .finally(() => {
        if (!cancelled) setPriceHistoryLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedProductId, state?.source, state?.venue.id]);

  useEffect(() => {
    if (!state) return;
    const marketState = state;
    let cancelled = false;
    async function refreshPosProducts() {
      if (marketState.source === "supabase" && !isSignedIn) {
        setPosProducts([]);
        return;
      }
      try {
        const nextProducts = await getPosProducts(marketState.venue.id);
        if (!cancelled) setPosProducts(nextProducts);
      } catch (error) {
        if (!cancelled) setLastSavedMessage(error instanceof Error ? `Could not load POS products: ${error.message}` : "Could not load POS products");
      }
    }
    void refreshPosProducts();
    return () => { cancelled = true; };
  }, [isSignedIn, state?.source, state?.venue.id]);

  if (error) return <main className="page">Could not load portal: {error}</main>;
  if (!state) return <main className="page">Loading portal...</main>;

  const liveCount = state.products.filter(product => !product.isSoldOut && product.isLive).length;
  const canPersist = canEditMarketProducts({ isSignedIn, role: memberRole, source: state.source });
  const canManageSettings = canManageVenueSettings({ role: memberRole, source: state.source });
  const accessMessage = portalAccessMessage({
    isCheckingAccess,
    isSignedIn,
    role: memberRole,
    source: state.source,
  });
  const settingsAccessMessage = venueSettingsAccessMessage({ role: memberRole, source: state.source });

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
      products: applyMarketProductPatch(state.products, productId, normalizedPatch),
    });

    if (options.persist === false) {
      setLastSavedMessage("Unsaved edit");
      return;
    }

    try {
      const result = await updateMarketProduct(productId, normalizedPatch);
      setLastSavedMessage(result.persisted ? "Saved to Supabase" : "Demo change only");
    } catch (error) {
      setState(current =>
        current
          ? {
              ...current,
              products: applyMarketProductPatch(current.products, productId, currentProduct),
            }
          : current,
      );
      setLastSavedMessage(error instanceof Error ? `Not saved: ${error.message}` : "Not saved");
    }
  }

  async function handleConfigurePosProduct(posProduct: PosProduct) {
    if (!state) return false;

    if (!canPersist) {
      setLastSavedMessage(accessMessage);
      return false;
    }

    try {
      const product: MarketProductConfiguration = prepareMarketProductConfiguration({
        id: `mp_${crypto.randomUUID()}`,
        posProduct,
        products: state.products,
      });
      const result = await createMarketProductConfiguration(state.venue.id, product);
      setState({ ...state, products: [...state.products, result.product] });
      setLastSavedMessage(result.persisted ? "POS product configured for the market" : "Demo product configured for the market");
      return true;
    } catch (error) {
      setLastSavedMessage(error instanceof Error ? `Not configured: ${error.message}` : "Not configured");
      return false;
    }
  }

  async function handleVenueSettingsChange(patch: VenueMarketSettingsPatch) {
    if (!state) return;

    if (!canManageSettings) {
      setLastSavedMessage(settingsAccessMessage);
      return;
    }

    const previousVenue = state.venue;
    const nextVenue = applyVenueSettingsPatch(state.venue, patch);
    setState({ ...state, venue: nextVenue });

    try {
      const result = await updateVenueMarketSettings(state.venue.id, patch);
      setLastSavedMessage(result.persisted ? "Launch settings saved" : "Demo launch settings");
    } catch (error) {
      setState(current => (current ? { ...current, venue: previousVenue } : current));
      setLastSavedMessage(error instanceof Error ? `Not saved: ${error.message}` : "Not saved");
    }
  }

  async function handleSimulatorControl(action: "start" | "pause" | "reset") {
    try {
      const nextState = await controlSimulator(action, action === "start" ? { speed: simulatorState?.service.speed ?? 32, crowd: simulatorState?.service.crowd ?? "normal" } : {});
      setSimulatorState(nextState);
      setSimulatorError("");
      setLastSavedMessage(action === "reset" ? "Local test service reset. The market runner will clear its next cycle." : `Local test service ${action === "start" ? "started" : "paused"}.`);
    } catch (error) {
      setSimulatorError(error instanceof Error ? error.message : "Could not update the local test service");
    }
  }

  async function handleSimulatorServiceChange(options: { crowd?: SimulatorCrowd; speed?: number }) {
    try {
      const nextState = await updateSimulatorService(options);
      setSimulatorState(nextState);
      setSimulatorError("");
    } catch (error) {
      setSimulatorError(error instanceof Error ? error.message : "Could not update local test service settings");
    }
  }

  async function refreshSession() {
    const session = await getCurrentSession();
    setIsSignedIn(Boolean(session));
    setSignedInEmail(session?.user.email ?? "");
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
      <PageSwitcher active="portal" venueSlug={venueSlug} />
      <section id="portalView" className="alt-view portal-view active">
        <div className="portal-shell">
          <div className="portal-layout">
            <PortalSidebar
              activeTab={activeTab}
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
              onTabChange={setActiveTab}
              onSignOut={handleSignOut}
              totalCount={state.products.length}
            />
            <main className="portal-main">
              <div className="portal-workspace">
                {activeTab === "start" ? (
                  <PortalStartPage
                    lastSavedMessage={lastSavedMessage}
                    onConfigurePosProduct={handleConfigurePosProduct}
                    onProductChange={handleProductChange}
                    onSelectProduct={setSelectedProductId}
                    onVenueSettingsChange={handleVenueSettingsChange}
                    products={state.products}
                    priceHistory={priceHistory}
                    priceHistoryLoading={priceHistoryLoading}
                    posProducts={posProducts}
                    selectedProductId={selectedProductId}
                    source={state.source}
                    simulatorControls={
                      <PortalSimulatorControls
                        error={simulatorError}
                        onControl={handleSimulatorControl}
                        onServiceChange={handleSimulatorServiceChange}
                        ready={simulatorStatus.ready}
                        state={simulatorState}
                      />
                    }
                    venue={state.venue}
                  />
                ) : (
                  <PortalAccountPage
                    email={signedInEmail}
                    isSignedIn={isSignedIn}
                    liveCount={liveCount}
                    role={memberRole}
                    source={state.source}
                    totalCount={state.products.length}
                    venue={state.venue}
                  />
                )}
              </div>
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
