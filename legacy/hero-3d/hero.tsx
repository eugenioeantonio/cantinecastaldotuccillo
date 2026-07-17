"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  useInView,
} from "motion/react";
import { brand } from "@/lib/content";
import { easeSilk } from "@/lib/motion";
import { HeroFrames, framePath, FRAME_SEQ } from "./hero-frames";

// WebGL only on the client
const WineGlass3D = dynamic(
  () => import("./wine-glass-3d").then((m) => m.WineGlass3D),
  { ssr: false },
);

type Mode = "loading" | "frames" | "3d";

export function Hero() {
  const wrap = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>("loading");
  const [mounted, setMounted] = useState(false);
  const heroInView = useInView(wrap, { amount: 0 });

  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
  });

  // Feature-detect the photoreal frame sequence; fall back to real-time 3D.
  useEffect(() => {
    setMounted(true);
    const isMobile = window.matchMedia("(max-width:768px)").matches;
    const cfg = isMobile ? FRAME_SEQ.mobile : FRAME_SEQ.desktop;
    const probe = new Image();
    let decided = false;
    const decide = (m: Mode) => {
      if (!decided) {
        decided = true;
        setMode(m);
      }
    };
    probe.onload = () => decide("frames");
    probe.onerror = () => decide("3d");
    probe.src = framePath(cfg.dir, 0, cfg.pad);
    const t = setTimeout(() => decide("3d"), 1600);
    return () => clearTimeout(t);
  }, []);

  // ---- Overlay choreography (scroll-driven) ----
  const logoOpacity = useTransform(scrollYProgress, [0.05, 0.18], [1, 0]);
  const logoY = useTransform(scrollYProgress, [0.05, 0.2], [0, -20]);
  const copyOpacity = useTransform(scrollYProgress, [0.14, 0.3], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0.14, 0.3], [0, 30]);
  const hintOpacity = useTransform(scrollYProgress, [0.02, 0.1], [1, 0]);
  const floodHeight = useTransform(scrollYProgress, [0.62, 0.98], ["0vh", "118vh"]);
  const floodOpacity = useTransform(scrollYProgress, [0.6, 0.66], [0, 1]);
  const revealOpacity = useTransform(scrollYProgress, [0.78, 0.98], [0, 1]);
  const revealY = useTransform(scrollYProgress, [0.78, 0.98], [30, 0]);

  return (
    <section
      id="top"
      ref={wrap}
      aria-label="Introduzione — Il tempo diventa vino"
      className="relative"
      style={{ height: reduced ? "100vh" : "520vh" }}
    >
      <div className="grain vignette sticky top-0 h-screen w-full overflow-hidden bg-[radial-gradient(120%_90%_at_50%_30%,#16090e_0%,#0a0508_52%,#060306_100%)]">
        {/* Stage — glass */}
        <div className="absolute inset-0 z-[1]">
          {mounted && mode === "3d" && (
            <WineGlass3D progress={progressRef} active={heroInView} />
          )}
          {mounted && mode === "frames" && <HeroFrames progress={scrollYProgress} />}
        </div>

        {mode === "loading" && (
          <div className="absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.3em] text-stone/50">
            il calice prende forma…
          </div>
        )}

        {/* Wordmark */}
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

        {/* Copy + CTA */}
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

        {/* Flood transition into the story */}
        {!reduced && (
          <motion.div
            style={{ height: floodHeight, opacity: floodOpacity }}
            className="absolute inset-x-0 bottom-0 z-[9] bg-gradient-to-b from-wine via-bordeaux to-wine-dark"
          >
            <svg
              className="absolute -top-14 left-0 block h-14 w-full"
              viewBox="0 0 1440 60"
              preserveAspectRatio="none"
            >
              <path
                d="M0,40 C240,4 480,4 720,30 C960,56 1200,56 1440,26 L1440,60 L0,60 Z"
                fill="#5a1122"
              />
            </svg>
          </motion.div>
        )}

        {/* Reveal line as the flood covers the screen */}
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
      </div>
    </section>
  );
}
