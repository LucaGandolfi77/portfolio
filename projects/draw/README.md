# ✦ Pixel Studio — Photo & Pixel Editor

Editor offline di immagini e pixel art, evoluto da `projects/draw/index.html` in un vero editor in stile app fotografica.

## Funzionalità

### Interfaccia
- Top bar con nome documento, undo/redo, nuove, import, fotocamera, progetto, condivisione, export
- Tool rail verticale con 10 strumenti: sposta, pennello, gomma, riempimento, linea, rettangolo, ellisse, testo, adesivo, contagocce
- Inspector di destra contestuale: colore, spessore, opacità, testo, adesivi, blend mode
- Dock inferiore con tab **Livelli / Cronologia / Adesivi / Regolazioni / Effetti**
- HUD zoom, minimappa, zoom fit/in/out, responsive (inspector come bottom sheet su mobile)

### Livelli
- Nuovo livello, duplica, elimina, riordina, visibilità, blocco, opacità, 5 blend mode
- Unisci giù, appiattisci, miniature
- Compositing via Canvas2D (`globalAlpha` + `globalCompositeOperation`)

### Strumenti e contenuti
- Pennello/gomma a spessore variabile, linee, forme piene o outline, flood fill, contagocce
- Testo con font size e contorno, 16 adesivi emoji, spostamento livello
- Import immagine da file o fotocamera come livello

### Regolazioni ed effetti
- Brightness, contrast, saturation, hue
- Grayscale, sepia, invert, blur, sharpen, pixelate
- Preset: vintage, neon, mono, dreamy, noir

### Progetti ed export
- Progetto multi-layer JSON (save/open), autosave in localStorage
- Export PNG/JPEG/WebP con qualità e scala (1×/2×/4×), Web Share API
- Undo/redo con cronologia etichettata e jump-to-state, scorciatoie da tastiera

## Struttura
```
draw/
├── index.html · styles.css · manifest.webmanifest · sw.js · icon.svg · icons/
├── js/{config,state,filters,tools,ui,main}.js
└── test/logic-test.mjs
```

Zero librerie esterne, font di sistema, EN/IT, PWA installabile.

## Test
```bash
node projects/draw/test/logic-test.mjs
```
