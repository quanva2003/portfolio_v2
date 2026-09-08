import type { Project } from "@/content";
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
 * Still a typographic placeholder. Real screenshots drop into this same
 * fixed-aspect frame with zero layout shift.
 */

const FRAME =
  "rounded-media border-line bg-raised flex items-center justify-center overflow-hidden border";

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

export type ProjectMediaVariant = keyof typeof ASPECT;

export default function ProjectMedia({
  project,
  variant,
}: {
  project: Project;
  variant: ProjectMediaVariant;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ viewTransitionName: viewTransitionName.projectMedia(project.slug) }}
      className={`${FRAME} ${ASPECT[variant]}`}
    >
      {/* TODO: real product screenshot for this project mounts here */}
      <span
        className={`font-display px-6 text-center uppercase select-none ${LABEL_SIZE[variant]}`}
      >
        {project.name}
      </span>
    </div>
  );
}
