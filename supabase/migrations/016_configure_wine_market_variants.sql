-- Configure every bottle, 175ml, and 250ml wine serve for the Portal.
-- Bottles begin live; glass variants remain available but inactive.
insert into public.market_products (
  id, venue_id, pos_product_id, market_symbol, display_name, category,
  base_price_minor, current_price_minor, floor_price_minor, ceiling_price_minor,
  is_live, is_sold_out, priority
)
select
  'mp_' || pp.id,
  pp.venue_id,
  pp.id,
  upper(substring(md5(pp.id) from 1 for 8)),
  pp.source_name,
  'Wine',
  pp.base_price_minor,
  pp.current_price_minor,
  greatest(0, floor(pp.base_price_minor * 0.75 / 50) * 50)::integer,
  ceil(pp.base_price_minor * 1.5 / 50) * 50,
  pp.serve_size = 'Bottle',
  false,
  false
from public.pos_products pp
where pp.venue_id = 'ven_demo'
  and pp.is_current
  and pp.category = 'Wine'
  and pp.serve_size in ('Bottle', '175ml', '250ml')
on conflict (pos_product_id) where pos_product_id is not null do update set
  display_name = excluded.display_name,
  category = excluded.category,
  base_price_minor = excluded.base_price_minor,
  current_price_minor = excluded.current_price_minor,
  floor_price_minor = excluded.floor_price_minor,
  ceiling_price_minor = excluded.ceiling_price_minor,
  is_live = excluded.is_live,
  updated_at = now();
