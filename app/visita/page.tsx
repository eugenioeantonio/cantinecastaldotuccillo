import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { Experience } from "@/components/sections/experience";
import { brand, experience } from "@/lib/content";

export const metadata: Metadata = {
  title: `La visita — ${brand.full}`,
  description: experience.lead,
  alternates: { canonical: "/visita" },
};

/** The visit, on its own page: the invitation and everything needed to come. */
export default function VisitaPage() {
  return (
    <>
      <SiteHeader base="/" />
      <main id="main">
        <Experience />
      </main>
      <SiteFooter base="/" />
    </>
  );
}
