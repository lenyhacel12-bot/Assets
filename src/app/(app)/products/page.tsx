import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { listProducts, listUnits, type StatusFilter } from "@/lib/data/master";
import { getTranslations } from "@/i18n/server";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ListControls } from "@/components/data/list-controls";
import { Pagination } from "@/components/data/pagination";
import { ActiveToggle } from "@/components/data/active-toggle";
import { setProductActiveAction } from "./actions";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const t = await getTranslations();
  const canManage = hasPermission(session.permissions, "products.manage");

  const sp = await searchParams;
  const [{ rows, total, page, pageCount }, units] = await Promise.all([
    listProducts({
      q: sp.q,
      page: sp.page ? Number(sp.page) : 1,
      status: (sp.status as StatusFilter) ?? "active",
    }),
    listUnits(),
  ]);
  const unitName = new Map(units.map((u) => [u.id, u.name]));

  return (
    <div>
      <PageHeader
        title={t("nav.products")}
        description={t("product.subtitle")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/products/export">{t("list.export")}</Link>
            </Button>
            {canManage && (
              <>
                <Button asChild variant="outline">
                  <Link href="/products/import">{t("list.import")}</Link>
                </Button>
                <Button asChild>
                  <Link href="/products/new">{t("list.add")}</Link>
                </Button>
              </>
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
                <th className="px-4 py-3">{t("product.sku")}</th>
                <th className="px-4 py-3">{t("product.name")}</th>
                <th className="px-4 py-3">{t("product.baseUnit")}</th>
                <th className="px-4 py-3 text-right">
                  {t("product.regularPrice")}
                </th>
                <th className="px-4 py-3">{t("list.status")}</th>
                <th className="px-4 py-3 text-right">{t("list.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    {unitName.get(p.base_unit_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {Number(p.regular_price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {p.is_active ? t("list.active") : t("list.inactive")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/products/${p.id}`}>{t("list.view")}</Link>
                      </Button>
                      {canManage && (
                        <>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/products/${p.id}/edit`}>
                              {t("list.edit")}
                            </Link>
                          </Button>
                          <ActiveToggle
                            id={p.id}
                            isActive={p.is_active}
                            action={setProductActiveAction}
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
