-- ============================================================================
-- Stage 2 — Seed reference data: branches, roles, permissions, role→permission
-- ============================================================================
-- Idempotent: safe to re-run. Reference data only (no user/PII data).
-- ============================================================================

-- Branches ------------------------------------------------------------------
insert into public.branches (code, name, doc_prefix) values
  ('MNL', 'Manila',    'MNL'),
  ('CEB', 'Cebu',      'CEB'),
  ('PAM', 'Pampanga',  'PAM'),
  ('ANT', 'Antipolo',  'ANT')
on conflict (code) do nothing;

-- Roles ---------------------------------------------------------------------
insert into public.roles (code, name, description) values
  ('owner',            'Owner',            'Full access across all branches'),
  ('general_manager',  'General Manager',  'Company-wide operations management'),
  ('branch_manager',   'Branch Manager',   'Manages a single assigned branch'),
  ('sales_staff',      'Sales Staff',      'Creates sales for the assigned branch'),
  ('cashier',          'Cashier',          'Posts invoices and receives payments'),
  ('warehouse_staff',  'Warehouse Staff',  'Receives, releases and transfers stock'),
  ('purchasing_staff', 'Purchasing Staff', 'Manages suppliers and purchasing'),
  ('accounting_staff', 'Accounting Staff', 'Company-wide accounting access'),
  ('auditor',          'Auditor',          'Read-only access for audit')
on conflict (code) do nothing;

-- Permissions ---------------------------------------------------------------
insert into public.permissions (code, description) values
  ('branches.view_all',      'View data for all branches'),
  ('branches.view_assigned', 'View data for assigned branch(es)'),
  ('products.manage',        'Create and edit products'),
  ('customers.manage',       'Create and edit customers'),
  ('suppliers.manage',       'Create and edit suppliers'),
  ('sales.create',           'Create sales / quotations / orders'),
  ('invoices.post',          'Post sales invoices'),
  ('payments.receive',       'Receive customer payments'),
  ('inventory.release',      'Release / pick inventory'),
  ('inventory.receive',      'Receive inventory'),
  ('inventory.adjust',       'Adjust stock'),
  ('transfers.manage',       'Create and process stock transfers'),
  ('discounts.approve',      'Approve discounts'),
  ('damage.approve',         'Approve damaged inventory'),
  ('transfers.approve',      'Approve stock transfers'),
  ('refunds.approve',        'Approve refunds'),
  ('transactions.cancel',    'Cancel transactions'),
  ('expenses.manage',        'Manage expenses'),
  ('accounting.view',        'View accounting'),
  ('accounting.manage',      'Manage accounting'),
  ('audit.view',             'View audit logs'),
  ('users.manage',           'Manage users, roles and branch assignments'),
  ('settings.manage',        'Manage company settings and branches')
on conflict (code) do nothing;

-- Role → Permission matrix --------------------------------------------------
-- Owner: every permission.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.code = 'owner'
on conflict do nothing;

-- All other roles: explicit mapping.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from (values
  -- General Manager: everything except company settings.
  ('general_manager', 'branches.view_all'),
  ('general_manager', 'products.manage'),
  ('general_manager', 'customers.manage'),
  ('general_manager', 'suppliers.manage'),
  ('general_manager', 'sales.create'),
  ('general_manager', 'invoices.post'),
  ('general_manager', 'payments.receive'),
  ('general_manager', 'inventory.release'),
  ('general_manager', 'inventory.receive'),
  ('general_manager', 'inventory.adjust'),
  ('general_manager', 'transfers.manage'),
  ('general_manager', 'discounts.approve'),
  ('general_manager', 'damage.approve'),
  ('general_manager', 'transfers.approve'),
  ('general_manager', 'refunds.approve'),
  ('general_manager', 'transactions.cancel'),
  ('general_manager', 'expenses.manage'),
  ('general_manager', 'accounting.view'),
  ('general_manager', 'accounting.manage'),
  ('general_manager', 'audit.view'),
  ('general_manager', 'users.manage'),

  -- Branch Manager: assigned branch only; full operational + approvals.
  ('branch_manager', 'branches.view_assigned'),
  ('branch_manager', 'products.manage'),
  ('branch_manager', 'customers.manage'),
  ('branch_manager', 'suppliers.manage'),
  ('branch_manager', 'sales.create'),
  ('branch_manager', 'invoices.post'),
  ('branch_manager', 'payments.receive'),
  ('branch_manager', 'inventory.release'),
  ('branch_manager', 'inventory.receive'),
  ('branch_manager', 'inventory.adjust'),
  ('branch_manager', 'transfers.manage'),
  ('branch_manager', 'discounts.approve'),
  ('branch_manager', 'damage.approve'),
  ('branch_manager', 'transfers.approve'),
  ('branch_manager', 'refunds.approve'),
  ('branch_manager', 'transactions.cancel'),
  ('branch_manager', 'expenses.manage'),
  ('branch_manager', 'accounting.view'),

  -- Sales Staff.
  ('sales_staff', 'branches.view_assigned'),
  ('sales_staff', 'customers.manage'),
  ('sales_staff', 'sales.create'),

  -- Cashier.
  ('cashier', 'branches.view_assigned'),
  ('cashier', 'sales.create'),
  ('cashier', 'invoices.post'),
  ('cashier', 'payments.receive'),

  -- Warehouse Staff.
  ('warehouse_staff', 'branches.view_assigned'),
  ('warehouse_staff', 'inventory.release'),
  ('warehouse_staff', 'inventory.receive'),
  ('warehouse_staff', 'transfers.manage'),

  -- Purchasing Staff.
  ('purchasing_staff', 'branches.view_assigned'),
  ('purchasing_staff', 'suppliers.manage'),
  ('purchasing_staff', 'products.manage'),
  ('purchasing_staff', 'inventory.receive'),

  -- Accounting Staff: all branches, accounting + related posting.
  ('accounting_staff', 'branches.view_all'),
  ('accounting_staff', 'accounting.view'),
  ('accounting_staff', 'accounting.manage'),
  ('accounting_staff', 'payments.receive'),
  ('accounting_staff', 'invoices.post'),
  ('accounting_staff', 'expenses.manage'),

  -- Auditor: read-only across all branches.
  ('auditor', 'branches.view_all'),
  ('auditor', 'accounting.view'),
  ('auditor', 'audit.view')
) as m(role_code, perm_code)
join public.roles r       on r.code = m.role_code
join public.permissions p on p.code = m.perm_code
on conflict do nothing;
