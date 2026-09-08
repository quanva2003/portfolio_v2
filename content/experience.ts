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
 */
export const experience: ExperienceEntry[] = [
  {
    company: "Dan Solutions",
    role: "Front-End Developer",
    start: "Jun 2024",
    end: "Aug 2026",
    summary:
      "Shipped production features across web, tablet and mobile: real-time ERP, logistics dispatch and multi-tenant platforms.",
  },
  {
    company: "General Era Digital Solution JSC",
    role: "Front-End Developer Intern",
    start: "Aug 2023",
    end: "Feb 2024",
    summary: "First industry experience building and maintaining React front ends.",
  },
];
