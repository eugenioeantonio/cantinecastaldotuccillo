"use client";

import { useEffect, useRef, useState } from "react";
import { method } from "@/lib/content";
import { SplitText } from "@/components/primitives/split-text";
import { WineLight } from "@/components/atmosphere/wine-light";

/**
 * The method in four gestures. The title holds still; the gesture you are
 * reading comes into the light, the others wait in the dark — a reading
 * lamp moving down the page. It is the whole of its own page (/metodo).
 */
export function Method() {
  const steps = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-42% 0px -48% 0px" },
    );
    steps.current.forEach((s) => s && io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="metodo"
      aria-labelledby="metodo-title"
      className="relative px-6 pb-[14vh] pt-[clamp(128px,20vh,200px)] sm:px-[clamp(24px,7vw,120px)]"
      style={{ background: "linear-gradient(180deg, #0b0609 0%, #0d0709 60%, #120a10 100%)" }}
    >
      <WineLight side="right" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-14 md:grid-cols-[0.9fr_1.1fr] md:gap-24">
        <div className="md:sticky md:top-[24vh] md:h-fit">
          <h1
            id="metodo-title"
            className="font-serif text-[clamp(42px,5.6vw,84px)] font-medium leading-[0.98] text-ivory"
          >
            <SplitText text={method.title} by="word" />
          </h1>
          <p className="mt-7 max-w-sm font-serif text-[clamp(19px,1.9vw,24px)] font-light italic leading-relaxed text-stone/85">
            {method.lead}
          </p>
          <div className="mt-12 hidden items-center gap-4 md:flex" aria-hidden>
            <span className="font-serif text-[22px] text-gold tabular-nums">{method.steps[active].n}</span>
            <span className="relative h-px w-32 bg-gold/15">
              <span
                className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: `${((active + 1) / method.steps.length) * 100}%` }}
              />
            </span>
            <span className="font-serif text-[22px] text-gold/40 tabular-nums">
              {method.steps[method.steps.length - 1].n}
            </span>
          </div>
        </div>

        <ol className="flex flex-col">
          {method.steps.map((s, i) => {
            const on = i === active;
            return (
              <li
                key={s.n}
                ref={(el) => {
                  steps.current[i] = el;
                }}
                data-index={i}
                className={`flex gap-6 py-11 transition-opacity duration-700 sm:gap-10 ${
                  i !== 0 ? "border-t border-gold/12" : ""
                } ${on ? "opacity-100" : "opacity-70"}`}
              >
                <span
                  className={`font-serif text-[clamp(30px,4vw,52px)] font-medium leading-none tabular-nums transition-colors duration-700 ${
                    on ? "text-gold" : "text-gold/60"
                  }`}
                  aria-hidden
                >
                  {s.n}
                </span>
                <div>
                  <h3 className="font-serif text-[clamp(24px,2.5vw,34px)] font-medium text-ivory">{s.title}</h3>
                  <p className="mt-3 max-w-md text-[16px] font-light leading-[1.75] text-ivory/70">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
