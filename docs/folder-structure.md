# Folder Structure

Night Economy is migrating from a static prototype to a production-shaped app without losing the prototype UI.

## Current Rule

`index.html` is still the main visible app. It loads the prototype runtime from `legacy/prototype/`:

```text
legacy/prototype/styles.css
legacy/prototype/data.js
legacy/prototype/shared.js
legacy/prototype/pages.js
legacy/prototype/home.js
legacy/prototype/crash.js
```

The production folders below are introduced behind the scenes. A page should only replace the prototype version when it visually matches and has the required data/auth behavior.

## Structure

```text
night-economy-prototype/
  index.html

  legacy/
    prototype/
      styles.css
      data.js
      shared.js
      pages.js
      home.js
      crash.js

  src/
    pages/
    components/
    engine/
    supabase/
    data/

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

Future React versions of full screens:

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

`supabase/migrations/`

SQL schema and data migrations.

`supabase/functions/`

Edge Functions for backend-only work, starting with the market cycle.

`public/`

Cloudflare/Vite static hosting files such as `_redirects`.

Do not put documentation in `public/`, because Vite copies that folder into production output.

`docs/reference/`

Large vendor/API reference files that are useful for implementation but should not sit at the repo root.

## Migration Order

1. Keep `/` as the prototype.
2. Move reusable business logic into `src/engine/`.
3. Connect the prototype data shape to Supabase behind the scenes.
4. Rebuild one page in React.
5. Compare it against the prototype.
6. Swap traffic only when it matches.

Recommended first page: `Portal`, because it needs the production data model most and is less visually risky than the TV board.
