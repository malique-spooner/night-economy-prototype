import { describe, expect, it } from "vitest";
import { buildPageSwitcherLinks } from "../../../src/pages/PageSwitcher";

describe("buildPageSwitcherLinks", () => {
  it("uses clean production routes for each surface", () => {
    expect(buildPageSwitcherLinks("demo-venue")).toEqual([
      { id: "site", label: "Site", href: "/venue/demo-venue" },
      { id: "tv", label: "TV", href: "/tv/demo-venue" },
      { id: "mobile", label: "Mobile", href: "/menu/demo-venue" },
      { id: "portal", label: "Portal", href: "/app/demo-venue" },
    ]);
  });

  it("URL-encodes venue slugs before putting them in links", () => {
    expect(buildPageSwitcherLinks("venue with spaces")[0].href).toBe("/venue/venue%20with%20spaces");
  });
});
