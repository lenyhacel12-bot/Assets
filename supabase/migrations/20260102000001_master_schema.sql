-- ============================================================================
-- Stage 3 — Master records: products (per-variant SKU), customers, suppliers
-- ============================================================================
-- Conventions: UUID PKs, audit columns, soft-delete via is_active, numeric for
-- money/quantities. The product catalogue is company-wide (no branch_id);
-- per-branch settings live in product_branch_settings. Customers are
-- branch-owned (branch_id) and gated by can_view_branch via RLS (Stage 2).
-- ============================================================================

-- Reference: units of measure -----------------------------------------------
create table public.units (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,           -- roll | meter | piece | liter | box
  name       text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- Reference: product categories & brands ------------------------------------
create table public.product_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  parent_id  uuid references public.product_categories(id) on delete set null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_product_categories_updated_at
  before update on public.product_categories
  for each row execute function app.set_updated_at();

create table public.brands (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- Suppliers -----------------------------------------------------------------
create table public.suppliers (
  id                 uuid primary key default gen_random_uuid(),
  supplier_type      text not null default 'local'
                       check (supplier_type in ('local', 'overseas')),
  company_name       text not null,
  contact_person     text,
  contact_number     text,
  email              text,
  address            text,
  tin                text,
  payment_terms      text,
  currency_reference text,
  notes              text,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid references public.profiles(id)
);
create trigger trg_suppliers_updated_at
  before update on public.suppliers
  for each row execute function app.set_updated_at();

create index idx_suppliers_active on public.suppliers (is_active);
create index idx_suppliers_name on public.suppliers (lower(company_name));

-- Products — ONE ROW PER VARIANT/SKU ----------------------------------------
create table public.products (
  id                   uuid primary key default gen_random_uuid(),
  sku                  text not null unique,
  barcode              text unique,
  name                 text not null,
  category_id          uuid references public.product_categories(id) on delete set null,
  brand_id             uuid references public.brands(id) on delete set null,
  -- Variant attributes (every combination is a distinct SKU/row)
  color                text,
  width                text,
  thickness            text,
  design               text,
  shade                text,
  model                text,
  wattage              text,
  capacity             text,
  description          text,
  image_path           text,
  -- Units & conversion
  base_unit_id         uuid not null references public.units(id) on delete restrict,
  purchase_unit_id     uuid references public.units(id) on delete restrict,
  standard_roll_length numeric(18,4),
  -- Pricing (money in numeric, never float)
  cost                 numeric(18,4) not null default 0,
  regular_price        numeric(18,4) not null default 0,
  distributor_price    numeric(18,4),
  -- Tax & sourcing
  vat_classification   text not null default 'vatable'
                         check (vat_classification in
                           ('vatable', 'vat_exempt', 'zero_rated', 'no_vat')),
  preferred_supplier_id uuid references public.suppliers(id) on delete set null,
  is_active            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  created_by           uuid references public.profiles(id)
);
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function app.set_updated_at();

create index idx_products_active on public.products (is_active);
create index idx_products_name on public.products (lower(name));
create index idx_products_category on public.products (category_id);

-- Selling units (a product may sell in several units) ------------------------
create table public.product_selling_units (
  id                 uuid primary key default gen_random_uuid(),
  product_id         uuid not null references public.products(id) on delete cascade,
  unit_id            uuid not null references public.units(id) on delete restrict,
  -- How many BASE units one of this selling unit equals (e.g. 1 roll = 50 m).
  conversion_to_base numeric(18,6) not null check (conversion_to_base > 0),
  is_default_sell    boolean not null default false,
  unique (product_id, unit_id)
);
create index idx_psu_product on public.product_selling_units (product_id);

-- Quantity price tiers -------------------------------------------------------
create table public.product_price_tiers (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  unit_id    uuid not null references public.units(id) on delete restrict,
  min_qty    numeric(18,4) not null check (min_qty > 0),
  price      numeric(18,4) not null check (price >= 0),
  unique (product_id, unit_id, min_qty)
);
create index idx_ppt_product on public.product_price_tiers (product_id);

-- Per-branch product settings (min stock level) ------------------------------
create table public.product_branch_settings (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  branch_id       uuid not null references public.branches(id) on delete cascade,
  min_stock_level numeric(18,4) not null default 0,
  unique (product_id, branch_id)
);
create index idx_pbs_branch on public.product_branch_settings (branch_id);

-- Supplier ⇄ product --------------------------------------------------------
create table public.supplier_products (
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  primary key (supplier_id, product_id)
);

-- Customer categories (configurable) ----------------------------------------
create table public.customer_categories (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  name       text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- Customers (branch-owned) ---------------------------------------------------
create table public.customers (
  id                  uuid primary key default gen_random_uuid(),
  branch_id           uuid not null references public.branches(id) on delete restrict,
  name                text not null,
  company_name        text,
  contact_person      text,
  contact_number      text,
  email               text,
  billing_address     text,
  tin                 text,
  category_id         uuid references public.customer_categories(id) on delete set null,
  credit_terms        text not null default 'cash'
                        check (credit_terms in
                          ('cash', 'net_15', 'net_30', 'net_45', 'net_60', 'custom')),
  credit_term_days    integer not null default 0 check (credit_term_days >= 0),
  credit_limit        numeric(18,2) not null default 0 check (credit_limit >= 0),
  tax_classification  text not null default 'vatable'
                        check (tax_classification in
                          ('vatable', 'vat_exempt', 'zero_rated', 'no_vat')),
  is_withholding_agent boolean not null default false,
  notes               text,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references public.profiles(id)
);
create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function app.set_updated_at();

create index idx_customers_branch on public.customers (branch_id);
create index idx_customers_active on public.customers (is_active);
create index idx_customers_name on public.customers (lower(name));

create table public.customer_delivery_addresses (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label       text not null,
  address     text not null,
  created_at  timestamptz not null default now()
);
create index idx_cda_customer on public.customer_delivery_addresses (customer_id);

-- Customer-specific negotiated prices ---------------------------------------
create table public.customer_product_prices (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  unit_id     uuid not null references public.units(id) on delete restrict,
  price       numeric(18,4) not null check (price >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (customer_id, product_id, unit_id)
);
create trigger trg_cpp_updated_at
  before update on public.customer_product_prices
  for each row execute function app.set_updated_at();
create index idx_cpp_customer on public.customer_product_prices (customer_id);
create index idx_cpp_product on public.customer_product_prices (product_id);
