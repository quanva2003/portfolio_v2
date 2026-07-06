"use client";

import { useState } from "react";

const EASES = [
  { name: "ease-out-expo", varName: "--ease-out-expo", note: "exits, fades, default UI" },
  { name: "ease-spring-snap", varName: "--ease-spring-snap", note: "feedback, cursor, magnetics" },
  { name: "ease-spring-soft", varName: "--ease-spring-soft", note: "reveals, panels, media" },
  { name: "ease-spring-bounce", varName: "--ease-spring-bounce", note: "accents, one per view" },
] as const;

const DURATIONS = [
  { name: "dur-fast", varName: "--dur-fast", label: "150ms" },
  { name: "dur-base", varName: "--dur-base", label: "300ms" },
  { name: "dur-gentle", varName: "--dur-gentle", label: "500ms" },
  { name: "dur-slow", varName: "--dur-slow", label: "700ms" },
  { name: "dur-reveal", varName: "--dur-reveal", label: "1000ms" },
] as const;

export default function MotionDemos() {
  const [played, setPlayed] = useState(false);

  return (
    <div className="gap-block flex flex-col">
      {/* easing comparison */}
      <div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 className="text-title">Easing</h3>
          <button
            type="button"
            onClick={() => setPlayed((p) => !p)}
            className="rounded-pill border-line text-small text-fg hover:border-fg-muted hover:bg-raised border px-5 py-2 transition-colors duration-(--dur-fast) active:scale-[0.98]"
          >
            {played ? "Reset" : "Play"}
          </button>
        </div>
        <ul className="flex flex-col gap-5">
          {EASES.map((e) => (
            <li key={e.name}>
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <code className="text-small text-fg font-mono">{e.name}</code>
                <span className="text-small text-fg-muted">{e.note}</span>
              </div>
              <div className="border-line [container-type:inline-size] relative h-8 border-y">
                <div
                  className="bg-ember absolute top-1 left-0 h-6 w-6 will-change-transform"
                  style={{
                    transform: played ? "translateX(calc(100cqw - 100%))" : "translateX(0)",
                    transition: `transform var(--dur-slow) var(${e.varName})`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* duration scale */}
      <div>
        <h3 className="text-title mb-6">Duration</h3>
        <ul className="flex flex-col gap-4">
          {DURATIONS.map((d) => (
            <li key={d.name} className="grid grid-cols-[10rem_1fr_4rem] items-center gap-4">
              <code className="text-small text-fg font-mono">{d.name}</code>
              <div className="bg-raised h-2">
                <div
                  className="bg-fg h-full origin-left will-change-transform"
                  style={{
                    transform: played ? "scaleX(1)" : "scaleX(0)",
                    transition: `transform var(${d.varName}) var(--ease-out-expo)`,
                  }}
                />
              </div>
              <span className="text-small text-fg-muted text-right font-mono">{d.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* tactile states */}
      <div>
        <h3 className="text-title mb-2">Tactile feedback</h3>
        <p className="text-body text-fg-muted mb-6 max-w-[55ch]">
          Interactive elements lift on hover with a spring and compress on press. Hover and hold the
          card to feel the difference between snap and bounce.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border-line bg-surface ease-spring-snap border p-8 transition-transform duration-(--dur-gentle) hover:-translate-y-1 active:scale-[0.98]">
            <code className="text-small text-fg font-mono">spring-snap</code>
            <p className="text-small text-fg-muted mt-1">settles in ~460ms, no overshoot</p>
          </div>
          <div className="border-line bg-surface ease-spring-bounce border p-8 transition-transform duration-(--dur-reveal) hover:-translate-y-1 active:scale-[0.98]">
            <code className="text-small text-fg font-mono">spring-bounce</code>
            <p className="text-small text-fg-muted mt-1">settles in ~860ms, visible overshoot</p>
          </div>
        </div>
      </div>
    </div>
  );
}
