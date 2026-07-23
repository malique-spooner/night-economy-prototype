import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = { ...readEnvFile(".env"), ...readEnvFile(".env.local"), ...process.env };
const venueSlug = env.NIGHT_ECONOMY_VENUE_SLUG ?? "demo-venue";
const email = env.VENUE_OPERATOR_EMAIL?.trim().toLowerCase();
const password = env.VENUE_OPERATOR_PASSWORD;
const supabaseUrl = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || isPlaceholder(serviceRoleKey)) {
  throw new Error("Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY before creating a venue operator.");
}

if (!email || !password) {
  throw new Error("Set VENUE_OPERATOR_EMAIL and VENUE_OPERATOR_PASSWORD for the shared venue login.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
  global: { fetch: fetchWithSecretKey },
});

const { data: venue, error: venueError } = await supabase
  .from("venues")
  .select("id, name")
  .eq("slug", venueSlug)
  .single();
throwIfError(venueError, "load venue");

const { data: existingMemberships, error: membershipError } = await supabase
  .from("venue_members")
  .select("user_id")
  .eq("venue_id", venue.id);
throwIfError(membershipError, "check existing venue access");

if (existingMemberships?.length) {
  throw new Error(`${venue.name} already has a venue operator. Refusing to create a second shared login.`);
}

const { data: users, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
throwIfError(usersError, "check whether the operator email already exists");

if (users.users.some(user => user.email?.toLowerCase() === email)) {
  throw new Error(`The operator email ${email} already exists. Use a different email or reset that account deliberately.`);
}

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
throwIfError(createError, "create shared venue operator");

if (!created.user) throw new Error("Supabase did not return the new venue operator.");

const { error: addMemberError } = await supabase
  .from("venue_members")
  .insert({ venue_id: venue.id, user_id: created.user.id, role: "owner" });

if (addMemberError) {
  await supabase.auth.admin.deleteUser(created.user.id);
  throw new Error(`Could not link the shared operator to ${venue.name}: ${addMemberError.message}`);
}

console.log(`Created the shared owner login for ${venue.name}: ${email}`);

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

function isPlaceholder(value) {
  return ["", "your_service_role_key_here", "..."].includes(value ?? "");
}

function throwIfError(error, action) {
  if (error) throw new Error(`Could not ${action}: ${error.message}`);
}

function fetchWithSecretKey(input, init = {}, fetchImpl = fetch) {
  const headers = new Headers(init.headers);
  headers.delete("authorization");
  return fetchImpl(input, { ...init, headers });
}
