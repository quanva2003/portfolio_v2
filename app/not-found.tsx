import type { Metadata } from "next";
import Link from "next/link";
import { ui } from "@/content";

/*
 * The route already answers 404, which is what actually keeps this out of an
 * index. The title is here so a mistyped url does not sit in the visitor's tab
 * strip and history claiming to be the portfolio home page.
 */
export const metadata: Metadata = {
  title: ui.notFound.title,
  robots: { index: false, follow: false },
};

/**
 * Catches both unmatched URLs and `notFound()` from the project case-study
 * route. Deliberately outside the (site) route group: a 404 gets its own
 * self-contained page with a single way back, not the full site chrome.
 */
export default function NotFound() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="max-w-page px-gutter mx-auto flex min-h-dvh w-full flex-col justify-center gap-6"
    >
      <p className="text-micro text-fg-muted font-mono uppercase">{ui.notFound.code}</p>
      <h1 className="font-display text-display uppercase">{ui.notFound.title}</h1>
      <p className="text-lead text-fg-muted max-w-[45ch]">{ui.notFound.body}</p>
      <Link
        href="/"
        className="rounded-pill border-line text-small text-fg hover:border-fg-muted hover:bg-raised mt-4 inline-block w-fit border px-6 py-2.5 transition-colors duration-(--dur-fast) active:scale-[0.98]"
      >
        {ui.notFound.back}
      </Link>
    </main>
  );
}
