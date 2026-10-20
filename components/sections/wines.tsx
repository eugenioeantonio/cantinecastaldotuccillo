"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { Product } from "@/lib/commerce/types";
import { priceLabel } from "@/lib/commerce/format";
import { bottleSlotFor } from "@/lib/photo-slots";
import { easeSilk } from "@/lib/motion";
import { SplitText } from "@/components/primitives/split-text";
import { PurchaseAction, type PurchaseMode } from "@/components/commerce/purchase-action";
import { WineLight } from "@/components/atmosphere/wine-light";

/**
 * The wine seen in its glass from just above: a level surface of its own
 * colour inside the thin bright line of the rim. Stands in for the bottle
 * until the bottle photographs exist.
 */
export function WineDisc({ accent, className = "" }: { accent: string; className?: string }) {
  const id = `w${accent.replace("#", "")}`;
  return (
    <svg aria-hidden viewBox="0 0 64 40" className={`block overflow-visible ${className}`}>
      <defs>
        <radialGradient id={id} cx="0.5" cy="0.35" r="0.65">
          <stop offset="0" stopColor={accent} stopOpacity="0.95" />
          <stop offset="0.7" stopColor={accent} stopOpacity="0.7" />
          <stop offset="1" stopColor="#08040a" stopOpacity="0.9" />
        </radialGradient>
      </defs>
      {/* the rim of the glass */}
      <ellipse cx="32" cy="20" rx="31" ry="18.5" fill="none" stroke="rgba(243,239,230,0.32)" strokeWidth="0.8" />
      {/* the wine's level surface */}
      <ellipse cx="32" cy="22" rx="25" ry="13" fill={`url(#${id})`} />
      {/* light caught on the far edge */}
      <path d="M14 17 Q32 8 50 17" fill="none" stroke="rgba(243,239,230,0.45)" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The bottle's place. Until the photograph exists it is a quiet niche lit
 * from below in the wine's own colour — no missing-image sign, no stand-in
 * bottle — and it takes a cut-out PNG (1:3) without any other change.
 */
export function BottleNiche({ product }: { product: Product }) {
  const slot = bottleSlotFor(product.handle);
  const photo = product.images[0]?.url ?? slot?.src ?? null;
  const { accent } = product.wine;
  return (
    <div
      className="relative aspect-[3/4] w-full overflow-hidden sm:max-lg:max-h-[min(46vh,360px)] bg-[#0f080c] shadow-[inset_0_0_0_1px_rgba(168,138,86,0.12)]"
      data-photo-slot={photo ? undefined : slot?.id}
    >
      {/* light rising from the floor of the niche, the wine's colour */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: `radial-gradient(70% 55% at 50% 100%, ${accent}38, transparent 72%)` }}
      />
      {/* the pour: on hover or focus the colour climbs the niche */}
      <span
        aria-hidden
        className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 group-focus-within:scale-y-100"
        style={{ background: `linear-gradient(0deg, ${accent}30, ${accent}0a 80%, transparent)` }}
      />
      {photo && (
        <Image
          src={photo}
          alt={product.images[0]?.altText ?? slot?.alt ?? product.title}
          fill
          sizes="(max-width: 639px) 70vw, (max-width: 1023px) 45vw, 24vw"
          className="object-contain p-[9%] transition-transform duration-700 group-hover:-translate-y-1"
        />
      )}
    </div>
  );
}

/**
 * The four wines side by side, each standing in its own niche above its
 * label: name, kind, the family's note, and one way to have it. On a phone
 * they pass one at a time under the thumb rather than four at once.
 * The same grid is a scene of the homepage and, with `page`, the whole of
 * its own page (/vini).
 */
const NUMBERS = ["", "Un", "Due", "Tre", "Quattro", "Cinque", "Sei", "Sette", "Otto", "Nove", "Dieci", "Undici", "Dodici"];

/** "Quattro vini," while the list is short and whole; "I vini," otherwise. */
const countLine = (n: number, partial: boolean) =>
  !partial && n >= 1 && n < NUMBERS.length ? `${NUMBERS[n]} ${n === 1 ? "vino" : "vini"},` : "I vini,";

export function Wines({
  products,
  mode,
  page = false,
  partial = false,
  notice,
  pagination,
}: {
  products: Product[];
  mode: PurchaseMode;
  page?: boolean;
  /** This is one page of a longer catalogue: the title does not count. */
  partial?: boolean;
  /** Said instead of the grid when there is nothing to show (and why). */
  notice?: ReactNode;
  pagination?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const Title = page ? "h1" : "h2";

  return (
    <section
      id="vini"
      aria-labelledby="vini-title"
      className={`relative px-6 sm:px-[clamp(24px,7vw,120px)] lg:max-xl:px-12 ${
        page ? "pb-[14vh] pt-[clamp(128px,20vh,200px)]" : "py-[16vh]"
      }`}
      style={{ background: "linear-gradient(180deg, #0b0609 0%, #120a10 22%)" }}
    >
      <WineLight side="left" />
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Title
            id="vini-title"
            className="font-serif text-[clamp(44px,6.4vw,100px)] font-medium leading-[0.98] text-ivory"
          >
            <SplitText text={countLine(products.length, partial)} />
            <br />
            <SplitText text="una sola terra." className="italic text-stone" delay={0.2} />
          </Title>
          <p className="max-w-[30ch] text-[15px] font-light leading-relaxed text-ivory/65">
            {mode === "buy"
              ? "Ogni etichetta è disponibile in cantina e qui, online."
              : "Ogni etichetta è disponibile in cantina e su prenotazione."}
          </p>
        </div>

        {products.length === 0 && notice}
        <ul
          hidden={products.length === 0}
          className="rail -mx-6 mt-[8vh] flex snap-x snap-mandatory scroll-px-6 gap-5 overflow-x-auto px-6 pb-6 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:gap-x-5 xl:gap-x-7"
          aria-label="I vini"
        >
          {products.map((p, i) => {
            const rare = p.wine.rare;
            return (
              <motion.li
                key={p.handle}
                initial={reduced ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 1, delay: i * 0.09, ease: easeSilk }}
                className="group relative flex w-[min(74vw,300px)] shrink-0 snap-start flex-col sm:w-auto"
              >
                <BottleNiche product={p} />

                <h3
                  className={`mt-6 font-serif text-[clamp(26px,2.2vw,32px)] font-medium leading-[1.05] ${
                    rare ? "italic text-stone transition-colors duration-500 group-hover:text-ivory" : "text-ivory"
                  }`}
                >
                  <Link
                    href={`/vini/${p.handle}`}
                    className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
                  >
                    {p.title}
                  </Link>
                </h3>
                <div className="mt-3 flex items-start gap-2.5">
                  <WineDisc accent={p.wine.accent} className="mt-[1px] h-auto w-6 shrink-0 transition-transform duration-700 group-hover:scale-110" />
                  {/* two lines reserved in the row, so the notes start level */}
                  <p className="text-[11px] uppercase leading-snug tracking-[0.22em] text-stone/70 lg:min-h-[2lh]">
                    {p.wine.type}
                    {p.wine.denomination || p.wine.style ? " · " : ""}
                    <span className="whitespace-nowrap">{p.wine.denomination ?? p.wine.style}</span>
                  </p>
                </div>
                <p className="mt-4 line-clamp-5 text-[15px] font-light leading-[1.7] text-ivory/70">{p.wine.tastingNote}</p>
                {p.wine.grape && p.wine.grape !== p.title && (
                  <p className="mt-2 text-[12px] uppercase tracking-[0.2em] text-gold/80">{p.wine.grape}</p>
                )}
                {mode === "buy" && priceLabel(p) && (
                  <p className="mt-auto pt-6 font-serif text-[22px] leading-none lining-nums text-ivory">{priceLabel(p)}</p>
                )}
                <div
                  className={`relative z-10 flex flex-wrap items-center gap-x-5 gap-y-3 xl:gap-x-7 ${
                    mode === "buy" && priceLabel(p) ? "pt-5" : "mt-auto pt-7"
                  }`}
                >
                  <PurchaseAction product={p} mode={mode} />
                  <Link
                    href={`/vini/${p.handle}`}
                    className="text-[12px] uppercase tracking-[0.2em] text-ivory/60 transition-colors hover:text-ivory"
                  >
                    Scheda
                  </Link>
                </div>
              </motion.li>
            );
          })}
        </ul>
        {pagination}
      </div>
    </section>
  );
}

/**
 * Said in place of the grid when the store has nothing to show. Honest about
 * it, with the family's real contacts — never a made-up list.
 */
export function CatalogNotice({ reason, email, phone, phoneHref }: { reason: string; email: string; phone: string; phoneHref: string }) {
  return (
    <div className="mt-[8vh] max-w-xl border-t border-gold/15 pt-8">
      <p className="font-serif text-[clamp(22px,2.2vw,28px)] font-light italic leading-snug text-stone">
        {reason === "unconfigured" ? "Il catalogo online è in preparazione." : "Il catalogo non è disponibile in questo momento."}
      </p>
      <p className="mt-3 text-[16px] font-light leading-[1.7] text-ivory/65">
        Per i nostri vini scrivici a{" "}
        <a href={`mailto:${email}`} className="border-b border-gold/40 text-ivory hover:border-gold">
          {email}
        </a>{" "}
        o chiamaci al{" "}
        <a href={phoneHref} className="border-b border-gold/40 text-ivory hover:border-gold">
          {phone}
        </a>
        .
      </p>
    </div>
  );
}
