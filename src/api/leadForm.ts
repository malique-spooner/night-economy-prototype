import type { SiteLeadPayload, SiteLeadPlan } from "./leads";

export type SiteLeadFormInput = {
  venueName: string;
  ownerName: string;
  email: string;
  plan: string;
};

export type SiteLeadFormResult =
  | { ok: true; payload: SiteLeadPayload }
  | { ok: false; message: string };

const allowedPlans = new Set<SiteLeadPlan>(["starter", "growth", "premium"]);
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function prepareSiteLead(input: SiteLeadFormInput): SiteLeadFormResult {
  const payload = {
    venueName: input.venueName.trim(),
    ownerName: input.ownerName.trim(),
    email: input.email.trim().toLowerCase(),
    plan: input.plan,
  };

  if (!payload.venueName || !payload.ownerName || !payload.email) {
    return { ok: false, message: "Add the venue, owner, and email before submitting." };
  }

  if (!emailPattern.test(payload.email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  if (!isSiteLeadPlan(payload.plan)) {
    return { ok: false, message: "Choose a valid plan." };
  }

  return {
    ok: true,
    payload: {
      venueName: payload.venueName,
      ownerName: payload.ownerName,
      email: payload.email,
      plan: payload.plan,
    },
  };
}

function isSiteLeadPlan(value: string): value is SiteLeadPlan {
  return allowedPlans.has(value as SiteLeadPlan);
}
