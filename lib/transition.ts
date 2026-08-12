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

export const preloader = {
  /** Fraction of the gap to the real progress value closed per ticker tick. */
  counterLerp: 0.12,
  /** Real progress is discrete; below this remaining gap the counter has arrived. */
  arrivalEpsilon: 0.004,
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
