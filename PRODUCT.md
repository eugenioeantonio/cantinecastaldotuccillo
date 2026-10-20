# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Il visitatore principale è un potenziale cliente interessato ai vini di Cantine Castaldo Tuccillo, alla storia della famiglia e al territorio vesuviano — non un buyer che arriva già deciso. Il sito deve trasformare la scoperta del brand in desiderio e fiducia, raccontando vini, territorio, metodo produttivo e cinque generazioni di storia. Azione commerciale primaria: acquistare vino online. Azione secondaria: scoprire e contattare la cantina per esperienze, visite guidate e degustazioni in loco.

## Product Purpose

Sito vetrina e vendita per una cantina familiare vesuviana giunta alla quinta generazione. Racconta la storia, il territorio (suoli lavici del Vesuvio) e il "Metodo Vesuviano" di produzione, con l'obiettivo di generare sia vendite dirette online sia contatti per visite/degustazioni in cantina. Successo = il visitatore percepisce autenticità e artigianalità familiare, e converte in acquisto o richiesta di visita.

## Positioning

Vino vesuviano di famiglia con cinque generazioni di continuità sullo stesso territorio lavico, incluso un prodotto raro e quasi segreto (il "Lammiccato") che un concorrente più giovane o più industriale non può rivendicare con altrettanta credibilità. Claim guida: "Il tempo diventa vino."

## Operating Context

- Cantina fisica a San Gennaro Vesuviano (NA), con orari di apertura reali (Lun–Sab 08:30–13:30 e 15:00–20:00) e contatti reali (telefono, email, Facebook) già in `lib/content.ts`.
- Le visite/degustazioni sono su prenotazione, gestite via contatto diretto (telefono/email), non tramite un sistema di booking online.
- Hero della homepage è una sequenza cinematografica scroll-driven (frame-sequence fotoreale con fallback Three.js) pensata per reggere i vincoli di memoria di Safari iOS — vedi `docs/HERO-TECHNICAL-DESIGN.md`. È un vincolo tecnico e creativo consolidato, non da rimettere in discussione senza motivo.

## Capabilities and Constraints

- Vendita online: e-commerce **Shopify headless via Storefront API** — carrello e checkout vivono dentro il sito Next.js, i dati prodotto/ordine arrivano dalle API Shopify. Non ancora implementato: nessuna pagina prodotto/shop esiste oggi nel codice (`app/` ha solo la homepage). Questo è un capability gap noto, non un errore.
- Nessun sistema di prenotazione online per le visite: il contatto resta diretto (telefono/email/Facebook).
- Contenuti reali già confermati e in uso: nome, claim, indirizzo, contatti, orari, elenco vini (Falanghina, Aglianico, Metodo Vesuviano, Lammiccato) con relative note di degustazione — tutto in `lib/content.ts`, da trattare come fonte di verità.
- Placeholder intenzionali da NON inventare: i nomi e gli anni delle cinque generazioni (es. "[Nome fondatore e anno da confermare]") restano segnaposto per ora, per scelta esplicita della famiglia — non riempirli con dati inventati.
- Nessuna certificazione, premio o denominazione aggiuntiva oltre a quanto già presente nei contenuti (es. Campania IGP su Falanghina e Aglianico); nessun vincolo legale ulteriore noto sull'etichetta.
- Stack esistente da rispettare: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (primitive) · Motion (`motion/react`) · React Three Fiber/Three.js (calice 3D fallback) · Lenis (smooth scroll). Deploy su Vercel, progetto già collegato.

## Evidence on Hand

- `lib/content.ts` — dati reali di brand, contatti, vini, metodo, esperienza (fonte di verità per i contenuti).
- `LOGO.PNG`, `public/brand/` — asset di marca reali.
- `public/frames/` — sequenza fotoreale del calice per l'hero (desktop/mobile).
- `docs/HERO-TECHNICAL-DESIGN.md` — analisi tecnica e vincoli della hero cinematografica.
- `legacy/` — sito HTML originale, conservato come backup/riferimento storico.
- Assenze note da non colmare con invenzioni: nessuna testimonianza cliente, nessun premio/riconoscimento, nessun nome/anno di fondazione delle generazioni, nessun catalogo prodotto Shopify ancora esistente.

## Product Principles

- L'autenticità familiare e il legame con il territorio vesuviano vengono prima di ogni effetto visivo: la cinematografia serve la storia, non il contrario.
- Non inventare fatti (nomi, anni, premi, certificazioni) quando i dati reali non sono confermati — i placeholder espliciti sono preferibili a dati plausibili ma falsi.
- Il sito deve reggere due obiettivi contemporaneamente, senza che uno faccia sembrare l'altro un ripiego: la vendita diretta (Shopify headless) e la relazione umana verso la visita in cantina.
- Il "Lammiccato" e il "Metodo Vesuviano" sono asset narrativi distintivi: vanno trattati come elementi rari e centrali, non come una voce in più nell'elenco vini.

## Accessibility & Inclusion

Nessun requisito o standard specifico stabilito con l'utente. Il codice esistente include già pattern base (skip-link "Vai al contenuto", focus visibile) da preservare in ogni lavoro futuro.
