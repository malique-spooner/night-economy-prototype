import { readFileSync } from "node:fs";

const frontendSource = readFileSync("src/engine/pricing.ts", "utf8");
const edgeFunctionSource = readFileSync("supabase/functions/market-cycle/index.ts", "utf8");
const simulatorRunnerSource = readFileSync("pos-simulator/src/marketPricing.mjs", "utf8");

const sharedSnippets = [
  {
    label: "range-aware market intensity setting",
    pattern: /const MARKET_INTENSITY = 1\.25;/,
  },
  {
    label: "zero-sum market points",
    pattern: /marketPoints = .*ownUnits - categoryUnits/,
  },
  {
    label: "activity-aware range movement",
    pattern: /activityFactor[\s\S]+allowedRange[\s\S]+percentageChange/,
  },
  {
    label: "non-tradable hold reason",
    pattern: /Product is not currently tradable\./,
  },
  {
    label: "category peer reason",
    pattern: /category peers/,
  },
  {
    label: "balanced hold reason",
    pattern: /Orders were evenly balanced within this category, so the price held\./,
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
