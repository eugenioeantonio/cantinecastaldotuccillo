"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { brand, nav, contact, isPageHref, navHref } from "@/lib/content";
import { commerce } from "@/lib/commerce/config";
import { CartButton } from "@/components/commerce/cart";
import { openingStatus } from "@/lib/hours";
import { easeSilk } from "@/lib/motion";

/** Intrinsic size of the official logo asset (public/brand/logo.png). */
const LOGO = { width: 370, height: 384 } as const;

const MenuLink = motion.create(Link);

/** `base` prefixes the section anchors: "" on the homepage, "/" elsewhere. */
export function SiteHeader({ base = "" }: { base?: string }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const pathname = usePathname();
  // a page of its own is current while you are on it; a scene while it is read
  const active = nav.find((n) => isPageHref(n.href) && pathname === n.href)?.href ?? section;
  const reduced = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The section currently in the middle band of the viewport lights its nav item
  useEffect(() => {
    const targets = nav
      .filter((n) => !isPageHref(n.href))
      .map((n) => document.querySelector<HTMLElement>(n.href))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = `#${e.target.id}`;
          setSection((prev) => (e.isIntersecting ? id : prev === id ? null : prev));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
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
        className={`site-header fixed inset-x-0 top-0 z-[100] flex items-center justify-between px-5 transition-[background,padding,border-color] duration-500 sm:px-[clamp(20px,5vw,64px)] ${
          solid
            ? "border-b border-gold/15 bg-ink/70 py-3.5 backdrop-blur-xl"
            : "border-b border-transparent py-5"
        }`}
      >
        <a
          href={`${base}#top`}
          aria-label={`${brand.full} — home`}
          className="flex items-center leading-none"
        >
          {/* Official brand mark — original asset, proportions untouched */}
          <Image
            src="/brand/logo.png"
            alt=""
            width={LOGO.width}
            height={LOGO.height}
            priority
            sizes="(max-width: 767px) 56px, 72px"
            className={`w-auto transition-[height] duration-500 ${
              solid ? "h-12 md:h-[60px]" : "h-14 md:h-[72px]"
            }`}
          />
        </a>

        <nav aria-label="Navigazione principale" className="flex items-center gap-8">
          {nav.map((n) => {
            const current = active === n.href;
            const page = isPageHref(n.href);
            // pages navigate in the app; scenes are anchors the smooth scroll follows
            const Item = page ? Link : "a";
            return (
              <Item
                key={n.href}
                href={navHref(n.href, base)}
                aria-current={current ? (page ? "page" : "location") : undefined}
                className={`group relative hidden py-1 text-xs uppercase tracking-[0.16em] transition-colors duration-500 hover:text-ivory md:block ${
                  current ? "text-ivory" : "text-ivory/80"
                }`}
              >
                {n.label}
                {current ? (
                  <motion.span
                    layoutId={reduced ? undefined : "nav-current"}
                    transition={{ duration: 0.6, ease: easeSilk }}
                    className="absolute inset-x-0 bottom-0 h-px bg-gold"
                  />
                ) : (
                  <span className="absolute inset-x-0 bottom-0 h-px w-0 bg-gold/60 transition-[width] duration-500 group-hover:w-full" />
                )}
              </Item>
            );
          })}

          {/* Purchase entry — reads from lib/commerce, ready for Shopify */}
          <Link
            href={navHref(commerce.href, base)}
            className="relative hidden py-1 text-xs uppercase tracking-[0.16em] text-gold transition-colors duration-500 hover:text-gold-soft md:block"
          >
            {commerce.label}
            <span className="absolute inset-x-0 bottom-0 h-px bg-gold/40" />
          </Link>

          <CartButton />

          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Chiudi il menu" : "Apri il menu"}
            className="flex h-[42px] w-[42px] flex-col items-center justify-center gap-[5px] rounded-full border border-gold/40 transition-colors hover:border-gold md:hidden"
          >
            <span className={`block h-[1.4px] w-4 bg-ivory transition-transform duration-300 ${open ? "translate-y-[6.4px] rotate-45" : ""}`} />
            <span className={`block h-[1.4px] w-4 bg-ivory transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
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
            {[...nav, { label: commerce.label, href: commerce.href }].map((n, i) => {
              const Item = isPageHref(n.href) ? MenuLink : motion.a;
              // the purchase entry shares the wines page; only the nav item marks it
              const current = active === n.href && n.label !== commerce.label;
              return (
                <Item
                  key={n.label}
                  href={navHref(n.href, base)}
                  onClick={() => setOpen(false)}
                  aria-current={current && isPageHref(n.href) ? "page" : undefined}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 + i * 0.06, ease: easeSilk }}
                  className={`py-2 font-serif text-[clamp(30px,9vw,52px)] font-medium transition-colors hover:text-gold ${
                    current && isPageHref(n.href) ? "text-gold" : "text-ivory"
                  }`}
                >
                  {n.label}
                </Item>
              );
            })}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
              className="mt-[6vh] flex flex-col items-center gap-2 text-center font-sans text-[11px] uppercase tracking-[0.28em]"
            >
              <span className="text-gold">{openingStatus()}</span>
              <span className="text-stone/70">{contact.city}</span>
              <a href={contact.phoneHref} className="text-stone/70 transition-colors hover:text-gold">
                {contact.phone}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
