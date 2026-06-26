import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getClientEnv } from "@/lib/env";

/**
 * Service-role Supabase client. SERVER-ONLY — the `server-only` import makes the
 * build fail if this module is ever pulled into a client bundle. Bypasses RLS,
 * so every caller MUST first verify the acting user's permission (e.g.
 * users.manage). Used for privileged tasks such as user invitation.
 *
 * Throws a clear error if the service-role key is not configured.
 */
export function createAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getClientEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations. See .env.example.",
    );
  }
  return createSupabaseClient(NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
