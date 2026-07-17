"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { wines } from "@/lib/content";
import { Reveal, RevealGroup, RevealItem } from "@/components/primitives/reveal";
import { SplitText } from "@/components/primitives/split-text";
import { easeSilk } from "@/lib/motion";

export function Wines() {
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <section
      id="vini"
      className="relative overflow-hidden bg-[#120a10] px-6 py-[16vh] sm:px-[clamp(24px,7vw,120px)]"
    >
      <div className="mx-auto mb-[10vh] max-w-4xl text-center">
        <Reveal soft>
          <div className="eyebrow mb-6">Le nostre etichette</div>
        </Reveal>
        <h2 className="font-serif text-[clamp(34px,6vw,72px)] font-medium leading-[1.05] text-ivory">
          <SplitText text="Quattro vini," />
          <br />
          <SplitText text="una sola terra." className="italic text-stone" delay={0.25} />
        </h2>
      </div>

      <div onMouseLeave={() => setActive(null)}>
      <RevealGroup
        className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        gap={0.1}
      >
        {wines.map((w, i) => {
          const dimmed = active !== null && active !== i;
          return (
            <RevealItem key={w.name}>
              <motion.article
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                animate={
                  reduced
                    ? undefined
                    : {
                        opacity: dimmed ? 0.42 : 1,
                        filter: dimmed ? "blur(2px)" : "blur(0px)",
                        y: active === i ? -6 : 0,
                      }
                }
                transition={{ duration: 0.6, ease: easeSilk }}
                className="group relative flex h-[clamp(360px,46vw,460px)] flex-col justify-end overflow-hidden rounded-[2px] border border-gold/12 bg-gradient-to-b from-white/[0.02] to-black/40 p-7 outline-none"
              >
                {/* Liquid level — rises on hover/focus */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 origin-bottom transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-[1.35] group-focus:scale-y-[1.35]"
                  style={{
                    height: "42%",
                    background: `linear-gradient(180deg, transparent, ${w.accent}22 30%, ${w.accent}55)`,
                  }}
                />
                {/* Meniscus hairline */}
                <div
                  className="pointer-events-none absolute inset-x-0 opacity-40 transition-all duration-700 group-hover:opacity-70"
                  style={{ bottom: "42%", height: "1px", background: w.accent }}
                />

                <div className="relative z-10">
                  <div className="mb-3 font-mono text-[10px] tracking-[0.3em] text-gold/70">
                    0{i + 1}
                  </div>
                  <div className="eyebrow eyebrow-stone mb-3 !text-[10px]">{w.kind}</div>
                  <h3 className="font-serif text-[clamp(28px,3vw,38px)] font-medium leading-none text-ivory">
                    {w.name}
                  </h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold/80">
                    {w.grape}
                  </p>
                  <p className="mt-5 max-w-xs text-[13px] font-light leading-[1.7] text-ivory/55">
                    {w.note}
                  </p>
                </div>
              </motion.article>
            </RevealItem>
          );
        })}
      </RevealGroup>
      </div>

      <Reveal soft className="mx-auto mt-[8vh] max-w-2xl text-center">
        <p className="text-sm font-light leading-relaxed text-ivory/50">
          Ogni etichetta è disponibile in cantina e su prenotazione.{" "}
          <a href="#esperienze" className="border-b border-gold/40 text-gold hover:border-gold">
            Scrivici per acquistare
          </a>
          .
        </p>
      </Reveal>
    </section>
  );
}
