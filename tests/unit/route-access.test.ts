import { describe, it, expect } from "vitest";
import {
  decideRouteAccess,
  isProtectedPath,
  isPublicPath,
} from "@/lib/auth/route-access";

describe("route access (coarse protection)", () => {
  it("classifies public vs protected paths", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/reset-password/abc")).toBe(true);
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/products")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/_next/static/x.js")).toBe(false);
  });

  it("redirects unauthenticated users away from protected pages", () => {
    expect(
      decideRouteAccess({ pathname: "/dashboard", hasSession: false }),
    ).toEqual({ type: "redirect", to: "/login" });

    expect(
      decideRouteAccess({ pathname: "/accounting", hasSession: false }),
    ).toEqual({ type: "redirect", to: "/login" });
  });

  it("allows authenticated users into protected pages", () => {
    expect(
      decideRouteAccess({ pathname: "/dashboard", hasSession: true }),
    ).toEqual({ type: "allow" });
  });

  it("lets signed-in users reach the login page (the page redirects active sessions itself)", () => {
    expect(decideRouteAccess({ pathname: "/login", hasSession: true })).toEqual(
      { type: "allow" },
    );
  });

  it("lets unauthenticated users reach the login page", () => {
    expect(
      decideRouteAccess({ pathname: "/login", hasSession: false }),
    ).toEqual({ type: "allow" });
  });

  it("always allows static/asset paths", () => {
    expect(
      decideRouteAccess({ pathname: "/icons/icon.svg", hasSession: false }),
    ).toEqual({ type: "allow" });
  });
});
