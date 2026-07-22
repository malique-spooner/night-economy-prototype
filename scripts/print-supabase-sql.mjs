import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = "supabase/migrations";
const expectedMigrations = [
  "001_initial.sql",
  "002_auth_rls.sql",
  "003_realtime_market.sql",
  "004_site_leads.sql",
  "005_market_sales_velocity.sql",
  "006_venue_market_settings.sql",
  "007_market_product_inserts.sql",
  "008_pos_catalog_and_publications.sql",
  "009_pos_owned_catalogue_portal_rules.sql",
  "010_server_runner_privileges.sql",
  "011_link_demo_market_products_to_pos_products.sql",
  "012_align_demo_catalogue_with_simulator_product_ids.sql",
  "013_tlj_menu_catalogue.sql",
  "014_hide_legacy_demo_catalogue.sql",
  "015_pos_catalogue_grouping.sql",
];

const migrationFiles = readdirSync(migrationsDir)
  .filter(file => file.endsWith(".sql"))
  .sort();

const missing = expectedMigrations.filter(file => !migrationFiles.includes(file));
const unexpected = migrationFiles.filter(file => !expectedMigrations.includes(file));

if (missing.length || unexpected.length) {
  console.error("Supabase migration list does not match the expected apply order.");
  if (missing.length) console.error(`Missing: ${missing.join(", ")}`);
  if (unexpected.length) console.error(`Unexpected: ${unexpected.join(", ")}`);
  process.exit(1);
}

console.log("-- Night Economy Supabase setup SQL");
console.log("-- Apply this in the Supabase SQL editor for the target project.");
console.log("-- Review each section before running in production.");

for (const file of expectedMigrations) {
  const path = join(migrationsDir, file);
  const sql = readFileSync(path, "utf8").trim();

  console.log("");
  console.log(`-- ============================================================================`);
  console.log(`-- ${file}`);
  console.log(`-- ============================================================================`);
  console.log(sql);
  console.log("");
}
