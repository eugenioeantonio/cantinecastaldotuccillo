import { SiteHeader } from "@/components/site-header";
import { Preloader } from "@/components/preloader";
import { ScrollProgress } from "@/components/scroll-progress";
import { WineGlassScrollSequence } from "@/components/hero/wine-glass-scroll-sequence";
import { StoryGenerations } from "@/components/sections/story-generations";
import { Wines } from "@/components/sections/wines";
import { Method } from "@/components/sections/method";
import { Experience } from "@/components/sections/experience";
import { ContactCta } from "@/components/sections/contact-cta";
import { SiteFooter } from "@/components/sections/site-footer";

export default function Home() {
  return (
    <>
      <Preloader />
      <ScrollProgress />
      <SiteHeader />
      <main id="main">
        <WineGlassScrollSequence />
        <StoryGenerations />
        <Wines />
        <Method />
        <Experience />
        <ContactCta />
      </main>
      <SiteFooter />
    </>
  );
}
