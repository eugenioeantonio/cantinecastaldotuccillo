"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { brand, contact, generations } from "@/lib/content";
import { scrollMap } from "@/lib/motion";
import { SplitText } from "@/components/primitives/split-text";
import { Reveal } from "@/components/primitives/reveal";

/** Where the pool's shafts of light fall (x %, length vh, delay). */
const SHAFTS: [number, number, number][] = [
  [9, 62, 0],
  [27, 38, 0.08],
  [46, 74, 0.03],
  [63, 46, 0.12],
  [81, 58, 0.05],
  [94, 30, 0.15],
];

/**
 * The first scene after the pour. It opens on the exact colour the wine
 * left on screen; the light that crossed the pool keeps falling as hairlines,
 * thinning into the family's first words — and, quietly, the family itself.
 */
export function Credo() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section
      id="cantina"
      ref={ref}
      className="relative overflow-hidden px-6 pb-[18vh] pt-[22vh] sm:px-[clamp(24px,7vw,120px)]"
      style={{ background: "linear-gradient(180deg, #25070d 0%, #1c080e 38%, #140a0e 82%, #120a10 100%)" }}
    >
      {SHAFTS.map(([x, len, d], i) => (
        <Shaft key={i} x={x} len={len} delay={d} progress={scrollYProgress} still={!!reduced} />
      ))}

      <div className="relative mx-auto max-w-6xl">
        <p className="mb-[9vh] text-[11px] uppercase tracking-[0.28em] text-stone/60">
          {brand.full} · {contact.city}
        </p>

        <h2 className="max-w-[14ch] font-serif text-[clamp(44px,7.2vw,112px)] font-medium leading-[0.98] tracking-[-0.01em] text-ivory">
          <SplitText text="Non produciamo soltanto vino." by="word" />
        </h2>

        <div className="mt-[8vh] grid gap-10 md:grid-cols-12">
          <Reveal soft className="md:col-span-6 md:col-start-6">
            <p className="font-serif text-[clamp(22px,2.4vw,34px)] font-light leading-[1.4] text-ivory/85 text-balance">
              Custodiamo il tempo, il territorio e il lavoro di chi ci ha preceduto —{" "}
              <em className="italic text-stone">
                una mano dopo l&apos;altra, una vendemmia dopo l&apos;altra.
              </em>
            </p>
          </Reveal>
          {/* the five generations, in a sentence: a note, not a chapter */}
          <Reveal soft className="md:col-span-6 md:col-start-6 lg:col-span-5">
            <p className="border-t border-gold/15 pt-6 text-balance font-serif text-[clamp(19px,1.7vw,23px)] italic leading-snug text-stone">
              Cinque generazioni, una storia di famiglia.
            </p>
            <p className="mt-2 max-w-[44ch] text-[16px] font-light leading-[1.7] text-ivory/60">
              {generations[generations.length - 1].body}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Shaft({
  x,
  len,
  delay,
  progress,
  still,
}: {
  x: number;
  len: number;
  delay: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  still: boolean;
}) {
  const scaleY = useTransform(progress, scrollMap([0.05 + delay, 0.45 + delay], [0, 1]));
  return (
    <motion.span
      aria-hidden
      style={{ left: `${x}%`, height: `${len}vh`, scaleY: still ? 1 : scaleY }}
      className="pointer-events-none absolute top-0 w-px origin-top bg-gradient-to-b from-[#7a1526]/70 via-gold/30 to-transparent"
    />
  );
}
