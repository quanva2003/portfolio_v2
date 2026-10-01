import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/content";
import { projects, ui } from "@/content";
import ProjectMedia from "@/components/ProjectMedia";
import TransitionLink from "@/components/motion/TransitionLink";
import { projectPath } from "@/lib/transition";

/*
 * Asymmetric work grid: the flagship spans the full row with widescreen media;
 * the supporting cards take decreasing column spans on desktop and collapse to
 * a single column below lg.
 *
 * The spans are an explicit list, one per supporting card, NOT a repeating
 * cycle. 5 / 4 / 3 fills the first twelve-column row exactly; the fourth card
 * opens the next row at 5, matching the first so the two rows read as one
 * rhythm rather than as a row and a leftover. A modular `i % spans.length`
 * happens to produce the same number today and would silently produce a
 * ragged row the moment a fifth card lands — the array is the decision.
 *
 * One animation owner per element (the Phase 3 rule), applied to Phase 5's
 * route morph: [data-reveal] sits on the copy blocks, never on an ancestor of
 * the media frame. A view-transition-name'd element is snapshotted WITHOUT its
 * ancestors' effects applied, so a media frame nested under an opacity-0
 * reveal target would render fully opaque mid-transition and then dim — the
 * media frame belongs to the route morph, the copy belongs to the scroll
 * reveal, and neither touches the other.
 */
const SUPPORT_SPANS = [
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-3",
  "lg:col-span-5",
] as const;

/** Anything beyond the explicit list falls back to a half row rather than a stray span. */
const SUPPORT_SPAN_FALLBACK = "lg:col-span-6";

/*
 * One link per card, expanded to the whole card by an ::after overlay rather
 * than by wrapping everything: the accessible name stays the project title
 * alone, so the media frame, summary and stack list are never announced as
 * link text. The overlay is part of the <a>, so Cursor.tsx's delegated
 * `closest('a, button, [data-cursor]')` match scales the cursor across the
 * whole card for free.
 */
const CARD_LINK =
  "hover:text-ember after:absolute after:inset-0 after:content-[''] transition-colors duration-(--dur-fast) focus-visible:outline-offset-8";

function StackList({ stack, name }: { stack: string[]; name: string }) {
  return (
    <ul aria-label={`${name} stack`} className="flex flex-wrap gap-2">
      {stack.map((tech) => (
        <li
          key={tech}
          className="border-line text-micro text-fg-muted rounded-none border px-2.5 py-1 font-mono"
        >
          {tech}
        </li>
      ))}
    </ul>
  );
}

/** Non-interactive cue: the card's single real link already covers this hit area. */
function CaseStudyCue() {
  return (
    <span className="text-micro text-fg-muted group-hover:text-ember inline-flex items-center gap-2 font-mono uppercase transition-colors duration-(--dur-fast)">
      {ui.project.eyebrow}
      <ArrowRight
        weight="bold"
        aria-hidden="true"
        className="ease-spring-snap size-3 transition-transform duration-(--dur-gentle) group-hover:translate-x-1"
      />
    </span>
  );
}

function FlagshipCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex flex-col gap-6">
      <ProjectMedia project={project} variant="flagship" />
      <div data-reveal className="flex flex-col gap-4">
        <h3 className="text-headline">
          <TransitionLink href={projectPath(project.slug)} className={CARD_LINK}>
            {project.name}
          </TransitionLink>
        </h3>
        <p className="text-lead text-fg-muted max-w-[60ch]">{project.description}</p>
        <StackList stack={project.stack} name={project.name} />
        <CaseStudyCue />
      </div>
      <ul data-reveal className="grid gap-4 md:grid-cols-3">
        {project.highlights.map((highlight) => (
          <li key={highlight} className="border-line text-small text-fg-muted border-t pt-3">
            {highlight}
          </li>
        ))}
      </ul>
    </article>
  );
}

function SupportCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex h-full flex-col gap-5">
      <ProjectMedia project={project} variant="card" />
      <div data-reveal className="flex flex-col gap-3">
        <h3 className="text-title">
          <TransitionLink href={projectPath(project.slug)} className={CARD_LINK}>
            {project.name}
          </TransitionLink>
        </h3>
        <p className="text-body text-fg-muted">{project.summary}</p>
        <StackList stack={project.stack} name={project.name} />
        <CaseStudyCue />
      </div>
    </article>
  );
}

export default function SelectedWork() {
  const ordered = [...projects].sort((a, b) => a.order - b.order);
  const flagship = ordered.filter((p) => p.flagship);
  const support = ordered.filter((p) => !p.flagship);

  return (
    <section
      id="work"
      tabIndex={-1}
      aria-labelledby="work-heading"
      className="border-line py-section border-t"
    >
      <h2 data-split id="work-heading" className="font-display text-display uppercase">
        {ui.sections.work}
      </h2>
      <ul className="mt-stack grid grid-cols-1 gap-x-6 gap-y-16 lg:grid-cols-12">
        {flagship.map((project) => (
          <li key={project.slug} className="lg:col-span-12">
            <FlagshipCard project={project} />
          </li>
        ))}
        {support.map((project, i) => (
          <li key={project.slug} className={SUPPORT_SPANS[i] ?? SUPPORT_SPAN_FALLBACK}>
            <SupportCard project={project} />
          </li>
        ))}
      </ul>
    </section>
  );
}
