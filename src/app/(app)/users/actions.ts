"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { inviteUserSchema } from "@/lib/validation/auth";
import { ROLES, type RoleCode } from "@/lib/auth/permissions";

export interface UserActionState {
  error?: string;
  success?: string;
}

async function requireUsersManage() {
  const session = await getSession();
  if (!session || !hasPermission(session.permissions, "users.manage")) {
    return null;
  }
  return session;
}

/** Invite a new user, then set their name, role and branch assignments. */
export async function inviteUserAction(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const session = await requireUsersManage();
  if (!session) return { error: "You do not have permission to manage users." };

  const parsed = inviteUserSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    roleCode: formData.get("roleCode"),
    branchIds: formData.getAll("branchIds").map(String),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { email, fullName, roleCode, branchIds } = parsed.data;

  const admin = createAdminClient();

  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
    });
  if (inviteError || !invited.user) {
    return { error: inviteError?.message ?? "Could not invite user." };
  }
  const userId = invited.user.id;

  // The handle_new_user trigger created the profile; fill in the details.
  await admin
    .from("profiles")
    .update({ full_name: fullName, email })
    .eq("id", userId);

  const { data: role } = await admin
    .from("roles")
    .select("id")
    .eq("code", roleCode)
    .single();
  if (role) {
    await admin
      .from("user_roles")
      .upsert({ user_id: userId, role_id: role.id });
  }

  if (branchIds.length > 0) {
    await admin
      .from("user_branches")
      .upsert(branchIds.map((branch_id) => ({ user_id: userId, branch_id })));
  }

  revalidatePath("/users");
  return { success: "Invitation sent." };
}

/** Activate or deactivate a user (cannot deactivate yourself). */
export async function setUserActiveAction(
  userId: string,
  active: boolean,
): Promise<UserActionState> {
  const session = await requireUsersManage();
  if (!session) return { error: "You do not have permission to manage users." };
  if (userId === session.userId && !active) {
    return { error: "You cannot deactivate your own account." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: active })
    .eq("id", userId);
  if (error) return { error: "Could not update the user." };

  revalidatePath("/users");
  return { success: active ? "User activated." : "User deactivated." };
}

/** Replace a user's role and branch assignments. */
export async function updateUserAccessAction(
  userId: string,
  roleCode: string,
  branchIds: string[],
): Promise<UserActionState> {
  const session = await requireUsersManage();
  if (!session) return { error: "You do not have permission to manage users." };
  if (!ROLES.includes(roleCode as RoleCode)) {
    return { error: "Invalid role." };
  }

  const supabase = await createClient();

  const { data: role } = await supabase
    .from("roles")
    .select("id")
    .eq("code", roleCode)
    .single();
  if (!role) return { error: "Role not found." };

  await supabase.from("user_roles").delete().eq("user_id", userId);
  const { error: roleErr } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role_id: role.id });
  if (roleErr) return { error: "Could not update role." };

  await supabase.from("user_branches").delete().eq("user_id", userId);
  if (branchIds.length > 0) {
    const { error: branchErr } = await supabase
      .from("user_branches")
      .insert(branchIds.map((branch_id) => ({ user_id: userId, branch_id })));
    if (branchErr) return { error: "Could not update branches." };
  }

  revalidatePath("/users");
  return { success: "Access updated." };
}
