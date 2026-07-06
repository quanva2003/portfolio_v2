import Link from "next/link";
import { ui } from "@/content";

/** Sits absolutely over the full-viewport hero; the hero is bottom-anchored so nothing collides. */
export default function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="max-w-page px-gutter mx-auto flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-display text-small text-fg font-bold tracking-wide uppercase"
        >
          {ui.wordmark}
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
