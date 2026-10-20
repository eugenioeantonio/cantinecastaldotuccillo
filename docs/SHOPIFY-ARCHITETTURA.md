# Shopify: storefront Next.js o tema nativo?

*Documento di decisione — 16 ottobre 2026. Nessuna conversione è stata avviata.*

## Il punto di partenza

- Il sito è un'app **Next.js 16** (React 19, Motion, Lenis). La hero del calice è un
  motore **WebGL2 senza framework** (`components/hero/pour/`: shader, renderer,
  coreografia) con una sequenza di fotogrammi di riserva (`public/sequences/`).
- Un'app Next.js **non si esporta come tema Shopify**. Un tema è un insieme di
  template Liquid, sezioni JSON e file statici (CSS, JS, immagini) con una
  struttura fissa; React e il rendering lato server di Next non vi trovano posto.
- Lo strato commerciale del sito ora legge tutto da Shopify (Storefront API
  2026-10): collezioni, prodotti, metafield, carrello e checkout Shopify.

## Confronto

| | **A · Next.js separato + Storefront API** | **B · Tema Shopify nativo (Liquid)** |
|---|---|---|
| **Calice animato** | Resta identico: è già in produzione così. | Portabile: il motore WebGL e la sequenza sono JS e immagini senza React. Va però riscritto il contorno (overlay, testi, scroll con Motion → JS vanilla o una piccola isola compilata) e ricontrollato nel contesto del tema e dell'editor. I file rientrano nei limiti dei temi (20 MB per file in `assets`). |
| **Resto dell'interfaccia** | Già fatto. | Da riscrivere: ogni sezione (Credo, Territorio, Vini, Lammiccato, Metodo, Visita, footer, header, carrello, scheda) diventa una sezione Liquid con impostazioni per l'editor. Le animazioni Motion vanno rifatte in JS/CSS. |
| **Lavoro rimanente** | Contenuto: collegare il negozio reale, consenso e analisi, pagine legali, verifica età, collaudo. **Giorni.** | Riscrittura completa + porting della hero + collaudo su tutti i dispositivi. **Settimane.** |
| **Hosting** | Vercel (progetto esistente) per il sito, Shopify per checkout e ordini. Per un uso commerciale serve un piano Vercel adatto (il piano Hobby non lo consente). | Tutto su Shopify, incluso nel piano. Nessun server da gestire. |
| **Dominio** | Sito sul dominio principale (Vercel); checkout su un sottodominio Shopify (es. `checkout.dominio.it`). | Dominio collegato a Shopify; sito e checkout sullo stesso negozio. |
| **Chi modifica cosa** | Prodotti, prezzi, foto, giacenze, collezioni e ordini: **Shopify**. Testi editoriali (Metodo, Visita, generazioni): nel codice (`lib/content.ts`), quindi serve uno sviluppatore — a meno di spostarli in metaobject Shopify in un secondo momento. | Tutto da Shopify: prodotti nel pannello, testi e immagini delle sezioni nell'editor del tema. |
| **Analisi e consenso** | **Non automatici.** Gli ordini compaiono sempre in Shopify, ma visite, eventi (vista prodotto, aggiunta al carrello) e conversioni dello storefront vanno inviati a Shopify dal sito, con il consenso raccolto tramite la Customer Privacy API e passato al checkout. Shopify ora fornisce **Hydrogen 2026-10** anche per Next.js, con analisi e consenso inclusi: richiede una nuova dipendenza. | Nativi: report del negozio, banner del consenso Shopify e pixel/eventi cliente funzionano senza integrazione. |
| **Manutenzione** | Aggiornamenti di Next.js e delle librerie; aggiornare la versione della Storefront API almeno una volta l'anno (ogni versione è supportata ~12 mesi); hosting Vercel. | Aggiornamenti del tema (Shopify CLI, integrazione GitHub). Nessun server, nessuna versione API da gestire per il catalogo. |
| **Rischio principale** | Doppio sistema (Vercel + Shopify) e analisi da integrare a mano. | Fedeltà delle animazioni dopo il porting e tempi di riscrittura. |

## Raccomandazione

Il vostro requisito è **«mettere il sito su Shopify mantenendo estetica e animazioni»**
e permettere al gestore di lavorare dal pannello Shopify. Il percorso che lo
soddisfa davvero è **B, il tema nativo**: sito, contenuti, checkout, analisi e
consenso in un unico posto, modificabili dal gestore.

B ha però un rischio tecnico preciso: la resa del calice dentro un tema. Prima di
avviare la riscrittura completa consiglio una **prova di fattibilità limitata**:
portare solo la hero (motore WebGL + overlay) in un tema di sviluppo, **non
pubblicato**, su un negozio di sviluppo o in anteprima, e confrontarla con
quella attuale su desktop, iPhone e Android. Se la resa è equivalente, si procede
con B; se non lo è, A resta valido e già pronto alla vendita.

Nel frattempo A è utilizzabile subito: il lavoro fatto sullo strato dati (stessa
struttura di collezioni e metafield) vale per **entrambi** i percorsi.

## Decisioni che spettano a voi

1. **A o B** (o B con la prova di fattibilità prima di decidere).
2. **Negozio**: esiste già? Nome `.myshopify.com`, piano, chi è il proprietario.
3. **Dominio**: dove deve risiedere il dominio principale e il checkout.
4. **Hosting** (solo per A): piano Vercel commerciale.
5. **Analisi e consenso** (solo per A): adottare Hydrogen 2026-10 per Next.js
   (nuova dipendenza) o integrazione manuale; banner del consenso Shopify o uno
   vostro; eventuali Google Analytics / Meta.
6. **Vendita di alcolici**: verifica della maggiore età (dichiarazione al checkout
   o app dedicata), zone di spedizione, corriere abilitato al trasporto di
   alcolici, informazioni obbligatorie per la vendita a distanza (es. gradazione,
   allergeni come i solfiti, etichettatura UE): da verificare con il vostro
   consulente.
7. **Testi editoriali** (solo per A): restano nel codice o si spostano in Shopify
   (metaobject).

## Fonti ufficiali consultate

- Versioni API: <https://shopify.dev/docs/api/usage/versioning> (ultima stabile 2026-10)
- Storefront API, autenticazione e intestazioni: <https://shopify.dev/docs/api/storefront/latest>
- Canale Headless: <https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started>
- Consenso per storefront personalizzati: <https://shopify.dev/docs/api/customer-privacy>
- Hydrogen 2026-10 con Next.js: <https://shopify.dev/docs/storefronts/headless/developer-preview>, <https://hydrogen.shopify.dev/>
- Analisi headless: <https://shopify.dev/docs/api/hydrogen-react/latest/utilities/sendshopifyanalytics>
- Architettura e limiti dei temi: <https://shopify.dev/docs/storefronts/themes/architecture>, <https://shopify.dev/docs/storefronts/themes/architecture/limits>
- Webhook e verifica HMAC: <https://shopify.dev/docs/apps/build/webhooks/verify-deliveries>
- Accesso dei metafield agli storefront: <https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/products-collections/metafields>
