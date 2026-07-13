# Prototype Retirement Plan

The goal is to remove `legacy/prototype/` completely once the React app owns every visible page.

## Current State

React routes now import production-owned CSS from:

```text
src/styles/app.css
```

The original prototype files still power `/`:

```text
index.html
legacy/prototype/data.js
legacy/prototype/shared.js
legacy/prototype/pages.js
legacy/prototype/home.js
legacy/prototype/crash.js
```

## Removal Order

1. Keep `/` on the prototype until the React site page is visually accepted.
2. Move shared styles and assets into `src/`.
3. Move any remaining page behavior from prototype JS into React components or tested helpers.
4. Change `/` to load the React app.
5. Delete `legacy/prototype/` and remove the legacy copy plugin from `vite.config.ts`.

Do not delete prototype files until `/`, `/venue/*`, `/tv/*`, `/menu/*`, and `/app/*` are all served by React.
