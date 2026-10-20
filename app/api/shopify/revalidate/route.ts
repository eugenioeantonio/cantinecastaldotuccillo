import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { settings, SHOPIFY_TAG } from "@/lib/commerce/settings";

/**
 * Manual refresh, for the developer or an automation:
 *   curl -X POST -H "Authorization: Bearer $SHOPIFY_REVALIDATE_SECRET" https://…/api/shopify/revalidate
 */
export async function POST(request: Request) {
  const secret = settings.revalidateSecret;
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const ok = !!secret && given.length === secret.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) return Response.json({ ok: false }, { status: 401 });
  revalidateTag(SHOPIFY_TAG, { expire: 0 });
  return Response.json({ ok: true, revalidated: SHOPIFY_TAG, at: new Date().toISOString() });
}
