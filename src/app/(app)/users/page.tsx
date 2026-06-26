import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { UsersAdmin, type AdminUser } from "@/components/users/users-admin";
import { getTranslations } from "@/i18n/server";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const t = await getTranslations();

  if (!hasPermission(session.permissions, "users.manage")) {
    return (
      <div>
        <PageHeader title={t("users.title")} />
        <EmptyState
          title={t("errors.forbiddenTitle")}
          description={t("errors.forbiddenDescription")}
        />
      </div>
    );
  }

  const supabase = await createClient();
  const [
    { data: profiles },
    { data: userRoles },
    { data: userBranches },
    { data: roles },
    { data: branches },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, is_active, last_login_at")
      .order("full_name"),
    supabase.from("user_roles").select("user_id, roles(code, name)"),
    supabase.from("user_branches").select("user_id, branch_id"),
    supabase.from("roles").select("code, name").order("name"),
    supabase.from("branches").select("id, code, name").order("code"),
  ]);

  const rolesByUser = new Map<string, { code: string; name: string }[]>();
  for (const row of userRoles ?? []) {
    const r = row as { user_id: string; roles?: unknown };
    const roleObj = Array.isArray(r.roles) ? r.roles[0] : r.roles;
    if (
      roleObj &&
      typeof roleObj === "object" &&
      "code" in roleObj &&
      "name" in roleObj
    ) {
      const list = rolesByUser.get(r.user_id) ?? [];
      list.push({
        code: String((roleObj as { code: unknown }).code),
        name: String((roleObj as { name: unknown }).name),
      });
      rolesByUser.set(r.user_id, list);
    }
  }

  const branchesByUser = new Map<string, string[]>();
  for (const row of userBranches ?? []) {
    const r = row as { user_id: string; branch_id: string };
    const list = branchesByUser.get(r.user_id) ?? [];
    list.push(r.branch_id);
    branchesByUser.set(r.user_id, list);
  }

  const users: AdminUser[] = (profiles ?? []).map((p) => {
    const userRoleList = rolesByUser.get(p.id) ?? [];
    return {
      id: p.id,
      email: p.email,
      fullName: p.full_name,
      isActive: p.is_active,
      lastLogin: p.last_login_at,
      roleCodes: userRoleList.map((r) => r.code),
      roleNames: userRoleList.map((r) => r.name),
      branchIds: branchesByUser.get(p.id) ?? [],
    };
  });

  return (
    <div>
      <PageHeader title={t("users.title")} description={t("users.subtitle")} />
      <UsersAdmin
        currentUserId={session.userId}
        users={users}
        roles={roles ?? []}
        branches={branches ?? []}
      />
    </div>
  );
}
