"use client";

import { useCallback, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import gsap from "gsap";
import DisplacementPlane from "./DisplacementPlane";
import ParticleField from "./ParticleField";
import { useWebGLSupport } from "./useWebGLSupport";
import { bloom, dprRange } from "@/lib/webgl/tokens";

/*
 * Single-RAF contract (locked by the Phase 3 eng review, extended in Phase 4,
 * amended in Phase 6):
 *
 *   requestAnimationFrame — ONE loop, owned by gsap.ticker
 *     └─ gsap.ticker
 *          ├─ lenis.raf(time * 1000)  (MotionProvider)
 *          ├─ active tweens (reveals, SplitText, cursor)
 *          └─ advance(time)  ◄── THIS canvas, frameloop="never"
 *
 * Phase 6 changed WHEN this joins, not whether: the canvas is now imported and
 * mounted from an idle callback after the preloader releases (see
 * WebGLMount.tsx), so it registers with the ticker LATE rather than at first
 * paint — and on the reduced device tier it never registers at all. The driver
 * count is unchanged either way, which is what e2e/motion.spec.ts test (7)
 * asserts; that test now has to wait for [data-webgl-status] before sampling,
 * or it would measure a window in which this component simply doesn't exist yet.
 *
 * gsap.ticker's callback arg is already in SECONDS (three.js Clock convention,
 * same as what advance() expects) — do NOT multiply by 1000 the way
 * MotionProvider's Lenis bridge does; that conversion is only for Lenis's
 * millisecond-based raf() API.
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
function TickerBridge({ active, onFatalError }: { active: boolean; onFatalError: () => void }) {
  const advance = useThree((state) => state.advance);

  useEffect(() => {
    /*
     * While the context is lost the canvas is hidden but still mounted (see
     * below), so without this guard the ticker would keep driving advance()
     * and both useFrame callbacks would keep running every frame — full CPU
     * and GPU cost for something nobody can see, indefinitely. Not registering
     * at all while lost is cheaper than registering and returning early, and
     * it keeps the "one driver" accounting honest.
     */
    if (!active) return;

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
  }, [active, advance, onFatalError]);

  return null;
}

/**
 * The WebGL background itself. Fixed full-viewport, behind {children}.
 *
 * This component NO LONGER decides whether it should exist — WebGLMount.tsx
 * owns every mount gate (reduced motion, WebGL capability, device tier) and
 * only imports this module once they all pass. Keeping those checks here as
 * well would be redundant, and keeping them here INSTEAD was the Phase 6 bug:
 * gating inside a statically-imported module still ships the module.
 *
 * It is still root-mounted (via WebGLMount in app/layout.tsx, not inside Hero)
 * so the GL context survives route navigation instead of being torn down and
 * rebuilt per route — the Phase 5 requirement.
 *
 * Once mounted, a later context LOSS does not unmount the Canvas — it is only
 * hidden (visibility, not removed) and the ticker is detached. An unmounted
 * canvas's GL context can never fire webglcontextrestored again, so there'd be
 * no path back; keeping the same element alive lets the browser (or, in the
 * e2e spec, a forced WEBGL_lose_context/restoreContext() call) recover it.
 */
export default function WebGLBackground() {
  const { status, setStatus } = useWebGLSupport();
  const onFatalError = useCallback(() => setStatus("lost"), [setStatus]);

  if (status === "unavailable") return null;

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
        <TickerBridge active={status !== "lost"} onFatalError={onFatalError} />
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
         *
         * These imports are static ON PURPOSE: this whole module is already
         * behind WebGLMount's dynamic import, so postprocessing rides in the
         * same lazily-fetched chunk. A second dynamic boundary here would buy
         * nothing — nobody loads this file without also wanting bloom.
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
