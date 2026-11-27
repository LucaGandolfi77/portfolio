# SEBA — piano per `games/seba/`

> Un animaletto da accudire, ma è un barista. Seba è un piccolo mostriciattolo tondo con la cresta, il gilet e il papillon storto. Fa i turni dietro il bancone, si paga i voli con le mance, gira il mondo da un rave all'altro e chiude sempre con l'after. È pazzo, affettuoso e non dorme mai abbastanza.
>
> **Genere:** virtual pet satirico per adulti (18+), PWA offline, mobile first.
> **Cartella:** `games/seba/` (pubblicata da `scripts/build-site.mjs`).
> **Riferimenti interni:** `games/bar-blu/` (ES module vanilla, audio generativo, salvataggi, E2E), `games/_kit/` (i18n, storage, pwa, test-harness, a11y).

---

## 0. Regole

1. **Il gioco è originale.** Il genere e le meccaniche (bisogni che calano, stanze, minigiochi, monete, vestiti) sono di tutti. Nome, aspetto, stanze, suoni e interfaccia di giochi esistenti no: niente blob marrone, niente icone o layout copiati.
2. **Nessun marchio reale**: alcolici, sigarette, club e festival hanno nomi inventati. Le città vere vanno bene.
3. **Tono:** satira affettuosa. Il gioco non fa la predica e non glorifica: gli eccessi hanno conseguenze comiche e visibili (sbornia, tosse, occhiaie, figuracce) e Seba se la cava sempre con acqua, cibo e sonno. Nessun meccanismo di gioco d'azzardo con soldi veri, nessun acquisto in-app.
4. **18+ dichiarato**: avviso all'avvio (una volta sola) e un tag nel catalogo.
5. **Convenzioni del portfolio:**
   - solo percorsi relativi;
   - cache del service worker con prefisso `seba-` e stale-while-revalidate come Bar Blu;
   - viewport senza `user-scalable=no`;
   - `[hidden]{display:none!important}`.
6. **Commit per fase. Mai push su `main` senza chiedere.**

---

## 1. Seba

- **Aspetto:**
  - una pallina di pelo arancio-limone, alta come un bicchiere da long drink, con cresta da punk, baffetti e gilet nero;
  - il papillon si sposta col suo umore;
  - disegnato in SVG procedurale a strati: corpo, occhi, palpebre, bocca, cresta, braccia e accessori, così si animano le espressioni senza sprite.
- **Espressioni** (circa 12): felice, gasato, brillo, sbronzo, post-sbornia, assonnato, annoiato, affamato, schifato, tosse, innamorato, "in botta da after".
- **Voce:** borbottii sintetizzati con Web Audio (sillabe casuali con il pitch che segue l'umore) più frasi scritte nelle nuvolette. Il dialetto è milanese-romagnolo inventato, non un accento reale preciso.
- **Personalità** (generatore di battute per contesto, circa 300 frasi IT ed EN):
  - risponde a come lo tratti;
  - commenta i posti dove l'hai portato;
  - racconta storie assurde delle notti passate, ricordate da un registro eventi.

## 2. Bisogni (0–100, calano in tempo reale)

| Bisogno | Cosa lo alza | Cosa succede se va a zero |
|---|---|---|
| **Sete** | drink, birra, acqua | Seba si affloscia, niente minigiochi di festa |
| **Fumo** | sigaretta, sigaro, cicca alla menta (sostituto più lento) | nervoso: le battute diventano acide e le mance calano |
| **Fame** | cucina, kebab delle 4, toast del bar | stomaco che brontola, l'alcol "sale" il doppio |
| **Sonno** | divano, letto, pisolino sul bancone | occhiaie, input dei minigiochi rallentati |
| **Festa** | rave, minigiochi, musica | noia: Seba fissa il muro e sospira |
| **Igiene** | doccia, deodorante, cambio maglietta | nuvoletta verde, i buttafuori non lo fanno entrare |

**Stati nascosti** (equilibrio, non punizione):
- **Tasso** (0–100):
  - sale con i drink e scende col tempo, l'acqua e il cibo;
  - sopra 60 "brillo": battute migliori, controlli che ondeggiano;
  - sopra 85 "sbronzo": rischio di figuraccia;
  - il giorno dopo arriva la sbornia, proporzionale al picco.
- **Polmoni** e **Fegato** (0–100):
  - calano piano con gli eccessi e risalgono con sonno, acqua, cibo e giornate tranquille;
  - se sono bassi, la sbornia dura di più e arriva la tosse.
  - Non si muore mai: al massimo Seba "va in letargo" per mezza giornata e si risveglia con una frase memorabile.
- **Umore**: media pesata dei bisogni. Decide le espressioni, le mance e le battute.

**Tempo:**
- Il calo è reale e si recupera al ritorno nell'app, con un tetto di 12 ore e un calo più lento mentre Seba dorme.
- Il giorno e la notte seguono l'orologio del telefono:
  - i rave aprono dopo le 23;
  - l'after va dalle 5 alle 11;
  - i turni al bar si fanno di pomeriggio e sera.

## 3. Posti

**A casa** (scorrimento orizzontale tra le stanze):
1. **Il Bancone**: il bar sotto casa, dove lavora. Lavorare qui è il minigioco "Turno": fa guadagnare mance e alza la festa.
2. **La Cucina**: frigo e dispensa; il cibo si trascina nella bocca.
3. **Il Bagno**: doccia con le bolle, specchio per i vestiti.
4. **Il Divano**: luce spenta, sonno, sogni (piccole scene casuali).
5. **Il Balcone**: dove fuma; ha un panorama che cambia con la città in cui si trova.

**In giro per il mondo** (mappa a cartolina, il volo costa mance; ogni città ha sfondo, musica, bevanda tipica inventata e un evento):
- Milano, Navigli: aperitivo infinito;
- Berlino: un capannone techno con una fila di tre ore;
- Ibiza: rave in spiaggia al tramonto;
- Amsterdam;
- Lisbona;
- Tokyo: un izakaya minuscolo con il karaoke;
- Goa;
- Città del Messico;
- Rio a Carnevale;
- Islanda: un rave sotto l'aurora;
- Bangkok;
- New York: un loft;
- Detroit;
- Rimini.

Si sbloccano con i livelli. In ogni città c'è il **Rave** (la notte) e poi l'**After** (l'alba, in un posto sempre più assurdo: un tetto, una lavanderia, la casa di uno sconosciuto con un pappagallo).

## 4. Minigiochi (6, tutti con mance e livelli)

1. **Turno al bancone (mixology)**: i clienti ordinano e tu componi il cocktail toccando bottiglie, ghiaccio e shaker a ritmo. Ci sono ricette inventate, con un ricettario sbloccabile.
2. **Consolle**: rhythm game sulle tracce techno generative della città, a 4 corsie.
3. **Pista**: Seba balla in mezzo alla folla. Schivi i ballerini molesti e prendi i bicchieri d'acqua (che abbassano il tasso).
4. **Accendino nel vento**: tieni premuto per proteggere la fiamma dal vento del balcone. Si gioca anche con la cicca alla menta, in versione "cerca il pacchetto nelle tasche".
5. **La strada di casa all'alba**: endless runner nella città dell'after. Raccogli il kebab, evita i piccioni e i tram. Da sbronzo i controlli sono invertiti a tratti.
6. **Figuracce**: quiz veloci a scelta multipla in situazioni assurde ("Il DJ ti passa le cuffie. Cosa fai?"). Le risposte finiscono nel registro delle storie.

## 5. Economia e progressione

- **Mance** come unica moneta: si guadagnano col turno, i minigiochi, gli eventi e le "storie leggendarie". Si spendono in drink, sigarette, cibo, voli, ingressi e vestiti.
- **Livello Seba** (XP da tutto). Sblocca città, ricette, vestiti e stanze.
- **Guardaroba**, circa 60 pezzi a strati SVG: occhiali da sole a goccia, cappellini, giacche da rave, mantelli, braccialetti fluo, la tuta da after.
- **Il Registro delle notti**: diario a cartoline come in Bar Blu. Ogni rave e ogni after lascia una cartolina generata con il posto, il look di Seba, la frase migliore e la data. Ci sono anche gli **achievement** (circa 40, ironici).
- **Nessuna pubblicità né acquisto in-app.**

## 6. Architettura

```
games/seba/
  index.html  styles.css  manifest.webmanifest  sw.js  README.md
  icons/ (svg + png 192/512 + maskable)
  js/
    main.js            avvio, loop, router delle scene, hook di test window.__seba
    state.js           stato puro: bisogni, stati nascosti, economia, tick(dt), catchUp(ms)
    rules.js           tabelle: consumabili, calo per bisogno, soglie, sbornia
    seba/rig.js        SVG procedurale a strati + espressioni + animazioni idle
    seba/lines.js      battute per contesto (IT/EN) + scelta pesata
    seba/voice.js      borbottii Web Audio
    places/home.js     le 5 stanze
    places/world.js    mappa, voli, città (dati in places/cities.js)
    games/*.js         6 minigiochi, ognuno con start({root, state, audio}) → risultato
    audio/music.js     techno/house/ambient generativa per città e ora
    journal.js         cartoline + achievement
    strings.js         IT/EN (createI18n dal kit)
  art/                 sfondi (opzionali, webp) con fallback a gradienti
  blender/             script per gli sfondi delle città (opzionale, come Bar Blu)
  test/logic-test.mjs
```

- **Logica pura separata dal DOM** (`state.js` e `rules.js`): si testa in Node con il test-harness del kit.
- **Rendering:**
  - le stanze sono layer DOM/CSS con illustrazioni SVG;
  - i minigiochi usano canvas 2D;
  - gli sfondi delle città, se faccio i render Blender come in Bar Blu (Cycles, un preset per città, `cwebp`), arrivano come webp con fallback a gradiente.
- **Salvataggio:** `localStorage` tramite `storage.js` del kit, chiave `seba-v1`, scritto a ogni azione e ogni 30 secondi.
- **Il "mentre eri via"**: al rientro una schermata riassume cosa ha combinato Seba da solo.
- **Accessibilità:**
  - movimento ridotto;
  - dimensione del testo;
  - modalità daltonici per gli indicatori;
  - tutti i minigiochi giocabili con un dito e da tastiera.

## 7. Fasi e verifiche

| Fase | Contenuto | Verifica |
|---|---|---|
| **1. Nucleo** | `state.js`, `rules.js`, calo, recupero offline, sbornia, salvataggio | `test/logic-test.mjs`: calo, tetto di 12 h, soglie, sbornia proporzionale al picco, niente valori fuori da 0–100, niente morte |
| **2. Seba** | rig SVG, 12 espressioni, idle, voce, battute | pagina di prova che mostra tutte le espressioni, screenshot |
| **3. Casa** | 5 stanze, drag del cibo e dei drink, doccia, sonno, balcone | E2E: nutrire, dar da bere, far dormire, ricaricare la pagina e controllare che lo stato resti |
| **4. Minigiochi** | i 6 giochi + mance + XP | test logici dei punteggi + E2E per un giro di ciascuno con l'hook di fast-forward |
| **5. Mondo** | mappa, 14 città, rave → after, eventi, musica per città | E2E: volo, rave, after, ritorno a casa; test dei costi e degli sblocchi |
| **6. Look e diario** | guardaroba, cartoline, achievement | E2E: vestire Seba, cartolina generata |
| **7. Grafica** | sfondi Blender opzionali, icone, rifinitura e animazioni | audit-pages, controllo visivo a 375 px e su desktop |
| **8. PWA e pubblicazione** | `sw.js` (prefisso `seba-`), manifest, voce in `assets/js/catalog-data.js` (solo la mia riga), README | `check-syntax`, `run-tests`, `audit-projects`, `audit-pages`, E2E `tools/quality/e2e/seba.spec.mjs` su chromium e mobile-chromium |

## 8. Domande aperte

- Seba resta un **mostriciattolo** o diventa un **omino** cartoon? Il piano assume il mostriciattolo, che è più "animaletto" e più originale.
- Fumo e alcol devono restare **bisogni obbligatori**, o meglio **voglie** che danno bonus ma non fanno soffrire se ignorate? Il piano li tratta come bisogni, con il sostituto alla menta come uscita.
- Le **lingue**: IT e EN come le altre? E le battute in dialetto inventato?
- Gli sfondi delle città: **render Blender** (più belli, più pesanti) o **solo SVG illustrati** (più leggeri, tutti coerenti con Seba)?
