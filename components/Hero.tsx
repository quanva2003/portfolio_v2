import { site } from "@/content";

export default function Hero() {
  return (
    <section className="pb-block flex min-h-dvh w-full flex-col justify-end gap-6">
      <p className="text-micro text-fg-muted font-mono uppercase">{site.location}</p>
      <h1 className="font-display text-display-xl uppercase">{site.name}</h1>
      <div className="flex flex-col gap-2">
        <p className="text-title text-fg">{site.title}</p>
        <p className="text-lead text-fg-muted max-w-[45ch]">{site.tagline}</p>
      </div>
    </section>
  );
}
