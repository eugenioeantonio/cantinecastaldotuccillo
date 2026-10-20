"use client";

import { useState } from "react";
import type { Money, Product } from "@/lib/commerce";
import { contact } from "@/lib/content";
import { buyNow } from "@/app/actions/cart";
import { WineLight } from "@/components/atmosphere/wine-light";
import type { PurchaseMode } from "@/components/commerce/purchase-action";

const price = (m: Money | null) =>
  m ? new Intl.NumberFormat("it-IT", { style: "currency", currency: m.currencyCode }).format(Number(m.amount)) : null;

const Line = ({ d }: { d: string }) => (
  <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current stroke-[1.3]">
    <path d={d} />
  </svg>
);

/**
 * The closing act: one sentence the visitor completes — which wine, how many —
 * and sends. Today it reaches the cellar as a ready-written email; with the
 * store connected the same sentence goes to checkout.
 */
export function Purchase({ products, mode }: { products: Product[]; mode: PurchaseMode }) {
  const [handle, setHandle] = useState(products[0]?.handle ?? "");
  const [qty, setQty] = useState(1);
  const wine = products.find((p) => p.handle === handle) ?? products[0];
  if (!wine) return null;

  const bottles = qty === 1 ? "bottiglia" : "bottiglie";
  const mail = `mailto:${contact.email}?subject=${encodeURIComponent(`Richiesta: ${wine.title}`)}&body=${encodeURIComponent(
    `Buongiorno,\nvorrei ricevere ${qty} ${bottles} di ${wine.title}.\n\nNome:\nTelefono:\n`,
  )}`;
  const amount = price(wine.priceRange.min);

  return (
    <section
      id="acquista"
      aria-labelledby="acquista-title"
      className="relative overflow-hidden px-6 py-[16vh] sm:px-[clamp(24px,7vw,120px)]"
      style={{ background: "linear-gradient(180deg, #0b0609 0%, #1a0710 26%, #160810 100%)" }}
    >
      <WineLight side="left" />
      <div className="relative mx-auto max-w-6xl">
        <h2 id="acquista-title" className="sr-only">
          Acquista
        </h2>

        <form
          action={mode === "buy" ? buyNow : undefined}
          onSubmit={(e) => {
            if (mode !== "buy") {
              e.preventDefault();
              window.location.href = mail;
            }
          }}
          className="mt-0"
        >
          <p className="font-serif text-[clamp(36px,5.6vw,88px)] font-light leading-[1.18] text-ivory">
            Vorrei{" "}
            <span className="inline-flex items-baseline gap-[0.3em] whitespace-nowrap">
              <button
                type="button"
                aria-label="Una bottiglia in meno"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="relative -top-[0.15em] text-gold/70 transition-colors hover:text-gold disabled:opacity-30"
              >
                <Line d="M3 8h10" />
              </button>
              <output aria-live="polite" className="min-w-[1ch] text-center tabular-nums text-gold">
                {qty}
              </output>
              <button
                type="button"
                aria-label="Una bottiglia in più"
                onClick={() => setQty((q) => Math.min(48, q + 1))}
                className="relative -top-[0.15em] text-gold/70 transition-colors hover:text-gold"
              >
                <Line d="M3 8h10M8 3v10" />
              </button>
            </span>{" "}
            {bottles} di{" "}
            <label className="relative inline-block">
              <span className="sr-only">Vino</span>
              <select
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="cursor-pointer appearance-none border-b border-gold/40 bg-transparent pr-[0.7em] font-serif italic text-stone outline-none transition-colors hover:border-gold focus-visible:border-gold"
              >
                {products.map((p) => (
                  <option key={p.handle} value={p.handle} className="bg-[#160810] text-ivory">
                    {p.title}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden
                viewBox="0 0 12 8"
                className="pointer-events-none absolute right-0 top-1/2 h-[0.2em] w-[0.32em] -translate-y-1/2 fill-none stroke-gold stroke-[1.2]"
              >
                <path d="M1 1.5 6 6.5 11 1.5" />
              </svg>
            </label>
            .
          </p>

          <input type="hidden" name="variantId" value={wine.variants[0]?.id ?? ""} />
          <input type="hidden" name="quantity" value={qty} />

          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5 border-t border-gold/15 pt-10">
            <button
              type="submit"
              className="group relative overflow-hidden rounded-full bg-ivory px-9 py-4 text-xs uppercase tracking-[0.18em] text-wine-dark transition-[transform,box-shadow] duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-12px_rgba(168,138,86,0.55)]"
            >
              <span className="relative z-10">{mode === "buy" ? "Vai al checkout" : "Scrivi alla cantina"}</span>
              <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-[left] duration-700 group-hover:left-[130%]" />
            </button>
            <p className="max-w-[38ch] text-[15px] font-light leading-[1.6] text-ivory/70">
              {mode === "buy" && amount ? `${amount} a bottiglia.` : "La richiesta arriva direttamente in cantina."}
            </p>
            <a
              href={contact.phoneHref}
              className="text-[13px] uppercase tracking-[0.18em] text-ivory/70 transition-colors hover:text-gold md:ml-auto"
            >
              {contact.phone}
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}
