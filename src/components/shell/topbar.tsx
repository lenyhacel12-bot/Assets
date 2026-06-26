"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { Breadcrumbs } from "./breadcrumbs";
import { BranchSelector } from "./branch-selector";
import { LanguageSelector } from "./language-selector";
import { Notifications } from "./notifications";
import { UserMenu } from "./user-menu";
import { useTranslation } from "@/i18n/provider";

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-4">
      <MobileNav />
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        onClick={onToggleSidebar}
        aria-label={t("shell.toggleSidebar")}
        data-testid="sidebar-toggle"
      >
        <PanelLeft className="size-5" />
      </Button>

      <div className="hidden min-w-0 flex-1 sm:block">
        <Breadcrumbs />
      </div>

      <div className="flex flex-1 items-center justify-end gap-1 sm:flex-none sm:gap-2">
        <BranchSelector />
        <LanguageSelector />
        <Notifications />
        <UserMenu />
      </div>
    </header>
  );
}
