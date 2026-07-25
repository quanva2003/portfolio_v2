import { defineConfig, devices } from "@playwright/test";

/**
 * Behavioral regression guards for the Phase 3 QA gate (eng review 8A + F7).
 * Runs against the production build: `yarn build` first, webServer boots
 * `yarn start`. 60fps stays a manual perf-trace check in /qa — deliberately
 * NOT faked as a headless assertion.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "yarn start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
