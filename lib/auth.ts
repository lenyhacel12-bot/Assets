import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Returns the signed-in user's email + profile (role, name). Used by the app
// layout and pages that gate admin-only actions.
export async function getSessionProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return {
    email: user.email ?? "",
    profile,
    isAdmin: profile?.role === "admin",
  };
}
