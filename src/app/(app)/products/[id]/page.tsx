import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { DetailList } from "@/components/data/detail-list";

export default async function ProductViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const t = await getTranslations();
  const canManage = hasPermission(session.permissions, "products.manage");
  const [sellingUnits, units, categories, brands] = await Promise.all([
    getProductSellingUnits(id),
    listUnits(),
    listProductCategories(),
    listBrands(),
  ]);
  const unitName = new Map(units.map((u) => [u.id, u.name]));
  const categoryName = categories.find(
    (c) => c.id === product.category_id,
  )?.name;
  const brandName = brands.find((b) => b.id === product.brand_id)?.name;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={product.name}
        description={product.sku}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/products">{t("list.backToList")}</Link>
            </Button>
            {canManage && (
              <Button asChild>
                <Link href={`/products/${id}/edit`}>{t("list.edit")}</Link>
              </Button>
            )}
          </div>
        }
      />
      <DetailList
        items={[
          { label: t("product.barcode"), value: product.barcode },
          { label: t("product.category"), value: categoryName },
          { label: t("product.brand"), value: brandName },
          {
            label: t("product.baseUnit"),
            value: unitName.get(product.base_unit_id),
          },
          {
            label: t("product.standardRollLength"),
            value: product.standard_roll_length,
          },
          { label: t("product.cost"), value: Number(product.cost).toFixed(4) },
          {
            label: t("product.regularPrice"),
            value: Number(product.regular_price).toFixed(4),
          },
          { label: t("product.vat"), value: product.vat_classification },
          {
            label: t("list.status"),
            value: product.is_active ? t("list.active") : t("list.inactive"),
          },
        ]}
      />
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-3 font-semibold">{t("product.sellingUnits")}</h2>
        {sellingUnits.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("product.none")}</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {sellingUnits.map((su, i) => (
              <li key={i}>
                {unitName.get(su.unit_id)} — {su.conversion_to_base}{" "}
                {su.is_default_sell ? `(${t("product.default")})` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
