"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { territory } from "@/lib/content";
import { PHOTO_SLOTS } from "@/lib/photo-slots";
import { scrollMap } from "@/lib/motion";
import { SplitText } from "@/components/primitives/split-text";
import { PhotoPlate } from "@/components/primitives/photo-plate";

/** Abstract contour rings — the shape of a volcano, not a survey. */
const RINGS = Array.from({ length: 9 }, (_, i) => {
  const r = 70 + i * 46;
  const wob = (k: number) => Math.sin(k * 1.7 + i * 0.9) * (6 + i * 2.2);
  const pts = Array.from({ length: 48 }, (_, k) => {
    const a = (k / 48) * Math.PI * 2;
    const rr = r + wob(k) * 0.6 + Math.sin(a * 3 + i) * (4 + i);
    return `${(500 + Math.cos(a) * rr * 1.25).toFixed(1)},${(520 + Math.sin(a) * rr * 0.62).toFixed(1)}`;
  });
  return `M${pts.join(" L")} Z`;
});

/**
 * The ground the wine comes from. Black lava material, contour lines drawn
 * as you arrive, and the one photograph that matters: the rows under the
 * volcano.
 */
export function Territory() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const draw = useTransform(scrollYProgress, scrollMap([0.08, 0.55], [0, 1]));
  const drift = useTransform(scrollYProgress, scrollMap([0, 1], [40, -40]));

  return (
    <section
      id="territorio"
      ref={ref}
      aria-labelledby="territorio-title"
      className="lava relative overflow-hidden px-6 py-[18vh] sm:px-[clamp(24px,7vw,120px)]"
    >
      <motion.svg
        aria-hidden
        viewBox="0 0 1000 1040"
        preserveAspectRatio="xMidYMid slice"
        style={{ y: reduced ? 0 : drift }}
        className="pointer-events-none absolute inset-x-0 top-[6%] h-[110%] w-full opacity-60"
      >
        {RINGS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={i === 0 ? "rgba(122,21,38,0.55)" : "rgba(168,138,86,0.14)"}
            strokeWidth={i === 0 ? 1.2 : 0.8}
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: reduced ? 1 : draw }}
          />
        ))}
      </motion.svg>

      {/* the stone darkens into the cellar of the next scene */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[24vh] bg-gradient-to-b from-transparent to-[#0b0609]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-gold/15 pb-5 text-[11px] uppercase tracking-[0.28em] text-stone/60">
          <span>{territory.place}</span>
          <span>{territory.coordinates}</span>
          <span>{territory.summit}</span>
        </div>

        <h2
          id="territorio-title"
          className="mt-[10vh] max-w-[12ch] font-serif text-[clamp(48px,8.4vw,132px)] font-medium leading-[0.94] tracking-[-0.015em] text-ivory"
        >
          <SplitText text="Ai piedi" by="word" />
          <br />
          <SplitText text="del Vesuvio." by="word" className="italic text-stone" delay={0.2} />
        </h2>

        <div className="mt-[10vh] md:ml-[16%]">
          <PhotoPlate slot={PHOTO_SLOTS["territory-vineyard"]} sizes="(max-width: 768px) 100vw, 75vw" />
        </div>
      </div>
    </section>
  );
}
