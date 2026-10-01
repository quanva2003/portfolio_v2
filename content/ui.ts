import type { UiStrings } from "./types";

export const ui: UiStrings = {
  skipToContent: "Skip to content",
  navLabel: "Primary",
  wordmark: "VAQ",
  /*
   * Root-absolute hrefs, not bare hashes: the header renders on the project
   * detail routes too, where `#about` / `#work` don't exist. MotionProvider
   * smooth-scrolls these only when the pathname already matches, so from a
   * detail page they navigate home and land on the section instead.
   */
  navLinks: [
    { label: "About", href: "/#about" },
    { label: "Projects", href: "/#work" },
    { label: "Apps", href: "/#apps" },
    { label: "Contact", href: "/#contact" },
  ],
  sections: {
    work: "Projects",
    apps: "On the stores",
    experience: "Experience",
    skills: "Skills",
    contact: "Contact",
  },
  present: "Present",
  contactLinks: {
    github: "GitHub",
    linkedin: "LinkedIn",
    resume: "CV",
    /*
     * Appended to the CV link's accessible name, never shown. The size is
     * interpolated from disk at build time (lib/resume.ts), so the visible
     * label stays a single word while a screen reader still announces the
     * format and weight before anyone commits to the download.
     */
    resumeHint: "PDF",
  },
  /*
   * "On the stores" rather than "Apps", because the heading has to carry the
   * one thing that distinguishes this section from Projects directly above it:
   * these are not descriptions of work, they are installable products. A reader
   * who stops at the heading should already know that.
   */
  apps: {
    intro:
      "Three of the products above shipped to the public app stores. These are the listings — installable today, on the devices they were built for.",
    availability: "Available on",
    appStore: "App Store",
    googlePlay: "Google Play",
    caseStudy: "Case study",
  },
  project: {
    eyebrow: "Case study",
    /*
     * Shown on the Tamda card and case study only. The other three projects
     * carry real screenshots, so an unlabelled mockup beside them would read as
     * a fourth screenshot rather than as an illustration.
     */
    mockupNotice: "Illustrative mockup — client UI not shown",
    gallery: "More views",
    cta: "Read the case study",
    back: "All projects",
    problem: "The problem",
    role: "Role",
    stack: "Stack",
    shipped: "What I shipped",
    results: "Results",
  },
  preloader: {
    label: "Loading",
  },
  notFound: {
    code: "404",
    title: "Nothing here",
    body: "That page doesn't exist — it may have moved, or the link may be wrong.",
    back: "Back to the portfolio",
  },
};
