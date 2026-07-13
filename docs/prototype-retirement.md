# Prototype Retirement

The old static prototype runtime has been removed. The React app now owns the visible entrypoint.

## Current State

React routes import production-owned CSS from:

```text
src/styles/app.css
```

The old static data, shared helpers, page runtime, home runtime, crash runtime, and prototype stylesheet are no longer shipped by the app.

## Follow-Up

The remaining work is product hardening, Supabase connection, and visual QA. Do not reintroduce prototype runtime files; new page behavior should live in `src/` with focused tests.
