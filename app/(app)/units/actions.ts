"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionResult = { error?: string };

function unitPayload(formData: FormData) {
  const rate = Number(formData.get("monthly_rate"));
  return {
    location_id: String(formData.get("location_id") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    rental_type: String(formData.get("rental_type") ?? ""),
    billing_cycle: String(formData.get("billing_cycle") ?? "monthly"),
    monthly_rate: Number.isFinite(rate) ? rate : 0,
    status: String(formData.get("status") ?? "vacant"),
    notes: (String(formData.get("notes") ?? "").trim() || null) as string | null,
  };
}

function validate(p: ReturnType<typeof unitPayload>): string | null {
  if (!p.location_id) return "Location is required.";
  if (!p.name) return "Name / number is required.";
  if (!p.rental_type) return "Rental type is required.";
  if (p.monthly_rate < 0) return "Rate cannot be negative.";
  return null;
}

export async function createUnit(formData: FormData): Promise<ActionResult> {
  const payload = unitPayload(formData);
  const invalid = validate(payload);
  if (invalid) return { error: invalid };

  const supabase = createClient();
  const { error } = await supabase.from("units").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/units");
  revalidatePath("/vacancy");
  revalidatePath("/dashboard");
  return {};
}

export async function updateUnit(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing unit id." };
  const payload = unitPayload(formData);
  const invalid = validate(payload);
  if (invalid) return { error: invalid };

  const supabase = createClient();
  const { error } = await supabase.from("units").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/units");
  revalidatePath("/vacancy");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteUnit(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("units").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/units");
  revalidatePath("/vacancy");
  revalidatePath("/dashboard");
  return {};
}
