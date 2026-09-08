import { test, expect, type Page } from "@playwright/test";
import { projects } from "../content/projects";
import { contact } from "../content/contact";

/*
 * Phase 7 gates: metadata, social card, sitemap, robots.
 *
 * Every assertion here guards something that is INVISIBLE in the running app.
 * A broken og:image, a doubled title or a sitemap pointing at localhost costs
 * nothing at runtime, breaks no page, and shows up only when a link is pasted
 * somewhere public or a crawler has already made its mind up. Manual checking
 * catches these exactly once, on the day someone remembers to look.
 *
 * ABSOLUTE-URL RULE: the host in these tags comes from lib/site-url.ts, not
 * from Playwright's baseURL — this suite runs on localhost while the metadata
 * legitimately names the production origin. So the assertions below check the
 * SHAPE (https, absolute, correct path) rather than a literal host, which keeps
 * them true after a custom domain is attached and false the moment Next starts
 * emitting relative urls because `metadataBase` was dropped.
 */

/** The content of a <meta> tag, by property= or name=. */
async function meta(page: Page, key: string): Promise<string | null> {
  const locator = page.locator(`meta[property="${key}"], meta[name="${key}"]`).first();
  if ((await locator.count()) === 0) return null;
  return locator.getAttribute("content");
}

function expectAbsoluteHttps(value: string | null, endsWith: string) {
  expect(value, `expected an absolute url ending in "${endsWith}"`).toBeTruthy();
  expect(value!).toMatch(/^https:\/\//);
  expect(new URL(value!).pathname.replace(/\/$/, "")).toBe(endsWith.replace(/\/$/, ""));
}

test.describe("document metadata", () => {
  test("(1) home page carries a complete, absolute social card", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Van Anh Quan · Front-End Developer");
    expect(await meta(page, "description")).toBeTruthy();
    expect(await meta(page, "robots")).toContain("index");

    // og:image absolute is THE thing that breaks a card. Twitter and LinkedIn
    // both reject a relative one outright rather than resolving it.
    expectAbsoluteHttps(await meta(page, "og:image"), "/og.png");
    expect(await meta(page, "og:image:width")).toBe("1200");
    expect(await meta(page, "og:image:height")).toBe("630");
    expect(await meta(page, "og:type")).toBe("website");
    expect(await meta(page, "og:title")).toBeTruthy();
    expectAbsoluteHttps(await meta(page, "og:url"), "/");
    expect(await meta(page, "twitter:card")).toBe("summary_large_image");

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expectAbsoluteHttps(canonical, "/");
  });

  test("(2) case study titles are composed exactly once", async ({ page }) => {
    const project = projects[0]!;
    await page.goto(`/work/${project.slug}`);

    /*
     * The specific regression: the root layout sets a `title.template` of
     * "%s · Van Anh Quan" AND the route once set its own composed title, giving
     * "Panda ERP · Van Anh Quan · Van Anh Quan". Counting the separator is the
     * assertion, because the correct and broken strings differ only by a repeat.
     */
    const title = await page.title();
    expect(title).toBe(`${project.name} · Van Anh Quan`);
    expect(title.split("·")).toHaveLength(2);
  });

  test("(3) every case study is self-describing and canonical to itself", async ({ page }) => {
    for (const project of projects) {
      await page.goto(`/work/${project.slug}`);
      const path = `/work/${project.slug}`;

      expectAbsoluteHttps(await page.locator('link[rel="canonical"]').getAttribute("href"), path);
      expectAbsoluteHttps(await meta(page, "og:url"), path);
      // Child metadata REPLACES the parent's openGraph object rather than
      // merging into it, so an image here proves the route re-declared one.
      expectAbsoluteHttps(await meta(page, "og:image"), "/og.png");
      expect(await meta(page, "og:description")).toBe(project.summary);
      expect(await meta(page, "og:type")).toBe("article");
    }
  });

  test("(4) the styleguide is noindex", async ({ page }) => {
    await page.goto("/styleguide");
    expect(await meta(page, "robots")).toContain("noindex");
  });

  test("(5) structured data identifies the person and links both profiles", async ({ page }) => {
    await page.goto("/");
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    expect(raw).toBeTruthy();

    const data = JSON.parse(raw!);
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe("Van Anh Quan");
    // sameAs is the entire point of the block: it is what ties this site to the
    // GitHub and LinkedIn accounts as one identity.
    expect(data.sameAs).toContain("https://github.com/quanva2003");
    expect(data.sameAs).toContain("https://www.linkedin.com/in/wuanvan5076");
    expect(data.url).toMatch(/^https:\/\//);
  });
});

test.describe("crawler files", () => {
  test("(6) robots.txt opens the site, closes the styleguide, points at the sitemap", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();

    expect(body).toMatch(/User-Agent: \*/i);
    expect(body).toMatch(/^Allow: \/$/m);
    expect(body).toMatch(/^Disallow: \/styleguide$/m);
    expect(body).toMatch(/^Sitemap: https:\/\/\S+\/sitemap\.xml$/m);
  });

  test("(7) sitemap lists the home page and every project, absolutely", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();

    const locations = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
    // Derived from content/, so adding a project without it reaching the
    // sitemap is a failure rather than something nobody notices.
    expect(locations).toHaveLength(projects.length + 1);
    for (const location of locations) expect(location).toMatch(/^https:\/\//);

    const paths = locations.map((l) => new URL(l).pathname);
    expect(paths).toContain("/");
    for (const project of projects) expect(paths).toContain(`/work/${project.slug}`);
    // The one page robots.txt disallows must not be advertised here.
    expect(paths).not.toContain("/styleguide");
  });
});

test.describe("brand assets", () => {
  test("(8) the OG image is served and is exactly 1200x630", async ({ request }) => {
    const response = await request.get("/og.png");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");

    /*
     * Dimensions read from the PNG's own IHDR chunk, which begins at byte 8:
     * length(4) + "IHDR"(4) then width(4) and height(4), big-endian. Asserting
     * the real pixels rather than the og:image:width tag is the point — the tag
     * is a claim, and a card renders from the file.
     */
    const buffer = await response.body();
    expect(buffer.subarray(12, 16).toString("latin1")).toBe("IHDR");
    expect(buffer.readUInt32BE(16)).toBe(1200);
    expect(buffer.readUInt32BE(20)).toBe(630);
  });

  test("(9) every declared icon actually resolves", async ({ page, request }) => {
    await page.goto("/");
    const hrefs = await page
      .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
      .evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).getAttribute("href")!));

    // icon.svg, favicon.ico and apple-icon.png — a declared-but-404 icon is
    // invisible in the app and obvious in a browser tab.
    expect(hrefs.length).toBeGreaterThanOrEqual(3);
    for (const href of hrefs) {
      expect((await request.get(href)).status(), `${href} should resolve`).toBe(200);
    }
  });
});

test.describe("contact links", () => {
  test("(10) every outbound contact link matches the CV", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");

    await expect(footer.locator(`a[href="mailto:${contact.email}"]`)).toHaveCount(1);
    await expect(footer.locator(`a[href="${contact.github}"]`)).toHaveCount(1);
    await expect(footer.locator(`a[href="${contact.linkedin}"]`)).toHaveCount(1);

    /*
     * E.164, not the national form. "tel:0941697009" only dials from inside
     * Vietnam — it fails silently everywhere else, which on an English-language
     * site listing a Ho Chi Minh City address is the majority of readers.
     */
    const tel = await footer.locator('a[href^="tel:"]').getAttribute("href");
    expect(tel).toBe(`tel:${contact.phoneHref}`);
    expect(tel).toMatch(/^tel:\+[1-9]\d{6,14}$/);
  });
});
