create table if not exists public.pos_connections (
  id text primary key,
  venue_id text not null references public.venues(id) on delete cascade,
  provider text not null check (provider in ('simulator', 'lightspeed')),
  base_url text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, provider)
);

create table if not exists public.pos_products (
  id text primary key,
  venue_id text not null references public.venues(id) on delete cascade,
  pos_connection_id text not null references public.pos_connections(id) on delete cascade,
  external_id text not null,
  sku text not null,
  source_name text not null,
  base_price_minor integer not null check (base_price_minor >= 0),
  current_price_minor integer not null check (current_price_minor >= 0),
  currency text not null default 'GBP',
  is_available boolean not null default true,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pos_connection_id, external_id)
);

alter table public.market_products
  add column if not exists pos_product_id text references public.pos_products(id);

create unique index if not exists market_products_pos_product_id_unique
  on public.market_products (pos_product_id)
  where pos_product_id is not null;

create table if not exists public.pos_sales_events (
  id text primary key,
  venue_id text not null references public.venues(id) on delete cascade,
  pos_connection_id text not null references public.pos_connections(id) on delete cascade,
  pos_product_id text not null references public.pos_products(id) on delete restrict,
  occurred_at timestamptz not null,
  quantity integer not null check (quantity > 0),
  unit_price_minor integer not null check (unit_price_minor >= 0),
  currency text not null default 'GBP',
  received_at timestamptz not null default now()
);

create index if not exists pos_sales_events_venue_occurred_at_idx
  on public.pos_sales_events (venue_id, occurred_at desc);

create table if not exists public.price_publications (
  id text primary key,
  venue_id text not null references public.venues(id) on delete cascade,
  pos_connection_id text not null references public.pos_connections(id) on delete restrict,
  reason text not null,
  status text not null check (status in ('pending', 'published', 'partial_failure', 'failed')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.price_publication_lines (
  id bigserial primary key,
  publication_id text not null references public.price_publications(id) on delete cascade,
  market_product_id text not null references public.market_products(id) on delete restrict,
  pos_product_id text not null references public.pos_products(id) on delete restrict,
  old_price_minor integer not null check (old_price_minor >= 0),
  new_price_minor integer not null check (new_price_minor >= 0),
  status text not null check (status in ('pending', 'published', 'failed')),
  response jsonb not null default '{}'::jsonb
);

alter table public.pos_connections enable row level security;
alter table public.pos_products enable row level security;
alter table public.pos_sales_events enable row level security;
alter table public.price_publications enable row level security;
alter table public.price_publication_lines enable row level security;

grant select on public.pos_connections, public.pos_products to authenticated;

drop policy if exists "venue members can read POS connections" on public.pos_connections;
create policy "venue members can read POS connections"
  on public.pos_connections for select
  to authenticated
  using (
    exists (
      select 1
      from public.venue_members vm
      where vm.venue_id = pos_connections.venue_id
        and vm.user_id = (select auth.uid())
    )
  );

drop policy if exists "venue members can read POS products" on public.pos_products;
create policy "venue members can read POS products"
  on public.pos_products for select
  to authenticated
  using (
    exists (
      select 1
      from public.venue_members vm
      where vm.venue_id = pos_products.venue_id
        and vm.user_id = (select auth.uid())
    )
  );

insert into public.pos_connections (id, venue_id, provider, base_url)
values ('pos_sim_demo', 'ven_demo', 'simulator', 'http://127.0.0.1:3002')
on conflict (id) do nothing;

insert into public.pos_products (
  id,
  venue_id,
  pos_connection_id,
  external_id,
  sku,
  source_name,
  base_price_minor,
  current_price_minor,
  currency,
  is_available
)
select
  'pos_' || mp.id,
  mp.venue_id,
  'pos_sim_demo',
  'pos_' || lower(mp.market_symbol),
  mp.market_symbol,
  mp.display_name,
  mp.base_price_minor,
  mp.current_price_minor,
  v.currency,
  not mp.is_sold_out
from public.market_products mp
join public.venues v on v.id = mp.venue_id
where mp.venue_id = 'ven_demo'
on conflict (id) do nothing;

update public.market_products mp
set pos_product_id = pp.id
from public.pos_products pp
where pp.venue_id = mp.venue_id
  and pp.external_id = mp.id
  and mp.pos_product_id is null;
