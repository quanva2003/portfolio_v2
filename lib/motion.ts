/**
 * Motion tokens, JS side. The same physics as the CSS custom properties in
 * styles/globals.css (--dur-*, --ease-*): change one, change both.
 *
 * Springs are expressed as stiffness/damping/mass so GSAP, WAAPI or a future
 * physics helper can consume them directly.
 */

export const durations = {
  fast: 0.15, // hover, focus, tactile press
  base: 0.3, // most UI transitions
  gentle: 0.5, // spring settle, panel moves
  slow: 0.7, // section reveals
  reveal: 1.0, // hero choreography
} as const;

export type SpringConfig = {
  stiffness: number;
  damping: number;
  mass: number;
  /** approximate settle time in seconds, for scheduling around the spring */
  settle: number;
};

export const springs = {
  /** near-critical damping: UI feedback, cursor followers, magnetic pull */
  snap: { stiffness: 260, damping: 30, mass: 1, settle: 0.46 },
  /** soft glide: scroll reveals, panels, media */
  soft: { stiffness: 170, damping: 26, mass: 1, settle: 0.53 },
  /** visible overshoot: accents only, at most one element per view */
  bounce: { stiffness: 300, damping: 16, mass: 1, settle: 0.86 },
} as const satisfies Record<string, SpringConfig>;

/** CSS easing strings, for inline styles or WAAPI */
export const ease = {
  outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOutSoft: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

/** GSAP ease names that match the CSS tokens closest */
export const gsapEase = {
  outExpo: "expo.out",
  inOutSoft: "power2.inOut",
  /** stand-in for springs.bounce until a real physics plugin is wired */
  bounce: "back.out(1.4)",
} as const;
