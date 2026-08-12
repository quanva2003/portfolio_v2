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
    detail: {
      problem:
        "A food & beverage business runs on several screens at once — a cashier taking the order, a kitchen cooking it, a manager watching stock and revenue — and each one traditionally holds its own copy of the truth. When they drift apart you get orders cooked twice, stock counts nobody trusts and a day's revenue that only reconciles the morning after. Panda ERP had to make one shared state visible on every screen at the same moment, across several branches and three different form factors.",
      shipped: [
        "The point-of-sale interface: order entry, modifiers, splitting and settlement, built for speed of input on tablet before anything else.",
        "The kitchen display system, driven by Socket.IO events so a ticket appears the instant it is rung up and clears for everyone when it is done.",
        "Inventory screens over multi-branch data, with the branch as a first-class dimension rather than a filter bolted on afterwards.",
        "Revenue reporting views, aggregating across branches and date ranges.",
        "A shared front-end foundation — Zustand stores, Ant Design component conventions, TypeScript models mirroring the API — reused by web, tablet and mobile.",
      ],
      results: [
        "Every station reads the same live state: an order rung up on the POS is on the kitchen display without a refresh.",
        "One front-end codebase and one set of domain models serve three form factors, so a change lands everywhere at once.",
        "Managers can see stock and revenue across branches in the same tool the staff work in, instead of a separate end-of-day report.",
      ],
    },
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
    detail: {
      problem:
        "Logistics coordination fails in the gap between plan and reality. A shipment is scheduled, a trip is assigned, and then the truck is out in the world where the plan quietly stops matching what is happening. The people booking work and the people driving it needed to look at the same board and see the current state, not the state as of the last phone call.",
      shipped: [
        "Shipment scheduling flows: creating shipments, assigning them to trips and reconciling changes after dispatch.",
        "Trip management screens covering the lifecycle of a trip from assignment through completion.",
        "Live status surfaces wired to Socket.IO, so a status change propagates to every open board rather than waiting for a reload.",
        "Dense Ant Design table and form layouts tuned for operators who work in the tool all day.",
      ],
      results: [
        "Scheduling and execution share one view, so a coordinator sees a shipment's real state instead of asking for it.",
        "Status updates arrive live, removing the reload-and-hope pattern from the operators' workflow.",
      ],
    },
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
    detail: {
      problem:
        "School-to-home communication is scattered across paper notes, group chats and phone calls, which means the message that matters most is the one most easily missed. Skyline needed to put school announcements and a child's day in one place a parent already looks at — their phone — without asking a school to run two apps for two platforms.",
      shipped: [
        "The React Native app shell and navigation, targeting iOS and Android from a single codebase.",
        "Communication screens for announcements and updates flowing from school to parents.",
        "A NativeWind styling layer so the design language stayed consistent across screens as the app grew.",
        "Zustand state management for session and app data.",
      ],
      results: [
        "One codebase ships to both iOS and Android, so a school doesn't pay twice for the same feature.",
        "School communication lives in a single app rather than spread across chat threads and paper.",
      ],
    },
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
    detail: {
      problem:
        "Collectors trade comics on auction, and an auction is the one commerce flow where latency is the product: a bid that shows up a few seconds late is a bid that lost for the wrong reason. Comzone — my university capstone — had to carry a live auction, real Vietnamese payment rails and real shipping, end to end, not as a mock.",
      shipped: [
        "The marketplace front end: browsing, listing and item detail flows.",
        "The live auction experience over Socket.IO — bids, current price and auction state pushed to every watching client.",
        "Checkout against VNPay and ZaloPay, including the redirect and result-handling paths real payment gateways require.",
        "Shipping integration with the GHN API for fee calculation and order creation.",
      ],
      results: [
        "A working auction where competing bidders see the same price at the same time.",
        "Real payment and shipping providers integrated rather than stubbed, so the flow holds up end to end.",
      ],
    },
  },
];

export const flagshipProject: Project = projects.find((p) => p.flagship) ?? projects[0]!;

export const projectBySlug = (slug: string): Project | undefined =>
  projects.find((project) => project.slug === slug);
