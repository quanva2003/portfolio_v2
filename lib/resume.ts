import { statSync } from "node:fs";
import path from "node:path";
import { contact } from "@/content";

/**
 * Build-time metadata for the downloadable CV.
 *
 * The size is READ FROM DISK rather than typed into content/, because it is the
 * one fact about this file that changes every time the PDF is replaced and that
 * nobody will remember to update. A hand-written "252 KB" is wrong the first
 * time the CV is revised, and a wrong size on a download link is worse than no
 * size at all — it is the number a reader uses to decide whether to tap it on
 * mobile data.
 *
 * Server-only: `node:fs` cannot be bundled into a client component. The one
 * consumer, components/ContactFooter.tsx, is a Server Component, and every page
 * that renders it is statically prerendered, so this stat runs at build time
 * and never per request.
 *
 * It throws if the file is missing, and that is deliberate. The alternative —
 * silently rendering a link to a 404 — is exactly the failure a portfolio
 * cannot afford, because the CV link is the one thing a recruiter is most
 * likely to click and the least likely to report as broken.
 */

/** Formatted for a human reading a link label, not for precision. */
function formatBytes(bytes: number): string {
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export interface ResumeMeta {
  /** Root-relative href, straight from content/. */
  href: string;
  /** Filename the browser saves as, independent of the path on disk. */
  downloadAs: string;
  /** e.g. "252 KB". */
  size: string;
}

export function resumeMeta(): ResumeMeta {
  const { href, downloadAs } = contact.resume;
  /*
   * process.cwd() is the project root during `next build` and `next start`.
   * `href` is root-relative and always starts with "/", so it is joined onto
   * public/ rather than used as an absolute filesystem path.
   */
  const filePath = path.join(process.cwd(), "public", href);
  const { size } = statSync(filePath);

  return { href, downloadAs, size: formatBytes(size) };
}
