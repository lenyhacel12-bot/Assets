"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/provider";
import {
  previewProductImportAction,
  importProductsAction,
} from "@/app/(app)/products/actions";
import type { ImportAnalysis } from "@/lib/import/products-csv";

export function ProductImport() {
  const { t } = useTranslation();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [csv, setCsv] = useState<string>("");
  const [analysis, setAnalysis] = useState<ImportAnalysis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setCsv(text);
      startTransition(async () => {
        const res = await previewProductImportAction(text);
        if (res.error) toast.error(res.error);
        setAnalysis(res);
      });
    };
    reader.readAsText(file);
  }

  function runImport(validOnly: boolean) {
    startTransition(async () => {
      const res = await importProductsAction(csv, validOnly);
      if (res.error) toast.error(res.error);
      else {
        toast.success(
          `${t("product.imported")}: ${res.inserted} · ${res.skipped} ${t("product.skipped")}`,
        );
        setAnalysis(null);
        setCsv("");
        if (fileRef.current) fileRef.current.value = "";
        router.push("/products");
        router.refresh();
      }
    });
  }

  const hasErrors = (analysis?.errorCount ?? 0) > 0;
  const missing = analysis?.missingColumns ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border bg-card p-6">
        <p className="mb-4 text-sm text-muted-foreground">
          {t("product.importHint")}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            {/* CSV download route, not a page — a plain anchor is intended. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/products/template" download>
              {t("product.downloadTemplate")}
            </a>
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFile}
            aria-label={t("product.chooseFile")}
            className="text-sm"
          />
        </div>
      </div>

      {missing.length > 0 && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t("product.errorsColumn")}: {missing.join(", ")}
        </div>
      )}

      {analysis && missing.length === 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-3 font-semibold">{t("product.preview")}</h2>
          <div className="mb-4 flex gap-6 text-sm">
            <span className="text-emerald-700 dark:text-emerald-400">
              {t("product.validRows")}: {analysis.validCount}
            </span>
            <span className={hasErrors ? "text-destructive" : ""}>
              {t("product.errorRows")}: {analysis.errorCount}
            </span>
          </div>

          {hasErrors && (
            <div className="mb-4 max-h-64 overflow-y-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">{t("product.row")}</th>
                    <th className="px-3 py-2">{t("product.sku")}</th>
                    <th className="px-3 py-2">{t("product.errorsColumn")}</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.rows
                    .filter((r) => r.errors.length > 0)
                    .map((r) => (
                      <tr key={r.rowNumber} className="border-t">
                        <td className="px-3 py-2">{r.rowNumber}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {r.raw.sku}
                        </td>
                        <td className="px-3 py-2 text-destructive">
                          {r.errors.join("; ")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              disabled={pending || analysis.validCount === 0 || hasErrors}
              onClick={() => runImport(false)}
            >
              {t("product.importAll")}
            </Button>
            {hasErrors && analysis.validCount > 0 && (
              <Button
                variant="secondary"
                disabled={pending}
                onClick={() => runImport(true)}
              >
                {t("product.importValidOnly")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
