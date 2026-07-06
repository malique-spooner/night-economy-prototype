alter table public.market_products
  add column if not exists sales_velocity integer not null default 4;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'market_products_sales_velocity_range'
  ) then
    alter table public.market_products
      add constraint market_products_sales_velocity_range
      check (sales_velocity between 0 and 20);
  end if;
end $$;

grant update (
  sales_velocity
) on public.market_products to authenticated;
