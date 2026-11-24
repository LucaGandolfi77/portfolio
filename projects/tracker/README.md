# 📷 Camera Tracker

Fotocamera creativa fullscreen che gira interamente nel browser: 22 filtri live (pixel, AI e voce), sticker AR, scansione QR, registrazione video e time-lapse, con interfaccia **liquid glass** ottimizzata per iPhone.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/tracker/>

## Cosa fa

### Filtri (22)

- **Pixel/2D (13)**: normale, B/N, contrasto, contorni, seppia, inverti, sfocatura, pixelate, vignetta, schizzo, cartoon, termico, color splash. Molti hanno uno slider di intensità.
- **AI (7)**: oggetti, volto, mani, AI tracker (target lock), segmentazione, **sticker AR** e **scheda posa**. I filtri AI usano MediaPipe Tasks Vision.
- **Voce (1)**: sottotitoli live con comandi vocali (`scatta`, `registra`, `ferma`, `griglia`).
- **QR/barcode (1)**: `BarcodeDetector` nativo con box live e copia del contenuto.

### Strumenti

Switch camera, torcia, self-timer, zoom pinch/slider, risoluzione, mirror, suoni, FPS di rilevamento, diagnostica, griglia di composizione, livello, istogramma, registrazione video e time-lapse, sticker AR selezionabili, galleria IndexedDB (40 foto) con condivisione e download, PWA installabile con aggiornamenti, IT/EN.

## Architettura

```text
projects/tracker/
├─ index.html              # shell
├─ README.md
├─ css/liquid.css          # design system liquid glass (styles.css = legacy)
├─ js/
│  ├─ config.js            # registry filtri, modelli, impostazioni
│  ├─ mediapipe.js         # Face/Hand/Pose/Object detector locali
│  ├─ ar.js                # sticker ancorati ai landmark + posa
│  ├─ barcode.js           # BarcodeDetector
│  ├─ recorder.js          # video + time-lapse
│  ├─ photo-tools.js       # griglia, livello, istogramma, editing
│  ├─ voice.js             # sottotitoli + comandi vocali
│  ├─ camera.js / loader.js / ai.js / filters.js / gallery.js / ui.js / i18n.js / main.js
├─ tests/tracker.test.mjs
└─ model/                  # hand, pose e object detector (.task / .tflite)
```

`main.js` ha un solo loop `requestAnimationFrame`: renderizza il frame, esegue il rilevamento throttled e disegna gli overlay. I moduli `config.js`, `ar.js`, `voice.js`, `i18n.js` sono testati in Node.

## Modelli e privacy

Il runtime predefinito è **MediaPipe Tasks Vision**: bundle e WASM sono vendorizzati in `vision-lab`, i modelli aggiuntivi (mani ~7 MB, posa lite ~5,6 MB, object detector ~7 MB) sono in `model/`. Face Landmarker è riutilizzato da `vision-lab`. Tutto gira sul dispositivo: video, foto e risultati non vengono caricati. I vecchi TF.js/COCO-SSD/BlazeFace/BodyPix restano selezionabili come fallback nelle impostazioni. Il riconoscimento vocale può usare il servizio del browser e richiedere rete.

Il primo avvio dei modelli richiede il caricamento dei file locali; poi vengono messi in cache dal service worker.

## Comandi

| Azione | Controllo |
| --- | --- |
| Scatta | shutter o `scatta` |
| Registra / time-lapse | pulsante 🎥 nelle impostazioni laterali |
| Cambia camera | 🔄 o doppio tap |
| Zoom | pinch o slider |
| Sticker AR | tab Sticker AR + tray nelle impostazioni |
| QR | tab QR / Codici |
| Griglia / livello / istogramma | pulsanti laterali |
| Sottotitoli e comandi | tab Sottotitoli o 🎤 |

## Sviluppo e test

```bash
python3 -m http.server 8080
# http://localhost:8080/projects/tracker/

node --test projects/tracker/tests/*.test.mjs
node --check projects/tracker/js/main.js
```

Microfono e camera richiedono HTTPS o localhost; servono browser con WebGL/WebAssembly e `BarcodeDetector` per la scansione codici.
