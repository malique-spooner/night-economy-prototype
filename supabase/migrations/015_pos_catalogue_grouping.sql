alter table public.pos_products
  add column if not exists category text,
  add column if not exists subcategory text,
  add column if not exists product_group text,
  add column if not exists serve_size text;

-- The simulator POS is the source of these fields. Its next paused sync fills
-- every current booklet product; no menu data is authored in Supabase.
