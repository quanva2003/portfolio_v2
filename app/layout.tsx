import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { contact, site } from "@/content";
import { SITE_URL } from "@/lib/site-url";
import Cursor from "@/components/motion/Cursor";
import MotionProvider from "@/components/motion/MotionProvider";
import Preloader from "@/components/motion/Preloader";
import RouteTransition from "@/components/motion/RouteTransition";
import SectionMotion from "@/components/motion/SectionMotion";
import WebGLMount from "@/components/webgl/WebGLMount";
import WebGLErrorBoundary from "@/components/webgl/WebGLErrorBoundary";
import "@/styles/globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_TITLE = `${site.name} · ${site.title}`;

/**
 * Root metadata. Two things here are load-bearing for everything below it:
 *
 * `metadataBase` — without it Next emits RELATIVE og:image / canonical urls,
 * which every social crawler rejects, and warns at build time rather than
 * failing. It resolves from lib/site-url.ts so a custom domain is one env var
 * away rather than a hunt through this file.
 *
 * `title.template` — child routes set a BARE title (`"Panda ERP"`), not a
 * pre-composed one; the suffix is applied here exactly once. `default` is what
 * the home route renders, and the template deliberately does not apply to it,
 * which is why the two are spelled out separately instead of sharing a string.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${site.name}`,
  },
  description: site.tagline,
  applicationName: site.name,
  authors: [{ name: site.name, url: contact.github }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: SITE_TITLE,
    description: site.tagline,
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: site.tagline,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: "#0a0b0d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${geistSans.variable} ${geistMono.variable} bg-ink text-fg antialiased`}
      >
        {/*
         * Parsed before any content below renders.
         *
         * `js`: CSS may only hide reveal targets when JS is confirmed running
         * (eng review F1). No-JS visitors never match `html.js` and always see
         * full content.
         *
         * `preloading`: set here rather than from the Preloader component so
         * SectionMotion sees it deterministically. Both are client components
         * in the same commit, so relying on their effect order would be a
         * race; this class exists before any effect runs. The Preloader always
         * removes it — including under reduced motion, where it never shows.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js','preloading')",
          }}
        />
        <MotionProvider />
        {/*
         * Both persistent across routes: RouteTransition releases the frozen
         * view-transition frame once the new route commits, and SectionMotion
         * re-binds scroll choreography per pathname (it used to be mounted
         * per-page; the root is where it can key off usePathname()).
         */}
        <RouteTransition />
        <SectionMotion />
        {/*
         * Root-mounted so the GL context survives navigation instead of being
         * torn down and rebuilt per route (Phase 5 requirement).
         *
         * WebGLMount, not WebGLBackground: this file is a Server Component, and
         * next/dynamic with ssr:false is illegal in one. WebGLMount is the
         * "use client" gate that decides whether the ~355 kB three.js chunk is
         * fetched at all — on the reduced device tier it never is.
         */}
        <WebGLErrorBoundary>
          <WebGLMount />
        </WebGLErrorBoundary>
        <Cursor />
        {children}
        {/*
         * Production deployments only — deliberately NOT `NODE_ENV`.
         *
         * Both scripts are served by Vercel's edge at `/_vercel/insights/*` and
         * `/_vercel/speed-insights/*`, paths that exist only on a Vercel
         * deployment. The e2e suite runs against a real production build via
         * `yarn start` on localhost, so a NODE_ENV gate would leave these
         * mounted there and every run would 404 twice — console noise that a
         * later /qa pass has to triage and dismiss, on a build where the data
         * goes nowhere anyway.
         *
         * Gating on VERCEL_ENV also keeps preview deployments out of the
         * production dataset, so a shared preview link cannot skew the numbers.
         */}
        {process.env.VERCEL_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
        {/* Last in the DOM: it covers everything above it while a cold load resolves. */}
        <Preloader />
      </body>
    </html>
  );
}
