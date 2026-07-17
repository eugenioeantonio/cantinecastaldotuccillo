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

/** Standard viewport trigger used with whileInView. */
export const inViewOnce = { once: true, margin: "-12% 0px -12% 0px" } as const;
