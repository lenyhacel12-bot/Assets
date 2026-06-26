import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { listSuppliers, type StatusFilter } from "@/lib/data/master";
import { getTranslations } from "@/i18n/server";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ListControls } from "@/components/data/list-controls";
import { Pagination } from "@/components/data/pagination";
import { ActiveToggle } from "@/components/data/active-toggle";
import { setSupplierActiveAction } from "./actions";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const t = await getTranslations();
  const canManage = hasPermission(session.permissions, "suppliers.manage");

  const sp = await searchParams;
  const { rows, total, page, pageCount } = await listSuppliers({
    q: sp.q,
    page: sp.page ? Number(sp.page) : 1,
    status: (sp.status as StatusFilter) ?? "active",
  });

  return (
    <div>
      <PageHeader
        title={t("nav.suppliers")}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/suppliers/export">{t("list.export")}</Link>
            </Button>
            {canManage && (
              <Button asChild>
                <Link href="/suppliers/new">{t("list.add")}</Link>
              </Button>
            )}
          </div>
        }
      />
      <ListControls />
      {rows.length === 0 ? (
        <EmptyState title={t("list.noResults")} />
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("supplier.company")}</th>
                <th className="px-4 py-3">{t("supplier.type")}</th>
                <th className="px-4 py-3">{t("supplier.contactPerson")}</th>
                <th className="px-4 py-3">{t("list.status")}</th>
                <th className="px-4 py-3 text-right">{t("list.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{s.company_name}</td>
                  <td className="px-4 py-3">
                    {s.supplier_type === "local"
                      ? t("supplier.local")
                      : t("supplier.overseas")}
                  </td>
                  <td className="px-4 py-3">{s.contact_person ?? "—"}</td>
                  <td className="px-4 py-3">
                    {s.is_active ? t("list.active") : t("list.inactive")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/suppliers/${s.id}`}>
                          {t("list.view")}
                        </Link>
                      </Button>
                      {canManage && (
                        <>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/suppliers/${s.id}/edit`}>
                              {t("list.edit")}
                            </Link>
                          </Button>
                          <ActiveToggle
                            id={s.id}
                            isActive={s.is_active}
                            action={setSupplierActiveAction}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pageCount={pageCount} total={total} />
    </div>
  );
}
