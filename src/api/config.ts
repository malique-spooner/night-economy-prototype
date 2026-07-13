const placeholderValues = new Set(["", "...", "your_publishable_key_here"]);

export type SupabaseBrowserConfig = {
  publishableKey: string;
  ready: boolean;
  reason: string;
  url: string;
};

export function createSupabaseBrowserConfig(env: Record<string, string | boolean | undefined>): SupabaseBrowserConfig {
  const url = readString(env.VITE_SUPABASE_URL);
  const publishableKey = readString(env.VITE_SUPABASE_PUBLISHABLE_KEY);

  if (!url || placeholderValues.has(url)) {
    return disabledConfig(url, publishableKey, "Supabase URL is missing.");
  }

  if (!isValidSupabaseUrl(url)) {
    return disabledConfig(url, publishableKey, "Supabase URL must be a https://*.supabase.co URL.");
  }

  if (!publishableKey || placeholderValues.has(publishableKey)) {
    return disabledConfig(url, publishableKey, "Supabase publishable key is missing.");
  }

  if (looksLikeSecretKey(publishableKey)) {
    return disabledConfig(url, publishableKey, "Supabase publishable key looks like a secret key.");
  }

  return {
    publishableKey,
    ready: true,
    reason: "Supabase browser config is ready.",
    url,
  };
}

function disabledConfig(url: string, publishableKey: string, reason: string): SupabaseBrowserConfig {
  return {
    publishableKey,
    ready: false,
    reason,
    url,
  };
}

function readString(value: string | boolean | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function looksLikeSecretKey(value: string) {
  return /^sb_secret_/i.test(value) || /service_role/i.test(value) || hasServiceRoleJwtClaim(value);
}

function hasServiceRoleJwtClaim(value: string) {
  const parts = value.split(".");
  if (parts.length < 2) return false;

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as { role?: string };
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  if (typeof globalThis.atob === "function") return globalThis.atob(padded);

  throw new Error("Base64 decoding is not available.");
}
