# 🧩 Scale Puzzle

Rompicapo neon: ricostruisci un percorso luminoso toccando le celle nell'ordine giusto, allena la memoria e scala 200 livelli procedurali. Funziona offline, in EN/IT, senza server.

## Come si gioca
All'inizio compare una preview animata del percorso; poi devi riprodurlo. In **Classica** e **Velocità** il percorso resta visibile, in **Memoria** e **Giornaliera** scompare. Ogni tap corretto costruisce combo e punti; gli errori costano una vita e azzerano il combo. Undo e suggerimento hanno un costo in punti.

## Modalità e sistemi
- **5 modalità**: Classica, Memoria, Velocità (60 s), Zen (senza timer), Giornaliera (seed del giorno).
- **3 difficoltà**: cambiano durata della preview, penalità e costo hint.
- **Pattern procedurali** seedati: diagonali, spirali, zigzag, croci, serpenti e casuali, griglie 3×3 → 9×9.
- **Scoring**: combo, bonus tempo, penalità errori/hint, stelle 1–3 per livello, XP e record per modalità.
- **Progressione**: 40 livelli selezionabili + fino a 200 scalabili, sblocco progressivo, statistiche e traguardi persistiti.
- **Grafica**: board canvas con celle neon, preview animata con trail, particelle, ripple, shake e flash; HUD glass, picker modalità/difficità, griglia livelli e stats.
- **Accessibilità**: focus visibile, reduced-motion, touch target, scorciatoie (Ctrl+Z annulla, H hint, Esc chiude).
- **PWA**: manifest con icone reali, service worker versionato e dati tutti locali.

## Architettura

```
puzzle-scale/
├── index.html · css/app.css · manifest · icon.svg · icons/ · sw.js
├── js/
│   ├── config.js     modalità, difficoltà, palette, EN/IT
│   ├── i18n.js · storage.js · rng.js
│   ├── generator.js  pattern procedurali (puro)
│   ├── engine.js     vite, combo, scoring, stelle (puro)
│   ├── audio.js · fx.js · render.js · ui.js · main.js
└── tests/logic-test.mjs
```

I moduli `generator` ed `engine` sono puri e testati in Node. Nessuna dipendenza esterna.

## Test

```bash
node projects/puzzle-scale/tests/logic-test.mjs
```

21 test su generatore, motore, storage e struttura.

## Registro catalogo
`assets/js/catalog-data.js` — id `puzzle-scale`, badge "Puzzle", icona 🧩.
