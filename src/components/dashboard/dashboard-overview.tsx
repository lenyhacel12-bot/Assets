"use client";

import {
  Boxes,
  Receipt,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { useTranslation } from "@/i18n/provider";

interface StatCard {
  id: string;
  labelKey: string;
  icon: LucideIcon;
}

const STAT_CARDS: StatCard[] = [
  { id: "sales", labelKey: "nav.sales", icon: TrendingUp },
  { id: "inventory", labelKey: "nav.inventory", icon: Boxes },
  { id: "receivables", labelKey: "nav.receivables", icon: Receipt },
  { id: "cash", labelKey: "nav.cashAndBanks", icon: Wallet },
];

/**
 * Dashboard placeholder. Real KPIs (sales, COGS, gross profit, AR/AP, cash,
 * inventory value, alerts) are built in Stage 10 once their source modules
 * exist. Stage 1 shows the layout and empty states only.
 */
export function DashboardOverview() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("nav.dashboard")}
        description={t("common.appTagline")}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="rounded-lg border bg-card p-4 shadow-sm"
              data-testid={`stat-${card.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {t(card.labelKey)}
                </span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight">—</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("common.comingSoon")}
              </p>
            </div>
          );
        })}
      </div>

      <EmptyState
        title={t("empty.title")}
        description={t("empty.description")}
      />
    </div>
  );
}
