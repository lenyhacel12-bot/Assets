"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import {
  inviteUserAction,
  setUserActiveAction,
  updateUserAccessAction,
  type UserActionState,
} from "@/app/(app)/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/auth/submit-button";
import { useTranslation } from "@/i18n/provider";

export interface AdminUser {
  id: string;
  email: string | null;
  fullName: string;
  isActive: boolean;
  lastLogin: string | null;
  roleCodes: string[];
  roleNames: string[];
  branchIds: string[];
}

interface RoleOption {
  code: string;
  name: string;
}
interface BranchOption {
  id: string;
  code: string;
  name: string;
}

export function UsersAdmin({
  currentUserId,
  users,
  roles,
  branches,
}: {
  currentUserId: string;
  users: AdminUser[];
  roles: RoleOption[];
  branches: BranchOption[];
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <InviteForm roles={roles} branches={branches} />
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{t("users.fullName")}</th>
              <th className="px-4 py-3">{t("users.role")}</th>
              <th className="px-4 py-3">{t("users.branches")}</th>
              <th className="px-4 py-3">{t("users.status")}</th>
              <th className="px-4 py-3">{t("users.lastLogin")}</th>
              <th className="px-4 py-3 text-right">{t("users.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  {t("users.noUsers")}
                </td>
              </tr>
            )}
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                roles={roles}
                branches={branches}
                isSelf={user.id === currentUserId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InviteForm({
  roles,
  branches,
}: {
  roles: RoleOption[];
  branches: BranchOption[];
}) {
  const { t } = useTranslation();
  const [state, action] = useActionState<UserActionState, FormData>(
    inviteUserAction,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success(state.success);
  }, [state.success]);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-lg border bg-card p-6"
    >
      <h2 className="flex items-center gap-2 font-semibold">
        <UserPlus className="size-4" /> {t("users.inviteTitle")}
      </h2>
      <FormMessage error={state.error} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-email">{t("users.email")}</Label>
          <Input id="invite-email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-name">{t("users.fullName")}</Label>
          <Input id="invite-name" name="fullName" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-role">{t("users.role")}</Label>
          <select
            id="invite-role"
            name="roleCode"
            defaultValue={roles[0]?.code}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {roles.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">{t("users.branches")}</legend>
        <p className="text-xs text-muted-foreground">
          {t("users.branchesHint")}
        </p>
        <div className="flex flex-wrap gap-3">
          {branches.map((b) => (
            <label key={b.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="branchIds" value={b.id} />
              {b.name}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <SubmitButton label={t("users.sendInvite")} />
      </div>
    </form>
  );
}

function UserRow({
  user,
  roles,
  branches,
  isSelf,
}: {
  user: AdminUser;
  roles: RoleOption[];
  branches: BranchOption[];
  isSelf: boolean;
}) {
  const { t } = useTranslation();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [roleCode, setRoleCode] = useState(user.roleCodes[0] ?? roles[0]?.code);
  const [branchIds, setBranchIds] = useState<string[]>(user.branchIds);

  function toggleActive() {
    startTransition(async () => {
      const res = await setUserActiveAction(user.id, !user.isActive);
      if (res.error) toast.error(res.error);
      else toast.success(res.success ?? "");
    });
  }

  function saveAccess() {
    startTransition(async () => {
      const res = await updateUserAccessAction(
        user.id,
        roleCode ?? "",
        branchIds,
      );
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success ?? "");
        setEditing(false);
      }
    });
  }

  return (
    <>
      <tr className="border-b last:border-0">
        <td className="px-4 py-3">
          <div className="font-medium">{user.fullName || "—"}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </td>
        <td className="px-4 py-3">{user.roleNames.join(", ") || "—"}</td>
        <td className="px-4 py-3">
          {branchListLabel(user.branchIds, branches)}
        </td>
        <td className="px-4 py-3">
          <span
            className={
              user.isActive
                ? "inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                : "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            }
          >
            {user.isActive ? t("users.active") : t("users.inactive")}
          </span>
        </td>
        <td className="px-4 py-3 text-muted-foreground">
          {user.lastLogin
            ? new Date(user.lastLogin).toLocaleDateString()
            : t("profile.never")}
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing((e) => !e)}
            >
              {t("users.edit")}
            </Button>
            <Button
              variant={user.isActive ? "ghost" : "secondary"}
              size="sm"
              disabled={pending || (isSelf && user.isActive)}
              onClick={toggleActive}
            >
              {user.isActive ? t("users.deactivate") : t("users.activate")}
            </Button>
          </div>
        </td>
      </tr>
      {editing && (
        <tr className="border-b bg-muted/30 last:border-0">
          <td colSpan={6} className="px-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 sm:max-w-xs">
                <Label htmlFor={`role-${user.id}`}>{t("users.role")}</Label>
                <select
                  id={`role-${user.id}`}
                  value={roleCode}
                  onChange={(e) => setRoleCode(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {roles.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t("users.branches")}</Label>
                <div className="flex flex-wrap gap-3">
                  {branches.map((b) => (
                    <label
                      key={b.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={branchIds.includes(b.id)}
                        onChange={(e) =>
                          setBranchIds((prev) =>
                            e.target.checked
                              ? [...prev, b.id]
                              : prev.filter((id) => id !== b.id),
                          )
                        }
                      />
                      {b.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={pending} onClick={saveAccess}>
                  {t("users.saveAccess")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function branchListLabel(
  branchIds: string[],
  branches: BranchOption[],
): string {
  if (branchIds.length === 0) return "—";
  return branches
    .filter((b) => branchIds.includes(b.id))
    .map((b) => b.code)
    .join(", ");
}
