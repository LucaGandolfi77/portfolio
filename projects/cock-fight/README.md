# 🐓 Cockpit Arena

Simulatore di combattimenti di galli **stilizzati** (nessuna violenza realistica): allena il tuo gallo, scommetti crediti virtuali e punta alla vittoria del campionato. Include un simulatore AI per fight tra galli qualsiasi.

> Solo crediti virtuali. Nessun denaro reale, nessun animale reale, nessun server.

## Come si gioca

1. **Allenamento**: scegli una statistica (Attacco, Difesa, Velocità, Resistenza, Fortuna) e paga con i crediti. Compra equipaggiamento (speroni, guardia-cresta, mangime, portafortuna).
2. **Combatti**: ogni round scegli Attacco / Difesa / Attesa / Speciale. Un indicatore scorrevole determina il tempismo: **Perfect** (danno ×1.55), **Good** (×1), **Miss** (×0.2). L’avversario ha una personalità AI (aggressiva, difensiva, imprevedibile).
3. **Scommetti**: Quota logistica calcolata dalla differenza di potenza con commissione bookmaker dell’8%. Punta su vittoria del tuo gallo, vittoria avversaria o numero di round. Le quote si bloccano alla piazzatura; lo storico è persistente.
4. **Campionato**: 5 round contro avversari sempre più forti. Medaglie in base ai round, XP, titolo finale.
5. **Simulatore AI**: seleziona due razze, genera un seed deterministico e simula un fight in millisecondi con esito e statistiche. Puoi scommettere anche sulle simulazioni.

## Architettura

```
cock-fight/
├── index.html · css/app.css · manifest.webmanifest · icon.svg · icons/ · sw.js
├── js/
│   ├── config.js     razze, statistiche, campionato, economy, EN/IT
│   ├── i18n.js       lingue sincronizzate con il project shell
│   ├── storage.js    save versionato pf.cockpit.save.v1
│   ├── rng.js        RNG deterministico + seed giornaliero
│   ├── engine.js     potenza, quote logistiche, simulazione, settlement, allenamento (puro)
│   ├── render.js     canvas arena con galli vettoriali, HP, timing bar, FX
│   ├── audio.js      WebAudio synth
│   ├── ui.js         tab, pannelli, bet slip, modali
│   └── main.js       bootstrap, loop, wiring
└── tests/logic-test.mjs
```

Tutto il motore è puro e testabile in Node: nessuna libreria esterna, Canvas2D e WebAudio nativi, PWA installabile.

## Test

```bash
node projects/cock-fight/tests/logic-test.mjs
```

22 test su quote, settlement, simulazione deterministica, timing danno, progressione, storage e struttura.

## Registro portfolio
`assets/js/projects-data.js` — id `cockpit-arena`, badge "Sim", icona 🐓.
