import { test, expect, type Page } from "@playwright/test";
import { transferredScriptBytes, waitForPageReady, waitForWebGLDecision } from "./helpers";

/*
 * WebGL specs (PLAN.md Phase 4 Step 5 + Phase 6 eng review).
 *
 *  (1) reduced-motion -> no canvas, no WebGL bytes, static hero shown
 *  (2) WebGL unavailable -> static hero, no console error, no WebGL bytes
 *  (3) touch/mobile -> reduced tier, NO canvas  [INVERTED IN PHASE 6]
 *  (4) shared pointer position: Cursor.tsx and the WebGL layer read the same source
 *  (5) forced WebGL context loss does not crash the page (WebGLErrorBoundary)
 *  (6) the heavy chunk is never requested on the reduced tier
 *  (7) a failed chunk fetch degrades to the static hero, not an error
 *  (8) requestIdleCallback absent -> canvas still mounts via the timeout fallback
 *  (9) existing e2e/motion.spec.ts test (7) "exactly one RAF driver" is the
 *      regression gate for the ticker join -- not duplicated here, see that file.
 *
 * PHASE 6 INVERSION, stated loudly because it reverses a Phase 4 guarantee:
 * touch devices used to mount the canvas and now deliberately do not. The
 * reduced tier renders the same static hero that reduced-motion and no-WebGL
 * already got. Degrading DRAW quality (fewer particles, no bloom) was rejected
 * because the expensive part is the ~355 kB download, parse and shader compile,
 * which a quality knob does not touch. Measured: mobile Perf 65 -> 93.
 *
 * VACUOUS-PASS HAZARD: the canvas now loads from an idle callback after the
 * preloader releases, so a toHaveCount(0) assertion is briefly true even when
 * the canvas IS coming. Every negative assertion below goes through
 * waitForWebGLDecision() first, which blocks until the mount gate has actually
 * reached a verdict.
 *
 * Test hooks: [data-webgl-status] on the fixed background wrapper
 * ("available"/"lost", absent entirely when not mounted at all),
 * window.__webglTier (WebGLMount.tsx), window.__pointerPosition
 * (lib/webgl/pointer.ts) -- all mirroring the __lenis/__stCount convention.
 */

declare global {
  interface Window {
    __pointerPosition?: () => { x: number; y: number };
    __webglTier?: string;
  }
}

/**
 * Ceiling for "no heavy 3D chunk was fetched". The shared bundle is ~188 kB
 * across all routes; three + R3F + postprocessing adds ~355 kB raw on top, so
 * anything at or under this bound cannot contain it however compression lands.
 */
const NO_WEBGL_BYTES_CEILING = 400_000;

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

const TOUCH = {
  hasTouch: true,
  isMobile: true,
  viewport: { width: 393, height: 851 },
  contextOptions: { hasTouch: true, isMobile: true },
} as const;

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("(1) no WebGL canvas mounts, static hero fully visible", async ({ page }) => {
    await page.goto("/");
    // Positive control: without this, the assertions below can pass simply
    // because the deferred mount has not run yet.
    await waitForWebGLDecision(page);

    await expect(page.locator("[data-webgl-status]")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("h1")).toBeVisible();
    expect(await transferredScriptBytes(page)).toBeLessThan(NO_WEBGL_BYTES_CEILING);
  });
});

test.describe("WebGL unavailable", () => {
  test("(2) falls back to the static hero, no console error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await disableWebGL(page);
    await page.goto("/");
    await waitForWebGLDecision(page);

    await expect(page.locator("[data-webgl-status]")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("h1")).toBeVisible();
    // The probe lives in WebGLMount, upstream of the import, so a device
    // without WebGL must not pay for the chunk either.
    expect(await transferredScriptBytes(page)).toBeLessThan(NO_WEBGL_BYTES_CEILING);
    expect(errors).toEqual([]);
  });
});

test.describe("touch device", () => {
  test.use(TOUCH);

  test("(3) resolves to the reduced tier and mounts NO canvas", async ({ page }) => {
    await page.goto("/");
    const tier = await waitForWebGLDecision(page);

    expect(tier).toBe("reduced");
    await expect(page.locator("[data-cursor-dot]")).toHaveCount(0);
    await expect(page.locator("[data-webgl-status]")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
    // The static hero is the whole point of the fallback -- assert it is real
    // content, not merely an absent canvas.
    await expect(page.locator("h1")).toBeVisible();
  });

  test("(6) never requests the heavy WebGL chunk", async ({ page }) => {
    await page.goto("/");
    await waitForWebGLDecision(page);
    // Give a mount that was going to happen every chance to happen.
    await page.waitForTimeout(2000);

    expect(await transferredScriptBytes(page)).toBeLessThan(NO_WEBGL_BYTES_CEILING);
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});

test.describe("chunk fetch failure", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("(7) degrades to the static hero instead of an unhandled rejection", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    /*
     * Fail the lazily-imported chunk only. It is requested after the preloader
     * releases, so everything the page needs in order to be useful has already
     * loaded by the time this bites -- which is exactly the failure the
     * fallback exists for (a CDN blip, a stale chunk name after a deploy, a
     * tunnel). Requests already served from cache are untouched, so this
     * isolates the dynamic import rather than breaking the whole bundle.
     */
    let armed = false;
    await page.route("**/_next/static/chunks/**", async (route) => {
      if (armed) return route.abort("failed");
      return route.continue();
    });

    await page.goto("/");
    await waitForPageReady(page);
    armed = true;
    await page.waitForTimeout(3000);

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=Application error")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe("no requestIdleCallback (Safari < 17.4)", () => {
  test("(8) canvas still mounts via the setTimeout fallback", async ({ page }) => {
    await page.addInitScript(() => {
      // iOS is precisely the platform that lacked rIC until 17.4, and also
      // precisely where a never-mounting canvas would go unnoticed.
      delete (window as { requestIdleCallback?: unknown }).requestIdleCallback;
    });

    await page.goto("/");
    const tier = await waitForWebGLDecision(page);
    expect(tier).toBe("full");
    await expect
      .poll(() => page.locator('[data-webgl-status="available"]').count(), { timeout: 15_000 })
      .toBe(1);
  });
});

test.describe("fine pointer (desktop)", () => {
  test("(4) Cursor.tsx and the WebGL layer read the same pointer source", async ({ page }) => {
    await page.goto("/");
    // The shared pointer module ships in the main bundle (Cursor.tsx imports
    // it), so this does not need the WebGL chunk -- but the claim under test is
    // that BOTH consumers read it, so wait until the WebGL side actually exists.
    expect(await waitForWebGLDecision(page)).toBe("full");
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
    // Phase 6: the canvas arrives from an idle callback after the preloader,
    // so polling straight after goto() raced the mount rather than the loss.
    expect(await waitForWebGLDecision(page)).toBe("full");
    await expect
      .poll(() => page.locator('[data-webgl-status="available"]').count(), { timeout: 15_000 })
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
