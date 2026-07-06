# PLAN.md — Van Anh Quan · OHZI-style Portfolio

> **Goal:** A single-page (+ light project detail routes) developer portfolio with OHZI-grade
> motion — cursor-driven WebGL distortion, particle field, glow-by-proximity — built on the
> taste-skill design language, shipped to Vercel.
>
> **Source of truth for content:** `Van_Anh_Quan_Frontend_Developer.pdf`
> **Reference vibe:** ohzi.io
> **Workflow:** gstack (`/plan-eng-review`, `/qa`, `/ship`) + design-taste-frontend. Read-before-write,
> investigation-before-fix, atomic commits, Vietnamese commit bodies OK.

---

## Target stack

| Layer           | Choice                                                     | Why                                              |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| Framework       | **Next.js 15** (App Router) + TypeScript                   | Your daily driver; enables View Transitions API  |
| Styling         | **Tailwind CSS** (v4)                                      | Taste-skill tokens map cleanly to Tailwind theme |
| Smooth scroll   | **Lenis**                                                  | Momentum scroll = the "premium" base feel        |
| Choreography    | **GSAP** + ScrollTrigger + SplitText                       | Scroll-scrub, pinning, text reveals              |
| WebGL layer     | **React Three Fiber** + drei + @react-three/postprocessing | The OHZI signature lives here                    |
| Shaders         | **custom GLSL** (displacement + particle + glow)           | Cursor-proximity distortion & bloom              |
| Deploy          | **Vercel**                                                 | Ship from Phase 0, every phase is live           |
| Package manager | **yarn**                                                   | Use `yarn` for all installs/scripts — never npm  |

## The 5 OHZI signatures we are reproducing

1. **Custom cursor** that acts as an exploration tool (magnetic, blend-mode, scales on hover).
2. **Real-time mouse-driven distortion** across hero media/text (GLSL displacement, `uMouse` uniform).
3. **Particle field** that reacts to cursor position/velocity.
4. **Glow / bloom intensity driven by cursor proximity** (GLSL lighting + postprocessing bloom).
5. **60fps desktop / ~45–50fps mobile** — perf is a feature, with a `prefers-reduced-motion` fallback.

## Content map (from CV → sections)

- **Hero** — "Van Anh Quan / Front-End Developer", tagline, WebGL background.
- **About / Manifesto** — HCMC-based, B.Sc Software Engineering @ FPT, ~2 yrs shipping across web/tablet/mobile.
- **Selected Work** (ordered by strength):
  1. **Panda ERP** — F&B ops platform: POS, KDS, inventory, revenue reporting, real-time Socket.IO, multi-branch, web/tablet/mobile. _(flagship — gets a detail page)_
  2. **Tamda Shipment** — logistics platform: shipment scheduling, trip management, live status. React/TS/Antd/Zustand/Socket.IO.
  3. **Skyline** — school communication mobile app. React Native, NativeWind, Zustand.
  4. **Comzone** — comic marketplace + real-time auctions (capstone). VNPay/ZaloPay, GHN API, Socket.IO.
- **Experience** — General Era (FE intern, 2023) → Dan Solutions (FE, 2024–present).
- **Skills** — JS/TS · React · React Native · Next.js · Zustand · Socket.IO · Tailwind · NativeWind · Antd · MUI.
- **Contact** — qsao2212@gmail.com · github.com/quanva2003 · linkedin.com/in/wuanvan5076 · 0941697009.

---

## Phase 0 — Repo, tooling & Vercel skeleton

**Goal:** Bootstrapped Next 15 app deployed to Vercel on day one, so every later phase ships incrementally.
**Deliverable:** Live Vercel URL rendering a placeholder hero; green build.
**Skills:** gstack `/qa`.

**Prompt:**

```
Before writing anything, read the current directory and confirm it is empty / safe to scaffold.
Use yarn as the package manager for EVERYTHING — scaffolding, installs, and scripts. Never use npm/npx.
Then set up a new project with this exact stack, one atomic commit per logical step:

- Scaffold with `yarn create next-app` — Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Install deps: `yarn add lenis gsap three @react-three/fiber @react-three/drei @react-three/postprocessing`
- ESLint + Prettier configured; strict TS
- Folder structure: app/, components/, components/webgl/, lib/, styles/, content/
- A content/ layer (typed TS objects) holding all CV data (projects, experience, skills, contact)
  so copy is never hardcoded in JSX
- Placeholder hero rendering my name + title from content/

Do NOT add animation yet. Verify `yarn build` passes locally, then set up Vercel deploy
(set the Vercel project's install command to `yarn install` and build to `yarn build`).
Commit the yarn.lock. Run /qa. Report the live URL.
```

**QA gate:** `next build` passes · zero TS/lint errors · live Vercel URL loads · all CV copy lives in `content/`.

---

## Phase 1 — Taste pass: design system & direction

**Goal:** Lock the visual language with design-taste-frontend before any layout. OHZI reference = dark, high-contrast, near-monochrome + one restrained accent, oversized editorial type.
**Deliverable:** `design-tokens` + a `/styleguide` route.
**Skills:** **design-taste-frontend** (taste-skill), gstack `/qa`.

**Prompt:**

```
Invoke the design-taste-frontend skill. Define a distinctive, intentional visual system for a
dark, editorial developer portfolio inspired by ohzi.io — NOT a templated default.

Produce, wired into Tailwind theme + CSS variables:
- Type scale (a display face for hero, a clean grotesk for body), fluid clamp() sizes
- Color: dark base, high-contrast foreground, ONE accent used sparingly
- Spacing / grid / radius tokens
- Motion tokens: durations, spring configs, standard easing (favor spring over hard easing)

Build a /styleguide route rendering every token (type ramp, color swatches, spacing, buttons,
motion demos) so I can review the taste in isolation. Run /qa.
```

**QA gate:** `/styleguide` renders all tokens · tokens consumed via theme (no magic numbers) · passes a taste review (doesn't read as a template).

---

## Phase 2 — Content architecture & static build (no animation)

**Goal:** Every section built, responsive, semantic, accessible, and **CLS-safe** — with zero animation. This is the skeleton motion will hang on.
**Deliverable:** Full static page + reserved layout for the WebGL canvas.
**Skills:** design-taste-frontend, gstack `/qa`.

**Prompt:**

```
Read content/ and the design tokens from Phase 1 before building.

Build all sections as static, responsive, semantic, accessible markup — NO animation, NO WebGL yet:
Hero, About, Selected Work (Panda ERP flagship card larger than the rest; Tamda, Skyline, Comzone),
Experience timeline, Skills, Contact/Footer.

Requirements:
- Mobile-first, works 360px → 1440px
- Reserve explicit space for media / the future WebGL canvas so CLS stays < 0.1
- Real semantic landmarks + focus states + alt text
- Pull ALL copy from content/, never inline

Investigate the existing token setup first; reuse, don't reinvent. Run /qa.
```

**QA gate:** responsive 360→1440 · CLS < 0.1 · keyboard-navigable · Lighthouse a11y ≥ 95 · no hardcoded copy.

---

## Phase 3 — Smooth scroll + custom cursor + base motion

**Goal:** The "premium base feel" before WebGL — Lenis momentum, GSAP reveals, SplitText headings, magnetic buttons, and a DOM custom cursor.
**Deliverable:** The page feels alive on scroll and hover; still no WebGL.
**Skills:** gstack `/plan-eng-review` then `/qa`.

**Prompt:**

```
Run /plan-eng-review on this before implementing.

Add, in this order (atomic commits):
1. Lenis smooth scroll, synced to GSAP ScrollTrigger (single RAF loop — do not run two RAF loops)
2. Scroll-reveal for each section (opacity + transform only, staggered), using ScrollTrigger
3. SplitText line/char reveal on the hero + section headings
4. A custom cursor (DOM, mix-blend-mode) that scales on interactive elements + magnetic buttons

Constraints:
- transform/opacity ONLY on the DOM layer, 60fps
- Respect prefers-reduced-motion (disable/simplify)
- Clean up all GSAP contexts on unmount (no leaks / no double-binding in React 18 strict)

Run /qa.
```

**QA gate:** one RAF loop only · 60fps on scroll · reduced-motion respected · no GSAP leaks in strict mode · cursor works on all breakpoints (hidden on touch).

---

## Phase 4 — WebGL layer: cursor distortion, particles & glow ⭐

**Goal:** The heart of the OHZI look. This is the hardest phase — build the shader **incrementally**, one uniform at a time.
**Deliverable:** Hero/background WebGL that distorts toward the cursor, a particle field reacting to mouse velocity, and glow/bloom that intensifies near the cursor.
**Skills:** gstack `/plan-eng-review` then `/qa`.

**Prompt:**

```
Run /plan-eng-review first. Do NOT write the full shader in one shot — build and verify in steps,
committing each working step.

Step 1: Mount an R3F <Canvas> as a fixed full-viewport background layer behind the DOM content.
        Confirm it renders a flat plane with a base color and does not break scroll or CLS.
Step 2: Pass a smoothed uMouse uniform (lerped mouse position) + uTime into a custom GLSL material.
Step 3: Displacement — displace the plane/hero texture toward uMouse (falloff by distance). Tune falloff.
Step 4: Particle field (Points) whose motion responds to mouse position and velocity.
Step 5: Glow — add @react-three/postprocessing Bloom; drive bloom intensity by cursor proximity in the shader.

Rules:
- Clamp devicePixelRatio (max ~2), throttle where possible, keep it 60fps on desktop
- Everything must degrade gracefully if WebGL is unavailable (fall back to the Phase 2 static hero)
- Investigate before fixing any perf regression; measure, don't guess

Run /qa after each step and a final /qa at the end.
```

**QA gate:** 60fps desktop / ~45fps mobile · DPR clamped · graceful WebGL fallback · no memory growth over 2 min · CLS unaffected.

---

## Phase 5 — Project detail pages & transitions

**Goal:** Give the flagship projects room to breathe, with cinematic navigation.
**Deliverable:** Detail route(s) for Panda ERP (+ others) with a shared-element / View Transitions morph and a preloader.
**Skills:** gstack `/qa`.

**Prompt:**

```
Read content/ and existing routing first.

1. Add project detail routes (start with Panda ERP: problem, role, stack, what I shipped, results).
2. Navigate list → detail with a morph transition. Prefer the Next 15 View Transitions API
   (shared-element on the project thumbnail → hero); fall back to a GSAP transition if unstable.
3. Add a lightweight preloader (progress based on real asset/font load, not a fake timer).

Keep the WebGL layer alive across navigation where possible (don't tear down + rebuild the canvas).
Run /qa.
```

**QA gate:** transitions smooth, no flash of unstyled/unpinned content · back/forward works · preloader reflects real load · WebGL survives navigation.

---

## Phase 6 — Performance, accessibility & mobile fallback

**Goal:** Make it fast and inclusive. You care about CLS — this is where it gets enforced.
**Deliverable:** Green Lighthouse, honest mobile degradation.
**Skills:** gstack `/plan-eng-review` then `/qa`.

**Prompt:**

```
Run /plan-eng-review. Then do a full perf + a11y pass — investigate each finding before changing code:

- Lighthouse (mobile + desktop): target Perf ≥ 90, A11y ≥ 95, CLS < 0.1
- Lazy-mount the WebGL canvas (only when in view / after first paint); code-split heavy three deps
- On low-power / mobile / reduced-motion: drop particle count, disable bloom, or fall back to static
- Verify prefers-reduced-motion path end-to-end
- Font loading strategy (no layout shift), image optimization (next/image), preconnect

Report before/after metrics. Run /qa.
```

**QA gate:** Lighthouse Perf ≥ 90 · A11y ≥ 95 · CLS < 0.1 · reduced-motion fully honored · mobile fallback verified on a real device.

---

## Phase 7 — Ship: SEO, OG, analytics & production deploy

**Goal:** Production-ready and shareable.
**Deliverable:** Custom domain (optional), OG image, sitemap, analytics, final ship.
**Skills:** gstack `/ship`.

**Prompt:**

```
Final polish, then ship:
- Metadata + Open Graph / Twitter card image (generate a branded OG image)
- sitemap.xml + robots.txt + favicon set
- GA4 (or Vercel Analytics) wired correctly — verify events fire in production, not just locally
- Final content proofread against the CV (names, links, dates)
- Confirm production build + deploy on Vercel; attach custom domain if provided

Run /ship.
```

**QA gate:** OG preview renders in a social debugger · analytics confirmed firing in prod · all CV links correct · production build clean.

---

## Suggested sequencing / effort

| Phase | Focus                         | Rough size        |
| ----- | ----------------------------- | ----------------- |
| 0     | Setup + Vercel                | S                 |
| 1     | Taste / tokens                | S–M               |
| 2     | Static build                  | M                 |
| 3     | Scroll + cursor + base motion | M                 |
| 4     | **WebGL signature** ⭐        | L (the real work) |
| 5     | Detail pages + transitions    | M                 |
| 6     | Perf + a11y                   | M                 |
| 7     | Ship                          | S                 |

**Advice:** Phases 0–3 give you a genuinely nice site even if you stop there. Phase 4 is where the
OHZI magic lives and where most of the risk/time is — timebox the shader work and keep the static
fallback from Phase 2 wired the whole way, so you always have something shippable.
