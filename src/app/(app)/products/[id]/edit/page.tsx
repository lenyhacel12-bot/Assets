import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getProduct,
  getProductSellingUnits,
  listUnits,
  listProductCategories,
  listBrands,
} from "@/lib/data/master";
import { getTranslations } from "@/i18n/server";
import { PageHeader } from "@/components/page-header";
import { ProductForm } from "@/components/products/product-form";
import { updateProductAction } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.permissions, "products.manage"))
    redirect("/products");
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const t = await getTranslations();
  const [sellingUnits, units, categories, brands] = await Promise.all([
    getProductSellingUnits(id),
    listUnits(),
    listProductCategories(),
    listBrands(),
  ]);

  return (
    <div>
      <PageHeader title={t("product.editTitle")} />
      <ProductForm
        action={updateProductAction.bind(null, id)}
        product={product}
        sellingUnits={sellingUnits}
        units={units}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
