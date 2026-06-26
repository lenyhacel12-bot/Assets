import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { getTranslations } from "@/i18n/server";
import { PageHeader } from "@/components/page-header";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { createSupplierAction } from "../actions";

export default async function NewSupplierPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.permissions, "suppliers.manage"))
    redirect("/suppliers");
  const t = await getTranslations();
  return (
    <div>
      <PageHeader title={t("supplier.newTitle")} />
      <SupplierForm action={createSupplierAction} />
    </div>
  );
}
