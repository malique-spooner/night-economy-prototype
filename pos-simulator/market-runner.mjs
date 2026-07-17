import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";
import { priceMarketProduct, salesVelocityByPosProduct } from "./src/marketPricing.mjs";

export async function startMarketRunner({
  env = { ...readEnvFile(".env"), ...readEnvFile(".env.local"), ...process.env },
  log = console,
} = {}) {
  const simulatorUrl = env.POS_SIMULATOR_URL ?? "http://127.0.0.1:3002";
  const venueSlug = env.NIGHT_ECONOMY_VENUE_SLUG ?? "demo-venue";
  const intervalMs = Number(env.SIMULATOR_CYCLE_MS ?? 3750);
  const supabaseUrl = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey || isPlaceholder(serviceRoleKey)) {
    throw new Error("Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY before running the local market runner.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    // Modern sb_secret keys are accepted in `apikey`, not as Bearer tokens.
    global: { fetch: fetchWithSecretKey },
  });
  let running = false;
  async function cycle() {
    if (running) return;
    running = true;
    try {
      const result = await runMarketCycle({ supabase, simulatorUrl, venueSlug });
      log.log(`${result.referenceTime} ${result.status}: ${result.importedSales} sale line${result.importedSales === 1 ? "" : "s"}, ${result.publishedLines} price update${result.publishedLines === 1 ? "" : "s"}`);
    } catch (error) {
      log.error(`Market runner failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      running = false;
    }
  }

  log.log(`Local market runner polling ${simulatorUrl} every ${intervalMs}ms for venue ${venueSlug}.`);
  await cycle();
  return setInterval(() => { void cycle(); }, intervalMs);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  startMarketRunner().catch(error => {
    console.error(error instanceof Error ? error.message : "Could not start local market runner");
    process.exit(1);
  });
}

export async function runMarketCycle({ supabase, simulatorUrl, venueSlug, fetchImpl = fetch }) {
  const [{ data: venue, error: venueError }, simulatorState] = await Promise.all([
    supabase.from("venues").select("id, slug, market_live").eq("slug", venueSlug).maybeSingle(),
    getJson(fetchImpl, `${simulatorUrl}/v1/simulation/state`),
  ]);
  throwIfError(venueError, "load venue");
  if (!venue) throw new Error(`Venue ${venueSlug} was not found`);

  const { data: connection, error: connectionError } = await supabase
    .from("pos_connections")
    .select("id, base_url, status")
    .eq("venue_id", venue.id)
    .eq("provider", "simulator")
    .maybeSingle();
  throwIfError(connectionError, "load simulator connection");
  if (!connection) throw new Error(`No simulator POS connection exists for ${venueSlug}`);
  if (connection.status !== "active") throw new Error("Simulator POS connection is not active");

  const posBaseUrl = connection.base_url || simulatorUrl;
  const productMap = await syncPosProducts({ supabase, fetchImpl, posBaseUrl, venueId: venue.id, connectionId: connection.id });
  const importedSales = await importSales({
    supabase,
    fetchImpl,
    posBaseUrl,
    venueId: venue.id,
    connectionId: connection.id,
    productMap,
  });
  const referenceTime = simulatorState.service.simulatedTime;

  if (!venue.market_live) {
    return { importedSales, publishedLines: 0, referenceTime, status: "market paused" };
  }

  const windowStart = new Date(Date.parse(referenceTime) - 2 * 60_000).toISOString();
  const [{ data: marketProducts, error: marketError }, { data: recentSales, error: salesError }] = await Promise.all([
    supabase
      .from("market_products")
      .select("id, pos_product_id, current_price_minor, floor_price_minor, ceiling_price_minor, is_live, is_sold_out")
      .eq("venue_id", venue.id)
      .not("pos_product_id", "is", null),
    supabase
      .from("pos_sales_events")
      .select("pos_product_id, quantity")
      .eq("venue_id", venue.id)
      .gte("occurred_at", windowStart)
      .lte("occurred_at", referenceTime),
  ]);
  throwIfError(marketError, "load mapped market products");
  throwIfError(salesError, "load recent POS sales");

  const velocities = salesVelocityByPosProduct(recentSales ?? []);
  const pricedProducts = (marketProducts ?? []).map(product => ({
    id: product.id,
    posProductId: product.pos_product_id,
    currentPriceMinor: product.current_price_minor,
    floorPriceMinor: product.floor_price_minor,
    ceilingPriceMinor: product.ceiling_price_minor,
    salesVelocity: velocities.get(product.pos_product_id) ?? 0,
    isLive: product.is_live,
    isSoldOut: product.is_sold_out,
  }));
  const decisions = pricedProducts.map(priceMarketProduct);
  const now = new Date().toISOString();

  await Promise.all(
    pricedProducts.map(product =>
      update(supabase, "market_products", {
        sales_velocity: product.salesVelocity,
        updated_at: now,
      }, "id", product.id, "update market sales velocity"),
    ),
  );

  const changed = decisions
    .map((decision, index) => ({ ...decision, posProductId: pricedProducts[index].posProductId }))
    .filter(decision => decision.oldPriceMinor !== decision.newPriceMinor);
  const publishedLines = changed.length
    ? await publishPrices({
        supabase,
        fetchImpl,
        posBaseUrl,
        venueId: venue.id,
        connectionId: connection.id,
        decisions: changed,
        productMap,
      })
    : [];

  await Promise.all(
    publishedLines.map(line =>
      update(supabase, "market_products", {
        current_price_minor: line.newPriceMinor,
        updated_at: new Date().toISOString(),
      }, "id", line.productId, "update published market price"),
    ),
  );

  const { error: snapshotError } = await supabase.from("market_price_snapshots").insert({
    id: `snapshot_${crypto.randomUUID()}`,
    venue_id: venue.id,
    reason: "simulator_cycle",
    status: "published",
    snapshot: { referenceTime, importedSales, decisions },
  });
  throwIfError(snapshotError, "write market snapshot");

  return { importedSales, publishedLines: publishedLines.length, referenceTime, status: "published" };
}

async function syncPosProducts({ supabase, fetchImpl, posBaseUrl, venueId, connectionId }) {
  const [{ products }, { data: existing, error: existingError }] = await Promise.all([
    getJson(fetchImpl, `${posBaseUrl}/v1/products`),
    supabase.from("pos_products").select("id, external_id").eq("pos_connection_id", connectionId),
  ]);
  throwIfError(existingError, "load synced POS products");
  const existingByExternalId = new Map((existing ?? []).map(product => [product.external_id, product]));
  const productMap = new Map();

  for (const product of products) {
    const row = {
      venue_id: venueId,
      pos_connection_id: connectionId,
      external_id: product.id,
      sku: product.sku,
      source_name: product.name,
      base_price_minor: product.basePriceMinor,
      current_price_minor: product.currentPriceMinor,
      currency: product.currency,
      is_available: product.isAvailable,
      synced_at: product.updatedAt,
      updated_at: new Date().toISOString(),
    };
    const existingProduct = existingByExternalId.get(product.id);
    if (existingProduct) {
      await update(supabase, "pos_products", row, "id", existingProduct.id, "update POS product");
      productMap.set(product.id, existingProduct.id);
    } else {
      const id = `pos_${connectionId}_${product.id}`.replace(/[^a-zA-Z0-9_]/g, "_");
      const { error } = await supabase.from("pos_products").insert({ id, ...row });
      throwIfError(error, "insert POS product");
      productMap.set(product.id, id);
    }
  }

  return productMap;
}

async function importSales({ supabase, fetchImpl, posBaseUrl, venueId, connectionId, productMap }) {
  const { data: latest, error: latestError } = await supabase
    .from("pos_sales_events")
    .select("occurred_at")
    .eq("pos_connection_id", connectionId)
    .order("occurred_at", { ascending: false })
    .limit(1);
  throwIfError(latestError, "load sales import cursor");
  const latestTime = latest?.[0]?.occurred_at;
  const since = latestTime ? new Date(Date.parse(latestTime) - 60_000).toISOString() : "2026-07-17T17:59:00.000Z";
  const { sales } = await getJson(fetchImpl, `${posBaseUrl}/v1/sales?since=${encodeURIComponent(since)}`);
  const rows = sales
    .filter(sale => productMap.has(sale.productId))
    .map(sale => ({
      id: sale.id,
      venue_id: venueId,
      pos_connection_id: connectionId,
      pos_product_id: productMap.get(sale.productId),
      occurred_at: sale.occurredAt,
      quantity: sale.quantity,
      unit_price_minor: sale.unitPriceMinor,
      currency: sale.currency,
    }));
  if (!rows.length) return 0;
  const { error } = await supabase.from("pos_sales_events").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
  throwIfError(error, "import POS sales");
  return rows.length;
}

async function publishPrices({ supabase, fetchImpl, posBaseUrl, venueId, connectionId, decisions, productMap }) {
  const inverseProductMap = new Map([...productMap].map(([externalId, id]) => [id, externalId]));
  const publicationId = `publication_${crypto.randomUUID()}`;
  const lines = decisions
    .filter(decision => decision.posProductId)
    .map(line => ({ ...line, externalProductId: inverseProductMap.get(line.posProductId) }));
  if (!lines.length) return 0;

  const { error: publicationError } = await supabase.from("price_publications").insert({
    id: publicationId,
    venue_id: venueId,
    pos_connection_id: connectionId,
    reason: "simulator_cycle",
    status: "pending",
  });
  throwIfError(publicationError, "create price publication");
  const { error: lineError } = await supabase.from("price_publication_lines").insert(
    lines.map(line => ({
      publication_id: publicationId,
      market_product_id: line.productId,
      pos_product_id: line.posProductId,
      old_price_minor: line.oldPriceMinor,
      new_price_minor: line.newPriceMinor,
      status: "pending",
    })),
  );
  throwIfError(lineError, "create price publication lines");

  const result = await postJson(fetchImpl, `${posBaseUrl}/v1/price-publications`, {
    publicationId,
    lines: lines.map(line => ({ productId: line.externalProductId, newPriceMinor: line.newPriceMinor })),
  });
  const resultsByExternalId = new Map(result.lines.map(line => [line.productId, line]));
  const publishedLines = [];

  await Promise.all(lines.map(async line => {
    const response = resultsByExternalId.get(line.externalProductId) ?? { status: "failed", message: "POS did not return this line" };
    const status = response.status === "published" ? "published" : "failed";
    if (status === "published") {
      publishedLines.push(line);
      await update(supabase, "pos_products", { current_price_minor: line.newPriceMinor, updated_at: new Date().toISOString() }, "id", line.posProductId, "update published POS price");
    }
    await supabase
      .from("price_publication_lines")
      .update({ status, response })
      .eq("publication_id", publicationId)
      .eq("pos_product_id", line.posProductId);
  }));

  const publicationStatus = publishedLines.length === lines.length ? "published" : publishedLines.length ? "partial_failure" : "failed";
  await update(supabase, "price_publications", { status: publicationStatus, published_at: new Date().toISOString() }, "id", publicationId, "finish price publication");
  return publishedLines;
}

async function update(supabase, table, row, key, value, action) {
  const { error } = await supabase.from(table).update(row).eq(key, value);
  throwIfError(error, action);
}

async function getJson(fetchImpl, url) {
  const response = await fetchImpl(url);
  if (!response.ok) throw new Error(`POS request failed: ${response.status} ${await response.text()}`);
  return response.json();
}

async function postJson(fetchImpl, url, body) {
  const response = await fetchImpl(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`POS publication failed: ${response.status} ${await response.text()}`);
  return response.json();
}

function throwIfError(error, action) {
  if (error) throw new Error(`Could not ${action}: ${error.message}`);
}

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(readFileSync(path, "utf8").split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#") && line.includes("=")).map(line => {
    const index = line.indexOf("=");
    return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")];
  }));
}

function isPlaceholder(value) {
  return ["", "your_service_role_key_here", "..."].includes(value ?? "");
}

export function fetchWithSecretKey(input, init = {}, fetchImpl = fetch) {
  const headers = new Headers(init.headers);
  headers.delete("authorization");
  return fetchImpl(input, { ...init, headers });
}
