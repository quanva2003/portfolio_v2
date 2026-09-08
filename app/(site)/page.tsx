import About from "@/components/About";
import Experience from "@/components/Experience";
import Hero from "@/components/Hero";
import SelectedWork from "@/components/SelectedWork";
import Skills from "@/components/Skills";
import StructuredData from "@/components/StructuredData";

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="max-w-page px-gutter mx-auto w-full">
      <Hero />
      <About />
      <SelectedWork />
      <Experience />
      <Skills />
      <StructuredData />
    </main>
  );
}
