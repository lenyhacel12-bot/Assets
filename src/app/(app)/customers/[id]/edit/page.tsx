import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { getCustomer, listCustomerCategories } from "@/lib/data/master";
import { getTranslations } from "@/i18n/server";
import { PageHeader } from "@/components/page-header";
import { CustomerForm } from "@/components/customers/customer-form";
import { updateCustomerAction } from "../../actions";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.permissions, "customers.manage"))
    redirect("/customers");
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();
  const t = await getTranslations();
  const categories = await listCustomerCategories();

  return (
    <div>
      <PageHeader title={t("customer.editTitle")} />
      <CustomerForm
        action={updateCustomerAction.bind(null, id)}
        customer={customer}
        branches={session.branches}
        categories={categories}
      />
    </div>
  );
}
