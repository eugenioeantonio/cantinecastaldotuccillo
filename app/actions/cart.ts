"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { CommerceError, getCommerce, type Cart } from "@/lib/commerce";

/**
 * The cart lives in Shopify; the site only keeps its id, in an httpOnly
 * cookie. Every action answers with the cart as Shopify now sees it (live
 * prices and stock) or with a message the visitor can act on. Payment and
 * orders are Shopify's own: the site hands over to cart.checkoutUrl.
 */

const CART_COOKIE = "cct_cart";
const MAX_QUANTITY = 48;

export type CartState = { cart: Cart | null; error: string | null };

async function store() {
  const h = await headers();
  // the buyer's IP, so Shopify can tell real buyers from bots
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  const commerce = getCommerce(ip);
  if (!commerce.cart) throw new CommerceError("Il carrello non è disponibile", "config");
  return commerce.cart;
}

async function remember(cart: Cart | null) {
  const jar = await cookies();
  if (!cart) {
    jar.delete(CART_COOKIE);
    return;
  }
  jar.set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

const cartId = async () => (await cookies()).get(CART_COOKIE)?.value ?? null;

function failure(e: unknown, cart: Cart | null = null): CartState {
  if (e instanceof CommerceError && e.kind === "user") return { cart, error: e.message };
  console.error("[cart]", e);
  return { cart, error: "Il negozio non risponde. Riprova tra poco." };
}

const clamp = (q: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.floor(q) || 1));

/** The visitor's cart, or null; a cart Shopify no longer knows is forgotten. */
export async function readCart(): Promise<CartState> {
  const id = await cartId();
  if (!id) return { cart: null, error: null };
  try {
    const cart = await (await store()).get(id);
    if (!cart) await remember(null);
    return { cart, error: null };
  } catch (e) {
    return failure(e);
  }
}

export async function addToCart(merchandiseId: string, quantity = 1): Promise<CartState> {
  if (!merchandiseId) return { cart: null, error: "Scegli un formato." };
  const lines = [{ merchandiseId, quantity: clamp(quantity) }];
  try {
    const api = await store();
    const id = await cartId();
    let cart: Cart | null = null;
    if (id) {
      try {
        cart = await api.addLines(id, lines);
      } catch (e) {
        // an expired or completed cart: start a new one
        if (!(e instanceof CommerceError && e.kind === "user") || (await api.get(id))) throw e;
      }
    }
    cart ??= await api.create(lines);
    await remember(cart);
    return { cart, error: null };
  } catch (e) {
    return failure(e);
  }
}

export async function updateCartLine(lineId: string, quantity: number): Promise<CartState> {
  const id = await cartId();
  if (!id) return { cart: null, error: "Il carrello è scaduto." };
  try {
    const api = await store();
    const cart =
      quantity <= 0 ? await api.removeLines(id, [lineId]) : await api.updateLines(id, [{ id: lineId, quantity: clamp(quantity) }]);
    return { cart, error: null };
  } catch (e) {
    return failure(e);
  }
}

export async function removeCartLine(lineId: string): Promise<CartState> {
  return updateCartLine(lineId, 0);
}

/** Hands the visitor to Shopify's checkout with the cart as it is right now. */
export async function goToCheckout(): Promise<CartState> {
  const { cart, error } = await readCart();
  if (error) return { cart, error };
  if (!cart || cart.totalQuantity === 0) return { cart, error: "Il carrello è vuoto." };
  if (cart.lines.some((l) => !l.availableForSale)) {
    return { cart, error: "Alcuni vini non sono più disponibili: rimuovili per continuare." };
  }
  redirect(cart.checkoutUrl);
}

/** "Buy now" from a plain form: a new cart with one wine, straight to checkout. */
export async function buyNow(formData: FormData) {
  const variantId = String(formData.get("variantId") ?? "");
  const quantity = clamp(Number(formData.get("quantity")) || 1);
  const api = await store();
  const cart = await api.create([{ merchandiseId: variantId, quantity }]);
  redirect(cart.checkoutUrl);
}
