import { skills, ui } from "@/content";

export default function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="border-line py-section border-t"
    >
      <h2 id="skills-heading" className="font-display text-display uppercase">
        {ui.sections.skills}
      </h2>
      <div className="mt-block grid gap-x-8 gap-y-10 sm:grid-cols-2">
        {skills.map((group) => (
          <div key={group.label}>
            <h3 className="text-small text-fg-muted">{group.label}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="border-line text-small text-fg rounded-none border px-3 py-1.5"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
