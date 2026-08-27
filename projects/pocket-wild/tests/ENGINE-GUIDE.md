# 🧪 Pocket Wild — Test Engine: Guida Completa e Riutilizzabile

Questa guida spiega **come è fatto** il motore di test di Pocket Wild e **come portarlo in un altro progetto** (qualsiasi gioco o app in JavaScript con logica pura separabile dal DOM). Include il pattern dell'harness, i template, la checklist degli invarianti e tutti gli errori imparati sul campo.

---

## 1. Cos'è il motore (due livelli)

1. **🧪 In-game "Parallel Test Engine"** — dentro il gioco, un pannello che mette in pausa il mondo, ne fa uno snapshot, lascia giocare un **bot** a velocità ×1–×20 con le *stesse* funzioni di update, e alla fine ripristina (o conserva) lo stato. Serve per provare feature e bilanciamento "dal vivo".
2. **🤖 Node headless** (`tests/`) — esegue la **stessa logica** senza browser:
   - `harness.js` — stub del DOM + build del core + export delle funzioni interne
   - `run-tests.cjs` — suite di assertion deterministiche (313)
   - `fuzz.cjs` — campagna randomizzata seed × difficoltà × modalità
   - `fuzz-axes.cjs` — 28 assi mirati (NPC, dungeon, narrativa, render, economia…)

**Il principio chiave**: *il codice di gioco non sa di essere testato*. Le funzioni di update lavorano su uno stato `G` (un oggetto globale) e non toccano il DOM se non per cosmetici (toast, HUD) — che nei test diventano no-op tramite stub o flag `SILENT`.

---

## 2. Architettura dell'harness

```
test file ──> require('./harness') ──> buildCore()
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
  1. Stub del browser         2. Concatena i sorgenti          3. Appende module.exports
  document, localStorage,     (file js in ordine di nome)      (lista di funzioni/costanti)
  window, performance,        → un unico file .core.cjs        + getter (pendingCustom, SEED)
  location, history,          → require() lo esegue
  __TEST__ = true
```

**Perché concatenare i file invece di importarli?** Il gioco è stato scritto come script classici (niente ES modules) per funzionare anche da `file://`. Concatenare in ordine di filename riproduce **esattamente** l'ordine dei `<script>` del browser → lo stesso comportamento, zero build.

### Il flusso dello stub DOM (pattern riutilizzabile)

```js
// Ogni elemento finto risponde a tutto senza fare nulla.
function mkEl() {
  const el = { value:'', textContent:'', innerHTML:'', onclick:null, dataset:{}, style:{},
    classList:{ add(){}, remove(){}, toggle(){ return false; } }, width:0, height:0 };
  return new Proxy(el, {
    get(t, p) {
      if (p in t) return t[p];
      if (p === 'getContext') return () => ctxStub;          // canvas
      if (p === 'addEventListener') return () => {};
      if (p === 'querySelector') return () => mkEl();
      if (p === 'querySelectorAll') return () => [];
      if (p === 'appendChild' || p === 'removeChild') return () => {};
      if (p === 'getBoundingClientRect') return () => ({ left:0, top:0 });
      return t[p];
    },
    set(t, p, v) { t[p] = v; return true; }
  });
}
const ctxStub = new Proxy({}, { get: () => () => ctxStub, set: () => true }); // canvas 2d
```

### `__TEST__`: spegnere i timer nei test

Il gioco usa `setTimeout`/`setInterval` per toast, typewriter delle cutscene, fade dei whisper. Nei test i timer girerebbero davvero e produrrebbero errori a fine processo. Soluzione: il codice di gioco controlla `globalThis.__TEST__` (impostato dall'harness) e salta i timer:

```js
function toast(msg, color) { if (SILENT || globalThis.__TEST__) return; /* ... */ }
```

In produzione `__TEST__` è `undefined` → falso → comportamento normale. **È un pattern sicuro e invisibile al giocatore.**

### `SILENT`: spegnere il "rumore" nelle simulazioni

Le simulazioni (bot, fuzz) eseguono migliaia di step che scatenerebbero toast e audio a raffica. Il gioco espone `setSilent(bool)`: quando attivo, `toast()` e i suoni diventano no-op ma **la logica continua a girare** (le ricompense, gli achievement, le cutscene flaggate — solo i popup tacciono).

---

## 3. Portare il motore in un altro progetto — passo passo

### Requisiti minimi
- La logica del gioco deve essere **separabile dal DOM**: funzioni pure che agiscono su uno stato (`G`) e che *al massimo* chiamano `toast()/$()` per la UI.
- I sorgenti devono essere leggibili da Node (`fs.readFileSync`).

### Passo 1 — Struttura
```
tuo-progetto/
  src/*.js              ← la logica (in qualsiasi ordine, o con prefisso numerico)
  tests/
    harness.js          ← copia questo pattern, adatta EXPORTS
    run-tests.cjs       ← le tue assertion
    fuzz.cjs            ← (opzionale) campagna random
    fuzz-axes.cjs       ← (opzionale) assi mirati
```

### Passo 2 — L'harness (template minimo)

```js
'use strict';
const fs = require('fs'), path = require('path');
/* ——— stub del browser (vedi sezione 2) ——— */
/* ... mkEl, ctxStub, document, localStorage, window, performance,
       location, history, __TEST__=true ... */

/* Esponi le funzioni/costanti interne che i test devono chiamare */
const EXPORTS = ['G', 'update', 'spawn', 'saveGame', 'loadGame', /* ... */];

function buildCore() {
  const dir = path.join(__dirname, '..', 'src');
  const files = fs.readdirSync(dir).sort();
  const code = files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  const modulePath = path.join(__dirname, '.core.cjs');
  fs.writeFileSync(modulePath, code + '\nmodule.exports={' + EXPORTS.join(',') + '};');
  return require(modulePath);
}
module.exports = { buildCore };
```

> ⚠️ **Regola d'oro per gli export**: le funzioni e le costanti `const`/`let` di livello top vengono *snapshotate* in `module.exports`. Se un test deve **modificare** una `let` interna (es. `LANG`, `SILENT`), esponi un setter: `function setLang(v){ LANG=v; }` e `setSilent(v){ SILENT=!!v; }`. Gli **oggetti** (`const G={...}`) si possono mutare via `M.G.x = ...` perché l'export tiene il riferimento.

### Passo 3 — Scrivere le assertion

```js
const M = require('./harness').buildCore();
let pass = 0, fail = 0;
const ok  = (n, c) => c ? (pass++, console.log('  ✓ ' + n)) : (fail++, console.log('  ✗ ' + n));
const eq  = (n, g, w) => ok(n, JSON.stringify(g) === JSON.stringify(w));
/* ... i tuoi test ... */
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
```

### Passo 4 — Scrivere un asse di fuzz (pattern)

```js
function axisNome() {
  const a = 'nome';
  setupWorld();                    // stato pulito e deterministico
  for (let i = 0; i < 1000; i++) {
    guard(a, () => azioneRandom()); // ogni azione dentro try/catch
    guard(a, () => M.stepSim(0.05));
    if (i % 100 === 0) invariants(a);
  }
  return a;
}
function invariants(a) {
  // 1. niente NaN
  // 2. niente negativi (hp, hunger, inventario)
  // 3. giocatore non bloccato su tile solido (salvo volo)
  // 4. entità sane (maxHp>0, hp≤maxHp, done≤t)
  // 5. nessuna eccezione (guard)
}
```

---

## 4. Checklist degli invarianti (riutilizzabile)

| Invariante | Esempio |
|---|---|
| Numeri finiti | `!isNaN(p.x) && !isNaN(p.hp) && G.time∈[0,1)` |
| Non negativi | `hp≥0`, `hunger≥0`, ogni chiave di `inv` ≥ 0 |
| Posizione valida | giocatore non su tile solido (a meno che non voli) |
| Entità sane | `maxHp>0`, `hp≤maxHp+1`, `atk>0`, `spd>0` |
| Limiti | `wilds ≤ cap`, `projectiles` consumati, `done ≤ t` per le quest |
| Determinismo | stesso seed → stessa mappa; `newWorld` sincronizza il seed |
| Round-trip | `snapshotG()` → muta → `restoreG()` ripristina tutto |
| Persistenza | `saveGame()` → distruggi stato → `loadGame()` fedele |
| Guardie di sistema | `SILENT` e `__TEST__` non cambiano la logica |

---

## 5. Errori imparati sul campo (lista dei bug che il motore ha trovato)

Questi sono **bug veri** scoperti dal fuzz — dimostrano cosa cercare:

1. **Variabile usata prima della dichiarazione** (`p` nel render del bobber) → `ReferenceError` → crash visivo. *Le funzioni di render vanno stressate con tutti gli stati, non solo quelli felici.*
2. **Seed del mondo decorativo** — `newWorld` aggiornava `G.seed` ma la mappa usava una costante → tutti i mondi identici. *Test di determinismo: seed diversi → mappe diverse.*
3. **Off-by-one nei cap** — `if (wilds.length > 70)` permetteva 71. *Test ai confini: riempi fino al cap e oltre.*
4. **Eventi che bloccano altri eventi** — la meteora (t=25s) non scadeva mai nel fast-forward e impediva l'eclissi. *Nei fuzz temporali, fai scadere gli eventi con dt alti.*
5. **Snapshot degli export** — `M.LANG = 'it'` non cambia la `let` interna; servono i setter. *Quando un test "non funziona ma il gioco sì", è quasi sempre questo.*
6. **Flakiness da mappa** — posizioni hardcoded che a volte sono oceano/alberi. *Cerca sempre una posizione libera a runtime, non fissare coordinate.*
7. **Flakiness da random** — confronti tra valori con componente casuale. *Confronta medie su molti campioni, non singoli lanci.*
8. **Timer nei test** — toast/typewriter creano `setTimeout` che esplodono a fine processo. *Guarda `__TEST__` nel codice di gioco.*

---

## 6. Integrazione CI (consigliata)

```yaml
# .github/workflows/test.yml
name: test
on: [push, pull_request]
jobs:
  node:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: node tests/run-tests.cjs     # suite deterministica
      - run: node tests/fuzz.cjs          # campagna random
      - run: node tests/fuzz-axes.cjs     # assi mirati
```

---

## 7. Numeri di riferimento (Pocket Wild)

- **313 test** deterministici · **campagna fuzz**: 18 run (3 seed × 3 diff × 2 mode) · **28 assi** · run profonda 1500s in Nightmare/Speedrun.
- Wall time totale < 5s su Node 20. Nessuna dipendenza esterna.
- Scoperte dal motore: **5 bug veri** (bobber render, seed decorativo, cap wild off-by-one, Alpha mai spawnati, quest NaN) + innumerevoli migliorie all'harness.

---

## File di Pocket Wild

```
tests/
  harness.js          → stub DOM + build core + ~150 export
  run-tests.cjs       → 313 assertion deterministiche
  fuzz.cjs            → campagna seed × difficoltà × modalità (+ --long)
  fuzz-axes.cjs       → 28 assi mirati
  README.md           → panoramica rapida + tabella assi
  ENGINE-GUIDE.md     → questo documento
```
