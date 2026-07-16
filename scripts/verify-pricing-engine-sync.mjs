import { readFileSync } from "node:fs";

const frontendSource = readFileSync("src/engine/pricing.ts", "utf8");
const edgeFunctionSource = readFileSync("supabase/functions/market-cycle/index.ts", "utf8");
const simulatorRunnerSource = readFileSync("pos-simulator/src/marketPricing.mjs", "utf8");

const sharedSnippets = [
  {
    label: "price step",
    pattern: /const STEP_MINOR = 50;/,
  },
  {
    label: "strong sales threshold",
    pattern: /sales(?:_velocity|Velocity) >= 7/,
  },
  {
    label: "soft sales threshold",
    pattern: /sales(?:_velocity|Velocity) <= 2/,
  },
  {
    label: "non-tradable hold reason",
    pattern: /Product is not currently tradable\./,
  },
  {
    label: "up movement reason",
    pattern: /Strong recent sales velocity pushed the price up one step\./,
  },
  {
    label: "down movement reason",
    pattern: /Soft recent sales velocity pulled the price down one step\./,
  },
  {
    label: "floor hold reason",
    pattern: /Price held at the product floor\./,
  },
  {
    label: "ceiling hold reason",
    pattern: /Price held at the product ceiling\./,
  },
  {
    label: "steady hold reason",
    pattern: /Sales velocity was steady, so the price held\./,
  },
];

const failures = sharedSnippets.flatMap(({ label, pattern }) => {
  const missing = [];
  if (!pattern.test(frontendSource)) missing.push(`src/engine/pricing.ts missing ${label}.`);
  if (!pattern.test(edgeFunctionSource)) missing.push(`supabase/functions/market-cycle/index.ts missing ${label}.`);
  if (!pattern.test(simulatorRunnerSource)) missing.push(`pos-simulator/src/marketPricing.mjs missing ${label}.`);
  return missing;
});

if (failures.length) {
  console.error("Pricing engine sync verification failed:");
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Pricing engine sync verification passed.");
