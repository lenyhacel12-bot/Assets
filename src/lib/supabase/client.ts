import { createBrowserClient } from "@supabase/ssr";
import { getClientEnv } from "@/lib/env";

/**
 * Supabase client for use in Client Components (browser).
 *
 * Uses the anon/public key only — every request is constrained by Row Level
 * Security. The service-role key must never reach this layer.
 */
export function createClient() {
  const env = getClientEnv();
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
