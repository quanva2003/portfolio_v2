import { ui } from "@/content";
import About from "@/components/About";
import ContactFooter from "@/components/ContactFooter";
import Experience from "@/components/Experience";
import Hero from "@/components/Hero";
import SelectedWork from "@/components/SelectedWork";
import SiteHeader from "@/components/SiteHeader";
import Skills from "@/components/Skills";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="rounded-pill bg-ember text-small text-ink fixed top-4 left-4 z-50 -translate-y-24 px-5 py-2.5 font-medium transition-transform duration-(--dur-fast) focus-visible:translate-y-0"
      >
        {ui.skipToContent}
      </a>
      {/*
       * Reserved layer for the Phase 4 WebGL canvas. Fixed positioning takes
       * no layout space, so mounting the canvas here later causes zero CLS.
       */}
      <div id="webgl-layer" aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" />
      <SiteHeader />
      <main id="main" className="max-w-page px-gutter mx-auto w-full">
        <Hero />
        <About />
        <SelectedWork />
        <Experience />
        <Skills />
      </main>
      <ContactFooter />
    </>
  );
}
