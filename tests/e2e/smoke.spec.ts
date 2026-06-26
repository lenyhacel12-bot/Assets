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

test("login placeholder renders with its notice", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText(/Stage 2/i)).toBeVisible();
});

test("health endpoint responds ok", async ({ page }) => {
  const res = await page.request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.status).toBe("ok");
});
