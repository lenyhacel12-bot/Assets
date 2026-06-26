-- ============================================================================
-- Stage 2 — Authorization helper functions (used by RLS policies)
-- ============================================================================
-- All functions are SECURITY DEFINER and owned by the migration role so they
-- can read the permission tables without being constrained by (or recursing
-- into) those tables' own RLS policies. search_path is pinned for safety.
-- A deactivated profile (is_active = false) resolves to NO permissions and NO
-- visible branches, so deactivation is enforced at the database level.
-- ============================================================================

-- Is the current user an active profile? ------------------------------------
create or replace function app.is_active()
returns boolean
language sql
stable
security definer
set search_path = app, public, pg_temp
as $$
  select coalesce(
    (select p.is_active from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- Does the current user hold a given permission code? -----------------------
create or replace function app.has_permission(p_code text)
returns boolean
language sql
stable
security definer
set search_path = app, public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles pr
    join public.user_roles ur       on ur.user_id = pr.id
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions pm      on pm.id = rp.permission_id
    where pr.id = auth.uid()
      and pr.is_active
      and pm.code = p_code
  );
$$;

-- Can the current user see every branch? ------------------------------------
create or replace function app.can_view_all_branches()
returns boolean
language sql
stable
security definer
set search_path = app, public, pg_temp
as $$
  select app.has_permission('branches.view_all');
$$;

-- The set of branch ids the current (active) user is assigned to ------------
create or replace function app.user_branch_ids()
returns setof uuid
language sql
stable
security definer
set search_path = app, public, pg_temp
as $$
  select ub.branch_id
  from public.user_branches ub
  join public.profiles pr on pr.id = ub.user_id
  where ub.user_id = auth.uid()
    and pr.is_active;
$$;

-- Can the current user view a specific branch? ------------------------------
create or replace function app.can_view_branch(p_branch_id uuid)
returns boolean
language sql
stable
security definer
set search_path = app, public, pg_temp
as $$
  select app.is_active()
    and (
      app.has_permission('branches.view_all')
      or (
        app.has_permission('branches.view_assigned')
        and p_branch_id in (select app.user_branch_ids())
      )
    );
$$;

-- Convenience: list permission codes for the current user (for the app) -----
create or replace function app.current_permissions()
returns setof text
language sql
stable
security definer
set search_path = app, public, pg_temp
as $$
  select distinct pm.code
  from public.profiles pr
  join public.user_roles ur       on ur.user_id = pr.id
  join public.role_permissions rp on rp.role_id = ur.role_id
  join public.permissions pm      on pm.id = rp.permission_id
  where pr.id = auth.uid()
    and pr.is_active;
$$;
