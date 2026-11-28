# ULTIMO COLORE — piano per `games/ultimo-colore/`

> Ogni tramonto, dal mondo sparisce un colore. Quando una persona perde l'ultimo dei suoi, diventa una statua di sale e resta lì, ferma, dove si trovava. A Velaria, città di canali e lanterne, il blu è finito l'anno scorso; il verde se ne va questo autunno. Sei persone, che hanno ancora un colore addosso, partono verso la Fonte, all'orlo del mondo, dove si dice che i colori nascano. Nessuna spedizione è mai tornata. Questa parte lo stesso.
>
> **Genere:** gioco di ruolo a turni con difesa a tempo (schivata e parata reattive), PWA offline, mobile first.
> **Ispirazione:** i giochi di ruolo a turni con combattimento «reattivo», tra cui *Clair Obscur: Expedition 33*. Del genere prendiamo l'idea dei turni con riflessi; storia, mondo, personaggi, nomi, musica e grafica sono nostri.
> **Riferimenti interni:**
> - `games/bar-blu/`: scrittura malinconica, scelte, finali, render Blender;
> - `games/seba/` e `games/agente-zero/`: logica pura testata, E2E, audio generativo;
> - `games/_kit/`.

---

## 0. Regole

1. **Non è un clone.** Non rifacciamo un gioco esistente, nemmeno cambiando i nomi. Da *Expedition 33* non prendiamo niente di riconoscibile:
   - niente Pittrice, nessun numero dipinto, niente «Gommage», niente Lumière, Gestral o Nevron;
   - nessun personaggio (Gustave, Maelle, Lune, Sciel, Monoco, Verso…), nessun luogo, nessun colpo di scena della trama;
   - niente estetica Belle Époque francese, niente musica, niente nomi di sistemi (Pictos, Lumina, Gradient…).
   
   Restano le idee di genere, che sono di tutti:
   - turni con schivata e parata a tempo;
   - punti azione;
   - mira sui punti deboli;
   - abilità passive da equipaggiare;
   - un gruppo in viaggio verso una fine probabile.
2. **Tono:** triste e malinconico, ma con tenerezza. Nessuna crudeltà gratuita, nessun gore. La morte c'è, raccontata con pudore.
3. **Nessun acquisto, nessuna pubblicità.** Si può finire tutto giocando.
4. **Convenzioni del portfolio:**
   - percorsi relativi;
   - service worker con prefisso `ultimo-colore-` e stale-while-revalidate;
   - viewport senza `user-scalable=no`;
   - `[hidden]{display:none!important}`.
5. **Commit per fase. Mai push su `main` senza chiedere.**

## 1. Il mondo

- **Lo Sbiadire.** Ogni tramonto un colore lascia il mondo, nello stesso ordine da quando qualcuno ricorda: prima il viola, poi l'indaco, il blu, il verde. Restano il giallo, l'arancio e il rosso.
- **Le statue di sale.** Ogni persona ha dentro alcuni colori, quelli dei suoi ricordi più cari. Quando l'ultimo se ne va, la persona diventa una statua di sale, nel gesto che stava facendo. Velaria ne è piena: una donna che stende il bucato, un bambino che corre, due vecchi che giocano a carte.
- **Velaria.** Città lagunare di legno scuro, lanterne di carta e campane d'ottone, ispirata alla laguna veneta e ai porti del nord, ma inventata. Ogni sera la città spegne una lanterna del colore perso.
- **La Fonte.** Un faro alto quanto una montagna, oltre il Mare di Gesso, all'orlo del mondo. Le leggende dicono che lì i colori nascono, ogni mattina, da qualcuno che li canta.
- **Gli Sbiaditi**, i nemici: creature fatte dei colori persi, che non trovano più posto nel mondo e prendono le forme dei ricordi di cui erano fatti. Una marea di cocci blu, un cervo di vetro verde, una bambina d'inchiostro viola.

## 2. Il gruppo (6, inventati)

| Personaggio | Chi è | Colore | In combattimento |
|---|---|---|---|
| **Ilario**, 52 anni | Lanternaio di Velaria, vedovo, guida la spedizione | arancio | **Fiamma**: ogni parata riuscita accende una scintilla; tre scintille scatenano un colpo forte |
| **Nora**, 17 anni | Sua figlia adottiva; non dovrebbe esserci e si è nascosta sulla barca | giallo | **Ritmo**: gli attacchi a tempo perfetto aumentano la sua velocità, ma un errore la riporta a zero |
| **Tecla**, 40 anni | Cartografa, ha già perso quasi tutti i colori | rosso (l'ultimo) | **Mappe**: segna i punti deboli dei nemici, rivela quando attaccheranno |
| **Bastiano**, 68 anni | Ex campanaro, quasi sordo, dice di sentire i colori | ocra | **Rintocchi**: carica colpi a turni, li fa suonare tutti insieme |
| **Vela** | Una ragazza di sale che si muove ancora, senza memoria | nessuno | **Vuoto**: assorbe colori dai nemici e li usa come magie, ma ogni magia la incrina |
| **Ombra** | Un cane da lanterna, scuro come il fumo | — | Alleato di supporto: trova oggetti, distrae, sa quando qualcuno sta per crollare |

- **Ogni personaggio ha un legame con gli altri**, che cresce nei campi la sera: dialoghi a scelta che sbloccano abilità e scene. Ogni legame ha un finale suo.
- **Ognuno ha anche un ricordo da pagare**: alla Fonte, per ottenere qualcosa, bisogna cedere un colore.

## 3. Il combattimento

A turni, con riflessi:

- **Punti azione (PA).** Si guadagnano parando e colpendo a tempo, e si spendono per le abilità.
- **Attacchi a tempo.** Durante un'abilità compare un cerchio che si stringe: toccare al momento giusto dà un bonus. Le abilità forti hanno sequenze da 2 a 4 tocchi.
- **Difesa reattiva**, nel turno del nemico:
  - **schivata**, con un tocco nella finestra larga: nessun danno;
  - **parata**, con un tocco nella finestra stretta: nessun danno e 1 PA;
  - se le pari tutte, **contrattacco**;
  - **salto** contro gli attacchi bassi, con uno swipe verso l'alto.
  
  Ogni nemico ha un **ritmo leggibile**, fatto di caricamenti, finte e suoni prima del colpo. Imparare i ritmi è il cuore del gioco.
- **Mira libera.** Si spendono PA per sparare scintille sui punti deboli, che si vedono solo dopo averli scoperti (Tecla li segna).
- **Rottura.** Riempiendo la barra di rottura di un nemico, perde il turno.
- **Ricordi equipaggiabili.** Sono abilità passive trovate in viaggio (circa 60), per esempio «Parare cura un po'» o «Il primo colpo del turno brucia». Si equipaggiano 3 per personaggio; usandone uno per 4 combattimenti, il personaggio lo **impara** e può passarlo agli altri spendendo luce.
- **Accessibilità:**
  - finestre di tempo regolabili (facile, normale, difficile);
  - opzione «parata automatica al 50%»;
  - segnali visivi e sonori;
  - gioco completo senza vincoli di riflessi in modalità Racconto.

## 4. Il viaggio

- **Mappa:**
  - sei regioni, ognuna con il colore che sta perdendo;
  - percorsi a nodi: scontri, scelte, campi, segreti, boss;
  - esplorazione in 2D vista dall'alto con scene dipinte.
  
| Atto | Regione | Colore che muore | Cosa succede |
|---|---|---|---|
| I | Velaria e la laguna | verde | La partenza. La prima statua di qualcuno che conoscevi. Nora salta fuori dalla stiva. |
| II | Le Saline | giallo | Le statue camminano di notte. Si scopre cosa è Vela. |
| III | Il Bosco d'Ottone | arancio | Bastiano sente qualcosa che nessun altro sente. Una perdita nel gruppo. |
| IV | Il Mare di Gesso | rosso | Tecla perde l'ultimo colore, lo sa, e decide come. |
| V | La Fonte | — | Chi canta i colori, e perché ha smesso. |
| Epilogo | Velaria, un anno dopo | — | Tre finali, a seconda dei legami e di quale colore si sceglie di cedere. |

- **Trama, a grandi linee:** la Fonte non è una macchina né un dio. È una donna anziana, l'ultima di quelli che cantavano i colori, che non riesce più a farlo da quando ha perso la persona per cui cantava. Il mondo sbiadisce con il suo lutto. La spedizione non deve uccidere nessuno: deve convincere qualcuno a ricominciare a vivere, e qualcuno del gruppo deve restare con lei a cantare.
- **I tre finali:**
  - **Alba:** Nora resta alla Fonte e i colori tornano, ma lei non tornerà a casa;
  - **Brace:** resta Ilario, Nora torna a Velaria e accende la prima lanterna verde;
  - **Sale:** nessuno resta, il mondo rimane in bianco e nero ma vivo, e si impara a chiamare le cose senza colore.
  
  Tutti e tre sono malinconici; nessuno è «cattivo».
- **Campi:** la sera, intorno a una lanterna, si parla, si cucina, si scrive nel diario di Tecla. È qui che si legano i personaggi e si dorme per salvare.

## 5. Scrittura

- Circa 40.000 parole, in italiano e in inglese.
- Stile: frasi brevi, molti silenzi, dettagli concreti (il bucato di sale, l'odore della cera, una campana stonata).
- **Il diario di Tecla**: ogni capitolo aggiunge una pagina scritta da lei, con la sua grafia che sbiadisce mentre perde il rosso.
- Nessun narratore onnisciente: la storia si capisce dai dialoghi, dagli oggetti e dalle statue (ognuna ha una breve iscrizione).

## 6. Grafica e suono

- **Grafica:**
  - scene dipinte in Blender (stile acquerello e carboncino, come le cartoline di Bar Blu) per i luoghi;
  - personaggi in SVG a strati con animazioni di attacco e difesa;
  - la desaturazione è una meccanica visiva: ogni regione ha una palette, e quando un colore muore il filtro lo toglie davvero dallo schermo.
- **Audio** (Web Audio, nessun file):
  - colonna sonora generativa: piano, archi sintetici, campane;
  - ogni regione perde uno strumento, come perde un colore;
  - i nemici annunciano gli attacchi con suoni riconoscibili, così si può parare anche ascoltando.
- **Prestazioni:** canvas 2D per il combattimento e la mappa, 60 fps su un iPhone di fascia media.

## 7. Architettura

```
games/ultimo-colore/
  index.html  styles.css  manifest.webmanifest  sw.js  README.md  icons/  art/ (webp)  blender/
  js/
    data/       party.js  enemies.js  skills.js  memories.js (ricordi equipaggiabili)  map.js  story/*.js (IT/EN)
    battle/     engine.js (turni, PA, danni, rottura: puro)  timing.js (finestre, ritmi: puro)  ai.js
    world/      map.js (nodi, regioni)  camp.js  bonds.js  save.js
    render/     battle.js  map.js  fade.js (desaturazione)  rig.js (personaggi SVG)
    ui/         dialogue.js  menus.js  journal.js
    audio.js  main.js  strings.js
  test/logic-test.mjs
tools/quality/e2e/ultimo-colore.spec.mjs
```

- **Logica pura** (`battle/engine.js`, `timing.js`, `world/*.js`): si testa in Node.
- **Hook di test `window.__colore`**: parate perfette, vittoria rapida, salto di capitolo.
- **Salvataggio** in `localStorage` (chiave `ultimo-colore-v1`) nei campi e a ogni nodo.

## 8. Fasi e verifiche

| Fase | Contenuto | Verifica |
|---|---|---|
| **1. Motore di combattimento** | turni, PA, danni, schivata e parata, rottura, contrattacco | test: un turno perfetto senza danni, PA corretti, nessun valore fuori scala, ogni nemico battibile con il gruppo base |
| **2. Tempo e ritmi** | finestre di difesa, sequenze di attacco, ritmi dei nemici, opzioni di accessibilità | test delle finestre per livello; prova a mano su telefono |
| **3. Gruppo e ricordi** | 5 personaggi + Ombra, abilità, 60 ricordi, apprendimento | test di bilanciamento: danni per turno per livello, nessuna combinazione infinita |
| **4. Mappa e campi** | 6 regioni, nodi, legami, salvataggio | E2E: da Velaria al primo boss e ritorno al campo, salvataggio dopo il ricaricamento |
| **5. Storia** | atti I–V, epilogo, 3 finali, diario | controllo dei testi IT/EN (stesse chiavi), E2E di un finale con l'hook |
| **6. Grafica e audio** | render Blender, rig, desaturazione, musica | audit-pages, controllo a 375 px e su desktop |
| **7. PWA e pubblicazione** | sw, manifest, icone, voce in `assets/js/catalog-data.js` (solo la mia riga), README | `check-syntax`, `run-tests`, `audit-projects`, `audit-pages`, kit `run-all`, E2E su chromium e mobile-chromium |

È il progetto più grande fatto finora: conviene pubblicarlo per atti (prima l'Atto I giocabile, poi gli altri).

## 9. Decisioni

- **Nome:** Ultimo Colore.
- **Durata:** 3–4 ore per l'intero gioco, pubblicate per atti. L'Atto I è il primo.
- **Grafica:** scene dipinte con Blender.
- **Difficoltà:** quattro livelli, compreso Racconto senza riflessi.
- **Lingue:** italiano e inglese.

- **Mondo aperto** (dopo la prima prova): al posto della rotta a nodi la laguna è un'unica mappa esplorabile, a piedi e in barca, con gli Sbiaditi visibili sulla mappa.

Stato e differenze dell'Atto I: vedi `games/ultimo-colore/README.md`.
