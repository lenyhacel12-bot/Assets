import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { listCustomerCategories } from "@/lib/data/master";
import { getTranslations } from "@/i18n/server";
import { PageHeader } from "@/components/page-header";
import { CustomerForm } from "@/components/customers/customer-form";
import { createCustomerAction } from "../actions";

export default async function NewCustomerPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.permissions, "customers.manage"))
    redirect("/customers");
  const t = await getTranslations();
  const categories = await listCustomerCategories();

  return (
    <div>
      <PageHeader title={t("customer.newTitle")} />
      <CustomerForm
        action={createCustomerAction}
        branches={session.branches}
        categories={categories}
      />
    </div>
  );
}
