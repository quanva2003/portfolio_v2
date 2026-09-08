# portfolio_v2

Personal portfolio for Van Anh Quan — a dark editorial site with a WebGL
background, built on Next.js 15 (App Router), Tailwind 4, GSAP and React Three
Fiber.

Live: https://quanva-portfolio.vercel.app

## Getting started

```bash
yarn install
yarn dev            # http://localhost:3000
```

| Script           | What it does                             |
| ---------------- | ---------------------------------------- |
| `yarn dev`       | Dev server (Turbopack)                   |
| `yarn build`     | Production build                         |
| `yarn start`     | Serve the production build               |
| `yarn lint`      | ESLint                                   |
| `yarn typecheck` | `tsc --noEmit`                           |
| `yarn format`    | Prettier write                           |
| `yarn test:e2e`  | Playwright — **builds first**, then runs |

`yarn test:e2e` runs against a production build, not the dev server: the
behaviour under test (code splitting, the preloader's real load signals, the
device-tier gate) does not exist in dev. Run `yarn build` first — Playwright's
`webServer` boots `yarn start` and will otherwise serve a stale build.

## Layout

```
app/            routes; (site) is the route group carrying header + footer
components/     UI, with motion/ and webgl/ as the two behavioural clusters
content/        ALL copy, typed. No string is inlined in JSX.
lib/            motion, view transitions, the WebGL tier probe, site url
styles/         globals.css — the whole design-token system
e2e/            Playwright specs, one file per behaviour under guard
scripts/        brand asset generation
```

Two conventions are worth knowing before editing:

**Copy lives in `content/`.** Components import strings; they never contain
them. Adding a project to `content/projects.ts` is enough to put it in the work
grid, give it a case-study route, and add it to the sitemap.

**Design decisions live in `styles/globals.css` as tokens,** and `/styleguide`
renders every one of them. If a value is not a token, it is probably a mistake.

## Brand assets

`public/og.png`, `app/icon.svg`, `app/apple-icon.png` and `app/favicon.ico` are
generated, not hand-drawn:

```bash
node scripts/generate-brand-assets.mjs
```

The card reads the name, title and tagline out of `content/site.ts`, so re-run
this after changing any of them — the output is committed and does not
regenerate itself at build time. Requires the Playwright chromium browser
(`yarn playwright install chromium`).

## Deployment

Vercel, from `main`. Production URL resolution lives in `lib/site-url.ts` and
drives `metadataBase`, canonical tags, the sitemap and the OG image url.

To attach a custom domain: add it in the Vercel project, then set
`NEXT_PUBLIC_SITE_URL` to the full origin (`https://example.com`) in the
project's environment variables and redeploy. Nothing else needs to change —
without it the build falls back to `VERCEL_PROJECT_PRODUCTION_URL`.

Analytics (`@vercel/analytics`) and Speed Insights mount only when
`VERCEL_ENV === "production"`, so preview deployments and local production
builds stay out of the dataset.

## Planning docs

- `PLAN.md` — phased build plan, with the locked scope of each phase
- `TODOS.md` — deferred work, each entry recording why it was deferred
