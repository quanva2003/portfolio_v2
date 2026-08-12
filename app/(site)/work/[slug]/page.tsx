import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { projects, projectBySlug, site, ui } from "@/content";
import ProjectMedia from "@/components/ProjectMedia";
import TransitionLink from "@/components/motion/TransitionLink";

type PageProps = { params: Promise<{ slug: string }> };

/** Every case study is static at build time, so <Link> prefetch makes the morph instant. */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};

  return {
    title: `${project.name} · ${site.name}`,
    description: project.summary,
  };
}

/** Label column / content column, so every case study reads on the same rhythm. */
function SpecBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section
      aria-labelledby={`spec-${label.replace(/\s+/g, "-").toLowerCase()}`}
      className="border-line py-block grid gap-6 border-t md:grid-cols-12 md:gap-x-6"
    >
      <h2
        id={`spec-${label.replace(/\s+/g, "-").toLowerCase()}`}
        className="text-micro text-fg-muted font-mono uppercase md:col-span-3"
      >
        {label}
      </h2>
      <div data-reveal className="flex flex-col gap-5 md:col-span-8 md:col-start-5">
        {children}
      </div>
    </section>
  );
}

function MarkerList({ items, marker }: { items: string[]; marker: "index" | "rule" }) {
  return (
    <ul className="flex flex-col gap-5">
      {items.map((item, i) => (
        <li key={item} className="flex gap-4">
          {marker === "index" ? (
            <span aria-hidden="true" className="text-micro text-fg-faint pt-1.5 font-mono">
              {String(i + 1).padStart(2, "0")}
            </span>
          ) : (
            <span aria-hidden="true" className="bg-ember mt-3 h-px w-4 shrink-0" />
          )}
          <p className="text-body text-fg-muted">{item}</p>
        </li>
      ))}
    </ul>
  );
}

export default async function ProjectCaseStudy({ params }: PageProps) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  return (
    <main id="main" tabIndex={-1} className="max-w-page px-gutter mx-auto w-full">
      <article>
        <header className="pb-block flex flex-col gap-6 pt-32">
          <TransitionLink
            href="/#work"
            className="text-micro text-fg-muted hover:text-fg inline-flex w-fit items-center gap-2 font-mono uppercase transition-colors duration-(--dur-fast)"
          >
            <ArrowLeft weight="bold" aria-hidden="true" className="size-3" />
            {ui.project.back}
          </TransitionLink>
          {/*
           * No data-split here: the route morph already owns this heading's
           * entrance. Splitting it too would put two animations on one element,
           * the thing Phase 3 locked out.
           */}
          <h1 className="font-display text-display-xl uppercase">{project.name}</h1>
          <p className="text-lead text-fg-muted max-w-[55ch]">{project.summary}</p>
        </header>

        <ProjectMedia project={project} variant="hero" />

        <div className="mt-section">
          <SpecBlock label={ui.project.problem}>
            <p className="text-lead text-fg-muted">{project.detail.problem}</p>
          </SpecBlock>

          <SpecBlock label={ui.project.role}>
            <p className="text-lead text-fg">{project.role}</p>
          </SpecBlock>

          <SpecBlock label={ui.project.stack}>
            <ul aria-label={`${project.name} stack`} className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="border-line text-small text-fg-muted rounded-none border px-3 py-1.5 font-mono"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </SpecBlock>

          <SpecBlock label={ui.project.shipped}>
            <MarkerList items={project.detail.shipped} marker="index" />
          </SpecBlock>

          <SpecBlock label={ui.project.results}>
            <MarkerList items={project.detail.results} marker="rule" />
          </SpecBlock>
        </div>
      </article>
    </main>
  );
}
