import type { Metadata } from "next";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import MotionDemos from "@/components/styleguide/MotionDemos";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false },
};

const TYPE_RAMP = [
  {
    token: "text-display-xl",
    clamp: "clamp(3.25rem, 6.4vw, 8.5rem)",
    className: "font-display text-display-xl uppercase",
    sample: "Van Anh Quan",
  },
  {
    token: "text-display",
    clamp: "clamp(2.5rem, 3.7vw, 5.5rem)",
    className: "font-display text-display uppercase",
    sample: "Selected Work",
  },
  {
    token: "text-headline",
    clamp: "clamp(1.875rem, 1.7vw, 3.25rem)",
    className: "text-headline",
    sample: "Interfaces that feel as good as they work.",
  },
  {
    token: "text-title",
    clamp: "clamp(1.375rem, 0.75vw, 2rem)",
    className: "text-title",
    sample: "Real-time F&B operations, from POS to kitchen.",
  },
  {
    token: "text-lead",
    clamp: "clamp(1.125rem, 0.4vw, 1.375rem)",
    className: "text-lead text-fg-muted",
    sample: "Two years shipping production interfaces across web, tablet and mobile.",
  },
  {
    token: "text-body",
    clamp: "1rem, line-height 1.65",
    className: "max-w-[65ch] text-body text-fg-muted",
    sample:
      "Body copy sits at a fixed size with generous line height. It is set in Geist, capped at 65 characters per line, and colored one step down from the foreground so headings keep their contrast advantage.",
  },
  {
    token: "text-small",
    clamp: "0.875rem",
    className: "text-small text-fg-muted",
    sample: "Small text for captions, meta rows and secondary actions.",
  },
  {
    token: "text-micro",
    clamp: "0.75rem, tracking 0.08em",
    className: "font-mono text-micro uppercase text-fg-muted",
    sample: "Micro labels, mono, rationed",
  },
] as const;

const COLORS = [
  { token: "ink", hex: "#0A0B0D", swatch: "bg-ink", note: "page base" },
  { token: "surface", hex: "#101114", swatch: "bg-surface", note: "section tint" },
  { token: "raised", hex: "#17181C", swatch: "bg-raised", note: "panels, inputs" },
  { token: "line", hex: "#26282D", swatch: "bg-line", note: "hairline borders" },
  { token: "fg", hex: "#E9EAEC", swatch: "bg-fg", note: "primary text, 15:1" },
  { token: "fg-muted", hex: "#9BA0A8", swatch: "bg-fg-muted", note: "secondary text, 7:1" },
  { token: "fg-faint", hex: "#62666E", swatch: "bg-fg-faint", note: "large decorative only" },
  { token: "ember", hex: "#F75A2C", swatch: "bg-ember", note: "the accent, 5.6:1" },
  { token: "ember-deep", hex: "#C93D16", swatch: "bg-ember-deep", note: "accent pressed state" },
] as const;

const SPACING = [
  { token: "gutter", clamp: "clamp(1.25rem, 4vw, 4rem)", width: "w-gutter", note: "page edges" },
  {
    token: "block",
    clamp: "clamp(2.5rem, 3vw, 5rem)",
    width: "w-block",
    note: "inside a section",
  },
  {
    token: "section",
    clamp: "clamp(6rem, 9vw, 12rem)",
    width: "w-section",
    note: "between sections",
  },
] as const;

function SectionHeading({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="mb-block">
      <h2 className="font-display text-display uppercase">{title}</h2>
      <p className="text-body text-fg-muted mt-4 max-w-[55ch]">{blurb}</p>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main className="max-w-page px-gutter mx-auto w-full">
      {/* intro */}
      <header className="pb-block flex min-h-[60dvh] flex-col justify-end gap-6">
        <h1 className="font-display text-display-xl uppercase">Styleguide</h1>
        <p className="text-lead text-fg-muted max-w-[55ch]">
          The token layer for this portfolio. Dark-locked, one accent, sharp surfaces, pill
          controls, springs over hard easing. Everything below is consumed through the Tailwind
          theme; nothing is a magic number.
        </p>
      </header>

      {/* type */}
      <section className="border-line py-section border-t">
        <SectionHeading
          title="Type"
          blurb="Archivo, width axis at 125, for display. Geist for body, Geist Mono for technical labels. Display sizes are fluid clamps; body sizes are fixed."
        />
        <ul className="flex flex-col">
          {TYPE_RAMP.map((t) => (
            <li key={t.token} className="border-line border-t py-8 first:border-t-0">
              <div className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
                <code className="text-small text-fg font-mono">{t.token}</code>
                <code className="text-small text-fg-muted font-mono">{t.clamp}</code>
              </div>
              <p className={t.className}>{t.sample}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* color */}
      <section className="border-line py-section border-t">
        <SectionHeading
          title="Color"
          blurb="A locked cool-gray ramp and one ember accent. The accent is rationed: selection, focus, one primary action per view, one moment of glow in the WebGL layer."
        />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLORS.map((c) => (
            <li key={c.token} className="border-line border">
              <div className={`h-28 ${c.swatch}`} />
              <div className="border-line flex items-baseline justify-between gap-4 border-t px-4 py-3">
                <code className="text-small text-fg font-mono">{c.token}</code>
                <code className="text-small text-fg-muted font-mono">{c.hex}</code>
              </div>
              <p className="text-small text-fg-muted px-4 pb-3">{c.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* spacing */}
      <section className="border-line py-section border-t">
        <SectionHeading
          title="Spacing"
          blurb="Three fluid layout tokens on top of the default 0.25rem scale. Content is capped at 1440px and always padded by the gutter."
        />
        <ul className="flex flex-col gap-6">
          {SPACING.map((s) => (
            <li key={s.token}>
              <div className="mb-2 flex items-baseline gap-6">
                <code className="text-small text-fg font-mono">spacing-{s.token}</code>
                <code className="text-small text-fg-muted font-mono">{s.clamp}</code>
                <span className="text-small text-fg-muted">{s.note}</span>
              </div>
              <div className={`bg-ember h-4 ${s.width}`} />
            </li>
          ))}
        </ul>
        <p className="text-body text-fg-muted mt-10 max-w-[55ch]">
          Container: <code className="text-small text-fg font-mono">max-w-page</code> caps content
          at 90rem. Sections divide with hairlines, not cards.
        </p>
      </section>

      {/* shape */}
      <section className="border-line py-section border-t">
        <SectionHeading
          title="Shape"
          blurb="One rule: surfaces and media are sharp, interactive controls are pill. Nothing in between."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border-line bg-surface flex h-40 items-end rounded-none border p-4">
            <code className="text-small text-fg font-mono">radius-none, surfaces</code>
          </div>
          <div className="rounded-media border-line bg-raised flex h-40 items-end border p-4">
            <code className="text-small text-fg font-mono">radius-media, 2px</code>
          </div>
          <div className="flex h-40 items-center justify-center">
            <span className="rounded-pill border-line text-small text-fg border px-6 py-3 font-mono">
              radius-pill, controls
            </span>
          </div>
        </div>
      </section>

      {/* buttons */}
      <section className="border-line py-section border-t">
        <SectionHeading
          title="Buttons"
          blurb="One primary action per view, in ember. Everything else is outlined or plain text. All controls compress on press and carry the global ember focus ring."
        />
        <div className="flex flex-wrap items-center gap-6">
          <button
            type="button"
            className="rounded-pill bg-ember text-small text-ink ease-spring-snap px-7 py-3 font-medium transition-transform duration-(--dur-gentle) hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            View work
          </button>
          <button
            type="button"
            className="rounded-pill border-line text-small text-fg hover:border-fg-muted hover:bg-raised border px-7 py-3 transition-colors duration-(--dur-fast) active:scale-[0.98]"
          >
            Get in touch
          </button>
          <a
            href="#top"
            className="group text-small text-fg hover:text-ember inline-flex items-center gap-1.5 transition-colors duration-(--dur-fast)"
          >
            Text link
            <ArrowUpRight
              size={16}
              weight="bold"
              className="ease-spring-snap transition-transform duration-(--dur-gentle) group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
          <button
            type="button"
            disabled
            className="rounded-pill border-line text-small text-fg-faint cursor-not-allowed border px-7 py-3"
          >
            Disabled
          </button>
        </div>
      </section>

      {/* motion */}
      <section className="border-line py-section border-t">
        <SectionHeading
          title="Motion"
          blurb="Springs over hard easing. Three damped-oscillator curves are baked into CSS as linear() easings and mirrored in lib/motion.ts for GSAP. Reduced motion collapses everything to instant."
        />
        <MotionDemos />
      </section>

      <footer className="border-line border-t py-10">
        <p className="text-small text-fg-muted">
          Tokens live in styles/globals.css and lib/motion.ts. This page is the taste review
          surface; it ships noindex.
        </p>
      </footer>
    </main>
  );
}
