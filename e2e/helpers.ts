import { expect, type Page } from "@playwright/test";

/**
 * Blocks until the cold-load preloader has released the page.
 *
 * Scroll choreography is gated on the preloader (see components/motion/
 * SectionMotion.tsx), so anything asserting on reveal state, ScrollTrigger
 * counts or focus has to wait for it first — otherwise the assertion races the
 * real load signals the preloader is measuring. `html.preloading` is set by
 * the inline script in app/layout.tsx and removed the moment the overlay
 * starts clearing, which makes it the one deterministic signal for "the page
 * is live now".
 */
export async function waitForPageReady(page: Page) {
  await expect(page.locator("html")).not.toHaveClass(/\bpreloading\b/, { timeout: 20_000 });
}

/**
 * Number of SELF-SUSTAINING requestAnimationFrame loops the page is running.
 * The single-RAF contract (Phase 3 eng review) says this must be exactly 1:
 * gsap.ticker, with Lenis and the R3F canvas riding on it.
 *
 * The discriminator is where a registration comes from, not how many there
 * are. A continuous driver re-registers itself from INSIDE its own rAF
 * callback, so patching rAF to wrap every callback and tracking nesting depth
 * separates real loops from one-shot registrations made in event handlers.
 *
 * That distinction matters because counting raw registrations per frame — what
 * this spec did through Phase 4 — conflates the two. ScrollTrigger schedules a
 * coalescing rAF from its scroll listener, and Lenis's lerp keeps writing
 * sub-pixel scroll positions (emitting native scroll events) long after a
 * wheel gesture visually settles. Those extra registrations arrive at a rate
 * set by scroll events, not by frame rate, so under GPU contention — frames
 * dropping while scroll events keep coming — the raw ratio climbs past any
 * fixed threshold with the architecture behaving perfectly. Measured: raw
 * ratio 1.33–1.60 for one driver depending only on contention, versus exactly
 * 1.0 here; an injected second loop reads exactly 2.0. Stricter gate, no
 * false alarms.
 */
export async function countRafDrivers(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const originalRAF = window.requestAnimationFrame.bind(window);
        const FRAMES = 30;
        let frameCount = 0;
        let depth = 0;
        let continuous = 0;

        window.requestAnimationFrame = (callback: FrameRequestCallback) => {
          if (depth > 0) continuous++;
          return originalRAF((time) => {
            depth++;
            try {
              callback(time);
            } finally {
              depth--;
            }
          });
        };

        const tick = () => {
          frameCount++;
          if (frameCount >= FRAMES) {
            window.requestAnimationFrame = originalRAF;
            // frameCount - 1: each loop's FIRST registration during the sample
            // comes from a callback registered before the patch, so it isn't
            // wrapped and isn't counted.
            resolve(continuous / (frameCount - 1));
          } else {
            originalRAF(tick);
          }
        };
        originalRAF(tick);
      }),
  );
}
