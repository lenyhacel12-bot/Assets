import { z } from "zod";

/**
 * Environment variable validation.
 *
 * Validation is performed **lazily** (inside the getter functions) rather than
 * at module load, so that `next build` and statically rendered pages — which do
 * not touch Supabase — never fail merely because secrets are absent. Code paths
 * that genuinely need configuration (Supabase clients, middleware) call the
 * getters and receive a clear, actionable error when a variable is missing.
 */

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ required_error: "NEXT_PUBLIC_SUPABASE_URL is required" })
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string({ required_error: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required" })
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY must not be empty"),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Format a ZodError into a single, human-readable message. */
export function formatEnvError(error: z.ZodError): string {
  const issues = error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  return `Invalid or missing environment variables:\n${issues}\n\nSee .env.example and copy it to .env.local.`;
}

/**
 * Parse the public Supabase configuration. Throws a descriptive error if the
 * required variables are missing or malformed.
 */
export function getClientEnv(
  source: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
): PublicEnv {
  const parsed = publicEnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(formatEnvError(parsed.error));
  }
  return parsed.data;
}

/** Parse server-only configuration (currently the optional service-role key). */
export function getServerEnv(
  source: Record<string, string | undefined> = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(formatEnvError(parsed.error));
  }
  return parsed.data;
}

/**
 * Non-throwing check used by middleware to decide whether Supabase is
 * configured at all (vs. a fresh checkout with no .env.local yet).
 */
export function isSupabaseConfigured(
  source: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
): boolean {
  return publicEnvSchema.safeParse(source).success;
}

// Exported for unit tests.
export { publicEnvSchema, serverEnvSchema };
