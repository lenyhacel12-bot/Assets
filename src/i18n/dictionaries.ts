import en from "./en";
import tl from "./tl";
import type { Locale } from "./config";

/**
 * Recursively replace string-literal leaves (from `en`'s `as const`) with the
 * widened `string` type, while preserving the exact key structure. This lets
 * other locales be type-checked for *key parity* without being forced to use
 * the English text.
 */
type Loosen<T> = {
  [K in keyof T]: T[K] extends string ? string : Loosen<T[K]>;
};

export type Dictionary = Loosen<typeof en>;

export const dictionaries: Record<Locale, Dictionary> = { en, tl };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * Resolve a dot-separated key (e.g. "nav.dashboard") against a dictionary.
 * Returns the key itself if the path is missing, so missing translations are
 * visible rather than crashing. No `any` — traversal is done over `unknown`.
 */
export function resolveKey(dictionary: Dictionary, key: string): string {
  const segments = key.split(".");
  let current: unknown = dictionary;
  for (const segment of segments) {
    if (typeof current === "object" && current !== null && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return key;
    }
  }
  return typeof current === "string" ? current : key;
}
