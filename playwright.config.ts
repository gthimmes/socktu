import { defineConfig } from "@playwright/test";

// E2E suite: real browser against the dev server + SQLite database.
// Run `npm run setup` once beforehand so the seeded Northwind data exists.
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.APP_URL || "http://localhost:3111",
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: "npm run dev -- -p 3111",
    url: process.env.APP_URL || "http://localhost:3111",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  reporter: [["list"]],
});
