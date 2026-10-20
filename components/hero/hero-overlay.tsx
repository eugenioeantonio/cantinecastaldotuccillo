"use client";

import Link from "next/link";
import { motion, useTransform, type MotionValue } from "motion/react";
import { brand } from "@/lib/content";
import { easeSilk, scrollMap } from "@/lib/motion";

/** The CTA opens the wines page, the same one the menu's "Vini" opens. */
const MotionLink = motion.create(Link);

/**
 * Everything drawn over the hero's moving image: the claim, the scroll
 * thread and the closing line. Shared by the live pour and the frame
 * sequence fallback, so both tell the story with the same words and timing.
 */
export function HeroOverlay({
  progress,
  reduced,
}: {
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  // Function form on purpose — see scrollMap. Ranges are the original timing.
  const copyOpacity = useTransform(progress, scrollMap([0.14, 0.3], [1, 0]));
  const copyY = useTransform(progress, scrollMap([0.14, 0.3], [0, 30]));
  const cueOpacity = useTransform(progress, scrollMap([0.6, 0.72], [1, 0]));
  const cueFill = useTransform(progress, scrollMap([0, 0.6], [0, 1]));
  const revealOpacity = useTransform(progress, scrollMap([0.72, 0.92], [0, 1]));
  const revealY = useTransform(progress, scrollMap([0.72, 0.92], [24, 0]));

  return (
    <>
      {/* Legibility scrims: a soft vignette, plus a low corner wash where the copy sits */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_35%,transparent_35%,rgba(6,3,6,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(8,4,10,0.7),transparent_45%)] md:bg-[linear-gradient(20deg,rgba(8,4,10,0.75),transparent_42%)]" />

      {/* The glass owns the centre. The claim sits low and to the side,
          like a title card; it never crosses the bowl. */}
      <motion.div
        style={{ opacity: reduced ? 1 : copyOpacity, y: reduced ? 0 : copyY }}
        className="pointer-events-none absolute inset-0 z-[8] flex flex-col justify-end px-6 pb-[23svh] md:px-[clamp(20px,5vw,64px)] md:pb-[12svh]"
      >
        <div className="mx-auto w-full max-w-sm text-center md:mx-0 md:max-w-[34rem] md:text-left">
          <h1 className="font-serif text-[clamp(30px,8.6vw,40px)] font-medium leading-[1.02] md:text-[clamp(44px,4.8vw,76px)] md:leading-[0.98]">
            {/* One line on phones (over the thin stem), two on desktop */}
            {["Il tempo", "diventa vino."].map((line, i) => (
              <span
                key={line}
                className={`inline-block overflow-hidden pb-[0.08em] align-bottom md:block ${
                  i === 1 ? "ml-[0.24em] md:ml-0" : ""
                }`}
              >
                <motion.span
                  className="block"
                  initial={reduced ? false : { y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.2, delay: 1.3 + i * 0.12, ease: easeSilk }}
                >
                  {i === 1 ? (
                    <>
                      <em className="italic text-stone">diventa</em> vino.
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.7, ease: easeSilk }}
            className="mx-auto mt-3 max-w-[19rem] text-[13px] font-light leading-relaxed tracking-[0.04em] text-ivory/70 text-balance md:mx-0 md:mt-6 md:max-w-[26rem] md:text-[15px]"
          >
            {brand.place}, una storia iniziata cinque generazioni fa.
          </motion.p>

          {/* Mobile: pinned below the glass foot. Desktop: under the claim. */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.85, ease: easeSilk }}
            className="pointer-events-auto absolute inset-x-0 bottom-[calc(5svh+env(safe-area-inset-bottom,0px))] flex justify-center md:static md:mt-9 md:justify-start"
          >
            {/* Frosted-glass CTA: a small pane of satin glass over the wine */}
            <MotionLink
              href="/vini"
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
            </MotionLink>
          </motion.div>
        </div>

        {/* Place line, opposite the claim (desktop) */}
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 2, ease: easeSilk }}
          className="absolute bottom-[12svh] right-[clamp(20px,5vw,64px)] hidden text-right text-[11px] uppercase leading-[2] tracking-[0.28em] text-ivory/55 md:block"
        >
          San Gennaro Vesuviano
          <br />
          Quinta generazione
        </motion.p>
      </motion.div>

      {/* Scroll cue: a gold thread that fills as the sequence plays */}
      {!reduced && (
        <motion.div
          aria-hidden
          style={{ opacity: cueOpacity }}
          className="pointer-events-none absolute right-4 top-1/2 z-[8] flex -translate-y-1/2 flex-col items-center gap-4 md:right-[clamp(20px,5vw,64px)] md:top-auto md:bottom-[calc(12svh+80px)] md:translate-y-0"
        >
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-ivory/50 [writing-mode:vertical-rl] md:block">
            Scorri
          </span>
          <span className="relative block h-16 w-px overflow-hidden bg-ivory/15 md:h-20">
            <motion.span
              style={{ scaleY: cueFill }}
              className="absolute inset-0 origin-top bg-gold"
            />
          </span>
        </motion.div>
      )}

      {/* End reveal, over the wine as it fills the screen. It holds no
          control, so it never takes the pointer: invisible at the start, it
          would otherwise sit over "Esplora i vini" and swallow its clicks. */}
      {!reduced && (
        <motion.div
          style={{ opacity: revealOpacity, y: revealY }}
          className="pointer-events-none absolute inset-0 z-[10] flex flex-col items-center justify-center px-6 text-center"
        >
          <h2 className="font-serif text-[clamp(34px,6vw,74px)] font-medium leading-[1.05]">
            Cinque generazioni,
            <br />
            <em className="italic text-stone">una sola visione.</em>
          </h2>
        </motion.div>
      )}

    </>
  );
}
