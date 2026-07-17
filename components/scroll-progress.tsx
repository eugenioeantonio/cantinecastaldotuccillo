"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** A single gold thread tracing the reader's descent through the story. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[95] h-[2px] origin-left bg-gradient-to-r from-bordeaux to-gold shadow-[0_0_12px_rgba(168,138,86,0.4)]"
    />
  );
}
