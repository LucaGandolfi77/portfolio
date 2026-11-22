# Vision Lab

Specchio di computer vision privato: mesh facciale dal vivo, telemetria delle
espressioni e analisi giocosa del sorriso. Il modello gira nel browser; nessun
frame viene caricato.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/vision-lab/>

## Cosa fa

- **Mesh mode**: 478 landmark facciali e 52 blendshape, mesh soft/full/off,
  contorni di occhi, sopracciglia, labbra e viso, fino a 2 volti.
- **Telemetria**: battito di ciglia con contatore, sorriso, sopracciglia,
  yaw/pitch/roll, emozione stimata e FPS.
- **Smile mode**: punteggi per sorriso, bianchezza dei denti e allineamento,
  totale /100, stelle, record personale locale e suggerimenti.
- **Camera**: avvio su gesture, stop, cambio fotocamera, specchio, istantanea
  PNG composta (video + overlay + punteggio) e schermo intero.
- **EN/IT**, tema chiaro/scuro, layout mobile-first, PWA installabile.
- **On-device**: MediaPipe Tasks Vision e il modello FaceLandmarker sono
  vendorizzati; nessuna richiesta a CDN o server di inferenza.

## Struttura

```text
projects/vision-lab/
├─ index.html
├─ manifest.webmanifest
├─ sw.js                    # shell pf-vision-lab-shell-v1
├─ icon.svg / icons/
├─ css/app.css
├─ js/
│  ├─ app.js                # camera, FaceLandmarker, UI
│  ├─ vision.js             # metriche, pose, emozioni, pixel denti (puro)
│  ├─ storage.js            # settings + record
│  ├─ i18n.js               # EN/IT
│  └─ vendor/mediapipe/     # tasks-vision 0.10.18 + WASM + licenza
├─ model/face_landmarker.task
└─ tests/                   # 22 test Node
```

`vision.js` non dipende dal DOM. L’analisi dei denti riceve pixel RGBA già
ritagliati, quindi è testabile con frame sintetici.

## Dati e privacy

| Chiave | Contenuto |
| --- | --- |
| `pf.vision.settings` | modalità, densità mesh, specchio, fotocamera |
| `pf.vision.best` | miglior punteggio Smile Lab con data |
| `pf.shell.favorites`, `pf.theme`, `pf.lang` | preferenze della shell |

Il flusso video non viene salvato né inviato. Le istantanee vengono create in
locale e scaricate solo su richiesta. Modello e WASM vengono messi in cache dal
service worker dopo il primo uso; la shell funziona offline, l’inferenza offline
è disponibile dopo il primo caricamento del modello.

## Sviluppo e test

```bash
python3 -m http.server 8080
# http://localhost:8080/projects/vision-lab/

node --test projects/vision-lab/tests/*.test.mjs
node --check projects/vision-lab/js/app.js
node tools/quality/generate-vision-icons.mjs
```

E2E (Playwright, Chromium desktop + iPhone emulato, volto reale in camera finta):

```bash
cd tools/quality
npm ci
npx playwright install --with-deps chromium
npm test
```

`make-face-camera.mjs` usa Chromium per convertire `assets/cv_gandolfi.jpeg` in
un video Y4M locale (`fixtures/face-camera.y4m`), usato da
`--use-file-for-fake-video-capture`. Il test verifica camera, caricamento del
modello, volto tracciato, mesh disegnata, punteggi Smile Lab, download
istantanea, lingua, persistenza, redirect, layout mobile e shell offline.

## MediaPipe

- `@mediapipe/tasks-vision@0.10.18`, Apache-2.0.
- `FaceLandmarker` con 478 landmark, blendshape e matrice di trasformazione.
- WASM SIMD + fallback no-SIMD, modello `face_landmarker.task` locale.
- Licenza e provenienza in `js/vendor/mediapipe/LICENSE` e `NOTICE.md`.

## Deploy

Pagina statica su GitHub Pages. Se cambiano asset della shell, incrementare
`CACHE` in `sw.js`. Il service worker root del portfolio preserva le cache
`pf-vision-lab-*`. Il modello (≈4 MB) e i WASM (≈18 MB) sono serviti localmente:
non vengono precaricati nell’installazione, ma cachati al primo uso.

## Nota

Face Lab (`projects/face-lab/`) resta l’app dedicata alle distorsioni creative
con Three.js. Vision Lab è il laboratorio face/smile, più rigoroso e testato.
