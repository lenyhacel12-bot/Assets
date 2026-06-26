"use client";

import { useState, type ReactNode } from "react";
import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";
import { cn } from "@/lib/utils";

/**
 * The responsive application shell: a collapsible desktop sidebar, a top bar,
 * and the main content area. On mobile the sidebar is hidden and replaced by
 * the slide-in menu in the top bar.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-svh w-full bg-muted/30">
      <aside
        data-testid="desktop-sidebar"
        data-collapsed={collapsed}
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="border-b border-sidebar-border">
          <Brand collapsed={collapsed} />
        </div>
        <SidebarNav collapsed={collapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main
          id="main-content"
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
