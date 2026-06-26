"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  saveCustomerPriceAction,
  deleteCustomerPriceAction,
} from "@/app/(app)/customers/actions";
import { useTranslation } from "@/i18n/provider";
import type { CustomerProductPrice, Product, Unit } from "@/lib/types/master";

export function CustomerPrices({
  customerId,
  prices,
  products,
  units,
  canManage,
}: {
  customerId: string;
  prices: CustomerProductPrice[];
  products: Pick<Product, "id" | "name" | "sku">[];
  units: Unit[];
  canManage: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [unitId, setUnitId] = useState(units[0]?.id ?? "");
  const [price, setPrice] = useState("");

  const productName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? id;
  const unitName = (id: string) => units.find((u) => u.id === id)?.name ?? id;

  function add() {
    startTransition(async () => {
      const res = await saveCustomerPriceAction(customerId, {
        product_id: productId,
        unit_id: unitId,
        price: Number(price),
      });
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success ?? "");
        setPrice("");
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteCustomerPriceAction(id, customerId);
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success ?? "");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-4 font-semibold">{t("customer.prices")}</h2>

      {prices.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("customer.noPrices")}
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="py-2">{t("customer.product")}</th>
              <th className="py-2">{t("customer.unit")}</th>
              <th className="py-2">{t("customer.price")}</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {prices.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2">{productName(p.product_id)}</td>
                <td className="py-2">{unitName(p.unit_id)}</td>
                <td className="py-2">{Number(p.price).toFixed(2)}</td>
                <td className="py-2 text-right">
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pending}
                      onClick={() => remove(p.id)}
                      aria-label={t("list.deactivate")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {canManage && products.length > 0 && (
        <div className="mt-4 flex flex-wrap items-end gap-3 border-t pt-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t("customer.product")}</span>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t("customer.unit")}</span>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t("customer.price")}</span>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-32"
            />
          </label>
          <Button onClick={add} disabled={pending || !price}>
            {t("customer.addPrice")}
          </Button>
        </div>
      )}
    </div>
  );
}
