"use client";

import { method } from "@/lib/content";
import { Reveal } from "@/components/primitives/reveal";
import { SplitText } from "@/components/primitives/split-text";

export function Method() {
  return (
    <section
      id="metodo"
      className="relative overflow-hidden bg-gradient-to-b from-[#120a10] via-[#0d0709] to-ink px-6 py-[16vh] sm:px-[clamp(24px,7vw,120px)]"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 md:grid-cols-[0.9fr_1.1fr] md:gap-24">
        {/* Sticky title */}
        <div className="md:sticky md:top-[22vh] md:h-fit">
          <Reveal soft>
            <div className="eyebrow mb-6">{method.eyebrow}</div>
          </Reveal>
          <h2 className="font-serif text-[clamp(38px,5.5vw,68px)] font-medium leading-[1.02] text-ivory">
            <SplitText text={method.title} by="word" />
          </h2>
          <Reveal soft delay={0.15}>
            <p className="mt-6 max-w-sm font-serif text-[clamp(18px,2vw,24px)] font-light italic leading-relaxed text-stone/80">
              {method.lead}
            </p>
          </Reveal>
          <Reveal soft delay={0.25}>
            <div className="hairline mt-10 w-40" />
          </Reveal>
        </div>

        {/* Steps */}
        <div className="flex flex-col">
          {method.steps.map((s, i) => (
            <Reveal
              key={s.n}
              className={`group flex gap-6 py-9 sm:gap-10 ${
                i !== 0 ? "border-t border-gold/12" : ""
              }`}
            >
              <span className="font-serif text-[clamp(30px,4vw,52px)] font-medium leading-none text-gold/30 transition-colors duration-500 group-hover:text-gold/70">
                {s.n}
              </span>
              <div>
                <h3 className="font-serif text-[clamp(22px,2.4vw,32px)] font-medium text-ivory">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-md text-[15px] font-light leading-[1.75] text-ivory/60">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
