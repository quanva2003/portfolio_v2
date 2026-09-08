"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useDeviceTier } from "@/lib/webgl/useDeviceTier";
import { waitForPreloader } from "@/lib/transition";
import { probeWebGL } from "./useWebGLSupport";

/*
 * The gate that decides whether ~355 kB of three.js is ever fetched.
 *
 *   app/layout.tsx  (SERVER component — next/dynamic ssr:false is ILLEGAL here)
 *     └─ <WebGLErrorBoundary>
 *          └─ <WebGLMount/>            "use client", ships in the shared bundle
 *               │                       (a few hundred bytes: this file only)
 *               ├─ reduced motion?  ──► render nothing, never import
 *               ├─ no WebGL?        ──► render nothing, never import
 *               ├─ tier "reduced"?  ──► render nothing, never import
 *               └─ all clear
 *                    └─ await preloader release
 *                         └─ requestIdleCallback (setTimeout fallback)
 *                              └─ import("./WebGLBackground")  ◄── the 355 kB
 *                                   └─ <WebGLBackground/>
 *
 * Every branch is evaluated BEFORE the import expression is reached. That
 * ordering is the entire point: the previous arrangement gated the same
 * conditions INSIDE WebGLBackground, which meant a phone still downloaded and
 * parsed the whole library before deciding to render null. Measured: mobile
 * Perf 65 vs desktop 98 on an otherwise identical page.
 *
 * A failure to fetch the chunk (offline, CDN blip, 404 after a deploy) rejects
 * the promise; it is caught here and resolves to the same static-hero fallback
 * as every other unavailable-WebGL case, rather than escaping as an unhandled
 * rejection. WebGLErrorBoundary upstream still catches render-time throws from
 * inside the loaded component.
 */

const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

/**
 * Ceiling on the idle wait. requestIdleCallback can be starved indefinitely on
 * a busy main thread, and Safari only shipped it in 17.4 — iOS being exactly
 * the platform where the fallback matters.
 */
const IDLE_TIMEOUT_MS = 2000;
const IDLE_FALLBACK_MS = 300;

function whenIdle(run: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(run, IDLE_FALLBACK_MS);
  return () => window.clearTimeout(id);
}

export default function WebGLMount() {
  const tier = useDeviceTier();
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [Background, setBackground] = useState<ComponentType | null>(null);

  /*
   * Reduced motion stays reactive (Phase 3 contract: toggling the OS setting
   * mid-session must take effect without a reload). Turning it ON unmounts the
   * canvas; turning it back OFF re-runs the load effect below. The already
   * resolved module is cached by the bundler, so a re-enable does not refetch.
   */
  useEffect(() => {
    const media = window.matchMedia(MOTION_QUERY);
    const sync = () => setMotionAllowed(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (tier !== "full" || !motionAllowed) return;
    if (!probeWebGL()) return;

    let cancelled = false;
    let cancelIdle: (() => void) | undefined;

    /*
     * Waiting on the preloader keeps the fetch off the critical path entirely:
     * it cannot compete with the hero for bandwidth or main thread while the
     * page is still resolving. waitForPreloader() resolves synchronously when
     * no preloader is up (client-side navigation, reduced motion), so this is
     * not a delay in those cases.
     */
    waitForPreloader().then(() => {
      if (cancelled) return;
      cancelIdle = whenIdle(() => {
        if (cancelled) return;
        import("./WebGLBackground")
          .then((mod) => {
            if (!cancelled) setBackground(() => mod.default);
          })
          .catch(() => {
            // Same resolution as "WebGL unavailable": the static hero, silently.
            // Nothing to retry — a visitor who lost the chunk once will not
            // benefit from hammering the network for a decorative background.
          });
      });
    });

    return () => {
      cancelled = true;
      cancelIdle?.();
    };
  }, [tier, motionAllowed]);

  // Test hook, matching the window.__lenis / window.__stCount convention used
  // by MotionProvider and SectionMotion — lets the Playwright suite assert the
  // tier decision deterministically instead of inferring it from a canvas count.
  useEffect(() => {
    (window as Window & { __webglTier?: string }).__webglTier = tier;
  }, [tier]);

  if (!Background || !motionAllowed) return null;
  return <Background />;
}
