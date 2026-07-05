# Supabase Folder

Supabase contains the free-first backend setup:

```text
migrations/   database schema and seed migrations
functions/    Edge Functions for secure backend jobs
```

Secrets such as `SUPABASE_SERVICE_ROLE_KEY` and `SCHEDULER_SECRET` must live in Supabase secrets or local shell environment only. They must never be exposed through the frontend.

## Operator Access

Portal writes are protected by `venue_members` RLS. After creating a Supabase Auth user, grant access from the SQL editor:

```sql
insert into public.venue_members (venue_id, user_id, role)
select 'ven_demo', id, 'owner'
from auth.users
where email = 'operator@example.com'
on conflict (venue_id, user_id) do update set role = excluded.role;
```

Use `owner` or `admin` for venue settings. Use `staff` for market product edits.
