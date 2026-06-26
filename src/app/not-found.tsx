"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/provider";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-bold">404</p>
      <h1 className="text-xl font-semibold">{t("errors.notFoundTitle")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t("errors.notFoundDescription")}
      </p>
      <Button asChild>
        <Link href="/dashboard">{t("common.goToDashboard")}</Link>
      </Button>
    </div>
  );
}
