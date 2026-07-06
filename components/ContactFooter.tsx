import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { contact, site, ui } from "@/content";

export default function ContactFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      aria-labelledby="contact-heading"
      className="max-w-page px-gutter mx-auto w-full"
    >
      <div className="border-line py-section border-t">
        <h2 id="contact-heading" className="font-display text-display uppercase">
          {ui.sections.contact}
        </h2>
        {/* the one ember-primary action on the page */}
        <a
          href={`mailto:${contact.email}`}
          className="group font-display text-headline hover:text-ember mt-block inline-flex flex-wrap items-baseline gap-2 break-all transition-colors duration-(--dur-fast)"
        >
          {contact.email}
          <ArrowUpRight
            weight="bold"
            className="ease-spring-snap size-[0.6em] shrink-0 self-center transition-transform duration-(--dur-gentle) group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </a>
        <ul className="mt-block flex flex-wrap gap-3">
          <li>
            <a
              href={contact.github}
              rel="noreferrer"
              target="_blank"
              className="rounded-pill border-line text-small text-fg hover:border-fg-muted hover:bg-raised inline-block border px-6 py-2.5 transition-colors duration-(--dur-fast) active:scale-[0.98]"
            >
              {ui.contactLinks.github}
            </a>
          </li>
          <li>
            <a
              href={contact.linkedin}
              rel="noreferrer"
              target="_blank"
              className="rounded-pill border-line text-small text-fg hover:border-fg-muted hover:bg-raised inline-block border px-6 py-2.5 transition-colors duration-(--dur-fast) active:scale-[0.98]"
            >
              {ui.contactLinks.linkedin}
            </a>
          </li>
          <li>
            <a
              href={`tel:${contact.phone}`}
              className="rounded-pill border-line text-small text-fg hover:border-fg-muted hover:bg-raised inline-block border px-6 py-2.5 font-mono transition-colors duration-(--dur-fast) active:scale-[0.98]"
            >
              {contact.phone}
            </a>
          </li>
        </ul>
      </div>
      <div className="border-line flex flex-wrap items-baseline justify-between gap-2 border-t py-8">
        <p className="text-small text-fg-muted">
          © {year} {site.name}
        </p>
        <p className="text-small text-fg-muted">{site.location}</p>
      </div>
    </footer>
  );
}
