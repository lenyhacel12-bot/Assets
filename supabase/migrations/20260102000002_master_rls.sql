-- ============================================================================
-- Stage 3 — RLS for master records
-- ============================================================================
-- Catalogue (units, categories, brands, products, selling units, tiers,
-- suppliers, supplier_products) is company-wide: any ACTIVE authenticated user
-- may read; writes require the relevant *.manage permission. There are NO
-- DELETE policies on master tables — records are soft-deleted via is_active.
--
-- Customers (and their child rows) are branch-owned: visibility uses
-- can_view_branch(branch_id); writes require customers.manage AND branch access.
-- ============================================================================

alter table public.units                      enable row level security;
alter table public.product_categories         enable row level security;
alter table public.brands                      enable row level security;
alter table public.suppliers                   enable row level security;
alter table public.supplier_products           enable row level security;
alter table public.products                    enable row level security;
alter table public.product_selling_units       enable row level security;
alter table public.product_price_tiers         enable row level security;
alter table public.product_branch_settings     enable row level security;
alter table public.customer_categories         enable row level security;
alter table public.customers                   enable row level security;
alter table public.customer_delivery_addresses enable row level security;
alter table public.customer_product_prices     enable row level security;

-- Helper: a readable catalogue policy = any active user -----------------------
-- (active is required so deactivated users see nothing.)

-- ---- Units / categories / brands (read-all; manage via products.manage) -----
grant select, insert, update on public.units to authenticated;
grant select, insert, update on public.product_categories to authenticated;
grant select, insert, update on public.brands to authenticated;

create policy units_select on public.units
  for select to authenticated using (app.is_active());
create policy units_manage on public.units
  for all to authenticated
  using (app.has_permission('products.manage'))
  with check (app.has_permission('products.manage'));

create policy categories_select on public.product_categories
  for select to authenticated using (app.is_active());
create policy categories_manage on public.product_categories
  for all to authenticated
  using (app.has_permission('products.manage'))
  with check (app.has_permission('products.manage'));

create policy brands_select on public.brands
  for select to authenticated using (app.is_active());
create policy brands_manage on public.brands
  for all to authenticated
  using (app.has_permission('products.manage'))
  with check (app.has_permission('products.manage'));

-- ---- Suppliers --------------------------------------------------------------
grant select, insert, update on public.suppliers to authenticated;
grant select, insert, update, delete on public.supplier_products to authenticated;

create policy suppliers_select on public.suppliers
  for select to authenticated using (app.is_active());
create policy suppliers_insert on public.suppliers
  for insert to authenticated
  with check (app.has_permission('suppliers.manage'));
create policy suppliers_update on public.suppliers
  for update to authenticated
  using (app.has_permission('suppliers.manage'))
  with check (app.has_permission('suppliers.manage'));

create policy supplier_products_select on public.supplier_products
  for select to authenticated using (app.is_active());
create policy supplier_products_manage on public.supplier_products
  for all to authenticated
  using (app.has_permission('suppliers.manage'))
  with check (app.has_permission('suppliers.manage'));

-- ---- Products & children ----------------------------------------------------
grant select, insert, update on public.products to authenticated;
grant select, insert, update, delete on public.product_selling_units to authenticated;
grant select, insert, update, delete on public.product_price_tiers to authenticated;
grant select, insert, update, delete on public.product_branch_settings to authenticated;

create policy products_select on public.products
  for select to authenticated using (app.is_active());
create policy products_insert on public.products
  for insert to authenticated
  with check (app.has_permission('products.manage'));
create policy products_update on public.products
  for update to authenticated
  using (app.has_permission('products.manage'))
  with check (app.has_permission('products.manage'));

create policy psu_select on public.product_selling_units
  for select to authenticated using (app.is_active());
create policy psu_manage on public.product_selling_units
  for all to authenticated
  using (app.has_permission('products.manage'))
  with check (app.has_permission('products.manage'));

create policy ppt_select on public.product_price_tiers
  for select to authenticated using (app.is_active());
create policy ppt_manage on public.product_price_tiers
  for all to authenticated
  using (app.has_permission('products.manage'))
  with check (app.has_permission('products.manage'));

-- Per-branch settings: visible to users who can see that branch.
create policy pbs_select on public.product_branch_settings
  for select to authenticated using (app.can_view_branch(branch_id));
create policy pbs_manage on public.product_branch_settings
  for all to authenticated
  using (app.has_permission('products.manage') and app.can_view_branch(branch_id))
  with check (app.has_permission('products.manage') and app.can_view_branch(branch_id));

-- ---- Customer categories (read-all; manage via customers.manage) ------------
grant select, insert, update on public.customer_categories to authenticated;
create policy customer_categories_select on public.customer_categories
  for select to authenticated using (app.is_active());
create policy customer_categories_manage on public.customer_categories
  for all to authenticated
  using (app.has_permission('customers.manage'))
  with check (app.has_permission('customers.manage'));

-- ---- Customers (branch-owned) -----------------------------------------------
grant select, insert, update on public.customers to authenticated;

create policy customers_select on public.customers
  for select to authenticated
  using (app.can_view_branch(branch_id));
create policy customers_insert on public.customers
  for insert to authenticated
  with check (
    app.has_permission('customers.manage') and app.can_view_branch(branch_id)
  );
create policy customers_update on public.customers
  for update to authenticated
  using (app.has_permission('customers.manage') and app.can_view_branch(branch_id))
  with check (app.has_permission('customers.manage') and app.can_view_branch(branch_id));

-- ---- Customer child rows: inherit the parent customer's visibility ----------
grant select, insert, update, delete on public.customer_delivery_addresses to authenticated;
grant select, insert, update, delete on public.customer_product_prices to authenticated;

create policy cda_select on public.customer_delivery_addresses
  for select to authenticated
  using (exists (
    select 1 from public.customers c
    where c.id = customer_id and app.can_view_branch(c.branch_id)
  ));
create policy cda_manage on public.customer_delivery_addresses
  for all to authenticated
  using (
    app.has_permission('customers.manage') and exists (
      select 1 from public.customers c
      where c.id = customer_id and app.can_view_branch(c.branch_id)
    )
  )
  with check (
    app.has_permission('customers.manage') and exists (
      select 1 from public.customers c
      where c.id = customer_id and app.can_view_branch(c.branch_id)
    )
  );

create policy cpp_select on public.customer_product_prices
  for select to authenticated
  using (exists (
    select 1 from public.customers c
    where c.id = customer_id and app.can_view_branch(c.branch_id)
  ));
create policy cpp_manage on public.customer_product_prices
  for all to authenticated
  using (
    app.has_permission('customers.manage') and exists (
      select 1 from public.customers c
      where c.id = customer_id and app.can_view_branch(c.branch_id)
    )
  )
  with check (
    app.has_permission('customers.manage') and exists (
      select 1 from public.customers c
      where c.id = customer_id and app.can_view_branch(c.branch_id)
    )
  );
