import { test, expect } from "@playwright/test";

/**
 * Stage 1 smoke tests. The webServer is started with placeholder public env
 * vars (no real Supabase), so the app runs in "configured but unauthenticated"
 * mode: protected routes redirect to /login.
 */

test("unauthenticated visit to the app redirects to login", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
});

test("login page renders the sign-in form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /forgot password/i }),
  ).toBeVisible();
});

test("health endpoint responds ok", async ({ page }) => {
  const res = await page.request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.status).toBe("ok");
});
