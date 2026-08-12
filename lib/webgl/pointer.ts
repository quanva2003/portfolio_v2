/**
 * Single shared window pointermove listener. Cursor.tsx and the WebGL layer
 * both read from this instead of running independent listeners (eng review
 * Phase 4, issue 2). Module-level singleton: the raw listener attaches once
 * at load and stays for the page's lifetime, independent of either
 * consumer's own mount/unmount order -- WebGLBackground/DisplacementPlane/
 * ParticleField only ever POLL getPointerPosition() (no subscribe call), so
 * a ref-counted attach/detach tied to subscriber count would leave the
 * shared position frozen at (0,0) whenever Cursor.tsx isn't mounted (touch
 * devices, reduced motion) even though the WebGL layer still needs live
 * values there. Attaching unconditionally is simpler and correct for both
 * consumption styles.
 */

export type PointerPosition = { x: number; y: number };

const position: PointerPosition = { x: 0, y: 0 };
const listeners = new Set<(pos: PointerPosition) => void>();

function onMove(event: PointerEvent) {
  position.x = event.clientX;
  position.y = event.clientY;
  for (const listener of listeners) listener(position);
}

if (typeof window !== "undefined") {
  window.addEventListener("pointermove", onMove, { passive: true });
}

/** Latest raw pointer position. Safe to poll once per frame (no re-render). */
export function getPointerPosition(): PointerPosition {
  return position;
}

// Test hook (mirrors window.__lenis / window.__stCount in components/motion/):
// lets e2e specs assert Cursor.tsx and the WebGL layer read the exact same
// position instead of two independently-tracked values.
if (typeof window !== "undefined") {
  (window as Window & { __pointerPosition?: () => PointerPosition }).__pointerPosition =
    getPointerPosition;
}

/** Notified on every pointermove. Returns the unsubscribe function. */
export function subscribePointer(listener: (pos: PointerPosition) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
