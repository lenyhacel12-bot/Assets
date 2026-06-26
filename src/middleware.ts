import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icons, manifest, robots
     * Always run on routes so session refresh and protection apply.
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|robots.txt).*)",
  ],
};
