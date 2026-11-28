# Ultimo Colore — Atto I: la laguna

Ogni tramonto il mondo perde un colore. Chi perde l'ultimo dei suoi diventa una statua di sale. Da Velaria, città di canali e lanterne, una piccola spedizione parte verso la Fonte.

Gioco di ruolo a turni con difesa a tempo. Storia, mondo, personaggi, musica e disegni originali. PWA offline in JavaScript vanilla (ES module), senza build; italiano e inglese.

## Cosa c'è nell'Atto I

- **Laguna aperta** (2048 × 3072), dipinta con Blender vista dall'alto:
  - si cammina trascinando il dito, o con frecce e WASD (E per agire);
  - dopo la darsena si naviga con la Pazienza; canneti e barricate si aprono con la storia;
  - **Sbiaditi in vista**: 14 gruppi erranti con un cono di vista; se li raggiungi di spalle colpisci per primo, se ti inseguono cominciano loro, e si può scappare. Tornano quando si riposa a un campo (valgono metà esperienza);
  - 9 lanterne smarrite con provviste, 8 statue di sale da guardare;
  - obiettivo scritto, freccia-bussola, minimappa e mappa della laguna.
- **15 tappe** di storia (due facoltative), 8 scontri di storia compresi 2 grandi Sbiaditi, 2 campi.
- **Gruppo:** Ilario, Tecla, Nora, Bastiano e il cane Ombra; 4 abilità a testa (due si sbloccano salendo di livello).
- **Combattimento:**
  - attacchi a tempo (anello che si chiude);
  - Parata, Schivata e Salto contro ritmi leggibili con finte, annunciati anche dal suono;
  - contrattacco se si para tutta la mossa;
  - Scintille sui punti deboli, barra di rottura, oggetti.
- **20 Ricordi** passivi: tre per persona, imparati dopo 4 scontri e insegnabili spendendo luce.
- **Difficoltà:** Racconto (senza riflessi), Facile, Normale, Difficile; parata automatica al 50% come aiuto.
- **Storia:** dialoghi con scelte che legano i personaggi, conversazioni al campo, diario di Tecla.
- **Dieci scene e la mappa dipinte con Blender** (`blender/build_scenes.py` e `blender/build_world.py`, con filtro acquerello e carboncino in numpy).
- **Figure in 3D nel mondo aperto:** la spedizione, il cane, la barca, i sei tipi di nemici, lanterne, barricata e canneti sono modelli low-poly animati, disegnati in WebGL con ombre, contorno a china e un piccolo motore scritto per il gioco (`js/render3d/`, nessuna libreria). Si cammina anche dietro i tetti, con la sagoma in trasparenza. Senza WebGL tornano i disegni piatti.
- **Laguna viva:** riflessi, risacca, scia della barca, polvere e spruzzi, luce di lanterne e fuochi, nuvole, nebbia, foglie, lucciole e uccelli. Con le animazioni ridotte restano fermi. I menu e i combattimenti sono ancora illustrati in 2D.
- Alla fine dell'atto il verde sparisce davvero dai dipinti, e gli archi spariscono dalla musica.

## Differenze rispetto al piano (`docs/PLAN-ULTIMO-COLORE.md`)

- È pubblicato **solo l'Atto I**. Mancano gli atti II–V, l'epilogo, i tre finali, Vela giocabile e 40 dei 60 Ricordi.
- Il testo dell'Atto I è di qualche migliaio di parole per lingua, non le 40.000 previste per l'intero gioco.
- Il combattimento è in DOM e SVG invece che canvas. L'esplorazione, prima una rotta a nodi, ora è libera su un'unica mappa per l'Atto I.
- Ombra non occupa un turno: aiuta tra un giro e l'altro.
- Le finestre di tempo non sono regolabili una per una: si sceglie tra i quattro livelli.

## Struttura

```
js/data/     party enemies memories map story
js/battle/   engine (turni, puro) timing (finestre, puro)
js/world/    layout (la mappa) terrain (dove si cammina) field (nemici, luoghi) progress (salvataggio), tutti puri
js/render/   overworld (i tre livelli) effects (acqua e aria) sprites (SVG) fade (colore che muore)
js/render3d/ rig geom (puri) heroes creatures boat props (modelli) scene (chi sta dove) gl (WebGL)
js/ui/       battle screens
js/          main audio strings
blender/     scene e mappa → blender/out/*.png → WebP in art/
scripts/     export-world.mjs (layout.js → blender/world.json), pack-art.mjs (la mappa 3072×4608 in 6 riquadri)
```

## Verifiche

```bash
node games/ultimo-colore/test/logic-test.mjs
cd tools/quality && npx playwright test e2e/ultimo-colore.spec.mjs --config=playwright.config.mjs
```

Rigenerare i dipinti (Blender 5):

```bash
node games/ultimo-colore/scripts/export-world.mjs   # dopo aver toccato js/world/layout.js
Blender -b --factory-startup --python games/ultimo-colore/blender/build_scenes.py
Blender -b --factory-startup --python games/ultimo-colore/blender/build_world.py
node games/ultimo-colore/scripts/pack-art.mjs
```

Hook per i test: `window.__colore` (`newGame`, `jump`, `enter`, `place`, `walk`, `act`, `readAll`, `advance`, `freeze`, `battle`, `world`; `world.view.stats` dice se il mondo è in 3D).
