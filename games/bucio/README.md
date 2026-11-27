# 🕳️ BUCIO — *divora tutto*

Sei un **buco nero low-poly** caduto dal cielo su **Portomarina**, una
cittadina italiana schiacciata tra la collina e il mare. Hai 120 secondi per
divorarla: gelati, vespette, ombrelloni, barche, turisti, palazzi… e i tuoi
quattro rivali.

Installabile, offline, su desktop e telefono. **Sette ambientazioni**, tutte
modellate in **Blender** (114 modelli, un kit per scenario da 100–400 kB),
ognuna con il suo backup procedurale; tutto l'audio è sintetizzato.

Gioca online: <https://lucagandolfi77.github.io/portfolio/games/bucio/>

> 📈 **Prossimo passo:** piano per aggiungere account, login e livelli →
> [PLAN-ACCOUNTS-LIVELLI.md](PLAN-ACCOUNTS-LIVELLI.md)

---

## Gioca

```bash
npm install
npm run dev      # http://localhost:5173
```

Build di produzione (PWA completa, pronta da pubblicare):

```bash
npm run build    # -> dist/
npm run preview  # verifica la build, incluso il service worker
```

La cartella `dist/` è statica: si può servire da qualsiasi hosting
(GitHub Pages, Netlify, Cloudflare Pages, un banalissimo `python -m http.server`).

## Comandi

| Azione | Tastiera | Mouse | Touch | Gamepad |
|---|---|---|---|---|
| Muovi | `WASD` / frecce | punta e tiri | joystick | stick sinistro |
| Ondata di gravità | `Spazio` | — | tasto ◉ | `A` |
| Pausa | `P` / `Esc` | — | — | — |
| Muto | `M` | — | — | — |

Parametro utile per provare la grafica: `?q=low`, `?q=med`, `?q=high`.

## Le due modalità

Si scelgono dal menu (e restano scelte: `?m=continente` per provarle al volo).

| | 🏙️ Città | 🌍 Continente |
|---|---|---|
| Mappa | 108 di semi-lato | **194** — quasi doppia, ~4600 oggetti |
| Durata | 120 s | 180 s |
| Morso a un rivale | perde il 38% della massa e scappa | **è eliminato per sempre** |
| Chi viene morso | torna subito in partita | sparisce dalla mappa e dalla classifica dei vivi |
| Fine | allo scadere del tempo | allo scadere **o** quando rimane un buco solo |

In Continente i rivali sono anche più coraggiosi: ti vengono a cercare invece di
aspettarti, e con un po' di vantaggio in meno (il 15% di massa invece del 30%)
puoi divorarli — perché in un continente inseguire un rivale deve valere la
corsa. Se ti prendono, la partita finisce lì.

## Le ambientazioni

| | Scenario | Oggetti |
|---|---|---|
| 🏖️ | **Portomarina**, città di mare | palazzi con persiane, chiesa, faro, barche, ombrelloni, motorini |
| 🌵 | **Polvere Rossa**, canyon del Far West | saloon, mesas, carovane, cactus, torre dell'acqua |
| 🎿 | **Nevegal**, paese d'alta quota | chalet, igloo, sciovia, pini innevati, pupazzi di neve |
| 🌸 | **Giardino delle Nuvole**, isola sospesa | ciliegi, torii, mulino, serra, mongolfiere |
| 🌃 | **Notte Neon**, metropoli alle 3 | grattacieli con finestre accese, taxi, insegne al neon |
| 🍇 | **Colline del Vino**, borgo tra i filari *(nuovo)* | casali, torre con orologio, filari, cipressi, ulivi, trattori, pecore, botti |
| 🌙 | **Base Lunare**, colonia nel cratere *(nuovo)* | cupole, moduli, razzo con torre, rover, lander, astronauti; la Terra in cielo |

## Il kit di Blender

Ogni ambientazione ha il suo file `public/models/kit-<tema>.glb`, scaricato
solo quando serve (gli altri arrivano dopo, in sottofondo, e il service worker
li tiene offline). I modelli sono scritti da codice:

- `blender/build_kit.py` — primitive, assemblaggio, cottura ed export; i 36
  oggetti di Portomarina;
- `blender/props_themes.py` — Polvere Rossa, Nevegal, Giardino, Notte Neon;
- `blender/props_new.py` — Colline del Vino e Base Lunare.

Ogni oggetto ha spigoli smussati, normali morbide fino a 38° e **occlusione
ambientale cotta in Cycles** (con il terreno sotto, così poggia a terra),
moltiplicata nei colori della palette **di quel tema**: gli oggetti comuni a
più scenari (turisti, lampioni, panchine…) vengono cotti una volta per tema.
Lampade, neon e finestre accese portano una maschera di luce propria nel
canale alfa del colore, che il materiale del gioco trasforma in emissione.

```bash
npm run kit   # Blender 4.2+ (variabile BLENDER se non è nel PATH) + gltfpack
KIT_THEMES=luna,vigneto npm run kit   # solo alcuni scenari
```

`npm run kit` scrive prima `blender/manifest.json` (palette e oggetti di ogni
tema, letti dal codice del gioco), poi lancia Blender e infine comprime ogni
`blender/kit-<tema>.raw.glb` con gltfpack (meshopt).

### Il backup

Ogni modello Blender ha una gemella procedurale (`props.js`,
`props-extra.js`, `props-new.js`) con lo stesso ingombro `r`, la stessa
origine e lo stesso fronte. Se un kit non arriva entro 4 secondi o non si
carica, quello scenario parte con le geometrie procedurali; se il kit arriva
dopo, nel menu il mondo si rifà con i modelli scolpiti. Il test E2E blocca
apposta i kit e verifica che si giochi lo stesso, e `npm test` controlla che
ogni oggetto di ogni scenario abbia il suo modello Blender.

## Come funziona

- **Divori tutto ciò che è più piccolo di te.** Ogni oggetto ha una massa: più
  ne mangi, più cresci, e la camera si allontana mostrando sempre più paese.
- **Cresci con rendimenti decrescenti** (`r = 1.15 · massa^0.42`) e arrivi a
  un tetto di ~15 m: oltre non cresci più, ma continui a mangiare (a metà
  punti, perché a quel punto la partita si decide fra rivali).
- **I quattro rivali** hanno un cervello a stati (caccia / fuga / caccia-rivali
  / vagabondaggio), memoria del bersaglio e un'interfaccia di pancia: dopo
  aver divorato qualcuno non ti ricacca subito.
- **Se sei più grosso** puoi mangiare un buco rivale e fregagli metà dei
  punti; se ti morde perdi il 34% della massa e viene respinto.
- **L'Oro** (gelato gigante, statua del Nettuno, bus turistico) vale 500 punti
  e sparisce dopo 16 secondi. La **minimappa** in alto a destra mostra dove
  sono i rivali (grandi quanto sono) e l'Oro, che lampeggia.
- La città **si ricostruisce** da sola: quello che divori torna dopo qualche
  secondo, quindi la partita non si sposa mai.

### Le quattro fasi

| Livello | Da | Cosa sblocchi |
|---|---|---|
| 1 · Ossetto | 0 m | sei appena caduto dal cielo |
| 2 · Fame | 2.3 m | +20% punti |
| 3 · Attrazione | 4.2 m | risucchi roba quasi troppo grande |
| 4 · Boccone | 6.6 m | divorare i rivali vale il triplo |
| 5 · Ondata | 9.6 m | onda di gravità (`Spazio`) |

## Struttura

```
src/
├─ main.js            bootstrap, stato di gioco, loop
├─ pwa.js             service worker, prompt d'installazione, wake lock
├─ styles.css         tutta la UI (HUD, menu, risultati)
├─ core/
│  ├─ engine.js       renderer, preset di qualità, loop
│  ├─ input.js        tastiera, mouse, touch, gamepad
│  ├─ audio.js        effetti sonori sintetizzati (WebAudio)
│  └─ utils.js        RNG deterministico, matematica, storage
├─ world/
│  ├─ layout.js       la mappa di Portomarina: riva, strade, piazza, confini
│  ├─ terrain.js      terreno, spiaggia, mare, schiuma, marciapiedi
│  ├─ sky.js          cupola a gradiente, nuvole, luci
│  ├─ palette.js      colori e materiali condivisi
│  ├─ geometry.js     primitive low-poly e fusione delle geometrie
│  ├─ props.js        catalogo di 35 oggetti (motorini, palazzi, barche…)
│  ├─ props-new.js    Colline del Vino e Base Lunare (backup procedurale)
│  ├─ kit.js          carica il kit di Blender di ogni tema, con backup
│  └─ propworld.js    InstancedMesh, griglia spaziale, divoramento, respawn
├─ game/
│  ├─ modes.js        modalità: dimensione mondo, durata, regole del morso
│  ├─ hole.js         il buco: crescita, input, onde, tier
│  ├─ ai.js           cervello dei rivali
│  ├─ director.js     timer, regole, scontri, oro, classifica
│  ├─ camera.js       inseguimento e zoom
│  └─ effects.js      particelle, onde d'urto, numeri che salgono
└─ ui/                hud.js · screens.js · joystick.js · minimap.js
blender/              build_kit.py · props_themes.py · props_new.py
scripts/              kit-manifest.mjs · pack-kit.mjs · smoke-modes.mjs
```

## Test

```bash
npm test    # smoke test headless: mondo grande, knockout, partite complete
```

Simula il gioco senza render e verifica che il Continente sia davvero più
grande, che i rivali divorati spariscano, che l'ultimo buco in piedi chiuda la
partita e che la modalità Città sia rimasta identica a prima.

### Luce, ombre e nuvole

- Le **ombre del sole seguono la camera**: il riquadro d'ombra si centra su
  quello che si vede e si allarga con lo zoom (26–170 m), così le ombre
  restano nitide da piccoli e coprono tutta la città da grandi, in qualunque
  punto della mappa. Il centro scatta di un texel alla volta: niente
  tremolio mentre si scorre.
- Ombre morbide (PCF con disco di Vogel, raggio dalla qualità grafica) e mai
  nere: la luce del cielo resta. Anche gli oggetti ricevono ombra.
- **Le nuvole proiettano ombra a terra** (`src/world/cloudlight.js`): macchie
  morbide che scorrono col vento su terreno, mare, strade e su ogni oggetto,
  procedurale o di Blender. Abbassano solo la luce diretta del sole, come
  sotto una nuvola vera. Ogni scenario dosa la sua (`sky.cloudShadow`): niente
  ombre di nuvole di notte, sulla Luna o sopra il mare di nuvole del Giardino.

### Perché è veloce

- Ogni tipo di oggetto è **una geometria fusa e un `InstancedMesh`**:
  ~1.800 oggetti in ~30 draw call.
- Gli oggetti mangiati non vengono cancellati: si spegne l'istanza e la
  città li ricrea in un altro punto.
- Una **griglia spaziale** ( celle da 12 m ) risponde a "cosa c'è vicino al
  buco?" sia per il giocatore sia per l'IA.
- I palazzi hanno una griglia di occupazione separata: condividere quella di
  sedie e lampioni non lascerebbe spazio per costruire niente.
- Tre preset di qualità (Alta / Media / Bassa) che cambiano densità,
  pixel ratio e ombre.

## PWA

- Service worker con precache e aggiornamento automatico.
- Manifest con icone normali e *maskable*, due screenshot, tema scuro.
- Prompt "Installa BUCIO" (e suggerimento dedicato su iOS).
- Funziona offline, wake lock durante la partita, feedback aptico.

## Personalizzare

- **Mappa**: `src/world/layout.js` (dimensioni, riva, strade, piazza, spawn).
- **Oggetti e pesi**: `src/world/props.js` (`mass` = quanto ingrassa, `count`
  = quanti in città, `zone` = dove compaiono).
- **Difficoltà**: gli `skill` dei rivali sono in `src/main.js`.
- **Colori**: `src/world/palette.js`.
- **Icone e key-art**: `npm run icons` (SVG → PNG con sharp).

## Crediti

Tutto generato da codice: `three.js` per il rendering, Blender (via script)
per il kit di Portomarina, geometrie e suoni scritti a mano. Nessuna
immagine nel gioco, nessun file audio, nessun font esterno.