# Prodotti da inserire in Shopify — riepilogo per le bozze

*Preparato il 16 ottobre 2026. Nessun prodotto è stato creato: manca l'accesso al
negozio, e prima di crearli va controllato che non esistano già.*

Fonte: `lib/content.ts` (dati confermati dalla famiglia). Tutto ciò che non c'è
è indicato come **mancante**: non è stato inventato nulla.

## Riepilogo

| Handle (URL) | Titolo | Stato proposto | Collezioni |
|---|---|---|---|
| `falanghina` | Falanghina | Bozza | vini, home |
| `aglianico` | Aglianico | Bozza | vini, home |
| `metodo-vesuviano` | Metodo Vesuviano | Bozza | vini, home |
| `lammiccato` | Lammiccato | Bozza | vini, home |

Gli handle sono quelli già usati dal sito: mantenerli conserva gli indirizzi
`/vini/falanghina` ecc.

## Dati disponibili

| Campo Shopify | Falanghina | Aglianico | Metodo Vesuviano | Lammiccato |
|---|---|---|---|---|
| Titolo | Falanghina | Aglianico | Metodo Vesuviano | Lammiccato |
| Descrizione / `wine.tasting_note` | Fiori bianchi, agrume e sale minerale. La freschezza luminosa del versante vesuviano. | Struttura e profondità: frutti scuri, spezia e la trama tannica della terra lavica. | Bollicina fine e paziente, nata dal tempo e da una rifermentazione custodita in cantina. | Il vino più intimo della famiglia: un gesto antico, quasi segreto, che sopravvive nel tempo. |
| `wine.type` | Bianco | Rosso | Spumante | Raro |
| `wine.denomination` | Campania IGP | Campania IGP | — | — |
| `wine.style` | — | — | Metodo tradizionale | Tradizione di famiglia |
| `wine.grape` | Falanghina | Aglianico | Uve vesuviane | Selezione storica |
| `wine.accent` | #d9c98f | #7a1526 | #c6ab7d | #4a0f1b |
| `wine.rare` | falso | falso | falso | **vero** |

## Dati mancanti (da fornire)

Per **ciascun** vino:

- **Prezzo** di vendita (IVA inclusa o esclusa, secondo l'impostazione del negozio)
- **Formato/i** (es. 0,75 l, Magnum) → varianti
- **SKU** e, se esiste, **codice a barre**
- **Giacenza** e se tracciarla
- **Peso** con imballo (per il calcolo della spedizione)
- **Foto** della bottiglia (scontornata, verticale) — gli slot del sito sono già pronti
- **Annata** (`wine.vintage`) e **gradazione** (`wine.alcohol`)
- **Scheda tecnica** PDF (facoltativa)
- **Informazioni obbligatorie per la vendita a distanza** (es. allergeni come i
  solfiti, etichettatura UE): da verificare con il consulente
- **Tipologia del Lammiccato**: oggi è «Raro · Tradizione di famiglia»; il brief
  iniziale lo chiamava «Ammiccato» — confermare il nome

## Prima di creare i prodotti

1. Accesso al negozio con permessi su prodotti e metafield.
2. Controllo che non esistano già prodotti con gli stessi handle o titoli
   (per non duplicarli).
3. Creazione delle definizioni metafield `wine.*` (vedi SHOPIFY.md).
4. Creazione dei 4 prodotti **come bozze**, senza prezzi né giacenze finché non
   vengono forniti, e delle collezioni.
5. Revisione da parte vostra, poi pubblicazione sul canale Headless.
