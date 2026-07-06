import { describe, expect, it } from "vitest";
import { resolveAppRoute } from "./routes";

describe("resolveAppRoute", () => {
  it("keeps the prototype preview query params working", () => {
    expect(resolveAppRoute("/react-preview.html", "?view=site")).toEqual({ surface: "site" });
    expect(resolveAppRoute("/react-preview.html", "?view=tv")).toEqual({ surface: "tv", slug: "demo-venue" });
    expect(resolveAppRoute("/react-preview.html", "?view=mobile")).toEqual({ surface: "menu", slug: "demo-venue" });
    expect(resolveAppRoute("/react-preview.html", "?view=portal")).toEqual({ surface: "app", slug: "demo-venue" });
  });

  it("supports production venue routes", () => {
    expect(resolveAppRoute("/tv/soho-house")).toEqual({ surface: "tv", slug: "soho-house" });
    expect(resolveAppRoute("/menu/soho-house")).toEqual({ surface: "menu", slug: "soho-house" });
    expect(resolveAppRoute("/app/soho-house")).toEqual({ surface: "app", slug: "soho-house" });
    expect(resolveAppRoute("/venue/soho-house")).toEqual({ surface: "venue", slug: "soho-house" });
  });

  it("falls back to the public site", () => {
    expect(resolveAppRoute("/")).toEqual({ surface: "site" });
    expect(resolveAppRoute("/not-a-real-route")).toEqual({ surface: "site" });
    expect(resolveAppRoute("/react-preview.html", "?view=unknown")).toEqual({ surface: "site" });
  });
});
