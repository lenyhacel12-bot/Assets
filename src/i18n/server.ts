import "server-only";
import { cookies } from "next/headers";
import { getDictionary, resolveKey } from "./dictionaries";
import { readLocaleFromCookie, LOCALE_STORAGE_KEY } from "./locale";

/**
 * Server-side translator for Server Components. Reads the preferred locale from
 * the cookie and returns a `t(key)` function (same dot-key semantics as the
 * client `useTranslation` hook).
 */
export async function getTranslations(): Promise<(key: string) => string> {
  const cookieStore = await cookies();
  const locale = readLocaleFromCookie(
    cookieStore.get(LOCALE_STORAGE_KEY)?.value,
  );
  const dictionary = getDictionary(locale);
  return (key: string) => resolveKey(dictionary, key);
}
