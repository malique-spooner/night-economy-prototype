grant insert (
  id,
  venue_id,
  market_symbol,
  display_name,
  category,
  base_price_minor,
  current_price_minor,
  floor_price_minor,
  ceiling_price_minor,
  sales_velocity,
  is_live,
  is_sold_out,
  priority
) on public.market_products to authenticated;

drop policy if exists "venue members can insert market products" on public.market_products;
create policy "venue members can insert market products"
  on public.market_products for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.venue_members vm
      where vm.venue_id = market_products.venue_id
        and vm.user_id = (select auth.uid())
        and vm.role in ('owner', 'admin', 'staff')
    )
  );
