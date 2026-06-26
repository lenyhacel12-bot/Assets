"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type ActionState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, FormMessage } from "./auth-card";
import { SubmitButton } from "./submit-button";
import { useTranslation } from "@/i18n/provider";

export function LoginForm({ unconfigured }: { unconfigured?: boolean }) {
  const { t } = useTranslation();
  const [state, action] = useActionState<ActionState, FormData>(
    signInAction,
    {},
  );
  const notice = unconfigured ? t("auth.unconfiguredNotice") : undefined;

  return (
    <AuthCard
      title={t("auth.signInTitle")}
      subtitle={t("auth.signInSubtitle")}
      footer={
        <Link
          href="/forgot-password"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          {t("auth.forgotPassword")}
        </Link>
      }
    >
      <form action={action} className="flex flex-col gap-4">
        {notice && <FormMessage error={notice} />}
        <FormMessage error={state.error} />
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <SubmitButton label={t("auth.signIn")} className="w-full" />
      </form>
    </AuthCard>
  );
}
