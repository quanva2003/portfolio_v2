import Image from "next/image";
import type { Project } from "@/content";
import { ui } from "@/content";
import { viewTransitionName } from "@/lib/transition";

/**
 * The ONE project media frame, rendered by both the work grid and the
 * case-study hero.
 *
 * `view-transition-name` is what the browser morphs on a list -> detail
 * navigation, and a name only pairs up if the same string exists in the old
 * and the new state — so both sides go through this component instead of
 * naming elements independently and drifting apart.
 *
 * Every card carries a name, not just the one being clicked: the reverse
 * navigation (detail -> list) captures the grid AFTER it has rendered, so
 * there'd be nothing to attach a name to at click time. The cost is that the
 * three non-matching cards animate as their own exit groups rather than
 * inside the root cross-fade — identical geometry, imperceptible on a dark
 * page, and worth it for a morph that works in both directions.
 *
 * A project with no `media` yet falls back to the typographic tile this
 * component used to be for everything. That is what lets imagery land one
 * project at a time instead of all four at once.
 */

const FRAME =
  "rounded-media border-line bg-raised relative flex items-center justify-center overflow-hidden border";

const ASPECT = {
  flagship: "aspect-video md:aspect-[21/9]",
  card: "aspect-[4/3]",
  hero: "aspect-video md:aspect-[21/9]",
} as const;

/*
 * Label colour is per-variant, and the reason is contrast, not taste.
 *
 * fg-faint is 3.07:1 on the raised frame — legal only at WCAG AA's LARGE-text
 * threshold (>=24px regular). `display` clears that comfortably at every
 * viewport. `title` does NOT: its clamp resolves to ~23px at 393px, just under
 * the line, which Lighthouse flagged as a real color-contrast failure. The card
 * variant therefore steps up to fg-muted (6.7:1 on raised) rather than the type
 * scale being bent to rescue a placeholder.
 */
const LABEL_SIZE = {
  flagship: "text-display text-fg-faint",
  card: "text-title text-fg-muted",
  hero: "text-display text-fg-faint",
} as const;

/*
 * Only the two large frames get `priority`. The flagship card is at the top of
 * the grid and the case-study hero is the LCP of its route; the small cards are
 * below the fold on every viewport, and marking those priority too would just
 * contend for bandwidth with the one image that actually gates the paint.
 */
const PRIORITY: Record<ProjectMediaVariant, boolean> = {
  flagship: true,
  hero: true,
  card: false,
};

/*
 * `sizes` tells the browser how wide the image will RENDER so it can pick a
 * source before layout. Mirrors components/SelectedWork.tsx: the flagship spans
 * all 12 columns, the support cards take 5/4/3 of 12 on lg, and everything
 * collapses to one column below that. Getting this wrong does not break the
 * page, it silently ships a 1600px file to a 380px card.
 */
const SIZES = {
  flagship: "(min-width: 1440px) 1400px, 100vw",
  hero: "(min-width: 1440px) 1400px, 100vw",
  card: "(min-width: 1024px) 40vw, 100vw",
} as const;

export type ProjectMediaVariant = keyof typeof ASPECT;

export default function ProjectMedia({
  project,
  variant,
}: {
  project: Project;
  variant: ProjectMediaVariant;
}) {
  const image = project.media[0];
  const isMockup = project.mediaKind === "mockup";

  return (
    <div
      style={{ viewTransitionName: viewTransitionName.projectMedia(project.slug) }}
      className={`${FRAME} ${ASPECT[variant]}`}
    >
      {image ? (
        <>
          {/*
           * `object-cover` with `object-top`: these are product screenshots, and
           * the information that identifies a screen — its header, its primary
           * controls — lives at the top. Centring the crop would cut the header
           * off both ends on the 21:9 frames.
           */}
          {/*
           * Screenshots of light-UI products on a dark-locked page.
           *
           * Panda ERP and Skyline are both white interfaces, and dropped in at
           * full brightness they read as lightboxes punched through the page —
           * they out-contrast the display type they sit under and break the one
           * thing this design has, which is a consistent dark ground. Damping
           * them slightly at rest and restoring full fidelity on hover keeps the
           * grid legible as a whole and still lets a reader see the real thing.
           *
           * Kept mild on purpose (92% brightness, 90% saturation). Anything
           * heavier starts to look like the screenshots are being hidden, which
           * is the opposite of the point.
           *
           * The tint sits on a sibling overlay rather than as a filter on the
           * <img>, because a filter on a view-transition-name'd subtree is
           * snapshotted inconsistently mid-morph.
           */}
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={SIZES[variant]}
            priority={PRIORITY[variant]}
            className="h-full w-full object-cover object-top brightness-[0.92] saturate-[0.9] transition-[filter] duration-(--dur-base) group-hover:brightness-100 group-hover:saturate-100"
          />
          <span
            aria-hidden="true"
            className="bg-ink/12 pointer-events-none absolute inset-0 transition-opacity duration-(--dur-base) group-hover:opacity-0"
          />
          {isMockup && (
            /*
             * Not decoration, and not optional. Three of the four projects show
             * genuine product screenshots; an unlabelled mockup sitting beside
             * them reads as a fourth one. Saying so plainly is both the honest
             * position and the one that survives someone asking.
             */
            <p className="text-micro text-fg-muted bg-ink/85 border-line absolute right-0 bottom-0 border-t border-l px-3 py-1.5 font-mono">
              {ui.project.mockupNotice}
            </p>
          )}
        </>
      ) : (
        <span
          aria-hidden="true"
          className={`font-display px-6 text-center uppercase select-none ${LABEL_SIZE[variant]}`}
        >
          {project.name}
        </span>
      )}
    </div>
  );
}
