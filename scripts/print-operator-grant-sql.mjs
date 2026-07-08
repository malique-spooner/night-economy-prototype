const args = parseArgs(process.argv.slice(2));

const email = args.email ?? process.env.OPERATOR_EMAIL ?? "";
const role = args.role ?? process.env.OPERATOR_ROLE ?? "owner";
const venueId = args.venue ?? process.env.VENUE_ID ?? "ven_demo";

const errors = [];
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  errors.push("Provide an operator email with --email=operator@example.com or OPERATOR_EMAIL.");
}

if (!["owner", "admin", "staff"].includes(role)) {
  errors.push("Role must be owner, admin, or staff.");
}

if (!/^[a-zA-Z0-9_-]+$/.test(venueId)) {
  errors.push("Venue id may only contain letters, numbers, underscores, and hyphens.");
}

if (errors.length) {
  console.error("Could not print operator grant SQL:");
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log("-- Grant Night Economy portal access to an existing Supabase Auth user.");
console.log("-- Run this in the Supabase SQL editor after creating the Auth user.");
console.log("");
console.log("insert into public.venue_members (venue_id, user_id, role)");
console.log(`select '${escapeSqlLiteral(venueId)}', id, '${escapeSqlLiteral(role)}'`);
console.log("from auth.users");
console.log(`where email = '${escapeSqlLiteral(email.toLowerCase())}'`);
console.log("on conflict (venue_id, user_id) do update set role = excluded.role;");
console.log("");
console.log("-- Expected affected rows: 1. If 0 rows are affected, create the Auth user first or check the email.");

function parseArgs(values) {
  return Object.fromEntries(
    values
      .filter(value => value.startsWith("--") && value.includes("="))
      .map(value => {
        const [key, ...rest] = value.slice(2).split("=");
        return [key, rest.join("=")];
      }),
  );
}

function escapeSqlLiteral(value) {
  return String(value).replace(/'/g, "''");
}
