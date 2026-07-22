import { readFileSync } from "node:fs";

const functionFiles = ["supabase/functions/market-cycle/index.ts"];
const checks = [
  {
    label: "requires scheduler secret header support",
    pattern: /x-night-economy-scheduler-secret/,
  },
  {
    label: "reads a modern server key only inside Edge Function",
    pattern: /SUPABASE_SECRET_KEYS[\s\S]+SUPABASE_SERVICE_ROLE_KEY/,
  },
  {
    label: "uses modern key authentication without a Bearer secret",
    pattern: /apikey: serviceRoleKey/,
  },
  {
    label: "requires scheduler secret configuration",
    pattern: /SCHEDULER_SECRET is not configured/,
  },
  {
    label: "wraps handler errors as JSON",
    pattern: /catch \(error\)[\s\S]+return json\(\{ error:/,
  },
  {
    label: "checks Supabase REST response status",
    pattern: /if \(!response\.ok\)/,
  },
  {
    label: "writes market price snapshots",
    pattern: /market_price_snapshots/,
  },
  {
    label: "uses the range-aware market setting",
    pattern: /MARKET_INTENSITY = 1\.25[\s\S]+activityFactor[\s\S]+allowedRange/,
  },
  {
    label: "uses a fifteen-minute POS sales round",
    pattern: /cycleEnd\.getTime\(\) - 15 \* 60_000/,
  },
  {
    label: "respects venue market live state",
    pattern: /market_live[\s\S]+Market is paused for this venue/,
  },
];

const forbiddenPatterns = [
  {
    label: "hard-coded Supabase service key",
    pattern: /eyJhbGciOi|service_role_[a-z0-9]{16,}/i,
  },
  {
    label: "local Supabase URL in deployed function",
    pattern: /localhost:54321|127\.0\.0\.1:54321/,
  },
];

for (const file of functionFiles) {
  const source = readFileSync(file, "utf8");
  const failures = [
    ...checks
      .filter(check => !check.pattern.test(source))
      .map(check => `${file}: missing ${check.label}`),
    ...forbiddenPatterns
      .filter(check => check.pattern.test(source))
      .map(check => `${file}: contains ${check.label}`),
  ];

  if (failures.length) {
    console.error("Supabase function verification failed:");
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
  }
}

console.log("Supabase function verification passed.");
