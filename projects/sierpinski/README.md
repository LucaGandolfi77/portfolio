# 📐 Fractal Observatory

Esplora 11 frattali con parametri creativi, rendering neon e export. Tutto offline, in EN/IT, senza librerie esterne.

## Cosa c'è di nuovo
- **11 forme**: triangolo di Sierpinski, tappeto, croce di Vicsek, polvere di Cantor, T-Square, fiocco di Koch, H-Tree, albero frattale, curva del drago, chaos game, arrowhead.
- **Parametri creativi**: skew X/Y, jitter seedato, rotazione per-iterazione (twist), angolo picco, asimmetria, varianza dei pesi nel chaos, no-repeat e orbit trap.
- **Stile**: 6 palette (incl. neon), glow, blend mode (add/screen/normal), simmetria radiale 1–12, sfondo stelle/griglia, rivelazione animata, auto-spin.
- **Interazioni mobile**: bottom sheet con 4 tab (Forme / Parametri / Stile / Azioni), slider grandi, pinch/zoom/twist, doppio tap reset, safe-area, target ≥44px.
- **Export**: PNG 2× e SVG vettoriale, copia link condivisibile (`?f=…&s=…&p=…`), preset e preferiti salvati.
- **Grafica impattante**: canvas DPR-aware, shadow blur per profondità, additive blending, progressione colore per livello di ricorsione, particelle chaos, sfondo stellare animato.

## Architettura

```
sierpinski/
├── index.html · css/app.css · manifest · icon.svg · icons/ · sw.js
├── js/
│   ├── config.js     forme, parametri, palette, preset, EN/IT
│   ├── i18n.js · storage.js · rng.js
│   ├── fractal.js    generatori puri con trasformazioni (testato)
│   ├── camera.js     pan/zoom/rotate + smooth reset
│   ├── render.js     canvas con glow/blend/simmetria
│   ├── ui.js · main.js
└── tests/logic-test.mjs
```

Nessun CDN: i font di sistema sostituiscono Google Fonts, service worker versionato con precache completo.

## Test

```bash
node projects/sierpinski/tests/logic-test.mjs
```

18 test su geometria, caos, storage e struttura.

## Registro catalogo
`assets/js/projects-data.js` — id `sierpinski-explorer`, badge "Math", icona 📐.
