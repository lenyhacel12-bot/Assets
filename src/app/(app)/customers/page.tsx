import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { listCustomers, type StatusFilter } from "@/lib/data/master";
import { getTranslations } from "@/i18n/server";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ListControls } from "@/components/data/list-controls";
import { Pagination } from "@/components/data/pagination";
import { ActiveToggle } from "@/components/data/active-toggle";
import { setCustomerActiveAction } from "./actions";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const t = await getTranslations();
  const canManage = hasPermission(session.permissions, "customers.manage");
  const branchName = new Map(session.branches.map((b) => [b.id, b.name]));

  const sp = await searchParams;
  const { rows, total, page, pageCount } = await listCustomers({
    q: sp.q,
    page: sp.page ? Number(sp.page) : 1,
    status: (sp.status as StatusFilter) ?? "active",
  });

  return (
    <div>
      <PageHeader
        title={t("nav.customers")}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/customers/export">{t("list.export")}</Link>
            </Button>
            {canManage && (
              <Button asChild>
                <Link href="/customers/new">{t("list.add")}</Link>
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
                <th className="px-4 py-3">{t("customer.name")}</th>
                <th className="px-4 py-3">{t("customer.company")}</th>
                <th className="px-4 py-3">{t("customer.branch")}</th>
                <th className="px-4 py-3">{t("customer.creditTerms")}</th>
                <th className="px-4 py-3">{t("list.status")}</th>
                <th className="px-4 py-3 text-right">{t("list.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.company_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {branchName.get(c.branch_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3">{c.credit_terms}</td>
                  <td className="px-4 py-3">
                    {c.is_active ? t("list.active") : t("list.inactive")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/customers/${c.id}`}>
                          {t("list.view")}
                        </Link>
                      </Button>
                      {canManage && (
                        <>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/customers/${c.id}/edit`}>
                              {t("list.edit")}
                            </Link>
                          </Button>
                          <ActiveToggle
                            id={c.id}
                            isActive={c.is_active}
                            action={setCustomerActiveAction}
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
