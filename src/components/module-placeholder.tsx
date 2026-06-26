"use client";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { useTranslation } from "@/i18n/provider";

/**
 * Standard placeholder for not-yet-built module routes. Renders the module
 * title (from i18n) plus a clear "coming soon" empty state, so the navigation
 * shell is fully explorable in Stage 1 without faking business functionality.
 */
export function ModulePlaceholder({ labelKey }: { labelKey: string }) {
  const { t } = useTranslation();
  const title = t(labelKey);

  return (
    <div data-testid="module-placeholder">
      <PageHeader title={title} description={t("common.comingSoon")} />
      <EmptyState
        title={t("empty.title")}
        description={t("common.notImplemented")}
      />
    </div>
  );
}
