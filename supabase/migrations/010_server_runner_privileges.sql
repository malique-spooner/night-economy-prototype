-- The local market runner and scheduled Edge Function use the server-only
-- service_role. It bypasses RLS but still needs table privileges after a
-- clean schema reset.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
