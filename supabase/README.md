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

## Realtime

`003_realtime_market.sql` adds `venues` and `market_products` to the `supabase_realtime` publication. This lets the TV board, mobile menu, and portal refresh from the same live market state after a product or venue row changes.

## Apply Order

Apply migrations in order:

```text
001_initial.sql
002_auth_rls.sql
003_realtime_market.sql
004_site_leads.sql
005_market_sales_velocity.sql
```

`004_site_leads.sql` creates the public site lead capture table. It allows anonymous inserts only; public clients cannot read submitted leads.
`005_market_sales_velocity.sql` adds the velocity input used by the market-cycle job.

To print one reviewed SQL bundle for the Supabase SQL editor:

```bash
npm run supabase:sql
```

Then set these public frontend variables in `.env.local` and Cloudflare Pages:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Run `npm run check:env` before production deployment.
