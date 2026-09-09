/**
 * Guards the `--spacing-*` theme namespace against utility-name collisions.
 *
 *   node scripts/check-theme-tokens.mjs
 *
 * WHY THIS EXISTS
 *
 * Tailwind v4.3 generates logical-size utilities from the `--spacing` and
 * `--container` namespaces: `inline-<key>` -> inline-size and `block-<key>` ->
 * block-size. Four display utilities are STATIC names of exactly that shape —
 * `inline-block`, `inline-flex`, `inline-grid`, `inline-table` — so a spacing
 * key named `block`, `flex`, `grid` or `table` makes Tailwind emit two rules
 * with the same selector:
 *
 *   .inline-block { display: inline-block }   <- the display utility
 *   .inline-block { inline-size: <the token> } <- the generated size utility
 *
 * Both apply. The size rule is emitted later in the compiled sheet, so it wins,
 * and every element in the codebase using that class silently gets a width it
 * never asked for. `--spacing-block` shipped in this repo and did exactly that:
 * the three contact pills, the 404 back-link and Magnetic's wrapper span were
 * all clamped to 75px at 1440px, overflowing their own borders. Nothing failed
 * loudly — no build warning, no console error, no failing test. It was found by
 * measuring boxes in a browser.
 *
 * This check is cheap and runs before the build so the next one fails loudly.
 *
 * SCOPE: it checks the collision that actually exists today. It is not a
 * general proof that a key is safe against every future Tailwind utility — if
 * Tailwind adds new static utilities of the form `<size-prefix>-<word>`, this
 * list needs extending. e2e/contact-pills.spec.ts is the backstop that catches
 * the symptom regardless of cause.
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CSS_PATH = path.join(process.cwd(), "styles", "globals.css");

/*
 * Static Tailwind display utilities whose names collide with a generated
 * `inline-<key>` size utility. Derived from tailwindcss/dist/lib.js — the
 * display utilities are `inline-block`, `inline-flex`, `inline-grid` and
 * `inline-table`, so the forbidden keys are their suffixes.
 */
const FORBIDDEN_SPACING_KEYS = new Set(["block", "flex", "grid", "table"]);

/** Namespaces that feed Tailwind's `inline-*` / `block-*` size utilities. */
const GUARDED_NAMESPACES = ["spacing", "container"];

const css = await fs.readFile(CSS_PATH, "utf8");

const failures = [];
for (const namespace of GUARDED_NAMESPACES) {
  const pattern = new RegExp(`^\\s*--${namespace}-([a-z0-9-]+)\\s*:`, "gim");
  for (const match of css.matchAll(pattern)) {
    const key = match[1];
    if (!FORBIDDEN_SPACING_KEYS.has(key)) continue;
    failures.push(
      `  --${namespace}-${key}  collides with the display utility \`inline-${key}\`.\n` +
        `      Tailwind emits \`.inline-${key} { inline-size: var(--${namespace}-${key}) }\`, which\n` +
        `      overrides \`display: inline-${key}\`'s element width everywhere it is used.\n` +
        `      Rename the key (e.g. --${namespace}-stack) and update its call sites.`,
    );
  }
}

if (failures.length > 0) {
  console.error(
    `\nstyles/globals.css declares ${failures.length} colliding theme ` +
      `token${failures.length === 1 ? "" : "s"}:\n\n${failures.join("\n\n")}\n`,
  );
  process.exit(1);
}

console.log(
  `theme tokens OK — no --{${GUARDED_NAMESPACES.join(",")}}-* key collides with a display utility`,
);
