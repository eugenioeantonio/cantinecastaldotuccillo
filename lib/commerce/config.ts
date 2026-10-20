/**
 * Client-safe purchase entry point (navigation label and target).
 * The data layer itself lives in lib/commerce/index.ts (server-only).
 */
export const commerce = {
  label: "Acquista",
  // the wines page, where each wine has its request (or, with the store, its purchase)
  href: "/vini",
} as const;
