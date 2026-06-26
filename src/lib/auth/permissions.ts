/**
 * Permission and role codes — the single source of truth on the app side,
 * mirroring the seed in supabase/migrations/20260101000004_seed_rbac.sql.
 * Authorization checks use permission codes, never role names (see SECURITY_PLAN).
 */

export const PERMISSIONS = [
  "branches.view_all",
  "branches.view_assigned",
  "products.manage",
  "customers.manage",
  "suppliers.manage",
  "sales.create",
  "invoices.post",
  "payments.receive",
  "inventory.release",
  "inventory.receive",
  "inventory.adjust",
  "transfers.manage",
  "discounts.approve",
  "damage.approve",
  "transfers.approve",
  "refunds.approve",
  "transactions.cancel",
  "expenses.manage",
  "accounting.view",
  "accounting.manage",
  "audit.view",
  "users.manage",
  "settings.manage",
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number];

export const ROLES = [
  "owner",
  "general_manager",
  "branch_manager",
  "sales_staff",
  "cashier",
  "warehouse_staff",
  "purchasing_staff",
  "accounting_staff",
  "auditor",
] as const;

export type RoleCode = (typeof ROLES)[number];

/** True if `permissions` contains `required`. */
export function hasPermission(
  permissions: readonly string[],
  required: PermissionCode,
): boolean {
  return permissions.includes(required);
}

/** True if `permissions` contains every code in `required`. */
export function hasAllPermissions(
  permissions: readonly string[],
  required: readonly PermissionCode[],
): boolean {
  return required.every((r) => permissions.includes(r));
}

/** True if `permissions` contains at least one code in `required`. */
export function hasAnyPermission(
  permissions: readonly string[],
  required: readonly PermissionCode[],
): boolean {
  return required.some((r) => permissions.includes(r));
}

export function canViewAllBranches(permissions: readonly string[]): boolean {
  return hasPermission(permissions, "branches.view_all");
}
