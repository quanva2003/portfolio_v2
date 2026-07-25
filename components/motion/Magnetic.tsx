"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { durations, gsapEase, springs } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/**
 * Magnetic pull for pill/block controls ONLY — never inline text links
 * (eng review F8: transform on inline text wobbles the layout).
 *
 * Per-event gsap.to with overwrite:"auto" instead of quickTo: the release
 * needs a different ease (spring overshoot), and an overwritten quickTo
 * tween goes dead — two tweens on the same props must be overwrite-safe.
 */
export default function Magnetic({
  children,
  strength = 0.35,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const onMove = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          gsap.to(el, {
            x: (event.clientX - (rect.left + rect.width / 2)) * strength,
            y: (event.clientY - (rect.top + rect.height / 2)) * strength,
            duration: durations.base,
            ease: gsapEase.outExpo,
            overwrite: "auto",
          });
        };
        const onLeave = () => {
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: springs.bounce.settle,
            ease: gsapEase.bounce,
            overwrite: "auto",
          });
        };

        el.addEventListener("pointermove", onMove, { passive: true });
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className="inline-block">
      {children}
    </span>
  );
}
