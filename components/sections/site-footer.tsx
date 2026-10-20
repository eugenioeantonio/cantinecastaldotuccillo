import Image from "next/image";
import Link from "next/link";
import { brand, contact, nav, isPageHref, navHref } from "@/lib/content";
import { commerce } from "@/lib/commerce/config";

/** Intrinsic sizes of the brand assets in /public/brand. */
const LOGO = { width: 370, height: 384 } as const;
const STEPS = { width: 418, height: 96 } as const;

/**
 * The close: the family's mark and the claim, set large, as the last thing
 * on the page — then only what a visitor needs to leave with.
 */
export function SiteFooter({ base = "" }: { base?: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(180deg,#160810_0%,#0e0509_28%)] px-6 pb-10 pt-[14vh] sm:px-[clamp(24px,7vw,120px)]">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-end gap-10 md:grid-cols-[auto_1fr]">
          <Image
            src="/brand/logo.png"
            alt={brand.full}
            width={LOGO.width}
            height={LOGO.height}
            sizes="96px"
            className="h-20 w-auto opacity-90 md:h-24"
          />
          <p className="font-serif text-[clamp(40px,7vw,108px)] font-medium leading-[0.95] tracking-[-0.015em] text-ivory md:text-right">
            Il tempo <em className="italic text-stone">diventa</em> vino.
          </p>
        </div>

        <div className="mt-[10vh] grid gap-10 border-t border-gold/15 pt-10 text-[14px] font-light text-ivory/65 sm:grid-cols-2 md:grid-cols-4">
          <nav aria-label="Sezioni">
            <ul className="space-y-2.5">
              {[...nav, { label: commerce.label, href: commerce.href }].map((n) => {
                const Item = isPageHref(n.href) ? Link : "a";
                return (
                  <li key={n.label}>
                    <Item href={navHref(n.href, base)} className="transition-colors hover:text-gold">
                      {n.label}
                    </Item>
                  </li>
                );
              })}
            </ul>
          </nav>
          <address className="not-italic leading-relaxed">
            {brand.full}
            <br />
            {contact.street}
            <br />
            {contact.city} ({contact.region}), {contact.country}
          </address>
          <p className="leading-relaxed">
            {contact.hours[0].days}
            {contact.hours.map((h) => (
              <span key={h.time} className="block tabular-nums">
                {h.time}
              </span>
            ))}
          </p>
          <ul className="space-y-2.5">
            <li>
              <a href={contact.phoneHref} className="transition-colors hover:text-gold">
                {contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="transition-colors hover:text-gold">
                {contact.email.split("@")[0]}
                <wbr />@{contact.email.split("@")[1]}
              </a>
            </li>
            <li>
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold">
                Facebook
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 text-[11px] uppercase tracking-[0.16em] text-ivory/45 sm:flex-row sm:items-center">
          <span>
            © {year} {brand.full}
          </span>
          <span className="flex items-center gap-2 whitespace-nowrap">
            Powered by
            <Image
              src="/brand/steps.png"
              alt="STEPS"
              width={STEPS.width}
              height={STEPS.height}
              className="h-[11px] w-auto opacity-60 sm:h-[13px]"
            />
          </span>
        </div>
      </div>
    </footer>
  );
}
