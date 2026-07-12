import { createClient } from "@supabase/supabase-js";
import { createSupabaseBrowserConfig } from "./config";

const supabaseConfig = createSupabaseBrowserConfig(import.meta.env);

export const supabaseStatus = {
  ready: supabaseConfig.ready,
  reason: supabaseConfig.reason,
};

export const supabase = supabaseStatus.ready
  ? createClient(supabaseConfig.url, supabaseConfig.publishableKey)
  : null;
