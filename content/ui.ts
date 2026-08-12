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
    { label: "Work", href: "/#work" },
    { label: "Contact", href: "/#contact" },
  ],
  sections: {
    work: "Selected Work",
    experience: "Experience",
    skills: "Skills",
    contact: "Contact",
  },
  present: "Present",
  contactLinks: {
    github: "GitHub",
    linkedin: "LinkedIn",
  },
  project: {
    eyebrow: "Case study",
    cta: "Read the case study",
    back: "All work",
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
