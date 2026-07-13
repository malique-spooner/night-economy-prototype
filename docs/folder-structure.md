# Folder Structure

Night Economy is now a React/Vite/TypeScript app with Supabase-backed production foundations.

## Current Rule

`index.html` is the Vite entrypoint and mounts `src/main.tsx`. Prototype runtime files are no longer part of the app.

## Structure

```text
night-econemy/
  index.html

  src/
    pages/
    components/
    engine/
    supabase/
    data/
    styles/
    assets/

  supabase/
    migrations/
    functions/
      market-cycle/

  public/
    _redirects

  docs/
    reference/
```

## Folder Jobs

`src/pages/`

React versions of full screens:

```text
Site.tsx
Tv.tsx
Menu.tsx
Portal.tsx
```

`src/components/`

Reusable React UI pieces that pages compose. Keep components page-adjacent at first. Do not create a large design system yet.

`src/engine/`

Pricing and market logic. This code should not import React or Supabase. It must stay easy to test.

`src/supabase/`

Supabase browser client and data access helpers.

`src/data/`

Seed and fallback data used when Supabase is not configured.

`src/styles/`

Production-owned CSS for the React app.

`src/assets/`

Production-owned images and media used by React pages.

`supabase/migrations/`

SQL schema and data migrations.

`supabase/functions/`

Edge Functions for backend-only work, starting with the market cycle.

`public/`

Cloudflare/Vite static hosting files such as `_redirects`.

Do not put documentation in `public/`, because Vite copies that folder into production output.

`docs/reference/`

Large vendor/API reference files that are useful for implementation but should not sit at the repo root.

## Route Shape

```text
/              public site
/venue/:slug   public site for a venue
/tv/:slug      venue TV display
/menu/:slug    guest menu
/app/:slug     operator portal
```
