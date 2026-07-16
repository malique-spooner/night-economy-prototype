revoke update (
  base_price_minor,
  current_price_minor,
  is_sold_out
) on public.market_products from authenticated;

grant update (
  market_symbol,
  display_name,
  category,
  floor_price_minor,
  ceiling_price_minor,
  is_live,
  priority,
  updated_at
) on public.market_products to authenticated;

grant insert (
  id,
  venue_id,
  pos_product_id,
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
create policy "venue members can configure POS products for the market"
  on public.market_products for insert
  to authenticated
  with check (
    pos_product_id is not null
    and exists (
      select 1
      from public.venue_members vm
      where vm.venue_id = market_products.venue_id
        and vm.user_id = (select auth.uid())
        and vm.role in ('owner', 'admin', 'staff')
    )
    and exists (
      select 1
      from public.pos_products pp
      where pp.id = market_products.pos_product_id
        and pp.venue_id = market_products.venue_id
    )
  );
