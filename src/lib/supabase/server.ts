import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getClientEnv } from "@/lib/env";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Supabase client for use in Server Components, Route Handlers and Server
 * Actions. Built per request from the user's session cookies and constrained by
 * Row Level Security.
 *
 * The service-role key is intentionally NOT used here — privileged admin paths
 * (Stage 2+) construct a separate, server-only client.
 */
export async function createClient() {
  const env = getClientEnv();
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // `setAll` can be called from a Server Component, where setting
            // cookies is not allowed. Session refresh is handled in middleware,
            // so this can be safely ignored.
          }
        },
      },
    },
  );
}
