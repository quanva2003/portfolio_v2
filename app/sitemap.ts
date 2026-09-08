import type { MetadataRoute } from "next";
import { projects } from "@/content";
import { absoluteUrl } from "@/lib/site-url";

/**
 * Derived from `projects`, not hand-listed: the work grid, the static params in
 * app/(site)/work/[slug]/page.tsx and this file all read the same array, so a
 * fifth project appears in the sitemap without anyone remembering to add it.
 *
 * `/styleguide` is intentionally absent. It is an internal token reference, it
 * already carries `robots: { index: false }`, and app/robots.ts disallows it —
 * listing it here would ask a crawler to index the one page that says not to.
 *
 * `lastModified` is the build time. There is no per-entry content date to draw
 * from (the copy lives in TypeScript, not a CMS), and a fabricated per-page date
 * is worse than an honest coarse one: crawlers treat a date that moves without
 * the content moving as noise and start ignoring the signal.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: absoluteUrl(`/work/${project.slug}`),
      lastModified,
      changeFrequency: "yearly" as const,
      // The flagship is the one case study worth landing on cold.
      priority: project.flagship ? 0.8 : 0.6,
    })),
  ];
}
