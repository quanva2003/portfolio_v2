"use client";

import { useEffect, useState } from "react";

/**
 * Which class of device we're on, for the purpose of deciding whether the WebGL
 * background is worth its cost.
 *
 *   "probing"  — client-side detection hasn't run yet (SSR and first paint)
 *   "full"     — mount the canvas
 *   "reduced"  — do not mount it at all; take the static hero path
 *
 * "reduced" means NO CANVAS, not a cheaper canvas. That is the Phase 6 decision
 * and it is worth stating plainly, because the obvious reading is wrong: fewer
 * particles and no bloom reduce DRAW cost, but the device has already paid the
 * expensive part — downloading, parsing and JIT-ing ~355 kB of three.js, then
 * compiling shaders and initialising a GL context. Measured baseline was mobile
 * Perf 65 against desktop 98, so the only device class in trouble was the one
 * paying that price for a decorative backdrop on a 6-inch screen. A quality
 * knob would not have moved it. Not shipping the bytes does.
 *
 * Consumers MUST branch before importing the WebGL chunk, never after — see
 * components/webgl/WebGLMount.tsx. A gate downstream of a static import saves
 * nothing at all.
 */
export type DeviceTier = "probing" | "full" | "reduced";

/** Below this, assume the CPU can't carry a continuous shader alongside scroll. */
const MIN_CORES = 4;

const COARSE_POINTER = "(pointer: coarse)";

export function detectTier(): Exclude<DeviceTier, "probing"> {
  // Touch-primary devices: phones and tablets. Universally supported, and the
  // single strongest signal for "this is a battery-powered handheld".
  if (window.matchMedia(COARSE_POINTER).matches) return "reduced";

  /*
   * hardwareConcurrency catches low-core laptops that pointer alone treats as
   * desktops. `undefined` on older Safari — treat unknown as capable rather
   * than degrading a machine we simply couldn't measure, since the pointer
   * check above has already removed the handhelds.
   */
  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores > 0 && cores < MIN_CORES) return "reduced";

  return "full";
}

/**
 * Starts at "probing" so SSR and the first client pass agree (no hydration
 * mismatch) and so nothing can import the WebGL chunk before detection has run.
 *
 * Deliberately NOT reactive to pointer changes. Unlike reduced-motion — which
 * a visitor can toggle mid-session and which Phase 3 requires us to honour
 * live — a device does not grow cores or stop being a phone while the page is
 * open. Re-evaluating would only add a path to tearing down a working canvas.
 */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("probing");

  useEffect(() => {
    setTier(detectTier());
  }, []);

  return tier;
}
