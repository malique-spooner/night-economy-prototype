import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = { ...readEnvFile(".env"), ...readEnvFile(".env.local"), ...process.env };
const email = env.VENUE_OPERATOR_EMAIL?.trim();
const password = env.VENUE_OPERATOR_PASSWORD;
const supabaseUrl = env.VITE_SUPABASE_URL ?? env.SUPABASE_URL;
const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !publishableKey || !email || !password) {
  throw new Error("Set VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VENUE_OPERATOR_EMAIL, and VENUE_OPERATOR_PASSWORD.");
}

const supabase = createClient(supabaseUrl, publishableKey, { auth: { persistSession: false } });
const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
throwIfError(signInError, "sign in as the venue operator");

const userId = signIn.user?.id;
if (!userId) throw new Error("Supabase did not return the signed-in operator.");

const { data: membership, error: membershipError } = await supabase
  .from("venue_members")
  .select("venue_id, role")
  .eq("user_id", userId)
  .single();
throwIfError(membershipError, "read the operator's venue membership");

if (membership.role !== "owner") throw new Error(`Expected owner access, received ${membership.role}.`);

console.log(`Verified shared venue operator sign-in and ${membership.role} access.`);

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#") && line.includes("="))
    .map(line => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")];
    }));
}

function throwIfError(error, action) {
  if (error) throw new Error(`Could not ${action}: ${error.message}`);
}
