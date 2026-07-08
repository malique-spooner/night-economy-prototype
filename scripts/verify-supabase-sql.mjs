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
];

const migrationFiles = readdirSync(migrationsDir)
  .filter(file => file.endsWith(".sql"))
  .sort();

const migrationSql = Object.fromEntries(
  expectedMigrations.map(file => [file, readFileSync(join(migrationsDir, file), "utf8")]),
);
const allSql = expectedMigrations.map(file => migrationSql[file]).join("\n\n");
const failures = [];

checkMigrationOrder();
checkRequiredPatterns();
checkForbiddenPatterns();

if (failures.length) {
  console.error("Supabase SQL verification failed:");
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Supabase SQL verification passed.");

function checkMigrationOrder() {
  const missing = expectedMigrations.filter(file => !migrationFiles.includes(file));
  const unexpected = migrationFiles.filter(file => !expectedMigrations.includes(file));

  if (missing.length) failures.push(`Missing migrations: ${missing.join(", ")}`);
  if (unexpected.length) failures.push(`Unexpected migrations: ${unexpected.join(", ")}`);
}

function checkRequiredPatterns() {
  const required = [
    {
      label: "venues RLS enabled",
      source: migrationSql["001_initial.sql"],
      pattern: /alter table public\.venues enable row level security/i,
    },
    {
      label: "market products RLS enabled",
      source: migrationSql["001_initial.sql"],
      pattern: /alter table public\.market_products enable row level security/i,
    },
    {
      label: "site leads RLS enabled",
      source: migrationSql["004_site_leads.sql"],
      pattern: /alter table public\.site_leads enable row level security/i,
    },
    {
      label: "site leads public insert policy only",
      source: migrationSql["004_site_leads.sql"],
      pattern: /create policy "public can create site leads"[\s\S]+for insert[\s\S]+to anon, authenticated[\s\S]+with check \(source = 'site_signup'\)/i,
    },
    {
      label: "venue members can read only their memberships",
      source: migrationSql["002_auth_rls.sql"],
      pattern: /create policy "members can read their memberships"[\s\S]+for select[\s\S]+to authenticated[\s\S]+using \(\(select auth\.uid\(\)\) = user_id\)/i,
    },
    {
      label: "venue update policy has using and with check",
      source: migrationSql["002_auth_rls.sql"],
      pattern: /create policy "venue members can update their venues"[\s\S]+for update[\s\S]+to authenticated[\s\S]+using[\s\S]+with check[\s\S]+role in \('owner', 'admin'\)/i,
    },
    {
      label: "market product update policy has using and with check",
      source: migrationSql["002_auth_rls.sql"],
      pattern: /create policy "venue members can update market products"[\s\S]+for update[\s\S]+to authenticated[\s\S]+using[\s\S]+with check[\s\S]+role in \('owner', 'admin', 'staff'\)/i,
    },
    {
      label: "market product insert policy checks venue membership",
      source: migrationSql["007_market_product_inserts.sql"],
      pattern: /create policy "venue members can insert market products"[\s\S]+for insert[\s\S]+to authenticated[\s\S]+with check[\s\S]+venue_members[\s\S]+role in \('owner', 'admin', 'staff'\)/i,
    },
    {
      label: "market product insert grant excludes anon",
      source: migrationSql["007_market_product_inserts.sql"],
      pattern: /grant insert[\s\S]+on public\.market_products to authenticated/i,
    },
  ];

  for (const check of required) {
    if (!check.pattern.test(check.source)) failures.push(`Missing ${check.label}.`);
  }
}

function checkForbiddenPatterns() {
  const forbidden = [
    {
      label: "deprecated auth.role() policy checks",
      pattern: /auth\.role\(\)/i,
    },
    {
      label: "security definer code in exposed migrations",
      pattern: /security\s+definer/i,
    },
    {
      label: "public read grant on site leads",
      pattern: /grant\s+select[^;]+on public\.site_leads\s+to\s+anon/i,
    },
    {
      label: "anonymous market product writes",
      pattern: /grant\s+(insert|update|delete)[^;]+on public\.market_products\s+to\s+anon/i,
    },
  ];

  for (const check of forbidden) {
    if (check.pattern.test(allSql)) failures.push(`Found ${check.label}.`);
  }
}
