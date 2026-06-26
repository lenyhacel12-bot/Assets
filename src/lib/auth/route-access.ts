/**
 * Pure route-access helpers (no I/O) so the protection logic is unit-testable.
 *
 * Stage 1 implements *coarse* gating: authenticated users may enter the app
 * shell; unauthenticated users are redirected to the login page. Fine-grained,
 * permission-based authorization arrives in Stage 2.
 */

/** Path prefixes that belong to the public/auth area (no session required). */
const PUBLIC_PREFIXES = [
  "/login",
  "/forgot-password",
  "/reset-password",
] as const;

/** Path prefixes that are always allowed (static assets, manifest, etc.). */
const ALWAYS_ALLOWED_PREFIXES = [
  "/_next",
  "/favicon",
  "/icons",
  "/manifest.webmanifest",
  "/api/health",
] as const;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isAlwaysAllowed(pathname: string): boolean {
  return ALWAYS_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p));
}

/** A protected path is anything in the app shell that is not public/allowed. */
export function isProtectedPath(pathname: string): boolean {
  if (isAlwaysAllowed(pathname)) return false;
  if (isPublicPath(pathname)) return false;
  return true;
}

export type RouteDecision =
  | { type: "allow" }
  | { type: "redirect"; to: string };

/**
 * Decide what to do with a request given whether the path is protected and
 * whether the user has a session. Login page is hidden from already-signed-in
 * users (sent to the dashboard).
 */
export function decideRouteAccess(params: {
  pathname: string;
  hasSession: boolean;
}): RouteDecision {
  const { pathname, hasSession } = params;

  if (isAlwaysAllowed(pathname)) return { type: "allow" };

  if (isPublicPath(pathname)) {
    if (hasSession && (pathname === "/login" || pathname === "/")) {
      return { type: "redirect", to: "/dashboard" };
    }
    return { type: "allow" };
  }

  // Protected.
  if (!hasSession) {
    return { type: "redirect", to: "/login" };
  }
  return { type: "allow" };
}
