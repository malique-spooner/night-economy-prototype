# Deployment Checklist

Use this order when taking the prototype-shaped app toward a real deployment.

## 1. Local Gates

```bash
npm install
npm run check
```

For a production build, also verify the real public Supabase variables:

```bash
npm run build:production
```

`build:production` requires:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Never put `SUPABASE_SERVICE_ROLE_KEY` or `SCHEDULER_SECRET` in Cloudflare Pages frontend variables.

## 2. Supabase SQL

Print the reviewed SQL bundle:

```bash
npm run supabase:sql
```

Apply the output in the Supabase SQL editor for the target project. The bundle includes:

```text
001_initial.sql
002_auth_rls.sql
003_realtime_market.sql
004_site_leads.sql
005_market_sales_velocity.sql
```

After applying SQL, create a Supabase Auth operator user and grant access with the `venue_members` insert shown in `supabase/README.md`.

## 3. Supabase Edge Function

Set Supabase function secrets:

```text
SUPABASE_SERVICE_ROLE_KEY
SCHEDULER_SECRET
```

Deploy the market job from an environment with the Supabase CLI and Deno available:

```bash
supabase functions deploy market-cycle
```

Invoke it only with the scheduler header:

```text
x-night-economy-scheduler-secret: <SCHEDULER_SECRET>
```

## 4. Cloudflare Pages

Cloudflare Pages config is in `wrangler.jsonc`.

Use:

```text
Build command: npm run build:production
Build output: dist
Node.js: 22+
```

Set only these frontend variables in Cloudflare Pages:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

`public/_redirects` keeps `/` on the prototype while production routes such as `/tv/*`, `/menu/*`, `/app/*`, and `/venue/*` load the React app.

## 5. Post-Deploy Smoke

Check:

```text
/
/react-preview.html?view=site
/react-preview.html?view=tv
/react-preview.html?view=mobile
/react-preview.html?view=portal
/tv/demo-venue
/menu/demo-venue
/app/demo-venue
```

Then test one real signup lead and one portal product edit against Supabase.
