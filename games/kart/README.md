# 🏎️ Neon Kart

Racer arcade **veloce, offline e mobile-first** per GitHub Pages. Nessun build, nessun CDN, nessuna dipendenza: ES module, Canvas 2D e WebAudio.

## Quickstart

```bash
python3 -m http.server 8000
# http://localhost:8000/games/kart/index.html
```

Su GitHub Pages: `https://lucagandolfi77.github.io/portfolio/games/kart/index.html`. Tutti i path sono relativi, quindi la PWA funziona anche installata a schermo intero su iPhone.

## Contenuti

- **12 kart** con velocità, accelerazione, manovrabilità, grip e nitro diversi; si sbloccano con le stelle.
- **9 piste** tematiche: prato, deserto, notte neon, otto, città, spirale, canyon, tempesta, anello Apex.
- **4 modalità**:
  - *Gran Premio* — 3 giri contro 6 avversari AI;
  - *Prova a Tempo* — 3 giri con ghost del proprio miglior tempo;
  - *Knockout* — eliminazione dell'ultimo a ogni giro;
  - *Turbo Rush* — power-up e 2 giri ad alta velocità.
- **Power-up**: turbo, scudo, gelo, razzo, olio.
- **Guida arcade**: drift in curva per caricare il mini-turbo, nitro, freno, salti, urti tra kart e respawn.
- **Progressione**: stelle, record per pista/modalità, sblocchi e salvataggio versionato.

## Controlli

| Azione | Desktop | Mobile / gamepad |
|---|---|---|
| Sterzo | A/D o frecce | pulsanti ← → / stick |
| Drift | Spazio | 💨 / A |
| Nitro | Shift | 🔥 / RB |
| Freno | S / ↓ | 🛑 / B |
| Pausa | Esc | pulsante ⏸ |

## Prestazioni (iPhone)

- **Mask della pista precalcolata** una volta per traccia (`Uint8Array` 800×600): collisione O(1), niente `getImageData()` per frame.
- Track e kart **pre-renderizzati** su canvas offscreen; sprite disegnati con una sola `drawImage`.
- **Particle pool** di 140 elementi riutilizzati, niente `shadowBlur` nel loop.
- **Timestep fisso a 60 Hz** con accumulatore e dt clamped; massimo 6 step per frame per evitare spirali della morte.
- DPR limitato a 2 (1.25 in qualità bassa), camera con zoom dinamico, pausa automatica in background.
- HUD con minimappa pre-renderizzata e aggiornamento testo solo quando serve.

## Architettura

```
games/kart/
├── index.html · css/app.css · manifest · icon.svg · icons/ · sw.js (pf-kart-shell-v1)
├── js/
│   ├── config.js       12 kart, 9 piste, 4 modalità, power-up, EN/IT
│   ├── i18n.js · storage.js · audio.js · glass.js
│   ├── core/
│   │   ├── track.js        geometria, mask, checkpoint, proiezione
│   │   ├── physics.js      fixed-step, drift, nitro, AI, collisioni, classifica
│   │   ├── race.js         giri, power-up, knockout, ghost, eventi
│   │   └── progression.js  stelle, record, sblocchi, validazione save
│   ├── input.js · render.js · ui.js · main.js
└── test/logic-test.mjs
```

I moduli in `js/core/` sono puri e testabili in Node.

## Test

```bash
node games/kart/test/logic-test.mjs
```

Copre geometria pista, mask, fisica e AI, giri, classifica, power-up, progressi, struttura e PWA.

## Note

La vecchia versione era un monolite di 662 righe con rendering rallentato da `getImageData` per frame, un solo kart, 3 piste e nessun avversario. Il redirect `legacy-kart.html` resta per compatibilità.
