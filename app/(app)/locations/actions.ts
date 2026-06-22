"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionResult = { error?: string };

function locationPayload(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    address: (String(formData.get("address") ?? "").trim() || null) as string | null,
    notes: (String(formData.get("notes") ?? "").trim() || null) as string | null,
  };
}

export async function createLocation(formData: FormData): Promise<ActionResult> {
  const payload = locationPayload(formData);
  if (!payload.name) return { error: "Name is required." };

  const supabase = createClient();
  const { error } = await supabase.from("locations").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/locations");
  revalidatePath("/units");
  return {};
}

export async function updateLocation(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing location id." };
  const payload = locationPayload(formData);
  if (!payload.name) return { error: "Name is required." };

  const supabase = createClient();
  const { error } = await supabase.from("locations").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/locations");
  revalidatePath("/units");
  return {};
}

export async function deleteLocation(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/locations");
  revalidatePath("/units");
  return {};
}
