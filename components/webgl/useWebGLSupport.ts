"use client";

import { useState } from "react";

export type WebGLStatus = "available" | "unavailable" | "lost";

/**
 * Cheap capability probe. Exported because components/webgl/WebGLMount.tsx has
 * to answer "is WebGL available?" BEFORE it decides whether to import the
 * three.js chunk — asking from inside that chunk would defeat the split.
 */
export function probeWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Live status of the real GL context, once one exists.
 *
 * Starts at "available" rather than probing again: this hook is only reachable
 * from inside the dynamically-imported WebGL chunk, and WebGLMount already
 * required probeWebGL() to pass before importing it. The former "checking"
 * state existed because the component was statically imported and rendered
 * during SSR; it is now client-only by construction, so re-probing would just
 * cost a wasted render pass before the canvas could mount.
 *
 * Pushed to "lost"/back to "available" by WebGLBackground's onContextLost /
 * onContextRestored handlers.
 */
export function useWebGLSupport() {
  const [status, setStatus] = useState<WebGLStatus>("available");
  return { status, setStatus };
}
