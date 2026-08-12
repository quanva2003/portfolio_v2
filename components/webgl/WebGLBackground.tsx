"use client";

import { useCallback, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import gsap from "gsap";
import DisplacementPlane from "./DisplacementPlane";
import ParticleField from "./ParticleField";
import { useWebGLSupport } from "./useWebGLSupport";
import { bloom, dprRange } from "@/lib/webgl/tokens";

/*
 * Single-RAF contract (locked by the Phase 3 eng review, extended in Phase 4):
 * this Canvas uses frameloop="never" and is advanced exclusively from
 * gsap.ticker (see TickerBridge below) — it never runs its own RAF loop.
 * gsap.ticker's callback arg is already in SECONDS (three.js Clock
 * convention, same as what advance() expects) — do NOT multiply by 1000 the
 * way MotionProvider's Lenis bridge does; that conversion is only for
 * Lenis's millisecond-based raf() API.
 *
 * advance() runs OUTSIDE React's render cycle (invoked imperatively from the
 * gsap.ticker callback, not scheduled by React) -- a throw in here would
 * escape WebGLErrorBoundary entirely (error boundaries only catch
 * render/lifecycle errors, not exceptions from code React didn't call
 * itself) and surface as an uncaught page error. Verified: forcing WebGL
 * context loss can throw inside three.js internals reacting to it
 * (getContextAttributes() returns null while lost) on exactly this path.
 * Caught here so the same failure always resolves to the same fallback.
 */
function TickerBridge({ onFatalError }: { onFatalError: () => void }) {
  const advance = useThree((state) => state.advance);

  useEffect(() => {
    const tick = (time: number) => {
      try {
        advance(time);
      } catch {
        gsap.ticker.remove(tick);
        onFatalError();
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance, onFatalError]);

  return null;
}

/** Gated the same way Cursor.tsx gates itself: reactive to the OS toggling mid-session. */
const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

/**
 * Root-layout-mounted, persistent WebGL background (same pattern as
 * MotionProvider/Cursor) — fixed full-viewport, behind {children}. Mounting
 * here (not inside Hero) is required so Phase 5 can keep the canvas alive
 * across route navigation instead of tearing it down per page.
 *
 * Never mounts under reduced motion or when WebGL is unavailable at capability
 * probe time — both fall back to the same thing: the static Phase 2 hero,
 * unmodified. But once mounted, a later context LOSS does not unmount the
 * Canvas — it's only hidden (visibility, not removed). An unmounted canvas's
 * GL context can never fire webglcontextrestored again, so there'd be no path
 * back; keeping the same element alive lets the browser (or, in the Step 5
 * e2e spec, a forced WEBGL_lose_context/restoreContext() call) recover it.
 */
export default function WebGLBackground() {
  const [motionAllowed, setMotionAllowed] = useState(false);
  const { status, setStatus } = useWebGLSupport();
  const onFatalError = useCallback(() => setStatus("lost"), [setStatus]);

  useEffect(() => {
    const media = window.matchMedia(MOTION_QUERY);
    const sync = () => setMotionAllowed(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (!motionAllowed || status === "checking" || status === "unavailable") return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      data-webgl-status={status}
      style={{ visibility: status === "lost" ? "hidden" : "visible" }}
    >
      <Canvas
        frameloop="never"
        dpr={dprRange}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          const canvasEl = gl.domElement;
          canvasEl.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            setStatus("lost");
          });
          canvasEl.addEventListener("webglcontextrestored", () => setStatus("available"));
        }}
      >
        <TickerBridge onFatalError={onFatalError} />
        <DisplacementPlane />
        <ParticleField />
        {/*
         * "Cursor-proximity bloom" happens upstream, in DisplacementPlane's
         * fragment shader (uGlowPeak pushes brightness well past 1.0 near the
         * cursor) — Bloom here just reacts to luminance via threshold, no
         * per-frame JS-driven intensity prop needed. multisampling=0: this is
         * an abstract full-screen background, not geometry that needs MSAA.
         * EffectComposer resizes its render targets in place on viewport
         * resize (verified by reading its source — composer.setSize() handles
         * this); the whole Canvas+GL context (and everything postprocessing
         * allocated) is torn down on unmount via the reduced-motion/no-WebGL/
         * context-loss fallback path above, so there's nothing left to leak.
         */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={bloom.baseIntensity}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.2}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
