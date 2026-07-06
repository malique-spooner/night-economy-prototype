import { describe, expect, it } from "vitest";
import { prepareSiteLead } from "./leadForm";

describe("prepareSiteLead", () => {
  it("normalizes valid lead form input", () => {
    expect(
      prepareSiteLead({
        venueName: "  Pickle House Shoreditch  ",
        ownerName: "  Alex Morgan ",
        email: " OWNER@VENUE.COM ",
        plan: "growth",
      }),
    ).toEqual({
      ok: true,
      payload: {
        venueName: "Pickle House Shoreditch",
        ownerName: "Alex Morgan",
        email: "owner@venue.com",
        plan: "growth",
      },
    });
  });

  it("rejects missing required fields", () => {
    expect(
      prepareSiteLead({
        venueName: "",
        ownerName: "Alex Morgan",
        email: "owner@venue.com",
        plan: "growth",
      }),
    ).toEqual({ ok: false, message: "Add the venue, owner, and email before submitting." });
  });

  it("rejects invalid email addresses", () => {
    expect(
      prepareSiteLead({
        venueName: "Pickle House",
        ownerName: "Alex Morgan",
        email: "not-an-email",
        plan: "growth",
      }),
    ).toEqual({ ok: false, message: "Enter a valid email address." });
  });

  it("rejects unknown plans", () => {
    expect(
      prepareSiteLead({
        venueName: "Pickle House",
        ownerName: "Alex Morgan",
        email: "owner@venue.com",
        plan: "enterprise",
      }),
    ).toEqual({ ok: false, message: "Choose a valid plan." });
  });
});
