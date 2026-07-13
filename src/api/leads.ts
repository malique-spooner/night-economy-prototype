import { supabase } from "./client";

export type SiteLeadPlan = "starter" | "growth" | "premium";

export type SiteLeadPayload = {
  venueName: string;
  ownerName: string;
  email: string;
  plan: SiteLeadPlan;
};

export async function createSiteLead(payload: SiteLeadPayload) {
  if (!supabase) return { persisted: false as const };

  const { error } = await supabase.from("site_leads").insert({
    venue_name: payload.venueName.trim(),
    owner_name: payload.ownerName.trim(),
    email: payload.email.trim().toLowerCase(),
    plan: payload.plan,
    source: "site_signup",
  });

  if (error) throw error;

  return { persisted: true as const };
}
