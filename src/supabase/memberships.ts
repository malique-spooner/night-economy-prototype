import { supabase } from "./client";

export type VenueMemberRole = "owner" | "admin" | "staff";

type VenueMemberRow = {
  role: VenueMemberRole;
};

export async function getVenueMemberRole(venueId: string): Promise<VenueMemberRole | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("venue_members")
    .select("role")
    .eq("venue_id", venueId)
    .maybeSingle<VenueMemberRow>();

  if (error) throw error;
  return data?.role ?? null;
}
