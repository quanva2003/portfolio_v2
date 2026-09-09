import { about } from "@/content";

export default function About() {
  return (
    <section
      id="about"
      tabIndex={-1}
      aria-labelledby="about-heading"
      className="border-line py-section border-t"
    >
      <h2 data-split id="about-heading" className="text-headline max-w-[26ch]">
        {about.headline}
      </h2>
      <div className="mt-stack flex max-w-[65ch] flex-col gap-5">
        {about.paragraphs.map((paragraph) => (
          <p data-reveal key={paragraph} className="text-lead text-fg-muted">
            {paragraph}
          </p>
        ))}
      </div>
      <p data-reveal className="text-small text-fg-muted mt-10 font-mono">
        {about.education.degree} · {about.education.school} · {about.education.start} –{" "}
        {about.education.end} · GPA {about.education.gpa}
      </p>
    </section>
  );
}
