/**
 * Store settings, read once from the environment (server only). Nothing
 * secret is ever written in the code: tokens live in `.env.local` locally
 * and in the host's environment variables in production.
 *
 * See .env.example for every variable and docs/SHOPIFY.md for where each
 * value comes from in the Shopify admin.
 */
import "server-only";

const env = (key: string) => process.env[key]?.trim() || undefined;

export const settings = {
  /** e.g. "castaldo-tuccillo.myshopify.com" (the permanent .myshopify.com domain). */
  domain: env("SHOPIFY_STORE_DOMAIN"),
  /** Headless channel → storefront → private token. Server only, preferred. */
  privateToken: env("SHOPIFY_STOREFRONT_PRIVATE_TOKEN"),
  /** Headless channel → storefront → public token. Used when no private token is set. */
  publicToken: env("SHOPIFY_STOREFRONT_PUBLIC_TOKEN") ?? env("SHOPIFY_STOREFRONT_ACCESS_TOKEN"),
  apiVersion: env("SHOPIFY_STOREFRONT_API_VERSION") ?? "2026-10",
  /** The full catalogue on /vini: a collection's handle, in its own order. */
  catalogCollection: env("SHOPIFY_CATALOG_COLLECTION") ?? "vini",
  /** The homepage selection: another collection, or the same one. */
  homeCollection: env("SHOPIFY_HOME_COLLECTION") ?? env("SHOPIFY_CATALOG_COLLECTION") ?? "vini",
  /** Market context for prices, currency and translations. */
  country: env("SHOPIFY_COUNTRY") ?? "IT",
  language: env("SHOPIFY_LANGUAGE") ?? "IT",
  /** Fallback refresh in seconds; webhooks refresh at once (see app/api/shopify). */
  revalidate: Number(env("SHOPIFY_REVALIDATE_SECONDS") ?? 900),
  /** Signing key of the admin webhooks (Settings → Notifications → Webhooks). */
  webhookSecret: env("SHOPIFY_WEBHOOK_SECRET"),
  /** Bearer token for a manual refresh (POST /api/shopify/revalidate). */
  revalidateSecret: env("SHOPIFY_REVALIDATE_SECRET"),
  /**
   * "showcase" shows the wines written in lib/content.ts without prices or
   * cart — only when chosen explicitly (or in development with no store).
   */
  provider: env("COMMERCE_PROVIDER") as "shopify" | "showcase" | undefined,
} as const;

export const shopifyConfigured = () => !!(settings.domain && (settings.privateToken || settings.publicToken));

/** One tag for everything read from the store: a webhook refreshes it all. */
export const SHOPIFY_TAG = "shopify";
