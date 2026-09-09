import Link from "next/link";
import { ui } from "@/content";
import Mark from "@/components/Mark";

/** Sits absolutely over the full-viewport hero; the hero is bottom-anchored so nothing collides. */
export default function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="max-w-page px-gutter mx-auto flex h-16 items-center justify-between">
        {/*
         * Mark plus wordmark, not the mark alone. A bare Q is unattributed at
         * the top of a page nobody has read yet; the two together teach the mark
         * once, so it can stand on its own on the tab and the social card.
         *
         * The accessible name comes from the visible wordmark, so Mark stays
         * aria-hidden rather than repeating "Q" to a screen reader.
         */}
        <Link
          href="/"
          className="text-fg hover:text-ember inline-flex items-center gap-2.5 transition-colors duration-(--dur-fast)"
        >
          <Mark size={20} />
          <span className="font-display text-small font-bold tracking-wide uppercase">
            {ui.wordmark}
          </span>
        </Link>
        <nav aria-label={ui.navLabel}>
          <ul className="flex items-center gap-6 sm:gap-8">
            {ui.navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-small text-fg-muted hover:text-fg transition-colors duration-(--dur-fast)"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
