type MarketProduct = {
  id: string;
  current_price_minor: number;
  floor_price_minor: number;
  ceiling_price_minor: number;
  sales_velocity: number;
  is_live: boolean;
  is_sold_out: boolean;
};

type PriceDecision = {
  productId: string;
  oldPriceMinor: number;
  newPriceMinor: number;
  movement: "up" | "down" | "hold";
  reason: string;
};

const STEP_MINOR = 50;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-night-economy-scheduler-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const schedulerSecret = Deno.env.get("SCHEDULER_SECRET");
  const requestSecret = request.headers.get("x-night-economy-scheduler-secret");
  if (schedulerSecret && requestSecret !== schedulerSecret) return json({ error: "Unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Supabase function secrets are missing" }, 500);

  const { venueSlug = "demo-venue", reason = "manual_cycle" } = await request.json().catch(() => ({}));
  const headers = {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    "content-type": "application/json",
  };

  const venueResponse = await fetch(`${supabaseUrl}/rest/v1/venues?slug=eq.${venueSlug}&select=*`, { headers });
  const venues = await venueResponse.json();
  const venue = venues?.[0];
  if (!venue) return json({ error: "Venue not found" }, 404);

  const productsResponse = await fetch(
    `${supabaseUrl}/rest/v1/market_products?venue_id=eq.${venue.id}&select=*&order=display_name.asc`,
    { headers },
  );
  const products: MarketProduct[] = await productsResponse.json();
  const decisions = products.map(priceProduct);

  await Promise.all(
    decisions.map(decision =>
      fetch(`${supabaseUrl}/rest/v1/market_products?id=eq.${decision.productId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ current_price_minor: decision.newPriceMinor, updated_at: new Date().toISOString() }),
      }),
    ),
  );

  const snapshot = {
    venueId: venue.id,
    venueSlug,
    reason,
    decisions,
  };

  await fetch(`${supabaseUrl}/rest/v1/market_price_snapshots`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      id: crypto.randomUUID(),
      venue_id: venue.id,
      reason,
      status: "published",
      snapshot,
    }),
  });

  return json({ ok: true, engine: "night-economy-v1", snapshot });
});

function priceProduct(product: MarketProduct): PriceDecision {
  if (!product.is_live || product.is_sold_out) {
    return {
      productId: product.id,
      oldPriceMinor: product.current_price_minor,
      newPriceMinor: product.current_price_minor,
      movement: "hold",
      reason: "Product is not currently tradable.",
    };
  }

  const rawNext =
    product.sales_velocity >= 7
      ? product.current_price_minor + STEP_MINOR
      : product.sales_velocity <= 2
        ? product.current_price_minor - STEP_MINOR
        : product.current_price_minor;

  const nextPrice = Math.max(product.floor_price_minor, Math.min(product.ceiling_price_minor, rawNext));
  const movement =
    nextPrice > product.current_price_minor ? "up" : nextPrice < product.current_price_minor ? "down" : "hold";

  return {
    productId: product.id,
    oldPriceMinor: product.current_price_minor,
    newPriceMinor: nextPrice,
    movement,
    reason: getReason(product, movement),
  };
}

function getReason(product: MarketProduct, movement: PriceDecision["movement"]) {
  if (movement === "up") return "Strong recent sales velocity pushed the price up one step.";
  if (movement === "down") return "Soft recent sales velocity pulled the price down one step.";
  if (product.current_price_minor === product.floor_price_minor) return "Price held at the product floor.";
  if (product.current_price_minor === product.ceiling_price_minor) return "Price held at the product ceiling.";
  return "Sales velocity was steady, so the price held.";
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json",
    },
  });
}
