create extension if not exists pgcrypto with schema extensions;

create table if not exists public.site_leads (
  id uuid primary key default extensions.gen_random_uuid(),
  venue_name text not null,
  owner_name text not null,
  email text not null,
  plan text not null,
  status text not null default 'new',
  source text not null default 'site_signup',
  created_at timestamptz not null default now(),
  check (char_length(trim(venue_name)) > 0),
  check (char_length(trim(owner_name)) > 0),
  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  check (plan in ('starter', 'growth', 'premium')),
  check (status in ('new', 'contacted', 'converted', 'closed')),
  check (source in ('site_signup'))
);

alter table public.site_leads enable row level security;

grant insert (
  venue_name,
  owner_name,
  email,
  plan,
  source
) on public.site_leads to anon, authenticated;

drop policy if exists "public can create site leads" on public.site_leads;
create policy "public can create site leads"
  on public.site_leads for insert
  to anon, authenticated
  with check (source = 'site_signup');
