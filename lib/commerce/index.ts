/**
 * The single door to commerce data (server side). Homepage, catalogue and
 * product pages all read through here, from the same collections, with the
 * same types — never a list written in the code.
 *
 *   store configured            → Shopify (prices, stock, cart, checkout)
 *   COMMERCE_PROVIDER=showcase  → the wines of lib/content.ts, no sale
 *   development, no store       → showcase, flagged as demonstration data
 *   production, no store        → nothing: an empty catalogue, said plainly
 */
import "server-only";
import { showcaseProvider, unavailableProvider } from "./local";
import { settings, shopifyConfigured } from "./settings";
import { shopifyProvider } from "./shopify";
import { CommerceError, type CollectionPage, type CommerceProvider, type PageRequest, type Product } from "./types";

export type * from "./types";
export { CommerceError } from "./types";

export function getCommerce(buyerIp?: string | null): CommerceProvider {
  if (settings.provider !== "showcase" && shopifyConfigured()) return shopifyProvider(buyerIp);
  if (settings.provider === "showcase" || process.env.NODE_ENV !== "production") return showcaseProvider;
  return unavailableProvider;
}

/** What the interface may say about where its wines come from. */
export function commerceStatus() {
  const c = getCommerce();
  return {
    provider: c.name,
    mode: c.capabilities.checkout ? ("buy" as const) : ("ask" as const),
    /** Demonstration data: visible as such, never in production by accident. */
    demo: c.name === "showcase" && settings.provider !== "showcase",
  };
}

export type Loaded<T> = { data: T; error: string | null };

/** A collection page, or an honest empty one with the reason (logged on the server). */
async function loadCollection(handle: string, page?: PageRequest): Promise<Loaded<CollectionPage | null>> {
  try {
    const data = await getCommerce().getCollectionPage(handle, page);
    if (!data && getCommerce().name === "shopify") {
      console.error(`[commerce] collezione "${handle}" non trovata o non pubblicata sul canale Headless`);
      return { data: null, error: "missing" };
    }
    return { data, error: getCommerce().name === "unavailable" ? "unconfigured" : null };
  } catch (e) {
    console.error("[commerce]", e instanceof CommerceError ? `${e.kind}: ${e.message}` : e);
    return { data: null, error: e instanceof CommerceError ? e.kind : "api" };
  }
}

/** The homepage selection (SHOPIFY_HOME_COLLECTION), first page, in collection order. */
export async function getHomeWines(): Promise<Loaded<Product[]>> {
  const { data, error } = await loadCollection(settings.homeCollection, { first: 12 });
  return { data: data?.products ?? [], error };
}

/** The full catalogue (SHOPIFY_CATALOG_COLLECTION), one page at a time. */
export function getCatalogPage(page: PageRequest) {
  return loadCollection(settings.catalogCollection, page);
}

/** Every product page that exists today, for prerendering; new ones render on first visit. */
export async function getCatalogHandles() {
  try {
    return await getCommerce().getCollectionHandles(settings.catalogCollection);
  } catch (e) {
    console.error("[commerce] handles:", e);
    return [];
  }
}

/** A product by handle; null when it does not exist or is not published to this storefront. */
export async function getWine(handle: string) {
  return getCommerce().getProduct(handle);
}
