"use client";

import Link from "next/link";
import { Boxes } from "lucide-react";
import { useTranslation } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function Brand({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Link
      href="/dashboard"
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 px-3 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        collapsed && "justify-center px-2",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Boxes className="size-5" aria-hidden="true" />
      </span>
      {!collapsed && (
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-bold">{t("common.appName")}</span>
          <span className="text-xs text-muted-foreground">
            {t("common.appTagline")}
          </span>
        </span>
      )}
    </Link>
  );
}
