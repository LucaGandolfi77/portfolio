# 🛰️ Coverage Galaxy: Embedded Test Academy

PWA gamificata · React + TypeScript + Vite + Tailwind · Offline · IndexedDB

## Come installare

1. Apri `site/index.html` nel browser (Safari su iPhone)
2. Safari → Condividi → "Aggiungi a schermata Home"
3. Funziona offline dopo il primo caricamento

## Concetto

Entra in un'accademia spaziale per diventare **Software Verification Engineer**. Ogni **pianeta** = una funzione ANSI C di un sistema embedded aerospace.

| Gioco | Concetto verifica software |
|---|---|
| 🪐 Pianeta | Funzione C (unit under test) |
| 🛰️ Stazione | Statement |
| ↗️ Rotta | Branch (preso / non preso) |
| 🌙 Luna | Condizione booleana (MC/DC) |
| 🌑 Zona oscura | Codice non coperto |
| 🚀 Nave | Test harness |
| 📡 Modulo attraccato | Dipendenza reale (kept) |
| 👻 Modulo olografico | Stub configurato |
| 📋 Missione | Requisito collegato |
| 🚨 Anomalia | Defect del codice |

## Workflow (13 step per pianeta)

1. 📡 Import — carica il modulo
2. 🔗 Requisiti — collega ai REQ
3. 🔎 Dipendenze — scan rileva HW/funzioni/globali
4. ⚖️ Keep vs Stub — attracca o ologramma
5. ⚙️ Config Stub — valori di ritorno
6. 🧪 Crea Test — nominale/limite/negativo/robustezza
7. 🎯 Expected — output attesi
8. ▶️ Esegui — harness simulato
9. 📊 Coverage — statement/branch/MC-DC
10. 🚨 Triage — classifica FAIL: test/stub/codice
11. 🔧 Fix — correggi test o stub
12. 📋 Anomalie — apri defect report
13. 🔁 Regression — re-run completo

## 9 Pianeti

| # | Pianeta | Config | Focus |
|---|---|---|---|
| 0 | Tutorial: Telemetry Validator | Sim + RISC-V32 Debug | Guida introduttiva |
| 1 | Boot Image Validation | RISC-V 64 Debug | magic + length + CRC |
| 2 | Watchdog | Clang + Sim | MC/DC (key && armed) |
| 3 | CRC-16 | char unsigned | ✅ Anomalia: char portability |
| 4 | Sensors | Restrictive alignment | ✅ Anomalia: cast packed |
| 5 | State Machine | RISC-V32 Release | ✅ Anomalia: uninitialized UB |
| 6 | Orbital Control | Clang + HW rep | Robustezza NaN/Inf |
| 7 | Reaction Wheel | RISC-V64 Release | ✅ Anomalia: overflow |
| 8 | Safe Mode Entry | Sim + Debug | ✅ Anomalia: && vs \|\| |

## Gamification

- **XP + Rank**: Cadet → Guardiamarina → Ingegnere → Specialista → Verification Master
- **12 Badge**: First Contact, Orbita Completa, Moonwalker, Anomaly Hunter, Minimalist...
- **Modalità Principiante/Avanzato**: hint gratuiti vs MC/DC obbligatorio
- **Missioni giornaliere**: seed deterministico da data
- **Glossario**: 25+ termini generici di verifica software
- **Export JSON**: report completo trasferibile

## Tech Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS v4
- IndexedDB (via `idb`)
- Service Worker (offline)
- Deterministic simulation engine (no C execution)

## Struttura

```
coverage-galaxy/
├── src/                    # React TS sorgenti
│   ├── engine/             # sim.ts, scoring.ts
│   ├── data/               # missions/, glossary.ts
│   ├── db/                 # idb.ts (IndexedDB)
│   ├── state/              # GameContext.tsx
│   └── components/         # GalaxyMap, PlanetView, ...
├── site/                   # BUILD OUTPUT (committato)
│   ├── index.html, assets/
│   ├── sw.js, manifest.webmanifest, icons/
├── package.json, vite.config.ts, tsconfig.json
```
