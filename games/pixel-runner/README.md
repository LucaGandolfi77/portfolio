# ▸ Pixel Runner

Arcade runner offline per GitHub Pages e mobile: **5 stage**, **4 boss**, **4 modalità**, **6 power-up**, sfida giornaliera e interfaccia in **liquid glass**. Build-free, ES module e PWA.

## Quickstart

```bash
python3 -m http.server 8000
# http://localhost:8000/games/pixel-runner/index.html
```

## Modalità

- **Classic** — 5 stage, ostacoli e un boss alla fine di ogni stage.
- **Speedrun** — velocità aumentata, combo e near-miss.
- **Survival** — sopravvivi il più a lungo possibile.
- **Boss Rush** — tutti i boss in sequenza, senza ostacoli.

## Power-up

| Icona | Effetto |
|---|---|
| 🛡️ | Scudo assorbe gli urti |
| 🪙 | Punteggio bonus |
| 🧲 | Attrae i collectible |
| ✨ | Punteggio ×2 per 7 secondi |
| 🐢 | Slow motion per 4 secondi |
| 🔧 | Ripara e potenzia lo scudo |

I **near-miss** (salti ravvicinati agli ostacoli) aumentano la combo e il punteggio.

## Controlli

- **Tap / Spazio / ↑** — salta (o attacca quando c'è un boss).
- **D / Shift** — dash con cooldown.
- **F** — attacco.
- Pulsanti in alto: statistiche, selezione stage sbloccati, sfida del giorno, impostazioni, guida, lingua e tema.

## Funzionalità

- Profilo versionato con best per modalità/difficoltà, classifica locale top-5, partite, boss sconfitti e obiettivi.
- **Sfida giornaliera** con seed deterministica e target variabile.
- **Selezione stage** sbloccati dai progressi.
- **liquid glass** su menu, HUD, risultati e modali, con rifrazione SVG solo Chromium.
- EN/IT, tema chiaro/scuro, suono, vibrazione, reduced motion e qualità grafica (DPR adattivo).
- PWA con icone e service worker versionato `pf-pixel-runner-shell-v1`.

## Architettura

```
games/pixel-runner/
├── index.html · styles.css (liquid glass) · manifest · icons/ · sw.js
├── js/
│   ├── config.js       stage, modalità, power-up, obiettivi, EN/IT
│   ├── game.js         fisica pura, boss, power-up e disegno Canvas
│   ├── i18n.js · storage.js · glass.js · ui.js · main.js
└── test/logic-test.mjs
```

`game.js` rimane puro e testabile in Node; il kit arcade condiviso gestisce menu, HUD e loop.

## Prestazioni mobile

Canvas a schermo intero con DPR limitato a 2 (ridotto in qualità bassa), particle pool del kit, pausa in background, safe-area e percorsi relativi per GitHub Pages.

## Test

```bash
node games/pixel-runner/test/logic-test.mjs
```

Copre gameplay, power-up, boss, profili, struttura e PWA.
