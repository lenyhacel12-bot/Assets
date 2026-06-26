"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { findNavItemByPath } from "@/config/navigation";
import { useTranslation } from "@/i18n/provider";

/**
 * Breadcrumb trail: Home → current module. Kept simple in Stage 1; deeper
 * record-level crumbs are added by individual modules later.
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const current = findNavItemByPath(pathname);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 rounded outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Home className="size-3.5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">
              {t("shell.breadcrumbHome")}
            </span>
          </Link>
        </li>
        {current && current.href !== "/dashboard" && (
          <Fragment>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <li
              aria-current="page"
              className="truncate font-medium text-foreground"
            >
              {t(current.labelKey)}
            </li>
          </Fragment>
        )}
        {current && current.href === "/dashboard" && (
          <Fragment>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <li
              aria-current="page"
              className="truncate font-medium text-foreground"
            >
              {t(current.labelKey)}
            </li>
          </Fragment>
        )}
      </ol>
    </nav>
  );
}
