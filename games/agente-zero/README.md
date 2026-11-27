# Agente Zero 🏀 — tiro a canestro

Sei Agente Zero: numero 0, maglia rossa e bianca. Scorri il dito e fai canestro. Gioco originale: personaggi, nomi, posti e sponsor sono inventati; nessun acquisto né pubblicità.

PWA offline in JavaScript vanilla (ES module) su canvas, senza build né librerie.

## Cosa c'è

- **Tiro** con swipe (direzione = mira, lunghezza = forza, curva = effetto), «tieni e rilascia» oppure tastiera (frecce e spazio). Tre difficoltà.
- **Fisica**: gravità, aria, effetto all'indietro, ferro, tabella, rete, vento, canestro mobile e difensore. Lo stesso tiro dà lo stesso risultato.
- **Sette modalità**: Allenamento, Carriera «Operazione Zero» (36 missioni, 6 posti), 60 secondi, Gara da tre, Z-E-R-O contro Kappa, Sfida del giorno e Bomba Zero (18+).
- **In fiamme** dopo 3 canestri di fila (punti doppi dove contano).
- **Spogliatoio** (pelle, capelli, maglie rosso-bianche, palloni, scarpe, fasce, esultanze), 38 medaglie, mappa dei tiri per zona.
- Audio sintetizzato, italiano e inglese, meno movimento, contrasto alto, testo grande.

## Bomba Zero (18+)

Satira per adulti dietro un avviso sull'età; drink inventati (Amaro Nebbia ed energy drink Fulmine).

- Dopo **ogni canestro** si beve: tocco per far cadere il bicchierino nel bicchiere, poi si **inclina il telefono** verso di sé (o si tiene premuto, anche spazio o invio).
- L'**ebbrezza** (0–100) sale a ogni drink e scende col tempo. La mira disegna un otto, arrivano singhiozzi e, oltre 80, brevi momenti con destra e sinistra scambiate. La scia diventa verde quando è il momento di tirare.
- Il punteggio si moltiplica fino a ×3. A 100 Zero crolla; restare in piedi fino alla sirena (90 secondi) vale un bonus.
- Logica in `js/drunk.js` e `js/bomb.js`, scena in `js/render/bomb.js`, sensore in `js/tilt.js`.
- Rispetto a `docs/PLAN-AGENTE-ZERO-BOMBA.md`: l'esse della palla in volo è solo visiva (la palla arriva dove è stata mandata), «Sei bombe in una sera» sostituisce la medaglia da dieci (irraggiungibile prima di crollare), la musica rallenta e si ovatta ma non distorce, e non c'è la saturazione dei colori.

## Differenze rispetto al piano (`docs/PLAN-AGENTE-ZERO.md`)

- Nello swipe la forza dipende dalla sola lunghezza, non dalla velocità: è più facile da imparare.
- La fisica gira a 240 Hz e il tiro è calcolato tutto al rilascio, poi riprodotto.
- Le regole stanno in `js/modes.js`, i menu in `js/ui.js`, la partita in tempo reale in `js/game.js`.
- XP e medaglie sono in `js/state.js` (non usano `progression.js` del kit).
- La Gara da tre ha 25 palloni in 60 secondi; il fuoco non raddoppia i punti.

## Struttura

```
js/physics.js shot.js court-data.js modes.js career.js state.js   logica pura
js/render/                                                         camera, campi, canestro, giocatore
js/game.js input.js audio.js ui.js main.js lines.js strings.js
test/logic-test.mjs
```

## Verifiche

```bash
node games/agente-zero/test/logic-test.mjs
cd tools/quality && npx playwright test e2e/agente-zero.spec.mjs --config=playwright.config.mjs
node tools/quality/generate-agente-zero-icons.mjs   # solo se cambia l'icona
```

Hook per i test: `window.__zero` (`start`, `shoot`, `advance`, `game`, `state`).
