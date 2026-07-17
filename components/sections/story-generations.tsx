"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { generations } from "@/lib/content";
import { Reveal } from "@/components/primitives/reveal";
import { SplitText } from "@/components/primitives/split-text";
import { easeSilk } from "@/lib/motion";

export function StoryGenerations() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start 65%", "end 85%"],
  });
  const threadScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="cantina"
      ref={section}
      className="relative overflow-hidden px-6 py-[16vh] sm:px-[clamp(24px,7vw,120px)]"
      style={{
        background:
          "linear-gradient(180deg, var(--seq-end, #25070D) 0%, #1a0a10 55%, #120a10 100%)",
      }}
    >
      {/* Intro credo */}
      <Reveal className="mx-auto mb-[14vh] max-w-3xl text-center">
        <div className="eyebrow mb-6">Il nostro credo</div>
        <p className="font-serif text-[clamp(20px,2.6vw,32px)] font-light italic leading-[1.5] text-ivory/90 text-balance">
          Non produciamo soltanto vino. Custodiamo il tempo, il territorio e il
          lavoro di chi ci ha preceduto — una mano dopo l&apos;altra, una
          vendemmia dopo l&apos;altra.
        </p>
      </Reveal>

      {/* Timeline */}
      <div className="relative mx-auto max-w-4xl">
        {/* Static faint rail */}
        <div className="absolute left-4 top-0 h-full w-px -translate-x-1/2 bg-gold/12 md:left-1/2" />
        {/* Living thread that grows with scroll — the flood made linear */}
        <motion.div
          style={{ scaleY: reduced ? 1 : threadScale }}
          className="absolute left-4 top-0 h-full w-px origin-top -translate-x-1/2 bg-gradient-to-b from-gold via-bordeaux to-transparent md:left-1/2"
        />

        <div className="flex flex-col gap-[9vh]">
          {generations.map((g, i) => {
            const even = i % 2 === 1;
            return (
              <div
                key={g.index}
                className={`relative pl-12 md:w-1/2 md:pl-0 ${
                  even ? "md:ml-auto md:pl-16 md:text-left" : "md:pr-16 md:text-right"
                }`}
              >
                {/* Node */}
                <motion.span
                  initial={reduced ? false : { scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-20% 0px" }}
                  transition={{ duration: 0.7, ease: easeSilk }}
                  className={`absolute top-2 z-10 h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_0_5px_rgba(168,138,86,0.14)] ${
                    even ? "left-[13px] md:-left-[5px]" : "left-[13px] md:-right-[5px] md:left-auto"
                  }`}
                />
                <Reveal soft className={even ? "md:text-left" : "md:text-right"}>
                  <div className="flex items-baseline gap-4 md:justify-start">
                    <span
                      className={`font-serif text-[clamp(40px,5vw,64px)] font-medium leading-none text-gold/25 ${
                        even ? "" : "md:order-2"
                      }`}
                    >
                      {g.index}
                    </span>
                    <span className="eyebrow">{g.order}</span>
                  </div>
                  <h3 className="mt-4 font-serif text-[clamp(26px,3vw,40px)] font-medium text-ivory">
                    {g.title}
                  </h3>
                  <p className="mt-1 text-sm italic text-stone/70">{g.people}</p>
                  <p className="mt-3 max-w-md text-[15px] font-light leading-[1.75] text-ivory/60 md:inline-block">
                    {g.body}
                  </p>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bridge line into the wines */}
      <Reveal soft className="mx-auto mt-[14vh] max-w-2xl text-center">
        <div className="hairline mx-auto mb-8 w-32" />
        <p className="font-serif text-[clamp(22px,3vw,38px)] font-light leading-tight text-ivory">
          <SplitText text="E oggi quella stessa terra" /> <br className="hidden sm:block" />
          <SplitText text="si racconta in un calice." className="italic text-stone" delay={0.3} />
        </p>
      </Reveal>
    </section>
  );
}
