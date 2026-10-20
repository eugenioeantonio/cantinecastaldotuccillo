"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { generations } from "@/lib/content";
import { PHOTO_SLOTS } from "@/lib/photo-slots";
import { easeSilk, easeWine, scrollMap } from "@/lib/motion";
import { PhotoPlate } from "@/components/primitives/photo-plate";
import { WineLight } from "@/components/atmosphere/wine-light";

/**
 * Five generations as a family register: one great numeral, held still like
 * the vintage on a label, changes as you read; the chapters pass beside it
 * along a thread that grows with the reading.
 */
export function StoryGenerations() {
  const ref = useRef<HTMLElement>(null);
  const chapters = useRef<(HTMLElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 70%"] });
  const thread = useTransform(scrollYProgress, scrollMap([0, 1], [0, 1]));

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.index));
        }
      },
      // phones: the chapter just below the sticky numeral is the one being read
      {
        rootMargin: window.matchMedia("(max-width: 767px)").matches
          ? "-18% 0px -72% 0px"
          : "-45% 0px -45% 0px",
      },
    );
    chapters.current.forEach((c) => c && io.observe(c));
    return () => io.disconnect();
  }, []);

  const g = generations[current];

  return (
    <section
      id="generazioni"
      ref={ref}
      aria-labelledby="generazioni-title"
      className="relative px-6 pb-[16vh] pt-[6vh] sm:px-[clamp(24px,7vw,120px)]"
      style={{ background: "linear-gradient(180deg, #140a0e 0%, #120a10 100%)" }}
    >
      <WineLight side="left" />
      <div className="relative mx-auto grid max-w-6xl gap-x-16 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* The numeral — sticky on every screen; small and in-line on phones */}
        <div className="sticky top-[72px] z-10 -mx-6 mb-6 flex items-baseline gap-4 border-b border-gold/10 bg-[#130a0f] px-6 py-3 md:static md:top-auto md:mx-0 md:mb-0 md:block md:border-b-0 md:bg-transparent md:p-0">
          <div className="md:sticky md:top-[18vh]">
            <h2 id="generazioni-title" className="sr-only">
              Cinque generazioni
            </h2>
            <div className="relative h-[1.1em] font-serif text-[44px] leading-none text-gold md:h-[0.92em] md:text-[clamp(150px,19vw,300px)]" aria-hidden>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={g.index}
                  className="absolute left-0 top-0 font-medium"
                  initial={reduced ? false : { opacity: 0, filter: "blur(12px)", y: 18 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, filter: "blur(12px)", y: -18 }}
                  transition={{ duration: 0.9, ease: easeWine }}
                >
                  {g.index}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-stone/80 md:mt-6">
              {g.order}
            </p>
            {/* five ticks: where in the family you are */}
            <div className="mt-6 hidden gap-2 md:flex" aria-hidden>
              {generations.map((x, i) => (
                <span
                  key={x.index}
                  className={`h-px w-8 transition-colors duration-700 ${i <= current ? "bg-gold" : "bg-gold/20"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* The chapters, along the thread */}
        <ol className="relative md:pl-14">
          <span aria-hidden className="absolute left-0 top-0 hidden h-full w-px bg-gold/10 md:block" />
          <motion.span
            aria-hidden
            style={{ scaleY: reduced ? 1 : thread }}
            className="absolute left-0 top-0 hidden h-full w-px origin-top bg-gradient-to-b from-gold via-[#7a1526] to-transparent md:block"
          />
          {generations.map((x, i) => (
            <li
              key={x.index}
              ref={(el) => {
                chapters.current[i] = el;
              }}
              data-index={i}
              className="flex min-h-[34vh] flex-col justify-center py-[5vh] md:min-h-[62vh]"
            >
              <h3 className="font-serif text-[clamp(34px,4.4vw,64px)] font-medium leading-[1.02] text-ivory">
                <span className="sr-only">{x.order}: </span>
                {x.title}
              </h3>
              <motion.p
                initial={reduced ? false : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20% 0px" }}
                transition={{ duration: 1.1, ease: easeSilk }}
                className="mt-6 max-w-[34ch] text-[16px] font-light leading-[1.75] text-ivory/70"
              >
                {x.body}
              </motion.p>
            </li>
          ))}
          <li className="pt-[4vh] md:max-w-sm">
            <PhotoPlate slot={PHOTO_SLOTS["family-today"]} sizes="(max-width: 768px) 100vw, 380px" />
          </li>
        </ol>
      </div>
    </section>
  );
}
