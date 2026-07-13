import { describe, expect, it } from "vitest";
import { createSupabaseBrowserConfig } from "./config";

describe("createSupabaseBrowserConfig", () => {
  it("enables Supabase only when the public URL and publishable key are configured", () => {
    expect(
      createSupabaseBrowserConfig({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      }),
    ).toEqual({
      publishableKey: "sb_publishable_test",
      ready: true,
      reason: "Supabase browser config is ready.",
      url: "https://example.supabase.co",
    });
  });

  it("keeps the seed fallback active when the publishable key is still a placeholder", () => {
    expect(
      createSupabaseBrowserConfig({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "your_publishable_key_here",
      }),
    ).toMatchObject({
      ready: false,
      reason: "Supabase publishable key is missing.",
    });
  });

  it("rejects non-Supabase URLs", () => {
    expect(
      createSupabaseBrowserConfig({
        VITE_SUPABASE_URL: "https://example.com",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      }),
    ).toMatchObject({
      ready: false,
      reason: "Supabase URL must be a https://*.supabase.co URL.",
    });
  });

  it("rejects secret keys in browser config", () => {
    expect(
      createSupabaseBrowserConfig({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_do_not_ship",
      }),
    ).toMatchObject({
      ready: false,
      reason: "Supabase publishable key looks like a secret key.",
    });
  });
});
