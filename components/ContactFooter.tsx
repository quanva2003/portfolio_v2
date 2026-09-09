import { ArrowUpRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { contact, site, ui } from "@/content";
import Magnetic from "@/components/motion/Magnetic";
import Mark from "@/components/Mark";
import { resumeMeta } from "@/lib/resume";

/*
 * One pill, four uses. This was three copies of the same 180-character class
 * string; the CV link would have made it a fourth, which is where duplication
 * stops being cheaper than a constant.
 *
 * PILL deliberately sets NO display utility. Three of these are `inline-block`
 * and the CV link is `inline-flex` (it carries an icon), and composing
 * `${PILL} inline-flex` on top of an `inline-block` inside PILL would leave two
 * display rules on one element, resolved by their order in the compiled
 * stylesheet rather than by the order they are written here. That is precisely
 * the failure this row just came out of: until 2026-09-08 the theme's
 * `--spacing-block` key made Tailwind emit a competing
 * `.inline-block { inline-size: ... }` rule that won on file order and crushed
 * every pill in this row to 75px. Never rely on utility order; state the
 * display once, at the call site.
 *
 * See the namespace warning in styles/globals.css before adding any
 * `--spacing-*` key.
 */
const PILL =
  "rounded-pill border-line text-small text-fg hover:border-fg-muted hover:bg-raised border px-6 py-2.5 transition-colors duration-(--dur-fast) active:scale-[0.98]";

export default function ContactFooter() {
  const year = new Date().getFullYear();
  const resume = resumeMeta();

  return (
    <footer
      id="contact"
      tabIndex={-1}
      aria-labelledby="contact-heading"
      className="max-w-page px-gutter mx-auto w-full"
    >
      <div className="border-line py-section border-t">
        <h2 data-split id="contact-heading" className="font-display text-display uppercase">
          {ui.sections.contact}
        </h2>
        {/* the one ember-primary action on the page */}
        <a
          data-reveal
          href={`mailto:${contact.email}`}
          className="group font-display text-headline hover:text-ember mt-stack inline-flex flex-wrap items-baseline gap-2 break-all transition-colors duration-(--dur-fast)"
        >
          {contact.email}
          <ArrowUpRight
            weight="bold"
            className="ease-spring-snap size-[0.6em] shrink-0 self-center transition-transform duration-(--dur-gentle) group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </a>
        <ul data-reveal className="mt-stack flex flex-wrap gap-3">
          <li>
            <Magnetic>
              <a
                href={contact.github}
                rel="noreferrer"
                target="_blank"
                className={`${PILL} inline-block`}
              >
                {ui.contactLinks.github}
              </a>
            </Magnetic>
          </li>
          <li>
            <Magnetic>
              <a
                href={contact.linkedin}
                rel="noreferrer"
                target="_blank"
                className={`${PILL} inline-block`}
              >
                {ui.contactLinks.linkedin}
              </a>
            </Magnetic>
          </li>
          <li>
            <Magnetic>
              <a href={`tel:${contact.phoneHref}`} className={`${PILL} inline-block font-mono`}>
                {contact.phone}
              </a>
            </Magnetic>
          </li>
          <li>
            <Magnetic>
              {/*
               * `download` names the saved file, so the path on disk stays free
               * to change. The size rides in sr-only text rather than an
               * aria-label: an aria-label would REPLACE the accessible name,
               * costing a screen reader the visible word "CV"; appended text
               * keeps both, so the link announces as "CV, PDF, 252 KB".
               */}
              <a
                href={resume.href}
                download={resume.downloadAs}
                className={`${PILL} inline-flex items-center gap-2`}
              >
                {ui.contactLinks.resume}
                <span className="sr-only">
                  , {ui.contactLinks.resumeHint}, {resume.size}
                </span>
                <DownloadSimple weight="bold" aria-hidden="true" className="size-4 shrink-0" />
              </a>
            </Magnetic>
          </li>
        </ul>
      </div>
      <div className="border-line flex flex-wrap items-baseline justify-between gap-2 border-t py-8">
        <p className="text-small text-fg-muted flex items-center gap-2.5">
          <Mark size={16} className="text-fg-faint shrink-0" />© {year} {site.name}
        </p>
        <p className="text-small text-fg-muted">{site.location}</p>
      </div>
    </footer>
  );
}
