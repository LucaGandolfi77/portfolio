# ✨ Mystic Quest — Sky Herd Rescue

Avventura **mobile-first** e **offline** per GitHub Pages: guida Luma attraverso cinque regni, raccogli 15 stelle reali e libera gli spiriti con la lanterna. Build-free, ES module, Canvas 2D e WebAudio.

## Quickstart

```bash
python3 -m http.server 8000
# http://localhost:8000/games/mystic-quest/index.html
```

Su GitHub Pages: `https://lucagandolfi77.github.io/portfolio/games/mystic-quest/index.html`.

## Come si gioca

1. **Tocca il mondo** per muovere Luma (oppure WASD/frecce/gamepad).
2. Raccogli le **3 stelle** sparse in ogni regno: appaiono come bagliori pulsanti.
3. Quando hai tutte le stelle compare lo **spirito**: avvicinati e **tieni premuta la lanterna** (pulsante in basso a destra o spazio) finché la barra non si riempie.
4. Dopo aver liberato lo spirito, raggiungi il **portale** in alto per passare al regno successivo.
5. Libera tutti i 5 spiriti per completare l'avventura.

I progressi vengono salvati automaticamente dopo ogni stella e ogni spirito; dal menu puoi continuare, scegliere un regno sbloccato, consultare il diario e ricominciare.

## Funzionalità

- **5 regni** con palette, sfondo, vegetazione e spiriti propri.
- **15 stelle** con posizioni deterministiche e raccolta per prossimità (niente più "tocca il centro 3 volte").
- **Meccanica della lanterna**: caricamento con indicatore, feedback audio e vibrazione.
- **Dialoghi con typewriter**, capitoli, testo dei regni e finale.
- **Diario** con obiettivi (stelle, spiriti, regni) e memoria degli eventi.
- **Selezione regni** sbloccati, salvataggio versionato e validazione dati corrotti.
- **Liquid glass**: HUD, dialoghi, menu e modali con rifrazione SVG solo Chromium.
- **EN/IT**, tema chiaro/scuro, audio procedurale WebAudio, vibrazione, reduced motion, qualità grafica.
- **PWA offline** con icone e service worker versionato `pf-mystic-shell-v1`.

## Prestazioni mobile

- Sfondi dei regni **pre-renderizzati** una sola volta su canvas offscreen.
- Particle pool di 100 elementi riutilizzati.
- DPR limitato a 2 (1.25 in qualità bassa) e timestep fisso a 60 Hz con massimo 5 step/frame.
- Pausa automatica quando la pagina è nascosta, zero CDN e percorsi relativi.

## Architettura

```
games/mystic-quest/
├── index.html · css/app.css · manifest · icon.svg · icons/ · sw.js
├── js/
│   ├── config.js        regni, dialoghi, obiettivi, EN/IT
│   ├── i18n.js · storage.js · audio.js · glass.js
│   ├── core/
│   │   ├── world.js        layout deterministico, prossimità, clamp
│   │   ├── progression.js  stelle, spiriti, sblocchi, salvataggio
│   │   └── story.js        capitoli, dialoghi, typewriter
│   ├── input.js · render.js · ui.js · main.js
└── test/logic-test.mjs
```

I moduli in `js/core/` sono puri e testabili in Node.

## Test

```bash
node games/mystic-quest/test/logic-test.mjs
```

Copre generazione mondo, raccolta stelle, salvataggio spiriti, sblocchi, dialoghi, struttura PWA e assenza di CDN.
