import { about, contact, experience, site, skills } from "@/content";
import { SITE_URL, absoluteUrl } from "@/lib/site-url";

/**
 * schema.org `Person` for the home route.
 *
 * This exists for one narrow, checkable reason: `sameAs` is how a search engine
 * is told that this site, the GitHub account and the LinkedIn profile are the
 * same human. Without it they are three unrelated documents that happen to
 * share a name — and "Van Anh Quan" is not a name that disambiguates itself.
 *
 * Deliberately small. Every field below is already stated in visible copy or in
 * the CV; nothing is asserted here that a reader cannot verify on the page,
 * which is both the honest position and the one that survives a manual review
 * for structured-data spam.
 *
 * Rendered as a plain <script> rather than through next/script: JSON-LD must be
 * in the initial HTML for crawlers that do not execute JavaScript, and
 * next/script's default strategy defers it.
 */
export default function StructuredData() {
  const currentEmployer = experience.find((entry) => entry.end === null);

  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: SITE_URL,
    image: absoluteUrl("/og.png"),
    jobTitle: site.title,
    description: site.tagline,
    email: `mailto:${contact.email}`,
    telephone: contact.phoneHref,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ho Chi Minh City",
      addressCountry: "VN",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: about.education.school,
    },
    /*
     * `knowsAbout` and `worksFor` are derived, never hand-listed — a second
     * hand-maintained copy of the skills and employers is exactly how the CV
     * and this site drifted apart in the first place. Both read from the same
     * modules the visible sections render, so they cannot disagree with the page.
     *
     * `worksFor` names only the CURRENT role: the schema property is present
     * tense, and there is no current one while the most recent entry has an end
     * date, so this correctly emits nothing today rather than claiming a job
     * that ended in Aug 2026.
     */
    knowsAbout: skills.flatMap((group) => group.items),
    ...(currentEmployer
      ? { worksFor: { "@type": "Organization", name: currentEmployer.company } }
      : {}),
    sameAs: [contact.github, contact.linkedin],
  };

  return (
    <script
      type="application/ld+json"
      // The payload is built from local constants, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
