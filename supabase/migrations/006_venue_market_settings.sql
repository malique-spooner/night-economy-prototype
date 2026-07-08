alter table public.venues
  add column if not exists market_live boolean not null default false,
  add column if not exists crash_interval_minutes integer not null default 30,
  add column if not exists launch_date date not null default current_date,
  add column if not exists launch_start_time time not null default time '20:00',
  add column if not exists launch_end_time time not null default time '01:00';

do $$
begin
  alter table public.venues
    add constraint venues_crash_interval_minutes_check
    check (crash_interval_minutes in (15, 30, 60, 120));
exception
  when duplicate_object then null;
end $$;

grant update (
  market_live,
  crash_interval_minutes,
  launch_date,
  launch_start_time,
  launch_end_time,
  updated_at
) on public.venues to authenticated;
