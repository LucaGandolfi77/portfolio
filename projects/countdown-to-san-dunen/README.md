# Countdown to San Dunén 🚲

Il countdown **goliardico** al **9 ottobre**, giorno di **San Donnino**, patrono di **Fidenza**.

Trenta giorni di attesa, una casella al giorno numerata da **-30** a **0**, e il racconto di cosa
succede il giorno della festa: **otto tappe in bicicletta** da **Zheng** al **Duomo**, passando per
i bar del centro e per il **tendone di San Donnino**.

> «Il tendone non giudica. Il tendone è casa.»

**HTML, CSS e JavaScript puri. Nessuna build, nessuna dipendenza.** La cartella che vedi *è* il sito:
si copia su un server statico e funziona, in qualsiasi sottocartella.

---

## 1. Avviarla

I moduli JavaScript richiedono un indirizzo `http://` o `https://` (con doppio clic il browser li
blocca). Basta un server statico:

```bash
cd projects/countdown-to-san-dunen
python3 -m http.server 5180     # oppure: npm start
```

Poi apri **http://localhost:5180**.

> Da VS Code: `Cmd+Shift+P` → **Tasks: Run Task** → **san-dunen: server statico**.

### Se resta su «Sto gonfiando le gomme…»

Dopo 5 secondi compare da sola una spiegazione. Le cause sono due: stai aprendo il file con doppio
clic (`file://`), oppure manca un file nella cartella `js/`.

---

## 2. Pubblicarla

Non serve niente di speciale: è un sito statico con **tutti i percorsi relativi**. Il workflow della
repo pubblica già l'intera root, quindi andrà online da sola su:

```
https://lucagandolfi77.github.io/portfolio/projects/countdown-to-san-dunen/
```

**Dopo ogni modifica, cambia `CACHE_VERSION` in cima a `sw.js`** (es. da `'sd-v1'` a `'sd-v2'`):
è così che i telefoni che hanno già installato la PWA scaricano la versione nuova.

---

## 3. Installarla su iPhone

Safari → **Condividi** → **Aggiungi a Home** → **Aggiungi**. Si apre a tutto schermo e funziona
anche senza rete dopo la prima visita.

---

## 4. Il percorso del 9 ottobre

Le tappe stanno in `js/data/event.js` (array `PERCORSO`), così si cambiano senza toccare l'interfaccia:

| # | Tappa | Ruolo |
| --- | --- | --- |
| 1 | **Zheng** | Partenza — ritrovo, bici in fila, controllo gomme |
| 2 | **Bar Raffa** | Tappa 1 |
| 3 | **La Palta** | Tappa 2 |
| 4 | **Nuovo** | Tappa 3 |
| 5 | **La Strega** | Tappa 4 — da qui in poi si canta |
| 6 | **Scarlet** | Tappa 5 — ultima tappa dei bar, in Piazza Duomo |
| 7 | **Tendone di San Donnino** | Rifocillamento |
| 8 | **Davanti al Duomo** | Gran finale |

Ogni tappa ha un `ruolo`, una `nota` (la riga seria) e un `commento` (la battuta).

---

## 5. La festa: chi era San Donnino

I testi stanno in `js/data/event.js` (`SANTO`, `FESTA`). In sintesi, e sono cose vere:

- **Donnino** fu un martire cristiano del **III secolo d.C.** Nato a Roma da famiglia nobile, arrivò a
  fare il *primus cubicularium* dell'imperatore Massimiano: il custode della corona imperiale.
- Entrato in contatto con i cristiani e convertitosi, fu destituito e tentò la fuga verso Roma.
  Raggiunto dalle truppe imperiali presso l'antico **vicus Fidentia**, fu **decapitato il 9 ottobre
  del 293** sulle rive del torrente **Stirone**, presso un ponte romano.
- La tradizione racconta il miracolo: il corpo si alzò, **attraversò il torrente con la propria testa
  in mano** e si coricò sull'altra riva. Oggi riposa in un'**urna di vetro e argento** sotto l'altare
  della **cripta del Duomo di Fidenza**.
- Era invocato come taumaturgo: guariva dal **morso degli animali rabbiosi e velenosi**.
- Il **9 ottobre** è il *dies natalis* del patrono: la città lo ricorda con un **solenziale Pontificale
  in Cattedrale**, officiato dal vescovo con tutto il clero della Diocesi, e tradizionalmente con una
  **grande fiera con attrazioni**.

Fonti: [Diocesi di Fidenza](https://www.diocesifidenza.it/cattedrale/s-donnino-martire/) e
[Comune di Fidenza](https://www.comune.fidenza.pr.it/).

---

## 6. Le caselle

31 caselle, una per giorno, dal **9 settembre** al **9 ottobre**. Il numero grande è l'**offset**:
`-30` è il primo giorno, `0` è il giorno della festa.

- Le caselle **future** sono visibili, belle e misteriose, ma non si aprono: se ci provi ricevi una
  risposta gentile e poco rispettosa.
- Le caselle **già lette** restano segnate (`localStorage`), anche dopo aver chiuso l'app.
- Il **micro-rituale** compare la prima volta che apri una casella — e negli ultimi tre giorni anche
  dopo. In ogni caso lo puoi **riascoltare quando vuoi** dal pulsante «Rivedi il rituale».
  **Ogni casella ha il suo**, diverso da tutti gli altri: 31 frasi brevi (40-61 caratteri) pensate
  per stare a schermo 3,4 secondi. Non sono massime da poster: sono piccoli gesti da fare.
- Il **9 ottobre** la home cambia atmosfera: celebrazione a schermo intero, coriandoli e la casella
  `0` marcata **SI BEVE**.
- Se apri l'app **prima del 9 settembre**, il countdown avvisa che non è ancora iniziato.

---

## 7. I 31 rituali

Ogni casella ha il suo, e sono tutti diversi. Alcuni esempi:

| Casella | Rituale |
| --- | --- |
| `-30` | Respira. Controlla le gomme. Ricorda dove hai messo il casco. |
| `-24` | Bevi un bicchiere d’acqua. Seriamente. Adesso. |
| `-19` | Chiudi gli occhi. Senti l’odore del fritto del tendone. |
| `-14` | Ripeti il percorso: Zheng, Raffa, La Palta, Nuovo… |
| `-7` | Alza la testa e cerca il Duomo. Anche da lontano. |
| `-1` | Un respiro. Le gomme a posto. Domani si fa. |
| `0` | Respira. Guarda la compagnia. Sorridi. È il vostro giorno. |

Stanno in `js/data/messages.js`, nel campo `ritual` di ogni messaggio. I test verificano che ci siano
tutti, che siano tutti diversi e che restino **corti**: un rituale troppo lungo non si fa in tempo a
leggerlo prima che arrivi il messaggio.

> Il campo `FALLBACK_RITUAL` esiste ancora come rete di sicurezza per una casella aggiunta senza
> rituale, ma nessuna delle 31 lo usa — e c'è un test che lo controlla.

---

## 8. Come cambiare i contenuti

| Cosa vuoi cambiare | Dove |
| --- | --- |
| I testi delle 31 caselle | `js/data/messages.js` |
| Le tappe del giro | `PERCORSO` in `js/data/event.js` |
| Storia del Santo, fiera, Duomo | `SANTO` e `FESTA` in `js/data/event.js` |
| Frasi sotto il titolo, footer, gran finale | `js/data/event.js` |
| La data della festa | `TARGET_MONTH` / `TARGET_DAY` in `js/utils/dates.js` |
| I colori | i token `--wine`, `--amber`, `--cream` in `styles/globals.css` |

Il numero di caselle si adatta da solo: la finestra è di 30 giorni prima della festa più il giorno
stesso, e l'ultima casella è **sempre** il 9 ottobre.

---

## 9. Test

```bash
npm test                          # 31 test
node --test tests/*.test.js       # senza npm
```

Coprono la logica delle date (finestra dal 9/9 al 9/10, offset da -30 a 0, stati, mezzanotte, ora
legale), i contenuti (le otto tappe nell'ordine giusto, la storia del Santo, i testi tutti diversi) e
il tono (che è goliardico ma non invita a esagerare, e che la regola «chi guida non beve» c'è sempre).

---

## 10. Note tecniche

- **Percorsi relativi ovunque**: funziona dalla radice di un sito o da una sottocartella a qualsiasi
  profondità, senza configurazione.
- **Animazioni tutte in CSS**: nessuna libreria. Un principio applicato ovunque, nato da bug reali:
  **nessun contenuto da leggere parte da `opacity: 0`**. Se un'animazione non parte, un testo
  invisibile è un bug; un testo che entra senza dissolvenza è solo meno elegante.
- **Gli elementi in uscita non rubano i tocchi**: modale, celebrazione, toast e banner hanno
  `pointer-events: none` mentre escono, altrimenti per ~240 ms coprirebbero lo schermo e
  inghiottirebbero il tocco successivo (su iOS si nota moltissimo).
- **Guardia anti doppio tap**: i tocchi sul velo vengono ignorati per i primi 350 ms dall'apertura,
  altrimenti un doppio tap rapido apriva e richiudeva la modale in un lampo. La misura usa
  `performance.now()`, che è monotono.
- **Service worker scritto a mano** (~100 righe, senza Workbox): precache del guscio e uso offline.
- **Accessibilità**: ogni casella è un `<button>` con `aria-label` descrittivo, la modale è un
  `role="dialog"` con focus trap e chiusura con `Esc`, i toast sono una live region, le aree di tocco
  sono almeno 44×44 px, e `prefers-reduced-motion` spegne tutte le animazioni lasciando l'app
  completamente usabile.

---

## 11. La regola seria

In mezzo a tutta la goliardia, una cosa non è uno scherzo: **in bici si torna sempre, in macchina no.
Se guidi, non bevi.** Bevi acqua, mangia qualcosa, metti le luci. Il Santo era quello che guariva
dal morso degli animali rabbiosi — non dagli incidenti stradali.

---

*Otto tappe · due ruote · un fegato* 🍻
