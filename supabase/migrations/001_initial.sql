create table if not exists public.venues (
  id text primary key,
  slug text not null unique,
  name text not null,
  timezone text not null default 'Europe/London',
  currency text not null default 'GBP',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.market_products (
  id text primary key,
  venue_id text not null references public.venues(id) on delete cascade,
  market_symbol text not null,
  display_name text not null,
  category text not null,
  base_price_minor integer not null,
  current_price_minor integer not null,
  floor_price_minor integer not null,
  ceiling_price_minor integer not null,
  is_live boolean not null default true,
  is_sold_out boolean not null default false,
  priority boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, market_symbol),
  check (floor_price_minor <= current_price_minor),
  check (current_price_minor <= ceiling_price_minor)
);

create table if not exists public.market_price_snapshots (
  id text primary key,
  venue_id text not null references public.venues(id) on delete cascade,
  reason text not null,
  status text not null default 'published',
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigserial primary key,
  venue_id text references public.venues(id) on delete cascade,
  actor_id uuid,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.venues enable row level security;
alter table public.market_products enable row level security;
alter table public.market_price_snapshots enable row level security;
alter table public.audit_log enable row level security;

create policy "public can read venues"
  on public.venues for select
  using (true);

create policy "public can read market products"
  on public.market_products for select
  using (true);

create policy "public can read market snapshots"
  on public.market_price_snapshots for select
  using (true);

insert into public.venues (id, slug, name)
values ('ven_demo', 'demo-venue', 'Demo Venue')
on conflict (id) do nothing;

insert into public.market_products
  (id, venue_id, market_symbol, display_name, category, base_price_minor, current_price_minor, floor_price_minor, ceiling_price_minor, priority)
values
  ('mp_cem', 'ven_demo', 'CEM', 'Classic Espresso Martini', 'classic-cocktails', 1200, 1200, 800, 1800, true),
  ('mp_cmar', 'ven_demo', 'CMAR', 'Classic Margarita', 'classic-cocktails', 1200, 1200, 800, 1800, false),
  ('mp_t75', 'ven_demo', 'T75', 'The 75th Peel', 'signature-cocktails', 1400, 1400, 950, 2100, false),
  ('mp_wb', 'ven_demo', 'WB', 'Woodland Bloom', 'mocktails', 800, 800, 600, 1100, false)
on conflict (id) do nothing;
