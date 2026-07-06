import { site } from "@/content";

export default function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm tracking-widest uppercase opacity-50">{site.location}</p>
      <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">{site.name}</h1>
      <h2 className="text-xl opacity-80 sm:text-2xl">{site.title}</h2>
      <p className="max-w-md text-sm opacity-50">{site.tagline}</p>
    </section>
  );
}
