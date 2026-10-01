import type { AppListing } from "./types";

/**
 * The apps that shipped to a public store.
 *
 * EVERY URL AND TITLE BELOW WAS VERIFIED AGAINST THE LIVE STORES on 2026-10-01,
 * not transcribed. The CV is the source for which apps exist; it is NOT a
 * reliable source for their store addresses, and this section is the one place
 * on the site where a wrong address costs a real click.
 *
 * What the verification turned up:
 *
 *  - The App Store URL printed on the CV — `apps.apple.com/us/app/panda-pos-manager`
 *    — 404s. An App Store URL needs the numeric track id; the slug alone
 *    resolves to nothing. The working address carries `/id6762171644`.
 *  - The store titles differ from the CV's. The store says "Panda POS &
 *    Manager" (ampersand), "SKY-LINE School E-connect" (that exact casing), and
 *    "vncaps" in lower case.
 *  - Identity is confirmed rather than assumed: the iTunes records for Skyline
 *    and VNCaps carry bundle ids `vn.edu.skylineschool.econnect` and
 *    `com.edu.vncaps`, which are character-for-character the Google Play
 *    packages on the CV. Panda's record names DANSOLUTIONS TECHNOLOGY COMPANY
 *    LIMITED as the seller.
 *
 * All three are live on the US storefront (checked against `/lookup` per
 * country), so all three link to `/us/` rather than a mix of regions.
 *
 * NEVER construct an App Store URL from an app's name. There is no derivation —
 * the numeric id is the address, and the CV's broken link is what guessing
 * produces. Look the app up (`itunes.apple.com/search?term=…&entity=software`)
 * and paste what comes back. Google Play is the opposite case:
 * `…/details?id=<package>` IS canonical, so those are built from the package id
 * below rather than typed twice.
 *
 * WHY THIS IS A SEPARATE MODULE AND NOT A FIELD ON `Project`
 *
 * Only three of the five projects are installable apps, and one of the three —
 * VNCaps — had no project entry at all until this section was built. Hanging
 * store links off `Project` would have made the relationship look total when it
 * is partial. The two lists overlap through `projectSlug` and are free to
 * disagree about membership, which is the honest shape.
 */
const playUrl = (bundleId: string) => `https://play.google.com/store/apps/details?id=${bundleId}`;

export const apps: AppListing[] = [
  {
    slug: "panda-pos-manager",
    name: "Panda POS & Manager",
    blurb:
      "The point-of-sale and kitchen-display client for a multi-branch F&B chain — table-side order entry, checkout and discounts, with order status pushed live to the kitchen.",
    audience: "Restaurant floor and kitchen staff",
    platforms: ["iOS"],
    appStore: {
      url: "https://apps.apple.com/us/app/panda-pos-manager/id6762171644",
      id: "6762171644",
    },
    projectSlug: "panda-erp",
    stack: ["React Native", "Expo", "TypeScript", "Gluestack UI", "TanStack Query", "Socket.IO"],
  },
  {
    slug: "skyline-econnect",
    name: "SKY-LINE School E-connect",
    blurb:
      "The parent app for the Sky-Line school group, connecting homeroom teachers and families around student records, classroom activity and academic performance.",
    audience: "Parents and homeroom teachers",
    platforms: ["iOS", "Android"],
    appStore: {
      url: "https://apps.apple.com/us/app/sky-line-school-e-connect/id6749571097",
      id: "6749571097",
    },
    googlePlay: {
      url: playUrl("vn.edu.skylineschool.econnect"),
      id: "vn.edu.skylineschool.econnect",
    },
    projectSlug: "skyline",
    stack: ["React Native", "Expo", "TypeScript", "NativeWind", "Zustand", "UI Kitten"],
  },
  {
    /*
     * Listed on the store as "vncaps", all lower case. Shown here as "VNCaps",
     * which is how the CV and the project entry write it: an all-lower-case
     * word set in this section's title face reads as a typo rather than as a
     * brand, and the two spellings are the same product. The store's own
     * casing is one click away.
     */
    slug: "vncaps",
    name: "VNCaps",
    blurb:
      "A parent's view of their child's school day — timetables, health-status updates and the classroom photo feed from the homeroom teacher, kept deliberately simple for non-technical users.",
    audience: "Parents of young students",
    platforms: ["iOS", "Android"],
    appStore: {
      url: "https://apps.apple.com/us/app/vncaps/id1613104994",
      id: "1613104994",
    },
    googlePlay: { url: playUrl("com.edu.vncaps"), id: "com.edu.vncaps" },
    projectSlug: "vncaps",
    stack: ["React Native", "Expo", "TypeScript", "NativeWind", "Zustand", "UI Kitten"],
  },
];
