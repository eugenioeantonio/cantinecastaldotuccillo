"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { brand, nav, contact } from "@/lib/content";
import { easeSilk } from "@/lib/motion";

export function SiteHeader() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body + focus management for the mobile menu
  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      const first = menuRef.current?.querySelector<HTMLElement>("a,button");
      const t = setTimeout(() => first?.focus(), 120);
      return () => clearTimeout(t);
    }
    document.body.style.overflow = "";
    lastFocus.current?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") {
        const nodes = menuRef.current?.querySelectorAll<HTMLElement>("a,button");
        if (!nodes || !nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.header
        initial={reduced ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.1, ease: easeSilk }}
        className={`fixed inset-x-0 top-0 z-[100] flex items-center justify-between px-5 transition-[background,padding,border-color] duration-500 sm:px-[clamp(20px,5vw,64px)] ${
          solid
            ? "border-b border-gold/15 bg-ink/70 py-3.5 backdrop-blur-xl"
            : "border-b border-transparent py-5"
        }`}
      >
        <a href="#top" aria-label={`${brand.full} — home`} className="leading-none">
          <span className="block font-serif text-base font-semibold tracking-[0.34em] text-ivory">
            CASTALDO TUCCILLO
          </span>
          <span className="mt-1 block font-sans text-[9px] font-light tracking-[0.5em] text-stone">
            CANTINE · DAL VESUVIO
          </span>
        </a>

        <nav aria-label="Navigazione principale" className="flex items-center gap-8">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="group relative hidden py-1 text-xs uppercase tracking-[0.16em] text-ivory/85 transition-colors hover:text-ivory md:block"
            >
              {n.label}
              <span className="absolute inset-x-0 bottom-0 h-px w-0 bg-gold transition-[width] duration-500 group-hover:w-full" />
            </a>
          ))}
          <a
            href="#vini"
            className="hidden items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-xs tracking-[0.14em] text-ivory transition-colors duration-500 hover:border-gold hover:bg-gold/10 md:flex"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-[15px] w-[15px] fill-none stroke-gold stroke-[1.4]">
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
              <path d="M6 6 5 3H2" />
            </svg>
            Shop
          </a>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Chiudi il menu" : "Apri il menu"}
            className="flex h-[42px] w-[42px] flex-col items-center justify-center gap-[5px] rounded-full border border-gold/40 transition-colors hover:border-gold md:hidden"
          >
            <span className={`block h-[1.4px] w-4 bg-ivory transition-transform duration-300 ${open ? "translate-y-[6.4px] rotate-45" : ""}`} />
            <span className={`block h-[1.4px] w-4 bg-ivory transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-[1.4px] w-4 bg-ivory transition-transform duration-300 ${open ? "-translate-y-[6.4px] -rotate-45" : ""}`} />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: easeSilk }}
            className="fixed inset-0 z-[96] flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#120a10] to-wine-dark px-[8vw] py-[12vh] md:hidden"
          >
            {[...nav, { label: "Shop", href: "#vini" }].map((n, i) => (
              <motion.a
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 + i * 0.06, ease: easeSilk }}
                className="py-2 font-serif text-[clamp(30px,9vw,52px)] font-medium text-ivory transition-colors hover:text-gold"
              >
                {n.label}
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.42 }}
              className="mt-[6vh] font-sans text-[11px] uppercase tracking-[0.28em] text-stone"
            >
              {contact.city} · {contact.phone}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
