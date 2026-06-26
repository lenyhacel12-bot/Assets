"use client";

import { Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/provider";

/**
 * Placeholder sign-in screen. Real Supabase authentication (sign-in, forgot/
 * reset password, invitations) is implemented in Stage 2. The form here is
 * inert and intentionally does not submit credentials anywhere.
 */
export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes className="size-6" aria-hidden="true" />
        </span>
        <h1 className="text-lg font-bold">{t("auth.signInTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.signInSubtitle")}
        </p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => e.preventDefault()}
        aria-describedby="auth-placeholder-notice"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            {t("auth.email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            {t("auth.password")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          />
        </div>
        <Button type="submit" disabled className="w-full">
          {t("auth.signIn")}
        </Button>
      </form>

      <p
        id="auth-placeholder-notice"
        className="mt-4 rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground"
      >
        {t("auth.placeholderNotice")}
      </p>
    </div>
  );
}
