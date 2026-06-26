"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { supplierSchema } from "@/lib/validation/master";

export interface ActionResult {
  error?: string;
  success?: string;
}

async function guard(): Promise<boolean> {
  const session = await getSession();
  return Boolean(
    session && hasPermission(session.permissions, "suppliers.manage"),
  );
}

function buildSupplierInput(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : "";
  };
  return {
    supplier_type: get("supplier_type") || "local",
    company_name: get("company_name"),
    contact_person: get("contact_person"),
    contact_number: get("contact_number"),
    email: get("email"),
    address: get("address"),
    tin: get("tin"),
    payment_terms: get("payment_terms"),
    currency_reference: get("currency_reference"),
    notes: get("notes"),
    is_active:
      formData.get("is_active") === "on" || get("is_active") === "true",
  };
}

export async function createSupplierAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return { error: "You cannot manage suppliers." };
  const parsed = supplierSchema.safeParse(buildSupplierInput(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error || !data) return { error: "Could not create the supplier." };
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function updateSupplierAction(
  supplierId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return { error: "You cannot manage suppliers." };
  const parsed = supplierSchema.safeParse(buildSupplierInput(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update(parsed.data)
    .eq("id", supplierId);
  if (error) return { error: "Could not update the supplier." };
  revalidatePath("/suppliers");
  redirect(`/suppliers/${supplierId}`);
}

export async function setSupplierActiveAction(
  supplierId: string,
  active: boolean,
): Promise<ActionResult> {
  if (!(await guard())) return { error: "You cannot manage suppliers." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({ is_active: active })
    .eq("id", supplierId);
  if (error) return { error: "Could not update the supplier." };
  revalidatePath("/suppliers");
  return { success: active ? "Supplier activated." : "Supplier deactivated." };
}
