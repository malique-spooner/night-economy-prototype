import { readFileSync } from "node:fs";

const source = readFileSync("scripts/smoke-supabase-live.mjs", "utf8");
const failures = [];

const requiredPatterns = [
  {
    label: "validates Supabase URL with URL parser",
    pattern: /function isValidSupabaseUrl[\s\S]+url\.protocol === "https:"[\s\S]+url\.hostname\.endsWith\("\.supabase\.co"\)/,
  },
  {
    label: "rejects placeholder publishable keys",
    pattern: /your_publishable_key_here/,
  },
  {
    label: "rejects secret browser keys",
    pattern: /sb_secret_[\s\S]+hasServiceRoleJwtClaim/,
  },
  {
    label: "reads venue launch settings",
    pattern: /crash_interval_minutes[\s\S]+launch_date[\s\S]+launch_start_time[\s\S]+launch_end_time/,
  },
  {
    label: "reads product pricing inputs",
    pattern: /base_price_minor[\s\S]+floor_price_minor[\s\S]+ceiling_price_minor[\s\S]+sales_velocity/,
  },
];

for (const check of requiredPatterns) {
  if (!check.pattern.test(source)) failures.push(`scripts/smoke-supabase-live.mjs missing ${check.label}.`);
}

if (failures.length) {
  console.error("Live Supabase smoke script verification failed:");
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Live Supabase smoke script verification passed.");
