-- The complete TLJ booklet is synchronised from the simulated POS catalogue.
-- These are the nine prepared drinks initially selected for the live market.
-- Everything else remains a POS catalogue product until an operator activates it.

insert into public.pos_products (
  id, venue_id, pos_connection_id, external_id, sku, source_name,
  base_price_minor, current_price_minor, currency, is_available
)
values
  ('pos_cem', 'ven_demo', 'pos_sim_demo', 'pos_tlj_cocktails_classic_espresso', 'TLJ-029', 'Classic Espresso', 1100, 1100, 'GBP', true),
  ('pos_cmar', 'ven_demo', 'pos_sim_demo', 'pos_tlj_cocktails_classic_margarita', 'TLJ-021', 'Classic Margarita', 1200, 1200, 'GBP', true),
  ('pos_t75', 'ven_demo', 'pos_sim_demo', 'pos_tlj_cocktails_the_75th_peel', 'TLJ-007', 'The 75th Peel', 1200, 1200, 'GBP', true),
  ('pos_wb', 'ven_demo', 'pos_sim_demo', 'pos_tlj_mocktails_woodland_bloom', 'TLJ-033', 'Woodland Bloom', 800, 800, 'GBP', true),
  ('pos_negroni', 'ven_demo', 'pos_sim_demo', 'pos_tlj_cocktails_classic_negroni', 'TLJ-013', 'Classic Negroni', 1100, 1100, 'GBP', true),
  ('pos_spritz', 'ven_demo', 'pos_sim_demo', 'pos_tlj_cocktails_aperol_spritz', 'TLJ-025', 'Aperol Spritz', 1200, 1200, 'GBP', true),
  ('pos_mojito', 'ven_demo', 'pos_sim_demo', 'pos_tlj_cocktails_sarti_spritz', 'TLJ-029', 'Sarti Spritz', 1000, 1000, 'GBP', true),
  ('pos_old', 'ven_demo', 'pos_sim_demo', 'pos_tlj_cocktails_old_fashioned', 'TLJ-032', 'Old Fashioned', 1300, 1300, 'GBP', true),
  ('pos_bloody', 'ven_demo', 'pos_sim_demo', 'pos_tlj_cocktails_classic_bloody_mary', 'TLJ-026', 'Classic Bloody Mary', 1300, 1300, 'GBP', true)
on conflict (id) do update set
  external_id = excluded.external_id,
  sku = excluded.sku,
  source_name = excluded.source_name,
  base_price_minor = excluded.base_price_minor,
  current_price_minor = excluded.current_price_minor,
  currency = excluded.currency,
  is_available = excluded.is_available,
  synced_at = now(),
  updated_at = now();

update public.market_products as mp
set
  pos_product_id = mapped.pos_product_id,
  display_name = mapped.display_name,
  category = mapped.category,
  base_price_minor = mapped.base_price_minor,
  current_price_minor = mapped.base_price_minor,
  floor_price_minor = mapped.floor_price_minor,
  ceiling_price_minor = mapped.ceiling_price_minor,
  is_live = true,
  is_sold_out = false,
  updated_at = now()
from (
  values
    ('mp_cem', 'pos_cem', 'Classic Espresso', 'Cocktails', 1100, 800, 1650),
    ('mp_cmar', 'pos_cmar', 'Classic Margarita', 'Cocktails', 1200, 900, 1800),
    ('mp_t75', 'pos_t75', 'The 75th Peel', 'Cocktails', 1200, 900, 1800),
    ('mp_wb', 'pos_wb', 'Woodland Bloom', 'Mocktails', 800, 600, 1200),
    ('mp_negroni', 'pos_negroni', 'Classic Negroni', 'Cocktails', 1100, 800, 1650),
    ('mp_spritz', 'pos_spritz', 'Aperol Spritz', 'Cocktails', 1200, 900, 1800),
    ('mp_mojito', 'pos_mojito', 'Sarti Spritz', 'Cocktails', 1000, 750, 1500),
    ('mp_old', 'pos_old', 'Old Fashioned', 'Cocktails', 1300, 1000, 1950),
    ('mp_bloody', 'pos_bloody', 'Classic Bloody Mary', 'Cocktails', 1300, 1000, 1950)
) as mapped(id, pos_product_id, display_name, category, base_price_minor, floor_price_minor, ceiling_price_minor)
where mp.id = mapped.id;
