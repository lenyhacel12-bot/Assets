-- ============================================================================
-- STAGE 3 RLS / CONSTRAINT TESTS — run with psql -v ON_ERROR_STOP=1.
-- Impersonation pattern matches 20_rls_tests.sql.
-- ============================================================================
\set OWNER     '00000000-0000-0000-0000-000000000001'
\set BMGR_MNL  '00000000-0000-0000-0000-000000000003'
\set SALES_MNL '00000000-0000-0000-0000-000000000004'
\set BMGR_CEB  '00000000-0000-0000-0000-000000000008'

\echo '== M1: distinct variants keep distinct SKUs; duplicate SKU rejected =='
begin;
  select set_config('request.jwt.claim.sub', :'OWNER', true);
  set local role authenticated;
  do $$
  begin
    assert (select count(*) from public.products) = 3, 'should see all 3 products';
    assert (select count(distinct sku) from public.products) = 3, 'SKUs must be distinct';
    begin
      insert into public.products (sku, name, base_unit_id)
      values ('FR-4-50', 'Dup', (select id from public.units where code = 'meter'));
      raise exception 'TEST-FAIL: duplicate SKU was allowed';
    exception when unique_violation then null;
    end;
  end $$;
rollback;

\echo '== M2: unit conversion must be > 0 (check constraint) =='
begin;
  select set_config('request.jwt.claim.sub', :'OWNER', true);
  set local role authenticated;
  do $$
  begin
    begin
      insert into public.product_selling_units (product_id, unit_id, conversion_to_base)
      values ('10000000-0000-0000-0000-000000000002',
              (select id from public.units where code = 'roll'), 0);
      raise exception 'TEST-FAIL: non-positive conversion allowed';
    exception when check_violation then null;
    end;
    -- A valid conversion (1 roll = 50 m) is accepted.
    insert into public.product_selling_units (product_id, unit_id, conversion_to_base)
    values ('10000000-0000-0000-0000-000000000002',
            (select id from public.units where code = 'roll'), 50);
  end $$;
rollback;

\echo '== M3: inactive products are excluded by the selectable filter =='
begin;
  select set_config('request.jwt.claim.sub', :'OWNER', true);
  set local role authenticated;
  do $$
  begin
    assert (select count(*) from public.products where is_active) = 2,
      'only 2 products are active/selectable';
    assert (select count(*) from public.products) = 3, 'all 3 still exist';
  end $$;
rollback;

\echo '== M4: customer branch visibility (MNL sees only Manila; Owner sees all) =='
begin;
  select set_config('request.jwt.claim.sub', :'BMGR_MNL', true);
  set local role authenticated;
  do $$
  begin
    assert (select count(*) from public.customers) = 1, 'MNL manager sees 1 customer';
    assert (select name from public.customers) = 'Manila Customer', 'sees Manila only';
    assert not exists (select 1 from public.customers where name = 'Cebu Customer'),
      'must not see Cebu customer';
  end $$;
rollback;

begin;
  select set_config('request.jwt.claim.sub', :'OWNER', true);
  set local role authenticated;
  do $$ begin
    assert (select count(*) from public.customers) = 2, 'owner sees all customers';
  end $$;
rollback;

\echo '== M5: customer-specific prices follow branch visibility =='
begin;
  select set_config('request.jwt.claim.sub', :'BMGR_MNL', true);
  set local role authenticated;
  do $$ begin
    assert (select count(*) from public.customer_product_prices) = 1,
      'MNL manager sees the Manila customer price';
  end $$;
rollback;

begin;
  select set_config('request.jwt.claim.sub', :'BMGR_CEB', true);
  set local role authenticated;
  do $$ begin
    assert (select count(*) from public.customer_product_prices) = 0,
      'CEB manager must not see Manila customer prices';
  end $$;
rollback;

\echo '== M6: customer-specific price save respects branch (cross-branch blocked) =='
begin;
  select set_config('request.jwt.claim.sub', :'BMGR_MNL', true);
  set local role authenticated;
  do $$
  declare affected int;
  begin
    insert into public.customer_product_prices (customer_id, product_id, unit_id, price)
    values ('20000000-0000-0000-0000-000000000001',
            '10000000-0000-0000-0000-000000000002',
            (select id from public.units where code = 'meter'), 50);
    get diagnostics affected = row_count;
    assert affected = 1, 'MNL manager can add a price for a Manila customer';
  end $$;
rollback;

begin;
  select set_config('request.jwt.claim.sub', :'BMGR_CEB', true);
  set local role authenticated;
  do $$
  begin
    begin
      insert into public.customer_product_prices (customer_id, product_id, unit_id, price)
      values ('20000000-0000-0000-0000-000000000001',  -- Manila customer
              '10000000-0000-0000-0000-000000000002',
              (select id from public.units where code = 'meter'), 50);
      raise exception 'TEST-FAIL: CEB manager priced a Manila customer';
    exception when insufficient_privilege then null;
    end;
  end $$;
rollback;

\echo '== M7: writing products requires products.manage =='
begin;
  select set_config('request.jwt.claim.sub', :'SALES_MNL', true);
  set local role authenticated;
  do $$
  begin
    -- Sales staff may READ the catalogue...
    assert (select count(*) from public.products) = 3, 'sales can read catalogue';
    -- ...but cannot create products.
    begin
      insert into public.products (sku, name, base_unit_id)
      values ('NEW-1', 'New', (select id from public.units where code = 'meter'));
      raise exception 'TEST-FAIL: sales staff created a product';
    exception when insufficient_privilege then null;
    end;
  end $$;
rollback;

\echo '== M8: suppliers readable by any active user; writes need suppliers.manage =='
begin;
  select set_config('request.jwt.claim.sub', :'SALES_MNL', true);
  set local role authenticated;
  do $$
  begin
    assert (select count(*) from public.suppliers) >= 1, 'sales can read suppliers';
    begin
      insert into public.suppliers (company_name) values ('Rogue Supplier');
      raise exception 'TEST-FAIL: sales staff created a supplier';
    exception when insufficient_privilege then null;
    end;
  end $$;
rollback;

\echo '== M9: customer create is constrained to the user''s branch =='
begin;
  select set_config('request.jwt.claim.sub', :'BMGR_MNL', true);
  set local role authenticated;
  do $$
  declare affected int;
  begin
    insert into public.customers (branch_id, name)
    values ((select id from public.branches where code = 'MNL'), 'New MNL Cust');
    get diagnostics affected = row_count;
    assert affected = 1, 'MNL manager can create a Manila customer';
    begin
      insert into public.customers (branch_id, name)
      values ((select id from public.branches where code = 'CEB'), 'Sneaky CEB Cust');
      raise exception 'TEST-FAIL: MNL manager created a Cebu customer';
    exception when insufficient_privilege then null;
    end;
  end $$;
rollback;

\echo ''
\echo '============================================'
\echo '   ALL STAGE 3 MASTER TESTS PASSED'
\echo '============================================'
