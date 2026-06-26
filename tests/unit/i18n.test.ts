import { describe, it, expect } from "vitest";
import en from "@/i18n/en";
import tl from "@/i18n/tl";
import { resolveKey, dictionaries } from "@/i18n/dictionaries";
import { locales } from "@/i18n/config";
import { readLocaleFromCookie } from "@/i18n/provider";

/** Collect all dot-paths that resolve to string leaves. */
function leafKeys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [];
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") keys.push(path);
    else keys.push(...leafKeys(v, path));
  }
  return keys;
}

describe("i18n dictionaries", () => {
  it("exposes both locales", () => {
    expect(locales).toContain("en");
    expect(locales).toContain("tl");
  });

  it("Tagalog has exactly the same keys as English", () => {
    const enKeys = leafKeys(en).sort();
    const tlKeys = leafKeys(tl).sort();
    expect(tlKeys).toEqual(enKeys);
  });

  it("resolves nested keys and falls back to the key when missing", () => {
    expect(resolveKey(dictionaries.en, "nav.dashboard")).toBe("Dashboard");
    expect(resolveKey(dictionaries.tl, "nav.products")).toBe("Mga Produkto");
    expect(resolveKey(dictionaries.en, "nav.missing.key")).toBe(
      "nav.missing.key",
    );
  });

  it("reads a locale from a cookie with a safe default", () => {
    expect(readLocaleFromCookie("tl")).toBe("tl");
    expect(readLocaleFromCookie("xx")).toBe("en");
    expect(readLocaleFromCookie(undefined)).toBe("en");
  });
});
