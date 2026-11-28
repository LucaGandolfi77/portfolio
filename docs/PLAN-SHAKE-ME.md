# SHAKE ME — piano per `games/shake-me/`

> Un piccolo bar di legno sotto i portici, uguale tutto l'anno. Dietro il bancone ci sei tu; davanti, Tobia, vecchio barman in pensione col cardigan, che assaggia ogni drink e dice cosa ne pensa. Si imparano e si servono i **102 cocktail ufficiali IBA**, ricetta per ricetta, con dosi, tecnica, bicchiere e guarnizione.
>
> **Genere:** gioco di miscelazione e ricettario, PWA offline, mobile first.
> **Ispirazione:** i giochi «prepara il cocktail e fallo assaggiare» come *Christmas Cocktail* (App Store, Nancy Nancy). Prendiamo il genere e l'idea di base; tutto il resto è nostro.
> **Riferimenti interni:**
> - `games/seba/`: avviso 18+, minigioco del bancone, tono;
> - `games/bar-blu/`: bar come luogo e personaggi;
> - `games/agente-zero/`: rendering su canvas, inclinazione del telefono, test ed E2E;
> - `games/_kit/`.

---

## 0. Regole

1. **Non è un clone.** Dell'app di riferimento non riprendiamo niente: niente nome, grafica, personaggi, suoni, schermate o impaginazione. Tutto è disegnato e scritto da zero. Restano solo il genere e il ciclo di base, che sono di tutti (scegli il drink, preparalo, fallo giudicare).
2. **Ricette IBA, testi nostri.**
   - Le ricette prese da iba-world.com: nome, ingredienti con dosi, tecnica, bicchiere e guarnizione. Sono dati, e li trascriviamo come tali.
   - Il **procedimento lo riscriviamo** con parole nostre, in italiano e in inglese.
   - Non copiamo foto, video, note o testi del sito né il logo IBA, e non diciamo né lasciamo intendere che il gioco sia approvato da IBA.
   - Nei crediti mettiamo: «Ricette dalle specifiche dei cocktail ufficiali IBA (iba-world.com)».
3. **Nessun marchio.** Dove la specifica IBA nomina una marca (ad esempio «Maraschino Luxardo», un amaro o un bitter preciso), il gioco usa la **categoria generica**: liquore al maraschino, bitter aromatico, bitter rosso, liquore alle erbe verde. Le bottiglie sullo scaffale hanno etichette inventate.
4. **18+.** Avviso all'avvio come per Seba, e tag nel catalogo. Il tono è da mestiere: si impara a fare un drink fatto bene. Non si beve per sballarsi, non ci sono livelli di ebbrezza e non c'è nessun premio per «bere tanto».
5. **Nessun acquisto, nessuna pubblicità.**
6. **Convenzioni del portfolio:**
   - percorsi relativi;
   - service worker con prefisso `shake-me-` e stale-while-revalidate;
   - viewport senza `user-scalable=no`;
   - `[hidden]{display:none!important}`.
7. **Commit per fase. Mai push su `main` senza chiedere.**

## 1. Le ricette (102)

Elenco letto da iba-world.com il 28/11/2026: tre categorie da 34 cocktail ciascuna.

- **The Unforgettables (34):** Alexander, Americano, Angel Face, Aviation, Between the Sheets, Boulevardier, Brandy Crusta, Casino, Clover Club, Daiquiri, Dry Martini, Gin Fizz, Hanky Panky, John Collins, Last Word, Manhattan, Martinez, Mary Pickford, Monkey Gland, Negroni, Old Fashioned, Paradise, Planters Punch, Porto Flip, Ramos Fizz, Remember the Maine, Rusty Nail, Sazerac, Sidecar, Stinger, Tuxedo, Vieux Carré, Whiskey Sour, White Lady.
- **Contemporary Classics (34):** Bellini, Black Russian, Bloody Mary, Caipirinha, Cardinale, Champagne Cocktail, Corpse Reviver #2, Cosmopolitan, Cuba Libre, French 75, French Connection, Garibaldi, Grasshopper, Hemingway Special, Horse's Neck, Irish Coffee, Kir, Lemon Drop Martini, Long Island Iced Tea, Mai-Tai, Margarita, Mimosa, Mint Julep, Mojito, Moscow Mule, Piña Colada, Pisco Sour, Rabo de Galo, Sea Breeze, Sex on the Beach, Singapore Sling, Tequila Sunrise, Vesper, Zombie.
- **New Era (34):** Bee's Knees, Bramble, Canchanchara, Chartreuse Swizzle, Dark 'N' Stormy, Don's Special Daiquiri, Espresso Martini, Fernandito, French Martini, Gin Basil Smash, Grand Margarita, IBA Tiki, Illegal, Jungle Bird, Missionary's Downfall, Naked and Famous, New York Sour, Old Cuban, Paloma, Paper Plane, Penicillin, Pisco Punch, Porn Star Martini, Russian Spring Punch, Sherry Cobbler, South Side, Spicy Fifty, Spritz, Suffering Bastard, Three Dots and a Dash, Tipperary, Tommy's Margarita, Trinidad Sour, Ve.N.To.

**Come entrano nel gioco:**

1. Si legge ogni pagina di ricetta e si trascrive in `js/data/recipes.js`. Ogni ricetta ha questi campi:
   - `id` e `name`;
   - `category`;
   - `ingredients`: `[{ id, ml }]` oppure `{ id, count | tsp | barspoon | dash }`;
   - `method`: `shake | stir | build | muddle | blend | throw | swizzle | layer | dry-shake`, più i passaggi aggiuntivi (top up, rim, float);
   - `ice`;
   - `glass`;
   - `garnish`;
   - `steps` IT/EN, scritti da noi.
2. Un **dizionario degli ingredienti** (circa 140 voci: distillati, liquori, vini, succhi, sciroppi, bitter, frutta, erbe, uova, panna, caffè, spezie) con colore, densità per i drink a strati e categoria.
3. **Un controllo automatico:**
   - sono 102;
   - ogni ingrediente esiste nel dizionario;
   - ogni bicchiere e ogni tecnica sono supportati;
   - non c'è nessun nome di marca.
4. **La lista viene da una sola lettura del sito.** Se l'IBA la aggiorna, si aggiorna il file. Il gioco non chiama mai il sito.

## 2. Il bancone

Schermo verticale. In basso il bancone, in alto lo scaffale, i bicchieri e gli attrezzi. A destra, dietro la vetrina, Tobia e il cliente di turno.

1. **Bicchiere.** Se ne sceglie uno su dieci: coppetta, Martini, old fashioned, doppio old fashioned, highball, Collins, flûte, calice da vino, tazza di rame, tazza da Irish coffee, tiki.
2. **Ghiaccio:** cubetti, tritato, blocco unico o niente.
3. **Versare.** Si tiene premuta la bottiglia sopra il jigger o lo shaker: il liquido scende e una tacca mostra i millilitri. Per i dash, le gocce e i cucchiaini il versamento è a colpetti. Più a lungo tieni, più versi; lasciare al momento giusto è l'abilità.
4. **Tecnica:**
   - **shakerare:** scuotere il telefono, oppure strisciare su e giù, per 8–12 secondi;
   - **mescolare:** cerchi col dito nel mixing glass;
   - **pestare:** tocchi ritmati;
   - **frullare:** tieni premuto;
   - **costruire:** versare direttamente nel bicchiere;
   - **dry shake** per l'albume;
   - **doppio filtro**;
   - **colmare** con soda o bollicine;
   - **galleggiare** un liquore su un altro.
5. **Bordo** di sale o zucchero (Margarita, Brandy Crusta, Lemon Drop): si gira il bicchiere nel piattino.
6. **Guarnizione:** scorza, fetta, ruota, ciliegia, foglia di menta, oliva, noce moscata grattugiata, chicchi di caffè, ombrellino (solo dove c'è).
7. **Servire.** Il drink scivola sul bancone fino a Tobia.

**Il drink è simulato davvero:**
- volume totale;
- diluizione secondo la tecnica (shakerare diluisce più che mescolare, costruire meno);
- temperatura;
- colore, calcolato mescolando i colori degli ingredienti;
- schiuma, se c'è albume o se è stato shakerato forte;
- strati, se si è versato piano liquidi di densità diversa.

## 3. Il giudizio di Tobia

Punteggio su 100 e da una a tre stelle:

| Voce | Peso | Cosa conta |
|---|---|---|
| Ingredienti | 35 | ci sono tutti e nessuno in più |
| Dosi | 25 | scarto da ogni dose; entro ±10% è pieno |
| Tecnica | 15 | quella giusta, per il tempo giusto (diluizione) |
| Bicchiere e ghiaccio | 15 | giusti |
| Guarnizione e dettagli | 10 | guarnizione, bordo, colmatura, strati |

Tobia commenta con il suo carattere, circa 400 battute IT ed EN:
- un difetto preciso: «Troppo succo: è diventata una limonata con ambizioni»;
- un complimento;
- un ricordo legato a quel cocktail, scritto da noi.

Se sbagli, il ricettario mostra cosa non andava, una voce alla volta.

## 4. Modalità

| Modalità | Regole |
|---|---|
| **Scuola** | Tobia ti guida passo passo; il primo giro di ogni cocktail non ha voto. |
| **Serata** | Cinque clienti ordinano uno dopo l'altro; conta la media dei voti. 12 serate, ognuna con nuovi cocktail. |
| **Ricettario** | I 102 cocktail come schede da collezione: si sbloccano servendoli, con le stelle migliori, il procedimento scritto da noi e i ricordi di Tobia. |
| **A memoria** | Il nome e basta, niente aiuti. Si vince con tre stelle. |
| **Sfida del giorno** | Tre cocktail uguali per tutti in quel giorno, con record locale. |

**Clienti** (circa 16 personaggi inventati, con le loro manie):
- la maestra di yoga che vuole tutto con meno zucchero;
- l'autista astemio, che ordina analcolici: per lui il gioco propone le varianti analcoliche di 10 cocktail, segnate come «non IBA»;
- la coppia in viaggio di nozze;
- e così via.

**Progressione:** le tre categorie IBA sono tre «stagioni» del bar.
1. Si comincia con dieci Unforgettables semplici: Americano, Negroni, Daiquiri, Dry Martini e altri.
2. Le tecniche si sbloccano in ordine: costruire, mescolare, shakerare, pestare, dry shake, strati, frullare.
3. Le stelle restano nel ricettario come collezione.

## 5. Grafica e suono

- **Grafica:**
  - SVG e canvas, nostri;
  - legno scuro, luci calde, i portici dietro la vetrina;
  - bottiglie e bicchieri disegnati in vettoriale, con il liquido che si muove (onda semplice) e prende il colore del drink;
  - nessuna foto.
- **Personaggi:** Tobia e i clienti in un tratto cartoon, con espressioni come il rig di Seba.
- **Audio** (Web Audio, nessun file):
  - ghiaccio, versata, shaker, cucchiaino nel mixing glass, frullatore, bollicine, campanelle;
  - una base jazz lenta e generativa, con melodie scritte da noi, nessuna canzone esistente.
- **Accessibilità:** controlli alternativi a ogni gesto (lo shaker si fa anche con il dito), testo grande, meno movimento, colori dei liquidi con il nome scritto.

## 6. Architettura

```
games/shake-me/
  index.html  styles.css  manifest.webmanifest  sw.js  README.md  icons/
  js/
    data/recipes.js      102 ricette IBA (dati) + procedimenti nostri IT/EN
    data/ingredients.js  dizionario ingredienti: colore, densità, zucchero, gradazione, categoria
    data/glasses.js      bicchieri, ghiaccio, tecniche, guarnizioni
    drink.js             simulazione: volumi, diluizione, temperatura, colore, schiuma, strati (puro)
    judge.js             punteggio e difetti rispetto alla ricetta (puro)
    service.js           serate, clienti, comande, mance, sfida del giorno (puro)
    state.js             salvataggio, stelle, collezione, sblocchi
    ui/bar.js            bancone, scaffale, gesti
    ui/book.js           ricettario
    render/              bottiglie, bicchieri, liquido, personaggi
    lines.js  strings.js  audio.js  main.js
  test/logic-test.mjs
tools/quality/e2e/shake-me.spec.mjs
```

## 7. Fasi e verifiche

| Fase | Contenuto | Verifica |
|---|---|---|
| **1. Dati** | Lettura delle 102 ricette IBA, dizionario degli ingredienti, procedimenti riscritti | test: 102 ricette, 34 per categoria, ingredienti tutti nel dizionario, nessun nome di marca, nessun testo identico al sito (confronto delle frasi del procedimento) |
| **2. Simulazione e giudizio** | `drink.js`, `judge.js` | test: la ricetta esatta prende 100 per tutti i 102 cocktail; ogni errore tipico (dose, ingrediente in più, tecnica, bicchiere) toglie i punti previsti; diluizione plausibile |
| **3. Bancone** | gesti, versata, shaker (con sensore e senza), mixing glass, pestello, bordo, guarnizione | E2E: preparare un Negroni, un Daiquiri e un Mojito dal vivo e ottenere tre stelle |
| **4. Serate** | clienti, comande, mance, 24 serate | test delle regole + E2E di una serata completa |
| **5. Ricettario e personaggi** | collezione, Tobia, clienti, battute | E2E: le schede si sbloccano servendo |
| **6. Grafica, audio, PWA** | luci, icone, service worker, catalogo (solo la mia riga), avviso 18+ | `check-syntax`, `run-tests`, `audit-projects`, `audit-pages`, kit `run-all`, E2E su chromium e mobile-chromium |

## 8. Decisioni

- **Nome:** Shake Me. Il barman resta Tobia.
- **Niente Natale e niente stagioni:** il bar è uguale tutto l'anno. Le 24 serate diventano 12, senza date.
- **Dosi a livelli:**
  - **facile** (serate 1–4): sul misurino ci sono le tacche numerate e la linea della dose, tolleranza ±25%. Dopo la prima prova, troppo difficile: il livello facile ora ha la guida passo passo, le scelte illuminate, il misurino che si ferma sulla dose, tolleranza ±35% e media 45 per superare la serata;
  - **medio** (serate 5–8): tacche senza numeri, tolleranza ±18%;
  - **esperto** (serate 9–12): nessuna tacca, tolleranza ±8%.
- **Analcolici:** sì, 10 ricette nostre segnate come «non IBA», servite all'autista astemio.
- **Lingue:** italiano e inglese.
