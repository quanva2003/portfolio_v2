import type { Project } from "./types";

/*
 * Reconciled against the CV on 2026-09-08. Three things had drifted:
 *
 *  - "Tamda Shipment" is called TAMDA EXPRESS. The old name was never the
 *    product's.
 *  - Tamda's entry omitted the mapping layer entirely — the TomTom integration,
 *    the marker registry, the distributed order locking, the codegen pipeline.
 *    That is the deepest technical work on this site and it was simply missing.
 *  - Panda ERP's stack claimed web-only React; the product ships React Native
 *    on mobile and tablet, which is where most of the POS work happened.
 *
 * The `slug` stays `tamda-shipment` even though the name changed. A slug is a
 * URL: it is in app/sitemap.ts, in the canonical tag of the case study, and in
 * any link already shared. Renaming it to match the display name would be a
 * cosmetic change that breaks addresses, so the two are allowed to differ.
 * Rename it only in a deliberate move that also updates the sitemap and accepts
 * the broken links.
 *
 * Panda CMS is on the CV and deliberately NOT here: the product has not shipped.
 */
export const projects: Project[] = [
  {
    slug: "panda-erp",
    name: "Panda ERP",
    summary: "F&B operations platform: POS, KDS, inventory and revenue reporting in real time.",
    description:
      "An end-to-end operations platform for food & beverage businesses covering point of sale, kitchen display system, inventory and revenue reporting. Real-time updates over Socket.IO keep every station in sync across multiple branches, on web, tablet and mobile.",
    role: "Front-End Developer",
    stack: ["React Native", "React 18", "TypeScript", "Zustand", "Socket.IO", "Ant Design"],
    highlights: [
      "Primary owner of the POS surface on mobile and tablet",
      "Designed the first release of the Kitchen Display System",
      "Built the realtime layer fanning one socket out to every screen",
    ],
    flagship: true,
    order: 1,
    detail: {
      problem:
        "A food & beverage business runs on several screens at once — a cashier taking the order, a kitchen cooking it, a manager watching stock and revenue — and each one traditionally holds its own copy of the truth. When they drift apart you get orders cooked twice, stock counts nobody trusts and a day's revenue that only reconciles the morning after. Panda ERP had to make one shared state visible on every screen at the same moment, across several branches and three different form factors.",
      shipped: [
        "The POS surface on mobile and tablet as its primary owner — order entry, checkout, discounts, table operations and shifts — plus the matching POS settings and table-management screens on the web client.",
        "The first release of the Kitchen Display System: the ticket store, the socket event service, and the screen components driving real-time kitchen flow.",
        "The app's realtime layer — a socket provider plus the POS and kitchen event hooks — fanning one connection out to every screen and writing events straight into the shared store, so screens stay in sync without prop drilling.",
        "A fix for a state-clobbering defect where socket payloads missing kitchen status overwrote correct kitchen state, replacing a whole-object swap with a field-level merge.",
        "A refactor of order-item pricing into a single utility: discounts unified to one percentage representation, and item-level separated from order-level so split payments compute correctly.",
        "The feedback module and cancelled-items report end to end, and a standardisation of back-button variants across six modules into one themed component — the project's first design guideline.",
      ],
      results: [
        "Every station reads the same live state: an order rung up on the POS is on the kitchen display without a refresh.",
        "One front-end codebase and one set of domain models serve three form factors, so a change lands everywhere at once.",
        "Managers can see stock and revenue across branches in the same tool the staff work in, instead of a separate end-of-day report.",
      ],
    },
    media: [
      {
        src: "/media/panda-erp-pos-order-entry.webp",
        alt: "Panda ERP point of sale on tablet: a category rail, a grid of menu items, and the open order with its running total.",
        width: 1600,
        height: 1112,
      },
      {
        src: "/media/panda-erp-kds.webp",
        alt: "The Panda ERP kitchen display: order tickets in columns, each item timed and marked as it is cooked.",
        width: 1600,
        height: 1112,
      },
      {
        src: "/media/panda-erp-pos-tables.webp",
        alt: "Panda ERP table management: a floor of tables showing which are occupied, for how long, and the running bill on each.",
        width: 1600,
        height: 1112,
      },
      {
        src: "/media/panda-erp-mobile-dashboard.webp",
        alt: "The Panda ERP mobile dashboard, showing live revenue for the day.",
        width: 646,
        height: 1400,
      },
    ],
    mediaKind: "screenshot",
  },
  {
    slug: "tamda-shipment",
    name: "Tamda Express",
    summary: "Order-to-shipment dispatch for a European delivery operation, live in production.",
    description:
      "A logistics dispatch platform covering order-to-shipment scheduling, trip management and live delivery status for a European delivery operation. Largest code owner on the production branch, ahead of six other engineers, owning the mapping layer end to end alongside the typed API pipeline the whole team consumes.",
    role: "Front-End Developer",
    stack: ["React 19", "TypeScript", "Vite", "TomTom Maps", "Zustand", "Socket.IO", "Ant Design"],
    highlights: [
      "Largest code owner on the production branch, ahead of six other engineers",
      "Owned the mapping layer end to end, from SDK introduction to route rendering",
      "Distributed order locking over WebSocket so two dispatchers cannot collide",
    ],
    flagship: false,
    order: 2,
    detail: {
      problem:
        "Logistics coordination fails in the gap between plan and reality. A shipment is scheduled, a trip is assigned, and then the truck is out in the world where the plan quietly stops matching what is happening. Two problems compound it: the dispatchers need to see where things physically are, not just read a table of them, and several dispatchers work the same board at once — so the tool has to stop two people assigning the same order to different shipments without either of them noticing.",
      shipped: [
        "The mapping layer end to end: introduced the TomTom SDK, then built order and shipment markers, detail popups and route rendering on top of it.",
        "A persistent marker registry keyed by remote id, plus visibility toggling, replacing destroy-and-recreate markers — so switching shipment modes no longer rebuilds every marker or drops popup state.",
        "Distributed order locking over WebSocket, so two dispatchers cannot assign the same order to different shipments, surfacing who currently holds it.",
        "The OpenAPI-to-TypeScript codegen pipeline that generates the typed API client the whole team consumes, and the introduction of Zustand as the app's state layer.",
        "Consistency between Web-Worker search results and live socket updates, by patching the affected record in place and re-applying the active query instead of resetting to the full list.",
        "Shipment scheduling and trip management flows: creating shipments, assigning them to trips, and covering a trip's lifecycle from assignment through completion.",
      ],
      results: [
        "Largest code owner on the production branch, ahead of six other engineers.",
        "Scheduling and execution share one view, so a coordinator sees a shipment's real state instead of asking for it.",
        "Two dispatchers can work the same board without silently overwriting each other, because a held order says who holds it.",
        "One generated API client means a backend contract change surfaces as a type error rather than a runtime bug.",
      ],
    },
    media: [
      {
        src: "/media/tamda-dispatch.webp",
        alt: "A dispatch board mockup: a map with order markers and a rendered route on the left, the day's trips in the middle, and the selected trip's detail with its unassigned orders on the right, one of them locked by another dispatcher.",
        width: 1600,
        height: 686,
      },
    ],
    mediaKind: "mockup",
  },
  {
    slug: "skyline",
    name: "Skyline",
    summary:
      "The parent app for a school group: attendance, grades, timetable, fees and daily news.",
    description:
      "The official parent app of the Sky-Line education system, shipping on iOS and Android from one React Native codebase. Sole front-end developer on the client: every screen in the app, from sign-in through the academic surfaces (attendance, grades, timetable, exam schedule, teacher comments) to the school services (boarding, clubs, bus, tuition) and the daily feed of announcements, menus and class photos.",
    role: "Front-End Developer",
    stack: ["React Native", "Expo", "NativeWind", "Zustand"],
    highlights: [
      "Built every screen in the app, from sign-in to the academic and service surfaces",
      "One React Native codebase shipping to both iOS and Android",
      "A customisable home screen where each parent picks their own shortcuts",
    ],
    flagship: false,
    order: 3,
    detail: {
      problem:
        "School-to-home communication is scattered across paper notes, group chats and phone calls, which means the message that matters most is the one most easily missed. And a parent's questions are not all the same question: some are academic (did my child attend, what did the teacher say, when is the test), some are logistical (is the bus running, what is on the lunch menu, is the tuition paid). Skyline had to answer all of them in one app a parent already has open, across a school group with several campuses, without asking the school to fund two platforms.",
      shipped: [
        "Every screen in the app, as the sole front-end developer on the client — the app shell and navigation, sign-in, and the profile and contact surfaces.",
        "The academic surfaces: attendance, grades, timetable, exam schedule and teacher comments, each reading a different slice of the school's records.",
        "The school-service surfaces: boarding, clubs, the bus service and tuition, so the logistics of a school day live beside the academic record instead of in a separate channel.",
        "The home feed — announcements, weekly menus and class photo albums — which is the screen a parent opens without being prompted.",
        "A customisable home screen: a parent chooses which shortcuts appear, so the app opens on what that family actually checks.",
        "A NativeWind styling layer that kept one design language across the whole screen surface as it grew, and Zustand for session and app state.",
      ],
      results: [
        "One codebase ships to both iOS and Android, so the school does not fund the same feature twice.",
        "Academic records and school logistics answer in the same app, rather than being split between a portal and a chat thread.",
        "The app is published and in use across the school group's campuses.",
      ],
    },
    media: [
      {
        src: "/media/skyline-home.webp",
        alt: "The Skyline parent app home screen: shortcuts to attendance, grades and the timetable, the school's services, and the latest announcement.",
        width: 630,
        height: 1400,
      },
      {
        src: "/media/skyline-feature-picker.webp",
        alt: "Skyline's favourite-features screen, where a parent chooses which shortcuts appear on the home screen.",
        width: 788,
        height: 1400,
      },
      {
        src: "/media/skyline-login.webp",
        alt: "The Skyline sign-in screen.",
        width: 788,
        height: 1400,
      },
    ],
    mediaKind: "screenshot",
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
    media: [
      {
        /*
         * 531x767 — the only capture the author still has, and small for the
         * 21:9 case-study hero. It renders sharply in the work grid's card and
         * softens on the detail route; replace it with a 2x Figma export when
         * one exists rather than upscaling this one.
         */
        src: "/media/comzone-01.webp",
        alt: "The Comzone marketplace home page: a search bar over the comic catalogue, a row of featured titles with prices, and a row of live auctions each counting down to close.",
        width: 531,
        height: 767,
      },
    ],
    mediaKind: "screenshot",
  },
];

export const flagshipProject: Project = projects.find((p) => p.flagship) ?? projects[0]!;

export const projectBySlug = (slug: string): Project | undefined =>
  projects.find((project) => project.slug === slug);
