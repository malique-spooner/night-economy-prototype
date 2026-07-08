import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

const env = {
  ...readEnvFile(".env"),
  ...readEnvFile(".env.local"),
  ...process.env,
};

const supabaseUrl = env.VITE_SUPABASE_URL?.trim() ?? "";
const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
const venueSlug = env.SMOKE_VENUE_SLUG?.trim() || "demo-venue";

const errors = [];
if (!supabaseUrl || supabaseUrl === "..." || !supabaseUrl.endsWith(".supabase.co")) {
  errors.push("VITE_SUPABASE_URL must be set to a Supabase project URL.");
}

if (!publishableKey || publishableKey === "..." || publishableKey === "your_publishable_key_here") {
  errors.push("VITE_SUPABASE_PUBLISHABLE_KEY must be set to the public browser key.");
}

if (/^sb_secret_/i.test(publishableKey) || hasServiceRoleJwtClaim(publishableKey)) {
  errors.push("VITE_SUPABASE_PUBLISHABLE_KEY looks like a secret/service-role key. Use the public browser key.");
}

if (errors.length) {
  console.error("Live Supabase smoke check could not start:");
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, publishableKey, {
  auth: { persistSession: false },
});

const { data: venue, error: venueError } = await supabase
  .from("venues")
  .select("id,slug,name,currency,timezone,market_live")
  .eq("slug", venueSlug)
  .maybeSingle();

if (venueError) fail(`Could not read venue '${venueSlug}': ${venueError.message}`);
if (!venue) fail(`Venue '${venueSlug}' was not found. Apply migrations/seeds first.`);

const { data: products, error: productsError } = await supabase
  .from("market_products")
  .select("id,display_name,current_price_minor,is_live,is_sold_out")
  .eq("venue_id", venue.id)
  .limit(3);

if (productsError) fail(`Could not read market products: ${productsError.message}`);
if (!products?.length) fail(`Venue '${venueSlug}' has no market products.`);

console.log("Live Supabase smoke check passed.");
console.log(`- venue: ${venue.name} (${venue.slug})`);
console.log(`- market: ${venue.market_live ? "live" : "paused"}`);
console.log(`- sampled products: ${products.length}`);

function fail(message) {
  console.error("Live Supabase smoke check failed:");
  console.error(`- ${message}`);
  process.exit(1);
}

function readEnvFile(path) {
  if (!existsSync(path)) return {};

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#") && line.includes("="))
      .map(line => {
        const separatorIndex = line.indexOf("=");
        const key = line.slice(0, separatorIndex).trim();
        const rawValue = line.slice(separatorIndex + 1).trim();
        return [key, stripQuotes(rawValue)];
      }),
  );
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

function hasServiceRoleJwtClaim(value = "") {
  const parts = String(value).split(".");
  if (parts.length < 2) return false;

  try {
    const payload = JSON.parse(Buffer.from(toBase64(parts[1]), "base64").toString("utf8"));
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

function toBase64(base64Url) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
}
