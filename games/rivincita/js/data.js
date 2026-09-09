// ═══════════════════════════════════════════════════════════════
// RIVINCITA — dati: città, storia, satira, lavori, minigiochi,
// side-quest, personaggi, armi.
// GTA 2D top-down · iPhone + desktop
// ═══════════════════════════════════════════════════════════════

var DATA = {};

// --- mondo (grande: 10x10 celle) ---
DATA.WORLD = 4800;
DATA.BLOCK = 300;
DATA.ROAD = 70;
DATA.CELL = DATA.BLOCK + DATA.ROAD;
DATA.GRID = 10;

DATA.cellX = function (col) { return -DATA.WORLD / 2 + col * DATA.CELL + DATA.ROAD; };
DATA.cellY = function (row) { return -DATA.WORLD / 2 + row * DATA.CELL + DATA.ROAD; };

// --- edifici ---
// kind: home | job | shop | office | park | service
DATA.BUILDINGS = [
  { id: 'casa',        name: 'Casa di Marco', emoji: '🏠', col: 0, row: 4, color: '#7f9cf5', kind: 'home' },
  { id: 'market',      name: 'Minimarket',    emoji: '🏪', col: 1, row: 4, color: '#f6ad55', kind: 'job', job: 'cashier' },
  { id: 'pizza',       name: 'Pizzeria "La Svolta"', emoji: '🍕', col: 2, row: 2, color: '#fc8181', kind: 'job', job: 'pizza' },
  { id: 'taxi',        name: 'Taxi Stazione', emoji: '🚕', col: 3, row: 4, color: '#f6e05e', kind: 'job', job: 'taxi' },
  { id: 'bar',         name: 'Bar Centrale',  emoji: '☕', col: 4, row: 1, color: '#b794f4', kind: 'shop' },
  { id: 'posta',       name: 'Ufficio Postale', emoji: '✉️', col: 5, row: 2, color: '#63b3ed', kind: 'service' },
  { id: 'ufficio',     name: 'Sede "Merloni SRL"', emoji: '🏢', col: 1, row: 2, color: '#a0aec0', kind: 'office' },
  { id: 'parco',       name: 'Parco delle Sette Lune', emoji: '🌳', col: 4, row: 4, color: '#9ae6b4', kind: 'park', big: true },
  { id: 'discoteca',   name: 'Discoteca "Zero Luce"', emoji: '🪩', col: 6, row: 1, color: '#e879f9', kind: 'shop' },
  { id: 'banca',       name: 'Banca Centrale', emoji: '🏦', col: 7, row: 5, color: '#fbbf24', kind: 'service' },
  { id: 'palestra',    name: 'Palestra "Sudore & Co."', emoji: '🏋️', col: 0, row: 0, color: '#60a5fa', kind: 'shop' },
  { id: 'biblioteca',  name: 'Biblioteca Civica', emoji: '📚', col: 7, row: 2, color: '#94a3b8', kind: 'service' },
  { id: 'meccanico',   name: 'Autofficina "Gino"', emoji: '🛠️', col: 8, row: 1, color: '#f472b6', kind: 'shop' },
  { id: 'ospedale',    name: 'Ospedale Civile', emoji: '🏥', col: 9, row: 3, color: '#fca5a5', kind: 'service' },
  { id: 'stazione',    name: 'Stazione Centrale', emoji: '🚉', col: 8, row: 6, color: '#67e8f9', kind: 'service' },
  { id: 'cinema',      name: 'Cinema "Rivincita"', emoji: '🎬', col: 9, row: 0, color: '#c084fc', kind: 'shop' },
  { id: 'serra',       name: 'Serra Comunale', emoji: '🌻', col: 9, row: 7, color: '#bef264', kind: 'shop' },
  { id: 'edicola',     name: 'Edicola "Prime Notizie"', emoji: '📰', col: 2, row: 5, color: '#f9a825', kind: 'shop' },
  { id: 'ristorante',  name: 'Trattoria "Da Nonna"', emoji: '🍝', col: 5, row: 5, color: '#ef5350', kind: 'shop' },
  { id: 'arena',       name: 'Palestra "L\'Arena"', emoji: '🥊', col: 3, row: 1, color: '#ff7043', kind: 'shop' }
];
DATA.PARK_CELLS = [[4, 4], [5, 4]];

// --- personaggi con nome (danno side-quest) ---
DATA.CHARS = [
  { id: 'rosa',      name: 'Rosa la barista', emoji: '🧑', color: '#e879f9', home: 'bar', quest: 'caffe' },
  { id: 'senzanome', name: 'Il Senzanome',    emoji: '🧔', color: '#8d6e63', home: 'parco', quest: 'anello' },
  { id: 'conti',     name: 'Agente Conti',    emoji: '👮', color: '#3b82f6', home: 'posta', quest: 'pacchi' },
  { id: 'gino',      name: 'Gino il Meccanico', emoji: '🔧', color: '#f59e0b', home: 'meccanico', quest: 'utensili' },
  { id: 'luca',      name: 'Luca il Bibliotecario', emoji: '📖', color: '#6366f1', home: 'biblioteca', quest: 'libri' },
  { id: 'dj_nina',   name: 'DJ Nina',         emoji: '🎧', color: '#ec4899', home: 'discoteca', quest: 'djset' }
];

// --- modelli di auto (ognuno disegnato diversamente) ---
DATA.CAR_MODELS = {
  city:    { name: 'Utilitaria', w: 34, h: 20 },
  berlina: { name: 'Berlina',    w: 42, h: 24 },
  suv:     { name: 'SUV',        w: 46, h: 28, roof: true },
  sport:   { name: 'Sportiva',   w: 44, h: 22, spoiler: true },
  van:     { name: 'Furgone',    w: 50, h: 26, box: true },
  taxi:    { name: 'Taxi',       w: 42, h: 24 },
  police:  { name: 'Polizia',    w: 42, h: 24 },
  pickup:  { name: 'Pickup',     w: 48, h: 24, truck: true },
  moto:    { name: 'Moto',       w: 22, h: 12, bike: true },
  bici:    { name: 'Bicicletta', w: 18, h: 10, bike: true, pedal: true }
};

// --- palette colori (estesa) ---
DATA.CAR_COLORS = [
  '#e53e3e', '#3182ce', '#2f855a', '#d69e2e', '#6b46c1', '#dd6b20',
  '#38b2ac', '#f687b3', '#718096', '#ed8936', '#63b3ed', '#a0aec0',
  '#fbbf24', '#d53f8c', '#48bb78', '#805ad5'
];

// --- auto parcheggiate (rubabili) ---
DATA.CARS = [
  { x: 400,  y: 1100 },  { x: 1100, y: -800 }, { x: -1700, y: 300 },
  { x: 600,  y: -1900 }, { x: -900, y: 1600 }, { x: 1900, y: 1100 },
  { x: -2000, y: -1400 }, { x: 800, y: 2100 }, { x: 2100, y: -400 }, { x: -1400, y: -2000 },
  { x: -300, y: -2300 }, { x: 2300, y: 1800 }, { x: -2300, y: 900 }, { x: 1500, y: -2100 },
  { x: 0, y: 2300 },     { x: -2100, y: -500 },
  { x: 1200, y: 500 },   { x: -600, y: -1100 }, { x: 1800, y: -600 }, { x: -1100, y: 1200 },
  { x: 500, y: -300 },   { x: -1800, y: 400 },  { x: 900, y: 1500 },  { x: -400, y: -800 },
  { x: 2200, y: 200 },   { x: -800, y: -1800 }, { x: 1600, y: 800 },  { x: -1500, y: 1500 },
  { x: 300, y: -1600 },  { x: -2200, y: -300 }
];

// --- polizia ---
DATA.POLICE = { x: -2300, y: -2200 };

// --- passanti (satira) ---
DATA.NPC_LINES = [
  'L\'affitto è dovuto... di nuovo.',
  'Anche oggi niente. Ma domani.',
  'Il mio capo mi chiama "risorsa". Triste.',
  'Tre ore di fila alla posta. Tre. Ore.',
  'Il caffè è l\'unico antidepressivo che posso permettermi.',
  'Sognavo di fare l\'artista. Ora timbro cartellini.',
  'Se il sole non rispetta gli orari, perché devo farlo io?',
  'La mia ansia ha un abbonamento al palazzo.',
  'L\'importante è che il datore di lavoro sia felice.',
  'Vorrei solo un giorno in cui nessuno mi urla contro.',
  'Il fitness è la mia terapia. Peccato costi come l\'affitto.',
  'La banca approva i prestiti più in fretta dei miei sogni.',
  'Ho fatto 10.000 passi oggi. Tutti tra il divano e il frigo.',
  'Il mio lavoro mi rende... umile. Molto umile.',
  'Se l\'ansia fosse un abbonamento, avrei la versione premium.',
  'Stamattina ho pensato: "almeno il caffè è gratis." Non lo era.',
  'Mi hanno detto di "seguire i miei sogni." I miei sogni dormono.',
  'Il chrono non va in pausa. Nemmeno quando ho bisogno.',
  'Ho visto un corso online: "Diventa felice in 7 giorni." Costa €500.',
  'La pizza al taglio: l\'unico investimento che rende.',
  'Ho comprato un gatto. Almeno qualcuno mi guarda senza giudicarmi.',
  'Il mio stipendio è come un fantasma: lo senti, ma non lo vedi.',
  'Ogni giorno la stessa route: casa-lavoro-casa. A volte aggiungo il bar.',
  'Mi hanno offerto un "aumento". Di responsabilità, non di stipendio.',
  'L\'app delDating mi dice "seii un 10!". Il mio conto in banca dice "10 centesimi".',
  'Sto risparmiando. Per cosa? Non lo so. Ma sto risparmiando.',
  'Il mio capo dice "siamo una famiglia." Le famiglie non licenziano.',
  'Ho chiesto un giorno libero. Mi hanno dato un\'occhiata libera.',
  'Il weekend è come un miraggio nel deserto del lavoro.',
  'Se l\'ansia fosse un gioco, sarei al livello 99.',
  'Ho comprato una scarpe da corsa. Ora corro solo dal capo.',
  'La lavatrice è rotta. Anche la mia motivazione, ma quella non ha garanzia.',
  'Ho fatto un esame di coscienza. Non ho passato.',
  'Il mio account Instagram: 200 follower. Il mio account banca: 200 euro.',
  'Ho provato la meditazione. Ho pensato a cosa mangiare per 20 minuti.',
  'Il mio autonomo è come un gatto: va e viene quando vuole.',
  'Mi hanno detto "pensa positivo." Ho pensato: "positivo che non ce la faccio."',
  'Ho un\'intervista di lavoro. Spero che non chiedano del mio curriculum vitae.',
  'La pizza margherita: l\'unico compromesso che accetto nella vita.',
  'Ho scaricato l\'app per dormire meglio. Ora sto sveglio a usare l\'app.'
];

// --- passanti reattivi (reagiscono al giocatore) ---
DATA.NPC_REACTIONS = [
  { dist: 60, lines: ['Ehi, rallenta! Stai andando troppo veloce!', 'Macchina libera? No? Allora stai lontano.', 'Hai visto la mia bicicletta? Era qui un secondo fa...'] },
  { dist: 40, lines: ['Ehi! Mi stai guardando? Che vuoi?', 'Non ho soldi per l\'affitto, figurati per il caffè.', 'Vattene, sto pensando alla mia vita.'] },
  { dist: 30, lines: ['Ouch! Mi hai calpestato il piede!', 'Ma che problemi hai? Lasciami in pace!', 'Sei peggio del mio capo. E non è poco.'] }
];

// --- NPC con tipo (comportamenti diversi) ---
DATA.NPC_TYPES = [
  { type: 'runner',   emoji: '🏃', speed: 80,  color: '#10b981', pct: 0.12 },
  { type: 'homeless', emoji: '🧑‍🦯', speed: 8,   color: '#78716c', pct: 0.08 },
  { type: 'worker',   emoji: '👨‍💼', speed: 25,  color: '#3b82f6', pct: 0.25 },
  { type: 'old',      emoji: '👴', speed: 12,  color: '#a78bfa', pct: 0.10 },
  { type: 'kid',      emoji: '🧒', speed: 45,  color: '#fbbf24', pct: 0.15 }
];

// --- cartelloni (satira) ---
DATA.BILLBOARDS = [
  { x: -1400, y: -900, text: 'ZONE 30 — perché la vita corre abbastanza da sola' },
  { x: 900,   y: 700,  text: 'AFFITTO: paga o sparisci. Grazie.' },
  { x: -300,  y: 1550, text: 'CAFFÈ: il vero antidepressivo nazionale' },
  { x: 600,   y: -1650,text: 'POSTA: vieni, la fila ti aspetta (3 ore)' },
  { x: -1650, y: 800,  text: 'CAPO: il tuo stress è il mio stipendio' },
  { x: 1650,  y: -700, text: 'CORSIE CLANDESTINE: stasera, al parcheggio' },
  { x: -1000, y: 1650, text: 'PALESTRA: paga l\'abbonamento, non la vita' },
  { x: 1650,  y: 1100, text: 'DISCOTECA: dove la realtà si abbassa il volume' },
  { x: -2100, y: -1900, text: 'OSPEDALE: l\'ansia cura i biglietti da visita' },
  { x: 2100,  y: -1700, text: 'CINEMA: due ore in cui nessuno ti chiede nulla' },
  { x: 0,     y: 2250,  text: 'STAZIONE: parti, se puoi. Torna, se vuoi.' },
  { x: -700,  y: -400,  text: 'EDICOLA: ieri ieri, oggi oggi, domani chissà' },
  { x: 1200,  y: 1400,  text: 'RISTORANTE: mangi bene e paghi... beh, mangi' },
  { x: -1800, y: 1200,  text: 'ARENA: combatti lo stress, non il tuo vicino' },
  { x: 500,   y: 800,   text: 'BIBLIOTECA: leggi per scappare. Gratis.' },
  { x: -500,  y: -1800, text: 'MECCANICO: ripara la macchina, ripara la vita' }
];

// --- eventi dinamici (appunti casuali) ---
DATA.DYNAMIC_EVENTS = [
  { type: 'car_alarm',    text: '🚨 Il allarme di un\'auto scatta nel parcheggio!', anxiety: 3, money: 0 },
  { type: 'free_coffee',  text: '☕ Un barista generoso ti offre un caffè gratis!', anxiety: -8, money: 0 },
  { type: 'rain',         text: '🌧️ Piove! L\'ansia sale di 2.', anxiety: 2, money: 0 },
  { type: 'find_money',   text: '💰 Trovi €5 per terra. Il giorno è salvo.', anxiety: -2, money: 5 },
  { type: 'cat_cross',    text: '🐱 Un gatto ti attraversa la strada. Porta fortuna!', anxiety: -3, money: 0 },
  { type: 'bus_delay',    text: '🚌 Il bus è in ritardo... come sempre. L\'ansia sale.', anxiety: 4, money: 0 },
  { type: 'street_music', text: '🎸 Un musicista suona per strada. Ti senti meglio.', anxiety: -6, money: 0 },
  { type: 'dog_poop',     text: '💩 Hai calpestato... qualcosa. L\'umore cala.', anxiety: 5, money: 0 },
  { type: 'wind',         text: '💨 Un vento forte ti rovina i capelli. E l\'umore.', anxiety: 1, money: 0 },
  { type: 'pizza_smell',  text: '🍕 L\'odore di pizza ti riempie il cuore.', anxiety: -5, money: 0 },
  { type: 'construction', text: '🏗️ Lavori in corso. Il rumore ti acceca.', anxiety: 3, money: 0 },
  { type: 'sunset',       text: '🌅 Il tramonto è bello. Per un momento dimentichi tutto.', anxiety: -7, money: 0 }
];

// --- oggetti da trovare (side quests) ---
DATA.COLLECTIBLES = {
  utensili: { emoji: '🔧', name: 'Chiave inglese', color: '#f59e0b' },
  libri:    { emoji: '📖', name: 'Libro antico',    color: '#6366f1' },
  djset:    { emoji: '💿', name: 'Disco vinile',    color: '#ec4899' }
};

// --- punti di spawn per gli oggetti da trovare ---
DATA.COLLECTIBLE_SPAWNS = {
  utensili: [
    { x: 1800, y: -300 }, { x: -900, y: 1400 }, { x: 600, y: -1200 },
    { x: -1600, y: 600 }, { x: 200, y: 2000 }
  ],
  libri: [
    { x: -400, y: -1500 }, { x: 1300, y: 900 }, { x: -1100, y: -600 },
    { x: 700, y: 1700 }
  ],
  djset: [
    { x: 1500, y: -1000 }, { x: -800, y: 200 }, { x: 300, y: -2000 }
  ]
};

// --- armi (satiriche, mai letali) ---
DATA.WEAPONS = [
  { id: 'fionda', name: 'Fionda',     emoji: '🪀', owned: true,  cost: 0,   cd: 0.5, dmg: 0, desc: 'Colpisce i passanti: li stordisce (in senso buono).' },
  { id: 'acqua',  name: 'Pistola ad acqua', emoji: '💦', owned: false, cost: 10, cd: 0.25, dmg: 0, desc: 'Rinfresca: rallenta la polizia e ti calma (ansia -3).' },
  { id: 'urlo',   name: 'Urlo liberatorio', emoji: '😤', owned: false, cost: 0,  cd: 8,   dmg: 0, desc: 'Grida: spinge via i passanti, ansia -15. Si sblocca al cap. 6.' },
  { id: 'fischio', name: 'Fischietto', emoji: '📣', owned: false, cost: 5, cd: 3, dmg: 0, desc: 'Fischia: attira l\'attenzione, i passanti si fermano. Utile per le consegne.' }
];
DATA.WEAPON_UNLOCK = { urlo: 5, fischio: 2 };   // capitolo minimo per lo sblocco

// --- side quest ---
// reward: {money, anxiety}; obiettivo mostrato nell'HUD
DATA.SIDE_QUESTS = {
  caffe: {
    name: '☕ Giro di caffè', char: 'rosa',
    text: 'Rosa ti chiede di portare 4 caffè ai passanti: avvicinati a 4 persone e premia E.',
    count: 4, reward: { money: 25, anxiety: -10 },
    done: 'Rosa sorride: "Grazie, Marco. Il caffè è amore tascabile." +€25'
  },
  anello: {
    name: '💍 L\'anello perduto', char: 'senzanome',
    text: 'Il Senzanome ha perso l\'anello della moglie nel parco: cerca il luccichio (4 punti).',
    count: 1, reward: { money: 40, anxiety: -5 },
    done: 'Il Senzanome piange un po\': "La mia Maria... Grazie, ragazzo." +€40'
  },
  pacchi: {
    name: '📦 Fila selvaggia', char: 'conti',
    text: 'Conti ti mette alla cassa pacchi: clicca i 5 pacchi nel numero che annuncia (minigame).',
    count: 1, reward: { money: 30, anxiety: 5 },
    done: 'Conti: "Servizio eccellente! E ora torni in fila come tutti." +€30'
  },
  utensili: {
    name: '🔧 Pezzi smarriti', char: 'gino',
    text: 'Gino ha perso 5 utensili nell\'officina: cerca le chiavi inglesi e i cacciavite nel parcheggio.',
    count: 5, reward: { money: 35, anxiety: -8 },
    done: 'Gino: "Finalmente! Ora posso aggiustare il camion del capo. Grazie!" +€35'
  },
  libri: {
    name: '📚 Libri dispersi', char: 'luca',
    text: 'Luca ha bisogno di 4 libri ritrovati nella città: avvicinati ai punti gialli e premi E.',
    count: 4, reward: { money: 20, anxiety: -12 },
    done: 'Luca: "Ogni libro è un mondo. Grazie per avermeli restituiti." +€20'
  },
  djset: {
    name: '🎧 Il DJ set', char: 'dj_nina',
    text: 'Nina ha bisogno di 3 dischi: trovali nella città e portali alla discoteca.',
    count: 3, reward: { money: 45, anxiety: -15 },
    done: 'Nina: "Sei un genio! Il set sarà pazzesco. Ti invito alla prima!" +€45'
  }
};

// --- dialoghi / storia (10 capitoli) ---
DATA.STORY = [
  {
    id: 0, name: 'Prologo',
    objective: 'Leggi il diario in camera e poi esci di casa',
    dialogo: [
      { n: 'Marco', t: 'Ore 6:30. La sveglia suona come una condanna.' },
      { n: 'Marco', t: 'Un altro giorno. Il minimarket, il capo, la fila. Tutto uguale.' },
      { n: 'Diario', t: '12 marzo. L\'ansia è tornata. Mi sento una gomma a terra. Ma domani... domani forse cambia qualcosa.' },
      { n: 'Marco', t: 'Mi serve una rivincita. Anche piccola. Anche solo un giorno senza sentirmi sbagliato.' }
    ]
  },
  {
    id: 1, name: 'Il turno',
    objective: 'Vai al minimarket e fai il tuo turno (minigame cassa)',
    dialogo: [
      { n: 'Capo', t: 'Marco! Sei in ritardo di 2 minuti. Il tuo tempo è denaro. IL MIO denaro.' },
      { n: 'Marco', t: 'Buongiorno, signor Merloni... Ho avuto l\'attacco d\'ansia stamattina.' },
      { n: 'Capo', t: 'Non mi interessa la tua psiche. Interessa il resoconto. Vai in cassa, PRIMA o dopo la pausa che ti spetta?' },
      { n: 'Marco', t: '...(il caffè costa come la mia dignità)' }
    ],
    satire: 'Il capo ti paga con un sorriso finto e 20 centesimi di riconoscenza.'
  },
  {
    id: 2, name: 'La moto',
    objective: 'Trova la moto abbandonata nel vicolo e salici (E)',
    dialogo: [
      { n: 'Marco', t: 'Una moto. Abbandonata, con la chiave ancora nel quadro.' },
      { n: 'Marco', t: 'È come se la città mi avesse finalmente prestato un\'ora di libertà.' },
      { n: 'Narratore', t: 'Non era furto. Era un prestito con interessi: la motivazione.' }
    ]
  },
  {
    id: 3, name: 'Consegne',
    objective: 'Fai 3 consegne di pizze (vai alla pizzeria)',
    dialogo: [
      { n: 'Panettiere', t: 'Ho sentito che hai bisogno di un\'altra entrata. Le pizze non si consegnano da sole.' },
      { n: 'Marco', t: 'Davvero? Anche a me serve... sentirsi utile, almeno per un\'ora.' },
      { n: 'Panettiere', t: 'Bene. 3 consegne, 15 minuti, punte come gli insulti del tuo capo: tanti.' }
    ]
  },
  {
    id: 4, name: 'Il taxi',
    objective: 'Fai 2 corse col taxi (vai alla stazione taxi)',
    dialogo: [
      { n: 'Giulia', t: 'Marco? Sei tu? Sei il primo che vedo sorridere da mesi.' },
      { n: 'Marco', t: 'È colpa della moto. E delle pizze. E dell\'ansia che... aspetta, sta scendendo?' },
      { n: 'Giulia', t: 'Hai bisogno di una pausa. Vieni al parco quando puoi: le panchine non giudicano.' }
    ]
  },
  {
    id: 5, name: 'La pausa',
    objective: 'Vai al parco e fermati 10 secondi sulla panchina',
    dialogo: [
      { n: 'Giulia', t: 'Respira. Guarda le foglie. Non devi dimostrare niente a nessuno.' },
      { n: 'Marco', t: 'Sai cosa mi ha detto il capo oggi? Che l\'ansia è una scusa per i fannulloni.' },
      { n: 'Giulia', t: 'L\'ansia non è una scusa. È un campanello. E tu, adesso, stai suonando per cambiare.' }
    ]
  },
  {
    id: 6, name: 'La scoperta',
    objective: 'Entra in sede e fotografa la frode del capo (V per la fotocamera)',
    dialogo: [
      { n: 'Marco', t: 'Merloni ruba dal magazzino. Ogni notte. E incolpa noi dipendenti.' },
      { n: 'Marco', t: 'Quanto coraggio serve per dire la verità? Forse più di quanto ne abbia... ma ci provo.' },
      { n: 'Diario', t: '23 marzo. Per la prima volta ho scelto io. La paura c\'è, ma cammina accanto a me, non davanti.' }
    ]
  },
  {
    id: 7, name: 'La denuncia',
    objective: 'Porta le prove alla posta e denuncia Merloni',
    dialogo: [
      { n: 'Agente', t: 'Ha registrato tutto? Questo è sufficiente. Merloni è indagato.' },
      { n: 'Marco', t: 'Non so se mi sentirò vendicato. Ma so che stasera dormirò meglio.' },
      { n: 'Narratore', t: 'La giustizia non cura l\'ansia. Ma a volte le apre una porta.' }
    ]
  },
  {
    id: 8, name: 'La Svolta',
    objective: 'Compra la pizzeria (hai abbastanza risparmi) e inizia il tuo turno',
    dialogo: [
      { n: 'Panettiere', t: 'Sto andando in pensione. La pizzeria è tua, Marco. A condizioni oneste.' },
      { n: 'Marco', t: 'Io... non ho mai avuto qualcosa di mio. Da quando ho 18 anni pago affitti altrui.' },
      { n: 'Panettiere', t: 'Allora è ora che qualcosa sia tuo. Benvenuto nel club dei padroni del proprio tempo.' }
    ]
  },
  {
    id: 9, name: 'L\'ultima corsa',
    objective: 'Consegna la pizza numero 1000: la consegna della rivincita',
    dialogo: [
      { n: 'Marco', t: 'Consegna numero 1000. Un numero tondo per una vita che gira finalmente.' },
      { n: 'Giulia', t: 'Vedi? L\'ansia non è sparita. Ma ora sai che puoi attraversarla.' },
      { n: 'Marco', t: 'Sì. E la prossima volta che il mondo mi urla, rispondo col motore acceso.' }
    ]
  }
];

// --- finale narrato ---
DATA.FINALE = [
  'Epilogo.',
  'Sei mesi dopo, la pizzeria "La Svolta" è l\'angolo più caldo della città.',
  'Marco dorme 7 ore a notte. A volte 8. I dottori lo chiamano "progressi".',
  'Merloni è sotto processo. Il suo avvocato ha chiesto "attenuanti per stress lavorativo".',
  'Giulia viene ogni venerdì. Ordina sempre la stessa pizza. Marco la fa sempre più grande.',
  'Rosa, il Senzanome e l\'Agente Conti sono diventati clienti affezionati. Anche la polizia, alla fine, ordina.',
  'L\'ansia non se n\'è andata: vive nella stanza accanto. Ma ora ha una chiave, e la tiene Marco.',
  'Un giorno, un ragazzo con la testa bassa entra a chiedere lavoro.',
  'Marco lo guarda e sorride: "Prima una pizza. Poi ne parliamo."',
  'LA RIVINCITA NON È VINCERE. È SMETTERE DI PERDERTI. — fine.'
];

// --- minigame: cassa ---
DATA.CASHIER_ITEMS = [
  { name: 'Pane',  price: 2, emoji: '🍞' },
  { name: 'Latte', price: 1, emoji: '🥛' },
  { name: 'Uova',  price: 3, emoji: '🥚' },
  { name: 'Caffè', price: 1, emoji: '☕' },
  { name: 'Pasta', price: 2, emoji: '🍝' },
  { name: 'Insalata', price: 3, emoji: '🥗' },
  { name: 'Biscotti', price: 2, emoji: '🍪' },
  { name: 'Succo', price: 2, emoji: '🧃' }
];
DATA.SHIFT_LEN = 6;

// --- arcade ---
DATA.ARCADE = { grid: 18, cell: 16, speed: 8 };

// --- corsa clandestina ---
DATA.RACE = { laps: 2, check: 5, radius: 1900 };

// --- economia ---
DATA.COSTS = {
  caffe: 3,
  affitto: 150,
  pizzaShop: 1200,
  acqua: 10,
  fischio: 5,
  riparazione: 20
};
DATA.PAY = {
  pizza: 12, pizzaBonus: 6,
  taxi: 15, taxiBonus: 8,
  cashier: 35,
  arcade: 5,
  raceBase: 60,
  utensili: 35,
  libri: 20,
  djset: 45
};

// --- traffico in movimento (auto che guidano NPC) ---
DATA.TRAFFIC = {
  maxCars: 8,
  spawnInterval: 3,
  speedRange: [60, 140],
  models: ['city', 'berlina', 'suv', 'van']
};

// --- interni degli edifici ---
// Ogni interno: w,h (dimensioni), walls[] (ostacoli), items[] (oggetti decorativi),
// spawn (punto di ingresso), exit (punto di uscita), door (posizione porta esterna)
DATA.INTERIORS = {
  casa: {
    w: 320, h: 240, bg: '#2d3748',
    spawn: { x: 160, y: 220 }, exit: { x: 160, y: 225 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 320, h: 12 }, { x: 0, y: 228, w: 320, h: 12 },
      { x: 0, y: 0, w: 12, h: 240 }, { x: 308, y: 0, w: 12, h: 240 },
      { x: 12, y: 12, w: 140, h: 80 },
      { x: 12, y: 120, w: 90, h: 60 }
    ],
    items: [
      { x: 20, y: 20, w: 120, h: 60, color: '#5b6abf', label: '🛏️ Letto', act: 'bed' },
      { x: 200, y: 20, w: 100, h: 70, color: '#7f8c8d', label: '📺 TV', act: 'tv' },
      { x: 20, y: 130, w: 70, h: 40, color: '#8b6914', label: '🍽️ Tavolo', act: 'table' },
      { x: 200, y: 120, w: 100, h: 80, color: '#6b4e3d', label: '📕 Scrivania', act: 'desk' },
      { x: 140, y: 160, w: 50, h: 50, color: '#27ae60', label: '🪴 Pianta', act: null }
    ],
    label: 'Casa di Marco'
  },
  market: {
    w: 340, h: 260, bg: '#1a2332',
    spawn: { x: 170, y: 240 }, exit: { x: 170, y: 245 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 340, h: 12 }, { x: 0, y: 248, w: 340, h: 12 },
      { x: 0, y: 0, w: 12, h: 260 }, { x: 328, y: 0, w: 12, h: 260 }
    ],
    items: [
      { x: 20, y: 20, w: 300, h: 30, color: '#f39c12', label: '🧃 Scaffale snack', act: null },
      { x: 20, y: 60, w: 300, h: 30, color: '#f1c40f', label: '🥫 Scaffale conserve', act: null },
      { x: 20, y: 100, w: 300, h: 30, color: '#3498db', label: '🥛 Scaffale latticini', act: null },
      { x: 20, y: 150, w: 120, h: 60, color: '#95a5a6', label: '🏪 Bancone cassa', act: 'cashier' },
      { x: 200, y: 150, w: 120, h: 80, color: '#7f8c8d', label: '📦 Magazzino', act: null }
    ],
    label: 'Minimarket'
  },
  pizza: {
    w: 360, h: 260, bg: '#1c1c1c',
    spawn: { x: 180, y: 240 }, exit: { x: 180, y: 245 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 360, h: 12 }, { x: 0, y: 248, w: 360, h: 12 },
      { x: 0, y: 0, w: 12, h: 260 }, { x: 348, y: 0, w: 12, h: 260 },
      { x: 12, y: 100, w: 170, h: 12 }
    ],
    items: [
      { x: 20, y: 20, w: 160, h: 70, color: '#d35400', label: '🔥 Forno', act: 'oven' },
      { x: 200, y: 20, w: 140, h: 70, color: '#e67e22', label: '🍕 Prep. pizza', act: 'prep' },
      { x: 20, y: 120, w: 160, h: 50, color: '#bdc3c7', label: '🪑 Tavoli', act: 'sit' },
      { x: 200, y: 120, w: 140, h: 50, color: '#ecf0f1', label: '📋 Ordini', act: 'orders' },
      { x: 120, y: 190, w: 120, h: 40, color: '#c0392b', label: '🍕 Vetrina pizze', act: null }
    ],
    label: 'Pizzeria "La Svolta"'
  },
  taxi: {
    w: 300, h: 220, bg: '#1a1a2e',
    spawn: { x: 150, y: 200 }, exit: { x: 150, y: 205 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 300, h: 12 }, { x: 0, y: 208, w: 300, h: 12 },
      { x: 0, y: 0, w: 12, h: 220 }, { x: 288, y: 0, w: 12, h: 220 }
    ],
    items: [
      { x: 20, y: 20, w: 120, h: 80, color: '#2c3e50', label: '🚕 Auto parcheggiata', act: null },
      { x: 160, y: 20, w: 120, h: 80, color: '#34495e', label: '🚕 Auto parcheggiata', act: null },
      { x: 20, y: 120, w: 80, h: 60, color: '#7f8c8d', label: '🪑 Banchetta', act: 'sit' },
      { x: 120, y: 120, w: 160, h: 60, color: '#95a5a6', label: '📋 Lista corse', act: 'list' }
    ],
    label: 'Taxi Stazione'
  },
  bar: {
    w: 340, h: 250, bg: '#1a1024',
    spawn: { x: 170, y: 230 }, exit: { x: 170, y: 235 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 340, h: 12 }, { x: 0, y: 238, w: 340, h: 12 },
      { x: 0, y: 0, w: 12, h: 250 }, { x: 328, y: 0, w: 12, h: 250 },
      { x: 12, y: 100, w: 316, h: 10 }
    ],
    items: [
      { x: 20, y: 20, w: 300, h: 60, color: '#6c3483', label: '🍷 Bancone bar', act: 'barCounter' },
      { x: 20, y: 120, w: 80, h: 50, color: '#8e44ad', label: '🪑 Tavolo 1', act: 'sit' },
      { x: 120, y: 120, w: 80, h: 50, color: '#8e44ad', label: '🪑 Tavolo 2', act: 'sit' },
      { x: 220, y: 120, w: 80, h: 50, color: '#8e44ad', label: '🪑 Tavolo 3', act: 'sit' },
      { x: 20, y: 185, w: 140, h: 40, color: '#9b59b6', label: '🎮 Arcade machine', act: 'arcade' },
      { x: 200, y: 185, w: 120, h: 40, color: '#a569bd', label: '🎵 jukebox', act: 'jukebox' }
    ],
    label: 'Bar Centrale'
  },
  posta: {
    w: 320, h: 240, bg: '#1b2838',
    spawn: { x: 160, y: 220 }, exit: { x: 160, y: 225 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 320, h: 12 }, { x: 0, y: 228, w: 320, h: 12 },
      { x: 0, y: 0, w: 12, h: 240 }, { x: 308, y: 0, w: 12, h: 240 },
      { x: 12, y: 110, w: 296, h: 8 }
    ],
    items: [
      { x: 20, y: 20, w: 280, h: 40, color: '#2980b9', label: '📮 Sportelli postali', act: 'postCounter' },
      { x: 20, y: 70, w: 130, h: 30, color: '#3498db', label: '📋 Coda posta', act: 'queue' },
      { x: 170, y: 70, w: 130, h: 30, color: '#3498db', label: '📦 Pacchi', act: 'packets' },
      { x: 20, y: 130, w: 120, h: 80, color: '#5d6d7e', label: '📦 Pacchi in arrivo', act: null },
      { x: 160, y: 130, w: 140, h: 80, color: '#5b7d95', label: '🪑 Sala d\'attesa', act: 'sit' }
    ],
    label: 'Ufficio Postale'
  },
  ufficio: {
    w: 360, h: 260, bg: '#1c2833',
    spawn: { x: 180, y: 240 }, exit: { x: 180, y: 245 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 360, h: 12 }, { x: 0, y: 248, w: 360, h: 12 },
      { x: 0, y: 0, w: 12, h: 260 }, { x: 348, y: 0, w: 12, h: 260 }
    ],
    items: [
      { x: 20, y: 20, w: 140, h: 60, color: '#566573', label: '🖥️ Scrivania Capo', act: 'bossDesk' },
      { x: 180, y: 20, w: 160, h: 60, color: '#5d6d7e', label: '🗄️ Armadi fascicoli', act: 'filing' },
      { x: 20, y: 100, w: 100, h: 60, color: '#85929e', label: '💻 Postazione 1', act: 'desk1' },
      { x: 140, y: 100, w: 100, h: 60, color: '#85929e', label: '💻 Postazione 2', act: 'desk2' },
      { x: 260, y: 100, w: 80, h: 60, color: '#aab7b8', label: '🖨️ Stampante', act: null },
      { x: 20, y: 180, w: 320, h: 50, color: '#717d7e', label: '📦 Magazzino Merloni', act: 'evidence' }
    ],
    label: 'Sede "Merloni SRL"'
  },
  edicola: {
    w: 280, h: 200, bg: '#1a1a1a',
    spawn: { x: 140, y: 180 }, exit: { x: 140, y: 185 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 280, h: 12 }, { x: 0, y: 188, w: 280, h: 12 },
      { x: 0, y: 0, w: 12, h: 200 }, { x: 268, y: 0, w: 12, h: 200 }
    ],
    items: [
      { x: 20, y: 20, w: 240, h: 30, color: '#f39c12', label: '📰 Giornali', act: null },
      { x: 20, y: 60, w: 120, h: 40, color: '#e74c3c', label: '📖 Riviste', act: null },
      { x: 150, y: 60, w: 110, h: 40, color: '#3498db', label: '📚 Libri bestseller', act: null },
      { x: 20, y: 110, w: 240, h: 30, color: '#95a5a6', label: '🎰 Scratch & Win', act: null },
      { x: 20, y: 150, w: 100, h: 30, color: '#7f8c8d', label: '☕ Bancone', act: 'counter' }
    ],
    label: 'Edicola "Prime Notizie"'
  },
  ristorante: {
    w: 340, h: 260, bg: '#1c1008',
    spawn: { x: 170, y: 240 }, exit: { x: 170, y: 245 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 340, h: 12 }, { x: 0, y: 248, w: 340, h: 12 },
      { x: 0, y: 0, w: 12, h: 260 }, { x: 328, y: 0, w: 12, h: 260 },
      { x: 12, y: 120, w: 150, h: 10 }
    ],
    items: [
      { x: 20, y: 20, w: 150, h: 80, color: '#922b21', label: '🔥 Cucina', act: 'kitchen' },
      { x: 190, y: 20, w: 130, h: 80, color: '#b03a2e', label: '🍕 Forno a legna', act: 'woodoven' },
      { x: 20, y: 140, w: 100, h: 50, color: '#6c3483', label: '🪑 Tavolo 1', act: 'sit' },
      { x: 140, y: 140, w: 100, h: 50, color: '#6c3483', label: '🪑 Tavolo 2', act: 'sit' },
      { x: 260, y: 140, w: 60, h: 50, color: '#7d3c98', label: '🍷 Vineria', act: null },
      { x: 20, y: 200, w: 300, h: 30, color: '#a569bd', label: '📋 Menu del giorno', act: 'menu' }
    ],
    label: 'Trattoria "Da Nonna"'
  },
  arena: {
    w: 320, h: 240, bg: '#0d0d0d',
    spawn: { x: 160, y: 220 }, exit: { x: 160, y: 225 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 320, h: 12 }, { x: 0, y: 228, w: 320, h: 12 },
      { x: 0, y: 0, w: 12, h: 240 }, { x: 308, y: 0, w: 12, h: 240 }
    ],
    items: [
      { x: 60, y: 40, w: 200, h: 140, color: '#922b21', label: '🥊 Ring boxe', act: 'ring' },
      { x: 20, y: 40, w: 30, h: 140, color: '#5d6d7e', label: '🏋️ Pesi', act: null },
      { x: 270, y: 40, w: 30, h: 140, color: '#5d6d7e', label: '🏋️ Pesi', act: null },
      { x: 20, y: 195, w: 130, h: 25, color: '#7f8c8d', label: '📋 Iscrizione', act: 'signup' },
      { x: 170, y: 195, w: 130, h: 25, color: '#85929e', label: '🏆 Trofei', act: null }
    ],
    label: 'Arena "L\'Arena"'
  },
  biblioteca: {
    w: 340, h: 250, bg: '#1a1510',
    spawn: { x: 170, y: 230 }, exit: { x: 170, y: 235 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 340, h: 12 }, { x: 0, y: 238, w: 340, h: 12 },
      { x: 0, y: 0, w: 12, h: 250 }, { x: 328, y: 0, w: 12, h: 250 }
    ],
    items: [
      { x: 20, y: 20, w: 80, h: 200, color: '#6c3483', label: '📚 Scaffale A', act: null },
      { x: 120, y: 20, w: 80, h: 200, color: '#7d3c98', label: '📚 Scaffale B', act: null },
      { x: 220, y: 20, w: 100, h: 80, color: '#8e44ad', label: '📖 Sala lettura', act: 'read' },
      { x: 220, y: 120, w: 100, h: 100, color: '#5b2c6f', label: '🖥️ Computer', act: 'pc' },
      { x: 20, y: 140, w: 80, h: 60, color: '#4a235a', label: '🪑 Posti studio', act: 'sit' }
    ],
    label: 'Biblioteca Civica'
  },
  meccanico: {
    w: 340, h: 250, bg: '#111111',
    spawn: { x: 170, y: 230 }, exit: { x: 170, y: 235 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 340, h: 12 }, { x: 0, y: 238, w: 340, h: 12 },
      { x: 0, y: 0, w: 12, h: 250 }, { x: 328, y: 0, w: 12, h: 250 }
    ],
    items: [
      { x: 20, y: 20, w: 160, h: 100, color: '#5d6d7e', label: '🚗 Auto al piano', act: 'lift' },
      { x: 200, y: 20, w: 120, h: 100, color: '#566573', label: '🔧 Banco attrezzi', act: 'tools' },
      { x: 20, y: 140, w: 100, h: 80, color: '#4d5656', label: '📦 Ricambi', act: null },
      { x: 140, y: 140, w: 180, h: 80, color: '#515a5a', label: '🛢️ Oli e filtri', act: null }
    ],
    label: 'Autofficina "Gino"'
  },
  discoteca: {
    w: 360, h: 260, bg: '#0a0014',
    spawn: { x: 180, y: 240 }, exit: { x: 180, y: 245 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 360, h: 12 }, { x: 0, y: 248, w: 360, h: 12 },
      { x: 0, y: 0, w: 12, h: 260 }, { x: 348, y: 0, w: 12, h: 260 }
    ],
    items: [
      { x: 20, y: 20, w: 320, h: 60, color: '#1a0033', label: '🎧 DJ Booth', act: 'djbooth' },
      { x: 20, y: 100, w: 100, h: 60, color: '#2d0050', label: '🪩 Pista ballo', act: 'dance' },
      { x: 140, y: 100, w: 100, h: 60, color: '#2d0050', label: '🪩 Pista ballo', act: 'dance' },
      { x: 260, y: 100, w: 80, h: 60, color: '#3d0070', label: '🪩 Pista ballo', act: 'dance' },
      { x: 20, y: 180, w: 160, h: 50, color: '#4a0080', label: '🍷 Bar', act: 'barCounter' },
      { x: 200, y: 180, w: 140, h: 50, color: '#5a0090', label: '🪑 VIP lounge', act: 'vip' }
    ],
    label: 'Discoteca "Zero Luce"'
  },
  cinema: {
    w: 320, h: 240, bg: '#0a0a0a',
    spawn: { x: 160, y: 220 }, exit: { x: 160, y: 225 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 320, h: 12 }, { x: 0, y: 228, w: 320, h: 12 },
      { x: 0, y: 0, w: 12, h: 240 }, { x: 308, y: 0, w: 12, h: 240 }
    ],
    items: [
      { x: 20, y: 20, w: 280, h: 80, color: '#1a1a1a', label: '🎬 Schermo cinema', act: 'screen' },
      { x: 20, y: 120, w: 80, h: 40, color: '#2c2c2c', label: '🪑 Poltrona 1', act: 'sit' },
      { x: 120, y: 120, w: 80, h: 40, color: '#2c2c2c', label: '🪑 Poltrona 2', act: 'sit' },
      { x: 220, y: 120, w: 80, h: 40, color: '#2c2c2c', label: '🪑 Poltrona 3', act: 'sit' },
      { x: 20, y: 180, w: 280, h: 30, color: '#333', label: '🍿 Snack bar', act: 'snack' }
    ],
    label: 'Cinema "Rivincita"'
  },
  palestra: {
    w: 320, h: 240, bg: '#111',
    spawn: { x: 160, y: 220 }, exit: { x: 160, y: 225 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 320, h: 12 }, { x: 0, y: 228, w: 320, h: 12 },
      { x: 0, y: 0, w: 12, h: 240 }, { x: 308, y: 0, w: 12, h: 240 }
    ],
    items: [
      { x: 20, y: 20, w: 130, h: 80, color: '#1a1a2e', label: '🏋️ Sala pesi', act: 'weights' },
      { x: 170, y: 20, w: 130, h: 80, color: '#16213e', label: '🏃 Tappeti rotanti', act: 'treadmill' },
      { x: 20, y: 120, w: 130, h: 80, color: '#1a1a2e', label: '🥊 Sacco boxe', act: 'punchbag' },
      { x: 170, y: 120, w: 130, h: 80, color: '#16213e', label: '🧘 Yoga mat', act: 'yoga' },
      { x: 20, y: 210, w: 280, h: 16, color: '#0f3460', label: '📋 Abbonamenti', act: 'membership' }
    ],
    label: 'Palestra "Sudore & Co."'
  },
  ospedale: {
    w: 340, h: 250, bg: '#e8f0f2',
    spawn: { x: 170, y: 230 }, exit: { x: 170, y: 235 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 340, h: 12 }, { x: 0, y: 238, w: 340, h: 12 },
      { x: 0, y: 0, w: 12, h: 250 }, { x: 328, y: 0, w: 12, h: 250 }
    ],
    items: [
      { x: 20, y: 20, w: 300, h: 40, color: '#d4e6f1', label: '🏥 Reception', act: 'reception' },
      { x: 20, y: 80, w: 140, h: 80, color: '#aed6f1', label: '🛏️ Stanza 1', act: 'room1' },
      { x: 180, y: 80, w: 140, h: 80, color: '#aed6f1', label: '🛏️ Stanza 2', act: 'room2' },
      { x: 20, y: 180, w: 300, h: 40, color: '#d6eaf8', label: '💊 Farmacia', act: 'pharmacy' }
    ],
    label: 'Ospedale Civile'
  },
  stazione: {
    w: 360, h: 260, bg: '#1a2030',
    spawn: { x: 180, y: 240 }, exit: { x: 180, y: 245 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 360, h: 12 }, { x: 0, y: 248, w: 360, h: 12 },
      { x: 0, y: 0, w: 12, h: 260 }, { x: 348, y: 0, w: 12, h: 260 }
    ],
    items: [
      { x: 20, y: 20, w: 320, h: 40, color: '#1c2833', label: '🖥️ Tabellone partenze', act: 'departures' },
      { x: 20, y: 80, w: 150, h: 60, color: '#2c3e50', label: '🎫 Biglietteria', act: 'tickets' },
      { x: 190, y: 80, w: 150, h: 60, color: '#34495e', label: '☕ Bar stazione', act: 'barCounter' },
      { x: 20, y: 160, w: 320, h: 60, color: '#5d6d7e', label: '🪑 Sala d\'attesa', act: 'sit' }
    ],
    label: 'Stazione Centrale'
  },
  banca: {
    w: 320, h: 240, bg: '#1a1a2e',
    spawn: { x: 160, y: 220 }, exit: { x: 160, y: 225 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 320, h: 12 }, { x: 0, y: 228, w: 320, h: 12 },
      { x: 0, y: 0, w: 12, h: 240 }, { x: 308, y: 0, w: 12, h: 240 }
    ],
    items: [
      { x: 20, y: 20, w: 280, h: 40, color: '#f39c12', label: '🏦 Sportelli', act: 'bankCounter' },
      { x: 20, y: 80, w: 130, h: 60, color: '#d4ac0d', label: '🏧 Bancomat', act: 'atm' },
      { x: 170, y: 80, w: 130, h: 60, color: '#b7950b', label: '🪑 Sala', act: 'sit' },
      { x: 20, y: 160, w: 280, h: 50, color: '#7d6608', label: '🔒 Cassette forti', act: 'vault' }
    ],
    label: 'Banca Centrale'
  },
  serra: {
    w: 300, h: 220, bg: '#0a2a0a',
    spawn: { x: 150, y: 200 }, exit: { x: 150, y: 205 },
    door: { side: 'bottom' },
    walls: [
      { x: 0, y: 0, w: 300, h: 12 }, { x: 0, y: 208, w: 300, h: 12 },
      { x: 0, y: 0, w: 12, h: 220 }, { x: 288, y: 0, w: 12, h: 220 }
    ],
    items: [
      { x: 20, y: 20, w: 120, h: 80, color: '#27ae60', label: '🌻 Fiori', act: null },
      { x: 160, y: 20, w: 120, h: 80, color: '#2ecc71', label: '🌿 Piante', act: null },
      { x: 20, y: 120, w: 260, h: 70, color: '#1e8449', label: '🌳 Alberi nani', act: null }
    ],
    label: 'Serra Comunale'
  }
};

// --- azioni interne (cosa succede quando premi E dentro un edificio) ---
DATA.INTERIOR_ACTIONS = {
  bed: { text: '🛏️ Ti corichi un attimo. Ansia -5.', anxiety: -5 },
  tv: { text: '📺 Guardi un programma. Che noia. Ansia +2.', anxiety: 2 },
  table: { text: '🍽️ Mangi qualcosa. Ansia -3.', anxiety: -3 },
  desk: { text: '📕 Scrivi nel diario. "Oggi ho provato a cambiare."', anxiety: -2 },
  cashier: { text: '🏪 Vuoi fare il turno? Premi E di nuovo per iniziare.', action: 'startCashier' },
  oven: { text: '🔥 Il forno è caldo. L\'odore di pizza ti rasserena. Ansia -4.', anxiety: -4 },
  prep: { text: '🍕 Prepari un\'impasto. Ti senti utile. Ansia -3.', anxiety: -3 },
  sit: { text: '🪑 Ti siedi. Riposi le gambe. Ansia -2.', anxiety: -2 },
  orders: { text: '📋 Controlli gli ordini. Ce ne sono tanti.', anxiety: 0 },
  barCounter: { text: '🍷 Bevi qualcosa. Ansia -8.', anxiety: -8, money: -3 },
  arcade: { text: '🎮 Vuoi giocare? Vai al bancone del bar fuori.', action: 'none' },
  jukebox: { text: '🎵 Ascolti musica. Ansia -5.', anxiety: -5 },
  postCounter: { text: '📮 Spedisci una lettera. Ti senti più leggero.', anxiety: -3 },
  queue: { text: '📋 La fila è lunga. Ansia +5.', anxiety: 5 },
  packets: { text: '📦 Smisti i pacchi. Lavoro duro.', anxiety: 2 },
  bossDesk: { text: '🖥️ La scrivania del capo. Cosa nasconde?', action: 'none' },
  filing: { text: '🗄️ Cerchi tra i fascicoli. Trovi qualcosa di sospetto...', action: 'none' },
  desk1: { text: '💻 La tua vecchia postazione. I ricordi...', anxiety: 1 },
  desk2: { text: '💻 Un\'altra postazione. Il deserto degli uffici.', anxiety: 1 },
  evidence: { text: '📦 Il magazzino di Merloni. Qui ci sono le prove...', action: 'none' },
  counter: { text: '☕ Compri un giornale. Ansia -3.', anxiety: -3, money: -2 },
  kitchen: { text: '🔥 La cucina profuma di sugo. Ansia -6.', anxiety: -6 },
  woodoven: { text: '🍕 Il forno a legna è un capolavoro. Ansia -4.', anxiety: -4 },
  menu: { text: '📋 Il menu della Nonna: "Piatti fatti con amore (e un po\' di sale)."', anxiety: -2 },
  ring: { text: '🥊 Vuoi combattere? Vai all\'iscrizione.', action: 'none' },
  signup: { text: '📋 Iscriviti all\'arena. Costa €5.', action: 'startBoxing' },
  read: { text: '📖 Ti perdi tra le pagine. Ansia -10.', anxiety: -10 },
  pc: { text: '🖥️ Cerchi lavoro online. Trovi solo spam.', anxiety: 3 },
  lift: { text: '🚗 L\'auto è sul piano. Gino la riparerà.', action: 'none' },
  tools: { text: '🔧 Gli attrezzi di Gino sono ordinati. A differenza della tua vita.', anxiety: -1 },
  djbooth: { text: '🎧 Il bancone del DJ. La musica ti avvolge.', anxiety: -5 },
  dance: { text: '🪩 Balli come se nessuno ti guardasse. Ansia -8.', anxiety: -8 },
  vip: { text: '🍷 La zona VIP. Costa €10 ma ti senti speciale.', anxiety: -10, money: -10 },
  screen: { text: '🎬 Lo schermo è vuoto. Aspetta il film.', anxiety: -3 },
  snack: { text: '🍿 Popcorn! Ansia -4.', anxiety: -4, money: -2 },
  weights: { text: '🏋️ Alleni i muscoli. Ansia -6.', anxiety: -6 },
  treadmill: { text: '🏃 Corri. La vita non ti raggiunge.', anxiety: -5 },
  punchbag: { text: '🥊 Colpisci il sacco. Sfoghi la rabbia. Ansia -8.', anxiety: -8 },
  yoga: { text: '🧘 Namaste. L\'ansia si calma. Ansia -7.', anxiety: -7 },
  membership: { text: '📋 L\'abbonamento costa €20. Il benessere ha un prezzo.', action: 'none' },
  reception: { text: '🏥 La reception. "Ho un appuntamento per l\'ansia."', anxiety: -2 },
  room1: { text: '🛏️ Un paziente dorme. Anche lui cerca riposo.', anxiety: -3 },
  room2: { text: '🛏️ Una infermiera ti guarda. "Stai bene?" "Meh."', anxiety: -1 },
  pharmacy: { text: '💊 La farmacia. Ansia -10 (ma costa €8).', anxiety: -10, money: -8 },
  departures: { text: '🖥️ I treni partono. Tu resti. Ansia +2.', anxiety: 2 },
  tickets: { text: '🎫 Vuoi un biglietto? Non sai dove andare.', anxiety: 1 },
  bankCounter: { text: '🏦 Il cassiere ti sorride. Strano.', anxiety: -2 },
  atm: { text: '🏧 Controlli il conto. €' + '... Meglio non guardare.', anxiety: 5 },
  vault: { text: '🔒 Le cassette forti. Dentro i sogni di altri.', anxiety: 1 }
};
