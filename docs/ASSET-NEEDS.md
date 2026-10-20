# Fotografie da realizzare

Il sito è progettato attorno a otto fotografie reali. Nessuna esiste ancora:
finché non arrivano, ogni spazio mostra una lastra di "pietra vulcanica" con
la sua didascalia (in sviluppo compare anche un'etichetta "Foto da inserire").

**Non usare foto stock né immagini generate.** Il sito parla di una famiglia
vera: ogni immagine deve essere sua.

## Come inserirle

1. Salva il file in `public/photos/` (JPG o WebP; per le bottiglie PNG trasparente).
2. In `lib/photo-slots.ts` imposta `src` dello slot, es. `src: "/photos/vigneto.jpg"`.
3. Nient'altro: composizione, proporzioni e didascalia sono già al loro posto.

Per le bottiglie, se il negozio Shopify è collegato, basta caricare le
immagini sul prodotto: il sito le prende da lì.

## Elenco

| Slot | Dove appare | Formato | Cosa deve mostrare |
|---|---|---|---|
| `family-today` | Cinque generazioni, in chiusura | verticale 4:5 | Ritratto della famiglia oggi, in cantina o tra i filari. Luce naturale bassa, toni caldi, nessuna posa da catalogo. |
| `territory-vineyard` | Territorio — "Ai piedi del Vesuvio" | orizzontale 16:9, almeno 2400 px | I vigneti di San Gennaro Vesuviano con il Vesuvio sullo sfondo. Luce radente di fine giornata, suolo scuro visibile. È la foto più importante del sito. |
| `visit-cellar` | La visita, grande a sinistra | verticale 4:5 | Interno della cantina: botti, pietra, penombra. |
| `visit-tasting` | La visita, piccola a destra | verticale 3:4 | Una degustazione reale: mani, calici, bottiglie della famiglia. Niente volti in primo piano. |
| `bottle-falanghina` | Carta dei vini (hover) e scheda | PNG trasparente, 1:3 | Bottiglia scontornata, frontale, etichetta leggibile, luce laterale. |
| `bottle-aglianico` | Carta dei vini e scheda | PNG trasparente, 1:3 | Come sopra. |
| `bottle-metodo-vesuviano` | Carta dei vini e scheda | PNG trasparente, 1:3 | Come sopra. |
| `bottle-lammiccato` | Scheda del Lammiccato | PNG trasparente, 1:3 | È il vino raro: luce più drammatica, fondo nero. |

## Dati da confermare con la famiglia

- Nomi e anni delle cinque generazioni (oggi volutamente non mostrati).
- `lib/content.ts → territory`: coordinate di San Gennaro Vesuviano
  (40°52′ N · 14°32′ E) e quota del Vesuvio (1.281 m) — dati geografici
  pubblici, da verificare prima della pubblicazione.
