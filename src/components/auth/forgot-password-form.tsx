"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type ActionState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, FormMessage } from "./auth-card";
import { SubmitButton } from "./submit-button";
import { useTranslation } from "@/i18n/provider";

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [state, action] = useActionState<ActionState, FormData>(
    forgotPasswordAction,
    {},
  );

  return (
    <AuthCard
      title={t("auth.forgotTitle")}
      subtitle={t("auth.forgotSubtitle")}
      footer={
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          {t("auth.backToSignIn")}
        </Link>
      }
    >
      <form action={action} className="flex flex-col gap-4">
        <FormMessage error={state.error} success={state.success} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <SubmitButton label={t("auth.sendResetLink")} className="w-full" />
      </form>
    </AuthCard>
  );
}
