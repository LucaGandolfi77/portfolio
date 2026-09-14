# Scalpel — Surgical Stories 🔪

Perform life-saving operations at Ospedale Miraggio. Master surgical
instruments, save 19 patients, and unlock the science behind medicine.

## Come si gioca
1. Scegli **▶ NEW SURGEON** per iniziare dalla storia principale.
2. Ogni capitolo ha un paziente, strumenti chirurgici e un obiettivo.
3. Rispondi alle domande per guadagnare punti extra.
4. Sblocca nuovi capitoli completando quelli precedenti.
5. Usa **↻ CONTINUE** per riprendere dove hai lasciato.

## Modalità di Gioco

### 📖 Story Mode
- **Capitolo 1-19**: Storia principale con 19 pazienti diversi.
  - Cap 1-3: Livello base (Appendicectomia, Estrazione corpo estraneo, Pacemaker)
  - Cap 4-6: Livello intermedio (Tumore cerebrale, Rimozione granata, Fratture multiple)
  - Cap 7-9: Livello avanzato (Anafilassi, Decompressione, Parto cesareo d'urgenza)
  - Cap 10: Boss finale (Il chirurgo dei chirurghi)
  - Cap 11: Livello alieno (Cristalli interdimensionali)
  - Cap 12-19: Livello estremo ( ustioni, appendicite pediatrica, frattura anca, placenta previa, oggetto conficcato, legamento crociato, cuore congenito, ictus)
- **📅 Daily Surgery**: Paziente diverso ogni giorno con punteggio record.
- **📖 Medical Journal**: Encyclopedia medica interattiva con 15+ organi.

### ⚡ Challenge Mode
- **⚡ SPEED RUN**: Completare ogni capitolo nel minor tempo possibile.
- **💀 BOSS RUSH**: Affrontare tutti i boss in sequenza senza pausa.
- **♾️ ENDLESS MODE**: Pazienti procedurali generati all'infinito (sbloccato al capitolo 3).
- **🧟 ZOMBIE OUTBREAK**: Trasformazione in zombies con sistema infezione/surriscaldamento (sbloccato al capitolo 4).
- **👽 ALIEN SURGERY**: Operare alieni con strumenti interdimensionali (sbloccato al capitolo 11).
- **🌍 PANDEMIC**: Diventa il virus e infetta il mondo (10 paesi, 10 mutazioni, 5 dottori IA).

### 🧪 Practice & Learn
- **🧪 SANDBOX**: Tutti gli organi e strumenti, senza pressione o timer.
- **🐕 VETERINARY**: Opera su 16 animali (da cane a unicorno) con 5 livelli di difficoltà.
- **🫀 ANATOMY VIEWER**: Esplora 10 organi del corpo umano con quiz interattivo.
- **🎓 TUTORIAL**: Guida completa ai 16 strumenti con spiegazioni e quiz a 15 domande.

## Architettura

```
games/scalpel/
├── index.html          ← HTML + CSS (mobile-first, PWA)
├── js/
│   ├── data.js         ← Tutti i dati di gioco
│   └── core.js         ← Motore di gioco (~4800 righe)
├── manifest.webmanifest ← PWA manifest
├── sw.js               ← Service worker (offline)
├── icon.svg            ← Icona scalpel + ECG
└── README.md           ← Questo file
```

### data.js — Struttura Dati

| Sezione | Contenuto |
|---------|-----------|
| G.INSTRUMENTS | 16 strumenti chirurgici con icone, colori e descrizioni |
| G.PATIENTS | 19 pazienti con storia, condizione e vitals |
| G.CHAPTERS | 19 capitoli con dialogue, procedure e step |
| G.JOURNAL | Encyclopedia medica con 15+ organi |
| G.DIFFICULTY | 19 livelli di difficoltà (10-190 secondi) |
| G.ALIEN_TOOLS | 8 strumenti alieni (cristallo, raggio, ecc.) |
| G.ZOMBIE | Config zombie outbreak (infezione, overheat, trasformazione) |
| G.ENDLESS | Config endless mode (pazienti procedurali) |
| G.PANDEMIC | Config pandemic mode (10 paesi, 10 mutazioni, 5 dottori) |
| G.VETERINARY | Config veterinaria (16 animali, 13 strumenti, ~50 complicazioni) |
| G.TUTORIAL | Guida strumenti (16) e quiz (15 domande) |
| G.SANDBOX_ORGANS | 8 organi per sandbox |
| G.SOUNDS | 24 effetti sonori con haptic |

### core.js — Funzioni Principali

| Sezione | Funzioni |
|---------|----------|
| Init | boot, start, showTitle |
| Story | showChapterSelect, loadChapter, startProcedure |
| Step Engine | onStepComplete, onProcedureComplete, generatePath |
| Challenge | showSpeedRun, showBossRush, showEndlessMode |
| Special | showZombieMode, showAlienChapter, showPandemicMode |
| Practice | showSandbox, showVeterinaryMode, showAnatomyViewer |
| Learning | showTutorial, showJournal |
| UI | showOverlay, showAccuracy, addScore, showResults |
| Save | saveGame, load, updateSaveStats |

## Menu Principale

Il menu è organizzato in 3 sezioni per facile accesso:

```
┌─────────────────────────────────┐
│  🔪 SCALPEL                     │
│  Surgical Stories               │
│                                 │
│  ─── STORY MODE ────────────── │
│  [▶ NEW SURGEON]                │
│  [↻ CONTINUE]                   │
│  [📅 DAILY SURGERY]             │
│  [📖 MEDICAL JOURNAL]           │
│                                 │
│  ─── CHALLENGE MODE ────────── │
│  [⚡ SPEED RUN]                 │
│  [💀 BOSS RUSH]                 │
│  [♾️ ENDLESS MODE]              │
│  [🧟 ZOMBIE OUTBREAK]           │
│  [👽 ALIEN SURGERY]             │
│  [🌍 PANDEMIC]                  │
│                                 │
│  ─── PRACTICE & LEARN ──────── │
│  [🧪 SANDBOX]                   │
│  [🐕 VETERINARY]                │
│  [🫀 ANATOMY VIEWER]            │
│  [🎓 TUTORIAL]                  │
│                                 │
│  [🔊/🔇]                        │
└─────────────────────────────────┘
```

## File
- `index.html` — struttura e stili (mobile-first, PWA installabile)
- `js/data.js` — tutti i dati di gioco (strumenti, pazienti, procedure, modalità)
- `js/core.js` — motore di gioco completo (~4800 righe)
- `manifest.webmanifest` — PWA manifest per installazione
- `sw.js` — service worker per funzionamento offline
- `icon.svg` — icona scalpel con ECG

## Test
`node --check` su entrambi i js per verificare la sintassi.

## Funzionalità Extra
- 🏆 **12 Achievement**: da "First Incision" a "Surgical Legend"
- 🔊 **24 Effetti sonori**: con haptic feedback su mobile
- 💾 **Salvataggio automatico**: localStorage con progressi
- 📱 **PWA installabile**: funziona offline
- 🎯 **19 Livelli di difficoltà**: da 10 a 190 secondi
- ⚡ **Power-up**: 5 tipi per assistenza durante le operazioni
- 🩺 **16 Strumenti**: ogni strumento con uso specifico
- 🧬 **Tutorial interattivo**: guida strumenti + quiz 15 domande
- 🧪 **Complicazioni**: 20+ tipi durante le operazioni
- 🦠 **Sistema di precisione**: punteggi e gradi per ogni operazione
