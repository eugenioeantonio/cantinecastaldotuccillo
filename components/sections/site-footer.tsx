"use client";

import { brand, contact, nav } from "@/lib/content";
import { Reveal } from "@/components/primitives/reveal";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-[#1a0710] px-6 pt-[10vh] pb-10 sm:px-[clamp(24px,7vw,120px)]">
      {/* Top row */}
      <div className="mx-auto flex max-w-6xl flex-col gap-12 border-b border-gold/12 pb-16 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <div className="font-serif text-lg font-semibold tracking-[0.3em] text-ivory">
            CASTALDO TUCCILLO
          </div>
          <p className="mt-4 text-sm font-light leading-relaxed text-ivory/50">
            Cinque generazioni di vino vesuviano. Falanghina, Aglianico, Metodo
            Vesuviano e il raro Lammiccato — dal cuore del Vesuvio.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div>
            <div className="eyebrow eyebrow-stone mb-4 !text-[10px]">Naviga</div>
            <ul className="space-y-2.5">
              {nav.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    className="text-sm font-light text-ivory/60 transition-colors hover:text-gold"
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow eyebrow-stone mb-4 !text-[10px]">Contatti</div>
            <ul className="space-y-2.5 text-sm font-light text-ivory/60">
              <li>
                <a href={contact.phoneHref} className="hover:text-gold">
                  {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="break-all hover:text-gold">
                  {contact.email}
                </a>
              </li>
              <li>
                {contact.city} ({contact.region})
              </li>
            </ul>
          </div>
          <div>
            <div className="eyebrow eyebrow-stone mb-4 !text-[10px]">Seguici</div>
            <a
              href={contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light text-ivory/60 transition-colors hover:text-gold"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      {/* Giant wordmark */}
      <Reveal className="mx-auto mt-14 max-w-7xl">
        <div className="select-none bg-gradient-to-b from-ivory/12 to-ivory/0 bg-clip-text text-center font-serif text-[clamp(56px,16vw,240px)] font-medium leading-[0.9] tracking-tight text-transparent">
          {brand.name}
        </div>
      </Reveal>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-4 text-[11px] uppercase tracking-[0.16em] text-ivory/35 sm:flex-row">
        <span>
          © {year} {brand.full}
        </span>
        <span>{brand.claim}</span>
      </div>
    </footer>
  );
}
