create table if not exists public.venue_members (
  venue_id text not null references public.venues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff',
  created_at timestamptz not null default now(),
  primary key (venue_id, user_id),
  check (role in ('owner', 'admin', 'staff'))
);

alter table public.venue_members enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.venues to anon, authenticated;
grant select on public.market_products to anon, authenticated;
grant select on public.market_price_snapshots to anon, authenticated;
grant select on public.venue_members to authenticated;
grant update (
  display_name,
  category,
  base_price_minor,
  current_price_minor,
  floor_price_minor,
  ceiling_price_minor,
  is_live,
  is_sold_out,
  priority,
  updated_at
) on public.market_products to authenticated;
grant update (
  name,
  timezone,
  currency,
  updated_at
) on public.venues to authenticated;

drop policy if exists "members can read their memberships" on public.venue_members;
create policy "members can read their memberships"
  on public.venue_members for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "venue members can update their venues" on public.venues;
create policy "venue members can update their venues"
  on public.venues for update
  to authenticated
  using (
    exists (
      select 1
      from public.venue_members vm
      where vm.venue_id = venues.id
        and vm.user_id = (select auth.uid())
        and vm.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.venue_members vm
      where vm.venue_id = venues.id
        and vm.user_id = (select auth.uid())
        and vm.role in ('owner', 'admin')
    )
  );

drop policy if exists "venue members can update market products" on public.market_products;
create policy "venue members can update market products"
  on public.market_products for update
  to authenticated
  using (
    exists (
      select 1
      from public.venue_members vm
      where vm.venue_id = market_products.venue_id
        and vm.user_id = (select auth.uid())
        and vm.role in ('owner', 'admin', 'staff')
    )
  )
  with check (
    exists (
      select 1
      from public.venue_members vm
      where vm.venue_id = market_products.venue_id
        and vm.user_id = (select auth.uid())
        and vm.role in ('owner', 'admin', 'staff')
    )
  );
