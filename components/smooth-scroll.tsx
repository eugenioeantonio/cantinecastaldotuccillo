"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";

/** Expose the instance for anchor nav + debugging, and keep Motion's
 *  scroll listeners in sync with Lenis' virtual scroll. */
function LenisBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).lenis = lenis;
  }, [lenis]);
  return null;
}

/**
 * Silky, weighted smooth-scroll — the "camera dolly" of the whole page.
 * Disabled entirely when the user prefers reduced motion (native scroll).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        wheelMultiplier: 0.9,
        smoothWheel: true,
        touchMultiplier: 1.2,
        anchors: true,
      }}
    >
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
