/**
 * One project image.
 *
 * `width`/`height` are the INTRINSIC pixel dimensions, not display size —
 * next/image needs them to reserve space, and a wrong pair produces layout
 * shift rather than an error. `scripts/prepare-project-media.mjs` prints the
 * real numbers when it writes each file; copy them from there.
 */
export interface ProjectImage {
  /** Root-relative, under `/media/`. */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface SiteMeta {
  name: string;
  title: string;
  tagline: string;
  location: string;
  portrait: ProjectImage;
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

/**
 * Whether a project's imagery is the real product or something drawn to stand
 * in for it. This drives a visible caption, and it is not decoration: three of
 * the four projects show genuine screenshots, so an unlabelled mockup alongside
 * them would read as a fourth screenshot. See `ui.project.mockupNotice`.
 */
export type ProjectMediaKind = "screenshot" | "mockup";

export interface Project {
  slug: string;
  name: string;
  summary: string;
  description: string;
  role: string;
  stack: string[];
  highlights: string[];
  flagship: boolean;
  /** Order on the Projects grid, ascending. */
  order: number;
  detail: ProjectDetail;
  /**
   * Images, most representative first — `media[0]` is what the work grid and the
   * case-study hero show, the rest fill the case study's gallery. An empty array
   * is valid and falls back to the typographic tile, so projects can gain
   * imagery one at a time.
   */
  media: ProjectImage[];
  mediaKind: ProjectMediaKind;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  start: string;
  end: string | null;
  summary: string;
  /**
   * What was actually done in the role, one line each. Contribution-shaped —
   * "owned features end to end", not "used React". The stack list below already
   * carries the technology, and a bullet that names a library says nothing a
   * reader could not infer from it.
   */
  highlights: string[];
  /** Technologies used IN THIS ROLE, which is narrower than the site-wide skills list. */
  stack: string[];
  /**
   * Slugs from projects.ts built during this role, so the two sections stop
   * being unrelated lists. Optional: the internship has no case study.
   */
  projects?: string[];
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
  resume: Resume;
}

/**
 * The downloadable CV. Deliberately has no `size` field — that is read from
 * disk at build time by lib/resume.ts, because a hand-typed size goes stale the
 * first time the PDF is replaced.
 */
export interface Resume {
  /** Root-relative, resolved against `public/`. */
  href: string;
  /** What the browser saves it as, so the path can change without the download name changing. */
  downloadAs: string;
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
    resume: string;
    /** Screen-reader-only qualifier on the CV link; the size is appended at build time. */
    resumeHint: string;
  };
  /** Chrome for the project case-study route. */
  project: {
    /** Eyebrow above the case-study title. */
    eyebrow: string;
    /** Caption stamped on imagery where `mediaKind` is "mockup". */
    mockupNotice: string;
    /** Heading for the case study's additional images. */
    gallery: string;
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
    start: string;
    end: string;
    /** As printed on the CV, scale included — "7.1/10.0" reads differently from "7.1". */
    gpa: string;
  };
}
