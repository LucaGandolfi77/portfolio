# Game Kit

Condividi le fondamenta tra i giochi del portfolio. Ogni modulo è opzionale: importa solo ciò che serve.

| Modulo | Responsabilità |
|---|---|
| `core.js` | loop a passo fisso, clamp/RNG, difficoltà, seed giornaliero |
| `storage.js` | localStorage versionato e crash-proof, record, log |
| `i18n.js` | EN/IT sincronizzato con `top_buttons.js` |
| `audio.js` | WebAudio synth senza asset |
| `fx.js` | particelle, shake, flash, testo fluttuante |
| `progression.js` | XP, livelli, unlock, streak, achievement |
| `pwa.js` | registrazione service worker, canvas DPR-aware |
| `test-harness.js` | assert minimale per `node --test` |

## Uso

```js
import { makeLoop, DIFFICULTY } from '../_kit/core.js';
import { load, store } from '../_kit/storage.js';
import { createI18n } from '../_kit/i18n.js';
import * as AUDIO from '../_kit/audio.js';
import { FX } from '../_kit/fx.js';
import { registerSW } from '../_kit/pwa.js';
```

I service worker devono includere i moduli del kit nel precache:
`'../_kit/core.js'`, `'../_kit/storage.js'`, ecc.

## Template

Vedi `_kit/template/` per la struttura canonica di un gioco.

## Regola d'oro del portfolio

Ogni gioco migrato deve avere: **ES module + CSS separato + i18n EN/IT + PWA + test Node**, e almeno **3 sistemi di profondità** tra modalità, difficoltà, progressione, AI, obiettivi, statistiche, audio ed effetti.
