import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { site } from "@/content";
import Cursor from "@/components/motion/Cursor";
import MotionProvider from "@/components/motion/MotionProvider";
import Preloader from "@/components/motion/Preloader";
import RouteTransition from "@/components/motion/RouteTransition";
import SectionMotion from "@/components/motion/SectionMotion";
import WebGLBackground from "@/components/webgl/WebGLBackground";
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

export const metadata: Metadata = {
  title: `${site.name} · ${site.title}`,
  description: site.tagline,
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
         */}
        <WebGLErrorBoundary>
          <WebGLBackground />
        </WebGLErrorBoundary>
        <Cursor />
        {children}
        {/* Last in the DOM: it covers everything above it while a cold load resolves. */}
        <Preloader />
      </body>
    </html>
  );
}
