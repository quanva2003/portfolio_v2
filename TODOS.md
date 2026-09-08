# TODOS

Deferred work with enough context to pick up cold. Each entry records **why** it
was deferred, not just that it was — a TODO without the reasoning is worse than
no TODO, because it looks captured while the thinking is gone.

---

## 1. Cap the ticker advance rate on desktop

**Status:** deferred from Phase 6 (eng review 2026-08-13)
**Depends on:** nothing — actionable now.

**What:** Advance the R3F canvas at ~30fps instead of on every `gsap.ticker`
frame, on the devices that still render it.

**Why:** A continuously-advancing full-screen shader is the largest sustained
main-thread and battery cost the site has. Halving the advance rate roughly
halves it, and a decorative background at 30fps behind static DOM content is
very hard to perceive.

**Where to start:** `TickerBridge` in `components/webgl/WebGLBackground.tsx`
already owns the manual `advance(t)` call — the canvas is `frameloop="never"`,
so this is an elapsed-time accumulator plus an early return inside the existing
callback. No new architecture, no new RAF driver (the single-RAF contract in
`e2e/motion.spec.ts` test (7) is unaffected because the ticker registration
count does not change).

**Why deferred:** Phase 6 resolved the mobile problem by not mounting the canvas
on the reduced tier at all, so the devices this would have helped most no longer
run it. Desktop measures Perf 98 / TBT 9ms, so there is no score pressure left
to justify the change during Phase 6. It remains worth doing for battery on
laptops.

**Cons to weigh when picking it up:** the pointer-velocity response in
`ParticleField` is sampled per advance, so a 30fps advance halves its sampling
rate; check that a fast swipe still scatters particles convincingly.

---

## 4. Content behind the preloader overlay is reachable by Tab and screen readers

**Status:** deferred from Phase 6 (eng review 2026-08-13, cross-model tension 3)

**What:** While the preloader overlay is up, the page underneath stays in the
accessibility tree and in the tab order. A screen reader announces content
nobody can see, and Tab moves focus to invisible links.

**Why it was deferred, not dismissed:** the concern is real, but the fix
proposed during review was not sound and the gate it was meant to serve is
already met.

- Measured A11y is **96** (gate is >= 95) and Lighthouse does **not** audit tab
  order behind a transient overlay, so this contributes zero points.
- The proposed fix (`inert` on a content wrapper) requires introducing a new
  root-level wrapper div in `app/layout.tsx`, which changes the containing block
  and the view-transition `root` capture that Phase 5 depends on.
- The proposed failsafe was unsound: `<Preloader />` sits **outside** every error
  boundary (`WebGLErrorBoundary` wraps only `WebGLBackground`), so a throw
  unmounts the React root and any failsafe owned by that component dies with it.
  A rendered-but-permanently-inert page is a worse failure than the one being
  fixed.

**Where to start if picked up:** the failsafe must live outside the Preloader —
`lib/transition.ts`, alongside `waitForPreloader()` and
`PRELOADER_GATE_FAILSAFE_MS`, is the natural home, since that module already
owns the "preloader never reported done" recovery path. Consider also putting
`<Preloader />` inside an error boundary first; that is worth doing on its own
merits regardless of whether `inert` ever lands.

**Exposure:** roughly one second on a cold load, and only when motion is
allowed (reduced-motion visitors never see the overlay at all).

---

## 2. Wire ProjectMedia to next/image when real screenshots exist

**Status:** deferred from Phase 6 (eng review 2026-08-13, decision D3)
**Depends on:** having actual project screenshots to place. Blocked on content,
not on code.

**What:** Replace the typographic placeholder in `components/ProjectMedia.tsx`
with `next/image`, using explicit dimensions and the existing fixed-aspect frame.

**Why:** Phase 6's prompt listed "image optimization (next/image)" as a
performance task. It was dropped because the repo contains **zero images** —
`ProjectMedia.tsx` renders the project name as display type inside an
aspect-ratio box. Optimizing images that do not exist is not deferrable work, it
is absent work. But the moment screenshots land, this becomes real and the
Phase 6 CLS budget depends on it being done correctly.

**Where to start:** `components/ProjectMedia.tsx` is the ONE frame rendered by
both the work grid and the case-study hero, and it already carries a `TODO`
comment at the exact mount point. The `ASPECT` map already reserves layout, so a
correctly-sized `next/image` should produce zero shift.

**Critical constraint — do not break the route morph:** this component owns
`view-transition-name` via `viewTransitionName.projectMedia(project.slug)`. The
name must resolve to the same string on both the list and detail side or the
browser has no pair to morph. If you restructure the element tree to accommodate
`next/image`, the name must stay on an element that exists in both states.
`e2e/transitions.spec.ts` test (4) asserts this pairing — keep it green.

---

## 3. Enforce the Lighthouse budget in CI

**Status:** deferred from Phase 6 (eng review 2026-08-13)
**Depends on:** Phase 6 establishing a passing baseline first.

**What:** Add a Lighthouse CI job to the GitHub Actions workflow that fails the
build when Perf drops below 90 or CLS rises above 0.1.

**Why:** Phase 6's entire QA gate is expressed in Lighthouse numbers. Without
automation those numbers are true on the day they are measured and unverified
forever after. Phase 7 adds analytics and an OG image — both can move them, and
nothing would catch it.

**Where to start:** the repo already runs build + Playwright in GitHub Actions,
so this is an added job rather than new infrastructure. Phase 6 adds `lighthouse`
as a devDependency and a repeatable local invocation; CI reuses that.

**Why deferred:** a budget gate is meaningless until the baseline it defends
actually exists. Also note the project's existing principle here: 60fps was
deliberately kept a manual perf-trace check rather than faked as a headless
assertion. Lighthouse scores differ from fps in that they genuinely are
automatable — but they are also variance-prone in CI, so thresholds need tuning
or the job becomes flaky and gets ignored, which is worse than not having it.

---

## 5. Decide the resting state of the WebGL cursor glow

**Status:** deferred from /qa on 2026-09-08 (QA-002, low severity)

**What:** `lib/webgl/pointer.ts` initialises the shared pointer at `{x: 0, y: 0}`,
so on a fresh desktop load the cursor-proximity glow sits in the top-left corner
of the viewport, overlapping the "VAQ" logo, until the visitor moves the mouse.

**Why deferred rather than fixed:** it is cosmetic and short-lived, and the
obvious fix (seed the initial position to the viewport centre) is a judgement
call about how the effect should look *at rest* — art direction, not a defect.
Pre-existing since Phase 4, not a Phase 6 regression.

**Where to start:** `lib/webgl/pointer.ts:17`. Seeding to
`{ x: innerWidth / 2, y: innerHeight / 2 }` is a one-line change, but note the
module is evaluated at import time, so it must read the size lazily or guard for
SSR. Confirm the chosen resting look on both a wide desktop and a phone.

**Related:** the glow is elliptical rather than circular because the falloff uses
`distance()` in a normalised `[-1,1]` square while the viewport is 16:9. That is
a property of how the shader was authored, not a bug — but if you touch the
resting state you may want to decide that deliberately at the same time.

---

## 6. Verify the mobile fallback on real hardware

**Status:** the one Phase 6 QA gate still open.

**What:** Phase 6's gate says "mobile fallback verified on a real device". Every
check so far is emulation: Playwright device descriptors, Lighthouse mobile
emulation, and viewport resizing.

**What emulation already proved:** the reduced tier resolves correctly under
touch emulation, mounts no canvas, and transfers 185 kB of JS across 13 requests
with no chunk over 60 kB (verified against Lighthouse's own network records, so
it holds for the scored run and not just a Playwright context).

**What it cannot prove:** that a real phone classifies as the reduced tier. The
tier reads `(pointer: coarse)` plus `navigator.hardwareConcurrency`, and
Lighthouse does not emulate `hardwareConcurrency` at all — it throttles CPU via
CDP and reports the host machine's core count. So a local run classifies with a
laptop's core count, and the pointer check is doing all the work.

**How to check:** open the deployed site on an actual phone and read
`window.__webglTier` (exposed by `WebGLMount.tsx`) plus
`document.querySelectorAll("canvas").length`. Expect `"reduced"` and `0`.
