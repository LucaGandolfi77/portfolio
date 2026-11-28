# Shake Me 🍸 — il bar di Tobia

Dietro il bancone di un piccolo bar sotto i portici prepari i **102 cocktail ufficiali IBA** e 10 analcolici della casa. Tobia, barman in pensione, assaggia e giudica. Gioco originale per adulti (avviso 18+): nessun acquisto, nessuna pubblicità, nessun drink vero.

PWA offline in JavaScript vanilla (ES module), disegni SVG, audio sintetizzato, senza build.

## Cosa c'è

- **Bancone**:
  - bicchiere (10), ghiaccio, bordo di sale o zucchero;
  - attrezzo: shaker, mixing glass, frullatore o direttamente nel bicchiere;
  - **misurino** da riempire tenendo premuto;
  - pestello;
  - shakerare, mescolare, frullare e swizzle tenendo premuto fino alla zona verde (lo shaker anche scuotendo il telefono);
  - filtrare, colmare e guarnire.
- **Giudizio** su 100: ingredienti 35, dosi 25, tecnica 15, bicchiere e ghiaccio 15, guarnizione e bordo 10. Tobia commenta l'errore principale e l'elenco dice cosa correggere.
- **Livelli di precisione**:
  - serate 1–4: tacche numerate e linea della dose, ±25%;
  - serate 5–8: tacche senza numeri, ±15%;
  - serate 9–12: niente tacche, ±8%.
- **Modalità**: 12 Serate da cinque clienti (i 102 cocktail divisi dal più semplice al più difficile), Scuola, A memoria, Sfida del giorno, Ricettario.
- Italiano e inglese, testo grande, meno movimento.

## Ricette

- Trascritte come dati dalle pagine dei cocktail ufficiali di iba-world.com (lette il 28/11/2026): ingredienti e dosi, tecnica, bicchiere, ghiaccio e guarnizione.
- Le marche sono sostituite dal tipo di prodotto (es. «bitter rosso», «liquore al maraschino»).
- Il procedimento mostrato nel gioco è generato dai dati con frasi nostre (`js/steps.js`). Non sono copiati testi, foto o video del sito.
- Il gioco non è affiliato né approvato dall'IBA.
- Le 10 ricette analcoliche sono nostre e segnate «non IBA».
- **Scelte di trascrizione:**
  - le dosi senza misura («un goccio», «colmare», «a piacere») si giudicano solo per la presenza;
  - le parti facoltative non tolgono punti;
  - dove la pagina IBA ammette due bicchieri o due distillati, il gioco li accetta entrambi;
  - su IBA Tiki le dosi senza unità sono lette come ml;
  - lo Champagne «a parte» del Porn Star Martini non è richiesto.

## Differenze rispetto al piano (`docs/PLAN-SHAKE-ME.md`)

- Le serate sono una coda di cinque ordini, senza timer né più comande insieme.
- Il colore del drink è simulato, ma diluizione e temperatura entrano solo nel voto della tecnica (la zona verde dello shaker e del mixing glass).
- Niente dry shake separato e niente doppio filtro: i pochi cocktail che li chiedono si giudicano con lo shaker normale.
- I clienti sono 10; le stelle restano nel ricettario e non arredano il bar.

## Struttura

```
js/data/{recipes,ingredients,bar}.js   dati
js/workbench.js judge.js steps.js service.js state.js   logica pura
js/barscreen.js ui.js main.js render/art.js audio.js lines.js strings.js
test/logic-test.mjs
```

## Verifiche

```bash
node games/shake-me/test/logic-test.mjs
cd tools/quality && npx playwright test e2e/shake-me.spec.mjs --config=playwright.config.mjs
node tools/quality/generate-shake-me-icons.mjs   # solo se cambia l'icona
```

Hook per i test: `window.__shake` (`start`, `perfect`, `advance`, `bar`, `state`).
