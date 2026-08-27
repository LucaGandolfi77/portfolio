# 🧪 Pocket Wild — Parallel Test Engine

Documentazione del **motore di test parallelo** del gioco: come funziona, come usarlo, e cosa copre.

---

## Cos'è

Pocket Wild ha **due livelli di testing**, entrambi costruiti sullo stesso codice di gioco (`js/*.js`):

1. **🧪 Motore parallelo in-game** (bottone "🧪 Test" nell'HUD del gioco)
   - **Pausa il mondo, scatta un'istantanea**, e lascia che un **bot giochi da solo** a ×1–×20 con le *identiche* funzioni di update del gioco reale.
   - Alla fine **ripristina lo stato** (o lo conserva con la checkbox "keep results").
   - **Esperimenti**: +sfere, +essenza, teleport, spawn Alpha/trainer/rift, stagioni forzate, quest completate.
   - Serve a provare feature, bilanciamento e quest **senza rischiare il save**.

2. **Suite Node headless** (`tests/run-tests.cjs`)
   - Stub del DOM/localStorage → carica `../js/*.js` in ordine → esegue **238 assertion** su tutta la logica pura.
   - Si lancia da `projects/pocket-wild/`:
     ```bash
     node tests/run-tests.cjs
     ```
   - Output: `238 passed, 0 failed` (exit code 0 = tutto verde).

---

## Come funziona l'harness

`tests/harness.js`:
1. Stuba `document`, `localStorage`, `window`, `performance`, `location`, `history` (gli stessi stub usati per i test di tutta la sessione).
2. Concatena `../js/*.js` in ordine di filename (lo stesso ordine dei `<script>` di `index.html`).
3. Espone ~110 funzioni/costanti interne (`G`, `stepSim`, `spawnWild`, `updateTower`, `eclipseMult`…) via `module.exports`.
4. Ritorna il modulo `M` su cui corrono le assertion.

> I test sono *logici*, non visivi: niente canvas reale, niente audio. Il `d.remove is not a function` che a volte appare in coda è un artefatto dei timer dei toast stub, non un bug.

---

## Scenari coperti (218 test)

| Area | Cosa verifica |
|---|---|
| **Mondo** | rumore deterministico, 7 biomi raggiungibili, spawn sicuro su terra (mai oceano), mappa 2200×2200 |
| **Genetica** | tipo ×2 difese, danno, leveling, evoluzioni, cattura (HP bassi > HP pieni, rarità) |
| **Quest** | 20 quest in 5 capitoli, lock/unlock progressivo, niente regressione NaN, quest travel/aurora/talk/catchSea/tower |
| **Stagioni** | ciclo 28 giorni, pool gated, meteo (estate senza pioggia, aurore invernali), moltiplicatori raccolta |
| **Paldex/achievement** | seen/caught, 19 achievement, profilo persistente |
| **NPC** | trader, trainer (team + rivincite), Mira (cooldown + essenza), Bram (upgrade con monete) |
| **Dungeon** | trappole deterministiche, chiave, stanza segreta, volta, ricompense |
| **🗼 Torre** | 10 piani, ondate, campione al piano 10, ricompensa finale |
| **🌒 Eclissi** | trigger al giorno 9, 3 echi spawnati, moltiplicatore 1.5, meteor ancora funzionante |
| **🐟 Pesca** | riva richiesta, morso, cattura Pal marino, dex aggiornata |
| **🐉 Volo** | toggle volo con Pal `fly`, attraversa l'oceano, atterraggio |
| **🤖 Imprinting** | abitudini dal playstyle (Brawler/Forager/Wanderer…), una sola abitudine per Pal |
| **🪝 Engine smoke** | 1100s simulati: eclissi attraversata, 0 morti, imprinting attivo |
| **Motore parallelo** | snapshot/restore round-trip, decisioni bot, stepSim senza eccezioni, faint→respawn, esperimenti |
| **🎬 Cutscene** | registro di 11 scene (≥3 righe, speaker validi), once-per-run, guardia SILENT, trigger giorno 7, confessione→boss |
| **🗣 Voci bioma** | 7 whisper del narratore, una volta per bioma, cambio bioma riconosciuto, guardia SILENT |
| **🌑 Voce Sovereign** | linea allo spawn + soglie 75/50/30% HP, guardia SILENT |
| **📓 Diario di Lina** | 33 note (una per specie), stati locked/seen/caught, achievement diarist, quest diary che avanza con le specie viste |
| **⚙️ Difficoltà** | 4 livelli con moltiplicatori corretti (dmgIn/hp/dmgOut/catch/spawn/hunger), HP wild scalati, persistenza nel save |
| **🌐 Lingua** | 2 lingue con chiavi speculari (en↔it), fallback, `setLang` rifiuta lingue ignote, quest/capitoli tradotti |
| **🧘 Zen** | fame che non scende, niente faint (hp≥1), raccolta ×10, risorse abbondanti al newWorld |
| **⏱️ Speedrun** | timer che accumula in stepSim, record salvato, tempi peggiori non sovrascrivono il best |

---

## Aggiungere un nuovo scenario

1. Apri `tests/run-tests.cjs`, vai in fondo (prima del `console.log('\n'+pass+...)`).
2. Scrivi le assertion con gli helper:
   ```js
   ok('nome descrizione', condizione);
   eq('nome', valoreOttenuto, valoreAtteso);   // confronto JSON
   ```
3. Se serve una funzione non ancora esportata, aggiungila a `EXPORTS` in `tests/harness.js`.
4. Rilancia: `node tests/run-tests.cjs`.

> Consiglio: per feature nuove, prima scrivi lo scenario qui (test-first), poi implementa nel `js/` finché non diventa verde.

---

## Smoke test del motore parallelo

Lo stesso motore in-game si può guidare da Node per run lunghe (es. attraversare un'eclissi):

```js
const M = require('./tests/harness').buildCore();
M.setSilent(true);
M.newWorld();
M.BOT.goal = null; M.BOT.data = null; M.BOT.log = [];
for (let i = 0; i < 22000; i++) M.stepSim(0.05); // ~1100s di gioco
console.log(M.simReport());
```

Risultato di riferimento (run 1100s): **12 giorni, 0 morti, 1 eclissi vista, 2 echi, 4 achievement, tutti i Pal con abitudine "Wanderer"**, zero eccezioni.
