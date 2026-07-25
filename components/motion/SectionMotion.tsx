"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { durations, gsapEase } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/*
 * Reveal orchestrator — the ONE client owner of scroll choreography.
 * Sections stay server components and opt in via data attributes:
 *
 *   [data-reveal]  block fades/slides in on first viewport entry
 *
 * Hidden-before-reveal contract (eng review F1): the pre-hydration hidden
 * state lives in CSS under `html.js` + no-preference (see globals.css), so
 * no-JS and reduced-motion visitors always see content and hydrated visitors
 * never see a flash-then-hide. Mounted per-page so future routes (Phase 5)
 * re-bind fresh triggers.
 */
export default function SectionMotion() {
  useGSAP(() => {
    // test hook: the Playwright suite asserts every once:true trigger has
    // self-destroyed after a full-page scroll (leak gate).
    (window as Window & { __stCount?: () => number }).__stCount = () =>
      ScrollTrigger.getAll().length;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const blocks = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (blocks.length === 0) return;

      // CSS owns the initial opacity: 0; JS only adds the slide offset.
      gsap.set(blocks, { y: 28 });

      ScrollTrigger.batch(blocks, {
        start: "top 85%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: durations.slow,
            ease: gsapEase.outExpo,
            stagger: 0.08,
            overwrite: true,
          }),
      });
    });
  });

  return null;
}
