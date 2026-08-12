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

**Prompt** _(locked by /plan-eng-review 2026-07-06 — see GSTACK REVIEW REPORT at the bottom of this file)_:

```
Implement per the eng-review-locked architecture below. yarn ONLY (yarn add, yarn playwright install).
Deps to add: @gsap/react (useGSAP), @playwright/test (dev). gsap 3.15 already bundles SplitText free.

Atomic commits, in this order:

1. MotionProvider — client component mounted in app/layout.tsx (persistent across routes), ~30 explicit lines:
   - gsap.matchMedia("(prefers-reduced-motion: no-preference)") lives INSIDE the provider and owns
     Lenis create/destroy (survives the user toggling the OS setting mid-session).
     Reduced motion = no Lenis at all, native scroll.
   - new Lenis({ autoRaf: false, anchors: true }); gsap.ticker.add((t) => lenis.raf(t * 1000));
     gsap.ticker.lagSmoothing(0); lenis.on("scroll", ScrollTrigger.update).
     ONE RAF loop total: gsap.ticker owns it.
   - Anchor/skip-link focus management: tabindex="-1" on #main, move focus to the target on anchor
     arrival; the skip link jumps instantly (never momentum-scrolled).

2. Scroll reveals — sections STAY server components; add data-reveal attributes; ONE client
   orchestrator (<SectionMotion>, mounted per-page / keyed on usePathname() for Phase 5) runs
   useGSAP and animates [data-reveal] with opacity+transform staggers, once: true (each trigger
   self-destroys; content stays visible).
   Hidden-before-reveal state: inline beforeInteractive script sets html.js; CSS hides [data-reveal]
   ONLY under html.js AND (prefers-reduced-motion: no-preference) — no-JS and reduced-motion
   visitors always see full content, and hydrated visitors never see a flash-then-hide.
   Consume lib/motion.ts tokens (durations/gsapEase) — no new magic numbers.

3. SplitText — SplitText.create with autoSplit: true, mask: "lines", default aria; animations
   created in the onSplit callback (font-load + fluid-type resize safe). Hero h1 splits by
   words/lines, NOT chars (Archivo wdth 125 + negative tracking loses kerning between split chars;
   chars only if a visual diff proves they hold). Elements with data-split are EXCLUDED from
   data-reveal sweeps — one animation owner per element. Verify the hero at 375px (known
   display-xl overflow pitfall).

4. Cursor + magnetic — <Cursor> client component rendered only under (pointer: fine) matchMedia;
   movement via gsap.quickTo (transform/opacity only); scale via ONE document-level delegation
   listener matching closest('a, button, [data-cursor]'). ONE <Magnetic> wrapper component
   (quickTo pull, spring release) applied ONLY to the three ContactFooter pill links —
   block/pill elements only, NEVER inline text links.

5. Tests + CI — Playwright specs: (1) reduced-motion emulation → fully static page, no Lenis, no
   cursor, all content visible; (2) JS disabled → all content visible; (3) touch emulation → no
   cursor element; (4) pointer:fine → cursor present + scales on link hover; (5) nav anchor click →
   asserts FOCUS lands on the target section (not just scrollY); (6) all sections reach visible
   state after scroll; (7) exactly one RAF driver (gsap.ticker) active; (8) after orchestrator
   teardown, ScrollTrigger.getAll().length === 0. GitHub Actions workflow runs build + playwright
   on every push. 60fps stays a manual perf-trace check in /qa (not a fake headless assertion).

Constraints (unchanged): transform/opacity ONLY on the DOM layer, 60fps; useGSAP() everywhere for
strict-mode-safe cleanup. NOTE: styles/globals.css:188 only neuters CSS animations — it does NOT
cover GSAP/Lenis; the provider's matchMedia is the real reduced-motion gate.

Run /qa.
```

**QA gate:** one RAF loop only (spec-asserted) · 60fps on scroll (perf trace) · reduced-motion respected end-to-end · no GSAP leaks in strict mode (spec-asserted) · cursor hidden on touch · skip link + nav anchors move focus · Playwright suite green in CI.

---

## Phase 4 — WebGL layer: cursor distortion, particles & glow ⭐

**Goal:** The heart of the OHZI look. This is the hardest phase — build the shader **incrementally**, one uniform at a time.
**Deliverable:** Hero/background WebGL that distorts toward the cursor, a particle field reacting to mouse velocity, and glow/bloom that intensifies near the cursor.
**Skills:** gstack `/plan-eng-review` then `/qa`.

**Prompt** _(locked by /plan-eng-review 2026-07-25 — see GSTACK REVIEW REPORT at the bottom of this file)_:

```
Implement per the eng-review-locked architecture below. yarn ONLY. Do NOT write the full shader
in one shot — build and verify in steps, committing each working step.

File layout (named up front so the 5 commits have clean boundaries):
- components/webgl/WebGLBackground.tsx — mounts <Canvas frameloop="never">, joins gsap.ticker,
  owns the reduced-motion / no-WebGL / context-loss fallback branching
- components/webgl/DisplacementPlane.tsx (+ its shaderMaterial, via drei's `shaderMaterial`
  factory) — a decorative background plane, NOT the live DOM hero text (target-stack signature
  #2's "hero media" means this plane — the hero copy itself stays normal DOM, already handled
  by Phase 3's SplitText; distorting live text would need a text→texture capture step, rejected
  as unnecessary complexity for this site)
- components/webgl/ParticleField.tsx — Points geometry reacting to mouse position/velocity
- components/webgl/useWebGLSupport.ts — capability probe (canvas.getContext('webgl2'||'webgl')
  before mount) + onContextLost/onContextRestored wiring
- lib/webgl/pointer.ts — the ONE shared raw-pointer-position tracker; components/motion/Cursor.tsx
  is refactored to read from this instead of running its own window.pointermove listener
- lib/webgl/tokens.ts — named constants (lerp factor, falloff radius, particle count/speed,
  DPR clamp range, bloom intensity min/max), mirroring lib/motion.ts — no inline magic numbers

Mount WebGLBackground in app/layout.tsx, sibling to MotionProvider/Cursor (fixed full-viewport,
negative z-index, behind {children}) — NOT inside Hero.tsx. Phase 5 requires the canvas to survive
route navigation without tearing down; root-layout mounting is the only place that works for that.

Reduced motion: gate the ENTIRE canvas on gsap.matchMedia("(prefers-reduced-motion: no-preference)"),
same pattern as MotionProvider.tsx — under reduced motion OR no WebGL, mount nothing and show the
Phase 2 static hero. Same fallback code path for both cases.

Step 1: Mount the R3F <Canvas> (frameloop="never") as a fixed full-viewport background layer behind
        the DOM content. Confirm it renders the flat plane with a base color and does not break
        scroll or CLS. Wire useWebGLSupport's capability probe + context-loss listeners here so
        every later step inherits the fallback branching for free.
Step 2: Pass a smoothed uMouse uniform (lerped from lib/webgl/pointer.ts's raw position, lerp
        factor from lib/webgl/tokens.ts) + uTime into DisplacementPlane's material. Both are
        mutated via refs inside the ticker-driven advance callback — NEVER via React useState
        (a 60fps re-render of the whole WebGL subtree is the standard R3F footgun). uTime comes
        straight from gsap.ticker's raw seconds-denominated callback arg passed into advance(t) —
        no ×1000 conversion (that conversion in MotionProvider.tsx is ONLY for Lenis's ms-based
        API; three.js's Clock/advance() expects seconds — passing ms in would silently corrupt
        elapsedTime/delta for every time-based uniform).
Step 3: Displacement — displace DisplacementPlane toward uMouse (falloff by distance, radius from
        lib/webgl/tokens.ts). Tune falloff by editing the token, not an inline number.
Step 4: Particle field (Points) whose motion responds to mouse position and velocity (velocity
        derived from lib/webgl/pointer.ts's position deltas over time).
Step 5: Glow — add @react-three/postprocessing Bloom; drive bloom intensity by cursor proximity in
        the shader. Verify EffectComposer's render targets are disposed on unmount and on resize —
        don't assume. Also in this step: a forced context-loss/restore Playwright spec (the
        WEBGL_lose_context extension is force-able on demand, not a real GPU crash simulation) that
        asserts fallback-then-recovery.

Rules:
- Clamp devicePixelRatio (max ~2) via Canvas's `dpr={[1, 2]}` prop, throttle where possible, keep
  it 60fps on desktop
- Everything must degrade gracefully if WebGL is unavailable OR the context is lost mid-session
  (fall back to the Phase 2 static hero in both cases)
- Investigate before fixing any perf regression; measure, don't guess
- Single-RAF contract (locked in Phase 3 eng review): the R3F <Canvas> uses frameloop="never" and is
  advanced from the existing gsap.ticker in MotionProvider — never its own internal RAF. Re-evaluate
  gsap.ticker.lagSmoothing(0) once the shader joins the ticker (a dropped WebGL frame must not yank
  the scroll clock).

Tests (Step 5, alongside the shader work — not deferred to a follow-up):
- Existing e2e/motion.spec.ts test (7) "exactly one RAF driver" must still pass unmodified once
  Canvas joins the ticker — the highest-value regression check in this phase.
- New specs: reduced-motion → no canvas mounted, static hero shown; WebGL unavailable → static
  hero, no console error; touch/mobile → canvas DOES mount (unlike Cursor, which doesn't on touch);
  shared pointer position has no drift between Cursor.tsx and WebGLBackground; forced context-loss
  via WEBGL_lose_context → fallback appears → restoreContext() → recovery verified.
- Manual /qa only (not CI-assertable): visual shader correctness, real 60fps via perf trace (same
  as Phase 3's fps handling — not a fake headless assertion), memory-growth check via Chrome
  DevTools heap snapshot before/after a 2-minute mouse-move soak.

Run /qa after each step and a final /qa at the end.
```

**QA gate:** 60fps desktop / ~45fps mobile · DPR clamped · graceful WebGL fallback (unavailable AND mid-session context loss) · no memory growth over 2 min (verified via heap-snapshot soak, not assumed) · CLS unaffected · still exactly ONE RAF loop with the canvas mounted (regression-asserted by existing test (7)) · cursor mix-blend-mode cost re-verified over the live canvas (non-blend cursor fallback stays one line away) · reduced-motion gates the entire canvas, same as no-WebGL.

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

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 2 | CLEAN (PLAN, 2026-07-25) | Run 1 (2026-07-06, Phase 3): 24 issues, 0 critical gaps, all resolved. Run 2 (2026-07-25, Phase 4): 11 issues (3 architecture, 2 code quality, 1 test-scope, 2 performance, 3 outside-voice) + 1 TODO-candidate built into scope, 0 critical gaps, all resolved & folded into Phase 4 |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **CROSS-MODEL:** Outside voice (Claude subagent; Codex not installed) found 3 net-new gaps the section review missed — displacement target ambiguity (accepted: decorative plane, not live DOM text), canvas mount point (accepted: root layout, not Hero-scoped, since Phase 5 needs it to survive navigation), and an `advance()` seconds-vs-ms unit footgun (accepted: documented explicitly) — no disagreement with the section review's own findings, purely additive.
- **NOT in scope (Phase 4):** mobile-specific particle-count/bloom degradation (Phase 6 owns adaptive degradation; Phase 4 ships one reasonable fixed default) · distorting live DOM hero text via a texture capture (rejected in favor of a decorative plane — same visual signature, far less complexity for a solo-dev site) · broader device-matrix fps validation (Phase 6's "verified on a real device" gate covers this; Phase 4's perf check is a single manual trace).
- **What already exists, reused rather than rebuilt:** the single-RAF `gsap.ticker` contract and its `lagSmoothing(0)` call (`components/motion/MotionProvider.tsx`) · `three`/`@react-three/fiber`/`@react-three/drei`/`@react-three/postprocessing` already installed at current versions (Phase 0) · `lib/motion.ts`'s token-file pattern, mirrored by the new `lib/webgl/tokens.ts` · `components/motion/Cursor.tsx`'s pointer-tracking, consolidated into the new shared `lib/webgl/pointer.ts` instead of duplicated · `components/Hero.tsx`'s current text-only state, reused as-is for the reduced-motion/no-WebGL fallback.
- **Failure modes flagged:** WebGL context lost mid-session (no test → now `[REGRESSION-CRITICAL]`-adjacent forced-loss E2E spec, Step 5) · a naive `useState`-driven uniform update silently blowing the 60fps budget with no error (no test possible for a "didn't happen" — mitigated by naming the ref-based pattern explicitly in the prompt) · `lib/webgl/pointer.ts`'s shared listener must be a module-level singleton independent of either consumer's mount/unmount lifecycle (Cursor.tsx and WebGLBackground mount/unmount independently — tying the shared listener's lifecycle to whichever mounts first would throw on stale access from the other).
- **Parallelization:** Lane A — `lib/webgl/pointer.ts` extraction + `Cursor.tsx` refactor (independent). Lane B — Step 1 Canvas mount + fallback wiring (independent, no pointer data needed yet). Merge, then Lane C — Step 3 displacement ∥ Lane D — Step 4 particles (both depend on Step 2's uniform-wiring pattern, touch different files). Merge, then Step 5 (bloom + full test batch, depends on C+D). Conflict risk: C and D may both add a JSX child to `WebGLBackground.tsx`'s scene tree — trivial to resolve.
- **VERDICT:** ENG CLEARED — ready to implement Phase 4.

NO UNRESOLVED DECISIONS
