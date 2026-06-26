/**
 * English dictionary. This is the canonical shape; every other locale must
 * provide the same keys. Components reference these keys via `useTranslation`
 * — never hard-code user-facing strings.
 */
const en = {
  common: {
    appName: "3F Enterprises",
    appTagline: "Inventory, Sales & Accounting",
    loading: "Loading…",
    search: "Search",
    save: "Save",
    cancel: "Cancel",
    comingSoon: "Coming soon",
    notImplemented: "This module is not implemented yet.",
    retry: "Try again",
    goToDashboard: "Go to dashboard",
  },
  nav: {
    sections: {
      overview: "Overview",
      inventory: "Inventory",
      sales: "Sales",
      purchasing: "Purchasing",
      finance: "Finance",
      insights: "Insights",
      administration: "Administration",
    },
    dashboard: "Dashboard",
    products: "Products",
    inventory: "Inventory",
    scanning: "Scanning",
    stockTransfers: "Stock Transfers",
    customers: "Customers",
    sales: "Sales",
    preOrders: "Pre-orders",
    deliveries: "Deliveries",
    suppliers: "Suppliers",
    purchasing: "Purchasing",
    expenses: "Expenses",
    receivables: "Receivables",
    payables: "Payables",
    cashAndBanks: "Cash & Banks",
    accounting: "Accounting",
    reports: "Reports",
    approvals: "Approvals",
    users: "Users",
    auditTrail: "Audit Trail",
    settings: "Settings",
  },
  shell: {
    toggleSidebar: "Toggle sidebar",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    notifications: "Notifications",
    noNotifications: "No notifications",
    branch: "Branch",
    allBranches: "All branches",
    language: "Language",
    account: "Account",
    profile: "Profile",
    signOut: "Sign out",
    breadcrumbHome: "Home",
  },
  branches: {
    mnl: "Manila",
    ceb: "Cebu",
    pam: "Pampanga",
    ant: "Antipolo",
  },
  auth: {
    signInTitle: "Sign in",
    signInSubtitle: "Access the 3F Enterprises workspace",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    forgotPassword: "Forgot password?",
    placeholderNotice:
      "Authentication is implemented in Stage 2. This is a placeholder screen.",
    unconfiguredNotice:
      "Supabase is not configured yet. Copy .env.example to .env.local to enable sign-in.",
  },
  errors: {
    title: "Something went wrong",
    description:
      "An unexpected error occurred. You can try again or return to the dashboard.",
    notFoundTitle: "Page not found",
    notFoundDescription: "The page you are looking for does not exist.",
  },
  empty: {
    title: "Nothing here yet",
    description: "Data for this module will appear here once it is built.",
  },
} as const;

export default en;
