"use client";

import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import gsap from "gsap";
import DisplacementPlane from "./DisplacementPlane";
import { useWebGLSupport } from "./useWebGLSupport";
import { dprRange } from "@/lib/webgl/tokens";

/*
 * Single-RAF contract (locked by the Phase 3 eng review, extended in Phase 4):
 * this Canvas uses frameloop="never" and is advanced exclusively from
 * gsap.ticker (see TickerBridge below) — it never runs its own RAF loop.
 * gsap.ticker's callback arg is already in SECONDS (three.js Clock
 * convention, same as what advance() expects) — do NOT multiply by 1000 the
 * way MotionProvider's Lenis bridge does; that conversion is only for
 * Lenis's millisecond-based raf() API.
 */
function TickerBridge() {
  const advance = useThree((state) => state.advance);

  useEffect(() => {
    const tick = (time: number) => advance(time);
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance]);

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
 * Renders nothing under reduced motion OR when WebGL is unavailable/lost —
 * both fall back to the same thing: the static Phase 2 hero, unmodified.
 */
export default function WebGLBackground() {
  const [motionAllowed, setMotionAllowed] = useState(false);
  const { status, setStatus } = useWebGLSupport();

  useEffect(() => {
    const media = window.matchMedia(MOTION_QUERY);
    const sync = () => setMotionAllowed(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (!motionAllowed || status !== "available") return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
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
        <TickerBridge />
        <DisplacementPlane />
      </Canvas>
    </div>
  );
}
