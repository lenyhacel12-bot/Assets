import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import {
  listUnits,
  listProductCategories,
  listBrands,
} from "@/lib/data/master";
import { getTranslations } from "@/i18n/server";
import { PageHeader } from "@/components/page-header";
import { ProductForm } from "@/components/products/product-form";
import { createProductAction } from "../actions";

export default async function NewProductPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.permissions, "products.manage"))
    redirect("/products");
  const t = await getTranslations();
  const [units, categories, brands] = await Promise.all([
    listUnits(),
    listProductCategories(),
    listBrands(),
  ]);

  return (
    <div>
      <PageHeader title={t("product.newTitle")} />
      <ProductForm
        action={createProductAction}
        units={units}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
