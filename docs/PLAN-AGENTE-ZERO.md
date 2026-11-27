# AGENTE ZERO — piano per `games/agente-zero/`

> Tu sei **Agente Zero**: numero 0, maglia rossa con i bordi bianchi, calzettoni bianchi e una fascia rossa in testa. Non sbaglia mai sotto pressione. Quasi mai. Prendi la palla, scorri il dito verso il canestro e tiri: arco, ferro, retina.
>
> **Genere:** arcade di tiro a canestro, PWA offline, mobile first (un dito), giocabile anche da tastiera.
> **Cartella:** `games/agente-zero/` (pubblicata da `scripts/build-site.mjs`).
> **Riferimenti interni:**
> - `games/baseball-pwa/`: proiezione 3D su canvas 2D, inquadratura verticale per iPhone;
> - `games/seba/`: logica pura testata in Node, hook di test, E2E;
> - `games/_kit/`: core (loop a passo fisso, RNG con seed), storage, i18n, audio, fx, pwa, test-harness, a11y.

---

## 0. Regole

1. **Il personaggio è originale.** "Agent Zero" è anche il soprannome di un ex giocatore NBA e il nome di un personaggio dei fumetti: Agente Zero è **un'altra persona**, con un aspetto, una storia e una voce nostri. Niente somiglianze con giocatori reali, niente squadre, loghi, maglie o arene reali (né NBA né altre leghe).
2. **Nessun marchio**: scarpe, palloni e sponsor sui cartelloni hanno nomi inventati.
3. **Nessun gioco d'azzardo, nessun acquisto in-app.** Si sblocca tutto giocando.
4. **Convenzioni del portfolio:**
   - solo percorsi relativi;
   - service worker con prefisso `agente-zero-` e stale-while-revalidate;
   - viewport senza `user-scalable=no`;
   - `[hidden]{display:none!important}`.
5. **Commit per fase. Mai push su `main` senza chiedere.**

## 1. Agente Zero

- **Aspetto:**
  - giocatore cartoon slanciato, pelle e capelli scelti dal giocatore (4 + 4 varianti);
  - canotta rossa con bordi e numero 0 bianchi, pantaloncini rossi con banda bianca laterale, fascia rossa, calzettoni bianchi, scarpe bianche con suola rossa;
  - disegnato a strati su canvas (busto, braccia, avambracci, mani, gambe), così le pose si animano senza sprite.
- **Animazioni:** palleggio d'attesa, raccolta, salto, rilascio con il polso che "chiude", atterraggio, esultanza (5, da sbloccare), delusione per l'air ball, "in fiamme".
- **Vista:** in terza persona da dietro le spalle, leggermente rialzata. Si vede Agente Zero in basso, il canestro in alto: l'arco del tiro si legge bene in verticale.
- **Voce:** frasi brevi scritte in nuvoletta, IT ed EN ("Zero errori.", "Lo sapevo.", "Il ferro era storto, giuro."), circa 120 battute per contesto: canestro pulito, ferro, tabella, errore, serie, tiro allo scadere.
- **Il filo della storia (leggero):** Agente Zero è un ragazzo cresciuto su un campetto di periferia che chiamano "il Bunker". Ogni capitolo della carriera è una "missione" in un posto nuovo, finché non arriva all'arena della finale. Dialoghi brevi tra un livello e l'altro con il coach (una signora ex playmaker) e con il rivale.

## 2. Tiro e controlli

- **Swipe (principale):**
  - tocchi la palla e scorri verso l'alto;
  - la direzione orizzontale dello swipe decide la mira;
  - la lunghezza e la velocità decidono la forza;
  - la curva dello swipe, se c'è, dà un po' di effetto laterale.
- **Tieni e rilascia (alternativa accessibile):** tieni premuto, una barra di forza sale e scende, rilasci nella zona verde. La mira segue una freccia che oscilla piano.
- **Tastiera:** frecce per mirare, spazio tenuto premuto per la forza, rilascio per tirare.
- **Aiuti regolabili:** traiettoria tratteggiata per i primi tiri (in Allenamento sempre attivabile), finestra di forza più larga in modalità facile.
- **Feedback:** vibrazione breve al rilascio e al canestro (se il telefono lo permette e se è attiva), rallentatore di mezzo secondo sul canestro pulito, scia della palla.

## 3. Fisica (pura, testata in Node)

- **Palla:** punto in 3D con raggio, gravità, piccolo attrito dell'aria, rotazione all'indietro (il backspin smorza i rimbalzi sul ferro e rende i tiri "morbidi").
- **Ferro:** anello approssimato con 24 punti, collisione sfera-segmento con restituzione e attrito.
- **Tabella:** piano con restituzione più alta; il quadrato bianco è disegnato, non ha fisica speciale.
- **Retina:** 6 × 8 punti con integrazione di Verlet, solo estetica, si muove quando la palla passa o la tocca.
- **Canestro valido:** la palla attraversa il piano del ferro scendendo e con il centro dentro il raggio. Si distinguono:
  - **pulito** (non ha toccato niente): bonus;
  - **ferro**, **tabella**;
  - **air ball**: non ha toccato niente e non è entrato.
- **Passo fisso a 120 Hz** con il loop del kit, così il risultato dipende solo da posizione, velocità e rotazione iniziali: lo stesso tiro dà lo stesso risultato su ogni telefono.
- **Ostacoli** che arrivano più avanti:
  - vento sui campi all'aperto (forza laterale costante, mostrata da una bandierina);
  - canestro che si muove a destra e sinistra;
  - mano del difensore che sale a tempo davanti al tiratore;
  - distanza e angolo variabili.

## 4. Modalità

| Modalità | Regole |
|---|---|
| **Allenamento** | Nessun tempo, scegli la posizione sul campo, traiettoria visibile, statistiche per zona |
| **Carriera "Operazione Zero"** | 6 capitoli × 6 missioni, 1–3 stelle per missione. Obiettivi diversi: segna X su Y, solo canestri puliti, serie di 5, tiro allo scadere, battere il rivale |
| **60 secondi** | Arcade a tempo, la distanza cresce ogni 5 canestri, serie che moltiplicano i punti |
| **Gara da tre** | 5 postazioni attorno all'arco × 5 palloni, l'ultimo di ogni carrello vale doppio; 60 secondi |
| **Z-E-R-O** | Sfida contro un avversario controllato dal gioco: chi segna decide il tiro, chi sbaglia la copia prende una lettera; chi completa Z-E-R-O perde |
| **Sfida del giorno** | Stessa sequenza di tiri per tutti in quel giorno (seed giornaliero del kit), record locale |

**I posti della carriera** (illustrati in prospettiva, giorno o notte):
1. il Bunker, campetto di periferia con la rete metallica;
2. la palestra della scuola, parquet consumato;
3. il tetto di un palazzo, con il vento;
4. il lungomare d'estate, al tramonto;
5. il palazzetto del torneo regionale;
6. l'arena della finale, luci e pubblico.

## 5. Progressione

- **XP e livelli** con `progression.js` del kit; le stelle della carriera sbloccano i capitoli.
- **"In fiamme":** dopo 3 canestri di fila la palla prende fuoco e vale doppio finché non sbagli.
- **Sbloccabili** (tutti estetici, nessun vantaggio):
  - varianti della maglia, sempre rosso e bianco (classica, a righe, retrò, notturna);
  - palloni (classico, da strada, dorato, a fiamme);
  - scarpe;
  - fasce;
  - esultanze.
- **Medaglie:** circa 30 (primo canestro pulito, 10 di fila, tiro da metà campo, Z-E-R-O senza perdere lettere, tutte le stelle di un capitolo…).
- **Statistiche:** percentuale per zona, serie migliore, tiri totali, puliti e ferri, mostrate come mappa di calore del campo.

## 6. Audio e grafica

- **Audio** (Web Audio, nessun file):
  - rimbalzo della palla;
  - "swish" della retina;
  - colpo sul ferro e sulla tabella;
  - sirena di fine tempo;
  - pubblico che cresce con la serie;
  - base hip hop/funk generativa per i menu e per le modalità a tempo.
- **Grafica:**
  - canvas 2D con la proiezione prospettica come nel baseball;
  - campo con le linee, ombra morbida della palla sul parquet, luci;
  - pubblico a sagome nelle arene;
  - schermo grande con il punteggio;
  - particelle per canestri e fiamme con `fx.js`.
- **Icona:** il numero 0 bianco su una palla stilizzata con fondo rosso, generata da script come per Seba.
- **Prestazioni:** canvas con DPR limitato a 2, 60 fps su un iPhone di fascia media, nessuna libreria esterna.

## 7. Architettura

```
games/agente-zero/
  index.html  styles.css  manifest.webmanifest  sw.js  README.md
  icons/ (svg + png 192/512 + maskable)
  js/
    main.js            avvio, router delle schermate, hook di test window.__zero
    physics.js         palla, ferro, tabella, rete, vento, rilevamento canestro (puro)
    shot.js            da gesto (swipe o barra) a velocità e rotazione iniziali (puro)
    modes/*.js         training, career, timed, three, zero, daily: regole e punteggio (puri)
    career.js          capitoli, missioni, stelle, dialoghi
    state.js           salvataggio, sblocchi, statistiche (chiave agente-zero-v1)
    render/camera.js   proiezione prospettica
    render/court.js    campi e scenografie
    render/player.js   rig di Agente Zero e pose
    render/hoop.js     tabella, ferro, retina
    input.js           swipe, tieni-e-rilascia, tastiera
    audio.js           effetti e musica generativa
    lines.js           battute IT/EN
    strings.js         interfaccia IT/EN (createI18n del kit)
  test/logic-test.mjs
```

- **Logica separata dal disegno:** `physics.js`, `shot.js` e `modes/*.js` non toccano il DOM e si testano in Node.
- **Hook di test `window.__zero`**: tiro con parametri esatti, avanzamento rapido del tempo, stato.
- **Accessibilità:** movimento ridotto (niente rallentatore e scuotimento), alto contrasto per palla e ferro, controlli alternativi, testo ingrandibile.

## 8. Fasi e verifiche

| Fase | Contenuto | Verifica |
|---|---|---|
| **1. Fisica** | `physics.js`, `shot.js`, rilevamento canestro | test: un tiro perfetto entra pulito, un tiro corto è air ball, un tiro sul ferro rimbalza, stesso input stesso risultato, niente palla che attraversa il ferro ad alta velocità |
| **2. Campo e tiro** | camera, campo, canestro, retina, input swipe e tastiera | prova a mano + screenshot a 375 px; E2E: un tiro via hook segna un punto |
| **3. Agente Zero** | rig, pose, animazioni, battute | pagina di prova con tutte le pose, screenshot |
| **4. Modalità** | Allenamento, 60 secondi, Gara da tre, Z-E-R-O, Sfida del giorno | test dei punteggi e delle regole di ciascuna; E2E di una partita per modalità |
| **5. Carriera** | 6 capitoli, 36 missioni, dialoghi, posti | test degli obiettivi e delle stelle; E2E: completare la prima missione e sbloccare la seconda |
| **6. Progressione e audio** | sblocchi, medaglie, statistiche, effetti, musica | E2E: sblocco di una maglia e cambio maglia; salvataggio che resta dopo il ricaricamento |
| **7. PWA e pubblicazione** | `sw.js`, manifest, icone, voce in `assets/js/catalog-data.js` (solo la mia riga), README | `check-syntax`, `run-tests`, `audit-projects`, `audit-pages`, kit `run-all`, E2E `tools/quality/e2e/agente-zero.spec.mjs` su chromium e mobile-chromium |

## 9. Decisioni

- **Vista:** terza persona da dietro le spalle.
- **Storia:** il ragazzo del Bunker con le "missioni" del coach.
- **Aspetto:** personalizzabile (pelle, capelli, colore dei capelli), maglia sempre rossa e bianca.
- **Lingue:** italiano e inglese.
