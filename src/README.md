# Source Folder

This folder contains the production TypeScript app that will gradually replace the prototype.

Do not make `src/main.tsx` the main user-facing entrypoint until the migrated page matches the prototype. For now, `index.html` remains the visible app and `src/` is the production foundation.

Minimal folders:

```text
pages       full screen React pages
components  reusable React UI, added only when a page genuinely needs it
engine      pricing/business logic
supabase    database/auth access
data        seed fallback data
```

Page rule:

```text
pages/Foo.tsx should compose sections.
components/foo/* should hold the readable section markup.
```

Current component groups:

```text
components/site    site/landing sections
components/tv      room display sections
components/mobile  customer menu sections
components/portal  operator portal sections
```

Avoid recreating the old `pages.js` pattern as one large TSX file.
