"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { productSchema } from "@/lib/validation/master";
import {
  analyzeProductImport,
  type ImportAnalysis,
  type ParsedProductRow,
} from "@/lib/import/products-csv";

export interface ActionResult {
  error?: string;
  success?: string;
}

export interface ImportSummary {
  inserted: number;
  skipped: number;
  errorRows: number;
  error?: string;
}

async function guard(): Promise<boolean> {
  const session = await getSession();
  return Boolean(
    session && hasPermission(session.permissions, "products.manage"),
  );
}

function buildProductInput(formData: FormData) {
  const sellingUnitsRaw = formData.get("selling_units");
  let selling_units: unknown = [];
  if (typeof sellingUnitsRaw === "string" && sellingUnitsRaw.trim()) {
    try {
      selling_units = JSON.parse(sellingUnitsRaw);
    } catch {
      selling_units = [];
    }
  }
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : "";
  };
  return {
    sku: get("sku"),
    name: get("name"),
    barcode: get("barcode"),
    category_id: get("category_id"),
    brand_id: get("brand_id"),
    color: get("color"),
    width: get("width"),
    thickness: get("thickness"),
    design: get("design"),
    shade: get("shade"),
    model: get("model"),
    wattage: get("wattage"),
    capacity: get("capacity"),
    description: get("description"),
    base_unit_id: get("base_unit_id"),
    purchase_unit_id: get("purchase_unit_id"),
    standard_roll_length: get("standard_roll_length"),
    cost: get("cost"),
    regular_price: get("regular_price"),
    distributor_price: get("distributor_price"),
    vat_classification: get("vat_classification") || "vatable",
    preferred_supplier_id: get("preferred_supplier_id"),
    is_active:
      formData.get("is_active") === "on" || get("is_active") === "true",
    selling_units,
  };
}

async function replaceSellingUnits(
  productId: string,
  baseUnitId: string,
  units: {
    unit_id: string;
    conversion_to_base: number;
    is_default_sell: boolean;
  }[],
) {
  const supabase = await createClient();
  await supabase
    .from("product_selling_units")
    .delete()
    .eq("product_id", productId);
  const rows =
    units.length > 0
      ? units
      : [{ unit_id: baseUnitId, conversion_to_base: 1, is_default_sell: true }];
  await supabase.from("product_selling_units").insert(
    rows.map((u) => ({
      product_id: productId,
      unit_id: u.unit_id,
      conversion_to_base: u.conversion_to_base,
      is_default_sell: u.is_default_sell,
    })),
  );
}

export async function createProductAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return { error: "You cannot manage products." };

  const parsed = productSchema.safeParse(buildProductInput(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { selling_units, ...product } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select("id")
    .single();
  if (error || !data) {
    return {
      error: error?.message.includes("duplicate")
        ? "A product with that SKU or barcode already exists."
        : "Could not create the product.",
    };
  }
  await replaceSellingUnits(data.id, product.base_unit_id, selling_units);
  revalidatePath("/products");
  redirect("/products");
}

export async function updateProductAction(
  productId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return { error: "You cannot manage products." };

  const parsed = productSchema.safeParse(buildProductInput(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { selling_units, ...product } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update(product)
    .eq("id", productId);
  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "A product with that SKU or barcode already exists."
        : "Could not update the product.",
    };
  }
  await replaceSellingUnits(productId, product.base_unit_id, selling_units);
  revalidatePath("/products");
  redirect(`/products/${productId}`);
}

export async function setProductActiveAction(
  productId: string,
  active: boolean,
): Promise<ActionResult> {
  if (!(await guard())) return { error: "You cannot manage products." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: active })
    .eq("id", productId);
  if (error) return { error: "Could not update the product." };
  revalidatePath("/products");
  return { success: active ? "Product activated." : "Product deactivated." };
}

async function buildImportContext() {
  const supabase = await createClient();
  const [{ data: unitRows }, { data: productRows }] = await Promise.all([
    supabase.from("units").select("id, code"),
    supabase.from("products").select("sku, barcode"),
  ]);
  const unitByCode = new Map<string, string>(
    (unitRows ?? []).map((u) => [u.code.toLowerCase(), u.id]),
  );
  const existingSkus = new Set<string>();
  const existingBarcodes = new Set<string>();
  for (const r of productRows ?? []) {
    if (r.sku) existingSkus.add(r.sku);
    if (r.barcode) existingBarcodes.add(r.barcode);
  }
  return { unitByCode, existingSkus, existingBarcodes };
}

/** Validate an uploaded CSV against the DB (does NOT import). */
export async function previewProductImportAction(
  csvText: string,
): Promise<ImportAnalysis & { error?: string }> {
  if (!(await guard())) {
    return {
      missingColumns: [],
      rows: [],
      validCount: 0,
      errorCount: 0,
      error: "Forbidden",
    };
  }
  const { unitByCode, existingSkus, existingBarcodes } =
    await buildImportContext();
  return analyzeProductImport(csvText, {
    unitCodes: [...unitByCode.keys()],
    existingSkus,
    existingBarcodes,
  });
}

/**
 * Re-validate the CSV server-side (authoritative) and import. With
 * `validOnly`, valid rows import even if others fail; otherwise an all-or-
 * nothing rule applies (any error → import nothing).
 */
export async function importProductsAction(
  csvText: string,
  validOnly: boolean,
): Promise<ImportSummary> {
  if (!(await guard())) {
    return { inserted: 0, skipped: 0, errorRows: 0, error: "Forbidden" };
  }
  const supabase = await createClient();
  const { unitByCode, existingSkus, existingBarcodes } =
    await buildImportContext();

  const analysis = analyzeProductImport(csvText, {
    unitCodes: [...unitByCode.keys()],
    existingSkus,
    existingBarcodes,
  });

  if (analysis.missingColumns.length > 0) {
    return {
      inserted: 0,
      skipped: 0,
      errorRows: 0,
      error: `Missing required columns: ${analysis.missingColumns.join(", ")}`,
    };
  }
  if (analysis.errorCount > 0 && !validOnly) {
    return {
      inserted: 0,
      skipped: analysis.validCount,
      errorRows: analysis.errorCount,
      error:
        "Import cancelled: fix the errors or choose valid-rows-only import.",
    };
  }

  const validRows = analysis.rows
    .filter((r) => r.data)
    .map((r) => r.data as ParsedProductRow);

  let inserted = 0;
  for (const row of validRows) {
    const baseUnitId = unitByCode.get(row.base_unit);
    if (!baseUnitId) continue;
    const categoryId = row.category
      ? await resolveByName(supabase, "product_categories", row.category)
      : null;
    const brandId = row.brand
      ? await resolveByName(supabase, "brands", row.brand)
      : null;

    const { data: prod, error } = await supabase
      .from("products")
      .insert({
        sku: row.sku,
        name: row.name,
        barcode: row.barcode,
        base_unit_id: baseUnitId,
        category_id: categoryId,
        brand_id: brandId,
        cost: row.cost,
        regular_price: row.regular_price,
        distributor_price: row.distributor_price,
        vat_classification: row.vat_classification,
        standard_roll_length: row.standard_roll_length,
        color: row.color,
        width: row.width,
        thickness: row.thickness,
      })
      .select("id")
      .single();
    if (error || !prod) continue;
    await supabase.from("product_selling_units").insert({
      product_id: prod.id,
      unit_id: baseUnitId,
      conversion_to_base: 1,
      is_default_sell: true,
    });
    inserted++;
  }

  revalidatePath("/products");
  return {
    inserted,
    skipped: analysis.validCount - inserted,
    errorRows: analysis.errorCount,
  };
}

/** Resolve a category/brand by name (case-insensitive), creating it if absent. */
async function resolveByName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "product_categories" | "brands",
  name: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .ilike("name", name)
    .maybeSingle();
  if (existing) return existing.id;
  const { data: created } = await supabase
    .from(table)
    .insert({ name })
    .select("id")
    .single();
  return created?.id ?? null;
}
