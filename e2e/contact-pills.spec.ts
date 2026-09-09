import { test, expect, type Page } from "@playwright/test";
import { waitForPageReady } from "./helpers";

/*
 * Regression gate for a theme-token collision that silently crushed every
 * `inline-block` element on the site.
 *
 * WHAT BROKE: `--spacing-block` in styles/globals.css put a `block` key in
 * Tailwind's `--spacing` namespace, and Tailwind v4.3 generates `inline-<key>`
 * as an inline-size utility. That produced a second `.inline-block` rule
 * setting a WIDTH, emitted after the display rule and therefore winning. Every
 * pill in the contact row, the 404 back-link, and Magnetic's wrapper span
 * around every magnetic control were forced to clamp(2.5rem, 2rem + 3vw, 5rem)
 * wide — 75.19px at 1440 — so "GitHub" overflowed its own border and the phone
 * number wrapped onto four lines at 106px tall.
 *
 * WHY A TEST AND NOT JUST THE RENAME: nothing failed. The build was clean, the
 * types were clean, the console was silent, and every existing spec passed. The
 * bug was found by measuring boxes in a browser, which is the only place it was
 * ever visible. scripts/check-theme-tokens.mjs blocks the specific token names
 * known to collide today; this spec catches the SYMPTOM regardless of which
 * future utility, plugin or Tailwind release causes it.
 *
 * THE SIGNATURE IS EQUAL WIDTHS. Four pills with different text rendering at
 * identical widths is not a layout that could happen by accident — it means an
 * external width is being imposed. That, not any particular pixel value, is
 * what these assertions are built around, so they survive copy edits.
 */

/** One line of `text-small` (0.875rem x 1.5) plus py-2.5 and a 1px border. */
const SINGLE_LINE_PILL_HEIGHT = 43;

type Box = { text: string; width: number; height: number };

async function contactPills(page: Page): Promise<Box[]> {
  await page.locator("#contact").scrollIntoViewIfNeeded();
  const pills = page.locator("#contact ul li a");
  await expect(pills.first()).toBeVisible();
  return pills.evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect();
      return { text: el.textContent?.trim() ?? "", width: rect.width, height: rect.height };
    }),
  );
}

test.describe("contact pills", () => {
  for (const width of [1440, 390]) {
    test(`render on one line each at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await waitForPageReady(page);

      const pills = await contactPills(page);
      expect(pills.length).toBeGreaterThanOrEqual(3);

      for (const pill of pills) {
        /*
         * Height is the sharpest available proxy for "the text fits". A pill
         * squeezed narrower than its content wraps, and wrapping is the only
         * thing that moves this number.
         */
        expect(pill.height, `"${pill.text}" wrapped onto more than one line`).toBe(
          SINGLE_LINE_PILL_HEIGHT,
        );
      }

      /*
       * The collision signature. Under the bug every pill measured exactly
       * 75.19px regardless of its label; here each must be sized by its own
       * content. Rounded before comparing so sub-pixel text metrics on a
       * different font fallback cannot make two genuinely different pills look
       * accidentally distinct.
       */
      const widths = pills.map((pill) => Math.round(pill.width));
      expect(new Set(widths).size, `pills share a width: ${JSON.stringify(pills)}`).toBe(
        widths.length,
      );
    });
  }

  test("the pill row is wider than any single pill", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await waitForPageReady(page);

    const pills = await contactPills(page);
    const row = await page
      .locator("#contact ul")
      .evaluate((el) => el.getBoundingClientRect().width);

    /*
     * Positive control for the assertion above. If the row itself were ever
     * constrained to something tiny, every pill would legitimately shrink and
     * the equal-width check could pass for the wrong reason.
     */
    const total = pills.reduce((sum, pill) => sum + pill.width, 0);
    expect(row).toBeGreaterThan(total);
  });
});

test("the 404 back-link is not crushed", async ({ page }) => {
  /*
   * Same bug, different page. `w-fit` sits on this element and did NOT save it,
   * because `.inline-block` was emitted after `.w-fit` in the compiled sheet —
   * which is why the fix had to be the token rename rather than a local patch.
   */
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/this-route-does-not-exist");

  const back = page.locator("main a").first();
  await expect(back).toBeVisible();

  const box = await back.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBe(SINGLE_LINE_PILL_HEIGHT);
});

test("the CV download link is wired and the file is actually served", async ({ page }) => {
  await page.goto("/");
  await waitForPageReady(page);

  const cv = page.locator("#contact ul li a[download]");
  await expect(cv).toHaveCount(1);

  const href = await cv.getAttribute("href");
  expect(href).toBeTruthy();

  /*
   * The link existing is not the same as the file existing. public/ is served
   * without any import binding it to the app, so a rename or a deletion breaks
   * this silently — and this is the one link a recruiter is most likely to
   * click and least likely to report.
   */
  const response = await page.request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("pdf");

  /* Format and size ride in sr-only text so nobody downloads blind. */
  await expect(cv).toContainText(/PDF/);
  await expect(cv).toContainText(/\d+(\.\d+)?\s*(KB|MB)/);
});
