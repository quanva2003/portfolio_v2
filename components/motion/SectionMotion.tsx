"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { durations, gsapEase } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/*
 * Reveal orchestrator — the ONE client owner of scroll choreography.
 * Sections stay server components and opt in via data attributes:
 *
 *   [data-reveal]  block fades/slides in on first viewport entry
 *   [data-split]   heading rises line-masked via SplitText (words/lines,
 *                  NOT chars — Archivo wdth 125 + negative tracking loses
 *                  kerning between split chars). data-split elements are
 *                  EXCLUDED from data-reveal — one animation owner each.
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

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /*
       * autoSplit waits for fonts and re-splits on width changes, so line
       * breaks always match the rendered type (next/font display:swap +
       * fluid clamp() sizes). Animations are (re)created in onSplit so a
       * re-split re-animates cleanly; built-in aria keeps headings intact
       * for screen readers.
       */
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((heading) => {
        SplitText.create(heading, {
          type: "lines,words",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) => {
            const rise = gsap.from(self.words, {
              yPercent: 110,
              duration: durations.reveal,
              ease: gsapEase.outExpo,
              stagger: 0.06,
              scrollTrigger: { trigger: heading, start: "top 85%", once: true },
            });
            // words now sit hidden behind the line masks — the CSS
            // pre-hydration hidden state has done its job, lift it.
            gsap.set(heading, { opacity: 1 });
            return rise;
          },
        });
      });
    });
  });

  return null;
}
