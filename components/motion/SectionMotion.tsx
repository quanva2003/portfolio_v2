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
        // GSAP only self-kills a `once:true` trigger when its crossing point
        // isn't "clipped" by the scroll boundary. Elements near the very
        // bottom of the page (the footer) hit max-scroll before reaching
        // their trigger point, so the crossing IS clipped: the callback
        // still fires, but the auto-kill is skipped and the trigger leaks.
        // Killing explicitly here makes the "once" contract deterministic.
        onEnter: (batch, triggers) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: durations.slow,
            ease: gsapEase.outExpo,
            stagger: 0.08,
            overwrite: true,
          });
          triggers.forEach((trigger) => trigger.kill());
        },
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
              // Same clipped-crossing gap as the reveal batch above (headings
              // near the footer never get an unclipped auto-kill) — kill the
              // trigger ourselves once the reveal has actually played.
              onComplete: () => rise.scrollTrigger?.kill(),
            });
            // words now sit hidden behind the line masks — the CSS
            // pre-hydration hidden state has done its job, lift it.
            gsap.set(heading, { opacity: 1 });
            return rise;
          },
        });
      });
    });

    // Headings can reflow when the real webfont swaps in (autoSplit re-splits
    // on that same signal), which shifts every element below them in normal
    // flow. The reveal batch above computed its "top 85%" positions before
    // that swap — without a refresh, elements past a reflowed heading can
    // sit above their trigger's start line forever, and once:true never fires.
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  });

  return null;
}
