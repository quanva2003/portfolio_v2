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
    { label: "Contact", href: "/#contact" },
  ],
  sections: {
    work: "Projects",
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
