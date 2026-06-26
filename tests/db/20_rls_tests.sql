-- ============================================================================
-- RLS TEST SUITE — run with `psql -v ON_ERROR_STOP=1`.
-- Each test runs in its own transaction, impersonating a user by setting the
-- JWT `sub` claim and switching to the `authenticated` role. A failed ASSERT
-- (or an unexpected error) aborts the script with a non-zero exit.
-- ============================================================================
\set OWNER     '00000000-0000-0000-0000-000000000001'
\set GM        '00000000-0000-0000-0000-000000000002'
\set BMGR_MNL  '00000000-0000-0000-0000-000000000003'
\set SALES_MNL '00000000-0000-0000-0000-000000000004'
\set ACCT      '00000000-0000-0000-0000-000000000005'
\set AUDITOR   '00000000-0000-0000-0000-000000000006'
\set INACTIVE  '00000000-0000-0000-0000-000000000007'
\set BMGR_CEB  '00000000-0000-0000-0000-000000000008'

\echo '== Test 1: Owner sees all 4 branches =='
begin;
  select set_config('request.jwt.claim.sub', :'OWNER', true);
  set local role authenticated;
  do $$ begin
    assert (select count(*) from public.branches) = 4, 'owner should see 4 branches';
  end $$;
rollback;

\echo '== Test 2: Owner has the full permission set (23) and users.manage =='
begin;
  select set_config('request.jwt.claim.sub', :'OWNER', true);
  set local role authenticated;
  do $$ begin
    assert (select count(*) from app.current_permissions()) = 23, 'owner should have 23 permissions';
    assert app.has_permission('users.manage'), 'owner should have users.manage';
    assert app.can_view_all_branches(), 'owner should view all branches';
  end $$;
rollback;

\echo '== Test 3: Branch Manager (MNL) sees only the Manila branch =='
begin;
  select set_config('request.jwt.claim.sub', :'BMGR_MNL', true);
  set local role authenticated;
  do $$ begin
    assert (select count(*) from public.branches) = 1, 'branch manager should see exactly 1 branch';
    assert (select code from public.branches) = 'MNL', 'branch manager should see MNL only';
    assert not exists (select 1 from public.branches where code = 'CEB'), 'must not see CEB';
    assert not app.has_permission('users.manage'), 'branch manager must not manage users';
  end $$;
rollback;

\echo '== Test 4: Cross-branch isolation — Cebu manager sees only Cebu =='
begin;
  select set_config('request.jwt.claim.sub', :'BMGR_CEB', true);
  set local role authenticated;
  do $$ begin
    assert (select count(*) from public.branches) = 1, 'cebu manager should see 1 branch';
    assert (select code from public.branches) = 'CEB', 'cebu manager should see CEB only';
  end $$;
rollback;

\echo '== Test 5: Accounting sees all branches =='
begin;
  select set_config('request.jwt.claim.sub', :'ACCT', true);
  set local role authenticated;
  do $$ begin
    assert (select count(*) from public.branches) = 4, 'accounting should see all 4 branches';
    assert app.can_view_all_branches(), 'accounting should view all branches';
  end $$;
rollback;

\echo '== Test 6: Auditor sees all branches but CANNOT modify them =='
begin;
  select set_config('request.jwt.claim.sub', :'AUDITOR', true);
  set local role authenticated;
  do $$
  declare affected int;
  begin
    assert (select count(*) from public.branches) = 4, 'auditor should see all 4 branches';
    -- RLS USING(settings.manage=false) -> no rows are updatable.
    update public.branches set name = name where code = 'MNL';
    get diagnostics affected = row_count;
    assert affected = 0, 'auditor update must affect 0 rows';
    assert not app.has_permission('users.manage'), 'auditor must not manage users';
  end $$;
rollback;

\echo '== Test 7: Sales staff CANNOT manage users (insert user_roles blocked) =='
begin;
  select set_config('request.jwt.claim.sub', :'SALES_MNL', true);
  set local role authenticated;
  do $$
  begin
    assert not app.has_permission('users.manage'), 'sales must not have users.manage';
    begin
      insert into public.user_roles (user_id, role_id)
      select '00000000-0000-0000-0000-000000000004'::uuid, id from public.roles where code = 'owner';
      raise exception 'TEST-FAIL: sales staff was able to assign a role';
    exception
      when insufficient_privilege then null; -- expected: RLS WITH CHECK blocked it
    end;
  end $$;
rollback;

\echo '== Test 8: Deactivated user sees NOTHING and has NO permissions =='
begin;
  select set_config('request.jwt.claim.sub', :'INACTIVE', true);
  set local role authenticated;
  do $$ begin
    assert (select count(*) from public.branches) = 0, 'deactivated user must see 0 branches';
    assert (select count(*) from app.current_permissions()) = 0, 'deactivated user must have 0 permissions';
    assert not app.is_active(), 'is_active() must be false';
  end $$;
rollback;

\echo '== Test 9: Owner CAN assign a branch (write allowed) =='
begin;
  select set_config('request.jwt.claim.sub', :'OWNER', true);
  set local role authenticated;
  do $$
  declare affected int;
  begin
    insert into public.user_branches (user_id, branch_id)
    select '00000000-0000-0000-0000-000000000004'::uuid, id from public.branches where code = 'CEB';
    get diagnostics affected = row_count;
    assert affected = 1, 'owner should be able to assign a branch';
  end $$;
rollback;

\echo '== Test 10: Branch manager CANNOT create a branch (settings.manage) =='
begin;
  select set_config('request.jwt.claim.sub', :'BMGR_MNL', true);
  set local role authenticated;
  do $$
  begin
    begin
      insert into public.branches (code, name, doc_prefix) values ('XXX', 'Rogue', 'XXX');
      raise exception 'TEST-FAIL: branch manager created a branch';
    exception
      when insufficient_privilege then null; -- expected
    end;
  end $$;
rollback;

\echo '== Test 11: A user can update own language but CANNOT deactivate self =='
begin;
  select set_config('request.jwt.claim.sub', :'SALES_MNL', true);
  set local role authenticated;
  do $$
  declare affected int;
  begin
    update public.profiles set preferred_language = 'tl' where id = '00000000-0000-0000-0000-000000000004'::uuid;
    get diagnostics affected = row_count;
    assert affected = 1, 'user should update own language';
    begin
      update public.profiles set is_active = false where id = '00000000-0000-0000-0000-000000000004'::uuid;
      raise exception 'TEST-FAIL: user deactivated self';
    exception
      when insufficient_privilege then null; -- expected: WITH CHECK is_active=true
    end;
  end $$;
rollback;

\echo ''
\echo '============================================'
\echo '   ALL RLS TESTS PASSED'
\echo '============================================'
