do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'market_products'
  ) then
    alter publication supabase_realtime add table public.market_products;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'venues'
  ) then
    alter publication supabase_realtime add table public.venues;
  end if;
end $$;
