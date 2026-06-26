"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  updateProfileAction,
  type ProfileActionState,
} from "@/app/(app)/profile/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/auth-card";
import { useTranslation } from "@/i18n/provider";
import { locales, localeNames } from "@/i18n/config";
import type { Profile } from "@/lib/types/db";

export function ProfileForm({
  profile,
  email,
  roleNames,
  branchNames,
}: {
  profile: Profile;
  email: string | null;
  roleNames: string[];
  branchNames: string[];
}) {
  const { t } = useTranslation();
  const [state, action] = useActionState<ProfileActionState, FormData>(
    updateProfileAction,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success(t("profile.saved"));
  }, [state.success, t]);

  const lastLogin = profile.last_login_at
    ? new Date(profile.last_login_at).toLocaleString()
    : t("profile.never");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form
        action={action}
        className="flex flex-col gap-4 rounded-lg border bg-card p-6 lg:col-span-2"
      >
        <FormMessage error={state.error} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">{t("profile.fullName")}</Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={profile.full_name}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t("profile.email")}</Label>
          <Input id="email" value={email ?? ""} disabled readOnly />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preferredLanguage">{t("profile.language")}</Label>
          <select
            id="preferredLanguage"
            name="preferredLanguage"
            defaultValue={profile.preferred_language}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {locales.map((code) => (
              <option key={code} value={code}>
                {localeNames[code]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <SubmitButton label={t("common.save")} />
        </div>
      </form>

      <aside className="flex flex-col gap-4 rounded-lg border bg-card p-6 text-sm">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {t("profile.roles")}
          </p>
          <p className="mt-1">
            {roleNames.length ? roleNames.join(", ") : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {t("profile.branches")}
          </p>
          <p className="mt-1">
            {branchNames.length ? branchNames.join(", ") : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {t("profile.lastLogin")}
          </p>
          <p className="mt-1">{lastLogin}</p>
        </div>
      </aside>
    </div>
  );
}
