"use client";

import { contact, brand } from "@/lib/content";
import { Reveal } from "@/components/primitives/reveal";
import { SplitText } from "@/components/primitives/split-text";

export function ContactCta() {
  return (
    <section
      id="contatti"
      className="relative overflow-hidden bg-gradient-to-b from-ink via-wine-dark to-[#1a0710] px-6 py-[18vh] sm:px-[clamp(24px,7vw,120px)]"
    >
      <div className="mx-auto max-w-4xl text-center">
        <Reveal soft>
          <div className="eyebrow mb-8">Un calice ci aspetta</div>
        </Reveal>
        <h2 className="font-serif text-[clamp(40px,7vw,92px)] font-medium leading-[1.02] text-ivory">
          <SplitText text={brand.claim} by="word" />
        </h2>
        <Reveal soft delay={0.2}>
          <p className="mx-auto mt-8 max-w-xl text-[clamp(14px,1.5vw,17px)] font-light leading-relaxed text-ivory/65 text-balance">
            Scrivici per una visita, una degustazione o per acquistare i nostri
            vini. Ti raccontiamo il Vesuvio, un sorso alla volta.
          </p>
        </Reveal>

        <Reveal soft delay={0.3} className="mt-12 flex flex-wrap justify-center gap-4">
          <a
            href={`mailto:${contact.email}`}
            className="group relative overflow-hidden rounded-full bg-ivory px-9 py-4 text-xs uppercase tracking-[0.18em] text-wine-dark transition-[transform,box-shadow] duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-12px_rgba(168,138,86,0.55)]"
          >
            <span className="relative z-10">Prenota una visita</span>
            <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-[left] duration-700 group-hover:left-[130%]" />
          </a>
          <a
            href={contact.phoneHref}
            className="rounded-full border border-ivory/40 px-9 py-4 text-xs uppercase tracking-[0.18em] text-ivory transition-[transform,color,border-color] duration-500 hover:-translate-y-0.5 hover:border-gold hover:text-gold"
          >
            {contact.phone}
          </a>
        </Reveal>

        {/* Coordinates */}
        <Reveal soft delay={0.4}>
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-8 border-t border-gold/12 pt-12 text-left sm:grid-cols-3">
            <div>
              <div className="eyebrow eyebrow-stone mb-3 !text-[10px]">Dove siamo</div>
              <p className="text-[15px] font-light leading-relaxed text-ivory/75">
                {contact.street}
                <br />
                {contact.city} ({contact.region})
                <br />
                {contact.country}
              </p>
            </div>
            <div>
              <div className="eyebrow eyebrow-stone mb-3 !text-[10px]">Orari</div>
              {contact.hours.map((h, i) => (
                <p key={i} className="text-[15px] font-light leading-relaxed text-ivory/75">
                  {h.days} · {h.time}
                </p>
              ))}
            </div>
            <div>
              <div className="eyebrow eyebrow-stone mb-3 !text-[10px]">Contatti</div>
              <p className="text-[15px] font-light leading-relaxed text-ivory/75">
                <a href={contact.phoneHref} className="hover:text-gold">
                  {contact.phone}
                </a>
                <br />
                <a
                  href={`mailto:${contact.email}`}
                  className="break-all hover:text-gold"
                >
                  {contact.email}
                </a>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
