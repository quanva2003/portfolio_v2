import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { site } from "@/content";
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
        {children}
      </body>
    </html>
  );
}
