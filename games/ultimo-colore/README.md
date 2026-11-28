# Ultimo Colore — Atto I: la laguna

Ogni tramonto il mondo perde un colore. Chi perde l'ultimo dei suoi diventa una statua di sale. Da Velaria, città di canali e lanterne, una piccola spedizione parte verso la Fonte.

Gioco di ruolo a turni con difesa a tempo. Storia, mondo, personaggi, musica e disegni originali. PWA offline in JavaScript vanilla (ES module), senza build; italiano e inglese.

## Cosa c'è nell'Atto I

- **15 tappe** sulla rotta (due facoltative), 8 scontri compresi 2 grandi Sbiaditi, 2 campi.
- **Gruppo:** Ilario, Tecla, Nora, Bastiano e il cane Ombra; 4 abilità a testa (due si sbloccano salendo di livello).
- **Combattimento:**
  - attacchi a tempo (anello che si chiude);
  - Parata, Schivata e Salto contro ritmi leggibili con finte, annunciati anche dal suono;
  - contrattacco se si para tutta la mossa;
  - Scintille sui punti deboli, barra di rottura, oggetti.
- **20 Ricordi** passivi: tre per persona, imparati dopo 4 scontri e insegnabili spendendo luce.
- **Difficoltà:** Racconto (senza riflessi), Facile, Normale, Difficile; parata automatica al 50% come aiuto.
- **Storia:** dialoghi con scelte che legano i personaggi, conversazioni al campo, diario di Tecla.
- **Undici luoghi dipinti con Blender** (`blender/build_scenes.py`, con filtro acquerello e carboncino in numpy).
- Alla fine dell'atto il verde sparisce davvero dai dipinti, e gli archi spariscono dalla musica.

## Differenze rispetto al piano (`docs/PLAN-ULTIMO-COLORE.md`)

- È pubblicato **solo l'Atto I**. Mancano gli atti II–V, l'epilogo, i tre finali, Vela giocabile e 40 dei 60 Ricordi.
- Il testo dell'Atto I è di qualche migliaio di parole per lingua, non le 40.000 previste per l'intero gioco.
- Il combattimento è in DOM e SVG invece che canvas; l'esplorazione è una rotta a nodi, senza movimento libero.
- Ombra non occupa un turno: aiuta tra un giro e l'altro.
- Le finestre di tempo non sono regolabili una per una: si sceglie tra i quattro livelli.

## Struttura

```
js/data/     party enemies memories map story
js/battle/   engine (turni, puro) timing (finestre, puro)
js/world/    progress (salvataggio, rotta, campi, puro)
js/render/   sprites (SVG) fade (colore che muore)
js/ui/       battle screens
js/          main audio strings
blender/     scene → blender/out/*.png → scripts/pack-art.mjs → art/*.webp
```

## Verifiche

```bash
node games/ultimo-colore/test/logic-test.mjs
cd tools/quality && npx playwright test e2e/ultimo-colore.spec.mjs --config=playwright.config.mjs
```

Rigenerare i dipinti (Blender 5):

```bash
Blender -b --factory-startup --python games/ultimo-colore/blender/build_scenes.py
node games/ultimo-colore/scripts/pack-art.mjs
```

Hook per i test: `window.__colore` (`newGame`, `jump`, `enter`, `readAll`, `advance`, `freeze`, `battle`).
