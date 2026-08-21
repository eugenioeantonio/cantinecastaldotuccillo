"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { brand } from "@/lib/content";
import { easeSilk } from "@/lib/motion";
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
  const copyOpacity = useTransform(scrollYProgress, [0.14, 0.3], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0.14, 0.3], [0, 30]);
  const hintOpacity = useTransform(scrollYProgress, [0.02, 0.1], [1, 0]);
  const revealOpacity = useTransform(scrollYProgress, [0.72, 0.92], [0, 1]);
  const revealY = useTransform(scrollYProgress, [0.72, 0.92], [24, 0]);

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

        {/* Legibility scrim */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_35%,transparent_35%,rgba(6,3,6,0.55)_100%)]" />

        {/* Upper area intentionally left clear: the glass is the only subject.
            Branding lives once, in the header logo. */}

        {/* Copy + CTA — unchanged */}
        <motion.div
          style={{ opacity: reduced ? 1 : copyOpacity, y: reduced ? 0 : copyY }}
          className="absolute inset-x-0 bottom-[14vh] z-[8] px-6 text-center"
        >
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.3, ease: easeSilk }}
          >
            <h1 className="font-serif text-[clamp(38px,7vw,86px)] font-medium leading-[1.02]">
              Il tempo <em className="italic text-stone">diventa</em> vino.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[clamp(13px,1.4vw,16px)] font-light tracking-[0.05em] text-ivory/70">
              {brand.place}, una storia iniziata cinque generazioni fa.
            </p>
            <div className="mt-8 flex justify-center">
              {/* Frosted-glass CTA: a small pane of satin glass over the wine */}
              <motion.a
                href="#vini"
                whileHover={reduced ? undefined : { scale: 1.02 }}
                whileTap={reduced ? undefined : { scale: 0.985 }}
                transition={{ duration: 0.4, ease: easeSilk }}
                className="group relative overflow-hidden rounded-full border border-ivory/30 bg-ivory/[0.12] px-8 py-4 text-xs uppercase tracking-[0.18em] text-ivory shadow-[0_10px_36px_-14px_rgba(0,0,0,0.75)] backdrop-blur-md backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-500 hover:border-ivory/55 hover:bg-ivory/20 hover:shadow-[0_12px_40px_-14px_rgba(0,0,0,0.8)] active:bg-ivory/25"
              >
                <span className="relative z-10 [text-shadow:0_1px_6px_rgba(0,0,0,0.45)]">
                  Esplora i vini
                </span>
                {/* soft sheen along the upper edge */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/25 via-white/[0.04] to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                />
              </motion.a>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        {!reduced && (
          <motion.div
            style={{ opacity: hintOpacity }}
            className="absolute inset-x-0 bottom-8 z-[8] text-center"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-ivory/60">
              Scorri per entrare nella nostra storia
            </span>
            {/* A hairline chevron that unmistakably points down */}
            <motion.span
              aria-hidden
              className="mx-auto mt-3 block w-fit text-gold"
              animate={{ y: [0, 5, 0], opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
            >
              <svg width="20" height="11" viewBox="0 0 20 11" fill="none">
                <path
                  d="M1 1.2 L10 9.4 L19 1.2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          </motion.div>
        )}

        {/* End reveal, over the wine as it fills the screen */}
        {!reduced && (
          <motion.div
            style={{ opacity: revealOpacity, y: revealY }}
            className="absolute inset-0 z-[10] flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="eyebrow mb-4">La nostra storia</div>
            <h2 className="font-serif text-[clamp(34px,6vw,74px)] font-medium leading-[1.05]">
              Cinque generazioni,
              <br />
              <em className="italic text-stone">una sola visione.</em>
            </h2>
          </motion.div>
        )}

        {debug && <SequenceDebug debugRef={debugRef} />}
      </div>
    </section>
  );
}
