import { defineConfig, devices } from "@playwright/test";

/**
 * Behavioral regression guards for the Phase 3 QA gate (eng review 8A + F7).
 * Runs against the production build: `yarn build` first, webServer boots
 * `yarn start`. 60fps stays a manual perf-trace check in /qa — deliberately
 * NOT faked as a headless assertion.
 *
 * workers=3 (Phase 4): the WebGL background renders on every page these
 * specs load. Playwright's default worker count (~CPU cores) meant 6+
 * Chromium instances each running shaders/particles/bloom simultaneously on
 * a dev machine, enough GPU/CPU contention to intermittently time out
 * e2e/motion.spec.ts's RAF-driver test (a tight page.evaluate loop counting
 * real animation frames) even with the architecture behaving correctly —
 * verified via an isolated 2-worker run passing reliably where a 6-worker
 * run didn't. Capped lower to keep that test meaningful instead of flaky.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 3,
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
