"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/provider";

/** Search box + status filter that drive the list via URL query params. */
export function ListControls() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page"); // any filter change resets pagination
    startTransition(() => router.push(`${pathname}?${sp.toString()}`));
  }

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <form
        className="flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          const value = new FormData(e.currentTarget).get("q");
          update({ q: typeof value === "string" ? value : "" });
        }}
      >
        <Input
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder={t("list.search")}
          aria-label={t("list.search")}
          className="max-w-sm"
        />
      </form>
      <select
        aria-label={t("list.status")}
        defaultValue={params.get("status") ?? "active"}
        onChange={(e) => update({ status: e.target.value })}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="active">{t("list.active")}</option>
        <option value="inactive">{t("list.inactive")}</option>
        <option value="all">{t("list.all")}</option>
      </select>
    </div>
  );
}
