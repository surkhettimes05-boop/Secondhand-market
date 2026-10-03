import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/live",
  workers: 1,
  retries: 0,
  timeout: 120000,
  expect: { timeout: 15000 },
  reporter: [["list"],["html",{outputFolder:"playwright-live-report",open:"never"}]],
  use: { baseURL: "http://127.0.0.1:3000", trace: "retain-on-failure" },
  webServer: { command: "npm run start -- --hostname 127.0.0.1", url: "http://127.0.0.1:3000", timeout: 60000, reuseExistingServer: false },
  projects: [{ name: "live-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } }],
});
