import { test, expect, type Page } from "@playwright/test";
import { countRafDrivers, waitForPageReady } from "./helpers";

/*
 * Phase 3 QA-gate specs (numbering from PLAN.md Phase 3, commit 5):
 *  (1) reduced-motion → fully static, no Lenis, no cursor, content visible
 *  (2) JS disabled → all content visible
 *  (3) touch device → no custom cursor element
 *  (4) fine pointer → cursor present + scales on link hover
 *  (5) nav anchor + skip link move FOCUS to the target (not just scrollY)
 *  (6) all sections reach visible state after a full scroll
 *  (7) exactly one RAF driver (gsap.ticker) active
 *  (8) every once:true trigger self-destroys after a full reveal pass
 *
 * Test hooks provided by the app: window.__lenis (MotionProvider),
 * window.__stCount (SectionMotion), [data-cursor-dot][data-state] (Cursor).
 *
 * Phase 5 note: scroll choreography is now gated on the cold-load preloader,
 * so every spec that asserts on reveal state, trigger counts or focus goes
 * through waitForPageReady() first. Without it the assertions would race the
 * real font/document load signals the preloader measures — the gate changed
 * WHEN choreography binds, not what it does, so the assertions themselves are
 * unchanged.
 */

declare global {
  interface Window {
    __lenis?: unknown;
    __stCount?: () => number;
  }
}

const allContentVisible = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-reveal], [data-split]")).map(
      (el) => getComputedStyle(el).opacity,
    ),
  );

/** Step through the whole document so every ScrollTrigger passes its start. */
async function scrollThroughPage(page: Page) {
  await page.evaluate(async () => {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = window.innerHeight / 2;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await delay(150);
    }
    window.scrollTo(0, document.body.scrollHeight);
    await delay(300);
  });
}

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("(1) fully static page: no Lenis, no cursor, everything visible", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    await page.waitForFunction(() => typeof window.__stCount === "function");

    await expect(page.locator("[data-cursor-dot]")).toHaveCount(0);
    expect(await page.evaluate(() => window.__lenis !== undefined)).toBe(false);
    expect(await page.evaluate(() => window.__stCount!())).toBe(0);

    const opacities = await allContentVisible(page);
    expect(opacities.length).toBeGreaterThan(0);
    expect(opacities.every((opacity) => opacity === "1")).toBe(true);
  });
});

test.describe("no JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("(2) all content visible without JS", async ({ page }) => {
    await page.goto("/");

    expect(await page.evaluate(() => document.documentElement.classList.contains("js"))).toBe(
      false,
    );
    const opacities = await allContentVisible(page);
    expect(opacities.length).toBeGreaterThan(0);
    expect(opacities.every((opacity) => opacity === "1")).toBe(true);
  });
});

test.describe("touch device", () => {
  // Coarse pointer + touch, without pulling in a full device preset
  // (device presets carry `defaultBrowserType`, which forces a separate
  // worker and can't be combined with `test.describe` — see Playwright #21798).
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 393, height: 851 },
    contextOptions: { hasTouch: true, isMobile: true },
  });

  test("(3) custom cursor never mounts", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    await page.waitForFunction(() => typeof window.__stCount === "function");
    await expect(page.locator("[data-cursor-dot]")).toHaveCount(0);
  });
});

test.describe("fine pointer (desktop)", () => {
  test("(4) cursor present and scales on interactive hover", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    const dot = page.locator("[data-cursor-dot]");
    await expect(dot).toHaveCount(1);

    await page.mouse.move(400, 400);
    await expect(dot).toHaveAttribute("data-state", "default");

    await page.hover("header nav a >> nth=0");
    await expect(dot).toHaveAttribute("data-state", "hover");

    await page.mouse.move(400, 500);
    await expect(dot).toHaveAttribute("data-state", "default");
  });

  test("(5) nav anchor and skip link move focus to their targets", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    await page.waitForFunction(() => window.__lenis !== undefined);

    await page.click('header nav a[href="/#about"]');
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("about");

    await page.goto("/");
    await waitForPageReady(page);
    await page.waitForFunction(() => window.__lenis !== undefined);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("main");
  });

  test("(6) every section reaches visible state after a full scroll", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    await page.waitForFunction(() => typeof window.__stCount === "function");
    await scrollThroughPage(page);

    await expect
      .poll(
        () =>
          page.evaluate(() =>
            Array.from(document.querySelectorAll("[data-reveal]")).every(
              (el) => getComputedStyle(el).opacity === "1",
            ),
          ),
        { timeout: 15_000 },
      )
      .toBe(true);
  });

  test("(7) exactly one RAF driver", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    await page.waitForFunction(() => window.__lenis !== undefined);

    /*
     * Phase 6: the canvas joins gsap.ticker LATE (idle callback after the
     * preloader). Sampling immediately would measure a window in which the
     * WebGL layer does not exist yet -- the test would still pass, but it would
     * have silently stopped covering the case it was written for: that adding
     * the canvas does NOT add a second driver. Wait for it to be present first.
     */
    await expect
      .poll(() => page.locator('[data-webgl-status="available"]').count(), { timeout: 15_000 })
      .toBe(1);

    await page.mouse.wheel(0, 600);

    // countRafDrivers() counts SELF-SUSTAINING loops only -- see e2e/helpers.ts
    // for why raw registrations-per-frame (what this asserted through Phase 4)
    // was contention-sensitive noise rather than a measurement of the contract.
    // One driver reads 1.0; Lenis autoRaf or a stray R3F frameloop reads ~2.0.
    expect(await countRafDrivers(page)).toBeLessThan(1.5);
  });

  test("(8) once-triggers self-destroy after the full reveal pass", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    await page.waitForFunction(() => typeof window.__stCount === "function");

    await expect.poll(() => page.evaluate(() => window.__stCount!())).toBeGreaterThan(0);

    await scrollThroughPage(page);
    await expect.poll(() => page.evaluate(() => window.__stCount!()), { timeout: 15_000 }).toBe(0);
  });
});
