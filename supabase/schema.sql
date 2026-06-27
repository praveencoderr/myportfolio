create extension if not exists pgcrypto;

create table if not exists public.cms_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  custom_domain text unique,
  domain_status text not null default 'unconfigured' check (domain_status in ('unconfigured', 'pending', 'verified', 'error')),
  domain_instructions jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.portfolios (
  id,
  slug,
  title,
  status,
  domain_status,
  published_at
) values (
  '00000000-0000-0000-0000-000000000001',
  'praveen-gupta',
  'Praveen Gupta Portfolio',
  'published',
  'unconfigured',
  now()
) on conflict (id) do nothing;

create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cms_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.can_manage_portfolio(target_portfolio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portfolios
    where id = target_portfolio_id
      and owner_id = auth.uid()
  ) or public.is_cms_admin();
$$;

create or replace function public.is_published_portfolio(target_portfolio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portfolios
    where id = target_portfolio_id
      and status = 'published'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.portfolios(id) on delete cascade,
  slug text not null default 'main',
  full_name text not null,
  role text not null,
  location text,
  email text,
  phone text,
  portfolio_url text,
  github_url text,
  linkedin_url text,
  leetcode_url text,
  gfg_url text,
  summary text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (portfolio_id)
);

create table if not exists public.sections (
  portfolio_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.portfolios(id) on delete cascade,
  key text not null,
  eyebrow text,
  title text not null,
  description text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (portfolio_id, key)
);

create table if not exists public.settings (
  portfolio_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.portfolios(id) on delete cascade,
  key text not null,
  value jsonb not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (portfolio_id, key)
);

create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.portfolios(id) on delete cascade,
  value text not null,
  label text not null,
  href text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.portfolios(id) on delete cascade,
  category text not null,
  name text not null,
  featured boolean not null default false,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.portfolios(id) on delete cascade,
  role text not null,
  company text not null,
  location text,
  employment_type text,
  period text,
  start_date date,
  end_date date,
  summary text,
  bullets text[] not null default '{}',
  tech text[] not null default '{}',
  thumbnail text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.portfolios(id) on delete cascade,
  title text not null,
  subtitle text,
  description text,
  role text,
  image text,
  icon_list text[] not null default '{}',
  tech text[] not null default '{}',
  features text[] not null default '{}',
  highlights text[] not null default '{}',
  live_url text,
  code_url text,
  case_study_url text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.portfolios(id) on delete cascade,
  title text not null,
  description text,
  href text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.portfolios(id) on delete cascade,
  institution text not null,
  degree text not null,
  location text,
  period text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile add column if not exists portfolio_id uuid default '00000000-0000-0000-0000-000000000001';
alter table public.sections add column if not exists portfolio_id uuid default '00000000-0000-0000-0000-000000000001';
alter table public.settings add column if not exists portfolio_id uuid default '00000000-0000-0000-0000-000000000001';
alter table public.metrics add column if not exists portfolio_id uuid default '00000000-0000-0000-0000-000000000001';
alter table public.skills add column if not exists portfolio_id uuid default '00000000-0000-0000-0000-000000000001';
alter table public.experience add column if not exists portfolio_id uuid default '00000000-0000-0000-0000-000000000001';
alter table public.projects add column if not exists portfolio_id uuid default '00000000-0000-0000-0000-000000000001';
alter table public.achievements add column if not exists portfolio_id uuid default '00000000-0000-0000-0000-000000000001';
alter table public.education add column if not exists portfolio_id uuid default '00000000-0000-0000-0000-000000000001';
alter table public.profile add column if not exists gfg_url text;
alter table public.projects add column if not exists role text;
alter table public.projects add column if not exists features text[] not null default '{}';
alter table public.projects add column if not exists highlights text[] not null default '{}';

alter table public.profile alter column portfolio_id set not null;
alter table public.sections alter column portfolio_id set not null;
alter table public.settings alter column portfolio_id set not null;
alter table public.metrics alter column portfolio_id set not null;
alter table public.skills alter column portfolio_id set not null;
alter table public.experience alter column portfolio_id set not null;
alter table public.projects alter column portfolio_id set not null;
alter table public.achievements alter column portfolio_id set not null;
alter table public.education alter column portfolio_id set not null;

alter table public.sections drop constraint if exists sections_pkey;
alter table public.sections add primary key (portfolio_id, key);
alter table public.settings drop constraint if exists settings_pkey;
alter table public.settings add primary key (portfolio_id, key);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profile_portfolio_id_key') then
    alter table public.profile add constraint profile_portfolio_id_key unique (portfolio_id);
  end if;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profile',
    'sections',
    'settings',
    'metrics',
    'skills',
    'experience',
    'projects',
    'achievements',
    'education'
  ]
  loop
    execute format(
      'alter table public.%I drop constraint if exists %I',
      table_name,
      table_name || '_portfolio_id_fkey'
    );
    execute format(
      'alter table public.%I add constraint %I foreign key (portfolio_id) references public.portfolios(id) on delete cascade',
      table_name,
      table_name || '_portfolio_id_fkey'
    );
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'portfolios',
    'profile',
    'sections',
    'settings',
    'metrics',
    'skills',
    'experience',
    'projects',
    'achievements',
    'education'
  ]
  loop
    execute format(
      'drop trigger if exists %I on public.%I',
      'set_' || table_name || '_updated_at',
      table_name
    );
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      'set_' || table_name || '_updated_at',
      table_name
    );
  end loop;
end $$;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'resumes',
  'resumes',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
) on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.cms_admins enable row level security;
alter table public.portfolios enable row level security;
alter table public.profile enable row level security;
alter table public.sections enable row level security;
alter table public.settings enable row level security;
alter table public.metrics enable row level security;
alter table public.skills enable row level security;
alter table public.experience enable row level security;
alter table public.projects enable row level security;
alter table public.achievements enable row level security;
alter table public.education enable row level security;

drop policy if exists "cms admins can read admins" on public.cms_admins;
create policy "cms admins can read admins"
on public.cms_admins
for select
to authenticated
using (public.is_cms_admin());

drop policy if exists "cms admins can manage admins" on public.cms_admins;
create policy "cms admins can manage admins"
on public.cms_admins
for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "public can read published portfolios" on public.portfolios;
create policy "public can read published portfolios"
on public.portfolios
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "owners can read own portfolios" on public.portfolios;
create policy "owners can read own portfolios"
on public.portfolios
for select
to authenticated
using (owner_id = auth.uid() or public.is_cms_admin());

drop policy if exists "owners can create portfolios" on public.portfolios;
create policy "owners can create portfolios"
on public.portfolios
for insert
to authenticated
with check (owner_id = auth.uid() or public.is_cms_admin());

drop policy if exists "owners can update portfolios" on public.portfolios;
create policy "owners can update portfolios"
on public.portfolios
for update
to authenticated
using (owner_id = auth.uid() or public.is_cms_admin())
with check (owner_id = auth.uid() or public.is_cms_admin());

drop policy if exists "owners can delete portfolios" on public.portfolios;
create policy "owners can delete portfolios"
on public.portfolios
for delete
to authenticated
using (owner_id = auth.uid() or public.is_cms_admin());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profile',
    'sections',
    'settings',
    'metrics',
    'skills',
    'experience',
    'projects',
    'achievements',
    'education'
  ]
  loop
    execute format('drop policy if exists "public can read published %s" on public.%I', table_name, table_name);
    execute format(
      'create policy "public can read published %s" on public.%I for select to anon, authenticated using (published = true and public.is_published_portfolio(portfolio_id))',
      table_name,
      table_name
    );

    execute format('drop policy if exists "owners can read own %s" on public.%I', table_name, table_name);
    execute format(
      'create policy "owners can read own %s" on public.%I for select to authenticated using (public.can_manage_portfolio(portfolio_id))',
      table_name,
      table_name
    );

    execute format('drop policy if exists "owners can manage %s" on public.%I', table_name, table_name);
    execute format(
      'create policy "owners can manage %s" on public.%I for all to authenticated using (public.can_manage_portfolio(portfolio_id)) with check (public.can_manage_portfolio(portfolio_id))',
      table_name,
      table_name
    );

    execute format('drop policy if exists "cms admins can manage %s" on public.%I', table_name, table_name);
  end loop;
end $$;

drop policy if exists "owners can upload resumes" on storage.objects;
create policy "owners can upload resumes"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "owners can read own resumes" on storage.objects;
create policy "owners can read own resumes"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "owners can delete own resumes" on storage.objects;
create policy "owners can delete own resumes"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);
