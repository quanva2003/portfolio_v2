import { test, expect, type Page } from "@playwright/test";

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
    await page.waitForFunction(() => typeof window.__stCount === "function");
    await expect(page.locator("[data-cursor-dot]")).toHaveCount(0);
  });
});

test.describe("fine pointer (desktop)", () => {
  test("(4) cursor present and scales on interactive hover", async ({ page }) => {
    await page.goto("/");
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
    await page.waitForFunction(() => window.__lenis !== undefined);

    await page.click('header nav a[href="#about"]');
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id))
      .toBe("about");

    await page.goto("/");
    await page.waitForFunction(() => window.__lenis !== undefined);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id))
      .toBe("main");
  });

  test("(6) every section reaches visible state after a full scroll", async ({ page }) => {
    await page.goto("/");
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
    await page.waitForFunction(() => window.__lenis !== undefined);
    await page.mouse.wheel(0, 600);

    // Measure rAF *registrations* per real browser frame, using rAF itself
    // as the frame clock — robust to headless Chromium not throttling to a
    // fixed 60Hz. One driver (gsap.ticker) re-registers ~1 call per frame it
    // advances; a second independent loop (Lenis autoRaf, a stray R3F
    // frameloop) would roughly double that ratio for the same frame count.
    const { callCount, frameCount } = await page.evaluate(
      () =>
        new Promise<{ callCount: number; frameCount: number }>((resolve) => {
          const originalRAF = window.requestAnimationFrame.bind(window);
          const FRAMES = 30;
          let callCount = 0;
          let frameCount = 0;

          window.requestAnimationFrame = (callback: FrameRequestCallback) => {
            callCount++;
            return originalRAF(callback);
          };

          const tick = () => {
            frameCount++;
            if (frameCount >= FRAMES) {
              window.requestAnimationFrame = originalRAF;
              resolve({ callCount, frameCount });
            } else {
              originalRAF(tick);
            }
          };
          originalRAF(tick);
        }),
    );

    const callsPerFrame = callCount / frameCount;
    expect(callsPerFrame).toBeGreaterThan(0.8);
    expect(callsPerFrame).toBeLessThan(1.5);
  });

  test("(8) once-triggers self-destroy after the full reveal pass", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => typeof window.__stCount === "function");

    expect(await page.evaluate(() => window.__stCount!())).toBeGreaterThan(0);

    await scrollThroughPage(page);
    await expect
      .poll(() => page.evaluate(() => window.__stCount!()), { timeout: 15_000 })
      .toBe(0);
  });
});
