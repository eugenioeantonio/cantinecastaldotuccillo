/**
 * The single "movement system" for the whole site.
 * Every section breathes with the same rhythm: slow, silky, cinematic.
 */
import type { Variants, Transition } from "motion/react";

/** Signature easings. */
export const easeSilk = [0.16, 1, 0.3, 1] as const; // primary — soft, decisive
export const easeWine = [0.65, 0, 0.35, 1] as const; // symmetric, for crossfades

export const durations = {
  fast: 0.6,
  base: 0.9,
  slow: 1.2,
  cinematic: 1.5,
} as const;

export const transition = {
  base: { duration: durations.base, ease: easeSilk } as Transition,
  slow: { duration: durations.slow, ease: easeSilk } as Transition,
};

/** Fade + blur + rise. The house reveal, used everywhere. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 42, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: durations.slow, ease: easeSilk },
  },
};

/** Same, but shorter travel — for inline/secondary elements. */
export const riseSoft: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: durations.base, ease: easeSilk },
  },
};

/** Stagger container — children reveal in a slow cascade. */
export const stagger = (staggerChildren = 0.09, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

/** Per-line/word clip reveal for display headings. */
export const lineReveal: Variants = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: durations.slow, ease: easeSilk },
  },
};

/**
 * Clamped linear map for scroll-linked values, passed to useTransform as a
 * function. Motion hands the array form (`useTransform(p, [a, b], [c, d])`)
 * of a targeted useScroll to the browser's native ViewTimeline, which
 * mis-maps tall sticky sections (copy reappearing late in the hero). The
 * function form keeps the value on Motion's JS scroll measurement.
 */
export const scrollMap =
  ([inA, inB]: readonly [number, number], [outA, outB]: readonly [number, number]) =>
  (v: number) => {
    const t = Math.min(1, Math.max(0, (v - inA) / (inB - inA)));
    return outA + (outB - outA) * t;
  };

/** Standard viewport trigger used with whileInView. */
export const inViewOnce = { once: true, margin: "-12% 0px -12% 0px" } as const;
