import {
  LayoutDashboard,
  Package,
  Boxes,
  ScanLine,
  ArrowLeftRight,
  Users,
  ShoppingCart,
  CalendarClock,
  Truck,
  Factory,
  ClipboardList,
  Receipt,
  HandCoins,
  FileClock,
  Landmark,
  Calculator,
  BarChart3,
  CheckCircle2,
  UserCog,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  /** Stable id used as React key and for tests. */
  id: string;
  /** i18n key for the label. */
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  /** i18n key for the section heading. */
  titleKey: string;
  items: NavItem[];
}

/**
 * The full module map for the application shell. Every module is a placeholder
 * route in Stage 1 — business functionality is built in later stages.
 */
export const navSections: NavSection[] = [
  {
    titleKey: "nav.sections.overview",
    items: [
      {
        id: "dashboard",
        labelKey: "nav.dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    titleKey: "nav.sections.inventory",
    items: [
      {
        id: "products",
        labelKey: "nav.products",
        href: "/products",
        icon: Package,
      },
      {
        id: "inventory",
        labelKey: "nav.inventory",
        href: "/inventory",
        icon: Boxes,
      },
      {
        id: "scanning",
        labelKey: "nav.scanning",
        href: "/scanning",
        icon: ScanLine,
      },
      {
        id: "stock-transfers",
        labelKey: "nav.stockTransfers",
        href: "/stock-transfers",
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    titleKey: "nav.sections.sales",
    items: [
      {
        id: "customers",
        labelKey: "nav.customers",
        href: "/customers",
        icon: Users,
      },
      {
        id: "sales",
        labelKey: "nav.sales",
        href: "/sales",
        icon: ShoppingCart,
      },
      {
        id: "pre-orders",
        labelKey: "nav.preOrders",
        href: "/pre-orders",
        icon: CalendarClock,
      },
      {
        id: "deliveries",
        labelKey: "nav.deliveries",
        href: "/deliveries",
        icon: Truck,
      },
      {
        id: "receivables",
        labelKey: "nav.receivables",
        href: "/receivables",
        icon: Receipt,
      },
    ],
  },
  {
    titleKey: "nav.sections.purchasing",
    items: [
      {
        id: "suppliers",
        labelKey: "nav.suppliers",
        href: "/suppliers",
        icon: Factory,
      },
      {
        id: "purchasing",
        labelKey: "nav.purchasing",
        href: "/purchasing",
        icon: ClipboardList,
      },
      {
        id: "payables",
        labelKey: "nav.payables",
        href: "/payables",
        icon: FileClock,
      },
    ],
  },
  {
    titleKey: "nav.sections.finance",
    items: [
      {
        id: "expenses",
        labelKey: "nav.expenses",
        href: "/expenses",
        icon: HandCoins,
      },
      {
        id: "cash-and-banks",
        labelKey: "nav.cashAndBanks",
        href: "/cash-and-banks",
        icon: Landmark,
      },
      {
        id: "accounting",
        labelKey: "nav.accounting",
        href: "/accounting",
        icon: Calculator,
      },
    ],
  },
  {
    titleKey: "nav.sections.insights",
    items: [
      {
        id: "reports",
        labelKey: "nav.reports",
        href: "/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    titleKey: "nav.sections.administration",
    items: [
      {
        id: "approvals",
        labelKey: "nav.approvals",
        href: "/approvals",
        icon: CheckCircle2,
      },
      { id: "users", labelKey: "nav.users", href: "/users", icon: UserCog },
      {
        id: "audit-trail",
        labelKey: "nav.auditTrail",
        href: "/audit-trail",
        icon: ScrollText,
      },
      {
        id: "settings",
        labelKey: "nav.settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

/** Flat list of all nav items (useful for breadcrumbs and tests). */
export const allNavItems: NavItem[] = navSections.flatMap((s) => s.items);

/** Look up a nav item by its href (exact or prefix match). */
export function findNavItemByPath(pathname: string): NavItem | undefined {
  return allNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
