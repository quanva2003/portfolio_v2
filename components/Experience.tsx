import { experience, ui } from "@/content";

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
      <ol className="mt-block flex flex-col">
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
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
