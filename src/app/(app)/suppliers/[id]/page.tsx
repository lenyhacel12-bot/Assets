import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { getSupplier } from "@/lib/data/master";
import { getTranslations } from "@/i18n/server";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DetailList } from "@/components/data/detail-list";

export default async function SupplierViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const supplier = await getSupplier(id);
  if (!supplier) notFound();
  const t = await getTranslations();
  const canManage = hasPermission(session.permissions, "suppliers.manage");

  return (
    <div>
      <PageHeader
        title={supplier.company_name}
        description={t("supplier.viewTitle")}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/suppliers">{t("list.backToList")}</Link>
            </Button>
            {canManage && (
              <Button asChild>
                <Link href={`/suppliers/${id}/edit`}>{t("list.edit")}</Link>
              </Button>
            )}
          </div>
        }
      />
      <DetailList
        items={[
          {
            label: t("supplier.type"),
            value:
              supplier.supplier_type === "local"
                ? t("supplier.local")
                : t("supplier.overseas"),
          },
          {
            label: t("supplier.contactPerson"),
            value: supplier.contact_person,
          },
          {
            label: t("supplier.contactNumber"),
            value: supplier.contact_number,
          },
          { label: t("supplier.email"), value: supplier.email },
          { label: t("supplier.address"), value: supplier.address },
          { label: t("supplier.tin"), value: supplier.tin },
          { label: t("supplier.paymentTerms"), value: supplier.payment_terms },
          { label: t("supplier.currency"), value: supplier.currency_reference },
          { label: t("supplier.notes"), value: supplier.notes },
          {
            label: t("list.status"),
            value: supplier.is_active ? t("list.active") : t("list.inactive"),
          },
        ]}
      />
    </div>
  );
}
