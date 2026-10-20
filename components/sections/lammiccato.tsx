"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { contact } from "@/lib/content";
import type { Product } from "@/lib/commerce/types";
import { PurchaseAction, type PurchaseMode } from "@/components/commerce/purchase-action";
import { scrollMap } from "@/lib/motion";
import { WineField } from "@/components/atmosphere/wine-field";

/**
 * The rare wine stops the page. The navigation steps aside, the wine of the
 * opening returns as the whole room, and the name fills with it slowly, the
 * way a glass is poured when there is little of it left.
 */
export function Lammiccato({ product, mode }: { product: Product; mode: PurchaseMode }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const fill = useTransform(scrollYProgress, scrollMap([0.0, 0.55], [82, 0]));
  const clip = useTransform(fill, (v) => `inset(${v}% 0 0 0)`);
  const textOpacity = useTransform(scrollYProgress, scrollMap([0.45, 0.68], [0, 1]));
  const textY = useTransform(scrollYProgress, scrollMap([0.45, 0.68], [24, 0]));

  // While the scene holds the screen, the header steps out of the way.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) document.documentElement.dataset.scene = "lammiccato";
        else if (document.documentElement.dataset.scene === "lammiccato")
          delete document.documentElement.dataset.scene;
      },
      { rootMargin: "-20% 0px -20% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      delete document.documentElement.dataset.scene;
    };
  }, []);

  const subject = `mailto:${contact.email}?subject=${encodeURIComponent(product.title)}`;

  return (
    <section
      id="lammiccato"
      ref={ref}
      aria-labelledby="lammiccato-title"
      className="relative -mt-px h-[230vh] motion-reduce:h-auto"
    >
      {/* soft entry and exit: the page's dark wipes off and back over the scene */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-1 z-10 h-[34vh] bg-gradient-to-b from-[#120a10] to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[30vh] bg-gradient-to-t from-[#160810] to-transparent" />
      <div className="sticky top-0 isolate z-0 flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 py-[12vh] sm:px-[clamp(24px,7vw,120px)]">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#4a0f1b_0%,#25070d_55%,#130509_100%)]" />
        <WineField className="absolute inset-x-0 bottom-0 top-1 h-[calc(100%-4px)] w-full" />

        <div className="relative mx-auto w-full max-w-6xl">
          <h2
            id="lammiccato-title"
            className="relative font-serif text-[clamp(64px,16.5vw,236px)] font-medium leading-[0.9] tracking-[-0.025em]"
          >
            {/* the empty glass: the name in outline */}
            <span aria-hidden className="block text-transparent [-webkit-text-stroke:1px_rgba(243,239,230,0.55)]">
              {product.title}
            </span>
            {/* the wine rising into it */}
            <motion.span
              style={{ clipPath: reduced ? "none" : clip }}
              className="absolute inset-0 block text-ivory"
            >
              {product.title}
            </motion.span>
          </h2>

          <motion.div
            style={{ opacity: reduced ? 1 : textOpacity, y: reduced ? 0 : textY }}
            className="mt-[7vh] grid gap-10 md:grid-cols-12"
          >
            <p className="font-serif text-[clamp(22px,2.4vw,34px)] font-light italic leading-[1.4] text-ivory/90 md:col-span-6">
              {product.wine.tastingNote}
            </p>
            <div className="flex flex-col justify-end gap-6 md:col-span-4 md:col-start-9">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                {mode === "buy" ? (
                  <PurchaseAction product={product} mode="buy" />
                ) : (
                  <a
                    href={subject}
                    className="group inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-ivory transition-colors duration-500 hover:text-gold"
                  >
                    <span aria-hidden className="h-px w-8 bg-gold/70 transition-[width] duration-500 group-hover:w-14" />
                    Chiedi del {product.title}
                  </a>
                )}
                <Link
                  href={`/vini/${product.handle}`}
                  className="text-[12px] uppercase tracking-[0.2em] text-ivory/60 transition-colors hover:text-ivory"
                >
                  Scheda
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
