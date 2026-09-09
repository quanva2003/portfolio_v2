import { experience, projectBySlug, ui } from "@/content";
import TransitionLink from "@/components/motion/TransitionLink";
import { projectPath } from "@/lib/transition";

/**
 * Case-study links for the projects built during a role.
 *
 * Three of the four entries in projects.ts were built at Dan Solutions, and
 * until now nothing on the page said so — the reader had to infer it from dates.
 * Resolving through `projectBySlug` rather than hardcoding names means a slug
 * that stops existing renders nothing instead of a dead link.
 */
function RoleProjects({ slugs }: { slugs: string[] }) {
  const linked = slugs.map(projectBySlug).filter((project) => project !== undefined);
  if (linked.length === 0) return null;

  return (
    <ul className="mt-5 flex flex-wrap gap-2">
      {linked.map((project) => (
        <li key={project.slug}>
          <TransitionLink
            href={projectPath(project.slug)}
            className="rounded-pill border-line text-micro text-fg-muted hover:border-fg-muted hover:text-fg inline-block border px-3 py-1 font-mono transition-colors duration-(--dur-fast)"
          >
            {project.name}
          </TransitionLink>
        </li>
      ))}
    </ul>
  );
}

export default function Experience() {
  return (
    <section
      id="experience"
      tabIndex={-1}
      aria-labelledby="experience-heading"
      className="border-line py-section border-t"
    >
      <h2 data-split id="experience-heading" className="font-display text-display uppercase">
        {ui.sections.experience}
      </h2>
      <ol className="mt-stack flex flex-col">
        {experience.map((entry) => (
          <li
            data-reveal
            key={`${entry.company}-${entry.start}`}
            /* 12rem, not 10: the date column now carries "Aug 2023 - Feb 2024",
               which is 19 mono characters and lands within a pixel of a 10rem
               track — one font fallback away from overflowing into the role. */
            className="border-line grid gap-2 border-t py-8 first:border-t-0 first:pt-0 md:grid-cols-[12rem_1fr] md:gap-8"
          >
            <p className="text-small text-fg-muted pt-1.5 font-mono">
              {entry.start} - {entry.end ?? ui.present}
            </p>
            <div>
              <h3 className="text-title">{entry.role}</h3>
              <p className="text-body text-fg-muted mt-1">{entry.company}</p>
              <p className="text-body text-fg-muted mt-4 max-w-[55ch]">{entry.summary}</p>

              {/*
               * The achievement bullets. `text-body` at max-[68ch] rather than
               * the 55ch above: these run longer than the summary, and holding
               * them to the summary's measure would stack most of them onto
               * three lines each.
               */}
              <ul className="mt-6 flex flex-col gap-3">
                {entry.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-4">
                    {/* 2px, matching the case-study rule marker — a 1px background
                        element lands on a fractional Y and antialiases to grey. */}
                    <span aria-hidden="true" className="bg-ember mt-2.5 h-0.5 w-4 shrink-0" />
                    <p className="text-body text-fg-muted max-w-[68ch]">{highlight}</p>
                  </li>
                ))}
              </ul>

              <ul aria-label={`${entry.company} stack`} className="mt-6 flex flex-wrap gap-2">
                {entry.stack.map((tech) => (
                  <li
                    key={tech}
                    className="border-line text-micro text-fg-muted rounded-none border px-2.5 py-1 font-mono"
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              {entry.projects && <RoleProjects slugs={entry.projects} />}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
