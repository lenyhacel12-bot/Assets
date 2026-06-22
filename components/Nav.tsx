"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/actions/auth";

type NavItem = { href: string; label: string; icon: string; ready: boolean };

// Build-order aware: only completed modules link out; the rest show as "Soon".
const ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", ready: true },
  { href: "/units", label: "Units", icon: "🏠", ready: true },
  { href: "/vacancy", label: "Vacancy", icon: "🗺️", ready: true },
  { href: "/locations", label: "Locations", icon: "📍", ready: true },
  { href: "/tenants", label: "Tenants", icon: "👥", ready: false },
  { href: "/payments", label: "Payments", icon: "💵", ready: false },
  { href: "/expenses", label: "Expenses", icon: "🧾", ready: false },
  { href: "/repairs", label: "Repairs", icon: "🔧", ready: false },
  { href: "/reports", label: "Reports", icon: "📈", ready: false },
];

export function Nav({ name, role }: { name: string; role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        if (!item.ready) {
          return (
            <span
              key={item.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-charcoal-soft/50"
            >
              <span className="flex items-center gap-2">
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </span>
              <span className="badge bg-sand-100 text-charcoal-soft">Soon</span>
            </span>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-clay-500 text-white"
                : "text-charcoal hover:bg-sand-100"
            }`}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-sand-200 bg-white px-4 py-3 md:hidden">
        <span className="font-semibold text-charcoal">Rental Manager</span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="btn-secondary px-3 py-1.5"
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </header>
      {open && (
        <div className="border-b border-sand-200 bg-white px-4 py-3 md:hidden">
          {links}
          <UserFooter name={name} role={role} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sand-200 bg-white p-4 md:flex">
        <div className="mb-6 px-3">
          <span className="text-lg font-semibold text-charcoal">Rental Manager</span>
        </div>
        {links}
        <div className="mt-auto pt-4">
          <UserFooter name={name} role={role} />
        </div>
      </aside>
    </>
  );
}

function UserFooter({ name, role }: { name: string; role: string }) {
  return (
    <div className="mt-4 border-t border-sand-200 pt-3">
      <div className="px-3 text-sm font-medium text-charcoal">{name}</div>
      <div className="mb-2 px-3 text-xs capitalize text-charcoal-soft">{role}</div>
      <form action={logout}>
        <button type="submit" className="btn-secondary w-full">
          Sign out
        </button>
      </form>
    </div>
  );
}
