import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { readLocaleFromCookie, LOCALE_STORAGE_KEY } from "@/i18n/locale";

export const metadata: Metadata = {
  title: {
    default: "3F Enterprises",
    template: "%s · 3F Enterprises",
  },
  description: "Inventory, Sales & Accounting for 3F Enterprises",
  manifest: "/manifest.webmanifest",
  applicationName: "3F Enterprises",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "3F Enterprises",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = readLocaleFromCookie(
    cookieStore.get(LOCALE_STORAGE_KEY)?.value,
  );

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-svh antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <AppProviders initialLocale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}
