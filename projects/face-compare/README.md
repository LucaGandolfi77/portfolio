# 🎭 Face Compare

Confronto di volti **on-device**: rilevamento con MediaPipe FaceLandmarker, allineamento canonico e similarità coseno tra descrittori. Nessuna immagine o dato biometrico viene caricato su un server.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/face-compare/index.html>

## Cosa fa

- **Due sorgenti**: immagine di riferimento (drag & drop, file, incolla, webcam) e volto da confrontare (webcam live o immagine).
- **Pipeline**: 478 landmark → quality gate → trasformazione di similarità ancorata su occhi/naso → crop allineato 256×256 → descrittore geometrico (Procrustes) + griglia di luminanza standardizzata → similarità coseno pesata.
- **Gauge animato** con banda di confidenza (bassa / media / alta), chip di qualità, posa, numero volti e FPS.
- **Overlay landmark** live su video/immagini, sparkline dell'andamento, storico con timestamp e profili salvati in `localStorage`.
- **Export PNG** composito con i due volti allineati e il punteggio.
- **Bilingue IT/EN** con toggle, persistenza e sincronizzazione con la lingua del portfolio.
- Mobile-first, PWA installabile, `prefers-reduced-motion`.

## Architettura

```text
projects/face-compare/
├─ index.html              # shell semantico + fix audit
├─ css/app.css             # design system dark glass
├─ js/
│  ├─ metrics.js           # PURO: coseno, allineamento, descrittori, qualità, soglie
│  ├─ face-engine.js       # MediaPipe wrapper + overlay
│  ├─ i18n.js              # IT/EN
│  ├─ storage.js           # profili, storico, impostazioni
│  └─ app.js               # state machine, camera, UI, export
├─ model + js/vendor/      # riutilizzati da projects/vision-lab (nessuna duplicazione)
├─ sw.js                   # cache shell + asset modello/WASM al primo uso
├─ icon.svg, manifest.webmanifest
└─ tests/metrics.test.mjs
```

`metrics.js` non dipende dal DOM: è testato in Node con frame sintetici. Il modulo `face-engine.js` espone un confine `Embedder` concettuale (`geometry`, `appearance`, `similarity`) sostituibile con un vero modello di embedding (per es. ArcFace/ONNX) senza modificare UI o test.

### Soglie di punteggio

Il coseno grezzo viene esteso da `[0.45, 0.95]` a `[0, 1]` e combinato con peso predefinito 0.55 (geometria) / 0.45 (aspetto). Bande: **bassa** < 55, **media** 55–74, **alta** ≥ 75. Il peso è regolabile dall'UI.

> Il punteggio è **euristico**, tarato su descrittori di landmark e aspetto: non è un riconoscimento biometrico certificato e non va usato per decisioni di identità. Per un confronto affidabile usa luce frontale e posa simile; il quality gate segnala immagini sfocate, scure, sovraesposte o con più volti.

## Privacy

- MediaPipe Tasks Vision, modello `face_landmarker.task` e WASM sono serviti **localmente** e riutilizzati da `projects/vision-lab`: nessuna CDN o inferenza remota.
- Il flusso video non viene salvato né trasmesso; le istantanee vengono generate solo su richiesta.
- Chiavi `localStorage`: `pf.face-compare.settings`, `pf.face-compare.profiles`, `pf.face-compare.history`, `pf.face-compare.lang`.

## Sviluppo e test

```bash
python3 -m http.server 8080
# http://localhost:8080/projects/face-compare/

node --test projects/face-compare/tests/*.test.mjs
node --check projects/face-compare/js/app.js
```

Il test verifica invarianza del descrittore (traslazione/scala/guadagno di luce), coseno, soglie, quality gate, stime di nitidezza/luminosità e pose.

## Deploy

Pagina statica su GitHub Pages. Se cambiano gli asset della shell, incrementare `CACHE` in `sw.js`. Il service worker root del portfolio preserva le cache `pf-face-compare-*`; il modello (~3,6 MB) e i WASM (~18 MB) sono cachati al primo utilizzo, non all'installazione.
