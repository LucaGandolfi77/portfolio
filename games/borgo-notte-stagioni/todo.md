# BORGO NOTTE: Quattro Stagioni — analisi e cose da fare

Stato al 26 novembre 2026, versione `742a500`.

Questo è un piano di lavoro, non una promessa di fedeltà a GTA. Il gioco
resta originale: stesso genere (città aperta, auto, polizia, missioni), ma
nome, personaggi, interfaccia e aspetto sono nostri.

---

## 1. Dove siamo

### Numeri

| Voce | Valore |
|---|---|
| Codice TypeScript | ~8.300 righe in 29 file |
| File più grande | `src/app/game.ts`, 1.185 righe |
| Bundle JS | 1,16 MB (300 KB compresso) + three.js 0,5 MB |
| Dati della mappa | `fidenza.json`, 984 KB, dentro il bundle |
| Test | 25 (calendario, storia, grafo stradale, allerta, lavori, salvataggio, fisica) |
| Missioni della storia | 12 in 4 capitoli |
| Tipi di veicolo | 8 |
| Stazioni radio | 4, generate dal vivo |

### Cosa funziona bene

- **La città è vera.** Strade, piazze, sagome e altezze degli edifici, alberi
  e larghezze stradali vengono da OSM, DBTR e ortofoto. È il punto di forza
  rispetto a qualunque città inventata.
- **Il tempo passa davvero.** Fasi del giorno, stagioni, meteo ed eventi
  cambiano l'aspetto e il ritmo della città.
- **Leggerezza.** Texture disegnate al volo, mesh unite per blocchi, alberi
  e lampioni istanziati: gira anche su telefoni medi.
- **Audio senza file.** Motore, sirena e radio sono sintetizzati.
- **Logica testabile.** Calendario, storia, allerta e lavori sono moduli
  puri con test.

### Punti deboli (in ordine di quanto si notano)

1. **Le auto non hanno peso.** La fisica è arcade e piatta: niente
   sospensioni, niente inclinazione in frenata, nessuna deformazione. È la
   cosa che più separa il gioco da un "vero" GTA.
2. **La città è vuota di dettagli a livello strada.** Mancano cassonetti,
   cartelli, semafori, segnaletica orizzontale agli incroci, auto
   parcheggiate, insegne dei negozi, portici del centro.
3. **I pedoni sono pochi e "stupidi".** Camminano e scappano; non parlano,
   non reagiscono a te a piedi, non c'è vita nelle piazze fuori dagli eventi.
4. **La polizia è un solo comportamento.** Insegue e basta: niente blocchi
   stradali, niente agenti a piedi, niente elicottero ai livelli alti.
5. **Un terzo degli edifici manca.** OSM non ha tutti gli annessi (il
   report dice copertura ~65%): in periferia si vedono buchi.
6. **`game.ts` è troppo grande.** Mescola stato, UI, HUD, regole e audio.
   Prima di aggiungere molto altro conviene dividerlo.
7. **I dati della mappa sono dentro il bundle.** 1 MB di JSON parsato
   all'avvio rallenta il primo caricamento su telefono.
8. **Niente salvataggio a metà missione** e un solo slot.
9. **Le missioni sono lineari.** Nessuna scelta, nessuna conseguenza.
10. **Il jetpack rompe l'equilibrio.** Si attraversa la città in un attimo
    e si sfuggono gli inseguimenti: va legato a qualcosa (vedi §4).

---

## 2. Grafica "più dettagliata", tipo GTA IV: ha senso?

### Cosa rende riconoscibile quel tipo di look

Non i modelli in sé, ma quattro cose di rendering:

1. **Luce e ombre dinamiche**: ombre del sole in tempo reale, lampioni che
   illuminano davvero, fari che proiettano luce.
2. **Post-processing**: bloom sulle luci, color grading desaturato e un po'
   seppia, nebbia atmosferica, leggera sfocatura in movimento.
3. **Materiali fisici (PBR)**: asfalto bagnato che riflette, vetri lucidi,
   carrozzerie metallizzate, normal map sulle facciate.
4. **Densità**: tanti oggetti piccoli in strada, folla, traffico fitto.

Non possiamo e non dobbiamo copiare l'aspetto di GTA IV. Possiamo però
puntare a uno stile nostro "realistico e granuloso", con queste tecniche.

### Desktop: sì, ha senso, come preset "Ultra"

Con WebGL2 e three.js si può fare quasi tutto:

| Tecnica | Costo | Resa | Priorità |
|---|---|---|---|
| Color grading + vignetta + grana (LUT) | basso | alta | 1 |
| Bloom selettivo su luci, finestre, fari | medio | alta | 1 |
| Ombre del sole in tempo reale (CSM, 2-3 cascate) | medio-alto | molto alta | 2 |
| Strade bagnate: riflessi finti (cubemap + fresnel) | medio | alta con pioggia | 2 |
| Materiali PBR + normal map procedurali sulle facciate | medio | media | 3 |
| SSAO (occlusione ambientale) | alto | media | 4 |
| Luci dinamiche dei lampioni (clustered/forward+) | alto | alta di notte | 4 |
| Riflessi veri (SSR) | molto alto | media | 5 (forse mai) |

Una GPU integrata recente regge bloom, grading e ombre a 60 fps. Le voci
4-5 vanno provate e misurate prima di decidere.

### Telefono: solo in parte

- **Sì:** color grading (costa quasi zero se fatto in un'unica passata),
  fari e lampioni finti più convincenti, asfalto bagnato "dipinto" (texture
  più scura e lucida con pioggia), più oggetti in strada istanziati.
- **Forse, sui telefoni potenti:** bloom a mezza risoluzione, ombre solo
  vicino al giocatore (una cascata, mappa 1024).
- **No:** SSAO, SSR, luci dinamiche multiple, ombre su tutta la città.
  Scaldano il telefono, consumano batteria e fanno crollare i fps.

**Fatto (fase C, 26 novembre 2026):** preset **Ultra** solo desktop (scelto
in automatico con almeno 8 core): bloom su finestre, lampioni, fari e fuoco
(più forte di notte); color grading "Bassa padana" (colori un po' spenti,
ombre fredde e luci calde, vignetta, grana); ombre del sole in tempo reale
attorno al giocatore (mappa 2048, aggiornata a fotogrammi alterni, spente di
notte); strade e tetti bagnati che riflettono il cielo sotto la pioggia. Il
modulo di post-processing (20 KB) si scarica solo in Ultra. Sotto i 33 fps
per sei secondi Ultra spegne da solo effetti e ombre. In tutti i preset
l'asfalto si scurisce quando piove.

Ancora possibile: materiali PBR con normal map sulle facciate, SSAO, luci
dinamiche dei lampioni; un preset **Alta+** per telefoni recenti (solo
grading e bloom leggero).

~~Consiglio:~~ aggiungere un preset **Ultra** solo desktop (rilevato
automaticamente e attivabile a mano), e un preset **Alta+** per telefoni
recenti con solo grading e bloom leggero. Il resto della grafica resta
com'è, che è il motivo per cui gira ovunque.

---

## 3. Idee per renderlo più simile a un open world completo

### 3.1 Guida (la cosa più importante)

Fatto il 26 novembre 2026 (fase B):

- [x] Sospensioni: beccheggio in frenata e accelerazione, rollio in curva,
  rimbalzo negli urti (molla-smorzatore sul telaio, ruote ferme a terra);
  in frenata forte il retrotreno si alleggerisce.
- [x] Danni visibili: la carrozzeria si ammacca nel punto d'impatto
  (vertici spostati fino a 35 cm), detriti del colore dell'auto, vetri
  incrinati sotto il 60%, fumo sotto il 35%, fuoco sotto il 12% fino al
  rottame bruciato (chi resta dentro viene sbalzato fuori).
- [x] Semafori in 48 incroci della rete principale, due fasi, rispettati dal
  traffico; passare col rosso davanti a una pattuglia alza l'allerta.
- [x] ~1.600 auto parcheggiate lungo le strade larghe, in streaming, solide e
  rubabili (allerta solo se una pattuglia vede).
- [x] Pattuglie nel traffico normale, testimoni di rosso ed eccesso di velocità.
- Corretto: durante i dialoghi l'auto andava in retromarcia da sola.

Ancora da fare in questa sezione:

- [ ] **Dossi e cordoli**: salto sui dossi, scossone salendo sul marciapiede.
- [ ] **Parti che si staccano** (paraurti, cofano) come oggetti a terra.
- [ ] **Più veicoli**: scooter e moto (inclinazione in curva), autobus di
  linea su un percorso reale, camion della nettezza urbana all'alba,
  trattore in periferia, bicicletta.
- [ ] **Sgommate e segni** sull'asfalto, polvere sullo sterrato, spruzzi
  sotto la pioggia.
- [ ] **Clacson e reazioni**: il traffico suona se gli tagli la strada.
- [ ] **Telecamera dal cofano** e vista interna.

### 3.2 Città viva

- [ ] **Arredo urbano istanziato**: cassonetti, panchine, cartelli, fermate
  dell'autobus, fioriere, dissuasori, auto parcheggiate lungo le strade.
- [ ] **Insegne dei negozi** generate (bar, farmacia, tabacchi) con
  luce di notte; **portici** del centro storico.
- [ ] **Pedoni con routine**: vanno al lavoro la mattina, al bar a
  mezzogiorno, stanno in piazza la sera, spariscono la notte.
- [ ] **Pedoni che parlano**: frasi brevi in dialetto e italiano quando li
  urti o passi vicino (testo sopra la testa, o voce sintetizzata).
- [ ] **Animali**: piccioni in piazza che volano via, cani al guinzaglio.
- [ ] **Mercato del sabato** in piazza, partita allo stadio la domenica,
  uscita delle scuole: eventi ricorrenti oltre a quelli stagionali.
- [ ] **Interni semplici**: bar, officina, garage di casa, caserma (stanze
  piccole, caricamento istantaneo, come in BORGO SAN DONNINO).

### 3.3 Polizia e conseguenze

- [x] **Livelli diversi davvero**: 1 pattuglia, 2 più pattuglie, 3 posti di
  blocco, 4 agenti a piedi, 5 elicottero con faro (originale, non copiato).
  *Fatto: `game/escalation.ts`. Il posto di blocco sono due auto di traverso
  110-170 m davanti a te, con un agente. Al livello 4 arrivano fino a tre agenti
  a piedi dalle pattuglie vicine, e contano per l'arresto. Al 5 c'è
  l'elicottero, che ti tiene d'occhio entro 120 m col faro.*
- [x] **Testimoni**: un reato visto solo dai pedoni arriva alla polizia con
  ritardo; se scappi prima non succede nulla.
  *Fatto: la segnalazione arriva dopo 8 s e conta solo se sei ancora entro
  150 m. Senza testimoni non succede niente.*
- [x] **Nascondersi**: garage di casa o autolavaggio azzerano l'allerta se
  nessuna pattuglia ti vede entrare.
  *Fatto per il Garage Corradi: la saracinesca azzera l'allerta se né le
  pattuglie né l'elicottero ti vedono. Anche riverniciare l'auto in officina
  azzera l'allerta, sempre se nessuno ti vede. L'autolavaggio resta da fare.*
- [ ] **Multe e reputazione**: la città ricorda; troppi reati e i negozianti
  smettono di darti lavori.

### 3.4 Economia e progressione

- [x] **Garage di casa** dove salvare le auto rubate (3-6 posti).
  *Fatto: 4 posti al Garage Corradi (faro blu, «G» sul radar). Le auto si
  salvano con vernice, modifiche e danni.*
- [x] **Officina che modifica**: vernice, cerchi, motore, sospensioni,
  clacson. Ogni miglioria costa e si vede.
  *Fatto: `game/workshop.ts` e `ui/shop.ts`. Ci sono riparazione, 8 vernici e
  tre livelli ciascuno per motore (accelerazione e punta), freni, assetto
  (aderenza) e clacson (quattro suoni). Mancano i cerchi.*
- [ ] **Proprietà da comprare**: il bar, un'edicola, un parcheggio. Rendono
  soldi ogni giorno di gioco e sbloccano lavori.
- [ ] **Abilità che crescono con l'uso**: guida, resistenza, volo col
  jetpack (più carburante, più velocità).
- [ ] **Abiti** per Dario, comprati nei negozi, visibili sul modello.

### 3.5 Attività secondarie

- [ ] **Corse clandestine** notturne con classifica e scommesse.
- [ ] **Consegne pizza in motorino** a tempo, con il ritmo della serata.
- [ ] **Taxi con clienti che parlano**: una frase all'inizio e una mancia
  che dipende dallo stile di guida.
- [ ] **Ambulanza / pompieri** (veicoli originali) quando ci sono incidenti.
- [ ] **Caccia al tesoro della Via Francigena**: indizi sulle pietre del
  cammino (riusa i dati di BORGO SAN DONNINO).
- [ ] **Foto ricordo**: modalità fotocamera con filtri; foto salvate nel
  telefono del gioco.
- [ ] **Sfide col jetpack**: anelli da attraversare sopra i campanili,
  atterraggi di precisione sui tetti, gare contro il tempo.

### 3.6 Jetpack, per non rompere il gioco

- [ ] **Carburante** che si consuma e si ricarica in officina o col tempo.
- [ ] **Sbloccarlo con la storia** (es. dopo il capitolo 2, regalo di
  Giulia) invece di averlo dall'inizio.
- [ ] **In volo l'allerta non scende** e ai livelli alti arriva l'elicottero.
- [ ] Vento d'inverno e pioggia che spingono il volo.

### 3.7 Storia

- [ ] **Scelte con conseguenze**: aiutare o tradire lo Smilzo cambia il
  capitolo 4; due finali.
- [ ] **Telefonate** dei personaggi tra una missione e l'altra.
- [ ] **Missioni secondarie dei personaggi**: Giulia (gare e auto), Tonino
  (pettegolezzi che diventano incarichi), zia Rina (consegne di famiglia).
- [ ] **Filmati in-engine** anche a metà capitolo, con camera scriptata e
  personaggi che si muovono (non solo dialoghi).
- [ ] **Doppiaggio sintetico opzionale** con la Web Speech API (voce
  italiana del sistema), disattivabile.
- [ ] **Secondo anno**: nuova storia sulla stessa città, nuove stagioni.

### 3.8 Interfaccia

- [ ] **Mappa grande con zoom e waypoint** (tocca un punto, il radar
  mostra il percorso più breve come linea sulle strade).
- [ ] **Navigatore** in auto con frecce e voce sintetica.
- [ ] **Più slot di salvataggio** e salvataggio a metà missione ai
  checkpoint.
- [ ] **Impostazioni**: sensibilità camera, inversione assi, volume per
  canale, sottotitoli più grandi, comandi rimappabili.
- [ ] **Supporto gamepad** (Gamepad API): utile su desktop e tablet.

---

## 4. Tecnica: fase A

Fatto il 26 novembre 2026:

- [x] **Mappa fuori dal bundle.** `fidenza.json` sta in `public/data/`, si
  scarica all'avvio con una barra di avanzamento e il service worker la
  tiene offline. Bundle del gioco: da 1.157 KB a 158 KB (57 KB compressi).
- [x] **Streaming della città.** `CityStream` costruisce i blocchi da 320 m
  vicini alla camera (pochi millisecondi per fotogramma) e libera quelli
  lontani: in memoria 13-20 blocchi invece di tutti, 70-150 draw call.
- [x] **Personaggi lontani semplificati.** Oltre 35-40 m pedoni e folla
  degli eventi diventano una mesh unica (1 draw call invece di 10).
- [x] **`game.ts` diviso.** Da 1.189 a 991 righe; nuovi moduli:
  `ui/notices.ts`, `ui/phone.ts`, `world/santini.ts`, `game/law.ts`,
  `game/jobs-board.ts`, oltre a `world/city.ts` riscritto per lo streaming.
- [x] **Test end-to-end** (`tools/quality/e2e/borgo-stagioni.spec.mjs`, desktop
  e telefono emulato): caricamento della mappa, filmato, avvio della storia,
  ripresa di un salvataggio, telefono, calendario, jetpack. La CI costruisce
  il gioco prima di eseguirli.

Ancora da fare:

- [ ] Dividere ancora `game.ts`: HUD per fotogramma, schermate (titolo,
  pausa, carte), salire e scendere dalle auto.
- [ ] Costruire la città in un Web Worker (oggi lo streaming evita blocchi
  lunghi, ma il primo gruppo di blocchi pesa ancora sull'avvio).
- [ ] Profilazione su 2-3 telefoni veri (fps, temperatura, memoria): serve
  un dispositivo in mano.
- [ ] Edifici mancanti dal DBTR vettoriale: serve la prenotazione sul
  geoportale regionale.

## 5. Proposta di ordine

| Fase | Contenuto | Perché prima |
|---|---|---|
| A ✓ | Refactor di `game.ts`, dati fuori dal bundle, streaming dei blocchi | Fatto (vedi §4) |
| B ✓ | Fisica con sospensioni, danni visibili, semafori, auto parcheggiate | Fatto (vedi §3.1) |
| C ✓ | Preset Ultra desktop: grading, bloom, ombre, strade bagnate | Fatto (vedi §2) |
| D ✓ | Polizia a livelli, testimoni, garage e officina con modifiche | Fatto (vedi §3.3, §3.4) |
| E | Pedoni con routine e frasi, arredo urbano, insegne | La città diventa viva |
| F | Scelte nella storia, missioni dei personaggi, filmati in-engine | Rigiocabilità |
| G | Moto, autobus, attività secondarie, gamepad | Varietà |
