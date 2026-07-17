-- Backfill the demo catalogue mapping. POS external IDs use the simulator's
-- `pos_<lowercase market symbol>` convention, while market product IDs use a
-- separate internal identifier.
update public.market_products mp
set pos_product_id = pp.id
from public.pos_products pp
where pp.venue_id = mp.venue_id
  and pp.external_id = 'pos_' || lower(mp.market_symbol)
  and mp.pos_product_id is null;
