import { test, expect } from "@playwright/test";
import { waitForPageReady } from "./helpers";

/*
 * Regression: QA-001 — hero title and tagline stayed invisible on load
 * Found by /qa on 2026-09-08
 * Report: .gstack/qa-reports/qa-report-localhost-2026-09-08.md
 *
 * Hero.tsx is min-h-dvh with justify-end, so its [data-reveal] title/tagline
 * block sits at the bottom of the first screen. SectionMotion revealed blocks
 * via ScrollTrigger with start "top 85%", a line 15% above the bottom edge — so
 * that block never crossed it on load and held opacity 0 until the visitor
 * scrolled. The hero's own copy was blank on arrival.
 *
 * Height-dependent, which is why nothing caught it: measured opacity 0 at
 * 393x851 (top 744 vs line 723) and 414x896 (788 vs 762), but 1 at 1280x720
 * (540 vs 612), 360x640 (507 vs 544) and 320x568 (410 vs 483). The failing
 * sizes are iPhone-class. The existing suite only asserted visibility AFTER a
 * full-page scroll (motion.spec (6)), which is exactly the state that hid this.
 *
 * The assertion that matters is "without scrolling" — do not add a scroll here.
 */

const TALL_PHONES = [
  { label: "Pixel 5 / iPhone 14 class", width: 393, height: 851 },
  { label: "iPhone 11 Pro Max class", width: 414, height: 896 },
];

for (const phone of TALL_PHONES) {
  test.describe(`hero reveal at ${phone.width}x${phone.height} (${phone.label})`, () => {
    test.use({ viewport: { width: phone.width, height: phone.height } });

    test("hero title and tagline are visible on load, with no scrolling", async ({ page }) => {
      await page.goto("/");
      await waitForPageReady(page);

      // Scoped to the hero: "Front-End Developer" also appears as an <h3> in
      // the Experience timeline, so an unscoped text match is ambiguous.
      const hero = page.locator("main section").first();
      const tagline = hero.getByRole("paragraph").filter({ hasText: /^Front-End Developer$/ });
      await expect(tagline).toBeVisible();

      // toBeVisible() passes for opacity 0 (the element still occupies layout
      // and is not display:none), which is precisely the failure mode here —
      // so assert the computed opacity the bug actually left behind.
      await expect
        .poll(
          async () =>
            tagline.evaluate((el) => {
              const block = el.closest("[data-reveal]");
              return block ? getComputedStyle(block).opacity : "no-reveal-ancestor";
            }),
          { timeout: 10_000 },
        )
        .toBe("1");

      // Guard the premise: if a future layout change lifts this block out of
      // the bottom band, the test would still pass but would have stopped
      // covering the bug. Assert it is genuinely in the region that broke.
      const inBottomBand = await tagline.evaluate((el) => {
        const block = el.closest("[data-reveal]")!;
        return block.getBoundingClientRect().top > window.innerHeight * 0.8;
      });
      expect(inBottomBand).toBe(true);
    });
  });
}
