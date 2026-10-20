# Shopify — collegamento e gestione del catalogo

Il sito legge **tutto il catalogo da Shopify**: homepage, pagina `/vini` e schede
`/vini/[handle]` usano la stessa fonte (`lib/commerce`). Aggiungere, modificare o
togliere un vino si fa solo nel pannello Shopify. La scelta tra storefront Next.js
e tema nativo è in [SHOPIFY-ARCHITETTURA.md](SHOPIFY-ARCHITETTURA.md).

## Come funziona

```
lib/commerce/
  settings.ts   variabili d'ambiente (negozio, token, collezioni, segreti) — solo server
  shopify.ts    Storefront API 2026-10: collezioni paginate, prodotti, metafield, carrello
  local.ts      vetrina senza vendita (solo se scelta esplicitamente, o in sviluppo)
  index.ts      getHomeWines · getCatalogPage · getWine · getCatalogHandles
  format.ts     prezzi in formato italiano
app/actions/cart.ts                 carrello: leggi, aggiungi, modifica, rimuovi, vai al pagamento
app/api/shopify/webhooks/route.ts   aggiornamento da Shopify (firma HMAC verificata)
app/api/shopify/revalidate/route.ts aggiornamento manuale (token)
components/commerce/cart.tsx        carrello nel sito (pannello laterale)
components/commerce/purchase-action.tsx  Aggiungi / Scegli / Esaurito · formato e quantità
```

| Pagina | Dati |
|---|---|
| Homepage | collezione `SHOPIFY_HOME_COLLECTION`, primi 12 vini, nell'ordine della collezione; il vino con `wine.rare = true` ha la sua scena |
| `/vini` | collezione `SHOPIFY_CATALOG_COLLECTION`, 24 per pagina («Altri vini» / «Vini precedenti») |
| `/vini/[handle]` | il prodotto; le schede esistenti sono generate in anticipo, le nuove alla prima visita. Un prodotto non pubblicato o eliminato risponde 404 |

**Modalità.** Con il negozio configurato il sito vende (prezzi, disponibilità,
carrello, checkout Shopify). Senza negozio:
- in **sviluppo** mostra i quattro vini di `lib/content.ts` con l'etichetta
  «Dati dimostrativi · Shopify non collegato»;
- in **produzione** non mostra nessun catalogo finto: dice che il catalogo non è
  disponibile e indica email e telefono della cantina. Per tenere online la
  vetrina attuale senza vendita, impostare `COMMERCE_PROVIDER=showcase`.
- Se Shopify non risponde, l'errore viene registrato nei log del server e la
  pagina lo dice; le pagine già generate restano visibili finché non scadono.

**Aggiornamento dei dati.** Le letture del catalogo sono in cache con il tag
`shopify`:
1. **Webhook** (immediato): ogni modifica a prodotti, collezioni o giacenze invia
   un webhook firmato; il sito verifica la firma e invalida la cache. La visita
   successiva mostra i dati nuovi. *Verificato in locale con un negozio simulato.*
2. **Riserva**: la cache scade comunque dopo `SHOPIFY_REVALIDATE_SECONDS`
   (predefinito 15 minuti).
3. **Manuale**: `curl -X POST -H "Authorization: Bearer $SHOPIFY_REVALIDATE_SECRET" https://DOMINIO/api/shopify/revalidate`

Carrello e checkout non sono mai in cache: prezzi e giacenze nel carrello sono
sempre quelli attuali di Shopify.

## Collegare il negozio

1. **Canale Headless** — installare il canale *Headless* dall'App Store di
   Shopify, *Crea storefront*, copiare il **token privato**. In *Storefront API
   permissions* abilitare: prodotti, collezioni, metafield/metaobject dei
   prodotti, carrello (lettura e scrittura).
2. **Variabili d'ambiente** — copiare `.env.example` in `.env.local` (mai in
   Git) e, in produzione, nelle variabili dell'hosting:
   `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`,
   `SHOPIFY_CATALOG_COLLECTION`, `SHOPIFY_HOME_COLLECTION`,
   `SHOPIFY_WEBHOOK_SECRET`, `SHOPIFY_REVALIDATE_SECRET`.
   Il token privato resta sul server: non usare mai il prefisso `NEXT_PUBLIC_`.
3. **Collezioni** — creare (nomi e handle a scelta, da riportare nelle variabili):
   - `vini` — catalogo completo, ordinamento *Manuale* o quello desiderato;
   - una collezione per la homepage (es. `home`) se la selezione è diversa.
   Pubblicarle sul canale **Headless**.
4. **Metafield prodotto** — *Impostazioni → Dati personalizzati → Prodotti*,
   spazio dei nomi `wine`, con **accesso Storefronts attivo**. Tutti facoltativi:
   se vuoti, il sito non mostra la riga.

   | Chiave | Tipo | Uso |
   |---|---|---|
   | `wine.type` | Testo a riga singola | Tipologia (Bianco, Rosso, Spumante…). Se vuoto: *Tipo di prodotto* |
   | `wine.denomination` | Testo a riga singola | Solo denominazioni legali (es. Campania IGP) |
   | `wine.style` | Testo a riga singola | Es. Metodo tradizionale |
   | `wine.grape` | Testo a riga singola | Vitigno / uve |
   | `wine.vintage` | Numero intero | Annata |
   | `wine.alcohol` | Numero decimale | Gradazione, % vol |
   | `wine.tasting_note` | Testo multiriga | Nota di degustazione (se vuoto: descrizione) |
   | `wine.technical_sheet` | File | Scheda tecnica PDF |
   | `wine.accent` | Colore | Tinta del vino nell'interfaccia |
   | `wine.rare` | Vero/Falso | Il vino con la scena dedicata in homepage (uno solo) |
5. **Webhook** — *Impostazioni → Notifiche → Webhook*, formato JSON, URL
   `https://DOMINIO/api/shopify/webhooks`, per gli eventi: creazione,
   aggiornamento ed eliminazione di prodotti; aggiornamento ed eliminazione di
   collezioni; aggiornamento dei livelli di inventario. La **chiave di firma**
   mostrata in fondo a quella pagina va in `SHOPIFY_WEBHOOK_SECRET`.
6. **Checkout** — spedizioni, imposte, pagamenti, condizioni di vendita e
   verifica dell'età si configurano in Shopify (vedi le decisioni in
   SHOPIFY-ARCHITETTURA.md).
7. **Verifica** — dopo il deploy: `/vini` mostra la collezione, una modifica di
   prezzo in Shopify compare al primo caricamento dopo il webhook, un ordine di
   prova (in modalità test di Shopify Payments o con il gateway di prova) arriva
   in *Ordini*.

## Istruzioni per il gestore

- **Aggiungere un vino**: *Prodotti → Aggiungi prodotto*. Titolo, descrizione,
  foto (la prima è quella della bottiglia: meglio scontornata, verticale),
  prezzo, SKU, giacenza. Compilare i campi *wine* che servono. Impostare lo stato
  **Attivo** e pubblicarlo sul canale **Headless**. Aggiungerlo alla collezione
  del catalogo (e a quella della homepage se deve comparire anche lì).
  La scheda `/vini/handle-del-prodotto` nasce da sola.
- **Formati** (es. 0,75 l e Magnum): varianti del prodotto. Il sito mostra la
  scelta del formato nella scheda e «Scegli» nella griglia.
- **Ordine dei vini**: trascinarli nella collezione (ordinamento manuale).
- **Esaurito**: con il monitoraggio delle giacenze attivo e giacenza zero, il sito
  mostra «Esaurito» e non permette l'acquisto.
- **Togliere un vino**: rimuoverlo dalle collezioni o impostarlo come *Bozza* /
  non pubblicato sul canale Headless: sparisce dal sito e la sua scheda risponde
  404.
- **Ordini ed evasione**: tutto in *Ordini*, come per qualsiasi negozio Shopify.
- Le modifiche compaiono sul sito dopo pochi secondi (webhook) o al massimo dopo
  15 minuti.

## Analisi e consenso (storefront separato)

Gli ordini sono sempre registrati in Shopify. Visite, viste prodotto, aggiunte
al carrello e conversioni dello storefront **non** arrivano ai report Shopify da
sole: vanno inviate dal sito con il consenso del visitatore (Customer Privacy
API), e il consenso va passato al checkout (`@inContext(visitorConsent)` alla
creazione del carrello). Shopify fornisce Hydrogen 2026-10 per Next.js con
analisi e consenso integrati: adottarlo richiede una nuova dipendenza ed è una
decisione aperta. Gli eventi del checkout si gestiscono in *Impostazioni → Eventi
cliente*.
