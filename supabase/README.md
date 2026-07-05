# Supabase Folder

Supabase contains the free-first backend setup:

```text
migrations/   database schema and seed migrations
functions/    Edge Functions for secure backend jobs
```

Secrets such as `SUPABASE_SERVICE_ROLE_KEY` and `SCHEDULER_SECRET` must live in Supabase secrets or local shell environment only. They must never be exposed through the frontend.
