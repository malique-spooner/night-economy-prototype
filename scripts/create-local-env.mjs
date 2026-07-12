import { existsSync, readFileSync, writeFileSync } from "node:fs";

const outputPath = process.env.ENV_OUTPUT_PATH || ".env.local";
const force = process.argv.includes("--force");

if (existsSync(outputPath) && !force) {
  console.log(`${outputPath} already exists. Leaving it untouched.`);
  console.log("Use npm run setup:env -- --force to recreate it from .env.example.");
  process.exit(0);
}

const example = readFileSync(".env.example", "utf8");
writeFileSync(outputPath, example);

console.log(`Created ${outputPath} from .env.example.`);
console.log("Fill in VITE_SUPABASE_PUBLISHABLE_KEY, then run npm run supabase:status.");
