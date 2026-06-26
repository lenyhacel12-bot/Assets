import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration.
 *
 * The remote environment ships Chromium at /opt/pw-browsers and sets
 * PLAYWRIGHT_BROWSERS_PATH — do NOT run `playwright install`.
 *
 * E2E specs build and start the production server via the webServer block.
 * Provide dummy-but-valid public env vars so the app boots in CI without
 * real Supabase credentials.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // The sandbox ships Chromium at a fixed path that may not match the
        // browser build @playwright/test expects. Use it directly instead of
        // downloading (see remote-environment notes). Locally, delete this
        // override and run `npx playwright install` once.
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
          : {},
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key-placeholder",
    },
  },
});
