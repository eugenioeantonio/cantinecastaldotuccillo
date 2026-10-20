import { SiteHeader } from "@/components/site-header";
import { Preloader } from "@/components/preloader";
import { ScrollProgress } from "@/components/scroll-progress";
import { Hero } from "@/components/hero/hero";
import { Credo } from "@/components/sections/credo";
import { Territory } from "@/components/sections/territory";
import { CatalogNotice, Wines } from "@/components/sections/wines";
import { Lammiccato } from "@/components/sections/lammiccato";
import { SiteFooter } from "@/components/sections/site-footer";
import { commerceStatus, getHomeWines } from "@/lib/commerce";
import { contact } from "@/lib/content";

/**
 * One continuous scene: the glass, its wine, the family in a sentence, the
 * ground, the wines, the rare one. The method, the visit and the wines have
 * pages of their own (/metodo, /visita, /vini).
 *
 * The wines are the store's homepage selection (SHOPIFY_HOME_COLLECTION),
 * in the collection's order; the rare one is the wine marked `wine.rare`.
 */
export default async function Home() {
  const { mode } = commerceStatus();
  const { data: wines, error } = await getHomeWines();
  const rare = wines.find((w) => w.wine.rare);

  return (
    <>
      <Preloader />
      <ScrollProgress />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Credo />
        <Territory />
        <Wines
          products={wines}
          mode={mode}
          notice={<CatalogNotice reason={error ?? "missing"} email={contact.email} phone={contact.phone} phoneHref={contact.phoneHref} />}
        />
        {rare && <Lammiccato product={rare} mode={mode} />}
      </main>
      <SiteFooter />
    </>
  );
}
