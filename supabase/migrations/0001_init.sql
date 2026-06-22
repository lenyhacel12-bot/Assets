-- ============================================================================
--  Rental Property Management — initial schema
--  Postgres / Supabase.  Single-admin internal tool (Supabase Auth email/pwd).
--  Money stored as numeric(12,2).  All currency displayed as ₱ (PHP) in app.
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
--  Enums
-- ----------------------------------------------------------------------------
create type rental_type     as enum ('bedspace', 'apartment', 'commercial', 'room_rental', 'short_term');
create type billing_cycle   as enum ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly');
create type unit_status     as enum ('vacant', 'occupied', 'under_repair');
create type app_role        as enum ('admin', 'staff');
create type tenant_status   as enum ('active', 'past', 'pending_moveout');
create type payment_status  as enum ('paid', 'pending', 'overdue');
create type payment_method  as enum ('cash', 'gcash', 'bank_transfer', 'check', 'other');
create type expense_category as enum ('repair', 'utilities', 'supplies', 'other');
create type repair_status   as enum ('reported', 'in_progress', 'done');
create type document_type   as enum ('id', 'requirement', 'contract', 'other');

-- ----------------------------------------------------------------------------
--  updated_at helper
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
--  profiles  (one row per Supabase Auth user; carries the app role)
--    Auto-created by a trigger on signup. New users default to 'staff';
--    promote the owner to 'admin' once (see README).
-- ----------------------------------------------------------------------------
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       app_role not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- Create a profile automatically whenever an auth user is created.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'staff')
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Is the current user an admin?  SECURITY DEFINER so it bypasses RLS on
-- profiles (avoids policy recursion) and can be used inside other policies.
create or replace function is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
--  locations
-- ----------------------------------------------------------------------------
create table locations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_locations_updated before update on locations
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
--  units (a.k.a. properties)
-- ----------------------------------------------------------------------------
create table units (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null references locations(id) on delete cascade,
  name          text not null,                -- name or number, e.g. "Bed 3A", "Unit 204"
  rental_type   rental_type not null,
  billing_cycle billing_cycle not null default 'monthly', -- drives payment due-date generation
  monthly_rate  numeric(12,2) not null default 0,         -- rate per billing_cycle period (named 'monthly' for the common case)
  status        unit_status not null default 'vacant',
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_units_location on units(location_id);
create index idx_units_status   on units(status);
create index idx_units_type     on units(rental_type);
create trigger trg_units_updated before update on units
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
--  tenants
-- ----------------------------------------------------------------------------
create table tenants (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  phone             text,
  email             text,
  unit_id           uuid references units(id) on delete set null,
  move_in_date      date,
  contract_end_date date,
  monthly_rate      numeric(12,2) not null default 0,
  deposit_amount    numeric(12,2) not null default 0,  -- security deposit held
  advance_amount    numeric(12,2) not null default 0,  -- advance rent paid up front
  status            tenant_status not null default 'active',
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index idx_tenants_unit     on tenants(unit_id);
create index idx_tenants_status   on tenants(status);
create index idx_tenants_contract on tenants(contract_end_date);
create trigger trg_tenants_updated before update on tenants
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
--  tenant_documents  (files live in Supabase Storage; we store the path)
-- ----------------------------------------------------------------------------
create table tenant_documents (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants(id) on delete cascade,
  doc_type     document_type not null default 'other',
  file_name    text not null,
  storage_path text not null,                 -- path within the 'tenant-documents' bucket
  uploaded_at  timestamptz not null default now()
);
create index idx_tenant_docs_tenant on tenant_documents(tenant_id);

-- ----------------------------------------------------------------------------
--  payments
--    unit_id is denormalized (copied from tenant at creation) for reporting,
--    so a payment's location/unit attribution survives tenant moves.
-- ----------------------------------------------------------------------------
create table payments (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  unit_id    uuid references units(id) on delete set null,
  amount     numeric(12,2) not null,
  due_date   date not null,
  paid_date  date,                            -- null = not yet paid
  status     payment_status not null default 'pending',
  method     payment_method,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_payments_tenant on payments(tenant_id);
create index idx_payments_unit   on payments(unit_id);
create index idx_payments_due    on payments(due_date);
create index idx_payments_status on payments(status);
create trigger trg_payments_updated before update on payments
  for each row execute function set_updated_at();

-- Keep `status` honest: pending payments past their due date become overdue,
-- and setting a paid_date marks them paid. Runs on insert/update of the row.
create or replace function payments_apply_status()
returns trigger language plpgsql as $$
begin
  if new.paid_date is not null then
    new.status := 'paid';
  elsif new.due_date < current_date then
    new.status := 'overdue';
  else
    new.status := 'pending';
  end if;
  return new;
end;
$$;
create trigger trg_payments_status before insert or update on payments
  for each row execute function payments_apply_status();

-- ----------------------------------------------------------------------------
--  expenses  (unit_id null = location-wide expense)
-- ----------------------------------------------------------------------------
create table expenses (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null references locations(id) on delete cascade,
  unit_id      uuid references units(id) on delete set null,
  category     expense_category not null default 'other',
  amount       numeric(12,2) not null,
  expense_date date not null default current_date,
  description  text,
  receipt_path text,                          -- path within the 'receipts' bucket
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index idx_expenses_location on expenses(location_id);
create index idx_expenses_unit     on expenses(unit_id);
create index idx_expenses_date     on expenses(expense_date);
create index idx_expenses_category on expenses(category);
create trigger trg_expenses_updated before update on expenses
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
--  repairs  (optionally linked to an expense once resolved)
-- ----------------------------------------------------------------------------
create table repairs (
  id            uuid primary key default gen_random_uuid(),
  unit_id       uuid not null references units(id) on delete cascade,
  description   text not null,
  status        repair_status not null default 'reported',
  date_reported date not null default current_date,
  date_resolved date,
  cost          numeric(12,2),
  expense_id    uuid references expenses(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_repairs_unit   on repairs(unit_id);
create index idx_repairs_status on repairs(status);
create trigger trg_repairs_updated before update on repairs
  for each row execute function set_updated_at();

-- ============================================================================
--  Helper views (read-only convenience for dashboard / vacancy / reports)
-- ============================================================================

-- Vacancy breakdown per location + rental type.
create view vacancy_summary as
select
  l.id   as location_id,
  l.name as location_name,
  u.rental_type,
  count(*)                                          as total_units,
  count(*) filter (where u.status = 'vacant')       as vacant_units,
  count(*) filter (where u.status = 'occupied')     as occupied_units,
  count(*) filter (where u.status = 'under_repair') as under_repair_units
from units u
join locations l on l.id = u.location_id
group by l.id, l.name, u.rental_type;

-- Monthly collection vs expenses vs profit, per location.
-- Collection = payments actually paid in the month (by paid_date).
create view monthly_pnl as
with paid as (
  select u.location_id,
         date_trunc('month', p.paid_date)::date as month,
         sum(p.amount) as collected
  from payments p
  join units u on u.id = p.unit_id
  where p.paid_date is not null
  group by u.location_id, date_trunc('month', p.paid_date)
),
spent as (
  select e.location_id,
         date_trunc('month', e.expense_date)::date as month,
         sum(e.amount) as spent
  from expenses e
  group by e.location_id, date_trunc('month', e.expense_date)
)
select
  coalesce(paid.location_id, spent.location_id)     as location_id,
  coalesce(paid.month, spent.month)                 as month,
  coalesce(paid.collected, 0)                       as collected,
  coalesce(spent.spent, 0)                          as expenses,
  coalesce(paid.collected, 0) - coalesce(spent.spent, 0) as profit
from paid
full outer join spent
  on paid.location_id = spent.location_id and paid.month = spent.month;

-- ============================================================================
--  Row Level Security
--  Internal tool with two roles. Any authenticated user (admin or staff) can
--  read and write the operational data; only admins can DELETE rows. Anonymous
--  users get nothing.
-- ============================================================================
alter table profiles         enable row level security;
alter table locations        enable row level security;
alter table units            enable row level security;
alter table tenants          enable row level security;
alter table tenant_documents enable row level security;
alter table payments         enable row level security;
alter table expenses         enable row level security;
alter table repairs          enable row level security;

-- Core operational tables: read/insert/update for any authenticated user,
-- delete restricted to admins.
do $$
declare t text;
begin
  foreach t in array array[
    'locations','units','tenants','tenant_documents','payments','expenses','repairs'
  ]
  loop
    execute format($f$create policy "auth read %1$s"   on %1$I for select to authenticated using (true);$f$, t);
    execute format($f$create policy "auth insert %1$s" on %1$I for insert to authenticated with check (true);$f$, t);
    execute format($f$create policy "auth update %1$s" on %1$I for update to authenticated using (true) with check (true);$f$, t);
    execute format($f$create policy "admin delete %1$s" on %1$I for delete to authenticated using (is_admin());$f$, t);
  end loop;
end $$;

-- profiles: everyone authenticated can see the team; only admins can change
-- roles or remove people. (Signup inserts run via the SECURITY DEFINER trigger.)
create policy "auth read profiles"     on profiles for select to authenticated using (true);
create policy "admin insert profiles"  on profiles for insert to authenticated with check (is_admin());
create policy "admin update profiles"  on profiles for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin delete profiles"  on profiles for delete to authenticated using (is_admin());

-- ============================================================================
--  Storage buckets (private) + policies
--  Files are private; the app serves them via short-lived signed URLs.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('tenant-documents', 'tenant-documents', false),
       ('receipts',         'receipts',         false)
on conflict (id) do nothing;

create policy "authenticated read tenant docs"   on storage.objects
  for select to authenticated using (bucket_id = 'tenant-documents');
create policy "authenticated write tenant docs"  on storage.objects
  for insert to authenticated with check (bucket_id = 'tenant-documents');
create policy "authenticated update tenant docs" on storage.objects
  for update to authenticated using (bucket_id = 'tenant-documents');
create policy "authenticated delete tenant docs" on storage.objects
  for delete to authenticated using (bucket_id = 'tenant-documents');

create policy "authenticated read receipts"   on storage.objects
  for select to authenticated using (bucket_id = 'receipts');
create policy "authenticated write receipts"  on storage.objects
  for insert to authenticated with check (bucket_id = 'receipts');
create policy "authenticated update receipts" on storage.objects
  for update to authenticated using (bucket_id = 'receipts');
create policy "authenticated delete receipts" on storage.objects
  for delete to authenticated using (bucket_id = 'receipts');
