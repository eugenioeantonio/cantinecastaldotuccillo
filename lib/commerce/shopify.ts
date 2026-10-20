/**
 * Shopify Storefront API provider (headless). Selected when the store is
 * configured (lib/commerce/settings.ts). Server only: the private token
 * never reaches the browser.
 *
 * - Catalogue reads are cached and tagged "shopify": a verified webhook
 *   refreshes them at once (app/api/shopify/webhooks), and they also expire
 *   on their own after SHOPIFY_REVALIDATE_SECONDS.
 * - Carts are never cached: prices and stock in the cart are always live,
 *   and checkout is Shopify's own (cart.checkoutUrl).
 */
import "server-only";
import { settings, SHOPIFY_TAG } from "./settings";
import {
  CommerceError,
  type Cart,
  type CartApi,
  type CollectionPage,
  type CommerceProvider,
  type Money,
  type PageRequest,
  type Product,
  type ProductImage,
} from "./types";

/**
 * Product metafield definitions to create in Shopify (namespace "wine"),
 * each with Storefronts access enabled. All optional; see docs/SHOPIFY.md.
 */
export const WINE_METAFIELDS = {
  type: "single_line_text_field", // Bianco · Rosso · Spumante (else: product type)
  denomination: "single_line_text_field", // legal appellation only: Campania IGP …
  style: "single_line_text_field", // Metodo tradizionale, Tradizione di famiglia …
  grape: "single_line_text_field", // vitigno / uve
  vintage: "number_integer", // annata
  alcohol: "number_decimal", // % vol
  tasting_note: "multi_line_text_field", // else: the product description
  technical_sheet: "file_reference", // PDF in Content → Files
  accent: "color", // the wine's tint in the interface
  rare: "boolean", // the wine with its own scene on the homepage
} as const;

const DEFAULT_ACCENT = "#4a0f1b";
const PAGE_SIZE = 24;

type Options = { buyerIp?: string | null; live?: boolean };

async function storefront<T>(query: string, variables: Record<string, unknown> = {}, opts: Options = {}): Promise<T> {
  const { domain, privateToken, publicToken, apiVersion } = settings;
  if (!domain || !(privateToken || publicToken)) throw new CommerceError("Shopify non configurato", "config");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (privateToken) {
    headers["Shopify-Storefront-Private-Token"] = privateToken;
    // On buyer traffic Shopify needs the buyer's IP (bot protection, throttling).
    if (opts.buyerIp) headers["Shopify-Storefront-Buyer-IP"] = opts.buyerIp;
  } else if (publicToken) {
    headers["X-Shopify-Storefront-Access-Token"] = publicToken;
  }

  const base = /^https?:\/\//.test(domain) ? domain : `https://${domain}`;
  let res: Response;
  try {
    res = await fetch(`${base}/api/${apiVersion}/graphql.json`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables: { country: settings.country, language: settings.language, ...variables },
      }),
      ...(opts.live
        ? { cache: "no-store" as const }
        : { next: { revalidate: settings.revalidate, tags: [SHOPIFY_TAG] } }),
    });
  } catch (e) {
    throw new CommerceError(`Shopify non raggiungibile: ${(e as Error).message}`, "network");
  }
  const json = (await res.json().catch(() => ({}))) as { data?: T; errors?: { message: string }[] };
  if (!res.ok || json.errors?.length || !json.data) {
    throw new CommerceError(`Shopify: ${json.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status}`}`, "api");
  }
  return json.data;
}

/** Market context: prices, currency and language as the Italian market sees them. */
const CONTEXT = "@inContext(country: $country, language: $language)";
const CONTEXT_VARS = "$country: CountryCode, $language: LanguageCode";

const METAFIELD_IDS = Object.keys(WINE_METAFIELDS)
  .map((key) => `{namespace: "wine", key: "${key}"}`)
  .join(", ");

const IMAGE = "url altText width height";

const PRODUCT_FIELDS = /* GraphQL */ `
  id
  handle
  title
  description
  productType
  availableForSale
  priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
  images(first: 8) { nodes { ${IMAGE} } }
  variants(first: 24) {
    nodes { id title availableForSale price { amount currencyCode } selectedOptions { name value } }
  }
  metafields(identifiers: [${METAFIELD_IDS}]) {
    key
    value
    reference { ... on GenericFile { url } ... on MediaImage { image { url } } }
  }
`;

type RawProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  availableForSale: boolean;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  images: { nodes: ProductImage[] };
  variants: {
    nodes: {
      id: string;
      title: string;
      availableForSale: boolean;
      price: Money;
      selectedOptions: { name: string; value: string }[];
    }[];
  };
  metafields: ({ key: string; value: string; reference: { url?: string; image?: { url: string } } | null } | null)[];
};

const num = (v: string | undefined) => {
  const n = v === undefined ? NaN : Number(v);
  return Number.isFinite(n) ? n : null;
};

function toProduct(p: RawProduct): Product {
  const meta = new Map(p.metafields.filter((m) => !!m).map((m) => [m!.key, m!]));
  const text = (k: string) => meta.get(k)?.value?.trim() || null;
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    availableForSale: p.availableForSale,
    priceRange: { min: p.priceRange.minVariantPrice, max: p.priceRange.maxVariantPrice },
    images: p.images.nodes,
    variants: p.variants.nodes,
    wine: {
      type: text("type") ?? p.productType ?? "",
      denomination: text("denomination"),
      style: text("style"),
      grape: text("grape"),
      vintage: num(text("vintage") ?? undefined),
      alcohol: num(text("alcohol") ?? undefined),
      tastingNote: text("tasting_note") ?? p.description,
      technicalSheetUrl: meta.get("technical_sheet")?.reference?.url ?? null,
      accent: text("accent") ?? DEFAULT_ACCENT,
      rare: text("rare") === "true",
    },
  };
}

const PAGE_INFO = "pageInfo { hasNextPage hasPreviousPage startCursor endCursor }";

const CART_FIELDS = /* GraphQL */ `
  id
  checkoutUrl
  totalQuantity
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
  lines(first: 100) {
    nodes {
      id
      quantity
      cost { totalAmount { amount currencyCode } amountPerQuantity { amount currencyCode } }
      merchandise {
        ... on ProductVariant {
          id
          title
          availableForSale
          image { ${IMAGE} }
          product { handle title }
        }
      }
    }
  }
`;

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      cost: { totalAmount: Money; amountPerQuantity: Money };
      merchandise: {
        id: string;
        title: string;
        availableForSale: boolean;
        image: ProductImage | null;
        product: { handle: string; title: string };
      };
    }[];
  };
};

const toCart = (c: RawCart, warnings: string[] = []): Cart => ({
  id: c.id,
  checkoutUrl: c.checkoutUrl,
  totalQuantity: c.totalQuantity,
  cost: { subtotal: c.cost.subtotalAmount, total: c.cost.totalAmount },
  warnings,
  lines: c.lines.nodes.map((l) => ({
    id: l.id,
    quantity: l.quantity,
    merchandiseId: l.merchandise.id,
    productHandle: l.merchandise.product.handle,
    productTitle: l.merchandise.product.title,
    // Shopify names a single, unnamed variant "Default Title"
    variantTitle: l.merchandise.title === "Default Title" ? null : l.merchandise.title,
    availableForSale: l.merchandise.availableForSale,
    image: l.merchandise.image,
    unitPrice: l.cost.amountPerQuantity,
    cost: l.cost.totalAmount,
  })),
});

type MutationResult = {
  cart: RawCart | null;
  userErrors: { message: string }[];
  warnings?: { message: string }[];
};

function cartApi(buyerIp?: string | null): CartApi {
  const mutate = async (name: string, signature: string, args: string, variables: Record<string, unknown>) => {
    const data = await storefront<Record<string, MutationResult>>(
      `mutation ${name}(${signature}, ${CONTEXT_VARS}) ${CONTEXT} {
        ${name}(${args}) { cart { ${CART_FIELDS} } userErrors { message } warnings { message } }
      }`,
      variables,
      { buyerIp, live: true },
    );
    const result = data[name];
    if (result.userErrors.length || !result.cart) {
      throw new CommerceError(result.userErrors.map((e) => e.message).join("; ") || "Carrello non aggiornato", "user");
    }
    return toCart(result.cart, result.warnings?.map((w) => w.message) ?? []);
  };
  return {
    create: (lines = []) => mutate("cartCreate", "$input: CartInput", "input: $input", { input: { lines } }),
    async get(cartId) {
      const data = await storefront<{ cart: RawCart | null }>(
        `query cart($id: ID!, ${CONTEXT_VARS}) ${CONTEXT} { cart(id: $id) { ${CART_FIELDS} } }`,
        { id: cartId },
        { buyerIp, live: true },
      );
      return data.cart ? toCart(data.cart) : null;
    },
    addLines: (cartId, lines) =>
      mutate("cartLinesAdd", "$cartId: ID!, $lines: [CartLineInput!]!", "cartId: $cartId, lines: $lines", { cartId, lines }),
    updateLines: (cartId, lines) =>
      mutate("cartLinesUpdate", "$cartId: ID!, $lines: [CartLineUpdateInput!]!", "cartId: $cartId, lines: $lines", {
        cartId,
        lines,
      }),
    removeLines: (cartId, lineIds) =>
      mutate("cartLinesRemove", "$cartId: ID!, $lineIds: [ID!]!", "cartId: $cartId, lineIds: $lineIds", { cartId, lineIds }),
  };
}

type RawCollection = {
  handle: string;
  title: string;
  description: string;
  products: { nodes: RawProduct[]; pageInfo: CollectionPage["pageInfo"] };
} | null;

export function shopifyProvider(buyerIp?: string | null): CommerceProvider {
  return {
    name: "shopify",
    capabilities: { prices: true, cart: true, checkout: true },
    async getCollectionPage(handle, page: PageRequest = {}) {
      const size = page.first ?? PAGE_SIZE;
      const backwards = !!page.before;
      const data = await storefront<{ collection: RawCollection }>(
        `query collectionPage($handle: String!, $first: Int, $after: String, $last: Int, $before: String, ${CONTEXT_VARS}) ${CONTEXT} {
          collection(handle: $handle) {
            handle title description
            products(first: $first, after: $after, last: $last, before: $before, sortKey: COLLECTION_DEFAULT) {
              ${PAGE_INFO}
              nodes { ${PRODUCT_FIELDS} }
            }
          }
        }`,
        backwards
          ? { handle, last: size, before: page.before }
          : { handle, first: size, after: page.after ?? null },
      );
      const c = data.collection;
      return c
        ? {
            handle: c.handle,
            title: c.title,
            description: c.description,
            products: c.products.nodes.map(toProduct),
            pageInfo: c.products.pageInfo,
          }
        : null;
    },
    async getProduct(handle) {
      const data = await storefront<{ product: RawProduct | null }>(
        `query product($handle: String!, ${CONTEXT_VARS}) ${CONTEXT} { product(handle: $handle) { ${PRODUCT_FIELDS} } }`,
        { handle },
      );
      return data.product ? toProduct(data.product) : null;
    },
    async getCollectionHandles(handle) {
      const handles: string[] = [];
      let after: string | null = null;
      for (let guard = 0; guard < 20; guard++) {
        const data: {
          collection: { products: { nodes: { handle: string }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } | null;
        } = await storefront(
          `query handles($handle: String!, $after: String, ${CONTEXT_VARS}) ${CONTEXT} {
            collection(handle: $handle) {
              products(first: 250, after: $after, sortKey: COLLECTION_DEFAULT) { nodes { handle } pageInfo { hasNextPage endCursor } }
            }
          }`,
          { handle, after },
        );
        if (!data.collection) break;
        handles.push(...data.collection.products.nodes.map((n) => n.handle));
        if (!data.collection.products.pageInfo.hasNextPage) break;
        after = data.collection.products.pageInfo.endCursor;
      }
      return handles;
    },
    cart: cartApi(buyerIp),
  };
}
