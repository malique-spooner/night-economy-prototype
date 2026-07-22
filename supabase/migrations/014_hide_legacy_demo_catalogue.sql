-- Keep prior demo sales and publication history intact, but hide superseded
-- catalogue rows so operators see only the current TLJ drinks booklet.
alter table public.pos_products
  add column if not exists is_current boolean not null default true;

update public.pos_products
set is_current = false, updated_at = now()
where venue_id = 'ven_demo'
  and external_id not like 'pos_tlj_%';
