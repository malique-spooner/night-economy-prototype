# Night Economy

Production-shaped migration repo for the Night Economy pilot.

The current visible app is still the original static prototype at `index.html`. Its runtime files live in
`legacy/prototype/`. The React/Vite/Supabase files under `src/` and `supabase/` are the behind-the-scenes production
foundation and should be wired in one page at a time.

## Stack

- React + Vite + TypeScript
- Cloudflare Pages for frontend hosting
- Supabase Postgres/Auth for backend, data, and login
- Supabase Edge Functions for market jobs
- Vitest for pricing engine tests

See [docs/folder-structure.md](docs/folder-structure.md) for the migration folder layout.
See [docs/deployment.md](docs/deployment.md) for the ordered Supabase and Cloudflare deployment checklist.

## Run Locally

```bash
npm install
npm run dev
```

Use Node.js 22 or newer. `.nvmrc` is set to `22` for local shells that use `nvm`.

Open the current prototype:

```text
http://127.0.0.1:5173/
http://127.0.0.1:5173/?view=tv
http://127.0.0.1:5173/?view=mobile
http://127.0.0.1:5173/?view=site
http://127.0.0.1:5173/?view=portal
```

Migration rule: keep the prototype looking correct on `/` while production code is introduced behind the scenes.

## Environment

Create `.env.local` from `.env.example`:

```text
VITE_SUPABASE_URL=https://ghhfmsmmwyycuwauvppg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Only use these in local setup scripts or Supabase Edge Function secrets:

```text
SUPABASE_SERVICE_ROLE_KEY=...
SCHEDULER_SECRET=...
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in the browser or Cloudflare Pages frontend variables.
`npm run check:env` rejects service-role JWTs and Supabase secret keys in any `VITE_` browser variable.

## Cloudflare Pages

Cloudflare Pages config lives in `wrangler.jsonc`:

```text
name: night-economy-prototype
pages_build_output_dir: ./dist
```

Build command:

```bash
npm run build:production
```

Build output directory:

```text
dist
```

Frontend variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Local prototype builds can still use `npm run build`. Production deploys should use `npm run build:production` so missing Supabase config fails before Cloudflare publishes the site.

`public/_redirects` keeps `/` on the current prototype while serving React routes for `/tv/*`, `/menu/*`, `/app/*`, and `/venue/*`.

Local `npm run check` verifies the Cloudflare config with `npm run cloudflare:config`.

## Pre-Deploy Check

Run this before pushing a deploy branch:

```bash
npm run smoke:preview
```

It builds the app, starts Vite's production preview server, and checks the current prototype plus the four React migration views.
It also validates the Cloudflare Pages redirect order so production venue routes hit the React app before the prototype catch-all.
