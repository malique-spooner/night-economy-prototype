-- The simulator uses stable product IDs, including full names for four drinks.
-- Re-link the market catalogue to those canonical POS rows.
update public.market_products mp
set pos_product_id = pp.id
from public.pos_products pp
where pp.venue_id = mp.venue_id
  and pp.external_id = case mp.market_symbol
    when 'CEM' then 'pos_cem'
    when 'CMAR' then 'pos_cmar'
    when 'T75' then 'pos_t75'
    when 'WB' then 'pos_wb'
    when 'NEG' then 'pos_negroni'
    when 'SPZ' then 'pos_spritz'
    when 'MOJ' then 'pos_mojito'
    when 'OLD' then 'pos_old'
    when 'BLD' then 'pos_bloody'
  end;
