# Verso il 17 ottobre ✨

Una **PWA mobile-first per iPhone**: un calendario d'attesa in stile diario segreto, dedicato al
pattinaggio artistico a rotelle sincronizzato. Si apre ogni giorno per una frase, un pensiero, una
mini poesia o una piccola dose di motivazione — e per il countdown che accompagna fino al **17 ottobre**.

> «Apri la tua casella di oggi. C'è qualcosa che ti aspetta.»

---

## Indice

1. [Cosa c'è dentro](#cosa-cè-dentro)
2. [Avviare il progetto](#1-avviare-il-progetto)
3. [Build di produzione](#2-build-di-produzione)
4. [Installare la PWA su iPhone](#3-installare-la-pwa-su-iphone)
5. [Struttura dei file](#4-struttura-dei-file)
6. [Scelte architetturali](#5-scelte-architetturali)
7. [Come cambiare i contenuti](#6-come-cambiare-i-contenuti)
8. [Come cambiare la data finale](#7-come-cambiare-la-data-finale)
9. [Test](#8-test)
10. [Accessibilità e prestazioni](#9-accessibilità-e-prestazioni)

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
- **Gran finale**: il 17 ottobre la home cambia atmosfera, parte una celebrazione a schermo intero
  con coriandoli, stelle e cuori, e il countdown lascia il posto a «È arrivato il giorno».

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

Serve **Node 20+** (testato con Node 26).

```bash
cd projects/verso-il-17
npm install
npm run dev
```

Apri l'indirizzo che stampa Vite (di default `http://localhost:5178`).

Per provarla dal telefono sulla stessa rete Wi-Fi, il server è già configurato con `host: true`:
usa l'indirizzo `http://<ip-del-computer>:5178` che compare nel terminale.

> **Nota**: in sviluppo il service worker è disattivato apposta, così l'hot reload non fa
> scherzi. Per provare l'installazione e il funzionamento offline serve la build di produzione.

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

### Pubblicazione

`dist/` è un sito statico: va bene qualsiasi hosting (Netlify, Vercel, GitHub Pages, un server
Apache/nginx…). Due cose da tenere presenti:

- **HTTPS obbligatorio** perché il service worker e l'installazione funzionino (in locale `localhost`
  è considerato sicuro).
- L'app è configurata per essere servita **dalla radice del sito** (`base: '/'` in `vite.config.ts`).
  Per pubblicarla in una sottocartella, cambia `base` in `'/nome-cartella/'` e aggiorna il percorso
  di registrazione del service worker in `src/main.tsx`.
- Ricordati di sostituire il `<link rel="canonical">` commentato in `index.html` con il tuo dominio.

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
    │   ├── Intro.tsx           # animazione di apertura
    │   ├── Toast.tsx           # messaggi temporanei (live region)
    │   └── InstallHint.tsx     # suggerimento di installazione
    ├── data/
    │   └── messages.ts         # TUTTI i testi, in un unico posto
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
    │   └── dates.test.ts       # 21 test su date, contenuti e casi limite
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

---

## 6. Come cambiare i contenuti

Tutti i testi stanno in **un solo file**: `src/data/messages.ts`. Non serve toccare la logica.

```ts
export interface DailyMessage {
  day: number;                 // posizione della casella: 1..31
  type: 'motivation' | 'poem' | 'thought' | 'funny';
  title: string;               // riga breve sopra il testo
  message: string;             // il contenuto (usa \n per le poesie)
  emoji?: string;
  ritual?: string;             // micro-rituale, se vuoi uno su misura per quel giorno
}
```

Come sono mappate le posizioni alle date:

| `day` | Data | Note |
| --- | --- | --- |
| 1 | 17 settembre | esiste solo se il diario viene aperto quel giorno |
| 2 | 18 settembre | qui comincia il percorso classico di 30 caselle |
| 30 | 16 ottobre | la vigilia |
| 31 | 17 ottobre | il gran finale |

Nel file trovi anche le frasi decorative (`AMBIENT_LINES` sotto l'header, `LOCKED_LINES` per le
caselle chiuse, `EGG_LINES` per i segreti, `INTRO_LINES` per l'apertura) e `FINALE_COPY` per il
testo del 17 ottobre.

Distribuzione attuale: ~50% motivazione, ~20% pensieri, ~15% poesie, ~15% ironia. Tutti i testi sono
diversi tra loro e parlano di allenamenti, ruote, musica, coreografie, cadute, squadra, palco e
attesa — non di motivazione generica.

---

## 7. Come cambiare la data finale

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

## 8. Test

Il progetto include **21 test** sulla logica temporale e sui contenuti (Node 20+):

```bash
node --experimental-strip-types --test src/utils/dates.test.ts
```

Coprono, tra le altre cose:

- il target è il 17 ottobre dell'anno giusto, e il 17 ottobre stesso non slitta all'anno dopo;
- la finestra finisce sempre il 17 ottobre e **la casella di oggi esiste in ogni giorno del percorso**;
- le caselle sono consecutive, senza buchi, con l'ultima sempre `isFinale` e la penultima `isVigilia`;
- gli stati `locked` / `today` / `past` rispettano la data reale, compreso il passaggio di mezzanotte;
- il countdown conta i giorni reali e si azzera il 17 ottobre;
- `addDays` attraversa il cambio di mese e di ora legale senza slittamenti di ora;
- tutte le caselle possibili hanno un messaggio, con titoli e testi tutti diversi.

Controllo dei tipi:

```bash
npm run typecheck
```

---

## 9. Accessibilità e prestazioni

**Accessibilità**

- Ogni casella è un vero `<button>` con `aria-label` che ne descrive stato e data
  («Casella 12, 29 settembre: ancora chiusa, si apre quel giorno»).
- La modale è un `role="dialog"` con `aria-modal`, focus trap, chiusura con `Esc` e focus che torna
  al punto di partenza.
- I toast sono `role="status"` / `aria-live="polite"`: anche VoiceOver li annuncia.
- Tutti i controlli interattivi hanno un'area di tocco di almeno **44×44 px**, e i focus state sono
  ben visibili (`:focus-visible`).
- Il contrasto del testo principale supera **4,5:1** in entrambi i temi.
- C'è un link "Salta al calendario" per la navigazione da tastiera.
- `prefers-reduced-motion` è rispettato fino in fondo: spariscono particelle, shimmer, flip 3D,
  parallax e coriandoli, le animazioni continue si fermano, e la griglia torna allineata. L'app
  resta **completamente utilizzabile**.

**Prestazioni**

- Solo `transform` e `opacity` animati: animazioni composte dalla GPU, scroll fluido.
- Nessun canvas, nessuna immagine pesante (le uniche immagini sono 4 icone PNG), nessun font
  scaricato: si usano i font di sistema (`ui-rounded` / serif di sistema).
- `backdrop-filter` ridotto sugli schermi piccoli e disattivato sulle card.
- Bundle: **~129 kB gzip di JS** e **~7 kB gzip di CSS**.
- La stampa è gestita: niente decorazioni, solo i contenuti.

---

*Otto ruote · una squadra · infiniti ricordi* ✨
