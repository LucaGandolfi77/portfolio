# 🌸 Memory Garden

Un gioco di memoria creativo e completamente offline: 11 modalità, 20 quest, collezione di carte rare, power-up, eventi casuali e interfaccia liquid glass. PWA installabile su GitHub Pages, senza server.

**Live:** <https://lucagandolfi77.github.io/portfolio/games/memory/>

## Modalità (11)

| Modalità | Obiettivo |
| --- | --- |
| 🌸 Classic | Trova tutte le coppie senza fretta |
| ⏱️ Time Attack | Completa il gioco in 60 secondi |
| 🧘 Zen | Nessun timer, solo relax |
| 🔥 Streak | Costruisci la combo più lunga |
| 🧠 Matrix | Ricorda e ripeti la sequenza |
| 📅 Daily | Tavola generata dal seed del giorno |
| 🗺️ Quest | 20 livelli con stelle e sblocchi |
| 🌀 Chaos | Eventi casuali a ogni coppia |
| 🪞 Mirror | Griglia specchiata e carte nebbiose |
| ⚡ Rush | 45 secondi, 24 mosse, tavola che si mescola |
| 👥 Pass & Play | Due giocatori a turni |

## Feature

- **8 mazzi** (animali, cibo, spazio, simboli, bandiere, mitologia, arte, viaggi) e **6 temi** personalizzabili.
- **Power-up**: Peek, Shuffle, Freeze, Hint.
- **Eventi**: mescolamento, carta dorata, nebbia, scambio, freeze, fioritura.
- **Collezione**: carte rare, XP e livelli; **achievement**, classifica locale e streak giornaliera.
- **Condivisione**: result card PNG con punteggio e testo copiabile (Web Share dove disponibile).
- **Feedback**: suoni WebAudio, vibrazione, flip 3D, combo e popup.
- UI **liquid glass** con vetro smerigliato, aurora, safe-area iPhone e `prefers-reduced-motion`.

## Architettura

```text
games/memory/
├─ index.html / README.md
├─ css/app.css                 # liquid glass
├─ js/
│  ├─ config.js                # registry modalità, mazzi, temi, quest, eventi
│  ├─ core.js                  # PURO: PRNG, board, punteggio, combo
│  ├─ quest.js / collection.js # PURO: progressione e collezione
│  ├─ share.js / audio.js / ui.js / main.js
├─ tests/core.test.mjs
└─ manifest.webmanifest / icon.svg / sw.js
```

Tutte le logiche deterministiche usano `mulberry32` con seed; la Daily usa il seed della data, quindi la tavola è identica per tutti. `localStorage` (chiave `memory-garden-v2`) conserva impostazioni, stelle, record, collezione e streak.

## GitHub Pages e PWA

Tutti i percorsi sono relativi, senza build o server. Il service worker precarica shell, moduli, icone e file i18n; dopo il primo avvio il gioco funziona offline ed è installabile. Il canonical punta alla pagina del portfolio.

## Test

```bash
python3 -m http.server 8080
# http://localhost:8080/games/memory/

node --test games/memory/tests/*.test.mjs
node --check games/memory/js/main.js
```
