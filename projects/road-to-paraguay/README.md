# Road to Paraguay 🛼

**Il diario segreto del Monza Precision Team**, in cammino verso i **Campionati del Mondo di
pattinaggio artistico a rotelle sincronizzato in Paraguay**, dove la squadra rappresenterà l'**Italia**
il **17 ottobre**.

Una **PWA mobile-first per iPhone**: un calendario d'attesa in stile diario segreto. Si apre ogni
giorno per una frase, un pensiero, una mini poesia o una piccola dose di motivazione — e per il
countdown che accompagna fino al giorno della gara.

> «Apri la tua casella di oggi. C'è qualcosa che ti aspetta.»

---

## In breve

**HTML, CSS e JavaScript puri. Nessuna build, nessuna dipendenza, nessun `npm install`.**

Questa è la caratteristica più importante del progetto: la cartella che vedi **è** il sito.
Si copia su un server statico e funziona — su GitHub Pages, Netlify, un hosting qualsiasi, o in
una sottocartella a caso, senza cambiare una riga.

| | |
| --- | --- |
| **Tecnologia** | HTML + CSS + JavaScript (moduli ES) |
| **Dipendenze** | nessuna |
| **Build** | nessuna |
| **Percorsi** | tutti relativi: funziona in qualsiasi sottocartella |
| **Test** | `npm test` (solo per i test: l'app non ne ha bisogno) |

---

## 1. Avviarla in locale

I moduli JavaScript richiedono un indirizzo `http://` o `https://`: aprendo `index.html` con doppio
clic (protocollo `file://`) il browser li blocca. Basta un server statico qualsiasi:

```bash
cd projects/road-to-paraguay

# con Python (già presente su macOS)
python3 -m http.server 5178

# oppure
npx serve .
```

Poi apri **http://localhost:5178**.

> Da VS Code: `Cmd+Shift+P` → **Tasks: Run Task** → **road-to-paraguay: server statico**
> (il task è in `.vscode/tasks.json`).

### Se la schermata resta su «Sto allacciando le ruote…»

Dopo 5 secondi compare da sola una spiegazione con i passaggi da controllare. Le cause sono quasi
sempre due:

1. **stai aprendo il file con doppio clic** (`file://`): i moduli ES non si caricano. Serve un
   server, anche solo `python3 -m http.server`;
2. **manca un file** nella cartella `js/`: apri la console del browser e leggi l'errore.

---

## 2. Pubblicarla

### GitHub Pages (come il resto del portfolio)

Non serve **nulla di speciale**: la cartella è già un sito statico. Il workflow della repo pubblica
l'intera root del repository, quindi l'app sarà subito online su:

```
https://lucagandolfi77.github.io/portfolio/projects/road-to-paraguay/
```

Tutti i percorsi sono relativi (`js/main.js`, `icons/...`, `manifest.webmanifest`), quindi funziona
a qualsiasi profondità senza configurazione.

### Un altro hosting

Copia la cartella dove vuoi. Due cose da tenere presenti:

- **HTTPS obbligatorio** perché il service worker e l'installazione funzionino (in locale
  `localhost` è considerato sicuro);
- se la sposti, non devi aggiornare nessun percorso.

### Dopo ogni modifica: aggiorna la cache

Chi ha già installato la PWA ha i file vecchi in cache. Quando pubblichi una modifica, **cambia
`CACHE_VERSION` in cima a `sw.js`** (es. da `'rtp-v1'` a `'rtp-v2'`): è così che i telefoni
scaricano la versione nuova invece di restare sulla copia salvata.

---

## 3. Installare su iPhone

1. Apri l'app in **Safari** (su iOS solo Safari può aggiungere PWA alla schermata Home).
2. Tocca **Condividi** (il quadrato con la freccia in su).
3. Scorri e scegli **Aggiungi a Home**.
4. Conferma con **Aggiungi**.

L'app comparirà come una vera icona, si aprirà a tutto schermo (`display: standalone`) e funzionerà
**anche senza rete** dopo la prima visita.

---

## 4. Struttura dei file

```text
projects/road-to-paraguay/
├── index.html                # la pagina: scheletro, meta iOS, icone, tema applicato subito
├── manifest.webmanifest      # manifest PWA (percorsi relativi)
├── sw.js                     # service worker scritto a mano (precache + offline)
├── package.json              # solo per `npm test`: l'app non lo usa
├── styles/
│   └── globals.css           # design system completo: palette, dark mode, animazioni, responsive
├── icons/                    # icone PNG + SVG (192, 512, maskable, apple-touch, favicon, splash)
├── js/
│   ├── main.js               # orchestrazione: stato, timer di mezzanotte, interazioni
│   ├── pwa.js                # registrazione del service worker
│   ├── data/
│   │   ├── event.js          # squadra, nazione, evento e testi del gran finale
│   │   └── messages.js       # i 31 testi delle caselle + findMessage()
│   ├── utils/
│   │   ├── dates.js          # tutta la logica temporale
│   │   ├── storage.js        # localStorage a prova di Safari iOS
│   │   └── dom.js            # piccoli aiutanti (querySelector, creazione elementi, tricolore)
│   └── ui/
│       ├── countdown.js      # countdown live + modalità "è arrivato il giorno"
│       ├── calendar.js       # le caselle, i loro 4 stati, il progresso
│       ├── modal.js          # la card del messaggio + micro-rituale
│       ├── celebration.js    # celebrazione del 17 ottobre con coriandoli
│       ├── toast.js          # messaggi temporanei (live region)
│       ├── theme.js          # tema chiaro/scuro
│       ├── music.js          # colonna sonora opzionale (Web Audio, nessun file)
│       ├── eggs.js           # easter egg e modalità glitter
│       ├── decorations.js    # stelline e tracce decorative
│       ├── install.js        # suggerimento di installazione
│       ├── intro.js          # animazione di apertura
│       └── icons.js          # icone SVG in linea
└── tests/
    ├── dates.test.js         # test su date, calendario e casi limite
    └── content.test.js       # test su squadra, evento e contenuti
```

---

## 5. Come cambiare i contenuti

I testi delle caselle stanno in **`js/data/messages.js`**; le frasi di squadra, il footer e i testi
del gran finale in **`js/data/event.js`**. Nessuna logica in nessuno dei due.

```js
{
  day: 12,                     // vedi la tabella qui sotto
  anchor: 'start',             // 'start' = `day` caselle dall'inizio (predefinito)
                               // 'end'   = `day` caselle dalla fine (1 = ultima)
  type: 'motivation',          // 'motivation' | 'poem' | 'thought' | 'funny'
  title: 'Le mani',            // riga breve sopra il testo
  message: 'C’è un momento…',  // il contenuto (usa \n per le poesie)
  emoji: '🤝',
  ritual: 'Respira…',          // micro-rituale, se vuoi uno su misura per quel giorno
}
```

### Perché esiste `anchor`

La finestra del calendario finisce **sempre** il 17 ottobre e comincia 29 giorni prima. Se il diario
viene aperto il **17 settembre** le caselle diventano 31; in tutti gli altri casi sono 30.

Con una numerazione assoluta, con 30 caselle il gran finale finirebbe sulla casella 30 e il messaggio
del 17 ottobre non verrebbe **mai** mostrato. Per questo gli ultimi giorni sono ancorati alla fine:

```js
{ day: 1, anchor: 'end', title: '17 ottobre · Campionati del Mondo' }  // sempre l'ultima
{ day: 2, anchor: 'end', title: 'La notte prima' }                     // sempre la penultima
{ day: 3, anchor: 'end', title: 'Vigilia' }
{ day: 4, anchor: 'end', title: 'La valigia' }
```

> Non leggere mai `messages` direttamente: usa sempre **`findMessage(indice, totale)`**.
> I test verificano che copra ogni casella di entrambe le lunghezze, senza buchi né doppioni.

### Squadra, nazione ed evento

Tutto in **`js/data/event.js`**: `APP_NAME`, `EVENT`, `TEAM`, `TRICOLORE`, `AMBIENT_LINES`,
`FOOTER_LINES`, `FINALE_COPY`. Da lì si aggiornano in un colpo solo: intestazione, countdown,
casella del 17 ottobre, celebrazione, footer e titolo della pagina.

| Cosa | Dove |
| --- | --- |
| Nomi squadra / evento / luogo | `js/data/event.js` |
| Colori della bandiera | `TRICOLORE` in `event.js` + i token `--flag-*` in `globals.css` |
| Titolo e anteprima social | `index.html` (`<title>`, `og:*`) e `manifest.webmanifest` |
| Sigla sull'icona (MPT) | le icone sono già generate: per rigenerarle vedi il progetto `verso-il-17` |

---

## 6. Come cambiare la data finale

In `js/utils/dates.js`:

```js
export const TARGET_MONTH = 9;          // 9 = ottobre (i mesi partono da 0)
export const TARGET_DAY = 17;           // giorno del gran finale
export const CALENDAR_LENGTH = 30;      // caselle del percorso classico
export const MAX_CALENDAR_LENGTH = 31;  // tetto massimo, se si apre il diario in anticipo
```

Cambiando queste costanti cambia tutto in modo coerente: countdown, date delle caselle, vigilia,
gran finale e celebrazione. **I testi restano validi**, perché sono agganciati alla posizione della
casella e non a una data scritta a mano.

---

## 7. Test

I test riguardano la logica (date e contenuti), non l'interfaccia: girano con Node e **non servono
all'app per funzionare**.

```bash
npm test
# oppure, senza npm:
node --test tests/dates.test.js tests/content.test.js
```

Sono **37 test** e coprono, tra le altre cose:

- il target è il 17 ottobre dell'anno giusto, e il 17 ottobre stesso non slitta all'anno dopo;
- la finestra finisce sempre il 17 ottobre e **la casella di oggi esiste in ogni giorno del percorso**;
- le caselle sono consecutive, senza buchi, con l'ultima sempre il gran finale;
- gli stati `locked` / `today` / `past` rispettano la data reale, compreso il passaggio di mezzanotte;
- `addDays` attraversa il cambio di mese e di ora legale senza slittamenti di ora;
- **il gran finale è sempre l'ultima casella, con 30 o con 31 caselle**;
- ogni casella di ogni lunghezza ha il suo messaggio, senza buchi né doppioni;
- squadra, nazione, luogo e Mondiale sono davvero presenti nei testi;
- nessun testo promette una vittoria (scelta voluta).

---

## 8. Note tecniche

### Il micro-rituale, e perché si può sempre rivedere

Alla **prima** apertura di ogni casella compare un micro-rituale di pochi secondi
(«Respira. Metti giù le spalle. Ricorda perché hai iniziato.»), poi arriva il messaggio.
Negli ultimi giorni — vigilia e gran finale — il rituale si ripresenta a ogni apertura, perché
fa parte del momento.

Dal pulsante **«Rivedi il rituale»** si può comunque riascoltare **quante volte si vuole**,
anche su una casella già letta.

> Questa parte aveva un difetto: il testo del rituale e la decisione di mostrarlo erano la stessa
> variabile. Per una casella già letta quella variabile diventava `null`, e `null` serviva a due
> scopi diversi — quindi il pulsante restava **disabilitato** e il gestore usciva subito: il rituale
> si poteva vedere una volta sola. Ora sono due funzioni distinte: `ritualTextFor()` dice *cosa*
> dice il rituale (c'è sempre), `shouldShowRitualOnOpen()` dice *se* mostrarlo da solo.

### Gli elementi in uscita non devono rubare i tocchi

Quando la modale si chiude resta nel DOM ancora ~240 ms per l'animazione di uscita. Senza
`pointer-events: none` continuava a coprire tutto lo schermo e **inghiottiva i tocchi**: chiudendo
una casella e toccandone subito un'altra — o la stessa, per rileggerla — il tap andava perso.
Su iOS Safari si nota molto di più, perché il gesto è più lento e il paint può tardare.

Vale per tutti gli elementi che escono: modale, celebrazione, toast e banner di installazione.
Anche il segno della stellina trovata (`.daycard__found`) è un *fratello* della casella, non un suo
figlio: senza `pointer-events: none` copriva una piccola zona rendendola non toccabile.

### Percorsi relativi, sempre

Non c'è un solo percorso assoluto (`/qualcosa`) nel progetto. È ciò che permette di spostare la
cartella ovunque senza toccare niente: `manifest.webmanifest`, `sw.js` e tutti i moduli usano
percorsi relativi, e il service worker calcola il proprio scope da `self.registration.scope`.

### Animazioni in CSS, non in JavaScript

Tutte le animazioni sono CSS: entrance delle card, shimmer, alone della casella di oggi, rotazione
delle rotelle, coriandoli, scie luminose, transizioni di modale e celebrazione. Vantaggi: nessuna
libreria, frame gestiti dal browser, e funzionano anche se il JavaScript è lento.

Un principio applicato ovunque, nato da bug reali: **nessun contenuto da leggere parte da
`opacity: 0`**. Se un'animazione non parte (animazioni ridotte, scheda in background, frame non
prodotti) un testo invisibile è un bug, mentre un testo che entra senza dissolvenza è solo meno
elegante. Le entrance animano quindi solo la trasformazione.

### Il service worker è scritto a mano

`sw.js` fa due cose: precarica il guscio dell'app e serve le richieste con una strategia adatta a
un'app che cambia raramente (rete prima per le pagine, cache prima per le risorse). Sono ~100 righe
leggibili, senza Workbox. L'unica regola da ricordare è cambiare `CACHE_VERSION` a ogni modifica.

### Altre due accortezze nate da problemi reali

- **Contro il doppio tap su iOS.** Un doppio tap rapido apriva la modale e la richiudeva subito,
  perché il secondo tocco atterrava sul velo appena comparso. Ora i tocchi sul velo vengono
  ignorati per i primi 350 ms dall'apertura.
- **L'orologio usato per misurare è monotono.** Quella guardia usa `performance.now()` e non
  `Date.now()`: così non risente di cambi d'ora o dell'orologio di sistema.
- **Rete di sicurezza su `pageshow`.** Se iOS ripristina la pagina dalla cache di navigazione con
  una classe di blocco dello scroll rimasta appesa, viene ripulita: la pagina non resta immobile.
- **Il focus torna alla casella senza far saltare la pagina** (`focus({ preventScroll: true })`):
  un salto di scroll a ridosso del tocco successivo manderebbe il dito altrove.

### Accessibilità

- Ogni casella è un vero `<button>` con `aria-label` che ne descrive stato e data.
- La modale è `role="dialog"` con `aria-modal`, focus trap, chiusura con `Esc` e focus che torna al
  punto di partenza.
- I toast sono `role="status"` / `aria-live="polite"`.
- Aree di tocco di almeno **44×44 px** e focus state ben visibili.
- `prefers-reduced-motion` è rispettato fino in fondo: spariscono particelle, shimmer, coriandoli e
  tracce, le animazioni continue si fermano, e l'app resta **completamente utilizzabile**.

### Perché esiste anche `projects/verso-il-17`

È la stessa app scritta in React + TypeScript + Vite, con un build step. Questa versione statica
nasce per essere pubblicata senza tooling: se non ti serve più la versione React, puoi rimuoverla
(ricordati di togliere i suoi passi dal workflow `.github/workflows/deploy.yml`).

---

*Otto ruote · una squadra · infiniti ricordi* ✨
