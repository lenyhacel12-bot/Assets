"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/provider";

export function Pagination({
  page,
  pageCount,
  total,
}: {
  page: number;
  pageCount: number;
  total: number;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function goto(p: number) {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(p));
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {t("list.showing")} {total} {t("list.results")}
      </span>
      <div className="flex items-center gap-3">
        <span>
          {t("list.page")} {page} {t("list.of")} {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => goto(page - 1)}
        >
          {t("list.prev")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => goto(page + 1)}
        >
          {t("list.next")}
        </Button>
      </div>
    </div>
  );
}
