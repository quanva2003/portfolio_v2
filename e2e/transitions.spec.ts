import { test, expect, type Page } from "@playwright/test";
import { countRafDrivers, waitForPageReady } from "./helpers";
import { flagshipProject } from "../content/projects";

/*
 * Phase 5 QA-gate specs (PLAN.md Phase 5):
 *  (1) case study renders on a cold load (problem / role / stack / shipped / results)
 *  (2) unknown slug -> 404
 *  (3) list -> detail -> back/forward all work as client navigations
 *  (4) the shared-element contract: the same view-transition-name exists on
 *      both sides of the navigation (the animation itself isn't headlessly
 *      assertable, the pairing is)
 *  (5) the WebGL canvas is the SAME element after navigating — not torn down
 *      and rebuilt
 *  (6) exactly one RAF driver survives a route change (the Phase 3 contract,
 *      re-checked on the far side of a navigation)
 *  (7) scroll choreography rebinds per route and leaves no triggers behind
 *  (8) preloader: reports real progress, clears itself, and gates the reveals
 *  (9) reduced motion: no preloader, no transition, navigation still works
 * (10) no JS: case study fully readable, work cards are real crawlable links
 *
 * Test hooks: html.preloading (app/layout.tsx inline script, removed by the
 * Preloader), [data-preloader], window.__stCount, [data-webgl-status].
 */

declare global {
  interface Window {
    __stCount?: () => number;
    __lenis?: unknown;
  }
}

/*
 * SCOPED TO #work ON PURPOSE. The Experience section now links each role to the
 * case studies built during it, so `a[href="/work/panda-erp"]` matches twice on
 * the home page. These specs are about the work GRID's card link, and an
 * unscoped selector would break again the next time the site links a project
 * from somewhere new.
 */
const FLAGSHIP_LINK = `#work a[href="/work/${flagshipProject.slug}"]`;

/** The name both the work-grid thumbnail and the case-study hero must carry. */
const SHARED_NAME = `project-media-${flagshipProject.slug}`;

const namedElementCount = (page: Page, name: string) =>
  page.evaluate(
    (target) =>
      Array.from(document.querySelectorAll<HTMLElement>("[style*='view-transition-name']")).filter(
        (el) => getComputedStyle(el).viewTransitionName === target,
      ).length,
    name,
  );

test.describe("case study route", () => {
  test("(1) renders every case-study section on a cold load", async ({ page }) => {
    await page.goto(`/work/${flagshipProject.slug}`);
    await waitForPageReady(page);

    await expect(page.locator("h1")).toHaveText(flagshipProject.name);
    for (const label of ["The problem", "Role", "Stack", "What I shipped", "Results"]) {
      await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
    }
    /*
     * Body copy comes from content/: a missing `detail` block would render
     * empty sections rather than failing the build, so assert real prose.
     *
     * DERIVED from the content module, not transcribed. Hardcoded phrases here
     * ("point-of-sale interface") silently became untrue the moment the Panda
     * copy was rewritten against the CV — the assertion caught a copy edit, not
     * a bug, which is the wrong job for a route test. Reading the source means
     * this checks what it means to check: that the prose reached the page.
     */
    await expect(page.locator("main")).toContainText(flagshipProject.detail.shipped[0]!);
    await expect(page.locator("main")).toContainText(flagshipProject.detail.problem);
  });

  test("(2) an unknown slug 404s", async ({ page }) => {
    const response = await page.goto("/work/not-a-project");
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("Nothing here");
  });
});

test.describe("navigation", () => {
  test("(3) list -> detail -> back -> forward", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    await page.locator(FLAGSHIP_LINK).click();
    await expect(page).toHaveURL(`/work/${flagshipProject.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(flagshipProject.name);

    await page.goBack();
    await expect(page).toHaveURL("/");
    await expect(page.locator(FLAGSHIP_LINK)).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(`/work/${flagshipProject.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(flagshipProject.name);
  });

  test("(4) the shared-element name exists on both sides of the morph", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    // Exactly one on the list side: a duplicate name on a single page makes
    // the browser skip the transition entirely.
    expect(await namedElementCount(page, SHARED_NAME)).toBe(1);

    await page.locator(FLAGSHIP_LINK).click();
    await expect(page).toHaveURL(`/work/${flagshipProject.slug}`);
    expect(await namedElementCount(page, SHARED_NAME)).toBe(1);
  });

  test("(5) the WebGL canvas survives navigation as the same element", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    await expect.poll(() => page.locator('[data-webgl-status="available"]').count()).toBe(1);

    // Stamp the live canvas node. A torn-down-and-rebuilt canvas is a fresh
    // element with a fresh GL context, so the marker would be gone — which is
    // exactly the regression Phase 5 must not introduce.
    await page.evaluate(() => {
      const canvas = document.querySelector("canvas") as
        (HTMLCanvasElement & { __id?: string }) | null;
      if (canvas) canvas.__id = "before-nav";
    });

    await page.locator(FLAGSHIP_LINK).click();
    await expect(page).toHaveURL(`/work/${flagshipProject.slug}`);

    await expect(page.locator("canvas")).toHaveCount(1);
    await expect.poll(() => page.locator('[data-webgl-status="available"]').count()).toBe(1);
    expect(
      await page.evaluate(
        () =>
          (document.querySelector("canvas") as (HTMLCanvasElement & { __id?: string }) | null)
            ?.__id,
      ),
    ).toBe("before-nav");
  });

  test("(6) still exactly one RAF driver after a route change", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    await page.locator(FLAGSHIP_LINK).click();
    await expect(page).toHaveURL(`/work/${flagshipProject.slug}`);
    await page.waitForFunction(() => window.__lenis !== undefined);
    await page.mouse.wheel(0, 400);

    // The canvas persisting across routes must not leave a second loop behind,
    // and neither may the view transition. Same gate as e2e/motion.spec.ts
    // test (7), re-run on the far side of a navigation.
    expect(await countRafDrivers(page)).toBeLessThan(1.5);
  });

  test("(7) reveals rebind on the new route and leave no triggers behind", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    await page.locator(FLAGSHIP_LINK).click();
    await expect(page).toHaveURL(`/work/${flagshipProject.slug}`);

    // revertOnUpdate killed the home route's triggers; the case study's own
    // [data-reveal] blocks got fresh ones.
    await expect.poll(() => page.evaluate(() => window.__stCount!())).toBeGreaterThan(0);

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
    await expect.poll(() => page.evaluate(() => window.__stCount!()), { timeout: 15_000 }).toBe(0);
  });
});

test.describe("preloader", () => {
  test("(8) reports real progress, then clears and releases the reveals", async ({ page }) => {
    /*
     * Progress has to be driven by real load signals, not a timer, which is
     * hard to assert directly. What IS assertable: the bar only ever reports
     * values the load tasks have actually completed, it ends at exactly 100,
     * and it never regresses. A fake timer would satisfy monotonicity but a
     * regression or a value stuck below 100 at the end would mean the real
     * signals aren't wired up.
     */
    const samples: number[] = [];
    // waitUntil "commit" so sampling starts before the load event: with the
    // default "load", a fast machine can finish the whole preload during
    // goto() and the overlay is gone before the first sample.
    await page.goto("/", { waitUntil: "commit" });

    /*
     * Sampled through page.evaluate, not a locator: locator.getAttribute()
     * auto-waits, so the first read after the overlay unmounts would block for
     * the full action timeout instead of ending the loop.
     */
    let seen = false;
    for (let i = 0; i < 400; i++) {
      const state = await page.evaluate(() => {
        const bar = document.querySelector('[data-preloader] [role="progressbar"]');
        return {
          present: Boolean(document.querySelector("[data-preloader]")),
          value: bar?.getAttribute("aria-valuenow") ?? null,
        };
      });
      if (state.present) seen = true;
      if (state.value !== null) samples.push(Number(state.value));
      // Only an overlay that HAS been seen can be "gone" -- at commit time it
      // legitimately doesn't exist yet, because it mounts on hydration.
      if (seen && !state.present) break;
      await page.waitForTimeout(25);
    }

    expect(seen).toBe(true);
    expect(samples.length).toBeGreaterThan(0);
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]!).toBeGreaterThanOrEqual(samples[i - 1]!);
    }
    expect(Math.max(...samples)).toBe(100);

    // The gate opens and the overlay removes itself.
    await waitForPageReady(page);
    await expect(page.locator("[data-preloader]")).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.querySelector("h1")!).opacity))
      .toBe("1");
  });

  test("(8b) does not re-appear on a client-side navigation", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    await page.locator(FLAGSHIP_LINK).click();
    await expect(page).toHaveURL(`/work/${flagshipProject.slug}`);
    await expect(page.locator("[data-preloader]")).toHaveCount(0);
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("(9) no preloader, no view transition, navigation still works", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-preloader]")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveClass(/\bpreloading\b/);

    // Nothing may be hidden behind a gate that never opens.
    const opacities = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-reveal], [data-split]")).map(
        (el) => getComputedStyle(el).opacity,
      ),
    );
    expect(opacities.length).toBeGreaterThan(0);
    expect(opacities.every((opacity) => opacity === "1")).toBe(true);

    // Count startViewTransition calls in-page: the client navigation keeps the
    // same document, so the patch survives it.
    await page.evaluate(() => {
      const patched = window as unknown as { __vtCalls: number };
      patched.__vtCalls = 0;
      const original = document.startViewTransition?.bind(document);
      if (!original) return;
      document.startViewTransition = ((...args: Parameters<NonNullable<typeof original>>) => {
        patched.__vtCalls++;
        return original(...args);
      }) as typeof document.startViewTransition;
    });

    await page.locator(FLAGSHIP_LINK).click();
    await expect(page).toHaveURL(`/work/${flagshipProject.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(flagshipProject.name);
    expect(await page.evaluate(() => (window as unknown as { __vtCalls: number }).__vtCalls)).toBe(
      0,
    );
  });
});

test.describe("no JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("(10) case study readable, work cards are real links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(FLAGSHIP_LINK)).toHaveCount(1);

    await page.goto(`/work/${flagshipProject.slug}`);
    const opacities = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-reveal], [data-split]")).map(
        (el) => getComputedStyle(el).opacity,
      ),
    );
    expect(opacities.length).toBeGreaterThan(0);
    expect(opacities.every((opacity) => opacity === "1")).toBe(true);
    await expect(page.locator("main")).toContainText("What I shipped");
  });
});
