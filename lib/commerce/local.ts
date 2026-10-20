/**
 * Showcase provider: the wines as written in lib/content.ts — names, notes
 * and kinds the family confirmed, nothing else. No prices, no stock, no
 * cart: none of that exists outside the store, so none of it is invented.
 *
 * It is never a silent stand-in for Shopify: it runs only when chosen
 * (COMMERCE_PROVIDER=showcase) or in development with no store configured,
 * and every product id starts with "showcase:" so it can always be told apart.
 */
import { wines, type Wine } from "@/lib/content";
import type { CollectionPage, CommerceProvider, Product } from "./types";

/**
 * "Bianco · Campania IGP" → type "Bianco", denomination "Campania IGP".
 * Only a real appellation counts as a denomination; anything else
 * ("Metodo tradizionale", "Tradizione di famiglia") is a style.
 */
function splitKind(kind: string) {
  const [type, ...rest] = kind.split("·").map((s) => s.trim());
  const tail = rest.join(" · ") || null;
  const legal = !!tail && /\b(IGP|IGT|DOC|DOCG|DOP)\b/.test(tail);
  return { type, denomination: legal ? tail : null, style: legal ? null : tail };
}

function toProduct(w: Wine): Product {
  const { type, denomination, style } = splitKind(w.kind);
  return {
    id: `showcase:${w.handle}`,
    handle: w.handle,
    title: w.name,
    description: w.note,
    availableForSale: null,
    priceRange: { min: null, max: null },
    images: [],
    variants: [
      {
        id: `showcase:${w.handle}:default`,
        title: "Bottiglia",
        availableForSale: null,
        price: null,
        selectedOptions: [],
      },
    ],
    wine: {
      type,
      denomination,
      style,
      grape: w.grape,
      vintage: null,
      alcohol: null,
      tastingNote: w.note,
      technicalSheetUrl: null,
      accent: w.accent,
      rare: w.handle === "lammiccato",
    },
  };
}

const products = wines.map(toProduct);
const EMPTY_PAGE = { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null };

export const showcaseProvider: CommerceProvider = {
  name: "showcase",
  capabilities: { prices: false, cart: false, checkout: false },
  async getCollectionPage(handle): Promise<CollectionPage | null> {
    return { handle, title: "I vini", description: "", products, pageInfo: EMPTY_PAGE };
  },
  async getProduct(handle) {
    return products.find((p) => p.handle === handle) ?? null;
  },
  async getCollectionHandles() {
    return products.map((p) => p.handle);
  },
  cart: null,
};

/** Production with no store: an empty catalogue, said plainly — never a fake one. */
export const unavailableProvider: CommerceProvider = {
  name: "unavailable",
  capabilities: { prices: false, cart: false, checkout: false },
  async getCollectionPage() {
    return null;
  },
  async getProduct() {
    return null;
  },
  async getCollectionHandles() {
    return [];
  },
  cart: null,
};
