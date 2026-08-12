import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { site } from "@/content";
import Cursor from "@/components/motion/Cursor";
import MotionProvider from "@/components/motion/MotionProvider";
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
         * js-flag, parsed before any content below renders: CSS may only
         * hide reveal targets when JS is confirmed running (eng review F1).
         * No-JS visitors never match `html.js` and always see full content.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <MotionProvider />
        <WebGLErrorBoundary>
          <WebGLBackground />
        </WebGLErrorBoundary>
        <Cursor />
        {children}
      </body>
    </html>
  );
}
