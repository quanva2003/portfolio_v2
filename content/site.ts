import type { About, SiteMeta } from "./types";

export const site: SiteMeta = {
  name: "Van Anh Quan",
  title: "Front-End Developer",
  tagline: "Building fast, expressive interfaces across web, tablet and mobile.",
  location: "Ho Chi Minh City, Vietnam",
};

export const about: About = {
  headline: "Interfaces that feel as good as they work.",
  paragraphs: [
    "I'm a front-end developer based in Ho Chi Minh City with about two years of experience shipping production interfaces across web, tablet and mobile.",
    "From real-time F&B operations platforms to logistics dashboards and school communication apps, I care about the details that make software feel fast, coherent and alive.",
  ],
  education: {
    degree: "B.Sc. Software Engineering",
    school: "FPT University",
  },
};
