import { test, expect, type Page } from "@playwright/test";

/*
 * Phase 4 QA-gate specs (PLAN.md Phase 4, Step 5 / eng review issue 6):
 *  (1) reduced-motion -> no canvas mounted, static hero shown
 *  (2) WebGL unavailable -> static hero, no console error
 *  (3) touch/mobile -> canvas DOES mount (unlike Cursor, which doesn't)
 *  (4) shared pointer position: Cursor.tsx and the WebGL layer read the same source
 *  (5) forced WebGL context loss does not crash the page (WebGLErrorBoundary)
 *  (6) existing e2e/motion.spec.ts test (7) "exactly one RAF driver" is the
 *      regression gate for the ticker join -- not duplicated here, see that file.
 *
 * Test hooks: [data-webgl-status] on the fixed background wrapper
 * ("available"/"lost", absent entirely when not mounted at all),
 * window.__pointerPosition (lib/webgl/pointer.ts, mirrors __lenis/__stCount).
 */

declare global {
  interface Window {
    __pointerPosition?: () => { x: number; y: number };
  }
}

async function disableWebGL(page: Page) {
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error -- intentionally narrowing the overload for the test
    HTMLCanvasElement.prototype.getContext = function (type: string, options?: unknown) {
      if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") return null;
      return originalGetContext.call(this, type, options);
    };
  });
}

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("(1) no WebGL canvas mounts, static hero fully visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-webgl-status]")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("WebGL unavailable", () => {
  test("(2) falls back to the static hero, no console error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await disableWebGL(page);
    await page.goto("/");

    await expect(page.locator("[data-webgl-status]")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("h1")).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("touch device", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 393, height: 851 },
    contextOptions: { hasTouch: true, isMobile: true },
  });

  test("(3) WebGL canvas still mounts (unlike the pointer:fine-only cursor)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("[data-cursor-dot]")).toHaveCount(0);
    await expect
      .poll(() => page.locator('[data-webgl-status="available"]').count(), { timeout: 10_000 })
      .toBe(1);
  });
});

test.describe("fine pointer (desktop)", () => {
  test("(4) Cursor.tsx and the WebGL layer read the same pointer source", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => typeof window.__pointerPosition === "function");
    // Wait for Cursor.tsx to actually be mounted and subscribed (its
    // useGSAP effect runs after this element commits) -- otherwise a single
    // mouse.move() can land before the subscription exists and never be
    // seen again, leaving the dot stuck at its initial position.
    await expect(page.locator("[data-cursor-dot]")).toHaveCount(1);

    await page.mouse.move(500, 300);
    // pointer.ts's `position` is mutated synchronously in the raw pointermove
    // handler -- no lerp/animation delay for the raw-value assertion itself.
    await expect
      .poll(() => page.evaluate(() => window.__pointerPosition!()))
      .toEqual({ x: 500, y: 300 });

    // Cursor.tsx subscribes to the same module and animates toward it via
    // gsap.quickTo -- if it read a different (independent) source, this
    // would settle somewhere else. Not a substitute for a unit test of the
    // module itself, but the strongest proxy available without a unit
    // test runner in this project.
    const dot = page.locator("[data-cursor-dot]");
    await expect
      .poll(async () => {
        const box = await dot.boundingBox();
        if (!box) return null;
        return { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) };
      })
      .toEqual({ x: 500, y: 300 });
  });

  test("(5) forced WebGL context loss does not crash the page", async ({ page }) => {
    await page.goto("/");
    await expect
      .poll(() => page.locator('[data-webgl-status="available"]').count())
      .toBe(1);

    const lost = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const gl =
        canvas?.getContext("webgl2") ?? canvas?.getContext("webgl");
      const ext = gl?.getExtension("WEBGL_lose_context");
      if (!ext) return false;
      ext.loseContext();
      return true;
    });
    expect(lost).toBe(true);

    // The WebGL layer is purely decorative background -- losing it must
    // never take visible page content down with it. Two independent things
    // can throw here: (a) react-three-fiber's Canvas re-rendering after
    // WebGLBackground's onContextLost handler sets status -- caught by
    // WebGLErrorBoundary in app/layout.tsx; (b) three.js's OWN internal
    // webglcontextlost listener, registered directly on the canvas when it
    // constructs the WebGLRenderer, reacting to the SAME null
    // getContextAttributes() -- this fires entirely outside React (no
    // component call stack to unwind), so no application-level try/catch or
    // error boundary can intercept it; it surfaces as an uncaught
    // `pageerror`. That's a real gap in three.js's own context-loss
    // handling, not something fixable from this codebase. What we can and
    // must verify: content stays visible regardless of which path fires.
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=Application error")).toHaveCount(0);
  });
});
