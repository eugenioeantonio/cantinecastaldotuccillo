"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { easeSilk } from "@/lib/motion";
import { HERO_RENDERER, SEQUENCE, posterPath } from "@/components/hero/sequence-config";
import { pourAssets } from "@/components/hero/pour/renderer";

/** Official brand mark (intrinsic size of public/brand/logo.png). */
const LOGO = { src: "/brand/logo.png", width: 370, height: 384 } as const;

/** Shown only as long as the critical assets really need. */
const MIN_VISIBLE_MS = 300; // no blink when the page is already warm
const MAX_WAIT_MS = 8000; // a stalled asset must never trap the visitor

/**
 * Premium loading curtain: the brand mark breathing over the hero's own
 * carbon black. Its lifetime is driven by the *actual* critical assets of
 * the first viewport — fonts, logo and the hero's first frame — never by a
 * fixed timer. Everything below the fold keeps lazy-loading behind it.
 */
export function Preloader() {
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    const startedAt = performance.now();

    const image = (src: string) =>
      new Promise<void>((resolve) => {
        const img = document.createElement("img");
        img.onload = () => resolve();
        img.onerror = () => resolve(); // never block on a failed asset
        img.src = src;
      });

    // The hero picks its sequence by viewport; wait for that variant's first frame.
    const variant = window.matchMedia(
      `(max-width: ${SEQUENCE.mobileBreakpoint - 1}px)`,
    ).matches
      ? SEQUENCE.mobile
      : SEQUENCE.desktop;

    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();

    const finish = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      window.setTimeout(() => {
        if (!cancelled) setDone(true);
      }, remaining);
    };

    // The live hero needs its three photographic layers; the fallback its poster.
    const heroAssets =
      HERO_RENDERER === "pour"
        ? pourAssets(variant.dir).map(image)
        : [image(posterPath(variant))];
    Promise.all([fonts, image(LOGO.src), ...heroAssets]).then(finish);
    const safety = window.setTimeout(finish, MAX_WAIT_MS);

    // Hold the page still while the curtain is up.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (done) document.body.style.overflow = "";
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label="Caricamento"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: easeSilk }}
        >
          <motion.div
            // A slow breath: never a spinner, never an app-like pulse.
            animate={
              reduced
                ? undefined
                : { scale: [0.96, 1.04, 0.96], opacity: [0.75, 1, 0.75] }
            }
            transition={
              reduced
                ? undefined
                : {
                    duration: 1.6,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "loop",
                  }
            }
            // On the way out the mark settles back to its true scale.
            exit={{ scale: 1, opacity: 1, transition: { duration: 0.3, ease: easeSilk } }}
          >
            <Image
              src={LOGO.src}
              alt=""
              width={LOGO.width}
              height={LOGO.height}
              priority
              sizes="(max-width: 767px) 128px, 180px"
              className="h-32 w-auto md:h-[180px]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
