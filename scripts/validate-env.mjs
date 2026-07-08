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
  if (!key.startsWith("VITE_")) continue;

  if (/service_role/i.test(value ?? "") || hasServiceRoleJwtClaim(value)) {
    errors.push(`${key} appears to contain a service-role secret. Never expose service-role keys to the browser.`);
  }

  if (/^sb_secret_/i.test(value ?? "")) {
    errors.push(`${key} appears to contain a Supabase secret key. Use the publishable key in browser variables.`);
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
