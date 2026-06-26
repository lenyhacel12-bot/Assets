"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  TextField,
  SelectField,
  CheckboxField,
  type SelectOption,
} from "@/components/data/fields";
import { useTranslation } from "@/i18n/provider";
import type { ActionResult } from "@/app/(app)/products/actions";
import type {
  Brand,
  Product,
  ProductCategory,
  SellingUnit,
  Unit,
} from "@/lib/types/master";

type FormAction = (prev: ActionResult, fd: FormData) => Promise<ActionResult>;

export function ProductForm({
  action,
  product,
  sellingUnits,
  units,
  categories,
  brands,
}: {
  action: FormAction;
  product?: Product;
  sellingUnits?: SellingUnit[];
  units: Unit[];
  categories: ProductCategory[];
  brands: Brand[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    {},
  );

  const [rows, setRows] = useState<SellingUnit[]>(
    sellingUnits && sellingUnits.length > 0
      ? sellingUnits
      : units[0]
        ? [
            {
              unit_id: units[0].id,
              conversion_to_base: 1,
              is_default_sell: true,
            },
          ]
        : [],
  );

  const unitOptions: SelectOption[] = units.map((u) => ({
    value: u.id,
    label: u.name,
  }));
  const categoryOptions: SelectOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const brandOptions: SelectOption[] = brands.map((b) => ({
    value: b.id,
    label: b.name,
  }));
  const vatOptions: SelectOption[] = [
    { value: "vatable", label: t("product.vatable") },
    { value: "vat_exempt", label: t("product.vatExempt") },
    { value: "zero_rated", label: t("product.zeroRated") },
    { value: "no_vat", label: t("product.noVat") },
  ];

  function updateRow(i: number, patch: Partial<SellingUnit>) {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  }
  function setDefault(i: number) {
    setRows((prev) =>
      prev.map((r, idx) => ({ ...r, is_default_sell: idx === i })),
    );
  }
  function addRow() {
    if (!units[0]) return;
    setRows((prev) => [
      ...prev,
      { unit_id: units[0]!.id, conversion_to_base: 1, is_default_sell: false },
    ]);
  }
  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form
      action={formAction}
      className="flex max-w-4xl flex-col gap-6 rounded-lg border bg-card p-6"
    >
      <FormMessage error={state.error} />
      <input type="hidden" name="selling_units" value={JSON.stringify(rows)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="sku"
          label={t("product.sku")}
          defaultValue={product?.sku}
          required
        />
        <TextField
          name="name"
          label={t("product.name")}
          defaultValue={product?.name}
          required
        />
        <TextField
          name="barcode"
          label={t("product.barcode")}
          defaultValue={product?.barcode}
        />
        <SelectField
          name="base_unit_id"
          label={t("product.baseUnit")}
          options={unitOptions}
          defaultValue={product?.base_unit_id ?? unitOptions[0]?.value}
          required
        />
        <SelectField
          name="purchase_unit_id"
          label={t("product.purchaseUnit")}
          options={unitOptions}
          defaultValue={product?.purchase_unit_id}
          includeBlank
        />
        <SelectField
          name="category_id"
          label={t("product.category")}
          options={categoryOptions}
          defaultValue={product?.category_id}
          includeBlank
        />
        <SelectField
          name="brand_id"
          label={t("product.brand")}
          options={brandOptions}
          defaultValue={product?.brand_id}
          includeBlank
        />
        <TextField
          name="standard_roll_length"
          label={t("product.standardRollLength")}
          type="number"
          step="0.0001"
          defaultValue={product?.standard_roll_length}
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold">
          {t("product.pricing")}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            name="cost"
            label={t("product.cost")}
            type="number"
            step="0.0001"
            defaultValue={product?.cost ?? 0}
          />
          <TextField
            name="regular_price"
            label={t("product.regularPrice")}
            type="number"
            step="0.0001"
            defaultValue={product?.regular_price ?? 0}
          />
          <TextField
            name="distributor_price"
            label={t("product.distributorPrice")}
            type="number"
            step="0.0001"
            defaultValue={product?.distributor_price}
          />
          <SelectField
            name="vat_classification"
            label={t("product.vat")}
            options={vatOptions}
            defaultValue={product?.vat_classification ?? "vatable"}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold">
          {t("product.attributes")}
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField name="color" label="Color" defaultValue={product?.color} />
          <TextField name="width" label="Width" defaultValue={product?.width} />
          <TextField
            name="thickness"
            label="Thickness"
            defaultValue={product?.thickness}
          />
          <TextField
            name="design"
            label="Design"
            defaultValue={product?.design}
          />
          <TextField name="shade" label="Shade" defaultValue={product?.shade} />
          <TextField name="model" label="Model" defaultValue={product?.model} />
          <TextField
            name="wattage"
            label="Wattage"
            defaultValue={product?.wattage}
          />
          <TextField
            name="capacity"
            label="Capacity"
            defaultValue={product?.capacity}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-semibold">
            {t("product.sellingUnits")}
          </legend>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="size-4" /> {t("product.addSellingUnit")}
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex flex-wrap items-end gap-3 rounded-md border p-3"
            >
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium">{t("product.unit")}</span>
                <select
                  value={row.unit_id}
                  onChange={(e) => updateRow(i, { unit_id: e.target.value })}
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
                <span className="font-medium">{t("product.conversion")}</span>
                <Input
                  type="number"
                  step="0.000001"
                  value={row.conversion_to_base}
                  onChange={(e) =>
                    updateRow(i, { conversion_to_base: Number(e.target.value) })
                  }
                  className="w-32"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="default_sell"
                  checked={row.is_default_sell}
                  onChange={() => setDefault(i)}
                />
                {t("product.default")}
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRow(i)}
                aria-label={t("list.deactivate")}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </fieldset>

      <CheckboxField
        name="is_active"
        label={t("list.active")}
        defaultChecked={product ? product.is_active : true}
      />

      <div className="flex gap-2">
        <SubmitButton label={t("list.save")} />
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
