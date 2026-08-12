/**
 * Single shared window pointermove listener. Cursor.tsx and the WebGL layer
 * both read from this instead of running independent listeners (eng review
 * Phase 4, issue 2). Ref-counted: the listener attaches on the first
 * subscriber and detaches after the last, so it's a module-level singleton
 * independent of either consumer's own mount/unmount order.
 */

export type PointerPosition = { x: number; y: number };

const position: PointerPosition = { x: 0, y: 0 };
const listeners = new Set<(pos: PointerPosition) => void>();
let attached = false;

function onMove(event: PointerEvent) {
  position.x = event.clientX;
  position.y = event.clientY;
  for (const listener of listeners) listener(position);
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

/** Notified on every pointermove while subscribed. Returns the unsubscribe function. */
export function subscribePointer(listener: (pos: PointerPosition) => void): () => void {
  listeners.add(listener);
  if (!attached) {
    window.addEventListener("pointermove", onMove, { passive: true });
    attached = true;
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && attached) {
      window.removeEventListener("pointermove", onMove);
      attached = false;
    }
  };
}
