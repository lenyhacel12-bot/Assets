"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/provider";

/** Route-level error boundary for the app shell. */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    // Stage 1: log to the console. Real observability is wired later.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" />
      </span>
      <h1 className="text-xl font-semibold">{t("errors.title")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t("errors.description")}
      </p>
      <Button onClick={reset}>{t("common.retry")}</Button>
    </div>
  );
}
