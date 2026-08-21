"use client";

import Image from "next/image";
import { brand, contact, nav } from "@/lib/content";

/** Intrinsic size of the STEPS credit mark (public/brand/steps.png, trimmed). */
const STEPS = { width: 418, height: 96 } as const;

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

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-4 text-[11px] uppercase tracking-[0.16em] text-ivory/35 sm:flex-row">
        <span>
          © {year} {brand.full}
        </span>
        <span className="flex items-center gap-2 whitespace-nowrap">
          Power by
          <Image
            src="/brand/steps.png"
            alt="STEPS"
            width={STEPS.width}
            height={STEPS.height}
            className="h-[11px] w-auto opacity-60 sm:h-[13px]"
          />
        </span>
      </div>
    </footer>
  );
}
