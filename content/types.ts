export interface SiteMeta {
  name: string;
  title: string;
  tagline: string;
  location: string;
}

/**
 * Case-study copy for a project's detail route. Deliberately qualitative:
 * every line here traces back to the CV, so no invented metrics creep in.
 * Swap `results` for sourced numbers when they're available.
 */
export interface ProjectDetail {
  /** The problem the product exists to solve. */
  problem: string;
  /** What I personally built, one line per contribution. */
  shipped: string[];
  /** What the work produced, one line each. */
  results: string[];
}

export interface Project {
  slug: string;
  name: string;
  summary: string;
  description: string;
  role: string;
  stack: string[];
  highlights: string[];
  flagship: boolean;
  /** Order on the Selected Work grid, ascending. */
  order: number;
  detail: ProjectDetail;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  start: string;
  end: string | null;
  summary: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Contact {
  email: string;
  /** Display form, spaced for reading. */
  phone: string;
  /** E.164, for the `tel:` href — dialable from outside Vietnam. */
  phoneHref: string;
  github: string;
  linkedin: string;
}

export interface NavLink {
  label: string;
  href: string;
}

/** Chrome / microcopy strings so no copy is ever inlined in JSX. */
export interface UiStrings {
  skipToContent: string;
  navLabel: string;
  wordmark: string;
  navLinks: NavLink[];
  sections: {
    work: string;
    experience: string;
    skills: string;
    contact: string;
  };
  /** Label for an open-ended date range on the experience timeline. */
  present: string;
  contactLinks: {
    github: string;
    linkedin: string;
  };
  /** Chrome for the project case-study route. */
  project: {
    /** Eyebrow above the case-study title. */
    eyebrow: string;
    /** Affordance on a work-grid card. */
    cta: string;
    /** Back link to the work grid. */
    back: string;
    problem: string;
    role: string;
    stack: string;
    shipped: string;
    results: string;
  };
  preloader: {
    /** Announced by the progressbar while real assets load. */
    label: string;
  };
  notFound: {
    code: string;
    title: string;
    body: string;
    back: string;
  };
}

export interface About {
  headline: string;
  paragraphs: string[];
  education: {
    degree: string;
    school: string;
  };
}
