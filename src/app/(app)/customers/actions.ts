"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { customerSchema, customerPriceSchema } from "@/lib/validation/master";

export interface ActionResult {
  error?: string;
  success?: string;
}

async function guard(): Promise<boolean> {
  const session = await getSession();
  return Boolean(
    session && hasPermission(session.permissions, "customers.manage"),
  );
}

function buildCustomerInput(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : "";
  };
  return {
    branch_id: get("branch_id"),
    name: get("name"),
    company_name: get("company_name"),
    contact_person: get("contact_person"),
    contact_number: get("contact_number"),
    email: get("email"),
    billing_address: get("billing_address"),
    tin: get("tin"),
    category_id: get("category_id"),
    credit_terms: get("credit_terms") || "cash",
    credit_term_days: get("credit_term_days") || "0",
    credit_limit: get("credit_limit") || "0",
    tax_classification: get("tax_classification") || "vatable",
    is_withholding_agent: formData.get("is_withholding_agent") === "on",
    notes: get("notes"),
    is_active:
      formData.get("is_active") === "on" || get("is_active") === "true",
  };
}

export async function createCustomerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return { error: "You cannot manage customers." };
  const parsed = customerSchema.safeParse(buildCustomerInput(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error || !data) {
    return {
      error: error?.message.includes("row-level security")
        ? "You can only create customers for your branch."
        : "Could not create the customer.",
    };
  }
  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomerAction(
  customerId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  if (!(await guard())) return { error: "You cannot manage customers." };
  const parsed = customerSchema.safeParse(buildCustomerInput(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update(parsed.data)
    .eq("id", customerId);
  if (error) return { error: "Could not update the customer." };
  revalidatePath("/customers");
  redirect(`/customers/${customerId}`);
}

export async function setCustomerActiveAction(
  customerId: string,
  active: boolean,
): Promise<ActionResult> {
  if (!(await guard())) return { error: "You cannot manage customers." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({ is_active: active })
    .eq("id", customerId);
  if (error) return { error: "Could not update the customer." };
  revalidatePath("/customers");
  return { success: active ? "Customer activated." : "Customer deactivated." };
}

export async function saveCustomerPriceAction(
  customerId: string,
  input: { product_id: string; unit_id: string; price: number },
): Promise<ActionResult> {
  if (!(await guard())) return { error: "You cannot manage customers." };
  const parsed = customerPriceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid price" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("customer_product_prices")
    .upsert(
      { customer_id: customerId, ...parsed.data },
      { onConflict: "customer_id,product_id,unit_id" },
    );
  if (error) return { error: "Could not save the price." };
  revalidatePath(`/customers/${customerId}`);
  return { success: "Price saved." };
}

export async function deleteCustomerPriceAction(
  priceId: string,
  customerId: string,
): Promise<ActionResult> {
  if (!(await guard())) return { error: "You cannot manage customers." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("customer_product_prices")
    .delete()
    .eq("id", priceId);
  if (error) return { error: "Could not delete the price." };
  revalidatePath(`/customers/${customerId}`);
  return { success: "Price removed." };
}
