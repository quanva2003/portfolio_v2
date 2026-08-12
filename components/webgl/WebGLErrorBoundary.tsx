"use client";

import { Component, type ReactNode } from "react";

/**
 * Forcing WebGL context loss (verified via the WEBGL_lose_context debug
 * extension — see e2e/webgl.spec.ts) throws inside three.js/postprocessing
 * internals reacting to the lost context (`getContextAttributes()` returns
 * null while lost; something downstream reads a property off it) — not from
 * anything in this codebase, and outside what the onCreated context-loss
 * listener alone can catch, since the throw happens in a render/lifecycle
 * path React surfaces as a component error. A purely decorative background
 * layer should never be able to take the whole page down with it: catch here
 * and fall back to nothing (same visual result as reduced-motion/no-WebGL).
 */
export default class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
