# 🌿 Orto Magico

Giardino idle: pianta, annaffia, raccogli. Nuova versione web modulare con 6 modalità, stagioni, meteo, spiriti, semi mutanti e interfaccia **liquid glass**. Funziona come PWA statica su GitHub Pages, senza server.

**Live:** <https://lucagandolfi77.github.io/portfolio/games/orto-magico/>

> Il vecchio piano di deploy/market è conservato in `DEPLOYMENT-PLAN.md`. La cartella `www/` e il progetto Capacitor non sono stati modificati.

## Modalità

| Modalità | Obiettivo |
| --- | --- |
| 🌱 Giardino | Coltivazione libera con raccolto automatico opzionale |
| 🍃 Stagioni | Primavera/Estate/Autunno/Inverno con moltiplicatori di crescita e acqua |
| ⏱️ Sfida 60s | Raccogli 6 piante prima dello scadere del tempo |
| 📅 Quotidiana | Seed del giorno, obiettivo 5 raccolti e streak |
| 🧘 Zen | Crescita più lenta, ritmo rilassato |
| 🏡 Serra Mutanti | Sblocca Frutta Stella e Rosa Arcobaleno con la Serra |

## Feature

- **17 varietà** di semi, di cui 2 mutanti; album botanico con storie.
- **Stagioni** e **meteo** (sole/pioggia/nuvoloso/notte) che modificano crescita e consumo d'acqua.
- **Spiriti** (Fata, Gnomo, Gufo) con potenziamenti passivi attivabili.
- **13 potenziamenti**, 7 obiettivi con ricompense, livelli XP, raccolto e ripiantagione automatici.
- **Offline earnings** con riepilogo al ritorno e tetto ore potenziabile.
- **Audio WebAudio**, haptics, notifiche e result card PNG condivisibile.
- UI **liquid glass** con aurora, card orto traslucide, bottom sheet, safe-area iPhone e reduced-motion.

## Architettura

```text
games/orto-magico/
├─ index.html / style.css / README.md / DEPLOYMENT-PLAN.md
├─ js/
│  ├─ config.js     # registry semi, upgrade, obiettivi, stagioni, meteo, spiriti
│  ├─ garden.js     # PURO: crescita, acqua, raccolto, offline, negozio
│  ├─ modes.js      # PURO: stagioni, daily, time attack, serra
│  ├─ progress.js   # PURO: album, record, streak
│  ├─ share.js / audio.js / ui.js / main.js
├─ tests/garden.test.mjs
└─ manifest.webmanifest / sw.js / icons/
```

Lo stato resta in `localStorage` (`orto-magico-state-v2`) ed è retrocompatibile con il vecchio salvataggio.

## GitHub Pages e PWA

Tutti i percorsi sono relativi; il service worker precarica shell, moduli, manifest e icone, gestisce install/aggiornamento e permette il gioco offline. Il root service worker del portfolio conserva la cache `pf-orto-magico-*`.

## Test

```bash
python3 -m http.server 8080
# http://localhost:8080/games/orto-magico/

node --test games/orto-magico/tests/*.test.mjs
node --check games/orto-magico/js/main.js
```
