"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useScroll, useReducedMotion } from "motion/react";
import { HeroOverlay } from "./hero-overlay";
import { SEQUENCE, posterPath } from "./sequence-config";
import { useFrameSequence } from "./use-frame-sequence";
import { SequenceDebug } from "./sequence-debug";

export function WineGlassScrollSequence() {
  const reduced = useReducedMotion();
  // Debug HUD is a DEVELOPMENT-ONLY tool: opt-in via ?debugWineSequence=true
  // during local dev, and completely unavailable in the production build.
  // SSR-safe read, no setState-in-effect.
  const debug = useSyncExternalStore(
    () => () => {},
    () =>
      process.env.NODE_ENV !== "production" &&
      new URLSearchParams(window.location.search).get("debugWineSequence") ===
        "true",
    () => false,
  );

  const { sectionRef, canvasRef, debugRef } = useFrameSequence(debug);

  // Publish the configurable end color as a CSS var (single source of truth).
  useEffect(() => {
    document.documentElement.style.setProperty("--seq-end", SEQUENCE.endColor);
  }, []);

  // Overlay choreography (scroll-driven, MotionValues → no React re-render).
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-label="Introduzione — Il tempo diventa vino"
      className="relative"
      style={{ height: reduced ? "100svh" : `${SEQUENCE.stickyVh}vh` }}
    >
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{ background: "var(--seq-end, #25070D)" }}
      >
        {/* The cinematic frame sequence (decorative) */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />
        {/* No-JS / LCP poster */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterPath(SEQUENCE.desktop)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </noscript>

        <HeroOverlay progress={scrollYProgress} reduced={!!reduced} />

        {debug && <SequenceDebug debugRef={debugRef} />}
      </div>
    </section>
  );
}
