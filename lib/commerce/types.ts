/**
 * Commerce domain types, shaped after the Shopify Storefront API so the
 * store maps onto them 1:1. The UI only ever sees these types — never a
 * provider's raw payload.
 */

export type Money = { amount: string; currencyCode: string };

export type ProductImage = {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  /** null = unknown (no online inventory: the showcase catalogue). */
  availableForSale: boolean | null;
  price: Money | null;
  selectedOptions: { name: string; value: string }[];
};

/**
 * What makes a product a wine. In Shopify these are product metafields in
 * the `wine` namespace (see WINE_METAFIELDS in ./shopify.ts and
 * docs/SHOPIFY.md). Every field is optional in the store: nothing is
 * invented when the merchant leaves it empty.
 */
export type WineDetails = {
  /** e.g. "Bianco", "Rosso", "Spumante". Metafield, else Shopify's product type. */
  type: string;
  /** Legal appellation only (IGP, DOC, DOCG, DOP), e.g. "Campania IGP". */
  denomination: string | null;
  /** How it is made or kept, when that is not an appellation, e.g. "Metodo tradizionale". */
  style: string | null;
  grape: string | null;
  vintage: number | null;
  /** Alcohol by volume, % (e.g. 13.5). */
  alcohol: number | null;
  tastingNote: string;
  /** Technical sheet (PDF uploaded to Shopify Files). */
  technicalSheetUrl: string | null;
  /** Tint used by the interface, kept inside the brand family. */
  accent: string;
  /** The family's rare wine gets its own scene on the homepage. */
  rare: boolean;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  /** null = unknown until a store reports it. */
  availableForSale: boolean | null;
  priceRange: { min: Money | null; max: Money | null };
  images: ProductImage[];
  variants: ProductVariant[];
  wine: WineDetails;
};

export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};

/** One page of a collection, in the collection's own order. */
export type CollectionPage = {
  handle: string;
  title: string;
  description: string;
  products: Product[];
  pageInfo: PageInfo;
};

export type PageRequest = { first?: number; after?: string | null; before?: string | null };

export type CartLine = {
  id: string;
  quantity: number;
  merchandiseId: string;
  productHandle: string;
  productTitle: string;
  /** The variant's name when the product has more than one (e.g. "Magnum"). */
  variantTitle: string | null;
  availableForSale: boolean;
  image: ProductImage | null;
  unitPrice: Money;
  cost: Money;
};

export type Cart = {
  id: string;
  /** Shopify's own checkout for this cart — the only way to pay. */
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  cost: { subtotal: Money; total: Money };
  /** Non-blocking notices from Shopify (e.g. not enough stock, quantity reduced). */
  warnings: string[];
};

export type LineInput = { merchandiseId: string; quantity: number };

export type CartApi = {
  create(lines?: LineInput[]): Promise<Cart>;
  get(cartId: string): Promise<Cart | null>;
  addLines(cartId: string, lines: LineInput[]): Promise<Cart>;
  updateLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<Cart>;
  removeLines(cartId: string, lineIds: string[]): Promise<Cart>;
};

/**
 * - "shopify": the store, live — prices, stock, cart, Shopify checkout.
 * - "showcase": the wines as written in lib/content.ts, explicitly chosen or
 *   in development only — no prices, no cart, never mistaken for the store.
 * - "unavailable": production without a store — an empty catalogue, never
 *   a fake one.
 */
export type ProviderName = "shopify" | "showcase" | "unavailable";

export type CommerceProvider = {
  name: ProviderName;
  /** What the interface may offer. */
  capabilities: { prices: boolean; cart: boolean; checkout: boolean };
  getCollectionPage(handle: string, page?: PageRequest): Promise<CollectionPage | null>;
  getProduct(handle: string): Promise<Product | null>;
  /** Every product handle in a collection (all pages), in its order. */
  getCollectionHandles(handle: string): Promise<string[]>;
  cart: CartApi | null;
};

/** A typed failure from the store, so pages can say so instead of guessing. */
export class CommerceError extends Error {
  constructor(
    message: string,
    readonly kind: "config" | "network" | "api" | "user",
  ) {
    super(message);
    this.name = "CommerceError";
  }
}
