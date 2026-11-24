# ⚔️ Orlog — Viking Dice Duel

Un duello di dadi vichingo con 11 favori degli dèi, reliquie, talenti, 10 boss e 6 modalità. Tutto offline, PWA installabile su GitHub Pages, con interfaccia liquid glass nordica.

**Live:** <https://lucagandolfi77.github.io/portfolio/games/orlog/>

## Come si gioca

1. **Roll**: lancia 6 dadi fino a 3 volte; tocca i dadi per bloccarli.
2. **Favor**: spende i token (✨/🪙) per invocare un favore, oppure salta.
3. **Resolve**: ⚔️ melee e 🏹 ranged infliggono danni, 🛡️ e 🔰 bloccano, 🪙 ruba token, ✨ genera token. Chi porta l'avversario a 0 HP vince.

## Modalità

| Modalità | Descrizione |
| --- | --- |
| ⚔️ Classic | Duello contro un avversario casuale |
| 🗺️ Campaign | 10 boss con lore, stelle e sblocchi |
| 🏆 Tournament | Tre avversari consecutivi |
| ♾️ Endless | Onde infinite con difficoltà crescente |
| 📅 Daily | Seed del giorno, stessa partita per tutti e streak |
| 🌀 Chaos | Mutatori folli: dado extra, danni doppi, favori gratis, specchio |

## Feature

- **11 favori**: i 5 classici (Thor, Idun, Odin, Tyr, Freya) più Loki, Baldr, Hel, Frey e varianti.
- **6 reliquie** passive e **6 talenti** permanenti con sinergie.
- **Combo** tra facce, AI adattiva, lore dei boss e dialoghi.
- **Audio WebAudio**, haptics, animazioni dadi/urto e result card PNG condivisibile.
- **PWA** con precache di shell, moduli e icone: nessun server richiesto.

## Architettura

```text
games/orlog/
├─ index.html / README.md
├─ css/app.css                 # liquid glass nordico
├─ js/
│  ├─ config.js                # registry dadi, favori, reliquie, boss, modalità
│  ├─ engine.js                # PURO: lanci, favore, risoluzione, AI, seed
│  ├─ modes.js / progression.js # PURO: setup modalità, stelle, talenti
│  ├─ share.js / audio.js / ui.js / main.js
├─ tests/engine.test.mjs
└─ manifest.webmanifest / icon.svg / sw.js
```

La logica usa PRNG deterministico (`mulberry32`) per Daily e riproducibilità; `localStorage` (chiave `orlog-v2`) conserva impostazioni, progresso, talenti e reliquie.

## GitHub Pages e test

```bash
python3 -m http.server 8080
# http://localhost:8080/games/orlog/

node --test games/orlog/tests/*.test.mjs
node --check games/orlog/js/main.js
```
