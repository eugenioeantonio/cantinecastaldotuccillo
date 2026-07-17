"use client";

import { experience } from "@/lib/content";
import { Reveal, RevealGroup, RevealItem } from "@/components/primitives/reveal";
import { SplitText } from "@/components/primitives/split-text";

export function Experience() {
  return (
    <section
      id="esperienze"
      className="relative overflow-hidden bg-ink px-6 py-[16vh] sm:px-[clamp(24px,7vw,120px)]"
    >
      {/* Vesuvio silhouette — subtle horizon */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] w-full opacity-[0.5]"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="vsv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#25070d" stopOpacity="0" />
            <stop offset="1" stopColor="#25070d" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path
          d="M0,400 L0,300 C220,300 300,210 560,150 C640,132 690,150 760,175 C1000,262 1140,300 1440,300 L1440,400 Z"
          fill="url(#vsv)"
        />
      </svg>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <Reveal soft>
          <div className="eyebrow mb-6">{experience.eyebrow}</div>
        </Reveal>
        <h2 className="font-serif text-[clamp(34px,6vw,72px)] font-medium leading-[1.05] text-ivory">
          <SplitText text={experience.title} by="word" />
        </h2>
        <Reveal soft delay={0.15}>
          <p className="mx-auto mt-6 max-w-xl text-[clamp(14px,1.5vw,17px)] font-light leading-relaxed text-ivory/65 text-balance">
            {experience.lead}
          </p>
        </Reveal>
      </div>

      <RevealGroup className="relative z-10 mx-auto mt-[10vh] grid max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-[2px] border border-gold/12 bg-gold/12 md:grid-cols-3">
        {experience.cards.map((c) => (
          <RevealItem
            key={c.k}
            className="group flex min-h-[280px] flex-col justify-between bg-ink p-9 transition-colors duration-500 hover:bg-[#140b10]"
          >
            <div className="mb-10 h-8 w-8 rounded-full border border-gold/40 transition-colors duration-500 group-hover:border-gold group-hover:bg-gold/10" />
            <div>
              <h3 className="font-serif text-[clamp(22px,2.2vw,28px)] font-medium text-ivory">
                {c.k}
              </h3>
              <p className="mt-3 text-[14px] font-light leading-[1.7] text-ivory/55">
                {c.body}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
