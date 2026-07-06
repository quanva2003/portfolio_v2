export interface SiteMeta {
  name: string;
  title: string;
  tagline: string;
  location: string;
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
  phone: string;
  github: string;
  linkedin: string;
}

export interface About {
  headline: string;
  paragraphs: string[];
  education: {
    degree: string;
    school: string;
  };
}
