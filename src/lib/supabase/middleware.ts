import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getClientEnv, isSupabaseConfigured } from "@/lib/env";
import { decideRouteAccess, isProtectedPath } from "@/lib/auth/route-access";

/**
 * Refresh the Supabase session and enforce coarse route protection.
 *
 * Behaviour:
 *  - If Supabase is not configured (fresh checkout, no .env.local), the app
 *    runs in an "unconfigured" mode: protected routes redirect to /login so no
 *    protected page is ever shown without a session.
 *  - `DEV_PREVIEW=1` (server-only, default OFF) lets developers preview the app
 *    shell before Stage 2 wires real auth. It is documented as temporary
 *    Stage-1 scaffolding (see docs/DECISIONS.md ADR-0012) and is ignored in
 *    production.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const devPreview =
    process.env.NODE_ENV !== "production" && process.env.DEV_PREVIEW === "1";

  let hasSession = devPreview;

  if (isSupabaseConfigured()) {
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
    hasSession = hasSession || Boolean(user);
  } else if (isProtectedPath(pathname)) {
    // Unconfigured: never expose a protected page.
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("reason", "unconfigured");
    return NextResponse.redirect(url);
  }

  const decision = decideRouteAccess({ pathname, hasSession });
  if (decision.type === "redirect") {
    const url = request.nextUrl.clone();
    url.pathname = decision.to;
    return NextResponse.redirect(url);
  }

  return response;
}
