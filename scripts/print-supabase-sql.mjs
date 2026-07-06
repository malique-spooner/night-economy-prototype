import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = "supabase/migrations";
const expectedMigrations = [
  "001_initial.sql",
  "002_auth_rls.sql",
  "003_realtime_market.sql",
  "004_site_leads.sql",
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
