import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { settings, SHOPIFY_TAG } from "@/lib/commerce/settings";

/**
 * Shopify → site refresh. In the admin (Settings → Notifications → Webhooks)
 * point the product, collection and inventory events here; each delivery is
 * verified with the signing key shown on that page (SHOPIFY_WEBHOOK_SECRET)
 * and then expires every cached store read, so the next visit shows the
 * merchant's change. Unsigned or wrongly signed requests are refused.
 */
export async function POST(request: Request) {
  if (!settings.webhookSecret) {
    return Response.json({ ok: false, error: "webhook non configurato" }, { status: 503 });
  }
  const raw = await request.text(); // the exact bytes Shopify signed
  const given = Buffer.from(request.headers.get("x-shopify-hmac-sha256") ?? "", "base64");
  const expected = createHmac("sha256", settings.webhookSecret).update(raw, "utf8").digest();
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const shop = request.headers.get("x-shopify-shop-domain");
  if (settings.domain && shop && !settings.domain.endsWith(shop)) {
    return Response.json({ ok: false, error: "negozio diverso" }, { status: 403 });
  }

  // expire at once: the next request reads the store again
  revalidateTag(SHOPIFY_TAG, { expire: 0 });
  console.info(`[shopify] ${request.headers.get("x-shopify-topic")} da ${shop}: catalogo aggiornato`);
  return Response.json({ ok: true });
}
