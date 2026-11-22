# Text Lab

OCR locale da fotocamera e immagini: testo editabile, statistiche, cronologia e
download, tutto nel browser. Tesseract.js, i core WASM e le lingue sono serviti
localmente; nessuna immagine viene caricata.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/text-lab/>

## Cosa fa

- **Fotocamera**: avvio su gesture, scatto, cambio fotocamera; il frame viene
  letto senza uscire dal dispositivo.
- **Immagini**: upload, drag & drop e incolla dagli appunti.
- **OCR**: inglese, italiano o entrambi; preprocessing con scala di grigi,
  contrasto alto e rotazione; progresso per fase con annullamento.
- **Risultato**: textarea modificabile, parole/caratteri/righe, affidabilità,
  tempo di lettura e durata; copia, download `.txt`, condivisione, sintesi
  vocale e pulizia del testo.
- **Cronologia** locale degli ultimi 20 risultati con ripristino e cancellazione.
- **EN/IT**, tema chiaro/scuro, layout mobile-first, PWA installabile.
- **Offline**: shell subito, OCR disponibile dopo il primo uso (core e lingue
  vengono cachati dal service worker).

## Struttura

```text
projects/text-lab/
├─ index.html
├─ manifest.webmanifest
├─ sw.js                    # shell pf-text-lab-shell-v1
├─ icon.svg / icons/
├─ css/app.css
├─ js/
│  ├─ app.js                # camera, upload, preprocessing, worker OCR
│  ├─ text.js               # lingue, pulizia testo, stats, progress (puro)
│  ├─ storage.js            # impostazioni e cronologia
│  ├─ i18n.js               # EN/IT
│  └─ vendor/tesseract/
│     ├─ tesseract.min.js   # 5.1.1
│     ├─ worker.min.js
│     ├─ core/              # LSTM SIMD + fallback
│     └─ lang/              # eng + ita (tessdata_fast, gzip)
└─ tests/                   # 23 test Node
```

## Dati e privacy

| Chiave | Contenuto |
| --- | --- |
| `pf.text.settings` | lingua OCR, preprocessing, fotocamera |
| `pf.text.history` | ultimi 20 testi riconosciuti |
| `pf.shell.favorites`, `pf.theme`, `pf.lang` | preferenze della shell |

Le immagini vengono disegnate su canvas, preprocessate e passate al Web Worker
di Tesseract: nessun upload. La cronologia contiene solo testo e metadati, non
le immagini.

## Tesseract locale

- `tesseract.js@5.1.1` (Apache-2.0) e `tesseract.js-core@5.1.0` (Apache-2.0).
- Core LSTM: `tesseract-core-simd-lstm.wasm.js` e fallback no-SIMD.
- Lingue `eng` e `ita` da `tessdata_fast`, gzip locale.
- `workerBlobURL: false`, `workerPath`/`corePath`/`langPath` locali.
- La prima esecuzione carica core e lingua (circa 6–10 MB); il service worker li
  mette in cache e l’OCR successivo funziona anche offline.

## Test

```bash
node --test projects/text-lab/tests/*.test.mjs
node --check projects/text-lab/js/app.js
node tools/quality/generate-text-icons.mjs
```

E2E (Playwright, Chromium desktop + iPhone emulato):

```bash
cd tools/quality
npm ci
npx playwright install --with-deps chromium
npm test
```

Il test principale genera un’immagine con testo, la carica, verifica OCR reale,
rotazione, download `.txt`, cronologia e **OCR offline** dopo il primo uso. Gli
altri coprono cronologia, lingua/persistenza, camera, redirect legacy, layout
mobile e shell offline.

## Deploy

Pagina statica su GitHub Pages. Se cambiano asset della shell, incrementare
`CACHE` in `sw.js`. Il service worker root del portfolio preserva le cache
`pf-text-lab-*`.
