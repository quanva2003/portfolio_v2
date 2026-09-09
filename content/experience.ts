import type { ExperienceEntry } from "./types";

/*
 * Dates carry MONTH precision, matching the CV exactly.
 *
 * They used to be bare years, which was not merely coarse but actively wrong in
 * two places: Dan Solutions ran to Aug 2026 while `end: null` rendered it as
 * "Present", and the General Era internship ran into Feb 2024 while "2023 -
 * 2023" compressed it to a single year. A portfolio claiming a current role that
 * ended is the one content error a reader is guaranteed to check.
 *
 * `end: null` still means "Present" for whoever fills the next row in.
 *
 * EVERY LINE BELOW TRACES TO THE CV (public/assets/…​.pdf). This section was one
 * sentence per role until 2026-09-08, while the CV already carried five bullets
 * for Dan Solutions — nothing here was written for the site, it was transcribed
 * from a document that had been fact-checked already. Hold any future edit to
 * the same bar: if the CV does not say it, it does not go here.
 */
export const experience: ExperienceEntry[] = [
  {
    company: "Dan Solutions",
    role: "Front-End Developer",
    start: "Jun 2024",
    end: "Aug 2026",
    summary:
      "Shipped production features across web, tablet and mobile: real-time ERP, logistics dispatch and multi-tenant platforms.",
    highlights: [
      "Shipped features across web, tablet and mobile for three live products, in teams of three to seven engineers, scoping requirements directly with the PM and the client.",
      "Owned features end to end — UI architecture, typed API integration, real-time state, and the follow-up defects — rather than picking up isolated tickets.",
      "Worked repeatedly on the hard edge of real-time interfaces: keeping local state correct when socket payloads arrive incomplete, out of order, or while the user is mid-edit.",
      "Introduced and standardised shared foundations — a state layer, a generated API client, reusable components and a documented component standard — and reviewed teammates' pull requests.",
      "Onboarded new front-end developers and coordinated weekly delivery across concurrent projects.",
    ],
    stack: ["React", "React Native", "TypeScript", "Zustand", "Socket.IO", "Ant Design", "Vite"],
    projects: ["tamda-shipment", "panda-erp", "skyline"],
  },
  {
    company: "General Era Digital Solution JSC",
    role: "Front-End Developer Intern",
    start: "Aug 2023",
    end: "Feb 2024",
    /*
     * Was "First industry experience building and maintaining React front
     * ends." That describes how the role FELT, not what shipped, which is the
     * one thing a reader wants from an internship entry. The CV says what was
     * actually built.
     */
    summary:
      "Built a movie web application from scratch in ReactJS against an existing API, delivered within the internship timeline.",
    highlights: [
      "Independently built a movie web application from scratch in ReactJS — routing, API integration, form validation and UI components — delivered on schedule within the internship timeline.",
    ],
    stack: ["ReactJS", "JavaScript"],
  },
];
