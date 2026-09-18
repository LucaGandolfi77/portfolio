# Verso il 17 ottobre ✨

**Il diario segreto del Monza Precision Team**, in cammino verso i **Campionati del Mondo di
pattinaggio artistico a rotelle sincronizzato in Paraguay**, dove la squadra rappresenterà l'**Italia**
il **17 ottobre**.

Una **PWA mobile-first per iPhone**: un calendario d'attesa in stile diario segreto. Si apre ogni
giorno per una frase, un pensiero, una mini poesia o una piccola dose di motivazione — e per il
countdown che accompagna fino al giorno della gara.

> «Apri la tua casella di oggi. C'è qualcosa che ti aspetta.»

Squadra, nazione e competizione non sono decorazione: compaiono nell'intestazione (con il tricolore),
nel countdown, nella casella del 17 ottobre e nella celebrazione finale. Tutto è centralizzato in
`src/data/event.ts`, così i dettagli si aggiornano in un punto solo.

---

## Indice

1. [Cosa c'è dentro](#cosa-cè-dentro)
2. [Avviare il progetto](#1-avviare-il-progetto)
   - [Se la schermata resta su «Sto allacciando le ruote…»](#se-la-schermata-resta-su-sto-allacciando-le-ruote)
3. [Build di produzione](#2-build-di-produzione)
4. [Installare la PWA su iPhone](#3-installare-la-pwa-su-iphone)
5. [Struttura dei file](#4-struttura-dei-file)
6. [Scelte architetturali](#5-scelte-architetturali)
7. [Come cambiare i contenuti](#6-come-cambiare-i-contenuti)
8. [Squadra, nazione ed evento](#7-squadra-nazione-ed-evento)
9. [Come cambiare la data finale](#8-come-cambiare-la-data-finale)
10. [Test](#9-test)
11. [Accessibilità e prestazioni](#10-accessibilità-e-prestazioni)

---

## Cosa c'è dentro

**Il rituale quotidiano**

- **Countdown live** verso il 17 ottobre, basato sull'orologio reale del dispositivo (giorni, ore,
  minuti, secondi) che si aggiorna ogni secondo e si riallinea al ritorno in primo piano.
- **Calendario di 30 caselle** (31 se il diario viene aperto il 17 settembre): una per ogni giorno
  che porta al gran finale. L'ultima casella è **sempre** il 17 ottobre.
- **Sblocco automatico a mezzanotte**: le caselle future sono visibili, belle e misteriose, ma non
  apribili. Se l'app resta aperta, allo scoccare della mezzanotte la casella di oggi si apre da sola.
- **Stato persistente**: le caselle aperte restano tali tra una sessione e l'altra (`localStorage`).
- **Micro-rituale**: alla prima apertura di ogni casella appare per pochi secondi una frase lenta
  («Respira. Metti giù le spalle. Ricorda perché hai iniziato.»), poi arriva il messaggio.
- **Gran finale**: il 17 ottobre la home cambia atmosfera, l'intestazione si accende di un filo
  tricolore, parte una celebrazione a schermo intero con coriandoli, stelle e cuori, e il countdown
  lascia il posto a «È arrivato il giorno», al nome dei Campionati del Mondo, al Paraguay e alla
  squadra che rappresenta l'Italia.

**L'identità della squadra**

- Stemma con bandierina tricolore e nome **Monza Precision Team · Italia** in testata.
- Etichetta dell'evento sotto il countdown: **Campionati del Mondo · Paraguay**.
- La casella del 17 ottobre porta il chip **mondiale** e la firma dell'evento.
- Il 17 ottobre l'intestazione si accende con un filo tricolore.
- La celebrazione finale nomina evento, luogo, squadra e nazione, con coriandoli e striscia tricolore.
- Footer e icone dell'app (anello tricolore + sigla MPT) chiudono il cerchio.

**Dettagli che rendono l'app "viva"**

- Card di oggi con alone, shimmer, pulsazione delicata e micro-movimento al tocco.
- Modale che entra con una leggera rotazione 3D e un lampo di luce; il testo appare riga per riga.
- Illustrazione vettoriale di un pattino con le ruote che girano piano.
- Scia luminosa che attraversa lo schermo ogni tanto, come una traiettoria sulla pista.
- Sfondo materico: carta pregiata, grana finissima, puntini, bagliori soffusi.
- Toast gentili per le caselle bloccate («Ehi, piano! Questa sorpresa non è ancora pronta per te 🛼✨»).
- **Tema notte** automatico dal sistema, con interruttore manuale e scelta ricordata.
- **Colonna sonora opzionale** (parte solo dopo un tap, ed è una musichetta sintetizzata: nessun file audio).

**Easter egg discreti**

| Segreto | Come si trova |
| --- | --- |
| Modalità glitter | 5 tap sulle rotelle del pattino in testata (12 secondi di luccichio) |
| Stelline nascoste | 3 caselle (07, 16, 24) nascondono una stellina da toccare |
| La frase "curiosona" | la prima volta che si prova ad aprire una casella futura |
| Il finale segreto | viene registrato silenziosamente quando si arriva al 17 ottobre |

**Sicurezza dell'attesa**: il contenuto delle caselle future non viene mai mostrato e non è
recuperabile dal DOM — le caselle bloccate non contengono il testo del messaggio.

---

## 1. Avviare il progetto

Serve **Node 22.6 o superiore** (testato con Node 26). È il minimo perché Vite 8 richiede
`^20.19 || >=22.12` e i test usano `node --experimental-strip-types`, disponibile da Node 22.6.
Il requisito è dichiarato in `engines` dentro `package.json`.

```bash
cd projects/verso-il-17
npm install
npm run dev
```

Apri l'indirizzo che stampa Vite (di default `http://localhost:5178`).

> ⚠️ **Non aprire questo progetto con Live Server o un server statico**: vedi
> [la sezione qui sotto](#se-la-schermata-resta-su-sto-allacciando-le-ruote).

Per provarla dal telefono sulla stessa rete Wi-Fi, il server è già configurato con `host: true`:
usa l'indirizzo `http://<ip-del-computer>:5178` che compare nel terminale.

> **Nota**: in sviluppo il service worker è disattivato apposta, così l'hot reload non fa
> scherzi. Per provare l'installazione e il funzionamento offline serve la build di produzione.

---

### Se la schermata resta su «Sto allacciando le ruote…»

Succede quando la pagina viene aperta con un **server statico** invece che con Vite: Live Server di
VS Code (porta 5503), `python -m http.server`, oppure il doppio clic sul file.

Non è un bug: `index.html` carica `/src/main.tsx`, che è **TypeScript/JSX e deve essere compilato**.
Un server statico lo restituisce così com'è (o con il MIME type sbagliato), il browser rifiuta di
eseguirlo, e l'app non parte. Nella console vedi infatti `404` o
`Failed to load module script: Expected a JavaScript-or-Wasm module script`.

**Soluzione: usa Vite.**

```bash
cd projects/verso-il-17
npm install     # solo la prima volta
npm run dev     # oppure: npm start
```

Poi apri `http://localhost:5178`.

> Da VS Code: `Cmd+Shift+P` → **Tasks: Run Task** → **verso-il-17: dev server**.
> Il task è già configurato in `.vscode/tasks.json`, insieme a una configurazione di avvio
> (`launch.json`) che apre direttamente l'indirizzo giusto.

Dalla versione attuale, se l'app non riesce ad avviarsi la schermata **te lo dice**: dopo qualche
secondo compare un riquadro con i passaggi da seguire, invece di restare bloccata per sempre.

**Alternativa senza dev server:** pubblica la build.

```bash
npm run build
npm run preview     # http://localhost:4178
```

Se usi Live Server e vuoi comunque vederla, fai puntare la sua root a `projects/verso-il-17/dist`
dopo la build: lì ci sono `index.html`, `manifest.webmanifest` e le icone al posto giusto.

---

## 2. Build di produzione

```bash
npm run build
```

Genera `dist/` con:

```text
dist/
├── index.html
├── manifest.webmanifest        # manifest PWA (generato da vite-plugin-pwa)
├── sw.js                       # service worker Workbox (precache completo)
├── workbox-*.js
├── assets/index-*.css          # ~30 kB (7 kB gzip)
├── assets/index-*.js           # ~407 kB (129 kB gzip)
└── icons/                      # icone PNG, SVG, apple-touch-icon
```

Per vedere in locale esattamente quello che verrà pubblicato:

```bash
npm run preview
```

### Deploy su GitHub Pages

Il repository ha già un workflow che pubblica **l'intera repo** su GitHub Pages
(`.github/workflows/deploy.yml`). La PWA viene compilata dentro quel sito, in una sottocartella
dedicata:

```
https://lucagandolfi77.github.io/portfolio/verso-il-17/
```

**Non devi fare nulla a mano**: a ogni push su `main` il workflow

1. installa le dipendenze del progetto (`npm ci`);
2. esegue i test — se sono rossi il deploy si ferma, così l'app non finisce online rotta;
3. compila la PWA con `npm run build:pages`, che scrive in `/verso-il-17/` alla radice della repo;
4. rimuove `node_modules` dall'artefatto (sono centinaia di MB e non devono essere pubblicati);
5. carica tutto e pubblica.

#### Il percorso base (`base`)

Su GitHub Pages il sito vive in una sottocartella col nome della repository, quindi tutti i percorsi
devono essere prefissati. Vite lo gestisce con `base`, che qui si imposta con la variabile
`BASE_PATH`:

```bash
# in locale, per provare esattamente la build di Pages
npm run build:pages          # usa /portfolio/verso-il-17/
npx vite preview             # poi apri http://localhost:4178/portfolio/verso-il-17/

# il workflow invece lo ricava da solo dal nome della repo:
BASE_PATH=/<nome-repo>/verso-il-17/ npm run build:pages
```

La normalizzazione accetta indifferentemente `portfolio/x`, `/portfolio/x` o `/portfolio/x/`.

> Se rinomini la repository, **non serve cambiare nulla**: il workflow legge il nome da GitHub.
> Se invece sposti l'app in un'altra cartella, aggiorna il percorso in
> `.github/workflows/deploy.yml` (variabile `BASE_PATH`) e il default in `package.json`
> (`build:pages`).

#### Perché serve il `base` e cosa si romperebbe senza

Con `base: '/'` la pagina punterebbe a `/manifest.webmanifest` e `/icons/favicon.svg`, cioè alla
**radice del dominio** (`https://lucagandolfi77.github.io/`), dove non c'è nulla: 404 su tutte le
icone, manifest non trovato e PWA non installabile. Con il base corretto tutto diventa
`/portfolio/verso-il-17/...`.

Due dettagli che erano sbagliati e sono stati corretti:

- il `<link rel="manifest">` era scritto a mano: ora lo inietta il plugin con il percorso giusto,
  altrimenti Vite non lo riscriveva;
- i meta tag per lo schermo intero su iOS ora sono **due**, e devono restare entrambi:

  | Tag | A cosa serve |
  | --- | --- |
  | `mobile-web-app-capable` | nome standard, usato da Chromium/Android |
  | `apple-mobile-web-app-capable` | estensione Apple: è quella che iOS capisce |

  [Chromium avvisa in console](https://issues.chromium.org/issues/40333176) se trova solo il tag
  Apple senza quello standard: la correzione è **aggiungere** il tag standard, non togliere quello
  Apple. Rimuovendo quest'ultimo l'avviso sparisce ma iPhone apre l'app dentro Safari invece che a
  tutto schermo — e qui la piattaforma che conta è iPhone. Apple continua a documentare il tag come
  valido ([Safari HTML Reference](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html),
  *Support Level: Apple extension*). Con entrambi i tag l'avviso di Chromium non compare: verificato.

`%BASE_URL%` viene usato anche in `og:image`, così l'anteprima social punta all'icona giusta.
Per un'anteprima perfetta puoi sostituirlo con l'URL completo nel `index.html`.

#### Convivenza con il resto del portfolio

Il service worker è registrato con scope `/portfolio/verso-il-17/`: **non tocca** le altre pagine
del sito, e la sua cache resta confinata alla PWA. Il portfolio continua a funzionare come prima.

#### Aggiornamenti

Il service worker è configurato con `skipWaiting` e `clientsClaim`: quando pubblichi una nuova
versione, si attiva alla riapertura successiva dell'app. Se durante lo sviluppo vedi una versione
vecchia, svuota la cache del sito o disinstalla e reinstalla la PWA dalla schermata Home.

#### Primo deploy

Assicurati che Pages sia attivo: **Settings → Pages → Source: GitHub Actions**. Poi fai push su
`main` (o lancia il workflow a mano da **Actions → Deploy Portfolio to GitHub Pages → Run workflow**).

### Pubblicazione su un altro hosting

`dist/` è un sito statico: va bene qualsiasi hosting (Netlify, Vercel, un server Apache/nginx…).
Tre cose da tenere presenti:

- **HTTPS obbligatorio** perché il service worker e l'installazione funzionino (in locale `localhost`
  è considerato sicuro).
- Se lo servi **dalla radice del sito**, la build normale (`npm run build`) va già bene.
- Se lo servi in una **sottocartella**, usa `BASE_PATH`:

  ```bash
  BASE_PATH=/nome-cartella/ npm run build
  ```

  Il percorso di registrazione del service worker si adegua da solo, perché legge
  `import.meta.env.BASE_URL`.

---

## 3. Installare la PWA su iPhone

1. Apri l'app in **Safari** (su iOS solo Safari può aggiungere PWA alla schermata Home).
2. Tocca il pulsante **Condividi** (il quadrato con la freccia in su) nella barra in basso.
3. Scorri e scegli **Aggiungi a Home**.
4. Conferma con **Aggiungi**.

L'app comparirà come una vera icona, si aprirà a tutto schermo
(`display: standalone`), senza barra di Safari, con:

- icona dedicata (`apple-touch-icon`);
- colore di sistema coerente (`theme-color`, che cambia anche con il tema notte);
- rispetto di **notch, Dynamic Island e home indicator** (`env(safe-area-inset-*)` con `viewport-fit=cover`);
- funzionamento **offline** dopo la prima visita, grazie alla precache del service worker.

L'app mostra anche un suggerimento di installazione non invadente, che scompare per sempre dopo
che l'utente lo chiude (o se l'app è già installata). Su Android/desktop Chrome usa il prompt nativo.

---

## 4. Struttura dei file

> Il deploy su GitHub Pages genera anche una cartella **`/verso-il-17/`** alla radice della repo
> (è la versione compilata, in `.gitignore`, prodotta dalla CI). Non fa parte del sorgente.

```text
projects/verso-il-17/
├── index.html                  # shell HTML, meta iOS, tema applicato prima del primo paint
├── vite.config.ts              # Vite + vite-plugin-pwa (manifest, Workbox)
├── package.json
├── tsconfig*.json
├── scripts/
│   └── generate-icons.mjs      # genera le icone PNG senza dipendenze (rasterizzatore + encoder PNG)
├── public/
│   └── icons/                  # icon-192, icon-512, maskable, apple-touch-icon, favicon, splash
└── src/
    ├── main.tsx                # bootstrap React + registrazione del service worker
    ├── App.tsx                 # orchestrazione: stato, timer di mezzanotte, interazioni, toast
    ├── components/
    │   ├── Header.tsx          # intestazione, pattino, controlli tema e musica
    │   ├── Countdown.tsx       # countdown live + modalità "è arrivato il giorno"
    │   ├── CalendarGrid.tsx    # griglia delle caselle + barra di progresso
    │   ├── DayCard.tsx         # la singola casella (4 stati + stellina nascosta)
    │   ├── MessageModal.tsx    # modale del messaggio + micro-rituale
    │   ├── Celebration.tsx     # celebrazione full-screen del 17 ottobre
    │   ├── RollerSkate.tsx     # illustrazione SVG del pattino (rotelle animabili)
    │   ├── Sparkles.tsx        # campo di stelline + scia luminosa
    │   ├── Tricolore.tsx       # bandierina e striscia tricolore
    │   ├── Intro.tsx           # animazione di apertura
    │   ├── Toast.tsx           # messaggi temporanei (live region)
    │   └── InstallHint.tsx     # suggerimento di installazione
    ├── data/
    │   ├── messages.ts         # i testi delle caselle + findMessage()
    │   ├── event.ts            # squadra, nazione, evento e testi del gran finale
    │   └── event.test.ts       # test sull'identità di squadra e sui contenuti
    ├── hooks/
    │   ├── useCountdown.ts     # tick allineato al secondo, ripresa in foreground
    │   ├── useOpenedDays.ts    # caselle aperte, persistite
    │   ├── useTheme.ts         # tema chiaro/scuro (sistema + scelta manuale)
    │   ├── useEggs.ts          # easter egg e modalità glitter
    │   ├── useMusic.ts         # colonna sonora opzionale (Web Audio, nessun file)
    │   ├── useInstallHint.ts   # logica del prompt di installazione
    │   ├── useMediaQuery.ts    # media query reattive, incl. prefers-reduced-motion
    │   └── useAnimatedExit.ts  # smontatura deterministica dopo l'animazione di uscita
    ├── utils/
    │   ├── dates.ts            # tutta la logica temporale (finestra, stati, countdown, chiavi)
    │   ├── storage.ts          # localStorage a prova di Safari iOS
    │   └── dates.test.ts       # test su date, finestra e casi limite
    └── styles/
        └── globals.css         # design system: token, componenti, dark mode, responsive, reduced-motion
```

---

## 5. Scelte architetturali

### La data è l'unica fonte di verità

`src/utils/dates.ts` è il cuore dell'app e non contiene nessun testo: espone
`getCalendarDays()`, `getDayStatus()`, `getCountdownParts()`, `getTargetDate()`.

- Tutte le date si costruiscono con il **costruttore locale** di `Date`
  (`new Date(y, m, d, 0, 0, 0, 0)`), mai parsando stringhe: nessun bug da fuso orario, nessuno
  slittamento di un giorno, e l'ora legale gestita correttamente.
- Le caselle sono identificate da una **chiave di calendario** (`"2026-10-17"`), non da un indice:
  è quella che viene salvata in `localStorage`, quindi le aperture non vengono mai "ereditate" da
  giorni diversi.
- La finestra del calendario si adatta a chi apre il diario in anticipo e ha una regola d'oro:
  **l'ultima casella è sempre il 17 ottobre e la casella di oggi è sempre apribile**. Dopo il gran
  giorno la finestra appena conclusa resta consultabile, con un messaggio che indica il prossimo
  appuntamento.
- Le date si ricalcolano al ritorno in primo piano (`visibilitychange`) e con un timer puntato
  esattamente alla mezzanotte successiva: è così che una casella si sblocca da sola.

### I contenuti sono risolti, non indicizzati

`messages.ts` non viene mai letto direttamente dai componenti: si passa sempre da
`findMessage(indice, totale)`.

Il motivo è concreto: il calendario ha **30 caselle** nel percorso classico e **31** se il diario
viene aperto il 17 settembre. Con un semplice `messages.find(m => m.day === indice)`, nella versione
a 30 caselle il gran finale sarebbe finito sulla casella 30 e il messaggio del Mondiale non sarebbe
mai comparso — un bug che si vede solo provando la data vera. Le ultime quattro caselle sono quindi
**ancorate alla fine** (`anchor: 'end'`), così vigilia, notte prima e gran finale restano al loro
posto qualunque sia la lunghezza del calendario.

### Tre livelli di tempo, separati

| Livello | Dove | Frequenza |
| --- | --- | --- |
| Secondi del countdown | `useCountdown` | ogni secondo, riallineato al confine del secondo |
| Giorno corrente (`now`) | `App` | a mezzanotte, al focus e al ritorno in foreground |
| Stato delle caselle | `useOpenedDays` | solo quando l'utente apre o legge |

Tenere separati questi tre ritmi evita di ricostruire il calendario ogni secondo.

### localStorage difensivo

`utils/storage.ts` incapsula ogni accesso: Safari in navigazione privata può lanciare eccezioni su
`setItem` e in alcuni contesti `localStorage` non esiste nemmeno. Qui non fallisce mai l'app, al
massimo perde la persistenza.

### Animazioni solo su `transform` e `opacity`

Nessun canvas, nessuna animazione di `width`/`top`/`box-shadow` in loop: solo trasformazioni e
opacità, che la GPU compone senza toccare il layout. Su schermi piccoli il `backdrop-filter` viene
ridotto e sulle card disattivato (è l'effetto più costoso su iOS), mantenendo l'aspetto "vetro" dove
serve davvero. Le decorazioni continue sono poche e lente di proposito.

### Audio: nessun file, nessun autoplay

La colonna sonora è una piccola melodia sintetizzata in tempo reale con la **Web Audio API**
(oscillatori triangolari con attacco dolce e decadimento lungo, più un pad). Vantaggi: zero byte
scaricati, funziona offline, nessun problema di licenze, e parte **solo** dopo un tap esplicito —
come impongono le regole di Safari iOS. Si mette in pausa da sola quando l'app va in background.

### La PWA

`vite-plugin-pwa` in modalità `generateSW` (Workbox) produce manifest e service worker. La
registrazione è fatta a mano in `src/main.tsx` e **solo in produzione**, così l'hot reload in
sviluppo resta pulito. Strategia di caching: precache di tutto il guscio dell'app (19 file, ~565 kB)
e `navigateFallback` su `index.html` — l'app si apre anche completamente offline.

Le icone sono generate da uno script (`npm run icons`) che disegna un medaglione con **otto ruote**
in cerchio (le otto ruote di una squadra sincronizzata) e una stellina champagne al centro. Il
rasterizzatore e l'encoder PNG sono scritti a mano, quindi **non serve nessuna dipendenza** per
rigenerarle, e la variante `maskable` rispetta già la zona di sicurezza di Android.

### Perché un CSS scritto a mano, senza Tailwind

L'estetica richiesta (carta materica, gradienti delicati, glow, shimmer, tema notte coerente) vive
di token e di stati sovrapposti. Un file di design system con variabili CSS rende ogni scelta
leggibile e modificabile in un punto solo, con un bundle CSS finale di ~7 kB gzip. Framer Motion è
usato per le animazioni orchestrate (ingressi, modale, celebrazione), mentre tutte le animazioni
continue sono in CSS puro — la combinazione più economica in termini di prestazioni.

### Robustezza delle interazioni

Alcuni dettagli sono nati da problemi reali trovati durante la verifica in un browser vero, e
vale la pena ricordarli perché sono facili da reintrodurre:

- **L'intro non intercetta i tocchi** (`pointer-events: none`) e si smonta da sola con un timer
  interno invece di affidarsi alla fine di un'exit animation: durante la dissolvenza resta in
  pagina, e senza queste due accortezze "mangiava" i tap dei primi istanti.
- **Il passaggio rituale → messaggio non usa `AnimatePresence`**: un exit-animation che non si
  completa terrebbe bloccata la scena. Il cambio è deterministico.
- **"Già letta" viene fotografato all'apertura** della modale: altrimenti, marcando la casella come
  letta subito dopo, il rituale si sarebbe riavviato in un ciclo infinito.
- **La stellina nascosta è un bottone a sé, fuori dal bottone-casella**: niente elementi interattivi
  annidati (sarebbe invalido e confonderebbe VoiceOver) e un tocco sulla stellina non apre anche la
  casella.
- **Un solo toast alla volta con priorità**: i messaggi nati da un tocco dell'utente non possono
  essere scavalcati da un annuncio in ritardo.
- **Le uscite non usano `AnimatePresence`** (`src/hooks/useAnimatedExit.ts`): la sua animazione di
  uscita si considera conclusa solo quando *tutte* le animazioni dei discendenti sono finite,
  comprese quelle con `repeat: Infinity`. Le card contengono stelline e coriandoli che girano
  all'infinito, quindi l'albero non veniva mai rimosso e la modale restava in pagina, invisibile ma
  capace di intercettare i tocchi. Ora l'uscita è deterministica: si anima, si aspetta una durata
  nota e si smonta davvero.
- **Le chiusure passate ai componenti sono stabili** (`useCallback`) o lette da una ref: l'app si
  ri-renderizza ogni secondo per il countdown, e un callback inline cambierebbe identità in
  continuazione, smontando e rimontando gli effetti (compreso il listener di `Esc`).
- **La modale ha un solo gestore per il tocco sul velo**, sul backdrop stesso: con `z-index: -1`
  il velo è un bersaglio a sé e non basta confrontare `event.target === event.currentTarget`.
- **Le ref "fotografate" si dichiarano prima di chi le usa**: `findMessage` ha bisogno del totale
  delle caselle, quindi `totalDaysSnapshot` deve stare sopra il `useMemo` che calcola il messaggio.
  Invertendo l'ordine si ottiene un `ReferenceError: Cannot access before initialization` che si
  manifesta solo aprendo la modale.
- **I contenuti non dipendono mai da un'animazione**: le righe del messaggio erano animate con
  Framer da `opacity: 0`, e con `animate={{}}` (nessun target) restavano invisibili per sempre —
  proprio sulla casella del 17 ottobre, la più importante. Ora il testo è leggibile **di default** e
  l'animazione agisce solo sulla trasformazione: se non parte, il messaggio c'è comunque.
- **`transition` va scritta su una riga sola** in CSS: l'espansione su più righe non viene
  interpretata e l'intera dichiarazione viene scartata in silenzio (con l'effetto che l'elemento
  restava allo stato iniziale).
- **Mai `overflow-x: hidden` su `html` e `body` insieme.** Per specifica un asse `hidden` rende
  l'altro `auto`: si creano così **due contenitori di scroll annidati**, e su iPhone il gesto del
  dito viene consumato da quello interno (che non ha nulla da scorrere) senza arrivare mai a quello
  della pagina. **Lo scroll si blocca del tutto.** La regola corretta è `overflow-x: clip`, che
  ritaglia l'overflow orizzontale *senza* creare un contenitore di scroll. Misurato: con `hidden` un
  trascinamento tattile scorreva 0 px, con `clip` scorre normalmente.
- **Un contenuto da leggere non deve mai partire da `opacity: 0`.** Vale per il testo delle caselle
  (animato da Framer con un target vuoto: restava invisibile per sempre) e per il toast. L'entrata
  di toast e banner di installazione anima **solo la trasformazione**: l'opacità resta 1, così un
  messaggio è leggibile anche se l'animazione non parte — animazioni ridotte, scheda in background,
  frame non prodotti. Al massimo entra senza dissolvenza.
- **Lo stato di uscita va azzerato quando arriva un contenuto nuovo.** Il toast riusava lo stesso
  componente, quindi `leaving` restava `true` dopo il primo messaggio: dal secondo in poi nasceva
  già "in uscita", cioè invisibile. Ora un messaggio nuovo riporta lo stato a "in entrata".

---

## 6. Come cambiare i contenuti

I testi delle caselle stanno in **`src/data/messages.ts`**; le frasi di squadra, il footer e i testi
del gran finale in **`src/data/event.ts`**. Nessuna logica in nessuno dei due.

```ts
export interface DailyMessage {
  day: number;                 // vedi la tabella qui sotto
  anchor?: 'start' | 'end';    // 'start' = `day` caselle dall'inizio (predefinito)
                               // 'end'   = `day` caselle dalla fine (1 = ultima)
  type: 'motivation' | 'poem' | 'thought' | 'funny';
  title: string;               // riga breve sopra il testo
  message: string;             // il contenuto (usa \n per le poesie)
  emoji?: string;
  ritual?: string;             // micro-rituale su misura per quel giorno
}
```

### Perché esiste `anchor`: il calendario ha 30 *o* 31 caselle

La finestra del calendario finisce **sempre** il 17 ottobre e comincia 29 giorni prima. Se il diario
viene aperto il **17 settembre**, le caselle diventano 31; in tutti gli altri casi sono 30.

Se le ultime caselle fossero numerate in modo assoluto, con 30 caselle il gran finale finirebbe sulla
casella 30 e il messaggio del 17 ottobre non verrebbe mai mostrato (oppure mostrerebbe quello della
vigilia). Per questo gli ultimi giorni sono **ancorati alla fine**:

```ts
{ day: 1, anchor: 'end', title: '17 ottobre · Campionati del Mondo' }  // sempre l'ultima
{ day: 2, anchor: 'end', title: 'La notte prima' }                     // sempre la penultima
{ day: 3, anchor: 'end', title: 'Vigilia' }
{ day: 4, anchor: 'end', title: 'La valigia' }
```

Tutti gli altri messaggi usano `day` come posizione dall'inizio (1, 2, 3, …).

> Se aggiungi o togli caselle, **non leggere mai `messages` direttamente**: usa sempre
> `findMessage(indice, totale)`. È l'unico modo corretto, e i test verificano che copra ogni casella
> di entrambe le lunghezze, senza buchi e senza doppioni.

### Dove cade ogni messaggio

| Posizione | Con 30 caselle | Con 31 caselle |
| --- | --- | --- |
| 1 | 17 settembre *(solo con 31)* | 17 settembre |
| 2 | 18 settembre | 18 settembre |
| … | … | … |
| ultima − 3 | La valigia *(solo con 31)* | La valigia |
| ultima − 2 | Vigilia | Vigilia |
| ultima − 1 | La notte prima | La notte prima |
| **ultima** | **17 ottobre · Campionati del Mondo** | **17 ottobre · Campionati del Mondo** |

Le date vere le calcola il dispositivo (`src/utils/dates.ts`): nei testi non c'è nessuna data scritta
a mano, quindi il calendario può spostarsi di anno senza rompere nulla.

Nel file trovi anche `LOCKED_LINES` (caselle chiuse), `EGG_LINES` (easter egg) e `INTRO_LINES`
(apertura). Le frasi dell'header, il footer e il gran finale stanno invece in `event.ts`.

Distribuzione attuale: ~50% motivazione, ~20% pensieri, ~15% poesie, ~15% ironia. Tutti i testi sono
diversi tra loro e parlano di allenamenti, ruote, musica, coreografie, cadute, squadra, Mondiale,
viaggio in Paraguay e attesa — non di motivazione generica.

---

## 7. Squadra, nazione ed evento

Tutto ciò che riguarda la competizione vive in **`src/data/event.ts`**:

```ts
export const EVENT_YEAR = 2026;

export const EVENT = {
  name: 'Campionati del Mondo',
  discipline: 'Pattinaggio artistico a rotelle sincronizzato',
  place: 'Paraguay',
  shortLabel: 'Mondiale · Paraguay',
};

export const TEAM = {
  code: 'MPT',                       // sigla, usata nei badge compatti e nell'icona
  name: 'Monza Precision Team',
  country: 'Italia',
  full: 'Monza Precision Team · Italia',
};

export const TRICOLORE = ['#0e8a52', '#f6f2ec', '#d0455a'];

export const FINALE_COPY = { /* i testi del gran finale */ };
export const AMBIENT_LINES = [ /* le frasi sotto l'header */ ];
export const FOOTER_LINES = [ /* la firma in fondo alla pagina */ ];
```

Da qui si aggiornano in un colpo solo: lo stemma in testata, l'etichetta sotto il countdown, la
casella del 17 ottobre, la celebrazione, il footer, il titolo della pagina e il manifest della PWA.

**Se cambia qualcosa, cambia anche qui:**

| Cosa | Dove |
| --- | --- |
| Nomi squadra / evento / luogo | `src/data/event.ts` |
| Colori della bandiera | `TRICOLORE` in `src/data/event.ts` + i token `--flag-*` in `globals.css` |
| Sigla sull'icona (MPT) | `scripts/generate-icons.mjs` → poi `npm run icons` |
| Titolo e anteprima social | `index.html` (`<title>`, `og:*`, `apple-mobile-web-app-title`) |
| Nome e descrizione della PWA | `vite.config.ts` → blocco `manifest` |

**L'elenco delle atlete.** L'app non contiene nomi: sono un dato personale e non me li sono inventati.
Se volete una dedica nominativa, aggiungetela in `src/data/event.ts`, per esempio:

```ts
export const ROSTER = ['Nome 1', 'Nome 2', 'Nome 3'];
```

e usatela in `FINALE_COPY` o in `messages.ts`. Il posto giusto per farlo è il gran finale (casella 31)
o il rituale della vigilia.

> Nota sul tono: i testi parlano di **gara**, non di risultato. Non c'è nessuna frase che promette
> una vittoria — è una scelta voluta, e c'è un test che la protegge.

---

## 8. Come cambiare la data finale

In `src/utils/dates.ts`:

```ts
export const TARGET_MONTH = 9;   // 9 = ottobre (i mesi partono da 0)
export const TARGET_DAY = 17;    // giorno del gran finale
export const CALENDAR_LENGTH = 30;      // caselle del percorso classico
export const MAX_CALENDAR_LENGTH = 31;  // tetto massimo, se si apre il diario in anticipo
```

Cambiando queste tre costanti cambia tutto il resto in modo coerente: countdown, date delle
caselle, vigilia, gran finale e celebrazione. **I testi restano validi**, perché sono agganciati
alla posizione della casella e non a una data scritta a mano.

Vuoi un calendario più lungo o più corto? Cambia `CALENDAR_LENGTH` e aggiungi o togli messaggi in
`messages.ts` (i test controllano automaticamente che ogni casella abbia il suo testo).

---

## 9. Test

Il progetto include **37 test** (Node 20+), su due file:

```bash
npm test
```

oppure, singolarmente:

```bash
node --experimental-strip-types --test src/utils/dates.test.ts
node --experimental-strip-types --test src/data/event.test.ts
```

**Date e calendario** (`dates.test.ts`)

- il target è il 17 ottobre dell'anno giusto, e il 17 ottobre stesso non slitta all'anno dopo;
- la finestra finisce sempre il 17 ottobre e **la casella di oggi esiste in ogni giorno del percorso**;
- le caselle sono consecutive, senza buchi, con l'ultima sempre `isFinale` e la penultima `isVigilia`;
- gli stati `locked` / `today` / `past` rispettano la data reale, compreso il passaggio di mezzanotte;
- il countdown conta i giorni reali e si azzera il 17 ottobre;
- `addDays` attraversa il cambio di mese e di ora legale senza slittamenti di ora;
- i messaggi sono coerenti: numerazione senza buchi (posizioni assolute + ancoraggi finali), testi e
  titoli tutti diversi.

**Squadra ed evento** (`event.test.ts`)

- competizione, squadra e nazione sono descritte con nome, sigla, luogo e specialità;
- il tricolore ha tre colori distinti e validi;
- **il gran finale è sempre l'ultima casella, con 30 o con 31 caselle**, e nomina il Mondiale, il
  Paraguay e la squadra;
- il resolver `findMessage` copre ogni casella di ogni lunghezza, senza buchi né doppioni;
- le ultime caselle non sono mai ironiche: la chiusura resta emotiva;
- nessun testo promette una vittoria.

Controllo dei tipi:

```bash
npm run typecheck
```

---

## 10. Accessibilità e prestazioni

**Accessibilità**

- Ogni casella è un vero `<button>` con `aria-label` che ne descrive stato e data
  («Casella 12, 29 settembre: ancora chiusa, si apre quel giorno»).
- La modale è un `role="dialog"` con `aria-modal`, focus trap, chiusura con `Esc` e focus che torna
  al punto di partenza.
- I toast sono `role="status"` / `aria-live="polite"`: anche VoiceOver li annuncia.
- Tutti i controlli interattivi hanno un'area di tocco di almeno **44×44 px**, e i focus state sono
  ben visibili (`:focus-visible`).
- Il contrasto del testo principale supera **4,5:1** in entrambi i temi.
- Il tricolore è decorativo e marcato `aria-hidden`, tranne la bandierina dell'header che ha
  `role="img"` e `aria-label="Bandiera italiana"`: chi usa VoiceOver sa chi si rappresenta.
- C'è un link "Salta al calendario" per la navigazione da tastiera.
- `prefers-reduced-motion` è rispettato fino in fondo: spariscono particelle, shimmer, flip 3D,
  parallax e coriandoli, le animazioni continue si fermano, e la griglia torna allineata. L'app
  resta **completamente utilizzabile**.

**Prestazioni**

- Solo `transform` e `opacity` animati: animazioni composte dalla GPU, scroll fluido.
- Nessun canvas, nessuna immagine pesante (le uniche immagini sono 4 icone PNG), nessun font
  scaricato: si usano i font di sistema (`ui-rounded` / serif di sistema).
- `backdrop-filter` ridotto sugli schermi piccoli e disattivato sulle card.
- Bundle: **~130 kB gzip di JS** e **~7,5 kB gzip di CSS**.
- La stampa è gestita: niente decorazioni, solo i contenuti.

---

*Otto ruote · una squadra · infiniti ricordi* ✨
