# 🎨 RAVE — Real-Time Artistic Vision Engine

Trasforma la webcam in un dipinto in tempo reale. 11 stili artistici girano come shader WebGL direttamente nel browser, senza server e senza inviare immagini da nessuna parte.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/rave/>

## Caratteristiche

- **11 filtri shader**: Originale, Van Gogh, Picasso, Monet, Hokusai, Warhol, Klimt, Matisse, Matita, Cyberpunk e Acquerello.
- **Transizioni fluide** tra stili (crossfade via framebuffer, ~420 ms) e intensità regolabile 0–100%.
- **Prima/Dopo**: slider per confrontare il video originale con lo stile applicato.
- **Scatto e galleria**: cattura JPEG, miniature salvate in `localStorage` (max 12) con download ed eliminazione.
- **Registrazione video** del canvas filtrato (`MediaRecorder`, WebM/MP4 dove supportato).
- **Comandi vocali** in italiano e inglese: stili, "più/meno", scatto, registrazione, camera, schermo intero.
- **Camera frontale/posteriore** con specchio automatico e double-tap per cambiare.
- **PWA installabile**, interfaccia bilingue IT/EN, mobile-first e `prefers-reduced-motion`.

## Comandi

| Azione | Mouse/touch | Voce (IT / EN) |
| --- | --- | --- |
| Cambia stile | Card nella rail laterale | "Van Gogh", "warhol", "acquerello"… |
| Intensità | Slider | "più" / "meno", "more" / "less" |
| Scatto | Pulsante shutter o `Spazio` | "scatta", "capture" |
| Registra | Pulsante ⏺ | "registra", "record" |
| Prima/Dopo | Pulsante ◐ + slider | — |
| Cambia camera | Pulsante 🔄 o double-tap | "frontale"/"posteriore", "front"/"back" |
| Schermo intero | Pulsante ⛶ | "schermo intero", "fullscreen" |
| Galleria | Pulsante ▦ o tasto `G` | — |
| Stile successivo/precedente | `→` / `←` | — |

## Architettura

```text
projects/rave/
├─ index.html              # shell
├─ README.md               # questo file
├─ app.css                 # design system creative studio (style.css legacy)
├─ shaders.js              # ES module: sorgenti GLSL + shader mix/composite
├─ js/
│  ├─ styles.js            # PURO: registry stili e metadati
│  ├─ voice.js             # PURO: parser comandi IT/EN
│  ├─ settings.js          # PURO: impostazioni persistenti
│  ├─ shader-engine.js     # WebGL, FBO, crossfade, before/after
│  ├─ camera.js            # getUserMedia front/back
│  ├─ recorder.js          # MediaRecorder
│  ├─ gallery.js           # snapshot localStorage
│  ├─ i18n.js, main.js
├─ tests/rave.test.mjs
└─ manifest.webmanifest / icon.svg / sw.js
```

Il motore WebGL usa un programma per stile, due framebuffer per il crossfade e un passaggio finale di composite per il divisore prima/dopo. `styles.js`, `voice.js` e `settings.js` non dipendono dal DOM e sono testati in Node.

## Dati e privacy

Tutto gira sul dispositivo: video, snapshot e impostazioni restano nel browser. Chiavi `localStorage`: `rave.settings_v1`, `rave.gallery_v1`, `rave.lang`. Nessun upload o servizio di inferenza remoto. Il microfono per i comandi vocali usa `SpeechRecognition` del browser (può richiedere permesso e, su alcuni browser, rete).

Il microfono richiede **HTTPS** o localhost; servono browser con WebGL e `getUserMedia`.

## Sviluppo e test

```bash
python3 -m http.server 8080
# http://localhost:8080/projects/rave/

node --test projects/rave/tests/*.test.mjs
node --check projects/rave/js/main.js
```

I test coprono registry degli stili, presenza degli shader, parser vocale IT/EN e validazione delle impostazioni.
