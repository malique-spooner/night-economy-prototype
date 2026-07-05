import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseStatus = {
  ready: Boolean(supabaseUrl && supabasePublishableKey),
};

export const supabase = supabaseStatus.ready ? createClient(supabaseUrl, supabasePublishableKey) : null;
