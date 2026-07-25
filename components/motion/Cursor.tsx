"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { durations, gsapEase } from "@/lib/motion";
import { subscribePointer, type PointerPosition } from "@/lib/webgl/pointer";

gsap.registerPlugin(useGSAP);

/** Cursor exists only for fine pointers with motion allowed (QA gate: hidden on touch). */
const ACTIVE_QUERY = "(pointer: fine) and (prefers-reduced-motion: no-preference)";

/** One delegated listener decides what counts as interactive — future links/buttons are covered automatically (eng review 7A). */
const INTERACTIVE = "a, button, [data-cursor]";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(ACTIVE_QUERY);
    const sync = () => setActive(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useGSAP(
    () => {
      const dot = dotRef.current;
      if (!active || !dot) return;

      document.documentElement.classList.add("custom-cursor");
      // scaleX/scaleY, not the "scale" shorthand: GSAP's quickTo() updates a
      // running tween's property in place, but "scale" is a shorthand CSSPlugin
      // decomposes internally — quickTo can't find a direct PropTween for it
      // and falls back to a full re-init every call (console warning: "scale
      // not eligible for reset"). The individual properties tween directly.
      gsap.set(dot, { xPercent: -50, yPercent: -50, autoAlpha: 0, scaleX: 1, scaleY: 1 });

      const xTo = gsap.quickTo(dot, "x", { duration: durations.base, ease: gsapEase.outExpo });
      const yTo = gsap.quickTo(dot, "y", { duration: durations.base, ease: gsapEase.outExpo });
      const scaleXTo = gsap.quickTo(dot, "scaleX", {
        duration: durations.base,
        ease: gsapEase.outExpo,
      });
      const scaleYTo = gsap.quickTo(dot, "scaleY", {
        duration: durations.base,
        ease: gsapEase.outExpo,
      });

      let shown = false;
      const onMove = (pos: PointerPosition) => {
        xTo(pos.x);
        yTo(pos.y);
        if (!shown) {
          shown = true;
          gsap.to(dot, { autoAlpha: 1, duration: durations.fast });
        }
      };

      let hovering = false;
      const onOver = (event: PointerEvent) => {
        const hit = Boolean((event.target as Element | null)?.closest?.(INTERACTIVE));
        if (hit === hovering) return;
        hovering = hit;
        const scale = hit ? 2.5 : 1;
        scaleXTo(scale);
        scaleYTo(scale);
        dot.dataset.state = hit ? "hover" : "default";
      };

      const onLeaveWindow = () => {
        shown = false;
        gsap.to(dot, { autoAlpha: 0, duration: durations.fast });
      };

      const unsubscribeMove = subscribePointer(onMove);
      document.addEventListener("pointerover", onOver, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeaveWindow);

      return () => {
        unsubscribeMove();
        document.removeEventListener("pointerover", onOver);
        document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
        document.documentElement.classList.remove("custom-cursor");
      };
    },
    { dependencies: [active] },
  );

  if (!active) return null;

  return (
    <div
      ref={dotRef}
      data-cursor-dot
      data-state="default"
      aria-hidden="true"
      className="rounded-pill bg-white pointer-events-none fixed top-0 left-0 z-[70] size-3 opacity-0 mix-blend-difference"
    />
  );
}
