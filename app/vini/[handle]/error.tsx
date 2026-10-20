"use client";

import Link from "next/link";
import { contact } from "@/lib/content";
import { SiteHeader } from "@/components/site-header";

/**
 * The store did not answer for this wine. Said plainly, with a way to try
 * again and the family's real contacts — never a page made up from memory.
 */
export default function WineError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <>
      <SiteHeader base="/" />
      <main
        id="main"
        className="min-h-[100svh] px-6 pb-[14vh] pt-[clamp(128px,20vh,200px)] sm:px-[clamp(24px,7vw,120px)]"
        style={{ background: "linear-gradient(180deg, #120a10, #08040a)" }}
      >
        <div className="mx-auto max-w-6xl">
          <h1 className="font-serif text-[clamp(42px,5.6vw,84px)] font-medium leading-[0.98] text-ivory">
            La scheda non è disponibile{" "}
            <span className="italic text-stone">in questo momento.</span>
          </h1>
          <p className="mt-8 max-w-[48ch] text-[16px] font-light leading-[1.7] text-ivory/70">
            Il negozio non ha risposto. Riprova tra poco, oppure scrivici a{" "}
            <a
              href={`mailto:${contact.email}`}
              className="border-b border-gold/40 text-ivory hover:border-gold"
            >
              {contact.email}
            </a>
            .
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="rounded-full bg-ivory px-9 py-4 text-xs uppercase tracking-[0.18em] text-wine-dark"
            >
              Riprova
            </button>
            <Link
              href="/vini"
              className="text-[12px] uppercase tracking-[0.2em] text-ivory/70 transition-colors hover:text-ivory"
            >
              I vini
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
