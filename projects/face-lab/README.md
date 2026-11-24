# FACE//LAB — Ridiculous Selfie Lenses

Specchio selfie in stile Snapchat: scegli una lente dal carosello, trascina gli sticker sul volto, scatta e salva tutto sul dispositivo. 68 landmark AI tracciano il viso in tempo reale; la modalità Tech mantiene la telemetria e la mesh 3D.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/face-lab/>

## Cosa fa

- **30 lenti** in 7 categorie, una attiva alla volta:
  - **Basic/Classics**: None, Giant eyes, Funhouse, Emoji swap, Fish-eye, Squash, Cartoon, Swirl, Chromatic, Pixelate, Neon.
  - **Animals**: 🐶 Doggo (orecchie, muso, lingua), 🐱 Kitty (orecchie, baffi), 🐰 Bunny, 🐸 Frog.
  - **Monsters**: 👽 Alien, 🧟 Zombie, 🤖 Robot, 💀 X-ray.
  - **Psychedelic**: 🪞 Kaleidoscope, 📺 Glitch TV, 🫠 Melting, 👥 Triple face.
  - **Reactive**: 🎉 coriandoli al sorriso, ✨ scintille all'ammiccamento, 🌈 arcobaleno con l'inclinazione, 🔥 fiamme a bocca aperta.
  - **Retro**: 📼 CRT/VHS, 🧾 Polaroid, 👾 8-bit.
- **15 sticker** posizionabili con il dito (offset salvati in `localStorage`).
- **UI Snapchat-like**: viewfinder full-bleed, carosello circolare con anello attivo, rail laterale, griglia di composizione, timer, mirror, flip camera, shutter.
- **Tech mode**: HUD con blink counter, smile/brow, mouth–nose, head pose, emozione e mesh Three.js con 68 punti luminosi.
- **📸 Snapshot** composito con nome lente e timestamp; **✏️ Sketch** con galleria locale (ultimi 12) e download PNG.
- Mobile-first, safe-area iPhone, `prefers-reduced-motion`, tutto on-device.

## Architettura

```text
projects/face-lab/
├─ index.html            # shell del viewfinder (importmap three + mp-vision)
├─ css/app.css           # design system
├─ js/
│  ├─ main.js            # camera, MediaPipe, loop, UI, snapshot/galleria
│  ├─ lenses.js          # REGISTRY lenti/sticker e metadati
│  ├─ effects.js         # warp pixel condiviso + overlay vettoriali
│  ├─ props.js           # sticker ancorati ai landmark e drag
│  ├─ reactions.js       # particelle reattive
│  ├─ metrics.js         # PURO: 68-map, EAR, pose, emozioni, box
│  └─ tech.js            # Three.js + HUD telemetria
├─ tests/*.test.mjs      # 12 test Node
└─ legacy-*              # wrapper storici
```

Aggiungere una lente: un entry in `LENSES` con `category`, `kind` (`warp`/`overlay`/`reaction`) e `params`. Carosello e test si generano dalla registry.

## Dati e privacy

| Chiave | Contenuto |
| --- | --- |
| `facelab_settings` | lente attiva, categoria, mirror, griglia, sticker e offset |
| `facelab_sketches` | ultimi 12 sketch (punti 68) |

Video e landmark non lasciano il dispositivo. Nota: modello MediaPipe (`face_landmarker.task`), WASM e Three.js sono caricati da CDN al primo avvio: serve connessione la prima volta.

## Sviluppo e test

```bash
python3 -m http.server 8080
# http://localhost:8080/projects/face-lab/

node --test projects/face-lab/tests/*.test.mjs
node --check projects/face-lab/js/main.js
```

I test coprono registry, mapping 68, EAR/blink, emozioni, pose, box/proiezione, offset e hit-test degli sticker, parametri delle lenti.
