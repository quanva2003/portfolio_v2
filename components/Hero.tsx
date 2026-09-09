import Image from "next/image";
import { site } from "@/content";

/**
 * Full-viewport hero: the text stack bottom-anchored, the portrait beside it.
 *
 * COMPOSITION. On md and up the portrait sits on the RIGHT, because the
 * subject's gaze goes to the viewer's left — that sends the eye into the name
 * rather than off the edge of the page. Mirroring the columns would reverse it
 * and read as inattentive.
 *
 * Below md the two stack, portrait first. The first attempt instead floated the
 * portrait behind the copy at low opacity, and the display-xl name ran straight
 * across the face: legible, since the type sits on top, but it looked like a
 * layout accident. Stacking costs nothing here because the hero is `min-h-dvh`
 * and bottom-anchored, so on a phone there is a screen's worth of empty space
 * above the text doing nothing. The portrait moves into it.
 *
 * ONE <Image>, reordered with flexbox rather than two elements toggled by
 * breakpoint. Two would put two <img> tags in the markup for one photograph and
 * make the `priority` hint ambiguous about which is the LCP candidate.
 *
 * MOTION. The portrait carries its own [data-reveal] rather than sharing an
 * ancestor with the h1 — the heading is a [data-split] SplitText target, and the
 * Phase 3 rule is one animation owner per element.
 *
 * LCP. This is the largest element on the route, so it is `priority`. The
 * preloader (components/motion/Preloader.tsx) waits on real assets before it
 * clears, so the image resolves under the curtain rather than popping in after.
 */
export default function Hero() {
  const { portrait } = site;

  return (
    <section className="pb-stack flex min-h-dvh w-full flex-col justify-end gap-8 md:gap-6">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-10">
        {/*
         * `order` puts the portrait first while stacked and last once the row
         * forms, so the gaze-into-the-name rule holds on desktop without
         * duplicating the element.
         *
         * Widths are clamped rather than fractional: the name is fluid display
         * type that will consume every pixel offered to it, and a percentage
         * portrait beside it collapses to a sliver at the narrow end of md.
         */}
        <div
          data-reveal
          className="order-first w-[62%] max-w-70 self-end md:order-last md:w-[clamp(220px,26vw,400px)] md:max-w-none md:shrink-0 md:self-auto"
        >
          <Image
            src={portrait.src}
            alt={portrait.alt}
            width={portrait.width}
            height={portrait.height}
            sizes="(min-width: 1440px) 400px, (min-width: 768px) 26vw, 62vw"
            priority
            className="h-auto w-full"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <p data-reveal className="text-micro text-fg-muted font-mono uppercase">
            {site.location}
          </p>
          <h1 data-split className="font-display text-display-xl uppercase">
            {site.name}
          </h1>
          <div data-reveal className="flex flex-col gap-2">
            <p className="text-title text-fg">{site.title}</p>
            <p className="text-lead text-fg-muted max-w-[45ch]">{site.tagline}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
