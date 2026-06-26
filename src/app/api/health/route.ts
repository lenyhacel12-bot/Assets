import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";

/** Lightweight health/readiness probe. Does not leak secrets. */
export function GET() {
  return NextResponse.json({
    status: "ok",
    app: "3f-enterprises",
    supabaseConfigured: isSupabaseConfigured(),
  });
}
