"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/*
 * Single-RAF contract (locked by the Phase 3 eng review):
 *
 *   requestAnimationFrame — ONE loop, owned by gsap.ticker
 *     └─ gsap.ticker
 *          ├─ lenis.raf(time * 1000) ──'scroll'──► ScrollTrigger.update()
 *          └─ active tweens (reveals, SplitText, cursor)
 *
 * Phase 4's R3F canvas must join THIS ticker (frameloop="never") — never
 * run its own RAF. gsap.matchMedia owns Lenis create/destroy, so toggling
 * the OS reduced-motion setting mid-session tears smooth scroll down (or
 * builds it up) without a reload. Reduced motion = no Lenis, native scroll.
 */
export default function MotionProvider() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ autoRaf: false });

      const drive = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(drive);
      gsap.ticker.lagSmoothing(0);
      lenis.on("scroll", ScrollTrigger.update);

      /*
       * In-page anchors, one owner: Lenis-aware scroll + focus moved to the
       * target (nav links momentum-scroll; the skip link jumps instantly —
       * a keyboard user should never sit through a momentum scroll).
       * Targets carry tabindex="-1" so focus() actually lands.
       */
      const onAnchorClick = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
        const anchor = (event.target as Element | null)?.closest?.('a[href^="#"]');
        if (!anchor) return;
        const id = decodeURIComponent((anchor.getAttribute("href") ?? "").slice(1));
        const target = id ? document.getElementById(id) : null;
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { immediate: anchor.hasAttribute("data-skip-link") });
        target.focus({ preventScroll: true });
        history.pushState(null, "", `#${id}`);
      };
      document.addEventListener("click", onAnchorClick);

      // test hook: the Playwright suite uses this to tell "Lenis active"
      // from "reduced motion / native scroll" deterministically.
      (window as Window & { __lenis?: Lenis }).__lenis = lenis;

      return () => {
        delete (window as Window & { __lenis?: Lenis }).__lenis;
        document.removeEventListener("click", onAnchorClick);
        lenis.destroy();
        gsap.ticker.remove(drive);
      };
    });
  });

  return null;
}
