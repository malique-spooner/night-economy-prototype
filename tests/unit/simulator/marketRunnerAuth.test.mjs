import { describe, expect, it } from "vitest";
import { fetchWithSecretKey } from "../../../pos-simulator/market-runner.mjs";

describe("market runner secret-key authentication", () => {
  it("keeps the API key and removes the incompatible Bearer secret", async () => {
    let capturedInit;
    await fetchWithSecretKey(
      "https://example.supabase.co/rest/v1/venues",
      {
        headers: {
          apikey: "sb_secret_test",
          authorization: "Bearer sb_secret_test",
        },
      },
      async (_input, init) => {
        capturedInit = init;
        return new Response("[]", { status: 200 });
      },
    );

    const headers = new Headers(capturedInit.headers);
    expect(headers.get("apikey")).toBe("sb_secret_test");
    expect(headers.get("authorization")).toBeNull();
  });
});
