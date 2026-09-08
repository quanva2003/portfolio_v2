import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

/**
 * Open to everything except the internal token page.
 *
 * `/styleguide` is disallowed here AND carries `robots: { index: false }` in its
 * own metadata, which is not redundant — the two do different jobs. A disallow
 * stops the page being CRAWLED; it does not stop it being INDEXED, because a
 * crawler that is forbidden to fetch the page can still list the url from an
 * inbound link and, not having read it, will never see the noindex. The meta tag
 * is what actually keeps it out of results, and the disallow is what keeps the
 * crawl budget on the pages that matter.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/styleguide",
    },
    /*
     * No `host` directive. Next renders it from a full url ("Host:
     * https://example.com/"), but the directive is specified as a bare
     * hostname, it is a Yandex extension that Google ignores outright, and a
     * malformed line in a file read by crawlers buys nothing. The canonical
     * tags already state the preferred origin.
     */
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
