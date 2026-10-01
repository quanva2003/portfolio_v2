import { test, expect } from "@playwright/test";
import { apps } from "../content/apps";

/*
 * Guards the "On the stores" section's outbound links.
 *
 * WHY THIS SUITE EXISTS
 *
 * The CV this section was transcribed from carries the App Store URL
 * `apps.apple.com/us/app/panda-pos-manager`. It 404s. An App Store address is
 * the NUMERIC TRACK ID — the human-readable slug is decoration Apple ignores —
 * so a URL built from an app's name looks completely correct, reads correctly
 * in review, and resolves to nothing. That link had been printed on a CV and
 * sent to employers.
 *
 * This is the worst failure mode a portfolio has: a reader who clicks "App
 * Store" is the most engaged reader the page will ever get, and a 404 is the
 * answer they are handed. It is also silent — nothing on the site breaks, no
 * build fails, no console errors.
 *
 * So the shape assertions below run offline on every CI run, and the live
 * reachability check runs against the real stores. Together they catch both the
 * guessed URL and the delisted app.
 */

/** Apple's canonical shape: a track id segment is mandatory. */
const APP_STORE_URL = /^https:\/\/apps\.apple\.com\/[a-z]{2}\/app\/[a-z0-9-]+\/id\d+$/;

/** Google's canonical shape: the package name IS the address. */
const PLAY_URL = /^https:\/\/play\.google\.com\/store\/apps\/details\?id=[a-z][\w.]+$/;

test.describe("store links", () => {
  test("(1) every store URL has the shape its store actually requires", () => {
    expect(apps.length).toBeGreaterThan(0);

    for (const app of apps) {
      expect(app.appStore || app.googlePlay, `${app.name} lists no store at all`).toBeTruthy();

      if (app.appStore) {
        /*
         * The assertion that would have caught the CV's link. `/id\d+$/` is the
         * whole point — do not relax this regex to accommodate a URL someone
         * pasted without an id. Look the app up instead:
         * itunes.apple.com/search?term=<name>&entity=software
         */
        expect(app.appStore.url, `${app.name} App Store URL is missing its /id<number>`).toMatch(
          APP_STORE_URL,
        );
        expect(app.appStore.url).toContain(`/id${app.appStore.id}`);
      }

      if (app.googlePlay) {
        expect(app.googlePlay.url, `${app.name} Google Play URL`).toMatch(PLAY_URL);
        // The package id is the address, so the two cannot be allowed to drift.
        expect(app.googlePlay.url).toBe(
          `https://play.google.com/store/apps/details?id=${app.googlePlay.id}`,
        );
      }
    }
  });

  test("(2) the section renders one real link per listed store", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#apps");
    await expect(section).toBeAttached();

    for (const app of apps) {
      for (const listing of [app.appStore, app.googlePlay]) {
        if (!listing) continue;
        const link = section.locator(`a[href="${listing.url}"]`);
        await expect(link, `${app.name}: ${listing.url}`).toHaveCount(1);
        /* Outbound to a third party: new tab, and no referrer handed over. */
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noopener/);
        await expect(link).toHaveAttribute("rel", /noreferrer/);
      }
    }
  });

  test("(3) every store URL is live", async ({ request }) => {
    for (const app of apps) {
      for (const listing of [app.appStore, app.googlePlay]) {
        if (!listing) continue;
        const response = await request.get(listing.url, {
          /* The stores answer a bare automated GET with a challenge; a normal
             UA gets the real page, which is what a reader's click gets too. */
          headers: { "user-agent": "Mozilla/5.0" },
          timeout: 30_000,
        });
        expect(response.status(), `${app.name} -> ${listing.url}`).toBe(200);
      }
    }
  });
});
