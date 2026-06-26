"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/config/navigation";
import { useTranslation } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * The navigation link list, shared by the desktop sidebar and the mobile sheet.
 * When `collapsed` is true, labels are hidden and icons are centered.
 */
export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t("nav.sections.overview")}
      className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-3"
    >
      {navSections.map((section) => (
        <div key={section.titleKey} className="flex flex-col gap-1">
          {!collapsed && (
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(section.titleKey)}
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? t(item.labelKey) : undefined}
                    data-testid={`nav-${item.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      collapsed && "justify-center px-2",
                      active
                        ? "bg-sidebar-accent text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {!collapsed && <span>{t(item.labelKey)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
