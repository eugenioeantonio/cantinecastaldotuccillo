"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import { contact, experience } from "@/lib/content";
import { PHOTO_SLOTS } from "@/lib/photo-slots";
import { openingStatus } from "@/lib/hours";
import { easeSilk } from "@/lib/motion";
import { SplitText } from "@/components/primitives/split-text";
import { PhotoPlate } from "@/components/primitives/photo-plate";
import { WineLight } from "@/components/atmosphere/wine-light";

const subscribe = () => () => {};
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${contact.street}, ${contact.city} ${contact.region}`,
)}`;
const bookHref = `mailto:${contact.email}?subject=${encodeURIComponent("Prenota una visita")}`;

/**
 * The visit, told as a visit: an invitation, the place in two photographs,
 * the afternoon as a path walked in three stages, and everything needed to
 * come — including whether the door is open right now. It is the whole of
 * its own page (/visita).
 */
export function Experience() {
  const reduced = useReducedMotion();
  const status = useSyncExternalStore(subscribe, () => openingStatus(), () => null);

  return (
    <section
      id="visita"
      aria-labelledby="visita-title"
      className="relative overflow-hidden px-6 pb-[14vh] pt-[clamp(128px,20vh,200px)] sm:px-[clamp(24px,7vw,120px)]"
      style={{ background: "linear-gradient(180deg, #0b0609 0%, #08040a 50%, #1a0710 100%)" }}
    >
      <span id="contatti" className="absolute top-0" aria-hidden />
      <WineLight side="right" />
      <div className="relative mx-auto max-w-6xl">
        <h1
          id="visita-title"
          className="max-w-[11ch] font-serif text-[clamp(48px,8vw,128px)] font-medium leading-[0.94] tracking-[-0.015em] text-ivory"
        >
          <SplitText text="Un calice" by="word" />
          <br />
          <SplitText text="ti aspetta." by="word" className="italic text-stone" delay={0.2} />
        </h1>

        <div className="mt-[10vh] grid gap-10 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-6">
            <PhotoPlate slot={PHOTO_SLOTS["visit-cellar"]} sizes="(max-width: 768px) 100vw, 46vw" />
          </div>
          <div className="flex flex-col justify-between gap-10 md:col-span-5 md:col-start-8">
            <p className="font-serif text-[clamp(22px,2.3vw,32px)] font-light leading-[1.4] text-ivory/85">
              {experience.lead}
            </p>
            <div className="md:ml-auto md:w-3/4">
              <PhotoPlate slot={PHOTO_SLOTS["visit-tasting"]} sizes="(max-width: 768px) 100vw, 28vw" />
            </div>
          </div>
        </div>

        {/* The afternoon, told in one breath (run-in heads, no feature row) */}
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.4, ease: easeSilk }}
          className="relative mt-[12vh] max-w-4xl font-serif text-[clamp(25px,2.9vw,40px)] font-light leading-[1.4] text-ivory/85 md:ml-[8%]"
        >
          <span className="mr-4 whitespace-nowrap align-[0.35em] font-sans text-[11px] font-normal uppercase tracking-[0.26em] text-gold">
            {experience.cards[0].k}
          </span>
          {experience.cards[0].body}{" "}
          <span className="mx-4 inline-block whitespace-nowrap align-[0.35em] font-sans text-[11px] font-normal uppercase tracking-[0.26em] text-gold">
            {experience.cards[2].k}
          </span>
          <em className="italic text-stone">{experience.cards[2].body}</em>
        </motion.p>

        {/* Everything needed to come */}
        <div className="mt-[14vh] grid gap-12 border-t border-gold/15 pt-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="max-w-[36ch] text-[16px] font-light leading-[1.7] text-ivory/75 text-balance">
              Scrivici per una visita, una degustazione o per acquistare i nostri vini. Ti
              raccontiamo il Vesuvio, un sorso alla volta.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5">
              <a
                href={bookHref}
                className="group relative overflow-hidden rounded-full bg-ivory px-9 py-4 text-xs uppercase tracking-[0.18em] text-wine-dark transition-[transform,box-shadow] duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-12px_rgba(168,138,86,0.55)]"
              >
                <span className="relative z-10">Prenota una visita</span>
                <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-[left] duration-700 group-hover:left-[130%]" />
              </a>
              <a
                href={contact.phoneHref}
                className="text-[13px] uppercase tracking-[0.18em] text-ivory/80 transition-colors hover:text-gold"
              >
                {contact.phone}
              </a>
            </div>
          </div>

          <dl className="grid gap-8 sm:grid-cols-3 md:col-span-7">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.26em] text-stone/60">Dove</dt>
              <dd className="mt-3 text-[15px] font-light leading-relaxed text-ivory/80">
                {contact.street}
                <br />
                {contact.city} ({contact.region})
                <br />
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block border-b border-gold/40 text-gold hover:border-gold"
                >
                  Apri in Mappe
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.26em] text-stone/60">Orari</dt>
              <dd className="mt-3 text-[15px] font-light leading-relaxed text-ivory/80">
                {contact.hours[0].days}
                {contact.hours.map((h) => (
                  <span key={h.time} className="block tabular-nums">
                    {h.time}
                  </span>
                ))}
                {status && (
                  <span className="mt-2 block text-[12px] uppercase tracking-[0.16em] text-gold">{status}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.26em] text-stone/60">Scrivici</dt>
              <dd className="mt-3 text-[15px] font-light leading-relaxed text-ivory/80">
                <a href={`mailto:${contact.email}`} className="hover:text-gold">
                  {contact.email.split("@")[0]}
                  <wbr />@{contact.email.split("@")[1]}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
