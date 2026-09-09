import type { Metadata } from "next";
import Image from "next/image";
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

/**
 * `title` is BARE. The root layout's `title.template` appends `· ${site.name}`,
 * so composing it here too would render "Panda ERP · Van Anh Quan · Van Anh Quan".
 *
 * `openGraph` has to repeat the image even though the root already declares one:
 * Next merges metadata a level at a time, so a child that specifies `openGraph`
 * REPLACES the parent's object rather than merging into it. Omitting `images`
 * here would silently ship case studies with no social card at all.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};

  const url = `/work/${project.slug}`;

  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: site.name,
      title: `${project.name} · ${site.name}`,
      description: project.summary,
      url,
      locale: "en_US",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: `${site.name} — ${site.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} · ${site.name}`,
      description: project.summary,
      images: ["/og.png"],
    },
  };
}

/** Label column / content column, so every case study reads on the same rhythm. */
function SpecBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section
      aria-labelledby={`spec-${label.replace(/\s+/g, "-").toLowerCase()}`}
      className="border-line py-stack grid gap-6 border-t md:grid-cols-12 md:gap-x-6"
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
            /*
             * 2px, not the 1px hairline used for borders elsewhere. A 1px
             * background element lands on whatever fractional Y the line box
             * gives it (measured .59 and .81 offsets here) and, unlike a
             * border, nothing snaps it to the device grid — at 1x DPR the
             * ember antialiases across two rows and reads as washed-out grey,
             * while the one marker that happened to land near an integer
             * stayed orange. Verified against a 3x capture, where all three
             * render correctly. 2px always keeps one fully-covered row.
             */
            <span aria-hidden="true" className="bg-ember mt-3 h-0.5 w-4 shrink-0" />
          )}
          {/*
           * Capped measure. The column is 875px wide, which at 16px body type
           * is 78 characters a line — well past comfortable, and inconsistent
           * with the 22px prose blocks that already sit at a well-judged 59.
           * The cap goes on the type, not the column: `ch` resolves against
           * the element's own font size, so one container-level cap can't
           * serve both 16px and 22px children.
           */}
          <p className="text-body text-fg-muted max-w-[66ch]">{item}</p>
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
        <header className="pb-stack flex flex-col gap-6 pt-32">
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

          {/*
           * Everything after media[0], which the hero already showed. Rendered
           * only when there is something left, so a project with one image (or
           * none) gets no empty heading.
           */}
          {project.media.length > 1 && (
            <SpecBlock label={ui.project.gallery}>
              <ul className="grid gap-6 sm:grid-cols-2">
                {project.media.slice(1).map((image) => (
                  <li
                    key={image.src}
                    /*
                     * No fixed aspect here, unlike the hero frame: these images
                     * are a mix of 21:9 tablet captures and tall phone
                     * screenshots, and forcing one ratio would crop the phones
                     * to a letterbox. `h-auto` lets each keep its own shape, and
                     * the intrinsic width/height still reserve the space.
                     */
                    className="rounded-media border-line bg-raised overflow-hidden border"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="(min-width: 640px) 45vw, 100vw"
                      className="h-auto w-full"
                    />
                  </li>
                ))}
              </ul>
            </SpecBlock>
          )}
        </div>
      </article>
    </main>
  );
}
