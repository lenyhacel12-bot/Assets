"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/validation/auth";
import { LOCALE_STORAGE_KEY } from "@/i18n/locale";

export interface ProfileActionState {
  error?: string;
  success?: boolean;
}

/** Update the signed-in user's own name and preferred language. */
export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    preferredLanguage: formData.get("preferredLanguage"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      preferred_language: parsed.data.preferredLanguage,
    })
    .eq("id", session.userId);

  if (error) return { error: "Could not update profile." };

  // Persist the language choice for SSR hydration on the next request.
  (await cookies()).set(LOCALE_STORAGE_KEY, parsed.data.preferredLanguage, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });

  revalidatePath("/profile");
  return { success: true };
}
