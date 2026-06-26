import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getCustomer,
  getCustomerPrices,
  listActiveProductsLite,
  listCustomerCategories,
  listUnits,
} from "@/lib/data/master";
import { getTranslations } from "@/i18n/server";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DetailList } from "@/components/data/detail-list";
import { CustomerPrices } from "@/components/customers/customer-prices";

export default async function CustomerViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const t = await getTranslations();
  const canManage = hasPermission(session.permissions, "customers.manage");
  const [prices, products, units, categories] = await Promise.all([
    getCustomerPrices(id),
    listActiveProductsLite(),
    listUnits(),
    listCustomerCategories(),
  ]);
  const categoryName = categories.find(
    (c) => c.id === customer.category_id,
  )?.name;
  const branchName = session.branches.find(
    (b) => b.id === customer.branch_id,
  )?.name;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={customer.name}
        description={t("customer.viewTitle")}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/customers">{t("list.backToList")}</Link>
            </Button>
            {canManage && (
              <Button asChild>
                <Link href={`/customers/${id}/edit`}>{t("list.edit")}</Link>
              </Button>
            )}
          </div>
        }
      />
      <DetailList
        items={[
          { label: t("customer.branch"), value: branchName },
          { label: t("customer.company"), value: customer.company_name },
          { label: t("customer.category"), value: categoryName },
          {
            label: t("customer.contactPerson"),
            value: customer.contact_person,
          },
          {
            label: t("customer.contactNumber"),
            value: customer.contact_number,
          },
          { label: t("customer.email"), value: customer.email },
          {
            label: t("customer.billingAddress"),
            value: customer.billing_address,
          },
          { label: t("customer.tin"), value: customer.tin },
          { label: t("customer.creditTerms"), value: customer.credit_terms },
          {
            label: t("customer.creditLimit"),
            value: Number(customer.credit_limit).toFixed(2),
          },
          { label: t("customer.taxClass"), value: customer.tax_classification },
          {
            label: t("list.status"),
            value: customer.is_active ? t("list.active") : t("list.inactive"),
          },
        ]}
      />
      <CustomerPrices
        customerId={id}
        prices={prices}
        products={products}
        units={units}
        canManage={canManage}
      />
    </div>
  );
}
