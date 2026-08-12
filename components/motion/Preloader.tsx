"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ui } from "@/content";
import { durations, gsapEase } from "@/lib/motion";
import { markPreloaderDone, preloader } from "@/lib/transition";

gsap.registerPlugin(useGSAP);

/*
 * Cold-load preloader, driven by real load signals.
 *
 * The progress CEILING is measured, never timed: a weighted set of promises
 * (webfonts, the document's load event, one entry per image that has to
 * decode) each raises the target when it actually settles, and the displayed
 * number only ever eases TOWARD that target from below. It can lag a real
 * signal; it can never run ahead of one, and it reaches 100 only once every
 * task has genuinely resolved. There is no timer in the progress path — the
 * only timeout in this feature is the failsafe in SectionMotion's gate, so a
 * preloader that throws can't leave the page blank forever.
 *
 * The easing runs on gsap.ticker, not its own rAF, keeping the Phase 3
 * single-RAF contract intact (e2e/motion.spec.ts test 7).
 *
 * Client-only by construction: the overlay renders only after the "init" pass,
 * so the server emits nothing and a no-JS visitor can never be trapped behind
 * an overlay that needs JS to remove. The one frame between first paint and
 * mounting is invisible — reveal targets are still hidden by the html.js
 * contract and the overlay is the same --color-ink as the body.
 *
 * Route changes never re-show it: this lives in the root layout, so it mounts
 * once per document load and renders null for the rest of the session.
 */

type Phase = "init" | "loading" | "done";

type LoadTask = { weight: number; settled: Promise<unknown> };

const documentLoaded = () =>
  document.readyState === "complete"
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        window.addEventListener("load", () => resolve(), { once: true });
      });

function collectLoadTasks(): LoadTask[] {
  const { weights } = preloader;

  const tasks: LoadTask[] = [
    // Webfonts. document.fonts.ready settles once every @font-face the page
    // actually uses has finished loading — the signal that decides whether the
    // hero's display type is real type or still a fallback.
    { weight: weights.fonts, settled: document.fonts.ready },
    // Everything else the document declares: stylesheets, scripts, chunks.
    { weight: weights.document, settled: documentLoaded() },
  ];

  /*
   * One task per image, so progress is granular rather than all-or-nothing.
   * decode() resolves when the bitmap is ready to paint, not merely
   * downloaded, and rejects on a broken image — a failed asset still has to
   * advance the bar or the preloader would never clear.
   *
   * Lazy images are skipped deliberately: a `loading="lazy"` image far below
   * the fold doesn't start fetching until it nears the viewport, so waiting on
   * its decode would hang the preloader on an asset the visitor can't see yet.
   */
  for (const image of Array.from(document.images)) {
    if (image.loading === "lazy" && !image.complete) continue;
    tasks.push({ weight: weights.image, settled: image.decode().catch(() => undefined) });
  }

  return tasks;
}

export default function Preloader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);
  const [phase, setPhase] = useState<Phase>("init");

  useGSAP(
    () => {
      if (phase === "done") return;

      if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
        // Reduced motion gets the page immediately — but the gate still has to
        // be released, or everything downstream of it stays blocked.
        markPreloaderDone();
        setPhase("done");
        return;
      }

      if (phase === "init") {
        // Commit the overlay first; its refs exist from the next pass.
        setPhase("loading");
        return;
      }

      const overlay = overlayRef.current;
      const bar = barRef.current;
      const track = trackRef.current;
      const counter = counterRef.current;
      if (!overlay || !bar || !track || !counter) return;

      const tasks = collectLoadTasks();
      const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
      let completedWeight = 0;
      let target = 0;
      for (const task of tasks) {
        task.settled.then(() => {
          completedWeight += task.weight;
          target = completedWeight / totalWeight;
        });
      }

      let shown = 0;
      let lastPercent = -1;
      let exiting = false;

      const render = (progress: number) => {
        bar.style.transform = `scaleX(${progress})`;
        const percent = Math.round(progress * 100);
        // Only touch text and ARIA when the integer actually moves — the
        // transform above is the only thing that needs per-frame updates.
        if (percent === lastPercent) return;
        lastPercent = percent;
        counter.textContent = String(percent).padStart(3, "0");
        counter.setAttribute("aria-valuenow", String(percent));
      };

      const exit = () => {
        render(1);
        gsap
          .timeline({ onComplete: () => setPhase("done") })
          .to([counter, track], {
            autoAlpha: 0,
            duration: durations.base,
            ease: gsapEase.outExpo,
          })
          .to(overlay, {
            yPercent: -100,
            duration: durations.slow,
            ease: gsapEase.inOutSoft,
            // Released as the wipe STARTS, not when it finishes: the hero's
            // SplitText reveal then plays through the clearing panel rather
            // than after it, which is the point of holding it back at all.
            onStart: markPreloaderDone,
          });
      };

      const tick = () => {
        if (exiting) return;
        const gap = target - shown;
        if (gap > 0) {
          // Proportional catch-up with a floor, clamped so it can never
          // overshoot a signal that hasn't actually arrived yet.
          shown = Math.min(
            target,
            shown + Math.max(gap * preloader.catchUpRate, preloader.minStep),
          );
        }
        if (target >= 1 && shown >= 1) {
          exiting = true;
          gsap.ticker.remove(tick);
          exit();
          return;
        }
        render(shown);
      };

      render(0);
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
      };
    },
    { dependencies: [phase] },
  );

  if (phase !== "loading") return null;

  return (
    <div
      ref={overlayRef}
      data-preloader
      className="bg-ink fixed inset-0 z-[80] flex flex-col justify-end"
    >
      <div className="max-w-page px-gutter pb-block mx-auto w-full">
        <div className="flex items-baseline justify-between gap-6">
          <p className="text-micro text-fg-muted font-mono uppercase">{ui.preloader.label}</p>
          {/*
           * font-mono, not the display face: the counter repaints as the
           * number climbs and proportional numerals would jitter its width.
           */}
          <p
            ref={counterRef}
            role="progressbar"
            aria-label={ui.preloader.label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            className="text-display text-fg font-mono"
          >
            000
          </p>
        </div>
        <div ref={trackRef} className="bg-line mt-6 h-px w-full">
          <div
            ref={barRef}
            aria-hidden="true"
            className="bg-ember h-px w-full origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}
