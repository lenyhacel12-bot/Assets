"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/i18n/provider";
import { Toaster } from "@/components/ui/sonner";
import type { Locale } from "@/i18n/config";

export function AppProviders({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  return (
    <I18nProvider initialLocale={initialLocale}>
      {children}
      <Toaster />
    </I18nProvider>
  );
}
