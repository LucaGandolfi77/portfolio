# 🚀 Neon Pinball — Space Cadet

Pinball modernizzato per GitHub Pages: **4 tavoli**, fisica già collaudata, UI in **liquid glass** e PWA offline ottimizzata per mobile. Nessun build, nessun CDN.

## Quickstart

```bash
python3 -m http.server 8000
# http://localhost:8000/games/pinball/index.html
```

## Tavoli e meccaniche

| Tavolo | Tema | Bonus |
|---|---|---|
| Neon Space Cadet | Spazio | SKILL SHOT, warp portals, NEON jackpot |
| Dragon Forge | Drago | Rune ritual, fireball, potion madness |
| Sakura Garden | Giardino | Full bloom, koi pond, moonlit |
| Neon Arcade | Arcade | Pac-mode, ghost bust, mega pellet |

Meccaniche preservate: many-ball, portali, spinner, bank bersagli, combo, moltiplicatore fino a ×10, ball save e modalità **AUTO** in cui l'IA gioca senza perdere.

## Novità

- **UI liquid glass**: cabinet, HUD, start/gameover/pausa e modali con rifrazione SVG solo Chromium.
- **Profilo versionato**: record per tavolo, classifica locale top-5, partite, statistiche e obiettivi.
- **Sfida del giorno**: seed deterministica dalla data, punteggio target e storico delle 10 sfide.
- **EN/IT**, tema chiaro/scuro, reduced motion, qualità grafica (DPR cap 1.25/2).
- **PWA** con icone, manifest e service worker versionato `pf-pinball-shell-v1`.

## Controlli

- **Plunger**: tieni premuto per caricare, rilascia per lanciare.
- **Flipper**: `←`/`Z` e `→`/`M` oppure le zone touch laterali.
- **P** o tap su PAUSA: pausa.
- **AUTO**: l'IA gioca al tuo posto senza perdere.

## Architettura

```
games/pinball/
├── index.html · css/app.css · manifest · icon.svg · icons/ · sw.js
├── js/
│   ├── config.js        tavoli, costanti fisica, EN/IT, obiettivi
│   ├── i18n.js · storage.js · glass.js · ui.js · main.js
│   └── engine/
│       ├── core.js       fisica, tavoli, EVENTI, rendering e input (portato dal monolite)
│       ├── physics.js    helper geometrici puri
│       ├── tables.js     catalogo tavoli
│       └── scoring.js    moltiplicatore, formattazione, record, seed sfida
├── README.md · test/logic-test.mjs
```

Il gameplay originale è stato spostato dal monolite inline a `js/engine/core.js` senza alterare la fisica; le funzioni pure sono nei moduli `engine/`.

## Prestazioni mobile

- Sfondo del tavolo ricostruito solo al resize, DPR limitato a 2 (1.25 in qualità bassa).
- Input touch con pointer events e feedback aptico opzionale.
- Pausa automatica quando la pagina è nascosta e percorsi relativi per GitHub Pages.

## Test

```bash
node games/pinball/test/logic-test.mjs
```

Copre tavoli, scoring, seed deterministiche, profilo, i18n, struttura e PWA.
