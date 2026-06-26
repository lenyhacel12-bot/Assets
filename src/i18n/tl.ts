import type { Dictionary } from "./dictionaries";

/**
 * Tagalog dictionary. Typed against the loosened dictionary shape so missing or
 * extra keys are caught at compile time, while still allowing translated text.
 */
const tl: Dictionary = {
  common: {
    appName: "3F Enterprises",
    appTagline: "Imbentaryo, Benta at Accounting",
    loading: "Naglo-load…",
    search: "Maghanap",
    save: "I-save",
    cancel: "Kanselahin",
    comingSoon: "Malapit nang dumating",
    notImplemented: "Hindi pa nagagawa ang modyul na ito.",
    retry: "Subukan muli",
    goToDashboard: "Pumunta sa dashboard",
  },
  nav: {
    sections: {
      overview: "Pangkalahatan",
      inventory: "Imbentaryo",
      sales: "Benta",
      purchasing: "Pagbili",
      finance: "Pananalapi",
      insights: "Pagsusuri",
      administration: "Administrasyon",
    },
    dashboard: "Dashboard",
    products: "Mga Produkto",
    inventory: "Imbentaryo",
    scanning: "Pag-scan",
    stockTransfers: "Paglipat ng Stock",
    customers: "Mga Customer",
    sales: "Benta",
    preOrders: "Mga Pre-order",
    deliveries: "Mga Delivery",
    suppliers: "Mga Supplier",
    purchasing: "Pagbili",
    expenses: "Mga Gastos",
    receivables: "Mga Maniningil",
    payables: "Mga Babayaran",
    cashAndBanks: "Cash at Bangko",
    accounting: "Accounting",
    reports: "Mga Ulat",
    approvals: "Mga Pag-apruba",
    users: "Mga User",
    auditTrail: "Audit Trail",
    settings: "Mga Setting",
  },
  shell: {
    toggleSidebar: "I-toggle ang sidebar",
    openMenu: "Buksan ang menu",
    closeMenu: "Isara ang menu",
    notifications: "Mga Abiso",
    noNotifications: "Walang abiso",
    branch: "Sangay",
    allBranches: "Lahat ng sangay",
    language: "Wika",
    account: "Account",
    profile: "Profile",
    signOut: "Mag-sign out",
    breadcrumbHome: "Home",
  },
  branches: {
    mnl: "Maynila",
    ceb: "Cebu",
    pam: "Pampanga",
    ant: "Antipolo",
  },
  auth: {
    signInTitle: "Mag-sign in",
    signInSubtitle: "I-access ang workspace ng 3F Enterprises",
    email: "Email",
    password: "Password",
    signIn: "Mag-sign in",
    forgotPassword: "Nakalimutan ang password?",
    placeholderNotice:
      "Gagawin ang authentication sa Stage 2. Placeholder lang ito.",
    unconfiguredNotice:
      "Hindi pa naka-configure ang Supabase. Kopyahin ang .env.example sa .env.local para paganahin ang sign-in.",
  },
  errors: {
    title: "May nangyaring mali",
    description:
      "May hindi inaasahang error. Maaari kang subukan muli o bumalik sa dashboard.",
    notFoundTitle: "Hindi nahanap ang pahina",
    notFoundDescription: "Ang pahinang hinahanap mo ay hindi umiiral.",
  },
  empty: {
    title: "Wala pa rito",
    description:
      "Lalabas dito ang datos para sa modyul na ito kapag nagawa na ito.",
  },
} as const;

export default tl;
