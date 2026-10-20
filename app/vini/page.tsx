import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { CatalogNotice, Wines } from "@/components/sections/wines";
import { commerceStatus, getCatalogPage } from "@/lib/commerce";
import { brand, contact } from "@/lib/content";

export const metadata: Metadata = {
  title: `I vini — ${brand.full}`,
  description: "I vini della famiglia Castaldo Tuccillo, dal Vesuvio.",
  alternates: { canonical: "/vini" },
};

const PAGE_SIZE = 24;

/**
 * The full catalogue: every wine in the store's catalogue collection
 * (SHOPIFY_CATALOG_COLLECTION), in the collection's order, a page at a time.
 * Same grid and same data source as the homepage.
 */
export default async function ViniPage({ searchParams }: { searchParams: Promise<{ dopo?: string; prima?: string }> }) {
  const { dopo, prima } = await searchParams;
  const { mode } = commerceStatus();
  const { data, error } = await getCatalogPage({ first: PAGE_SIZE, after: dopo ?? null, before: prima ?? null });
  const products = data?.products ?? [];
  const info = data?.pageInfo;
  const paged = !!(info?.hasNextPage || info?.hasPreviousPage);

  const link = "group inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-ivory transition-colors hover:text-gold";
  const pagination = paged && info && (
    <nav aria-label="Pagine del catalogo" className="mt-16 flex items-center justify-between border-t border-gold/15 pt-8">
      {info.hasPreviousPage && info.startCursor ? (
        <Link href={`/vini?prima=${encodeURIComponent(info.startCursor)}`} className={link}>
          <span aria-hidden className="h-px w-8 bg-gold/60 transition-[width] duration-500 group-hover:w-14" />
          Vini precedenti
        </Link>
      ) : (
        <span />
      )}
      {info.hasNextPage && info.endCursor && (
        <Link href={`/vini?dopo=${encodeURIComponent(info.endCursor)}`} className={link}>
          Altri vini
          <span aria-hidden className="h-px w-8 bg-gold/60 transition-[width] duration-500 group-hover:w-14" />
        </Link>
      )}
    </nav>
  );

  return (
    <>
      <SiteHeader base="/" />
      <main id="main">
        <Wines
          products={products}
          mode={mode}
          page
          partial={paged}
          pagination={pagination}
          notice={<CatalogNotice reason={error ?? "missing"} email={contact.email} phone={contact.phone} phoneHref={contact.phoneHref} />}
        />
      </main>
      <SiteFooter base="/" />
    </>
  );
}
