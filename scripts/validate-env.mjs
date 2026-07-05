import { existsSync, readFileSync } from "node:fs";

const env = {
  ...readEnvFile(".env"),
  ...readEnvFile(".env.local"),
  ...process.env,
};

const requiredPublicVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
const placeholderValues = new Set(["", "...", "your_publishable_key_here"]);
const errors = [];

for (const key of requiredPublicVars) {
  const value = env[key]?.trim() ?? "";
  if (!value || placeholderValues.has(value)) {
    errors.push(`${key} is missing or still a placeholder.`);
  }
}

if (env.VITE_SUPABASE_URL && !isValidSupabaseUrl(env.VITE_SUPABASE_URL)) {
  errors.push("VITE_SUPABASE_URL must be a valid Supabase project URL.");
}

for (const [key, value] of Object.entries(env)) {
  if (key.startsWith("VITE_") && /service_role/i.test(value ?? "")) {
    errors.push(`${key} appears to contain a service-role secret. Never expose service-role keys to the browser.`);
  }
}

if (errors.length) {
  console.error("Environment validation failed:");
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Environment validation passed.");

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
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function isValidSupabaseUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}
