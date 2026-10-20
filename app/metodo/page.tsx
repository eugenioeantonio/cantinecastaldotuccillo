import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { Method } from "@/components/sections/method";
import { brand, method } from "@/lib/content";

export const metadata: Metadata = {
  title: `Il metodo — ${brand.full}`,
  description: `${method.title}: ${method.lead}`,
  alternates: { canonical: "/metodo" },
};

/** The method, on its own page: the four gestures, read one at a time. */
export default function MetodoPage() {
  return (
    <>
      <SiteHeader base="/" />
      <main id="main">
        <Method />
      </main>
      <SiteFooter base="/" />
    </>
  );
}
