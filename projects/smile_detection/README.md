# 😊 SMILE DETECTION

App dedicata all'analisi del sorriso, rinata come progetto autonomo dopo il trasferimento di Smile Lab in Vision Lab. Tutto gira sul dispositivo: nessun frame viene caricato.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/smile_detection/>

## Pipeline

1. **MediaPipe FaceLandmarker** (modello e WASM vendorizzati in `vision-lab`, riusati senza duplicazione): 478 landmark, 52 blendshape, box del volto e crop 224×224 allineato sugli occhi.
2. **ViT-B/16 FER** (`Xenova/facial_emotions_image_detection`, q8 ~88 MB, Apache-2.0) eseguito in un **Web Worker** con Transformers.js: classificazione di 7 emozioni su WebGPU con fallback WASM, ~2 inferenze/s.
3. **Fusione** (`fusion.js`): `smile = w·blendshapeSmile + (1−w)·P(happy)`, pesata da margine top-1 e entropia della softmax. Se la lettura è ambigua l'app mostra "inquadra meglio" invece di un numero affidabile. Media mobile EMA e banda di confidenza.
4. **Denti** (`teeth.js`): crop dalle labbra interne, whiteness in spazio **LAB** (L* e neutralità a*/b*) e allineamento tramite regressione sulla linea dei denti; richiede bocca aperta e luce buona.

È una **stima giocosa**, non una diagnosi dentistica né una misura di emozioni interiori.

## Interfaccia

Design **liquid glass** ottimizzato per iPhone: viewfinder full-bleed con safe-area, materiali traslucidi con `backdrop-filter`, bordi speculari, pill di stato, gauge del sorriso con alone animato, bottom sheet con metriche, emozioni, record personale, snapshot JPEG e toggle camera. Supporto desktop, IT/EN e `prefers-reduced-motion`.

## Architettura

```text
projects/smile_detection/
├─ index.html / README.md
├─ css/app.css                 # liquid glass
├─ js/
│  ├─ face.js                  # MediaPipe + crop allineato
│  ├─ emotion-worker.js        # Transformers.js in worker
│  ├─ emotion.js               # client worker
│  ├─ fusion.js / teeth.js     # PURI e testati
│  ├─ ui.js / storage.js / i18n.js / main.js
├─ tests/analysis.test.mjs
└─ manifest.webmanifest / icon.svg / sw.js
```

I vecchi file (`app.js`, `smile_analyzer.js`, `face_tracker.js`, `ui.js`, `style.css`) restano come legacy e non vengono più caricati dalla pagina.

## Dati e privacy

Il primo avvio scarica il modello ViT (~88 MB) e i dati MediaPipe; poi tutto resta in cache. `localStorage`: `smiledet.v1` (record e contatori), `smiledet.lang`. Nessun upload. Servono HTTPS o localhost per il microfono e un browser con WebAssembly/WebGL.

## Sviluppo e test

```bash
python3 -m http.server 8080
# http://localhost:8080/projects/smile_detection/

node --test projects/smile_detection/tests/*.test.mjs
node --check projects/smile_detection/js/main.js
```
