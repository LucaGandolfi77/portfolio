# AGENTE ZERO — modalità «Bomba» (piano)

> Dopo ogni canestro Agente Zero si fa una bomba: fa cadere il bicchierino di amaro nel bicchiere di energy drink e lo butta giù. Poi torna a tirare, ma è sempre più ubriaco: la mira ondeggia, il campo gira, il canestro si sdoppia e la palla in volo non va dritta.
>
> **Dove:** una nuova modalità dentro `games/agente-zero/`, accanto alle sei esistenti. Il resto del gioco resta per tutti.
> **Riferimenti interni:** `games/seba/` (avviso 18+, tono satirico, sbornia proporzionale), `games/agente-zero/js/{physics,shot,modes,game}.js`.

---

## 0. Regole

1. **Nessun marchio reale.** Niente nomi, etichette, colori o forme di liquori o energy drink esistenti, né il nome del cocktail che ne deriva. Il drink si chiama **«Bomba Zero»**: un bicchierino di **Amaro Nebbia** (inventato) dentro una lattina di **Fulmine** (energy drink inventato). Disegni originali, niente cervi né tori.
2. **18+ solo per questa modalità.** La prima volta che la apri compare un avviso a scelta (Sì, ho 18 anni / No): se rispondi No, la modalità resta chiusa e il resto del gioco funziona come prima. Nel catalogo si aggiunge il tag `18+`.
3. **Tono:** satira, come Seba. Bere non dà poteri: ogni bomba rende più difficile tirare e alla fine Zero crolla. Niente consigli, niente prediche, nessun legame con soldi veri.
4. Tutto resta **deterministico e testabile**: l'ebbrezza è una funzione del tempo e del livello, non del caso.

## 1. Il giro

1. **Tiro.** Se è canestro, parte la bomba (circa 4 secondi). Se sbagli, si tira di nuovo senza bere.
2. **Far cadere il bicchierino.** Il bicchierino oscilla sopra la lattina aperta, a destra e a sinistra. Tocchi per lasciarlo cadere:
   - **centrato:** «plof», schiuma, si va avanti;
   - **sul bordo:** schizzi ovunque, si beve lo stesso, ma la bomba vale meno;
   - più sei ubriaco, più il bicchierino oscilla veloce e largo.
3. **Bere.** Tieni premuto finché il bicchiere è vuoto. In alternativa puoi inclinare il telefono, se lo attivi nelle impostazioni (su iPhone serve il permesso al sensore di movimento). Agente Zero alza il gomito, gorgoglia e poi fa un rutto o un singhiozzo.
4. **Si torna in campo**, un po' più storti.

## 2. Ebbrezza (0–100)

- **Sale** di 18 punti per ogni bomba (12 se il bicchierino è finito sul bordo e mezzo drink si è perso).
- **Scende** di 1 punto ogni 2 secondi di gioco.
- A **100** Agente Zero crolla e la partita finisce: lo vedi addormentato sotto il canestro, con il pallone come cuscino.

| Livello | Nome | Cosa succede |
|---|---|---|
| 0–19 | Lucido | niente |
| 20–39 | Allegro | la freccia di mira ondeggia piano, la telecamera dondola appena |
| 40–59 | Brillo | ondeggiamento più largo, la forza tremola, la palla in volo curva un po' |
| 60–79 | Sbronzo | il canestro si sdoppia (due immagini che si avvicinano e si allontanano), singhiozzi |
| 80–99 | Distrutto | il campo gira, la palla fa un'esse in volo, i controlli a volte sono al contrario per un attimo |

## 3. Perché la traiettoria gira

Tre effetti, tutti calcolati dal livello e dal tempo.

1. **Mira che ondeggia.** Al momento del tiro, alla mira dello swipe si somma un errore a forma di otto (curva di Lissajous):
   - l'ampiezza cresce con il livello;
   - la velocità cresce poco a poco;
   - si vede come una freccia di mira e una scia tratteggiata che girano davanti a Zero.
   
   **Il trucco per chi gioca:** tirare quando la freccia passa al centro. È la stessa idea della mano del difensore: aspettare il momento giusto.
2. **Forza che tremola.** Un piccolo errore sulla forza, più lento della mira, più un «singhiozzo» a scatti: un colpo secco programmato ogni tot secondi, che ti accorci se tiri proprio in quell'istante.
3. **Palla che curva in volo.** Dal livello 40 la fisica aggiunge una piccola spinta laterale che cambia verso durante il volo:
   - la palla disegna un'esse;
   - finisce nella stessa funzione `simulate()`, come il vento, quindi lo stesso tiro dà sempre lo stesso risultato e i test restano validi.

**Solo grafica, nessun effetto sul tiro:**
- la telecamera che dondola;
- il canestro doppio (disegnato due volte con trasparenza);
- la vignetta scura ai bordi;
- i colori un po' più saturi.

Con **«Meno movimento»** attivo, questi effetti diventano un ondeggiamento leggero e il campo non gira.

## 4. Punteggio

- Ogni canestro vale i soliti 2 o 3 punti, **moltiplicati per il livello di ebbrezza**: ×1 da lucido, fino a ×3 da distrutto. Bere tanto rende, ma è più facile sbagliare.
- Una **bomba centrata** dà +1 punto.
- **Partita:** 90 secondi o fino al crollo. Conta il punteggio, più il bonus «in piedi» se arrivi alla sirena senza crollare.
- **Medaglie nuove** (6):
  - prima bomba;
  - 10 bombe in una partita;
  - canestro da distrutto;
  - finire la partita sopra 90 senza crollare;
  - bicchierino sempre centrato;
  - «Acqua minerale» (finire senza bere niente).

## 5. Architettura

```
games/agente-zero/js/
  drunk.js          puro: livello, salita e discesa, wobble(t, livello) → {aim, power, sway, double, flip}, crollo
  bomb.js           puro: posizione del bicchierino nel tempo, esito della caduta (centrato, bordo), progresso del bere
  physics.js        + forza laterale "ebbrezza" opzionale nell'env (come il vento), con fase e ampiezza
  modes.js          + modalità 'bomba': timer, moltiplicatore, crollo, bonus
  render/bomb.js    la scenetta del drink su canvas: lattina, bicchierino, schiuma, braccio che beve
  render/drunk.js   effetti a schermo: dondolio, canestro doppio, vignetta, rotazione
  game.js           nuova fase 'drink' tra un canestro e il tiro dopo
  audio.js          + «plof», frizzante, sorsi, rutto, singhiozzo, musica rallentata e distorta col livello
  state.js, strings.js, lines.js   + medaglie, testi IT/EN, battute da ubriaco (circa 60)
```

## 6. Fasi e verifiche

| Fase | Contenuto | Verifica |
|---|---|---|
| **1. Logica** | `drunk.js`, `bomb.js`, deriva in `physics.js`, modalità in `modes.js` | test: livello sempre in 0–100, discesa nel tempo, crollo a 100; a livello 0 lo stesso tiro di oggi; la deriva rende curva la traiettoria ma tirando al momento giusto si segna a ogni livello sotto 100; stesso tiro, stesso risultato |
| **2. Bomba** | scenetta su canvas, tocco per far cadere, tieni premuto per bere, inclinazione opzionale | E2E: canestro → scenetta → drink → livello sale → si torna in campo |
| **3. Effetti** | freccia che ondeggia, dondolio, canestro doppio, rotazione, «Meno movimento» | screenshot a 0, 40, 80; controllo che con «Meno movimento» il campo non giri |
| **4. Avviso e catalogo** | avviso 18+ della modalità, tag `18+`, medaglie, testi, README | E2E: con «No» la modalità resta chiusa e le altre funzionano; `check-syntax`, `run-tests`, `audit-pages`, E2E su chromium e mobile-chromium |

## 7. Decisioni

- **Modalità separata** con avviso 18+.
- **Bere è obbligatorio** dopo ogni canestro.
- **Si beve inclinando il telefono**; tenere premuto resta come ripiego (computer, sensore assente o permesso negato).
- **A 100 si crolla** e la partita finisce. (La risposta «Si» era ambigua: ho preso la prima opzione. Per far rialzare Zero basta cambiare `applyBomb` in `js/modes.js`.)
