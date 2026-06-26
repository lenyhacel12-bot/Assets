import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "@/i18n/provider";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { AppShell } from "@/components/shell/app-shell";
import type { Locale } from "@/i18n/config";
import type { ReactNode } from "react";

// usePathname is used by the nav, breadcrumbs and shell.
const pathname = vi.hoisted(() => ({ current: "/dashboard" }));
vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

function renderWithI18n(ui: ReactNode, locale: Locale = "en") {
  return render(<I18nProvider initialLocale={locale}>{ui}</I18nProvider>);
}

describe("application shell", () => {
  it("renders all primary navigation links", () => {
    renderWithI18n(<SidebarNav />);
    expect(screen.getByTestId("nav-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("nav-products")).toBeInTheDocument();
    expect(screen.getByTestId("nav-accounting")).toBeInTheDocument();
    expect(screen.getByTestId("nav-settings")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("marks the active route with aria-current", () => {
    pathname.current = "/products";
    renderWithI18n(<SidebarNav />);
    expect(screen.getByTestId("nav-products")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByTestId("nav-dashboard")).not.toHaveAttribute(
      "aria-current",
    );
    pathname.current = "/dashboard";
  });

  it("renders Tagalog labels when the locale is tl", () => {
    renderWithI18n(<SidebarNav />, "tl");
    expect(screen.getByText("Mga Produkto")).toBeInTheDocument();
    expect(screen.getByText("Mga Setting")).toBeInTheDocument();
  });

  it("renders the shell chrome and main content area", () => {
    renderWithI18n(
      <AppShell>
        <p>module content</p>
      </AppShell>,
    );
    expect(screen.getByTestId("desktop-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-nav-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("branch-selector")).toBeInTheDocument();
    expect(screen.getByTestId("language-selector")).toBeInTheDocument();
    expect(screen.getByTestId("notifications")).toBeInTheDocument();
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    expect(screen.getByText("module content")).toBeInTheDocument();
  });
});
