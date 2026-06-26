import { describe, it, expect } from "vitest";
import {
  PERMISSIONS,
  ROLES,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  canViewAllBranches,
} from "@/lib/auth/permissions";

describe("permission helpers", () => {
  it("defines the full catalogue (23 permissions, 9 roles)", () => {
    expect(PERMISSIONS.length).toBe(23);
    expect(new Set(PERMISSIONS).size).toBe(PERMISSIONS.length);
    expect(ROLES.length).toBe(9);
  });

  const perms = ["sales.create", "branches.view_assigned"];

  it("hasPermission checks membership", () => {
    expect(hasPermission(perms, "sales.create")).toBe(true);
    expect(hasPermission(perms, "users.manage")).toBe(false);
  });

  it("hasAllPermissions requires every code", () => {
    expect(hasAllPermissions(perms, ["sales.create"])).toBe(true);
    expect(hasAllPermissions(perms, ["sales.create", "users.manage"])).toBe(
      false,
    );
  });

  it("hasAnyPermission requires at least one", () => {
    expect(hasAnyPermission(perms, ["users.manage", "sales.create"])).toBe(
      true,
    );
    expect(hasAnyPermission(perms, ["users.manage"])).toBe(false);
  });

  it("canViewAllBranches keys off branches.view_all", () => {
    expect(canViewAllBranches(["branches.view_all"])).toBe(true);
    expect(canViewAllBranches(["branches.view_assigned"])).toBe(false);
  });
});
