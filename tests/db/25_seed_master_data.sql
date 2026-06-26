-- ============================================================================
-- TEST FIXTURES — master records (products, customers, suppliers).
-- Runs as the superuser (bypasses RLS) to set up data the RLS tests query.
-- ============================================================================

-- A brand + category
insert into public.brands (id, name) values
  ('40000000-0000-0000-0000-000000000001', 'TestBrand');
insert into public.product_categories (id, name) values
  ('41000000-0000-0000-0000-000000000001', 'Frosted');

-- Products — two variants share a base name but are DISTINCT SKUs.
-- Base unit is "meter"; a roll = 50 meters (standard_roll_length).
insert into public.products
  (id, sku, barcode, name, category_id, brand_id, base_unit_id,
   standard_roll_length, cost, regular_price, is_active)
values
  ('10000000-0000-0000-0000-000000000001', 'FR-4-50', '4806000000011',
   'Frosted Reeded 4 ft x 50 m', '41000000-0000-0000-0000-000000000001',
   '40000000-0000-0000-0000-000000000001',
   (select id from public.units where code = 'meter'), 50, 30, 45, true),
  ('10000000-0000-0000-0000-000000000002', 'FR-5-50', '4806000000028',
   'Frosted Reeded 5 ft x 50 m', '41000000-0000-0000-0000-000000000001',
   '40000000-0000-0000-0000-000000000001',
   (select id from public.units where code = 'meter'), 50, 38, 55, true),
  ('10000000-0000-0000-0000-000000000003', 'INACT-1', null,
   'Discontinued Film', null, null,
   (select id from public.units where code = 'meter'), null, 10, 20, false);

-- Selling units for P1: meter (default) and roll (1 roll = 50 m).
insert into public.product_selling_units
  (product_id, unit_id, conversion_to_base, is_default_sell)
values
  ('10000000-0000-0000-0000-000000000001',
   (select id from public.units where code = 'meter'), 1, true),
  ('10000000-0000-0000-0000-000000000001',
   (select id from public.units where code = 'roll'), 50, false);

-- A supplier (company-wide).
insert into public.suppliers (id, supplier_type, company_name) values
  ('30000000-0000-0000-0000-000000000001', 'local', 'Acme Films Supply');

-- Customers in two different branches.
insert into public.customers (id, branch_id, name, credit_terms) values
  ('20000000-0000-0000-0000-000000000001',
   (select id from public.branches where code = 'MNL'), 'Manila Customer', 'net_30'),
  ('20000000-0000-0000-0000-000000000002',
   (select id from public.branches where code = 'CEB'), 'Cebu Customer', 'cash');

-- A customer-specific negotiated price (Manila customer, P1, per meter).
insert into public.customer_product_prices (customer_id, product_id, unit_id, price)
values
  ('20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   (select id from public.units where code = 'meter'), 42);
