"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  addToCart,
  goToCheckout,
  readCart,
  updateCartLine,
  type CartState,
} from "@/app/actions/cart";
import type { Cart } from "@/lib/commerce/types";
import { formatMoney } from "@/lib/commerce/format";
import { easeSilk } from "@/lib/motion";

type CartContext = {
  /** False until the store is connected: no cart UI at all. */
  enabled: boolean;
  cart: Cart | null;
  error: string | null;
  pending: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (merchandiseId: string, quantity?: number) => Promise<CartState>;
  update: (lineId: string, quantity: number) => void;
};

const Ctx = createContext<CartContext>({
  enabled: false,
  cart: null,
  error: null,
  pending: false,
  open: false,
  setOpen: () => {},
  add: async () => ({ cart: null, error: null }),
  update: () => {},
});

export const useCart = () => useContext(Ctx);

/**
 * The visitor's Shopify cart, shared by the header, the wine cards and the
 * product pages. It holds nothing of its own: every change goes to Shopify
 * and the cart comes back as Shopify sees it.
 */
export function CartProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const apply = useCallback((s: CartState) => {
    if (s.cart || !s.error) setCart(s.cart);
    setError(s.error);
    return s;
  }, []);

  useEffect(() => {
    if (enabled) readCart().then(apply);
  }, [enabled, apply]);

  // prices and stock may have moved since the page loaded: re-read on open
  useEffect(() => {
    if (enabled && open) start(async () => void apply(await readCart()));
  }, [enabled, open, apply]);

  const add = useCallback(
    async (merchandiseId: string, quantity = 1) => {
      const s = apply(await addToCart(merchandiseId, quantity));
      if (!s.error) setOpen(true);
      return s;
    },
    [apply],
  );

  const update = useCallback(
    (lineId: string, quantity: number) => start(async () => void apply(await updateCartLine(lineId, quantity))),
    [apply],
  );

  return (
    <Ctx.Provider value={{ enabled, cart, error, pending, open, setOpen, add, update }}>
      {children}
      {enabled && <CartDrawer />}
    </Ctx.Provider>
  );
}

/** The header's entry to the cart: a word and a count, like the rest of the nav. */
export function CartButton({ className = "" }: { className?: string }) {
  const { enabled, cart, setOpen } = useCart();
  if (!enabled) return null;
  const n = cart?.totalQuantity ?? 0;
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={n ? `Carrello, ${n} ${n === 1 ? "bottiglia" : "bottiglie"}` : "Carrello vuoto"}
      className={`relative py-1 text-xs uppercase tracking-[0.16em] text-ivory/80 transition-colors duration-500 hover:text-ivory ${className}`}
    >
      Carrello
      <span className="ml-2 inline-block min-w-[1.4em] text-center font-serif text-[16px] normal-case tracking-normal text-gold lining-nums">
        {n}
      </span>
    </button>
  );
}

function CartDrawer() {
  const { cart, error, pending, open, setOpen, update } = useCart();
  const reduced = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const [checkingOut, startCheckout] = useTransition();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("button")?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, setOpen]);

  const lines = cart?.lines ?? [];
  const message = checkoutError ?? error;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.4, ease: easeSilk }}
        >
          <button aria-label="Chiudi il carrello" className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={reduced ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduced ? undefined : { x: "100%" }}
            transition={{ duration: 0.6, ease: easeSilk }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col border-l border-gold/15 bg-gradient-to-b from-[#160810] to-[#0e0509] text-ivory"
          >
            <div className="flex items-center justify-between border-b border-gold/15 px-7 py-6">
              <h2 id="cart-title" className="font-serif text-[clamp(24px,2.5vw,34px)] font-medium leading-none">
                Il carrello
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[11px] uppercase tracking-[0.24em] text-stone/70 transition-colors hover:text-ivory"
              >
                Chiudi
              </button>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto px-7" aria-busy={pending}>
              {lines.length === 0 ? (
                <div className="py-16">
                  <p className="font-serif text-[22px] italic text-stone">Il carrello è vuoto.</p>
                  <Link
                    href="/vini"
                    onClick={() => setOpen(false)}
                    className="group mt-6 inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-ivory transition-colors hover:text-gold"
                  >
                    <span aria-hidden className="h-px w-8 bg-gold/60 transition-[width] duration-500 group-hover:w-14" />
                    I vini
                  </Link>
                </div>
              ) : (
                <ul>
                  {lines.map((l) => (
                    <li key={l.id} className="flex gap-5 border-b border-gold/10 py-6">
                      <div className="relative h-24 w-16 shrink-0 bg-[#0f080c] shadow-[inset_0_0_0_1px_rgba(168,138,86,0.12)]">
                        {l.image && <Image src={l.image.url} alt="" fill sizes="64px" className="object-contain p-1" />}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          href={`/vini/${l.productHandle}`}
                          onClick={() => setOpen(false)}
                          className="font-serif text-[22px] leading-tight text-ivory hover:text-gold"
                        >
                          {l.productTitle}
                        </Link>
                        {l.variantTitle && (
                          <span className="mt-1 text-[11px] uppercase tracking-[0.22em] text-stone/70">{l.variantTitle}</span>
                        )}
                        {!l.availableForSale && (
                          <span className="mt-1 text-[11px] uppercase tracking-[0.22em] text-gold">Non più disponibile</span>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <Stepper
                            value={l.quantity}
                            disabled={pending}
                            label={l.productTitle}
                            onChange={(q) => update(l.id, q)}
                          />
                          <span className="text-[16px] font-light tabular-nums text-ivory/85">{formatMoney(l.cost)}</span>
                        </div>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => update(l.id, 0)}
                          className="mt-2 self-start text-[11px] uppercase tracking-[0.2em] text-stone/60 transition-colors hover:text-ivory disabled:opacity-50"
                        >
                          Rimuovi
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-gold/15 px-7 pb-[calc(28px+env(safe-area-inset-bottom,0px))] pt-6">
              {message && (
                <p role="alert" className="mb-4 text-[16px] leading-snug text-gold">
                  {message}
                </p>
              )}
              {cart?.warnings.map((w) => (
                <p key={w} className="mb-3 text-[16px] leading-snug text-stone">
                  {w}
                </p>
              ))}
              {lines.length > 0 && cart && (
                <>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] uppercase tracking-[0.26em] text-stone/70">Subtotale</span>
                    <span className="font-serif text-[clamp(24px,2.5vw,34px)] lining-nums">{formatMoney(cart.cost.subtotal)}</span>
                  </div>
                  <p className="mt-2 text-[16px] font-light text-ivory/55">Spedizione e imposte calcolate al pagamento.</p>
                  <form
                    action={() =>
                      startCheckout(async () => {
                        setCheckoutError(null);
                        const s = await goToCheckout();
                        if (s?.error) setCheckoutError(s.error);
                      })
                    }
                  >
                    <button
                      type="submit"
                      disabled={pending || checkingOut}
                      className="mt-6 w-full rounded-full bg-ivory px-9 py-4 text-xs uppercase tracking-[0.18em] text-wine-dark transition-[transform,box-shadow,opacity] duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-12px_rgba(168,138,86,0.55)] disabled:translate-y-0 disabled:opacity-60"
                    >
                      {checkingOut ? "Apro il pagamento…" : "Vai al pagamento"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** − n + : quantity in place, the way a cellar ledger is corrected. */
export function Stepper({
  value,
  onChange,
  disabled,
  label,
  max = 48,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  label: string;
  max?: number;
}) {
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-ivory transition-colors hover:border-gold disabled:opacity-40";
  return (
    <div className="flex items-center gap-3" role="group" aria-label={`Quantità di ${label}`}>
      <button type="button" className={btn} disabled={disabled || value <= 1} onClick={() => onChange(value - 1)} aria-label="Una in meno">
        <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 stroke-current stroke-[1.2]">
          <path d="M2 6h8" />
        </svg>
      </button>
      <span className="min-w-[1.5em] text-center font-serif text-[20px] lining-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label="Una in più">
        <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 stroke-current stroke-[1.2]">
          <path d="M2 6h8M6 2v8" />
        </svg>
      </button>
    </div>
  );
}
