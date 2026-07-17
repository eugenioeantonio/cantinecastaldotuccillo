# Cantine Castaldo Tuccillo — Homepage

Sito cinematografico per la cantina vesuviana Castaldo Tuccillo.
Esperienza premium, minimal-luxury, con calice protagonista.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (primitive)
- **Motion** (`motion/react`) — sistema di movimento unico
- **React Three Fiber** + **three** — calice 3D (fallback) del hero
- **Lenis** — smooth scroll

## Sviluppo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build di produzione
npm run start    # serve la build
```

## Struttura

```
app/            layout (font, SEO/OG, JSON-LD) · page (composizione) · globals.css (design tokens)
components/
  hero/         hero.tsx (orchestratore) · hero-frames.tsx (sequenza photoreal) · wine-glass-3d.tsx (R3F)
  sections/     story-generations · wines · method · experience · contact-cta · site-footer
  primitives/   reveal · split-text  (il motore di rivelazione riusato ovunque)
  site-header · smooth-scroll · scroll-progress · preloader
lib/            content.ts (dati cantina) · motion.ts (easing/varianti) · utils.ts
public/
  frames/       sequenza hero photoreal (vedi frames/README.md)
  assets/       models · hdri · textures · materials (slot per asset 3D)
legacy/         il sito HTML originale (backup)
```

## Il calice del hero

Due percorsi, selezione automatica:

1. **Photoreal** — se esistono i frame in `public/frames/desktop/`, il hero usa una
   sequenza pre-renderizzata guidata dallo scroll (vedi `public/frames/README.md`).
2. **3D real-time** (fallback) — un calice di cristallo Three.js con vino, fisica di
   oscillazione e versamento. Funziona sempre, senza asset.

## Deploy su Vercel

Il progetto è già collegato a Vercel (`cantine-castaldo-tuccillo`). Vercel rileva
automaticamente Next.js.

```bash
npx vercel --prod
```

oppure push sul branch collegato per il deploy automatico.
