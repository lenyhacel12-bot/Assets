-- ============================================================================
-- Stage 2 — Core schema: branches, profiles, roles, permissions, assignments
-- ============================================================================
-- Conventions (see docs/DATABASE_PLAN.md):
--   * UUID primary keys (gen_random_uuid(), built into Postgres 13+).
--   * created_at / updated_at / created_by where applicable.
--   * branch ownership via branch_id where applicable.
--   * soft-delete via is_active for master records.
-- This migration is Supabase-compatible: it references auth.users / auth.uid()
-- which Supabase provides. The local test harness stubs those (tests/db).
-- ============================================================================

create schema if not exists app;

-- Generic updated_at trigger ------------------------------------------------
create or replace function app.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Branches ------------------------------------------------------------------
create table public.branches (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique check (code = upper(code) and char_length(code) between 2 and 8),
  name           text not null,
  address        text,
  contact_person text,
  contact_number text,
  email          text,
  -- Document numbering settings (used by the numbering service in later stages)
  doc_prefix     text not null,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     uuid
);

create trigger trg_branches_updated_at
  before update on public.branches
  for each row execute function app.set_updated_at();

-- Profiles (extends auth.users) ---------------------------------------------
create table public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              text,
  full_name          text not null default '',
  preferred_language text not null default 'en' check (preferred_language in ('en', 'tl')),
  is_active          boolean not null default true,
  last_login_at      timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid references public.profiles(id)
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function app.set_updated_at();

-- Roles ---------------------------------------------------------------------
create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- Permissions ---------------------------------------------------------------
create table public.permissions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

-- Role ⇄ Permission ---------------------------------------------------------
create table public.role_permissions (
  role_id       uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- User ⇄ Role ---------------------------------------------------------------
create table public.user_roles (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role_id    uuid not null references public.roles(id) on delete restrict,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  primary key (user_id, role_id)
);

-- User ⇄ Branch -------------------------------------------------------------
create table public.user_branches (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  branch_id  uuid not null references public.branches(id) on delete restrict,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  primary key (user_id, branch_id)
);

-- Indexes -------------------------------------------------------------------
create index idx_user_roles_user      on public.user_roles (user_id);
create index idx_user_roles_role      on public.user_roles (role_id);
create index idx_user_branches_user   on public.user_branches (user_id);
create index idx_user_branches_branch on public.user_branches (branch_id);
create index idx_role_permissions_role on public.role_permissions (role_id);
create index idx_profiles_active      on public.profiles (is_active);

-- Auto-create a profile when an auth user is created ------------------------
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
