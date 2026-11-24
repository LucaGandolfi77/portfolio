# ⌁ Morse Studio

Convertitore Morse moderno e offline: trascrivi testo in Morse e viceversa, ascolta la trasmissione, esporta WAV, consulta la tabella e impara il codice con allenamenti dedicati.

## Funzionalità

- **Conversione live** in entrambe le direzioni, con normalizzazione di `• − |`, word gap `/`, caratteri sconosciuti segnalati e decodifica automatica anche senza spazi (segmentazione con backtracking).
- **Player audio**: play/pausa/stop, WPM (5–40), frequenza (300–1200 Hz), volume, MediaSession, durata stimata e oscilloscopio canvas con timeline del segnale.
- **Export**: WAV 16-bit con fade in/out e opzioni configurabili, testo TXT, condivisione Web Share e copia con fallback.
- **Tabella Morse** filtrabile con ricerca; clic su un simbolo lo riproduce.
- **Allenamento**: flashcard, dettato (sequenza audio da trascrivere) e speed run da 60 secondi, con punteggi e record persistiti.
- **Cronologia** conversioni (40 voci), preferiti, impostazioni e ultimo documento, tutto in localStorage versionato (`pf.morse.save.v1`).
- **EN/IT** sincronizzato con il project shell, PWA installabile con icone e service worker versionato.

## Architettura

```
morse/
├── index.html · css/app.css · manifest.webmanifest · icon.svg · icons/ · sw.js
├── js/
│   ├── config.js     mappa Morse, prosign, costanti, stringhe EN/IT
│   ├── i18n.js       lingue e data-i18n
│   ├── storage.js    preferenze, cronologia, preferiti, record
│   ├── codec.js      encode/decode puro + normalizzazione e validazione
│   ├── wav.js        generatore WAV puro con fade
│   ├── audio.js      trasmettitore WebAudio con progress
│   ├── visualize.js  oscilloscopio e timeline
│   ├── train.js      primitive di allenamento pure
│   ├── ui.js         pannelli, tabella, training, dialog
│   └── main.js       bootstrap e wiring
└── tests/logic-test.mjs
```

I moduli `codec`, `wav` e `train` sono puri e testati in Node. Zero librerie esterne, zero font CDN.

## Test

```bash
node projects/morse/tests/logic-test.mjs
```

26 test su codec, round-trip, WAV, training, storage e struttura.

## Registro portfolio
`assets/js/projects-data.js` — id `morse-converter`, badge "Tool".
