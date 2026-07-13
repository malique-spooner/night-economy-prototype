import { useCallback, useEffect, useState } from "react";
import { getMarketState, type MarketState } from "../api/market";
import { supabase } from "../api/client";

export function useMarketState(venueSlug: string) {
  const [state, setState] = useState<MarketState | null>(null);
  const [error, setError] = useState<string>("");

  const refresh = useCallback(async () => {
    try {
      const nextState = await getMarketState(venueSlug);
      setState(nextState);
      setError("");
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Could not load market state");
    }
  }, [venueSlug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!supabase || state?.source !== "supabase") return undefined;

    const client = supabase;
    const venueId = state.venue.id;
    const channel = client
      .channel(`market-state-${venueId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "market_products", filter: `venue_id=eq.${venueId}` },
        () => {
          void refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "venues", filter: `id=eq.${venueId}` },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [refresh, state?.source, state?.venue.id]);

  return { error, refresh, setState, state };
}
