import { AndroidLogo, AppleLogo, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { AppListing, AppStoreListing } from "@/content";
import { apps, projectBySlug, ui } from "@/content";
import TransitionLink from "@/components/motion/TransitionLink";
import { projectPath } from "@/lib/transition";

/**
 * The published apps, as store listings rather than as case studies.
 *
 * WHY THIS IS A RULED LIST AND NOT A SECOND CARD GRID
 *
 * It sits directly under SelectedWork, which is a media-heavy asymmetric grid.
 * Repeating that shape here would make the page read as two passes over the
 * same content — the reader's eye would find the second grid and assume it had
 * already scrolled past it. A ruled list borrowed from the Experience timeline
 * gives the section its own rhythm and quietly states its own claim: this is a
 * register of facts, not a portfolio of work. The work is one scroll up.
 *
 * There are also no app icons here, and that is deliberate rather than pending.
 * None of the three icons are assets this repo has any right to publish, and a
 * placeholder tile per row would be three grey squares doing the job that the
 * app's name already does.
 */

/* Phosphor ships no Google Play mark, so the row names PLATFORMS and the link
   text names the store. That is the more accurate pairing anyway: the glyph
   answers "will it run on my phone", the link answers "where do I get it". */
const PLATFORM_ICON = {
  iOS: AppleLogo,
  Android: AndroidLogo,
} as const;

function PlatformChips({ platforms, name }: { platforms: AppListing["platforms"]; name: string }) {
  return (
    <ul aria-label={`${name} platforms`} className="flex flex-wrap gap-2">
      {platforms.map((platform) => {
        const Icon = PLATFORM_ICON[platform];
        return (
          <li
            key={platform}
            className="rounded-pill border-line text-micro text-fg-muted inline-flex items-center gap-1.5 border px-3 py-1 font-mono"
          >
            <Icon weight="fill" aria-hidden="true" className="size-3.5" />
            {platform}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * One store row — always a real link.
 *
 * Every URL in content/apps.ts was opened and seen to return 200. Do not add a
 * row for a store whose address you do not have: an App Store URL cannot be
 * constructed from an app's name, and the guess is exactly what 404s on the
 * one click this section exists to earn. The CV's own link is that guess.
 */
function StoreLink({ listing, label }: { listing: AppStoreListing; label: string }) {
  return (
    <li>
      <a
        href={listing.url}
        target="_blank"
        /* `noreferrer` as well as `noopener`: these are third-party store pages,
           and there is no reason to hand them this site's URL as a referrer. */
        rel="noopener noreferrer"
        className="text-small hover:text-ember group/link inline-flex items-center gap-1.5 font-mono transition-colors duration-(--dur-fast)"
      >
        {label}
        <ArrowUpRight
          weight="bold"
          aria-hidden="true"
          className="ease-spring-snap size-3.5 transition-transform duration-(--dur-gentle) group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
        />
      </a>
    </li>
  );
}

function AppRow({ app }: { app: AppListing }) {
  /* Resolved, never hardcoded: a slug that stops existing renders no link
     rather than a dead one. Same contract as Experience's RoleProjects. */
  const project = app.projectSlug ? projectBySlug(app.projectSlug) : undefined;

  return (
    <li
      data-reveal
      /*
       * Metadata rail LEFT, copy right on desktop — the same column shape as
       * the Experience timeline's `[12rem_1fr]`, so the two sections scan as
       * one system rather than as two unrelated lists. The rail is PLACED
       * there by grid, not written there; see the comment on it below.
       *
       * This was `[1fr_auto]` with the stores on the right, which measured
       * badly: at 1440px the copy caps at 60ch and the auto column pins to the
       * page edge, opening a ~470px void that read as a layout bug rather than
       * as whitespace. A fixed left rail has no such gap at any width.
       */
      className="border-line grid gap-6 border-t py-10 first:border-t-0 first:pt-0 md:grid-cols-[14rem_1fr] md:gap-12"
    >
      <div className="max-w-[60ch] md:col-start-2 md:row-start-1">
        <p className="text-micro text-fg-faint font-mono uppercase">{app.audience}</p>
        <h3 className="text-title mt-2">{app.name}</h3>
        <p className="text-body text-fg-muted mt-3">{app.blurb}</p>

        <ul aria-label={`${app.name} stack`} className="mt-5 flex flex-wrap gap-2">
          {app.stack.map((tech) => (
            <li
              key={tech}
              className="border-line text-micro text-fg-muted rounded-none border px-2.5 py-1 font-mono"
            >
              {tech}
            </li>
          ))}
        </ul>

        {project && (
          <TransitionLink
            href={projectPath(project.slug)}
            className="text-micro text-fg-muted hover:text-ember group/case mt-5 inline-flex items-center gap-2 font-mono uppercase transition-colors duration-(--dur-fast)"
          >
            {ui.apps.caseStudy}
            <ArrowUpRight
              weight="bold"
              aria-hidden="true"
              className="ease-spring-snap size-3 transition-transform duration-(--dur-gentle) group-hover/case:translate-x-0.5 group-hover/case:-translate-y-0.5"
            />
          </TransitionLink>
        )}
      </div>

      {/*
       * The availability rail, placed into column 1 rather than written there.
       *
       * DOM order is name-then-stores at every width, because the single-column
       * mobile layout follows the DOM: with the rail written first, a phone
       * reader met "AVAILABLE ON / App Store" before the app's name and had to
       * scroll back to find out what they were being offered. Grid placement
       * moves it left on desktop without that cost — the heading still comes
       * first for a screen reader and for a keyboard tab, which is the order
       * that matches the content.
       */}
      <div className="md:col-start-1 md:row-start-1">
        <p className="text-micro text-fg-faint font-mono uppercase">{ui.apps.availability}</p>
        <div className="mt-3">
          <PlatformChips platforms={app.platforms} name={app.name} />
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {app.appStore && <StoreLink listing={app.appStore} label={ui.apps.appStore} />}
          {app.googlePlay && <StoreLink listing={app.googlePlay} label={ui.apps.googlePlay} />}
        </ul>
      </div>
    </li>
  );
}

export default function ShippedApps() {
  return (
    <section
      id="apps"
      tabIndex={-1}
      aria-labelledby="apps-heading"
      className="border-line py-section border-t"
    >
      <h2 data-split id="apps-heading" className="font-display text-display uppercase">
        {ui.sections.apps}
      </h2>
      <p data-reveal className="text-lead text-fg-muted mt-stack max-w-[55ch]">
        {ui.apps.intro}
      </p>
      <ol className="mt-stack flex flex-col">
        {apps.map((app) => (
          <AppRow key={app.slug} app={app} />
        ))}
      </ol>
    </section>
  );
}
