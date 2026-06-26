-- ============================================================================
-- TEST FIXTURES — synthetic users for RLS testing (throwaway test DB only).
-- Inserting into auth.users fires handle_new_user(), creating profiles rows.
-- ============================================================================

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000001', 'owner@test.local',      '{"full_name":"Owner"}'),
  ('00000000-0000-0000-0000-000000000002', 'gm@test.local',         '{"full_name":"GM"}'),
  ('00000000-0000-0000-0000-000000000003', 'bmgr.mnl@test.local',   '{"full_name":"BM Manila"}'),
  ('00000000-0000-0000-0000-000000000004', 'sales.mnl@test.local',  '{"full_name":"Sales Manila"}'),
  ('00000000-0000-0000-0000-000000000005', 'acct@test.local',       '{"full_name":"Accounting"}'),
  ('00000000-0000-0000-0000-000000000006', 'auditor@test.local',    '{"full_name":"Auditor"}'),
  ('00000000-0000-0000-0000-000000000007', 'inactive@test.local',   '{"full_name":"Inactive"}'),
  ('00000000-0000-0000-0000-000000000008', 'bmgr.ceb@test.local',   '{"full_name":"BM Cebu"}');

-- Deactivate one user (still has a role + branch — must still see nothing).
update public.profiles set is_active = false
  where id = '00000000-0000-0000-0000-000000000007';

-- Assign roles.
insert into public.user_roles (user_id, role_id)
select u.uid, r.id
from (values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'owner'),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'general_manager'),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'branch_manager'),
  ('00000000-0000-0000-0000-000000000004'::uuid, 'sales_staff'),
  ('00000000-0000-0000-0000-000000000005'::uuid, 'accounting_staff'),
  ('00000000-0000-0000-0000-000000000006'::uuid, 'auditor'),
  ('00000000-0000-0000-0000-000000000007'::uuid, 'branch_manager'),
  ('00000000-0000-0000-0000-000000000008'::uuid, 'branch_manager')
) as u(uid, role_code)
join public.roles r on r.code = u.role_code;

-- Assign branches (branch-scoped users only).
insert into public.user_branches (user_id, branch_id)
select u.uid, b.id
from (values
  ('00000000-0000-0000-0000-000000000003'::uuid, 'MNL'),
  ('00000000-0000-0000-0000-000000000004'::uuid, 'MNL'),
  ('00000000-0000-0000-0000-000000000007'::uuid, 'MNL'),
  ('00000000-0000-0000-0000-000000000008'::uuid, 'CEB')
) as u(uid, branch_code)
join public.branches b on b.code = u.branch_code;
