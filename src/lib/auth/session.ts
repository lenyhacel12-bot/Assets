import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Branch, Profile } from "@/lib/types/db";
import type { PermissionCode } from "@/lib/auth/permissions";
import { hasPermission as hasPermissionIn } from "@/lib/auth/permissions";
import { isLocale } from "@/i18n/config";

export interface Session {
  userId: string;
  email: string | null;
  profile: Profile;
  /** Permission codes resolved from the user's roles (RLS-backed). */
  permissions: string[];
  /** Branches the user may see (RLS-filtered). */
  branches: Branch[];
}

/**
 * Load the current session: the authenticated user, their (active) profile,
 * resolved permissions, and visible branches. Returns null when there is no
 * authenticated user OR the profile is deactivated. Memoised per request.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profileRow } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, preferred_language, is_active, last_login_at, created_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profileRow || !profileRow.is_active) return null;

  const profile: Profile = {
    ...profileRow,
    preferred_language: isLocale(profileRow.preferred_language)
      ? profileRow.preferred_language
      : "en",
  };

  // Permissions via RLS-safe join (user_roles is self-readable).
  const { data: permRows } = await supabase
    .from("user_roles")
    .select("roles(role_permissions(permissions(code)))")
    .eq("user_id", user.id);

  const permissions = extractPermissionCodes(permRows);

  const { data: branchRows } = await supabase
    .from("branches")
    .select(
      "id, code, name, address, contact_person, contact_number, email, doc_prefix, is_active",
    )
    .order("code");

  return {
    userId: user.id,
    email: user.email ?? null,
    profile,
    permissions,
    branches: branchRows ?? [],
  };
});

/** Server-side permission guard. */
export async function requirePermission(
  required: PermissionCode,
): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  if (!hasPermissionIn(session.permissions, required)) {
    throw new Error(`Missing required permission: ${required}`);
  }
  return session;
}

/** Narrow the nested PostgREST shape into a flat list of permission codes. */
function extractPermissionCodes(rows: unknown): string[] {
  if (!Array.isArray(rows)) return [];
  const codes = new Set<string>();
  for (const row of rows) {
    const roles = getProp(row, "roles");
    for (const role of asArray(roles)) {
      const rolePerms = getProp(role, "role_permissions");
      for (const rp of asArray(rolePerms)) {
        const perms = getProp(rp, "permissions");
        for (const p of asArray(perms)) {
          const code = getProp(p, "code");
          if (typeof code === "string") codes.add(code);
        }
      }
    }
  }
  return [...codes].sort();
}

function getProp(value: unknown, key: string): unknown {
  if (typeof value === "object" && value !== null && key in value) {
    return (value as Record<string, unknown>)[key];
  }
  return undefined;
}

/** PostgREST returns either an object or an array for embedded relations. */
function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}
