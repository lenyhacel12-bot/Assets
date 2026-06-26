"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultLocale, type Locale } from "./config";
import { dictionaries, resolveKey, type Dictionary } from "./dictionaries";
import { LOCALE_STORAGE_KEY, readLocaleFromCookie } from "./locale";

interface I18nContextValue {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  /** Translate a dot-separated key, e.g. t("nav.dashboard"). */
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = defaultLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
        document.cookie = `${LOCALE_STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = next;
      } catch {
        // Ignore storage errors (e.g. privacy mode).
      }
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[locale];
    return {
      locale,
      dictionary,
      setLocale,
      t: (key: string) => resolveKey(dictionary, key),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}

// Re-export server-safe helpers for convenience to client consumers.
export { LOCALE_STORAGE_KEY, readLocaleFromCookie };
