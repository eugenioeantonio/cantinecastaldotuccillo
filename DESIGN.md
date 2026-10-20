---
name: Cantine Castaldo Tuccillo
description: Il tempo diventa vino — cinque generazioni di vino vesuviano, raccontate al buio in un'unica scena versata.
colors:
  oro-di-ginestra: "#a88a56"
  oro-chiaro: "#c6ab7d"
  bordeaux-di-mosto: "#4a0f1b"
  rubino-versato: "#7a1526"
  mosto-profondo: "#25070d"
  vinaccia: "#1c080e"
  penombra: "#140a0e"
  nero-lavico: "#08040a"
  pietra-lavica: "#0a0608"
  soglia-di-cantina: "#0b0609"
  cantina-prugna: "#120a10"
  lastra-vesuviana: "#120a0e"
  cantina-brace: "#1a0710"
  brace-spenta: "#160810"
  fondo-di-botte: "#0e0509"
  avorio-di-tufo: "#f3efe6"
  pietra-vesuviana: "#d4c7b5"
  calice-falanghina: "#d9c98f"
typography:
  display-scene:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(64px, 16.5vw, 236px)"
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: "-0.025em"
  numeral:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(150px, 19vw, 300px)"
    fontWeight: 500
    lineHeight: 0.92
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(48px, 8vw, 128px)"
    fontWeight: 500
    lineHeight: 0.94
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(38px, 5.4vw, 84px)"
    fontWeight: 500
    lineHeight: 0.95
  sentence:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(36px, 5.6vw, 88px)"
    fontWeight: 300
    lineHeight: 1.18
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(24px, 2.5vw, 34px)"
    fontWeight: 500
    lineHeight: 1.1
  lead:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(22px, 2.4vw, 34px)"
    fontWeight: 300
    lineHeight: 1.4
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 300
    lineHeight: 1.75
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.2em"
  meta:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.26em"
rounded:
  none: "0px"
  pill: "9999px"
spacing:
  gutter-mobile: "24px"
  gutter: "clamp(24px, 7vw, 120px)"
  gutter-header: "clamp(20px, 5vw, 64px)"
  section: "16vh"
  section-ground: "18vh"
  row: "44px"
  row-mobile: "32px"
  container: "72rem"
components:
  button-primary:
    backgroundColor: "{colors.avorio-di-tufo}"
    textColor: "{colors.mosto-profondo}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "16px 36px"
  button-glass:
    textColor: "{colors.avorio-di-tufo}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  action-rule:
    backgroundColor: "transparent"
    textColor: "{colors.avorio-di-tufo}"
    typography: "{typography.label}"
  action-rule-hover:
    textColor: "{colors.oro-di-ginestra}"
  nav-link:
    textColor: "{colors.avorio-di-tufo}"
    typography: "{typography.label}"
    padding: "4px 0"
  nav-acquista:
    textColor: "{colors.oro-di-ginestra}"
    typography: "{typography.label}"
    padding: "4px 0"
  nav-acquista-hover:
    textColor: "{colors.oro-chiaro}"
  wine-row:
    backgroundColor: "transparent"
    textColor: "{colors.avorio-di-tufo}"
    typography: "{typography.headline}"
    rounded: "{rounded.none}"
    padding: "{spacing.row} 0"
  photo-plate:
    backgroundColor: "{colors.lastra-vesuviana}"
    rounded: "{rounded.none}"
  purchase-select:
    backgroundColor: "transparent"
    textColor: "{colors.pietra-vesuviana}"
    typography: "{typography.sentence}"
    rounded: "{rounded.none}"
---

# Design System: Cantine Castaldo Tuccillo

## Overview

**Creative North Star: "Il Calice nella Notte Lavica"**

Il sito è una notte vesuviana attraversata da un unico calice, e ora quel calice si versa. La hero è il bicchiere fotografato che, sotto lo scroll, si inclina finché il vino lascia il bordo e allaga lo schermo; ogni scena successiva è illuminata da quel vino o ritagliata in esso. Il nero è suolo lavico, non uno sfondo neutro; l'oro è la luce che passa attraverso il vetro, rara e calda; il bordeaux e il rubino sono il vino stesso, che dopo il versamento resta nella stanza come bagliore lento e fili di luce. L'avorio è la voce.

Il registro è artigianale e intimo, non ostentato. Il lusso è familiare: spazio negativo generoso, una sola idea per schermo, serif grandi e lenti, corsivi in pietra come un'annotazione a mano su un'etichetta. La pagina rifiuta il formato di categoria (hero + card impilate + griglia prodotti): i vini sono una carta in righe, le generazioni un registro di famiglia, la visita un brano di prosa, l'acquisto una frase da completare. Le superfici si disegnano con fili, regole e materia, mai con riquadri.

Il movimento è lento, pesante e reversibile: il calice ha peso (inseguimento smorzato criticamente, nessun rimbalzo), ogni mappatura di scroll si riavvolge tornando indietro, gli elementi emergono dal buio con dissolvenza e sfocatura. Il versamento WebGL2 è il cuore cinematografico ed è un vincolo consolidato, con la frame-sequence fotoreale originale come ripiego automatico; il resto del sistema lo serve.

**Key Characteristics:**
- Fondamentalmente scuro: nessuna superficie chiara, nessun tema chiaro.
- Continuità del versato: ogni scena apre sul colore con cui la precedente si è chiusa.
- Serif display (Cormorant) per tutto ciò che racconta, Inter 300 per tutto ciò che informa.
- Oro come luce, mai come campitura: fili, regole, numerali, maiuscoletti di dato.
- Righe, regole e lastre al posto delle card; angoli vivi sulle superfici, pill solo sui pulsanti pieni o di vetro.
- Componenti sussurrati e precisi: azioni a filo che si allunga, hover che si accende lentamente (500–900ms).

## Colors

Una palette di terra e vino: un'unica famiglia di neri caldi e vinosi per i fondi, l'oro spento come luce, il bordeaux e il rubino come vino, l'avorio come voce.

### Primary
- **Oro di Ginestra** (#a88a56): la luce del sistema. Regole tra le righe (al 15%, al 10–12% sui divisori interni), fili delle azioni (60–70%), filo di scroll della hero, segmenti di avanzamento del metodo e delle generazioni, anello di focus, il numero di bottiglie nella frase d'acquisto, il grande numerale romano delle generazioni, link "Apri in Mappe", voce "Acquista" nella navigazione. Non è mai il fondo di un'area.
- **Oro Chiaro** (#c6ab7d): solo stato hover della voce "Acquista"; coincide con la tinta di calice del Metodo Vesuviano.

### Secondary
- **Bordeaux di Mosto** (#4a0f1b): il vino come colore. Selezione testo, inizio della barra di progresso, cuore del radiale della scena Lammiccato, velo vinoso del materiale lavico e delle lastre; tinta di calice del Lammiccato.
- **Rubino Versato** (#7a1526): la luce del vino dopo il versamento. Bagliore e fili della luce di vino (`WineLight`, 20% → 8%), raggi della scena Credo, coda del filo delle generazioni, primo anello delle curve di livello del territorio (55%). È anche la tinta di calice dell'Aglianico.
- **Mosto Profondo** (#25070d): il bordeaux al suo fondo. Colore finale del versamento e della frame-sequence, quindi primo colore del Credo; testo sul pulsante avorio; coda del menu mobile.

### Neutral (fondi, nell'ordine della pagina)
- **Vinaccia** (#1c080e) e **Penombra** (#140a0e): il gradiente del Credo che scende dal mosto (#25070d → #1c080e → #140a0e); la penombra apre le generazioni.
- **Cantina Prugna** (#120a10): la cantina un tono sopra il nero. Fondo della carta dei vini, coda delle generazioni e del metodo, attacco del menu mobile e della scheda vino, velo d'ingresso della scena Lammiccato.
- **Pietra Lavica** (#0a0608): base del materiale lavico procedurale del territorio.
- **Soglia di Cantina** (#0b0609): la cucitura scura tra le scene: coda del territorio, attacco del metodo, uscita del Lammiccato, attacco della visita.
- **Nero Lavico** (#08040a): il terreno. Background di `html`, sfondo della hero, cuore della visita, coda della scheda vino, binario della scrollbar, `theme-color`.
- **Cantina Brace** (#1a0710): coda della visita e attacco dell'acquisto.
- **Brace Spenta** (#160810): coda dell'acquisto, attacco del footer, fondo delle opzioni del selettore.
- **Fondo di Botte** (#0e0509): il footer.
- **Lastra Vesuviana** (#120a0e): fondo delle lastre fotografiche in attesa di foto.
- **Avorio di Tufo** (#f3efe6): testo primario e unico riempimento chiaro (pulsante primario). La gerarchia si regola con l'opacità: 90% lead della scena, 85% lead e prosa, 80% dati, 70% paragrafi, 55–60% link secondari e righe di luogo, 45% legal.
- **Pietra Vesuviana** (#d4c7b5): la seconda voce. Corsivi di accento ("*diventa*", "*una sola terra.*", "*del Vesuvio.*"), il nome del vino raro, il vino scelto nella frase d'acquisto, maiuscoletti di dato al 60–80%.

### Tinte di calice
Ogni vino porta una propria tinta, dato del prodotto (`wine.accent`): **Falanghina** (#d9c98f), **Aglianico** (rubino versato), **Metodo Vesuviano** (oro chiaro), **Lammiccato** (bordeaux di mosto). La tinta vive solo dove si parla di quel vino: la superficie del vino nel suo `WineDisc`, il colore che sale lungo la sua riga (dal 18% al 4%), il radiale della sua scheda (15%).

### Named Rules
**The Light-Through-Glass Rule.** L'oro è luce, non materia: appare come filo, regola, testo o numerale, mai come campitura piena o fondo di pulsante.

**The Continuous Pour Rule.** Ogni scena apre sul colore con cui la precedente si chiude: il versamento finisce su #25070d e il Credo comincia su #25070d; il territorio scurisce in #0b0609 e il metodo parte da #0b0609. Nessun bordo netto tra sezioni.

**The One Ivory Fill Rule.** Per schermo esiste al massimo un elemento pieno avorio. Tutte le altre azioni sono a filo o di vetro.

## Typography

**Display Font:** Cormorant Garamond (con Georgia, serif), pesi 300/500, corsivo incluso
**Body Font:** Inter (con ui-sans-serif, system-ui), pesi 300/400

**Character:** Un serif di calligrafia rinascimentale, alto e sottile, per la voce della famiglia, usato molto grande e molto stretto; un grotesk neutro in peso light per i fatti. Il contrasto è fra racconto e informazione, non fra titolo e testo. I numeri usano `tabular-nums`; nessun font mono.

### Hierarchy
- **Display scene** (500, clamp(64px, 16.5vw, 236px), 0.9, −0.025em): solo il nome del vino raro nella scena Lammiccato, in doppio strato (contorno avorio 1px al 55% e pieno che sale).
- **Numeral** (500, clamp(150px, 19vw, 300px), 0.92, oro): il numerale romano della generazione, fermo come l'annata su un'etichetta. Su mobile scende a 44px in una barra sticky.
- **Display** (500, clamp(48px, 8vw, 128px), 0.94, −0.015em): titoli di scena. Gamma osservata da clamp(44px, 6.4vw, 100px) (carta dei vini) a clamp(48px, 8.4vw, 132px) (territorio); scheda vino fino a clamp(56px, 9vw, 148px); claim del footer clamp(40px, 7vw, 108px). Claim della hero più contenuto: clamp(44px, 4.8vw, 76px) su desktop, clamp(30px, 8.6vw, 40px) su mobile, per non attraversare il calice.
- **Headline** (500, clamp(38px, 5.4vw, 84px), 0.95): nomi dei vini nella carta; titolo del metodo clamp(42px, 5.6vw, 84px); titoli delle generazioni clamp(34px, 4.4vw, 64px) a 1.02.
- **Sentence** (300, clamp(36px, 5.6vw, 88px), 1.18): la frase d'acquisto, con controlli inline nel corpo del testo.
- **Title** (500, clamp(24px, 2.5vw, 34px)): passi del metodo; voci del menu mobile clamp(30px, 9vw, 52px).
- **Lead** (300, clamp(22px, 2.4vw, 34px), 1.4): voce narrativa in serif light, spesso con la coda in corsivo pietra; corsivo pieno nella scena Lammiccato. Il brano della visita sale a clamp(25px, 2.9vw, 40px).
- **Body** (Inter 300, 15–16px, 1.6–1.75): paragrafi a 34–42ch.
- **Label** (Inter 400, 12px, 0.2em, maiuscolo): azioni a filo, "Scheda"; navigazione e pulsanti pill a 0.16–0.18em; telefono 13px.
- **Meta** (Inter 400, 11px, 0.26–0.28em, maiuscolo, pietra al 60–80%): solo dati: tipologia e denominazione del vino, luogo e coordinate, didascalie delle lastre, termini delle liste (Dove, Orari, Scrivici), ordine della generazione.

### Named Rules
**The Italic Second Voice Rule.** Nei titoli a due tempi la seconda metà è in corsivo color pietra. Una volta per titolo, mai su frasi intere.

**The Data-Bearing Caps Rule.** Il maiuscoletto spaziato porta un dato (luogo, tipologia, orario, didascalia) o un comando; non introduce mai un titolo con un'etichetta decorativa. Le teste in corsa della visita (oro, 11px) sono parole del brano, non intestazioni.

**The Light Body Rule.** Il testo corrente è sempre Inter 300 su fondo scuro; la leggibilità si ottiene con interlinea e opacità, non con il peso.

## Layout

Scene a tutta larghezza su fondo pieno, contenuto entro 72rem. Gutter laterale fluido clamp(24px, 7vw, 120px), 24px sotto `sm`; l'header usa clamp(20px, 5vw, 64px). Il padding verticale è in viewport-height: 16vh per le scene ordinarie, 18vh per il territorio e la coda del Credo, 22vh per l'ingresso del Credo; 8–10vh di stacco tra titolo e contenuto, 12–14vh prima dei blocchi pratici.

- **Hero:** sezione alta 420vh con stage sticky a 100svh. Calice al centro; claim in basso a sinistra (12svh dal fondo su desktop, centrato su mobile con la CTA sotto il piede del calice); riga di luogo in basso a destra; filo di scroll al bordo destro.
- **Griglia a 12 colonne** su `md` per le composizioni asimmetriche: lead del Credo alle colonne 6–11, visita 6 + 5, scheda vino 4 + 7.
- **Generazioni:** 5fr / 7fr; numerale sticky a 18vh, capitoli da 62vh lungo un filo verticale. Su mobile il numerale diventa una barra sticky sotto l'header.
- **Metodo:** 0.9fr / 1.1fr con gap 96px, colonna del titolo sticky a 24vh; il passo letto è al 100%, gli altri al 55%.
- **Carta dei vini:** righe a tutta larghezza (4rem disco / nome 1.3fr / nota 1fr / azioni), padding 44px su desktop e 32px su mobile, separate da regole oro al 15%.
- **Lammiccato:** sezione da 230vh con stage sticky a 100svh; con movimento ridotto altezza automatica.
- **Header** fisso; oltre 60px di scroll diventa lastra nero lavico al 70% con `backdrop-blur-xl` e regola oro al 15%; durante la scena Lammiccato (`html[data-scene="lammiccato"]`) si nasconde.

Breakpoint di Tailwind; il cambio forte è a `md` (768px), che è anche la soglia tra le varianti mobile e desktop del versamento.

## Elevation & Depth

Profondità atmosferica, non strutturale. Nessuna superficie è sollevata da un'ombra: i piani si distinguono per tono lungo la sequenza dei fondi e per la luce del vino che li attraversa. Gli strati atmosferici sono quattro: il **versamento** (WebGL2: il calice fotografato inclinato, il livello del vino che resta orizzontale, il filo viscoso, la pozza con una pelle di superficie riflettente, fresnel sul bordo lontano e menisco luminoso, poi il fondo #25070d); la **luce di vino** (CSS: bagliore radiale rubino che deriva in 26s e fili inclinati a 101°, mascherati in dissolvenza ai due capi); il **campo di vino** (shader a mezza risoluzione per la scena Lammiccato, raggi lenti su gradiente rubino → mosto, in pausa fuori schermo); la **materia** (pietra lavica e lastre: rumore frattale con illuminazione diffusa radente, generato nel browser). Scrim radiali e diagonali nella hero tengono leggibile il claim.

### Shadow Vocabulary
- **Bagliore d'oro** (`0 12px 36px -12px rgba(168,138,86,0.55)`): solo in hover sul pulsante avorio.
- **Ombra del vetro** (`0 10px 36px -14px rgba(0,0,0,0.75)`, in hover `0 12px 40px -14px rgba(0,0,0,0.8)`): sotto il pulsante di vetro della hero, per staccarlo dall'immagine.
- **Alone del progresso** (`0 0 12px rgba(168,138,86,0.4)`): sulla barra di scroll da 2px.
- **Filo della lastra** (`inset 0 0 0 1px rgba(168,138,86,0.12)`): il bordo interno delle lastre in attesa di foto.

### Named Rules
**The Glow-On-Touch Rule.** Le superfici sono piatte a riposo; la luce compare solo come risposta all'hover o al focus.

**The Live-Or-Still Rule.** Ogni strato vivo ha un ripiego fermo che regge da solo: il versamento cede alla frame-sequence (assenza di WebGL2, contesto perso, asset mancante, movimento ridotto), il campo di vino al radiale CSS sottostante, la deriva della luce a un bagliore immobile.

## Shapes

Due forme in netto contrasto. Le **azioni piene** sono pill complete (9999px): il pulsante avorio, il pulsante di vetro della hero, il toggle circolare del menu (42px). Le **superfici** hanno angoli vivi (0): righe della carta, lastre fotografiche, barre. Il sistema disegna con fili: regole da 1px in oro, fili delle azioni che si allungano da 32 a 56px, il filo delle generazioni, i raggi del Credo, le curve di livello del territorio, il bordo del calice nel `WineDisc`, il contorno da 1px del nome Lammiccato. L'unica geometria curva ricorrente è l'ellisse del vino visto dall'alto.

Il raggio di 2px esiste solo sull'anello di focus. Il raggio shadcn (`--radius` 0.625rem) resta per le primitive di libreria e non si usa per componenti di brand.

## Components

### Buttons
Sussurrati e precisi: testo maiuscolo spaziato, transizioni da 500ms.
- **Shape:** pill completo (9999px).
- **Primary (avorio):** fondo avorio, testo mosto profondo, label 12px a 0.18em, padding 16px 36px. In hover sale di 2px, prende il bagliore d'oro e un riflesso bianco obliquo lo attraversa in 700ms. Uno per schermo: "Prenota una visita", "Scrivi alla cantina" / "Vai al checkout".
- **Glass (solo hero):** avorio al 12% con `backdrop-blur-md` e `saturate(150%)`, bordo avorio al 30% (55% in hover), riflesso sul bordo superiore, testo con ombra morbida. Hover: fondo al 20%, scala 1.02; tap: 0.985.
- **Focus:** contorno oro 2px, offset 3px (globale).

### Azione a filo
L'azione di brand per i vini (`PurchaseAction`, "Chiedi del Lammiccato"): label 12px a 0.2em, avorio, preceduta da un filo oro di 1px largo 32px al 60–70%. In hover il filo si allunga a 56px e il testo diventa oro (500ms). Una sola azione per vino: "Richiedi" scrive alla cantina col vino già nominato, "Acquista" passa al checkout quando il negozio è collegato; mai prezzi o disponibilità inventati.

### Links
- **Secondari** ("Scheda", telefono): label 12–13px, avorio al 60–80%, avorio pieno o oro in hover.
- **In linea** ("Apri in Mappe"): testo oro con bordo inferiore oro al 40%, pieno in hover.
- **Footer:** avorio al 65%, oro in hover.

### Inputs / Fields
- **Selettore nella frase:** nessuna scatola. Il vino scelto è in corsivo pietra dentro la frase, sottolineato da un bordo inferiore oro al 40% (pieno in hover e focus), con un chevron oro a tratto 1.2.
- **Quantità:** il numero in oro con cifre tabulari, tra due tratti "−" e "+" in oro al 70% (pieno in hover; disabilitato al 30%).

### Navigation
Header fisso trasparente sopra la hero, che diventa lastra sfocata dopo 60px; il logo si riduce (72 → 60px desktop, 56 → 48px mobile). Voci in label 12px a 0.16em, avorio all'80%; la voce della sezione corrente è avorio pieno con un filo oro sotto che scivola tra le voci (layout condiviso, 600ms); in hover un filo oro al 60% cresce da 0 a tutta larghezza. "Acquista" è in oro con filo al 40%. Su mobile: toggle circolare 42px con bordo oro al 40% e tre fili da 1.4px che diventano una X; apre un dialogo a tutto schermo con gradiente prugna → mosto, voci in serif che entrano a cascata (60ms), stato di apertura, città e telefono in meta; focus trap ed Esc.

### Il versamento (Signature)
La hero dal vivo: il calice fotografato emerge dal buio in 2.4s, poi lo scroll lo inclina (dal 16% al 42% del progresso), versa (42–84%) e la pozza sale fino a coprire lo schermo (88%), virando sul fondo profondo (85–99%). L'inseguimento dello scroll è smorzato (`1 − e^(−7·dt)`): il bicchiere ha peso e non rimbalza; tornando indietro il vino si riversa nel calice. Il claim svanisce tra 14% e 30%, il filo di scroll si riempie fino al 60%. La qualità di rendering scende da sola sui frame lenti. Overlay identico per il versamento e per la frame-sequence.

### La carta dei vini (Signature)
Ogni vino è una riga, non una card: `WineDisc` (il vino visto dall'alto nel calice: bordo d'avorio al 32%, superficie nella tinta del vino, riflesso sul bordo lontano), meta con tipologia e denominazione, nome in headline, nota in body con il vitigno in oro, azione a filo e "Scheda". In hover o focus la tinta del vino sale lungo la riga dal basso (900ms, easeSilk), il disco cresce del 10% e, se c'è, la bottiglia appare in dissolvenza. Il vino raro non è una riga: è una porta in corsivo pietra verso la sua scena.

### Il registro delle generazioni (Signature)
Un grande numerale romano in oro resta fermo mentre i capitoli scorrono accanto; cambia con una dissolvenza sfocata (900ms, easeWine). Cinque tacche da 32px segnano dove si è nella famiglia; un filo oro → rubino cresce con la lettura.

### La scena Lammiccato (Signature)
Il vino raro ferma la pagina: l'header si fa da parte, il campo di vino diventa l'intera stanza e il nome, prima solo contorno, si riempie dal basso con lo scroll (dall'82% di vuoto a pieno entro il 55%). Nota di degustazione e azione a filo arrivano dopo (45–68%). Veli sfumati all'ingresso e all'uscita ricuciono la scena ai fondi vicini.

### Lastre fotografiche
`PhotoPlate`: il posto di una fotografia reale, tenuto dalla stessa pietra finché la foto non esiste (lastra vesuviana, velo bordeaux, rumore frattale illuminato, filo oro interno al 12%), con didascalia in meta. Proporzioni dello slot rispettate; nessuna foto di repertorio o generata.

### Brano della visita e frase d'acquisto
La visita si racconta come prosa in lead (clamp(25px, 2.9vw, 40px)) con teste in corsa in oro 11px a 0.26em allineate in alto, non come riga di feature. L'acquisto è una frase da completare: "Vorrei [n] bottiglie di [vino]." in sentence, chiusa da una regola oro al 15% sopra il pulsante avorio.

### Movimento
- **Curve:** `easeSilk` cubic-bezier(0.16, 1, 0.3, 1) per tutto; `easeWine` cubic-bezier(0.65, 0, 0.35, 1) per le dissolvenze incrociate (numerale).
- **Durate:** 0.6 / 0.9 / 1.2 / 1.5s; transizioni di stato 500–900ms.
- **Rivelazioni:** `rise` (42px, blur 8px, 1.2s), `riseSoft` (20px, 5px, 0.9s), titoli per riga o per parola con mascheratura (`lineReveal`).
- **Scroll:** ogni valore legato allo scroll passa per `scrollMap` (forma a funzione di `useTransform`).

## Do's and Don'ts

### Do:
- **Do** aprire ogni nuova scena sul colore con cui si chiude la precedente e restare nella famiglia dei fondi (#08040a, #0b0609, #120a10, #140a0e, #1a0710, #25070d), con passaggi a gradiente verticale.
- **Do** portare la luce del vino nelle scene scure con `WineLight` (alternando il lato) invece di nuove decorazioni.
- **Do** passare ogni mappatura di scroll per `scrollMap` (`useTransform(p, scrollMap([a, b], [c, d]))`): la forma ad array di un `useScroll` con target finisce sul ViewTimeline nativo, che sbaglia le sezioni sticky alte.
- **Do** usare `easeSilk` per ogni movimento ed `easeWine` solo per le dissolvenze incrociate; durate 0.6 / 0.9 / 1.2 / 1.5s.
- **Do** disegnare con regole oro al 15% (10–12% all'interno di una lista) e fili da 1px; salire al 40–70% solo su controlli e fili d'azione.
- **Do** usare righe, regole e lastre per le liste; l'ellisse `WineDisc` nella tinta del vino al posto della bottiglia finché la foto non esiste.
- **Do** tenere ogni slot fotografico mancante su una `PhotoPlate` con didascalia, mai su un'immagine di repertorio.
- **Do** dare a ogni strato vivo un ripiego fermo e rispettare `prefers-reduced-motion` (frame-sequence, nessun campo animato, nessuna deriva, altezze di scena automatiche).
- **Do** mantenere l'avorio come colore di testo e regolare la gerarchia con l'opacità (90 / 85 / 80 / 70 / 60 / 45%).

### Don't:
- **Don't** introdurre superfici chiare, un tema chiaro o sezioni su fondo avorio.
- **Don't** riempire pulsanti o aree con l'oro: è luce, non materia.
- **Don't** tornare a card, tile o griglie di prodotto per vini, passi o esperienze.
- **Don't** aprire una sezione con un'etichetta maiuscola decorativa sopra il titolo; il maiuscoletto porta solo dati o comandi.
- **Don't** usare ombre per staccare superfici a riposo; la profondità è tonale e atmosferica.
- **Don't** usare raggi intermedi (né il raggio shadcn da 10px) su componenti di brand: o pill, o angolo vivo.
- **Don't** usare una tinta di calice fuori dal vino a cui appartiene; il rubino come luce del vino versato è la sola eccezione di sistema.
- **Don't** aggiungere un terzo font o un mono; le cifre usano `tabular-nums`.
- **Don't** usare molle, rimbalzi o accelerazioni brusche: niente transizioni di brand sotto i 300ms.
