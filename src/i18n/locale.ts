import { isLocale, defaultLocale, type Locale } from "./config";

/**
 * Server-safe locale helpers (no "use client"). These can be imported from
 * Server Components (e.g. the root layout) as well as client code.
 */

export const LOCALE_STORAGE_KEY = "3f.locale";

/** Read a preferred locale from a cookie string, with a safe default. */
export function readLocaleFromCookie(cookieValue: string | undefined): Locale {
  if (cookieValue && isLocale(cookieValue)) return cookieValue;
  return defaultLocale;
}
