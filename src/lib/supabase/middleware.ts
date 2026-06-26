import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getClientEnv, isSupabaseConfigured } from "@/lib/env";
import { decideRouteAccess, isProtectedPath } from "@/lib/auth/route-access";

/**
 * Refresh the Supabase session and enforce coarse route protection.
 *
 * Authenticated users (any valid Supabase session) may enter the protected
 * app shell; unauthenticated users are redirected to /login. Whether the
 * profile is *active* and what the user is *allowed* to do is enforced by the
 * (app) layout + RLS, not here.
 *
 * If Supabase is not configured (fresh checkout, no .env.local), protected
 * routes redirect to /login so no protected page is ever shown.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    if (isProtectedPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("reason", "unconfigured");
      return NextResponse.redirect(url);
    }
    return response;
  }

  const env = getClientEnv();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between client creation and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const decision = decideRouteAccess({
    pathname,
    hasSession: Boolean(user),
  });
  if (decision.type === "redirect") {
    const url = request.nextUrl.clone();
    url.pathname = decision.to;
    return NextResponse.redirect(url);
  }

  return response;
}
