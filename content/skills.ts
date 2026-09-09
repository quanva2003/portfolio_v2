import type { SkillGroup } from "./types";

/*
 * Mirrors the CV's skills table. The site used to list 11 items across four
 * groups while the CV listed twice that — the gap was not a curation decision,
 * it was drift, and it cost the reader the specifics that separate a front-end
 * developer from every other front-end developer (OpenAPI codegen, TanStack
 * Query, PR review as a named practice).
 *
 * Grouping follows the CV's own rows rather than a taxonomy invented here, so
 * the two stay comparable when a recruiter reads them side by side.
 */
export const skills: SkillGroup[] = [
  {
    label: "Languages & frameworks",
    items: ["JavaScript", "TypeScript", "ReactJS", "React Native (Expo)", "Next.js"],
  },
  {
    label: "State & data",
    items: ["Zustand", "Redux", "TanStack Query", "Socket.IO", "RESTful API", "OpenAPI codegen"],
  },
  {
    label: "UI",
    items: ["Tailwind CSS", "Ant Design", "MUI", "Shadcn UI", "NativeWind"],
  },
  {
    label: "Testing & tooling",
    items: ["Jest / Vitest", "Git", "GitHub PR review", "Figma", "Postman"],
  },
];
