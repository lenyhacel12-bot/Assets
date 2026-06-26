import { describe, it, expect } from "vitest";
import {
  getClientEnv,
  isSupabaseConfigured,
  formatEnvError,
  publicEnvSchema,
} from "@/lib/env";

describe("environment validation", () => {
  it("accepts a valid public configuration", () => {
    const env = getClientEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("anon-key");
  });

  it("throws a clear, actionable error when variables are missing", () => {
    expect(() =>
      getClientEnv({
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      }),
    ).toThrowError(/NEXT_PUBLIC_SUPABASE_URL/);

    expect(() =>
      getClientEnv({
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      }),
    ).toThrowError(/\.env\.example/);
  });

  it("rejects a malformed URL", () => {
    expect(() =>
      getClientEnv({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toThrowError(/valid URL/);
  });

  it("isSupabaseConfigured reflects presence without throwing", () => {
    expect(
      isSupabaseConfigured({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toBe(true);
    expect(
      isSupabaseConfigured({
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      }),
    ).toBe(false);
  });

  it("formatEnvError lists every offending field", () => {
    const result = publicEnvSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = formatEnvError(result.error);
      expect(message).toContain("NEXT_PUBLIC_SUPABASE_URL");
      expect(message).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
  });
});
