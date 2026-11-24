# 🎵 Reverse Lyrics Finder

Incolla una frase di una canzone, trova il brano, ascolta l'anteprima di 30 secondi e leggi il testo completo con la tua frase evidenziata.

## Funzionalità

- **Ricerca smart**: pulizia della query, tokenizzazione, scoring su titolo/artista/album, dedupe, ordinamento per confidenza con badge percentuale. Abort delle richieste precedenti, skeleton, stati vuoto/errore/offline.
- **Cache offline**: risultati 10 minuti, testi 7 giorni in localStorage versionato (`pf.lyrics.cache`), fallback when offline.
- **Player anteprime**: play/pausa, seek, volume, tempo, Media Session, stop automatico a nuova ricerca.
- **Testi**: modale a foglio con focus trap, `Esc`, highlight della frase (modalità esatta o token), copia e condivisione, fallback Genius/Google.
- **Stato utente**: ricerche recenti, preferiti, impostazioni (store iTunes, limite, frase esatta, tema).
- **EN/IT** sincronizzato con la barra del sito, PWA installabile, accessibilità (skip link, ARIA, focus visibile, reduced-motion).

## Architettura

```
lyrics-finder/
├── index.html · css/app.css · manifest.webmanifest · icon.svg · icons/ · sw.js
├── js/
│   ├── config.js     costanti, provider, stringhe EN/IT
│   ├── i18n.js       lingue e data-i18n
│   ├── storage.js    impostazioni, recenti, preferiti, cache TTL
│   ├── search.js     normalizzazione, scoring, dedupe, highlight (puro)
│   ├── api.js        iTunes + Lyrics.ovh con fetch iniettabile e AbortSignal
│   ├── audio.js      player con seek/volume
│   ├── ui.js         rendering, sheet, focus trap, toast
│   └── main.js       bootstrap e wiring
└── tests/logic-test.mjs
```

Zero librerie esterne, zero backend: solo le API pubbliche iTunes Search e Lyrics.ovh. Nessun dato inserito lascia il browser tranne queste ricerche.

## Test

```bash
node projects/lyrics-finder/tests/logic-test.mjs
```

22 test su API, ranking, highlight, cache, struttura e i18n.

## Registro portfolio
`assets/js/projects-data.js` — id `lyrics-search`, badge "Tool", icona 🎵.
