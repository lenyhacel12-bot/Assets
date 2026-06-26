-- ============================================================================
-- Stage 2 — Row Level Security policies & grants
-- ============================================================================
-- Roles `anon`, `authenticated`, `service_role` are provided by Supabase. The
-- local test harness creates them. Privileges are granted to `authenticated`
-- and then narrowed by RLS (the standard Supabase pattern). `service_role`
-- bypasses RLS and is used only server-side (e.g. user invitation).
-- ============================================================================

-- Schema usage --------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema app to anon, authenticated, service_role;
grant execute on all functions in schema app to anon, authenticated, service_role;

-- Enable RLS ----------------------------------------------------------------
alter table public.branches         enable row level security;
alter table public.profiles         enable row level security;
alter table public.roles            enable row level security;
alter table public.permissions      enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles       enable row level security;
alter table public.user_branches    enable row level security;

-- ---------------------------------------------------------------------------
-- BRANCHES
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.branches to authenticated;

create policy branches_select on public.branches
  for select to authenticated
  using (app.can_view_branch(id));

create policy branches_insert on public.branches
  for insert to authenticated
  with check (app.has_permission('settings.manage'));

create policy branches_update on public.branches
  for update to authenticated
  using (app.has_permission('settings.manage'))
  with check (app.has_permission('settings.manage'));

create policy branches_delete on public.branches
  for delete to authenticated
  using (app.has_permission('settings.manage'));

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
grant select, insert, update on public.profiles to authenticated;

create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or app.has_permission('users.manage')
    or app.has_permission('audit.view')
  );

-- A user may edit their own profile but may NOT change their own active flag
-- (WITH CHECK forces is_active = true). Admins may change anything.
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and is_active = true);

create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (app.has_permission('users.manage'))
  with check (app.has_permission('users.manage'));

create policy profiles_insert_admin on public.profiles
  for insert to authenticated
  with check (app.has_permission('users.manage'));

-- ---------------------------------------------------------------------------
-- ROLES / PERMISSIONS / ROLE_PERMISSIONS  (read-only catalog for users)
-- ---------------------------------------------------------------------------
grant select on public.roles to authenticated;
grant select on public.permissions to authenticated;
grant select on public.role_permissions to authenticated;
grant select, insert, update, delete on public.roles to authenticated;
grant select, insert, update, delete on public.role_permissions to authenticated;

create policy roles_select on public.roles
  for select to authenticated using (true);

create policy permissions_select on public.permissions
  for select to authenticated using (true);

create policy role_permissions_select on public.role_permissions
  for select to authenticated using (true);

-- Only settings managers may alter the role catalogue.
create policy roles_manage on public.roles
  for all to authenticated
  using (app.has_permission('settings.manage'))
  with check (app.has_permission('settings.manage'));

create policy role_permissions_manage on public.role_permissions
  for all to authenticated
  using (app.has_permission('settings.manage'))
  with check (app.has_permission('settings.manage'));

-- ---------------------------------------------------------------------------
-- USER_ROLES
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.user_roles to authenticated;

create policy user_roles_select on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or app.has_permission('users.manage'));

create policy user_roles_manage on public.user_roles
  for all to authenticated
  using (app.has_permission('users.manage'))
  with check (app.has_permission('users.manage'));

-- ---------------------------------------------------------------------------
-- USER_BRANCHES
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.user_branches to authenticated;

create policy user_branches_select on public.user_branches
  for select to authenticated
  using (user_id = auth.uid() or app.has_permission('users.manage'));

create policy user_branches_manage on public.user_branches
  for all to authenticated
  using (app.has_permission('users.manage'))
  with check (app.has_permission('users.manage'));
