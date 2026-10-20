import type { Money, Product } from "./types";

/** "€ 18,00" — the store's amount and currency, formatted the Italian way. */
export const formatMoney = (m: Money | null | undefined) =>
  m ? new Intl.NumberFormat("it-IT", { style: "currency", currency: m.currencyCode }).format(Number(m.amount)) : null;

/** The price line of a product: one price, or "da …" when the formats differ. */
export function priceLabel(p: Pick<Product, "priceRange">) {
  const { min, max } = p.priceRange;
  if (!min) return null;
  return max && Number(max.amount) > Number(min.amount) ? `da ${formatMoney(min)}` : formatMoney(min);
}
