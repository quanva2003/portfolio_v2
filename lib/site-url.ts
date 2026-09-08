/**
 * The one canonical origin for this site.
 *
 * Everything that has to emit an ABSOLUTE url reads from here: `metadataBase`
 * in app/layout.tsx, the Open Graph image, `app/sitemap.ts` and
 * `app/robots.ts`. Relative urls are fine inside the app; they are not fine in
 * a social card or a sitemap, which are read by machines that have no base to
 * resolve against.
 *
 * Resolution order, most specific first:
 *
 *  1. `NEXT_PUBLIC_SITE_URL` — set this in Vercel the moment a custom domain is
 *     attached. It is the only value that survives the project being renamed.
 *  2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel injects the project's PRODUCTION
 *     domain here at build time, on every deployment including previews. That
 *     last part is the reason it is used instead of `VERCEL_URL`: `VERCEL_URL`
 *     is the url of the CURRENT deployment, so a preview build would bake its
 *     own ephemeral hostname into canonical tags and sitemap entries and invite
 *     Google to index a throwaway deployment.
 *  3. The literal below — the domain already printed on the CV, so a build
 *     running anywhere else (local `next build`, CI, a fork) still produces
 *     correct absolute urls instead of `localhost`.
 *
 * Note that (2) has no `NEXT_PUBLIC_` prefix, so it is readable only on the
 * server. That is sufficient and deliberate: every consumer above is a Server
 * Component or a route handler. Do not import this into a client component
 * expecting (2) to be populated.
 */
const FALLBACK_ORIGIN = "https://quanva-portfolio.vercel.app";

function resolveOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return withProtocol(explicit);

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProduction) return withProtocol(vercelProduction);

  return FALLBACK_ORIGIN;
}

/** Vercel supplies bare hostnames; a hand-set env var may or may not. */
function withProtocol(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const SITE_URL = resolveOrigin();

/** Absolute url for a root-relative path. `absoluteUrl("/")` -> the origin. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
