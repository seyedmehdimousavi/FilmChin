create extension if not exists pgcrypto;

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_wallets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_wallets_updated_at on public.wallets;
create trigger trg_wallets_updated_at
before update on public.wallets
for each row
execute function public.set_wallets_updated_at();

alter table public.wallets enable row level security;

-- Adjust policies to your auth model if needed.
drop policy if exists "wallets public read" on public.wallets;
create policy "wallets public read"
on public.wallets
for select
using (true);

drop policy if exists "wallets admin write" on public.wallets;
create policy "wallets admin write"
on public.wallets
for all
to authenticated
using (true)
with check (true);
