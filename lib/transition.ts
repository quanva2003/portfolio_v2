/**
 * Route-transition and preloader tokens, mirroring the convention of
 * lib/motion.ts and lib/webgl/tokens.ts: named constants live here, never as
 * inline literals in components. Durations are declared in CSS (the
 * ::view-transition pseudo-elements are only reachable from a stylesheet), so
 * the numbers below are the JS-side timeouts and identifiers, not the curves.
 */

/** Route to a project's case study. One place builds this URL. */
export const projectPath = (slug: string) => `/work/${slug}`;

/**
 * Shared-element names for the list -> detail morph. The work grid and the
 * case-study hero must render the SAME name for the same project or the
 * browser has no pair to morph, so both sides go through components/
 * ProjectMedia.tsx rather than naming elements independently.
 */
export const viewTransitionName = {
  projectMedia: (slug: string) => `project-media-${slug}`,
} as const;

/**
 * A view transition freezes the old frame until the update callback's promise
 * resolves. Detail routes are statically generated and <Link>-prefetched, so
 * the RSC payload is normally warm and this never fires — it exists so a cold
 * or failed fetch can't leave the page stuck on a stale snapshot.
 */
export const NAVIGATION_TIMEOUT_MS = 1200;

/** Set by the inline script in app/layout.tsx, removed by the Preloader. */
export const PRELOADER_CLASS = "preloading";

/** Dispatched on window when the preloader starts clearing the screen. */
export const PRELOADER_DONE_EVENT = "preloader:done";

/**
 * Ceiling on how long scroll choreography waits for the preloader. Reveal
 * targets are hidden while it's up, so a preloader that never reports done
 * (a load event that never fires, a throw inside the component) must not be
 * able to leave the page permanently blank.
 */
export const PRELOADER_GATE_FAILSAFE_MS = 6000;

/*
 * Preloader catch-up, integrated against wall-clock rather than frame count.
 *
 * Both rates below are PER SECOND, multiplied by gsap.ticker's deltaTime. A
 * per-tick step would tie how long the visitor waits to how fast the page is
 * rendering: measured 0.67s at 60fps but 2-5s once the WebGL layer drops
 * frames, i.e. exactly the low-end devices that can least afford a long hold.
 * Time-normalising makes the duration predictable everywhere.
 *
 * This is still not a fake timer — the CEILING is measured progress and the
 * counter is clamped to it, so it can never show a signal that hasn't landed.
 * Only the rate at which it closes the gap is time-based, which is what any
 * frame-driven interpolation should be.
 */
export const preloader = {
  /**
   * Exponential coefficient for closing the remaining gap, per second. The
   * reason a discrete signal (fonts settle, document settles) reads as a
   * continuous climb instead of a jump.
   */
  catchUpRate: 9,
  /**
   * Floor on the catch-up, in progress units per second. A purely
   * proportional approach is asymptotic and crawls the last few percent
   * forever; this bounds a full traverse at ~1/minRate seconds.
   */
  minRate: 1.6,
  /**
   * Cap on a single frame's delta, so a backgrounded tab (rAF stops entirely,
   * then resumes with a multi-second delta) can't integrate one enormous step
   * and snap the counter straight to 100.
   *
   * Sized against the worst REAL foreground frame rate rather than a
   * comfortable one: measured 4fps (250ms frames) on a software-GL headless
   * run with the WebGL layer active. A 100ms cap there integrated only 40% of
   * each frame's elapsed time and stretched a 0.63s hold to 1.7s — the clamp
   * has to be at least as large as a legitimately slow frame or it silently
   * reintroduces the frame-rate dependency it exists alongside.
   */
  maxDeltaMs: 250,
  /** Relative weights of the real load signals the progress bar is built from. */
  weights: { fonts: 3, document: 2, image: 1 },
} as const;

/**
 * True when the browser can actually run a same-document view transition AND
 * the visitor hasn't asked for less motion. Everything else navigates plainly.
 */
export function canViewTransition(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function" &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches
  );
}

/** Resolves once the preloader has cleared, or immediately if none is up. */
export function waitForPreloader(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (!document.documentElement.classList.contains(PRELOADER_CLASS)) return Promise.resolve();

  return new Promise((resolve) => {
    let timer = 0;
    const done = () => {
      window.clearTimeout(timer);
      window.removeEventListener(PRELOADER_DONE_EVENT, done);
      resolve();
    };
    window.addEventListener(PRELOADER_DONE_EVENT, done);
    timer = window.setTimeout(done, PRELOADER_GATE_FAILSAFE_MS);
  });
}

/** Releases everything gated on waitForPreloader(). Idempotent. */
export function markPreloaderDone(): void {
  document.documentElement.classList.remove(PRELOADER_CLASS);
  window.dispatchEvent(new Event(PRELOADER_DONE_EVENT));
}
