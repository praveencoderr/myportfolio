create extension if not exists pgcrypto;

create table if not exists public.cms_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

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
  slug text not null unique default 'main',
  full_name text not null,
  role text not null,
  location text,
  email text,
  phone text,
  portfolio_url text,
  github_url text,
  linkedin_url text,
  leetcode_url text,
  summary text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sections (
  key text primary key,
  eyebrow text,
  title text not null,
  description text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
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
  title text not null,
  subtitle text,
  description text,
  image text,
  icon_list text[] not null default '{}',
  tech text[] not null default '{}',
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
  institution text not null,
  degree text not null,
  location text,
  period text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profile_updated_at on public.profile;
create trigger set_profile_updated_at
before update on public.profile
for each row execute function public.set_updated_at();

drop trigger if exists set_sections_updated_at on public.sections;
create trigger set_sections_updated_at
before update on public.sections
for each row execute function public.set_updated_at();

drop trigger if exists set_settings_updated_at on public.settings;
create trigger set_settings_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

drop trigger if exists set_metrics_updated_at on public.metrics;
create trigger set_metrics_updated_at
before update on public.metrics
for each row execute function public.set_updated_at();

drop trigger if exists set_skills_updated_at on public.skills;
create trigger set_skills_updated_at
before update on public.skills
for each row execute function public.set_updated_at();

drop trigger if exists set_experience_updated_at on public.experience;
create trigger set_experience_updated_at
before update on public.experience
for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists set_achievements_updated_at on public.achievements;
create trigger set_achievements_updated_at
before update on public.achievements
for each row execute function public.set_updated_at();

drop trigger if exists set_education_updated_at on public.education;
create trigger set_education_updated_at
before update on public.education
for each row execute function public.set_updated_at();

alter table public.cms_admins enable row level security;
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

drop policy if exists "public can read published profile" on public.profile;
create policy "public can read published profile"
on public.profile
for select
to anon, authenticated
using (published = true);

drop policy if exists "public can read published sections" on public.sections;
create policy "public can read published sections"
on public.sections
for select
to anon, authenticated
using (published = true);

drop policy if exists "public can read published settings" on public.settings;
create policy "public can read published settings"
on public.settings
for select
to anon, authenticated
using (published = true);

drop policy if exists "public can read published metrics" on public.metrics;
create policy "public can read published metrics"
on public.metrics
for select
to anon, authenticated
using (published = true);

drop policy if exists "public can read published skills" on public.skills;
create policy "public can read published skills"
on public.skills
for select
to anon, authenticated
using (published = true);

drop policy if exists "public can read published experience" on public.experience;
create policy "public can read published experience"
on public.experience
for select
to anon, authenticated
using (published = true);

drop policy if exists "public can read published projects" on public.projects;
create policy "public can read published projects"
on public.projects
for select
to anon, authenticated
using (published = true);

drop policy if exists "public can read published achievements" on public.achievements;
create policy "public can read published achievements"
on public.achievements
for select
to anon, authenticated
using (published = true);

drop policy if exists "public can read published education" on public.education;
create policy "public can read published education"
on public.education
for select
to anon, authenticated
using (published = true);

drop policy if exists "cms admins can manage profile" on public.profile;
create policy "cms admins can manage profile"
on public.profile
for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "cms admins can manage sections" on public.sections;
create policy "cms admins can manage sections"
on public.sections
for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "cms admins can manage settings" on public.settings;
create policy "cms admins can manage settings"
on public.settings
for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "cms admins can manage metrics" on public.metrics;
create policy "cms admins can manage metrics"
on public.metrics
for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "cms admins can manage skills" on public.skills;
create policy "cms admins can manage skills"
on public.skills
for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "cms admins can manage experience" on public.experience;
create policy "cms admins can manage experience"
on public.experience
for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "cms admins can manage projects" on public.projects;
create policy "cms admins can manage projects"
on public.projects
for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "cms admins can manage achievements" on public.achievements;
create policy "cms admins can manage achievements"
on public.achievements
for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "cms admins can manage education" on public.education;
create policy "cms admins can manage education"
on public.education
for all
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());
