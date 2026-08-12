"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { NAVIGATION_TIMEOUT_MS, canViewTransition } from "@/lib/transition";

/*
 * Native View Transitions API, driven around an App Router navigation.
 *
 * Why not Next 15's `experimental.viewTransition` + React's
 * <unstable_ViewTransition>: that flag puts the build into Next's
 * "needs experimental React" mode (next/dist/lib/needs-experimental-react.js),
 * i.e. it requires the react@experimental channel. react 19.1.0 — what this
 * project is pinned to — doesn't export unstable_ViewTransition at all. The
 * plan's own instruction was to prefer the Next API and fall back "if
 * unstable"; shipping a portfolio on React's experimental channel is exactly
 * that instability, so we drive the browser API directly instead. Same
 * shared-element morph, stable React.
 *
 * The mechanic document.startViewTransition needs is a promise that resolves
 * once the new DOM is in place. router.push() gives us no such signal, so the
 * resolver is parked at module scope and released here, from the root layout,
 * when usePathname() reports the new route. It has to live outside the link:
 * the link that started the navigation is usually unmounted by the time the
 * new route commits.
 *
 * useLayoutEffect, not useEffect: layout effects run after the commit's DOM
 * mutations but before paint, which is precisely when the browser should be
 * allowed to capture the new state.
 */

type PendingNavigation = { pathname: string; resolve: () => void; timer: number };

let pending: PendingNavigation | null = null;

/** Releases the frozen old frame. Safe to call more than once. */
function settle() {
  if (!pending) return;
  const { resolve, timer } = pending;
  pending = null;
  window.clearTimeout(timer);
  resolve();
}

/**
 * Navigates with a shared-element morph where the browser supports one, and
 * plainly everywhere else (older browsers, reduced motion).
 */
export function navigateWithTransition(href: string, push: (href: string) => void): void {
  if (!canViewTransition()) {
    push(href);
    return;
  }

  // Never leave a previous navigation's promise dangling — a fast double
  // click would otherwise strand the first transition on a stale snapshot
  // until its timeout fired.
  settle();

  document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        pending = {
          pathname: new URL(href, window.location.href).pathname,
          resolve,
          timer: window.setTimeout(settle, NAVIGATION_TIMEOUT_MS),
        };
        push(href);
      }),
  );
}

/** Mounted once in the root layout; renders nothing. */
export default function RouteTransition() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pending?.pathname === pathname) settle();
  }, [pathname]);

  return null;
}
