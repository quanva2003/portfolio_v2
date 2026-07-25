"use client";

import { useEffect, useState } from "react";

export type WebGLStatus = "checking" | "available" | "unavailable" | "lost";

function probeWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Whether the WebGL canvas should be shown at all. Starts "checking" (the
 * real probe only runs client-side, after mount, so SSR never claims support
 * it can't verify), settles to "available"/"unavailable", and can be pushed
 * to "lost"/back to "available" by WebGLBackground's onContextLost/
 * onContextRestored handlers once the real Three.js context exists.
 */
export function useWebGLSupport() {
  const [status, setStatus] = useState<WebGLStatus>("checking");

  useEffect(() => {
    setStatus(probeWebGL() ? "available" : "unavailable");
  }, []);

  return { status, setStatus };
}
