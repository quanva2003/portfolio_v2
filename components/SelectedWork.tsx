import type { Project } from "@/content";
import { projects, ui } from "@/content";

/*
 * Asymmetric work grid: the flagship spans the full row with widescreen media;
 * the remaining three take decreasing column spans (5 / 4 / 3) on desktop
 * and collapse to a single column below lg.
 */
const SUPPORT_SPANS = ["lg:col-span-5", "lg:col-span-4", "lg:col-span-3"] as const;

/**
 * Explicit aspect-ratio media frame so real screenshots (Phase 4/5) drop in
 * with zero layout shift. Decorative for now, hence aria-hidden.
 */
function MediaSlot({ project, flagship }: { project: Project; flagship: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-media border-line bg-raised flex items-center justify-center overflow-hidden border ${
        flagship ? "aspect-video md:aspect-[21/9]" : "aspect-[4/3]"
      }`}
    >
      {/* TODO: real product screenshot for this project mounts here (Phase 4/5) */}
      <span
        className={`font-display text-fg-faint px-6 text-center uppercase select-none ${
          flagship ? "text-display" : "text-title"
        }`}
      >
        {project.name}
      </span>
    </div>
  );
}

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

function FlagshipCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col gap-6">
      <MediaSlot project={project} flagship />
      <div className="flex flex-col gap-4">
        <h3 className="text-headline">{project.name}</h3>
        <p className="text-lead text-fg-muted max-w-[60ch]">{project.description}</p>
        <StackList stack={project.stack} name={project.name} />
      </div>
      <ul className="grid gap-4 md:grid-cols-3">
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
    <article className="flex h-full flex-col gap-5">
      <MediaSlot project={project} flagship={false} />
      <div className="flex flex-col gap-3">
        <h3 className="text-title">{project.name}</h3>
        <p className="text-body text-fg-muted">{project.summary}</p>
        <StackList stack={project.stack} name={project.name} />
      </div>
    </article>
  );
}

export default function SelectedWork() {
  const ordered = [...projects].sort((a, b) => a.order - b.order);
  const flagship = ordered.filter((p) => p.flagship);
  const support = ordered.filter((p) => !p.flagship);

  return (
    <section id="work" aria-labelledby="work-heading" className="border-line py-section border-t">
      <h2 id="work-heading" className="font-display text-display uppercase">
        {ui.sections.work}
      </h2>
      <ul className="mt-block grid grid-cols-1 gap-x-6 gap-y-16 lg:grid-cols-12">
        {flagship.map((project) => (
          <li key={project.slug} className="lg:col-span-12">
            <FlagshipCard project={project} />
          </li>
        ))}
        {support.map((project, i) => (
          <li key={project.slug} className={SUPPORT_SPANS[i % SUPPORT_SPANS.length]}>
            <SupportCard project={project} />
          </li>
        ))}
      </ul>
    </section>
  );
}
