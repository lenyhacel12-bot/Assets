import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { getTranslations } from "@/i18n/server";
import { PageHeader } from "@/components/page-header";
import { ProductImport } from "@/components/products/product-import";

export default async function ProductImportPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.permissions, "products.manage"))
    redirect("/products");
  const t = await getTranslations();

  return (
    <div>
      <PageHeader title={t("product.importTitle")} />
      <ProductImport />
    </div>
  );
}
