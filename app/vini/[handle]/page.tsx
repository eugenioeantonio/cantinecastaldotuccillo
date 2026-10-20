import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { BottleNiche, WineDisc } from "@/components/sections/wines";
import { PhotoPlate } from "@/components/primitives/photo-plate";
import { ProductPurchase } from "@/components/commerce/purchase-action";
import { commerceStatus, getCatalogHandles, getCatalogPage, getWine } from "@/lib/commerce";
import { formatMoney } from "@/lib/commerce/format";
import { bottleSlotFor } from "@/lib/photo-slots";
import { brand } from "@/lib/content";

/**
 * Every wine published in the catalogue is prerendered; a wine added in
 * Shopify later renders on its first visit (dynamicParams) — no new page
 * in the code. A wine unpublished or deleted answers 404.
 */
export async function generateStaticParams() {
  const handles = await getCatalogHandles();
  return handles.map((handle) => ({ handle }));
}
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const wine = await getWine(handle);
  if (!wine) return {};
  return {
    title: `${wine.title} — ${brand.full}`,
    description: wine.wine.tastingNote,
    alternates: { canonical: `/vini/${wine.handle}` },
  };
}

/**
 * A wine's own page: the bottle (or its waiting place), the label read
 * aloud, and one way to have it. Built on the commerce types, so the store
 * fills it without a redesign.
 */
export default async function WinePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const wine = await getWine(handle);
  if (!wine) notFound();
  const { mode } = commerceStatus();
  const others = ((await getCatalogPage({ first: 7 })).data?.products ?? []).filter((w) => w.handle !== wine.handle).slice(0, 6);
  const slot = bottleSlotFor(wine.handle);
  const image = wine.images[0];
  const details: [string, string | null][] = [
    ["Tipologia", wine.wine.type || null],
    ["Denominazione", wine.wine.denomination],
    ["Stile", wine.wine.style],
    // the family names a grape for some wines, a selection for others
    [wine.wine.grape === wine.title ? "Vitigno" : "Uve", wine.wine.grape],
    ["Annata", wine.wine.vintage ? String(wine.wine.vintage) : null],
    ["Gradazione", wine.wine.alcohol ? `${String(wine.wine.alcohol).replace(".", ",")}% vol` : null],
    // with the cart the price lives by the purchase, per format
    ["Prezzo", mode === "ask" ? formatMoney(wine.priceRange.min) : null],
  ];

  return (
    <>
      <SiteHeader base="/" />
      <main
        id="main"
        className="relative min-h-[100svh] overflow-hidden px-6 pb-[14vh] pt-[18vh] sm:px-[clamp(24px,7vw,120px)]"
        style={{
          background: `radial-gradient(90% 60% at 20% 10%, ${wine.wine.accent}26, transparent 70%), linear-gradient(180deg, #120a10, #08040a)`,
        }}
      >
        <div className="mx-auto max-w-6xl">
          <Link
            href="/vini"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.26em] text-stone/70 transition-colors hover:text-ivory"
          >
            <svg aria-hidden viewBox="0 0 16 12" className="h-3 w-4 fill-none stroke-current stroke-[1.2]">
              <path d="M15 6H2M6.5 1.5 2 6l4.5 4.5" />
            </svg>
            La carta dei vini
          </Link>

          <div className="mt-[8vh] grid gap-14 md:grid-cols-12">
            <div className="md:col-span-4">
              {image ? (
                <div className="relative aspect-[1/3] max-h-[78vh] w-full">
                  <Image src={image.url} alt={image.altText ?? wine.title} fill sizes="(max-width: 768px) 100vw, 30vw" className="object-contain" priority />
                </div>
              ) : slot ? (
                <PhotoPlate slot={slot} className="mx-auto max-w-[220px] md:max-w-none" sizes="30vw" />
              ) : (
                // a wine added in Shopify without photographs yet: the same quiet niche as the grid
                <div className="mx-auto max-w-[280px] md:max-w-none">
                  <BottleNiche product={wine} />
                </div>
              )}
            </div>

            <div className="md:col-span-7 md:col-start-6">
              <div className="flex items-center gap-4">
                <WineDisc accent={wine.wine.accent} className="h-auto w-14" />
                <p className="text-[11px] uppercase tracking-[0.28em] text-stone/70">
                  {wine.wine.type}
                  {wine.wine.denomination || wine.wine.style ? ` · ${wine.wine.denomination ?? wine.wine.style}` : ""}
                </p>
              </div>
              <h1 className={`mt-8 font-serif text-[clamp(56px,9vw,148px)] font-medium leading-[0.92] tracking-[-0.02em] ${wine.wine.rare ? "italic text-stone" : "text-ivory"}`}>
                {wine.title}
              </h1>
              <p className="mt-10 max-w-[30ch] font-serif text-[clamp(22px,2.4vw,32px)] font-light leading-[1.4] text-ivory/85">
                {wine.wine.tastingNote}
              </p>

              <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-10 gap-y-6 border-t border-gold/15 pt-8">
                {details
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[11px] uppercase tracking-[0.26em] text-stone/60">{k}</dt>
                      <dd className="mt-2 text-[16px] font-light text-ivory/85">{v}</dd>
                    </div>
                  ))}
              </dl>

              {wine.wine.technicalSheetUrl && (
                <a
                  href={wine.wine.technicalSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-block border-b border-gold/40 text-[12px] uppercase tracking-[0.2em] text-gold hover:border-gold"
                >
                  Scheda tecnica (PDF)
                </a>
              )}

              <div className="mt-12">
                <ProductPurchase product={wine} mode={mode} />
              </div>
            </div>
          </div>

          <nav aria-label="Altri vini" className="mt-[16vh] border-t border-gold/15">
            <ul>
              {others.map((o) => (
                <li key={o.handle} className="border-b border-gold/15">
                  <Link href={`/vini/${o.handle}`} className="group flex items-center gap-5 py-6">
                    <WineDisc accent={o.wine.accent} className="h-auto w-10" />
                    <span className={`font-serif text-[clamp(26px,3vw,40px)] font-medium transition-colors group-hover:text-gold ${o.wine.rare ? "italic text-stone" : "text-ivory"}`}>
                      {o.title}
                    </span>
                    <span className="ml-auto text-[11px] uppercase tracking-[0.22em] text-stone/60">{o.wine.type}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <SiteFooter base="/" />
    </>
  );
}
