import type { Project } from "./types";

export const projects: Project[] = [
  {
    slug: "panda-erp",
    name: "Panda ERP",
    summary: "F&B operations platform: POS, KDS, inventory and revenue reporting in real time.",
    description:
      "An end-to-end operations platform for food & beverage businesses covering point of sale, kitchen display system, inventory and revenue reporting. Real-time updates over Socket.IO keep every station in sync across multiple branches, on web, tablet and mobile.",
    role: "Front-End Developer",
    stack: ["React", "TypeScript", "Socket.IO", "Zustand", "Ant Design"],
    highlights: [
      "Real-time POS and kitchen display system synced over Socket.IO",
      "Multi-branch inventory and revenue reporting",
      "Shipped across web, tablet and mobile form factors",
    ],
    flagship: true,
    order: 1,
  },
  {
    slug: "tamda-shipment",
    name: "Tamda Shipment",
    summary: "Logistics platform: shipment scheduling, trip management and live status.",
    description:
      "A logistics platform handling shipment scheduling, trip management and live delivery status. Built with React, TypeScript, Ant Design and Zustand, with Socket.IO powering live updates.",
    role: "Front-End Developer",
    stack: ["React", "TypeScript", "Ant Design", "Zustand", "Socket.IO"],
    highlights: [
      "Shipment scheduling and trip management flows",
      "Live shipment status over Socket.IO",
    ],
    flagship: false,
    order: 2,
  },
  {
    slug: "skyline",
    name: "Skyline",
    summary: "School communication mobile app connecting teachers and parents.",
    description:
      "A mobile app for school communication, built with React Native, NativeWind and Zustand.",
    role: "Front-End Developer",
    stack: ["React Native", "NativeWind", "Zustand"],
    highlights: ["Cross-platform mobile app built with React Native"],
    flagship: false,
    order: 3,
  },
  {
    slug: "comzone",
    name: "Comzone",
    summary: "Comic marketplace with real-time auctions, built as a university capstone.",
    description:
      "A comic marketplace featuring real-time auctions, VNPay and ZaloPay payment integration and GHN shipping API, with Socket.IO driving the live auction experience.",
    role: "Front-End Developer",
    stack: ["React", "TypeScript", "Socket.IO", "VNPay", "ZaloPay", "GHN API"],
    highlights: [
      "Real-time auction flow over Socket.IO",
      "VNPay / ZaloPay payments and GHN shipping integration",
    ],
    flagship: false,
    order: 4,
  },
];

export const flagshipProject: Project = projects.find((p) => p.flagship) ?? projects[0]!;
