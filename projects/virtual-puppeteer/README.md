# 🎭 Virtual Puppeteer

Trasforma le mani in marionette parlanti. La webcam traccia 21 landmark con MediaPipe, il pollice e l'indice diventano la bocca del puppet, e gesti semplici controllano lo spettacolo. Tutto gira nel browser, con un palcoscenico a strati in stile teatrale e un dock in liquid glass.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/virtual-puppeteer/>

## Come si usa

| Gesto | Azione |
| --- | --- |
| 🤏 Pinch (pollice+indice vicini) | Il puppet parla (suono o voce sintetica) |
| ✌️ Peace | Cambia personaggio |
| 👋 Wave | Scintille e saluto |
| ✊ Fist | Pausa / riprendi |
| 🖐️ Mano aperta | Riposo |
| Tap sul palco | Modalità touch senza camera |

## Cosa c'è

- **12 personaggi**: Socky, Monster, Robo, Ghosty, Froggy, Uni + Alien, Cat, Pirate, Dragon, Disco, Yeti. Occhi, bocche, palette e voci diverse.
- **4 palcoscenici**: Royal Theater, Cosmic Stage, Moonlit Garden, Winter Stage, con sipario, prospettiva, riflettori animati, bokeh e ombre.
- **Props** (cappello, corona, occhiali, fiocco, aureola, festa) e **4 presets particella** (confetti, bolle, stelle, scintille).
- **Modalità regista**: fino a 4 puppet simultanei con personaggi diversi.
- **Parlato** con `SpeechSynthesis`, SFX WebAudio, export PNG e registrazione video WebM.
- **UI liquid glass** con dock per cast/scene/props/FX, status pill, safe-area iPhone e reduced-motion.

## Architettura

```text
projects/virtual-puppeteer/
├─ index.html / README.md
├─ css/app.css                 # liquid glass
├─ js/
│  ├─ config.js                # registry personaggi, scene, props, FX
│  ├─ rig.js                   # PURO: landmark → posa, gesture, spring
│  ├─ tracking.js              # HandLandmarker locale
│  ├─ scene.js / render.js     # scene graph a strati e disegno puppet
│  ├─ audio.js / speech.js / recorder.js / ui.js / main.js
├─ tests/core.test.mjs
└─ manifest.webmanifest / sw.js
```

`tracking.js` usa bundle e WASM di MediaPipe Tasks Vision vendorizzati in `vision-lab` e il modello `hand_landmarker.task` già presente in `projects/tracker/model` (nessuna duplicazione). Il canvas usa DPR limitato a 2 e il rig è interpolato con molle.

## Privacy e requisiti

Nessun frame lascia il dispositivo. Il riconoscimento vocale usa `SpeechSynthesis` del browser. Servono HTTPS o localhost per la camera e un browser con WebAssembly/WebGL2.

## Sviluppo e test

```bash
python3 -m http.server 8080
# http://localhost:8080/projects/virtual-puppeteer/

node --test projects/virtual-puppeteer/tests/*.test.mjs
node --check projects/virtual-puppeteer/js/main.js
```
