# Cantine Castaldo Tuccillo — Passaggio di progetto

*Pacchetto preparato il 16 ottobre 2026 dalla cartella `Desktop/Cantine Castaldo Tuccillo` (lasciata intatta).*

## Cosa contiene lo ZIP

Il progetto completo, con lo **stato attuale dei file** (incluso il lavoro non ancora committato):

- **Codice**: `app/`, `components/`, `lib/`, `scripts/`, file di configurazione (`package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint`, `postcss`, `components.json`).
- **Immagini e risorse**: `LOGO.PNG`, `STEPS.PNG`, `public/brand/` (logo, steps), `public/sequences/wine-glass/` (frame della hero desktop/mobile + asset del versamento `pour/`), `.higgsfield/source/` (immagini sorgente della hero usate dagli script), `app/favicon.ico`.
- **Documentazione**: `README.md`, `PRODUCT.md`, `DESIGN.md`, `docs/HERO-TECHNICAL-DESIGN.md`, `docs/SHOPIFY.md`, `docs/ASSET-NEEDS.md`, `public/frames/README.md`.
- **Storico**: `.git/` (cronologia completa, remote GitHub), `legacy/` (sito HTML originale e prime versioni della hero), `backups/`.
- **Strumenti Claude**: `.claude/` (agenti e skill "impeccable", hook di design), `.impeccable/` (design.json e configurazione).

## Cosa è stato escluso (e perché)

| Escluso | Motivo |
|---|---|
| `node_modules/` (727 MB) | si rigenera con `npm install` |
| `.next/` (401 MB) | cache di build, si rigenera |
| `.vercel/` | collegamento all'account Vercel (ID progetto/organizzazione): va ricollegato sul nuovo computer |
| `.env*`, `*.pem`, `*.key` | credenziali — **nessuna era presente**, l'esclusione è precauzionale |
| `.higgsfield/review/`, `.impeccable/review/` | screenshot di revisione (≈50 MB), non necessari |
| `_to_delete/` | file già marcati per l'eliminazione |
| `.git/index.lock` | lock git rimasto da una sessione interrotta: bloccherebbe git sul nuovo computer |
| `.DS_Store`, `tsconfig.tsbuildinfo` | file di sistema / cache |

**Nessuna credenziale è inclusa.** Controllati: assenza di `.env`, token Shopify, chiavi API, password; l'URL del remote GitHub non contiene token.

## Stato del lavoro

**Ultimo commit**: `429295f` del 21 agosto 2026 — "Logo ufficiale, preloader su asset reali e rifiniture homepage".
**Lavoro successivo NON committato** (8 ottobre 2026, ~800 righe aggiunte in 15 file modificati + molti file nuovi). È tutto incluso nello ZIP così com'è.

### Fatto
- Homepage completa in un'unica scena continua (`app/page.tsx`): Hero → Credo → Cinque Generazioni → Territorio → Metodo Vesuviano → Vini → Lammiccato → Esperienza/visita → Acquista → Footer.
- Hero a doppio motore (`components/hero/hero.tsx`): **versamento WebGL2 dal vivo** (`pour-hero.tsx` + `pour/`) se supportato; altrimenti **sequenza fotorealistica** di frame (`public/sequences/wine-glass/`), che gestisce anche il reduced-motion.
- Logo ufficiale e preloader su asset reali.
- Pagina scheda vino: `app/vini/[handle]` (falanghina, aglianico, metodo-vesuviano, lammiccato).
- Strato e-commerce già pronto per **Shopify headless** (`lib/commerce/`, `app/actions/commerce.ts`): oggi usa il provider locale, il pulsante dice "Richiedi" e apre un'email.
- Sistema di design documentato in `DESIGN.md`; contesto prodotto in `PRODUCT.md`.

### Da fare
1. **Committare** il lavoro dell'8 ottobre (vedi istruzioni sotto).
2. **8 fotografie reali** da inserire — slot già predisposti in `lib/photo-slots.ts` (tutti `src: null`), elenco e specifiche in `docs/ASSET-NEEDS.md`. Niente stock né immagini generate.
3. **Collegare Shopify**: procedura in `docs/SHOPIFY.md` (stessi handle dei vini, metafield `wine.*`, variabili d'ambiente).
4. **Carrello visibile** nel sito (l'API `addToCart` esiste, manca l'interfaccia).
5. Pagine legali (spedizioni, età minima alcolici, privacy, condizioni di vendita).
6. Deploy di produzione su Vercel dopo la verifica.

### Dati da confermare con la famiglia
- Nomi e anni delle cinque generazioni (restano placeholder per scelta esplicita — **non inventarli**).
- Coordinate e quota del Vesuvio in `lib/content.ts → territory`.
- Premio di Bruxelles: nessun dato disponibile, oggi non mostrato.
- Nome prodotto: il sito usa **Lammiccato**; il brief del progetto dice "Ammiccato".

## Come riprendere sul nuovo computer

Requisiti: **Node.js 20.9 o superiore** (Next.js 16), npm, git.

```bash
# 1. Estrai lo ZIP, poi entra nella cartella
cd "Cantine Castaldo Tuccillo"

# 2. Installa le dipendenze (ricrea node_modules)
npm install

# 3. Avvia in locale
npm run dev          # http://localhost:3000

# 4. Verifica la build
npm run build
```

### Git
La cronologia e il remote (`github.com/eugenioeantonio/cantinecastaldotuccillo`) sono inclusi. Per salvare il lavoro non committato:
```bash
git status
git add -A
git commit -m "Homepage completa, scheda vino, strato commerce, hero versamento"
git push      # richiede il login GitHub sul nuovo computer
```

### Vercel
Il collegamento non è incluso. Per ricollegare il progetto esistente `cantine-castaldo-tuccillo`:
```bash
npx vercel link     # scegli il progetto esistente
npx vercel --prod   # deploy di produzione
```
Le eventuali variabili d'ambiente (es. Shopify) si impostano nel pannello Vercel o in un `.env.local` **da non condividere**.

### Con Claude
- Il file `AGENTS.md` avverte che Next.js 16 ha API diverse: leggere `node_modules/next/dist/docs/` prima di modificare il codice.
- Gli agenti e la skill "impeccable" in `.claude/` funzionano dalla cartella del progetto. Il file `.claude/settings.local.json` contiene un permesso con il percorso assoluto del vecchio Mac (`/Users/karim/Desktop/...`): aggiornalo se il percorso cambia.
- Il Project "Cantine Castaldo Tuccillo" su claude.ai contiene il brief generale e i documenti di Fase 1 (analisi del sito Wix, sitemap, direzione artistica).
- Frase per ripartire: *"Riprendi il sito Castaldo Tuccillo: leggi PASSAGGIO_PROGETTO.md, PRODUCT.md e DESIGN.md, poi committa il lavoro in sospeso e procedi con il collegamento Shopify."*
