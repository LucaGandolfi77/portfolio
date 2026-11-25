# Pixel Stretch App

Editor di immagini browser-based con effetti **pixel stretch** e **scontorno AI**. Funziona completamente offline (tranne il primo download dei modelli AI) e non invia dati a nessun server.

Funziona su **iPhone (PWA installabile)**, **GitHub Pages** e come **app desktop (Electron)**.

## Uso su iPhone / mobile

- I pannelli laterali diventano **drawer scorrevoli**: tocca le icone 🔧 (strumenti) e 🗂 (livelli) nell'header.
- **Stretch Riga/Colonna senza tastiera**: tocca per impostare la riga/colonna sorgente, poi **trascina** per stirare (nessun tasto Shift necessario). Un tocco breve sposta la linea sorgente.
- **Zoom**: pizzica con due dita, doppio tocco (solo con strumenti vista), o i pulsanti +/-.
- **HEIC/HEIF**: le foto iPhone vengono convertite automaticamente in JPEG all'importazione.
- **Installabile**: su iOS Safari usa "Aggiungi a Home" (serve la prima volta online per il service worker; i modelli AI vengono scaricati al primo utilizzo e poi usati offline).

## App desktop (Electron)

Il wrapper è in `electron/` e aggiunge finestra nativa, dialoghi di apertura/salvataggio e gli header COOP/COEP (necessari per SharedArrayBuffer/WASM) via protocollo `app://` personalizzato.

```bash
npm run desktop:install   # installa electron + electron-builder in electron/
npm run desktop:dev       # build web + avvia l'app desktop
npm run desktop:build     # build web + pacchetti .dmg/.exe/.AppImage in electron/release/
# oppure: npm run desktop:build:mac|win|linux
```

Nell'app desktop "Esporta", "Salva progetto" e "Apri immagine" usano i dialoghi nativi del sistema.

## Deploy su GitHub Pages

- Il `base` di Vite è **relativo** (`./`): la build funziona a qualunque path — come project site (`https://<utente>.github.io/<repo>/`), in una sottocartella del portfolio, o in locale.
- Il workflow `.github/workflows/deploy.yml` compila e pubblica `dist/` su GitHub Pages (incluso un `404.html` fallback). Abilita Pages → "GitHub Actions" nel repo.
- GitHub Pages non invia gli header COOP/COEP: il **service worker** (`public/coi-sw.js`) li inietta a runtime, quindi lo scontorno AI (SharedArrayBuffer) funziona anche lì.
- La PWA precarica solo lo shell dell'app (~370KB); i chunk AI/HEIC pesanti vengono scaricati on-demand e messi in cache (workbox runtime caching per `staticimgly.com`, Hugging Face e gli asset locali).

## Pixel Stretch

### Stretch da Colonna (il più usato)

1. **Seleziona lo strumento** `Stretch Colonna` (icona ↔) dalla toolbar a sinistra
2. **Clicca** sul canvas nel punto in cui vuoi campionare la colonna di pixel
   - Apparirà una **linea blu tratteggiata** persistente
   - Il pannello mostrerà "Linea attiva: Colonna X"
3. **Tieni premuto Shift** e trascina il mouse orizzontalmente
   - Shift+trascina a **sinistra** → i pixel si stirano verso sinistra
   - Shift+trascina a **destra** → i pixel si stirano verso destra
   - Un'area ombreggiata mostra l'anteprima dello stretch
4. **Rilascia** Shift o il mouse per confermare
   - Viene creato un **nuovo layer** con l'effetto applicato
5. Per cambiare colonna sorgente: clicca in un altro punto
6. Per deselezionare: premi **ESC**

### Stretch da Riga

1. **Seleziona lo strumento** `Stretch Riga` (icona ⇅)
2. **Clicca** per selezionare la riga sorgente (linea rossa tratteggiata)
3. **Shift + trascina** verticalmente
   - Shift+trascina **su** → stretch verso l'alto
   - Shift+trascina **giù** → stretch verso il basso
4. Rilascia per confermare

### Stretch Radiale

1. **Seleziona** `Stretch Radiale`
2. **Clicca e trascina** direttamente sul canvas
   - Trascina orizzontalmente → stretch a sinistra/destra
   - Trascina verticalmente → stretch su/giù
3. Rilascia per creare il nuovo layer

### Stretch Warp

1. **Seleziona** `Stretch Warp`
2. **Clicca e trascina** per selezionare un'area rettangolare
3. La selezione viene distorta nella direzione del trascinamento
4. Rilascia per creare il nuovo layer

### Dissolvenza

Attiva **Dissoluzione** nel pannello opzioni per un effetto dithering
(bayer matrix) invece della dissolvenza lineare. I pixel non vengono
sfumati ma appaiono come punti accesi/spenti.

### Suggerimenti

- **Layer multipli**: ogni stretch crea un layer separato. Puoi
  combinarli, riordinarli e regolare l'opacità nel pannello Layers.
- **Effetto stratificato**: applica stretch a colonne diverse dello
  stesso soggetto per un effetto multi-direzione.
- **Scontorno + stretch**: usa lo scontorno per isolare il soggetto,
  poi applica stretch alla colonna/riga del soggetto scontornato.

## Scontorno (Background Removal)

### Scontorno Rapido

- Usa il modello **IS-Net** di `@imgly/background-removal`
- ~40MB (scaricati una volta, poi funziona offline)
- Buona qualità per soggetti generici
- **Clicca** `Rapido` nel pannello Scontorno (sinistra)

### Scontorno Preciso

- Usa **Transformers.js** + modello **ormbg** (Apache 2.0)
- ~44MB (scaricati da Hugging Face, poi caching offline)
- Migliore qualità su bordi complessi (capelli, pelliccia, oggetti trasparenti)
- Supporta **WebGPU** per accelerazione hardware
- **Clicca** `Preciso (AI)` nel pannello Scontorno

## Layer

Il pannello a destra mostra tutti i layer del documento.

| Azione | Come fare |
|--------|-----------|
| **Visibilità** | Click sull'icona occhio |
| **Opacità** | Slider sotto il nome del layer |
| **Blocca** | Click sull'icona lucchetto |
| **Duplica** | Click sull'icona copia |
| **Elimina** | Click sull'icona cestino |
| **Rinomina** | Doppio click sul nome |
| **Riordina** | Drag & drop |
| **Seleziona** | Click sul layer |

## Tastiera

| Scorciatoia | Azione |
|-------------|--------|
| **Click** | Seleziona riga/colonna sorgente |
| **Shift + click/drag** | Applica stretch dalla sorgente |
| **ESC** | Deseleziona riga/colonna |
| **Ctrl + scroll** | Zoom graduale |
| **Ctrl + 0** | Reset vista |
| **Ctrl + +** | Zoom in |
| **Ctrl + -** | Zoom out |
| **Frecce** | Sposta vista di 50px |
| **Shift + frecce** | Sposta vista di 10px |

## Tecnologia

- **React 19** + **TypeScript** con **Vite**
- **Canvas 2D** per rendering e pixel manipulation
- **Zustand** per state management
- **@imgly/background-removal** (IS-Net) — scontorno rapido
- **@huggingface/transformers** (ormbg) — scontorno preciso
- **Lucide React** per icone
- **Vite PWA** — installabile come app offline

## Installazione e Avvio

```bash
npm install
npm run dev
```

Il server parte su `http://localhost:5173/` (base relativa: nessun path prefissato).

### Build per produzione

```bash
npm run build
npm run preview
```

### Test

```bash
npm test
```

### Nota su COOP/COEP headers

Il progetto richiede header `Cross-Origin-Opener-Policy: same-origin` e
`Cross-Origin-Embedder-Policy: require-corp` per il supporto
SharedArrayBuffer (necessario per i modelli ONNX di background removal).
Questi sono già configurati in `vite.config.ts` per lo sviluppo e
tramite Service Worker per la produzione.

## Licenza

- Il codice è **MIT**
- `@imgly/background-removal` è **AGPL-3.0**
- Il modello **ormbg** (via Transformers.js) è **Apache 2.0**
