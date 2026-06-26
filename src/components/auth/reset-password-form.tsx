"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type ActionState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, FormMessage } from "./auth-card";
import { SubmitButton } from "./submit-button";
import { useTranslation } from "@/i18n/provider";

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const [state, action] = useActionState<ActionState, FormData>(
    resetPasswordAction,
    {},
  );

  return (
    <AuthCard
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetSubtitle")}
      footer={
        state.success ? (
          <Link
            href="/login"
            className="font-medium text-foreground hover:underline"
          >
            {t("auth.backToSignIn")}
          </Link>
        ) : undefined
      }
    >
      <form action={action} className="flex flex-col gap-4">
        <FormMessage error={state.error} success={state.success} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t("auth.newPassword")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">{t("auth.confirmPassword")}</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <SubmitButton label={t("auth.updatePassword")} className="w-full" />
      </form>
    </AuthCard>
  );
}
