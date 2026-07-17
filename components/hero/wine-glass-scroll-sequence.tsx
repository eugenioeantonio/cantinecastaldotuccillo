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
  const logoOpacity = useTransform(scrollYProgress, [0.05, 0.18], [1, 0]);
  const logoY = useTransform(scrollYProgress, [0.05, 0.2], [0, -20]);
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

        {/* Wordmark — unchanged */}
        <motion.div
          style={{ opacity: reduced ? 1 : logoOpacity, y: reduced ? 0 : logoY }}
          className="absolute inset-x-0 top-[15vh] z-[8] text-center"
        >
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.1, ease: easeSilk }}
          >
            <div className="font-serif text-[clamp(16px,2vw,20px)] tracking-[0.5em] [text-indent:0.5em]">
              CASTALDO&nbsp;TUCCILLO
            </div>
            <div className="mt-2 text-[9px] tracking-[0.46em] text-stone">
              CINQUE GENERAZIONI · SAN GENNARO VESUVIANO
            </div>
          </motion.div>
        </motion.div>

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
            <div className="eyebrow mb-5">{brand.tagline}</div>
            <h1 className="font-serif text-[clamp(38px,7vw,86px)] font-medium leading-[1.02]">
              Il tempo <em className="italic text-stone">diventa</em> vino.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[clamp(13px,1.4vw,16px)] font-light tracking-[0.05em] text-ivory/70">
              {brand.place}, una storia iniziata cinque generazioni fa.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="#cantina"
                className="group relative overflow-hidden rounded-full bg-ivory px-8 py-4 text-xs uppercase tracking-[0.18em] text-wine-dark transition-[transform,box-shadow] duration-500 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(168,138,86,0.5)]"
              >
                <span className="relative z-10">Scopri la nostra storia</span>
                <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-[left] duration-700 group-hover:left-[130%]" />
              </a>
              <a
                href="#vini"
                className="rounded-full border border-ivory/40 px-8 py-4 text-xs uppercase tracking-[0.18em] text-ivory transition-[transform,color,border-color] duration-500 hover:-translate-y-0.5 hover:border-gold hover:text-gold"
              >
                Esplora i vini
              </a>
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
            <span className="mx-auto mt-3 block h-4 w-4 rotate-45 border-b border-r border-gold [animation:bob_2s_ease-in-out_infinite]" />
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
