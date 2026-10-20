"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { contact } from "@/lib/content";
import type { Product } from "@/lib/commerce/types";
import { formatMoney } from "@/lib/commerce/format";
import { Stepper, useCart } from "./cart";

export type PurchaseMode = "ask" | "buy";

const mailto = (subject: string) => `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`;

const ACTION =
  "group inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-ivory transition-colors duration-500 hover:text-gold disabled:opacity-60";
const Rule = () => <span aria-hidden className="h-px w-8 bg-gold/60 transition-[width] duration-500 group-hover:w-14" />;

const buyable = (p: Pick<Product, "variants">) => p.variants.filter((v) => v.availableForSale !== false);

/**
 * The one purchase control of a wine card.
 * - "buy" (Shopify connected): adds the bottle to the Shopify cart; a wine
 *   with several formats sends you to its page to choose; sold out says so.
 * - "ask" (no store): writes to the family with the wine already named —
 *   a contact, not a checkout, and labelled as such.
 */
export function PurchaseAction({
  product,
  mode,
  className = "",
}: {
  product: Pick<Product, "title" | "handle" | "variants" | "availableForSale">;
  mode: PurchaseMode;
  className?: string;
}) {
  const { add } = useCart();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (mode === "ask") {
    return (
      <a href={mailto(`Richiesta: ${product.title}`)} className={`${ACTION} ${className}`}>
        <Rule />
        Richiedi
      </a>
    );
  }

  const options = buyable(product);
  if (product.availableForSale === false || options.length === 0) {
    return <span className={`text-[12px] uppercase tracking-[0.2em] text-stone/60 ${className}`}>Esaurito</span>;
  }
  if (product.variants.length > 1) {
    return (
      <Link href={`/vini/${product.handle}`} className={`${ACTION} ${className}`}>
        <Rule />
        Scegli
      </Link>
    );
  }
  return (
    <span className={`inline-flex flex-col gap-1 ${className}`}>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const s = await add(options[0].id, 1);
            setError(s.error);
          })
        }
        className={ACTION}
      >
        <Rule />
        {pending ? "Aggiungo…" : "Aggiungi"}
      </button>
      {error && (
        <span role="alert" className="text-[12px] normal-case tracking-normal text-gold">
          {error}
        </span>
      )}
    </span>
  );
}

/**
 * The product page's purchase: format (when there is more than one),
 * quantity, live price, and the cart. Without a store it is the same
 * contact as the cards.
 */
export function ProductPurchase({ product, mode }: { product: Product; mode: PurchaseMode }) {
  const { add } = useCart();
  const options = buyable(product);
  const [variantId, setVariantId] = useState(options[0]?.id ?? product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const variant = product.variants.find((v) => v.id === variantId) ?? null;

  if (mode === "ask") {
    return (
      <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
        <PurchaseAction product={product} mode="ask" />
        <span className="text-[16px] font-light text-ivory/55">Disponibile in cantina e su prenotazione.</span>
      </div>
    );
  }

  const soldOut = product.availableForSale === false || options.length === 0;

  return (
    <div>
      {product.variants.length > 1 && (
        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.26em] text-stone/60">Formato</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {product.variants.map((v) => {
              const off = v.availableForSale === false;
              const on = v.id === variantId;
              return (
                <label
                  key={v.id}
                  className={`cursor-pointer rounded-full border px-5 py-2.5 text-[16px] transition-colors ${
                    on ? "border-gold text-ivory" : "border-gold/25 text-ivory/70 hover:border-gold/60"
                  } ${off ? "cursor-not-allowed opacity-45 line-through" : ""} has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold`}
                >
                  <input
                    type="radio"
                    name="variant"
                    value={v.id}
                    checked={on}
                    disabled={off}
                    onChange={() => setVariantId(v.id)}
                    className="sr-only"
                  />
                  {v.title}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
        {variant?.price && <span className="font-serif text-[34px] leading-none lining-nums text-ivory">{formatMoney(variant.price)}</span>}
        {soldOut ? (
          <span className="text-[12px] uppercase tracking-[0.2em] text-stone/70">Esaurito</span>
        ) : (
          <>
            <Stepper value={quantity} onChange={setQuantity} label={product.title} disabled={pending} />
            <button
              type="button"
              disabled={pending || !variant || variant.availableForSale === false}
              onClick={() =>
                start(async () => {
                  const s = await add(variantId, quantity);
                  setError(s.error);
                })
              }
              className="rounded-full bg-ivory px-9 py-4 text-xs uppercase tracking-[0.18em] text-wine-dark transition-[transform,box-shadow,opacity] duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-12px_rgba(168,138,86,0.55)] disabled:translate-y-0 disabled:opacity-60"
            >
              {pending ? "Aggiungo…" : "Aggiungi al carrello"}
            </button>
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-4 text-[16px] text-gold">
          {error}
        </p>
      )}
    </div>
  );
}
