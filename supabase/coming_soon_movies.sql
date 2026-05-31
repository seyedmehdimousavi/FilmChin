-- Coming Soon movies table, storage folder, and policies for Supabase.
-- This version uses the existing public.users.role admin model used by the app.
-- Admin writes are allowed for authenticated users whose users.role is owner/admin.

create extension if not exists "pgcrypto";

create table if not exists public.coming_soon_movies (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  cover text not null check (char_length(trim(cover)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coming_soon_movies_created_at_idx
  on public.coming_soon_movies (created_at desc);

alter table public.coming_soon_movies enable row level security;

-- Helper used by table/storage policies. SECURITY DEFINER avoids policy-recursion
-- problems if public.users also has RLS enabled.
create or replace function public.is_filmchin_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role in ('owner', 'admin')
  );
$$;

revoke all on function public.is_filmchin_admin() from public;
grant execute on function public.is_filmchin_admin() to authenticated;

-- Public users can read the Coming Soon list.
drop policy if exists "Public can read coming soon movies" on public.coming_soon_movies;
create policy "Public can read coming soon movies"
  on public.coming_soon_movies
  for select
  using (true);

-- Admin-only writes based on public.users.role.
drop policy if exists "Admins can insert coming soon movies" on public.coming_soon_movies;
create policy "Admins can insert coming soon movies"
  on public.coming_soon_movies
  for insert
  to authenticated
  with check (public.is_filmchin_admin());

drop policy if exists "Admins can update coming soon movies" on public.coming_soon_movies;
create policy "Admins can update coming soon movies"
  on public.coming_soon_movies
  for update
  to authenticated
  using (public.is_filmchin_admin())
  with check (public.is_filmchin_admin());

drop policy if exists "Admins can delete coming soon movies" on public.coming_soon_movies;
create policy "Admins can delete coming soon movies"
  on public.coming_soon_movies
  for delete
  to authenticated
  using (public.is_filmchin_admin());

-- Reuse the existing public covers bucket and reserve a folder for Coming Soon covers.
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do update set public = excluded.public;

-- Public can read cover files from covers/public/coming-soon/...
drop policy if exists "Public can read coming soon covers" on storage.objects;
create policy "Public can read coming soon covers"
  on storage.objects
  for select
  using (
    bucket_id = 'covers'
    and name like 'public/coming-soon/%'
  );

-- Admin-only uploads/updates/deletes for Coming Soon cover files.
drop policy if exists "Admins can upload coming soon covers" on storage.objects;
create policy "Admins can upload coming soon covers"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'covers'
    and name like 'public/coming-soon/%'
    and public.is_filmchin_admin()
  );

drop policy if exists "Admins can update coming soon covers" on storage.objects;
create policy "Admins can update coming soon covers"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'covers'
    and name like 'public/coming-soon/%'
    and public.is_filmchin_admin()
  )
  with check (
    bucket_id = 'covers'
    and name like 'public/coming-soon/%'
    and public.is_filmchin_admin()
  );

drop policy if exists "Admins can delete coming soon covers" on storage.objects;
create policy "Admins can delete coming soon covers"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'covers'
    and name like 'public/coming-soon/%'
    and public.is_filmchin_admin()
  );
