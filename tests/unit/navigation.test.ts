import { describe, it, expect } from "vitest";
import {
  navSections,
  allNavItems,
  findNavItemByPath,
} from "@/config/navigation";

const EXPECTED_MODULES = [
  "dashboard",
  "products",
  "inventory",
  "scanning",
  "stock-transfers",
  "customers",
  "sales",
  "pre-orders",
  "deliveries",
  "suppliers",
  "purchasing",
  "expenses",
  "receivables",
  "payables",
  "cash-and-banks",
  "accounting",
  "reports",
  "approvals",
  "users",
  "audit-trail",
  "settings",
];

describe("navigation config", () => {
  it("includes every planned module exactly once", () => {
    const ids = allNavItems.map((i) => i.id).sort();
    expect(ids).toEqual([...EXPECTED_MODULES].sort());
    expect(ids.length).toBe(21);
  });

  it("has unique hrefs", () => {
    const hrefs = allNavItems.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("groups items into sections", () => {
    expect(navSections.length).toBeGreaterThanOrEqual(5);
    for (const section of navSections) {
      expect(section.items.length).toBeGreaterThan(0);
    }
  });

  it("resolves a nav item from a path (exact and nested)", () => {
    expect(findNavItemByPath("/products")?.id).toBe("products");
    expect(findNavItemByPath("/products/123")?.id).toBe("products");
    expect(findNavItemByPath("/unknown")).toBeUndefined();
  });
});
