# 🎬 Streaming

Browser per film liberi e archivi pubblici di Internet Archive, con interfaccia **liquid glass** a due layer. Solo contenuti pubblici: nessun upload, nessuna registrazione.

## Cosa c'è di nuovo
- **Collezioni curate**: Prelinger, Feature Films, Cartoons, NASA, documentari, cinegiornali, concerti, scienza, film muti, Italia.
- **Filtri**: pubblico dominio (`licenseurl:*publicdomain*`), anno da/a, ordinamento per settimana/mese/sempre/data/titolo, paginazione "carica altri", cache risultati 10 minuti.
- **Player evoluto**: Media Session (controlli da notifica/tastiera), Picture-in-Picture, fullscreen, cronologia con ripresa dalla posizione salvata, coda di riproduzione con next/prev, preferiti e condivisione link.
- **URL diretti**: mp4/webm e YouTube (iframe privacy-friendly), deep link `?q=…&id=…`.
- **Liquid glass**: layer CSS universale (tinta, blur ridotto, saturazione, inset highlight, sheen radiale) + rifrazione SVG `feDisplacementMap` **solo Chromium** con mappa generata da canvas e feature detection; graceful fallback sugli altri browser.
- **Grafica**: hero con aurora animata, card glass, skeleton shimmer, dark/light, mobile-first, reduced-motion, focus visibile.
- **EN/IT** sincronizzato con il project shell, PWA con icone e service worker versionato.

## Architettura

```
streaming/
├── index.html · css/app.css · manifest · icon.svg · icons/ · sw.js
├── js/
│   ├── config.js     collezioni, sort, stringhe EN/IT
│   ├── i18n.js · storage.js
│   ├── api.js        advancedsearch/metadata puri con fetch iniettabile (testato)
│   ├── player.js     video/YouTube, Media Session, PiP, coda
│   ├── glass.js      displacement map + Chromium detection
│   ├── ui.js · main.js
└── tests/logic-test.mjs
```

## Test

```bash
node projects/streaming/tests/logic-test.mjs
```

15 test su query builder, URL canonicali, selezione file, storage e struttura.

## Fonti
- [Internet Archive Advanced Search API](https://archive.org/advancedsearch.php) e [about search](https://archive.org/help/aboutsearch.htm)
- [Internet Archive search fields/sort](https://archive.org/services/search/v1)
- [CSS-Tricks — Getting Clarity on Apple's Liquid Glass](https://css-tricks.com/getting-clarity-on-apples-liquid-glass/)
- [Liquid Glass code in CSS and SVG](https://liquidglassdesign.com/blog/liquid-glass-css-svg)

## Registro catalogo
`assets/js/projects-data.js` — id `streaming`, badge "Video / Streams", icona 📺.
