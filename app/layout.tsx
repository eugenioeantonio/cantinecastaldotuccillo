import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { seo, brand, contact } from "@/lib/content";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),
  title: seo.title,
  description: seo.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: brand.full,
    title: "Cantine Castaldo Tuccillo — Il tempo diventa vino",
    description:
      "Cinque generazioni di vino vesuviano. Falanghina, Aglianico, Metodo Vesuviano e il raro Lammiccato.",
    url: seo.url,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cantine Castaldo Tuccillo — Il tempo diventa vino",
    description: "Cinque generazioni di vino vesuviano dal cuore del Vesuvio.",
  },
};

export const viewport: Viewport = {
  themeColor: "#08040a",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Winery",
  name: brand.full,
  description:
    "Cantina vinicola con cinque generazioni di storia a San Gennaro Vesuviano. Produzione di vini campani IGP, Metodo Vesuviano e il tradizionale Lammiccato.",
  url: seo.url,
  telephone: contact.phone,
  email: contact.email,
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: contact.street,
    addressLocality: contact.city,
    addressRegion: contact.region,
    addressCountry: "IT",
  },
  areaServed: "Campania",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:30",
      closes: "13:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "15:00",
      closes: "20:00",
    },
  ],
  sameAs: [contact.facebook],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ivory focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-[0.12em] focus:text-wine-dark"
        >
          Vai al contenuto
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
