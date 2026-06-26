import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { getSupplier } from "@/lib/data/master";
import { getTranslations } from "@/i18n/server";
import { PageHeader } from "@/components/page-header";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { updateSupplierAction } from "../../actions";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.permissions, "suppliers.manage"))
    redirect("/suppliers");
  const { id } = await params;
  const supplier = await getSupplier(id);
  if (!supplier) notFound();
  const t = await getTranslations();

  return (
    <div>
      <PageHeader title={t("supplier.editTitle")} />
      <SupplierForm
        action={updateSupplierAction.bind(null, id)}
        supplier={supplier}
      />
    </div>
  );
}
