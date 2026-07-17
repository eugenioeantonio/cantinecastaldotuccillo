# Hero "Il tempo diventa vino" — Documento tecnico

**Cantine Castaldo Tuccillo** · Progettazione della hero section cinematografica
Autore: Senior Creative Developer · Data: 17 luglio 2026 · Stato: **progettazione — nessuna implementazione**

---

## 0. Obiettivo e vincoli

**La scena:** un calice fotorealistico appare → durante lo scroll si inclina lentamente → il vino segue una fisica credibile → esce dal calice → invade lo schermo → diventa lo sfondo della sezione successiva. Deve sembrare uno spot, non un sito.

**I tre vincoli che governano ogni decisione:**

| Vincolo | Valore | Conseguenza |
|---|---|---|
| Memoria Safari iOS | **~384 MB, kill secco** (no swap, no degrado) | Non si possono tenere i frame decodificati in RAM |
| Area massima canvas iOS | **16.777.216 px** (w×h) | DPR va limitato a 2 |
| Decodifica immagine | operazione **più costosa** del main thread | Va spostata off-thread e limitata |

### Il calcolo che decide l'architettura

Memoria decodificata = `larghezza × altezza × 4 byte` (RGBA). Non è il peso del file: è il peso **una volta decodificato**.

```
Desktop 1920×1080  →  7,91 MB per frame
Mobile  828×1472   →  4,65 MB per frame

L'errore classico (tenere tutti i frame come <img> decodificati):
  Desktop 1920×1080 × 120 frame = 949 MB   → tab uccisa da iOS
  Mobile  1080×1920 ×  90 frame = 712 MB   → tab uccisa da iOS
  Mobile   828×1472 ×  72 frame = 335 MB   → al limite, crash intermittente

Con ring buffer (finestra di decodifica):
  Desktop 1920×1080, finestra 16 = 127 MB  ✅
  Mobile   828×1472, finestra 10 =  46 MB  ✅
```

**Questo è il motivo per cui la maggior parte delle hero a sequenza va a scatti o crasha su iPhone.** La soluzione non è ridurre i frame: è non tenerli decodificati.

---

## 1. Analisi comparativa delle tecnologie

Legenda voti: 1 = pessimo, 10 = eccellente. "iPhone" = iPhone 12–16, Safari.

### 1.1 Three.js (real-time)
- **Vantaggi:** controllo totale, interattività reale, nessun asset pesante, il calice reagisce davvero.
- **Svantaggi:** il vino che **esce dal calice** richiede simulazione fluidodinamica (FLIP/SPH) + ricostruzione mesh (marching cubes) + rifrazione + caustiche. In real-time, a qualità cinematografica, **non è raggiungibile**. Il `transmission` di `MeshPhysicalMaterial` costa un render pass aggiuntivo.
- **Qualità visiva:** 5/10 (si vede che è 3D real-time) · **iPhone:** 3/10 · **Difficoltà:** 9/10 · **Next.js:** ottima · **Peso:** ~600 KB JS · **Manutenzione:** media.
- **Verdetto:** ❌ È l'attuale soluzione, giustamente rifiutata. Nessuno studio la userebbe per questa scena.

### 1.2 React Three Fiber
- Wrapper React di Three.js. **Non cambia il limite di fondo**: eredita esattamente gli stessi problemi di 1.1. Migliora solo la DX.
- **Qualità visiva:** 5/10 · **iPhone:** 3/10 · **Next.js:** ottima (`ssr:false`) · **Manutenzione:** buona.
- **Verdetto:** ❌ per questa scena.

### 1.3 Motion (`motion/react`)
- **Non è un renderer**: è il motore di animazione/scroll. `useScroll`, `useTransform`, `useSpring`.
- **Vantaggi:** già nello stack, API dichiarativa, `useSpring` dà gratis l'interpolazione morbida richiesta, ottimo `prefers-reduced-motion`.
- **Svantaggi:** nessun pin/scrub avanzato come ScrollTrigger (ma non ci serve: il pin lo fa `position: sticky`).
- **Ruolo:** ✅ **componente dell'architettura finale** (scroll engine), non alternativa.

### 1.4 GSAP + ScrollTrigger
- **Vantaggi:** lo standard degli studi. `scrub` con smoothing incorporato, pin robustissimo, ecosistema maturo. Oggi gratuito anche nei plugin.
- **Svantaggi:** +~50 KB, secondo paradigma di animazione accanto a Motion (due sistemi = incoerenza e debito), imperativo dentro React.
- **Qualità:** 9/10 · **iPhone:** 8/10 · **Next.js:** buona (con cleanup attento).
- **Verdetto:** 🟡 Eccellente, ma **duplicherebbe** Motion+Lenis già presenti. `sticky` + `useScroll` + `useSpring` copre il 100% del bisogno. Da non introdurre.

### 1.5 Theatre.js
- Editor/sequencer di animazione con timeline visuale.
- **Vantaggi:** choreografia precisa, editor in-browser.
- **Svantaggi:** non risolve il fotorealismo del fluido, aggiunge runtime + studio, attività del progetto rallentata, curva di apprendimento.
- **Verdetto:** ❌ Risolve un problema che non abbiamo (la nostra timeline è lineare: 1 asse di scroll).

### 1.6 Spline
- **Vantaggi:** no-code, veloce da iterare.
- **Svantaggi:** real-time (stessi limiti di 1.1), runtime pesante (~1 MB+), estetica riconoscibile "Spline", dipendenza da servizio terzo, zero controllo su performance.
- **Qualità:** 4/10 · **iPhone:** 4/10.
- **Verdetto:** ❌ Anti-luxury: si riconosce. Viola il mandato "mai un componente standard".

### 1.7 Blender (Cycles + FLIP Fluids / Mantaflow)
- **Non è un'alternativa web: è la fonte del fotorealismo.**
- **Vantaggi:** gratuito, Cycles fisicamente accurato (rifrazione, absorption volumetrico, caustiche), addon **FLIP Fluids** (~$70) per il versamento, pipeline nota, enorme community.
- **Svantaggi:** tempi di render (GPU consigliata), competenza 3D necessaria.
- **Qualità visiva:** 10/10 · **Peso finale:** deciso da noi in export · **Manutenzione:** ottima (asset statici).
- **Verdetto:** ✅ **Strumento di produzione scelto.**

### 1.8 Houdini
- **Vantaggi:** il migliore al mondo per i fluidi (FLIP solver di riferimento). È ciò che userebbe una VFX house.
- **Svantaggi:** licenza costosa, curva ripidissima, specialista raro/caro. **Overkill** per una singola inquadratura di 5 secondi.
- **Qualità visiva:** 10/10.
- **Verdetto:** 🟡 Se il budget lo consente e trovi l'artista, resa del fluido superiore. Blender + FLIP Fluids arriva al **95%** del risultato a una frazione del costo.

### 1.9 Cinema 4D (+ Redshift / X-Particles)
- **Vantaggi:** workflow artista rapidissimo, Redshift = render GPU velocissimo, standard nell'advertising.
- **Svantaggi:** licenza in abbonamento, X-Particles a parte.
- **Qualità visiva:** 10/10.
- **Verdetto:** 🟡 Alternativa perfettamente valida a Blender. **Scegli in base all'artista che assumi**, non alla tecnologia.

### 1.10 Frame sequence (immagini + canvas) ⭐
- **Vantaggi:** qualità = qualità del render (**illimitata**), scrubbing **frame-accurate** e deterministico, funziona **ovunque** (anche iOS 12), nessuna dipendenza runtime, decodifica controllabile.
- **Svantaggi:** peso maggiore di un video, **rischio memoria** (vedi §0), richiede gestione decodifica.
- **Qualità:** 10/10 · **iPhone:** 8/10 (9/10 con ring buffer) · **Difficoltà:** 6/10 · **Next.js:** perfetta (file statici) · **Peso:** 4–16 MB · **Manutenzione:** 10/10.
- **Verdetto:** ✅ **Baseline scelta.** È la tecnica di Apple (AirPods Pro, iPhone): 65–148 frame, con preload a checkpoint.

### 1.11 Video scroll-controlled (`video.currentTime`)
- **Vantaggi:** peso minimo (~2–4 MB), un solo file.
- **Svantaggi:** **`currentTime` scrubbing su iOS Safari è inaffidabile e a scatti** — il seek non è frame-accurate, richiede encode con keyframe su ogni frame (annullando il vantaggio di peso), su iOS il decoder può rifiutare seek rapidi. È la causa nº1 degli scroll-video che "saltano".
- **Qualità:** 9/10 · **iPhone:** **4/10** · **Manutenzione:** 8/10.
- **Verdetto:** ❌ da solo. È esattamente il problema di fluidità che vogliamo evitare.

### 1.12 WebCodecs (`VideoDecoder`) → canvas ⭐
- **Vantaggi:** **il meglio dei due mondi**: compressione video (~70% più leggero della sequenza) + accesso **frame-accurate**, memoria bassissima (ring buffer nativo), decodifica hardware.
- **Svantaggi:** **Safari solo da 26.0** (iOS 26+) → serve fallback per la base installata; complessità alta; encode con `keyframe = 1` consigliato per lo scrubbing.
- **Qualità:** 10/10 · **iPhone:** 9/10 (iOS 26+), n/d sotto · **Difficoltà:** 8/10 · **Peso:** 2–5 MB.
- **Verdetto:** ✅ **Progressive enhancement (Fase 2)**, dietro la stessa interfaccia della sequenza.

### 1.13 Lottie
- Vettoriale (Bodymovin). Non può rappresentare vetro, rifrazione, caustiche, fluido fotorealistico. Un calice in Lottie = illustrazione.
- **Qualità (per questo scopo):** 2/10.
- **Verdetto:** ❌ Sbagliato per definizione.

### 1.14 WebGPU
- **Novità 2026:** ora **supportato su iOS 26 / Safari 26** (backend Metal), copertura globale ~70–82%.
- **Vantaggi:** compute shader → simulazione fluida real-time diventa concepibile; ottime performance/batteria.
- **Svantaggi:** **18–30% degli utenti non ce l'ha** → serve comunque un percorso alternativo completo; e anche con i compute shader **non si raggiunge il fotorealismo Cycles** in real-time. Complessità altissima.
- **Qualità:** 6/10 · **iPhone:** 7/10 (solo iOS 26+) · **Difficoltà:** 10/10.
- **Verdetto:** ❌ oggi. Da riconsiderare tra 2–3 anni.

### 1.15 Gaussian Splatting
- **Vantaggi:** fotorealismo da cattura reale, straordinario per scene **statiche**.
- **Svantaggi:** dinamico (4D splatting) = ricerca, file enormi (decine/centinaia di MB), pipeline immatura, e **un fluido che si deforma non è catturabile**.
- **Verdetto:** ❌ Tecnologia sbagliata per il problema.

### 1.16 Altre tecnologie valutate
| Tecnologia | Verdetto |
|---|---|
| **AVIF sequence** | ❌ Comprime 20–30% meglio di WebP ma **decodifica più lenta su mobile**; tooling animato immaturo. Decodifichiamo 60×/s: vince la velocità, non i byte. |
| **Animated WebP / APNG** | ❌ Non scrubbabile (nessun accesso al frame). |
| **CSS scroll-driven animations** | 🟡 Eleganti, ma nessun controllo su decodifica/memoria. Non reggono 120 frame su iOS. |
| **OffscreenCanvas + Web Worker** | ✅ **Adottato**: decodifica fuori dal main thread (Safari 16.4+). |
| **`createImageBitmap()`** | ✅ **Adottato**: decodifica asincrona off-thread + `.close()` per liberare memoria deterministicamente. |
| **KTX2 / Basis Universal** | ❌ Texture compresse GPU: geniale ma richiede WebGL/WebGPU e un transcoder. Overkill. |
| **Media Source Extensions** | ❌ Complessità da streaming senza i benefici di WebCodecs. |

---

## 2. Le 5 architetture

| # | Architettura | Qualità visiva | Fluidità | Perf. mobile | Manutenzione | Effetto WOW | **Media** |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **A** | R3F/Three real-time + fluido simulato (attuale) | 5 | 5 | **2** | 5 | 5 | **4.4** |
| **B** | WebP sequence + canvas + lerp (Apple classic) | **10** | 9 | 8 | **10** | 9 | **9.2** |
| **C** | WebCodecs video → canvas (+ fallback sequenza) | **10** | **10** | 9 | 6 | **10** | **9.0** |
| **D** | `<video>` scroll-controlled via `currentTime` | 9 | **4** | **4** | 8 | 7 | **6.4** |
| **E** | **Sequenza WebP + Worker/OffscreenCanvas + ring buffer + spring, con seam per WebCodecs** | **10** | **10** | **9** | 8 | **10** | **9.4** ⭐ |

**Architettura F valutata e scartata:** calice R3F real-time + versamento pre-renderizzato in overlay. Il salto di qualità tra il calice real-time e il fluido renderizzato sarebbe **visibile e imbarazzante** — peggio di entrambe le soluzioni pure.

### Perché vince E

**E è ciò che spedirebbe uno studio internazionale con budget elevato**, per tre ragioni che B e C da soli non hanno:

1. **B ha il difetto nascosto** che ho misurato in §0: senza ring buffer, 120 frame decodificati = 949 MB = iPhone morto. B "funziona" nelle demo e crolla in produzione. E è B **fatto bene**.
2. **C è tecnicamente superiore ma non spedibile oggi da solo**: WebCodecs è su Safari solo da 26.0. Metterlo come unica strada significa escludere una fetta enorme di iPhone reali.
3. **E li unifica dietro un'unica interfaccia `FrameSource`**: si spedisce oggi la sequenza WebP (universale, bulletproof), e quando vorremo, si innesta la sorgente WebCodecs per i browser capaci **senza toccare la hero** — cutting del peso ~70% per quegli utenti.

Questa è la differenza tra "fare l'effetto" e "progettare un sistema": **la scelta non è la tecnologia, è la seam** (la cucitura) che permette di cambiarla domani.

> **Nota di onestà tecnica:** la vera qualità cinematografica **non viene dal web**. Viene da Blender/Cycles. Il web è solo il proiettore. Ogni ora investita nel render vale dieci ore investite nel codice della hero. Il codice deve essere invisibile e non rovinare il render — nient'altro.

---

## 3. Stack definitivo

| Livello | Scelta | Motivo |
|---|---|---|
| Framework | **Next.js 16** (App Router) + React 19 + TS | già in essere; asset statici serviti da CDN Vercel |
| Rendering hero | **Canvas 2D** (`drawImage`) | zero dipendenze, controllo totale, nessun WebGL |
| Sorgente frame | **Sequenza WebP** (Fase 1) → interfaccia aperta a **WebCodecs** (Fase 2) | universale ora, ottimizzabile poi |
| Decodifica | **`createImageBitmap()`** + ring buffer + `.close()` | off-thread, memoria deterministica |
| Scroll engine | **Motion** `useScroll` + **`useSpring`** | interpolazione morbida (requisito nº6) |
| Smooth scroll | **Lenis** (già presente) | inerzia coerente col resto del sito |
| Pin | **CSS `position: sticky`** | zero JS, nessun layout thrash, robusto su iOS |
| Stile | Tailwind v4 + token del brand | coerenza col design system |

**Nessuna nuova libreria.** Niente GSAP, niente Theatre, niente Spline. La hero costa **~4 KB di JS**.

---

## 4. Struttura cartelle e denominazione

```
public/
  sequences/
    wine-glass/
      desktop/                  16:9  — 1920×1080
        frame_0001.webp
        frame_0002.webp
        …
        frame_0120.webp
      mobile/                   9:16  — 828×1472
        frame_0001.webp
        …
        frame_0072.webp
      poster-desktop.webp       primo frame (LCP + fallback no-JS)
      poster-mobile.webp
```

**Regole di denominazione (tassative):**
- prefisso `frame_`, indice **1-based**, **4 cifre** zero-padded, estensione `.webp`
- desktop: `frame_0001.webp` → `frame_0120.webp` (nessun buco nella numerazione)
- mobile: `frame_0001.webp` → `frame_0072.webp`
- `frame_0001` = calice fermo, pieno, in posa d'apertura
- l'**ultimo** frame = schermo interamente riempito di vino, colore piatto **`#25070D`**

---

## 5. Componenti React

```
components/hero/
  wine-glass-scroll-sequence.tsx   Componente pubblico: sezione sticky + canvas + orchestrazione
  use-frame-sequence.ts            Hook: preload, ring buffer, decode, disegno
  frame-source.ts                  Interfaccia FrameSource + ImageSequenceSource (+ WebCodecsSource in Fase 2)
  sequence-config.ts               Config dichiarativa (path, conteggi, risoluzioni, breakpoint)
```

**Contratto (design, non implementazione):**

```ts
interface FrameSource {
  readonly count: number;
  prime(indices: number[]): Promise<void>;   // preload checkpoint
  frame(i: number): ImageBitmap | null;      // null = non pronto → disegna il più vicino
  ensureWindow(center: number, radius: number): void; // decodifica avanti/indietro, chiude il resto
  dispose(): void;
}
```

`WineGlassScrollSequence` non sa **nulla** di WebP o WebCodecs: parla solo con `FrameSource`. È questa la seam di §2.

Il vecchio `wine-glass-3d.tsx` e `hero-frames.tsx` vengono **rimossi**; `three`, `@react-three/fiber`, `@react-three/drei` **disinstallati** (−~700 KB dal bundle).

---

## 6. Pipeline: Blender → Web

### 6.1 Workflow Blender (per l'artista 3D)

1. **Modellazione** calice: profilo lathe, spessore reale **1,2–1,8 mm** (lo spessore è ciò che rende credibile il vetro).
2. **Materiali**
   - *Vetro*: Glass BSDF / Principled con `Transmission 1.0`, `IOR 1.52` (cristallo), `Roughness 0.0–0.02`.
   - *Vino*: Principled con `Transmission 1.0`, `IOR 1.36`, **Volume Absorption** `#4A0F1B` density 60–90 (il colore del vino **deve** venire dal volume, non dal base color — è questo che distingue un vino vero da una gelatina rossa).
3. **Simulazione**: **FLIP Fluids** (o Mantaflow). Risoluzione ≥ 250, `viscosity` ~0.001, surface tension attiva. **Bake dell'intera simulazione** prima del render.
4. **Camera**: **bloccata**, 50–85 mm, f/2.8–4. Nessun movimento camera: il movimento è tutto del calice e del vino. Camera fissa = scrubbing pulito.
5. **Luci**: HDRI studio scuro + 2 strip luminose (key calda sinistra, rim destra). Il vetro si legge **solo** grazie ai riflessi speculari: senza strip, il calice sparisce.
6. **Render**: Cycles GPU, **256–512 samples**, denoise **OptiX**, **Motion Blur OFF** (fondamentale: lo scrubbing deve essere nitido a ogni frame; il blur lo crea l'occhio), Film > **Transparent OFF** (sfondo renderizzato).
7. **Output**: PNG 16-bit o EXR → sequenza. **Mai** esportare direttamente in WebP da Blender.
8. **Compositing** (opzionale, consigliato): leggera grana e vignettatura in Blender/AE per legare col resto del sito.

### 6.2 Coreografia (i 120 frame desktop)

| Frame | Scena | Scroll |
|---|---|---|
| 0001–0020 | Calice fermo, pieno, micro-oscillazione | 0 → 17% |
| 0021–0060 | Inclinazione lenta, il vino segue con inerzia, risale la parete | 17 → 50% |
| 0061–0090 | Il vino supera il bordo, primo filo che cade | 50 → 75% |
| 0091–0110 | Il vino invade l'inquadratura dal basso | 75 → 92% |
| 0111–0120 | **Convergenza a colore pieno `#25070D`** | 92 → 100% |

**Il punto nº8 del brief (transizione senza stacco) si risolve nel render, non nel codice:** l'ultimo frame è un rettangolo uniforme `#25070D`; la sezione successiva ha `background: #25070D`. Il canvas resta sticky sotto. Risultato: la cucitura **non esiste fisicamente**. È l'unico modo per non vedere lo stacco.

### 6.3 Workflow render → browser

```bash
# 1. Render Blender → PNG 16-bit in /render/desktop, /render/mobile

# 2. Conversione + resize (ffmpeg o sharp/squoosh)
#    desktop: 1920×1080, WebP q82
#    mobile:  828×1472,  WebP q78

# 3. Rinomina in frame_%04d.webp partendo da 0001

# 4. Verifica budget: nessun frame > 180 KB (desktop) / 90 KB (mobile)

# 5. Copia in public/sequences/wine-glass/{desktop,mobile}/
```

Fornirò lo script di conversione in fase implementativa.

---

## 7. Specifiche di consegna dei render

### 7.1 Le risposte alle tue domande

| Domanda | Risposta | Perché |
|---|---|---|
| **Frame desktop** | **120** | Apple usa 65–148. Su ~500vh, 120 frame = 1 frame ogni ~4vh: sotto la soglia di percezione dello step. Oltre 120 = peso lineare, ritorno nullo. |
| **Frame mobile** | **72** | Scroll più corto, schermo più piccolo, memoria e rete più scarse. 72 mantiene la fluidità dimezzando quasi il peso. |
| **Risoluzione desktop** | **1920×1080** (16:9) | Sweet spot. 2560×1440 costa **14 MB/frame decodificati** (vs 7,9) e raddoppia il peso per un guadagno invisibile su fotografia scura. |
| **Risoluzione mobile** | **828×1472** (9:16) | 1080×1920 costa 7,9 MB/frame → ring buffer troppo caro su iPhone. 828 è la larghezza logica ×2 di molti iPhone. |
| **Formato** | **WebP**, q82 desktop / q78 mobile | AVIF comprime meglio ma **decodifica più lentamente su mobile**; a 60 fps vince la decodifica. |
| **Peso max desktop** | **≤ 15 MB** (target 12) — ~100–140 KB/frame | Si carica progressivamente, non blocca l'LCP. |
| **Peso max mobile** | **≤ 5 MB** (target 3,5) — ~50–70 KB/frame | Budget realistico su 4G. |
| **Peso totale** | **≤ 20 MB nel repo**, ma **un solo set viene scaricato per device** | L'utente non paga mai entrambi. |
| **Dove inserirli** | `public/sequences/wine-glass/desktop/` e `.../mobile/` | Vedi §4 |
| **Denominazione** | `frame_0001.webp` … `frame_0120.webp` (desktop) / `frame_0072.webp` (mobile) | 1-based, 4 cifre, senza buchi |

### 7.2 Requisiti tassativi per il 3D artist
- Camera **bloccata**, **motion blur OFF**, sfondo renderizzato (non trasparente).
- **Ultimo frame = `#25070D` pieno**, uniforme, senza gradiente.
- Le due sequenze sono **inquadrature diverse**, non un crop: il 9:16 va **re-inquadrato** (calice più grande, più aria verticale). Un crop del 16:9 su mobile è il marchio del lavoro fatto male.
- Colore del vino dal **Volume Absorption**, non dal base color.
- Consegna in **PNG/EXR**, conversione WebP a carico nostro.

---

## 8. Progettazione tecnica di dettaglio

### 8.1 Caricamento ottimizzato / preload / lazy
Strategia **a checkpoint** (la stessa di Apple):
1. **Immediato:** `frame_0001` come `<img priority>` poster → LCP veloce, la hero ha subito un contenuto.
2. **Checkpoint:** primo, ultimo, 50%, poi 25% e 75% → una versione "degradata ma completa" dell'animazione è disponibile in ~1s.
3. **Progressivo:** riempimento a densità crescente, `fetchpriority="low"`, senza bloccare gli altri asset.
4. **Ring buffer:** decodifica solo la finestra attorno al frame corrente.
5. La sequenza si carica **solo se la hero è nel viewport** e **solo per il device attivo** (mai entrambi i set).

### 8.2 Canvas
- **Un solo canvas** (il limite iOS è sul totale dei canvas).
- `alpha: false` → compositing più veloce, niente blending inutile.
- `drawImage` con cover-fit calcolato a ogni resize, non a ogni frame.
- Backing store: `CSS size × min(DPR, 2)`.

### 8.3 Scroll engine e sincronizzazione (requisito nº6)
```
scrollYProgress (Motion, su sezione sticky 500vh)
   → useSpring({ stiffness: 90, damping: 26, restDelta: 0.001 })   ← l'interpolazione
   → frameIndex = round(spring × (count − 1))
   → se cambiato: ensureWindow(i, 8) + draw(i)
```
Il **`useSpring` è la risposta esatta al requisito nº6**: il frame non insegue il pixel di scroll, insegue una molla. Lo scroll diventa un *target*, non un *comando*. Con Lenis a monte, si ottiene una doppia inerzia — quella del dolly e quella della scena — che è precisamente la sensazione "spot cinematografico".

Il disegno avviene in **rAF**, mai nel listener di scroll.

### 8.4 Gestione memoria
- Blob compressi in memoria: 12 MB desktop / 4 MB mobile → trascurabile.
- `ImageBitmap` decodificati: **finestra di 16 (desktop) / 10 (mobile)** → **127 MB / 46 MB** di picco (vs 949 MB / 712 MB).
- `.close()` esplicito su ogni bitmap che esce dalla finestra → rilascio **deterministico**, non affidato al GC.
- `dispose()` completo su unmount; azzeramento del canvas a 1×1 all'uscita (trucco noto per far rilasciare la memoria a Safari).

### 8.5 Resize e retina
- `ResizeObserver` con **debounce 150 ms**; ridisegno del frame corrente, **nessun re-fetch**.
- DPR **cappato a 2** (§0: a DPR 3 si supera il limite di area canvas iOS).
- Cambio di **orientamento o attraversamento del breakpoint** → swap della sequenza, ma solo se il device cambia davvero classe (con isteresi, per non ricaricare a ogni rotazione).

### 8.6 Fallback e degradazione
| Condizione | Comportamento |
|---|---|
| JS disattivato | `<img>` poster statico + testo hero completo |
| Sequenza assente / 404 | Poster statico, la pagina resta perfetta (nessuna hero rotta) |
| `prefers-reduced-motion` | **Nessuno scrub**: un solo frame rappresentativo (~55%), sezione a 100vh, zero decodifiche |
| Rete lenta (`saveData`, `2g`) | Solo poster, nessuna sequenza |
| Memoria scarsa (`deviceMemory ≤ 4`) | Finestra ridotta a 6 |

### 8.7 Accessibilità
- La sequenza è **decorativa**: canvas `aria-hidden="true"`.
- Il contenuto reale (h1, sottotitolo, CTA) è **testo DOM vero**, sempre presente e leggibile: mai dipendente dal canvas.
- La sezione sticky **non intrappola** lo scroll né la tastiera.
- `prefers-reduced-motion` rispettato integralmente (§8.6).
- Contrasto del testo garantito da un overlay gradiente, non dalla fortuna del frame.

### 8.8 SEO
- Zero impatto: il testo hero è nel DOM lato server (RSC).
- Le immagini della sequenza **non** vanno indicizzate → `X-Robots-Tag: noindex` sulla cartella (o semplicemente nessun link).
- Poster con `alt` descrittivo per la condivisione.
- JSON-LD `Winery` invariato.

### 8.9 Performance / Lighthouse
| Metrica | Target | Strategia |
|---|---|---|
| LCP | < 2,0 s | Il poster è l'LCP, non la sequenza |
| CLS | **0** | Sezione ad altezza fissa dichiarata |
| INP | < 200 ms | Zero lavoro nel listener di scroll; decode off-thread |
| TBT | < 150 ms | `createImageBitmap` non blocca il main thread |
| Performance | ≥ 90 mobile | La sequenza si carica dopo l'LCP, a priorità bassa |

### 8.10 Ottimizzazione Safari iOS (la sezione che decide il successo)
1. **Ring buffer obbligatorio** — §0. Non negoziabile.
2. **DPR ≤ 2** — limite di area canvas.
3. **`.close()` esplicito** — Safari non libera gli `ImageBitmap` in tempo da solo.
4. **Un solo canvas.**
5. **Niente `<video>` scrubbing** (§1.11).
6. **Barra URL dinamica:** usare `100svh`/`100dvh`, mai `100vh` — altrimenti il layout salta allo scroll.
7. **`-webkit-transform: translateZ(0)`** sul contenitore sticky per forzare la promozione a layer.
8. **Test obbligatorio su iPhone reale**, non sul simulatore: i limiti di memoria **non si riproducono** in simulatore.

---

## 9. Piano di lavoro

**Fase 1 — Predisposizione tecnica (dopo la tua approvazione di questo documento)**
1. Rimozione di `wine-glass-3d.tsx`, `hero-frames.tsx`; disinstallazione di `three`/R3F/drei.
2. `frame-source.ts`, `use-frame-sequence.ts`, `wine-glass-scroll-sequence.tsx`, `sequence-config.ts`.
3. Cartelle + **frame placeholder numerati** (generati proceduralmente: numero, indice, colore che converge a `#25070D`) per validare **il funzionamento tecnico**: scrub, spring, ring buffer, resize, swap desktop/mobile, transizione senza stacco.
4. Verifica locale: memoria, fluidità, mobile, reduced-motion.

**Fase 2 — Render definitivi (tu)**
5. Inserimento dei render secondo §7 → il placeholder viene sostituito **senza toccare il codice**.

**Fase 3 — Ottimizzazione (opzionale)**
6. `WebCodecsSource` dietro `FrameSource` per iOS 26+/Chrome → −70% di peso per quegli utenti.

**Deploy: solo dopo la tua approvazione dei render definitivi.**

---

## 10. Fonti

- [WebKit Features in Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/) — WebCodecs, WebGPU
- [WebGPU is now supported in major browsers — web.dev](https://web.dev/blog/webgpu-supported-major-browsers)
- [WebGPU Implementation Status](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status)
- [Total Canvas Memory Use Exceeds The Maximum Limit — PQINA](https://pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/) — limiti canvas/memoria iOS
- [How We Stopped iOS Safari From Crashing Our E-Commerce Site](https://medium.com/@shilpecsaxena9098/how-we-stopped-ios-safari-from-crashing-our-e-commerce-site-beeb948ded34) — limite 384 MB
- [Let's Make One of Those Fancy Scrolling Animations Used on Apple Product Pages — CSS-Tricks](https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/)
- [How to Create Scroll Driven Image Sequence Animations](https://medium.com/@kozelsky/how-to-create-scroll-driven-image-sequence-animations-964359507371) — checkpoint preload, WebP −90%
- [A Tutorial: WebCodecs Video Scroll Synchronization](https://lionkeng.medium.com/a-tutorial-webcodecs-video-scroll-synchronization-8b251e1a1708)
- [WebP or AVIF for Web Performance? 2026 Benchmark](https://pixotter.com/blog/webp-vs-avif/)
- [Delivering Video Content for Safari — Apple](https://developer.apple.com/documentation/webkit/delivering-video-content-for-safari)
- [Create a Wine Glass — Blender Fluid Simulation Tutorial (CG Geek)](https://www.youtube.com/watch?v=9bZkivGauxY)
