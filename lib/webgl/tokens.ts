/**
 * WebGL shader tokens, mirroring lib/motion.ts's convention: named constants
 * so tuning (Step 3's falloff, Step 5's bloom curve) means editing a value
 * here, never an inline literal inside a shader component.
 */

/** Fraction of the remaining distance uMouse closes toward the raw pointer each ticker tick. */
export const pointerLerp = 0.08;

export const displacement = {
  /** radius of cursor influence, in the plane's local unit space */
  falloffRadius: 0.35,
  /** max vertex displacement amount */
  strength: 0.12,
} as const;

export const particleField = {
  count: 800,
  size: 0.02,
  /** base drift speed, independent of pointer velocity */
  speed: 0.4,
  /** how strongly pointer velocity pushes particles */
  velocityInfluence: 0.6,
} as const;

/** Clamp devicePixelRatio so a 3x phone doesn't render 3x the fragment work. */
export const dprRange: [number, number] = [1, 2];

export const bloom = {
  baseIntensity: 0.15,
  peakIntensity: 0.5,
  /** distance (same unit space as displacement.falloffRadius) at which bloom reaches peak */
  proximityRadius: 0.15,
} as const;
