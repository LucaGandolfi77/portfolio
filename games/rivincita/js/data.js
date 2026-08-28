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
  { id: 'casa',      name: 'Casa di Marco', emoji: '🏠', col: 0, row: 4, color: '#7f9cf5', kind: 'home' },
  { id: 'market',    name: 'Minimarket',    emoji: '🏪', col: 1, row: 4, color: '#f6ad55', kind: 'job', job: 'cashier' },
  { id: 'pizza',     name: 'Pizzeria "La Svolta"', emoji: '🍕', col: 2, row: 2, color: '#fc8181', kind: 'job', job: 'pizza' },
  { id: 'taxi',      name: 'Taxi Stazione', emoji: '🚕', col: 3, row: 4, color: '#f6e05e', kind: 'job', job: 'taxi' },
  { id: 'bar',       name: 'Bar Centrale',  emoji: '☕', col: 4, row: 1, color: '#b794f4', kind: 'shop' },
  { id: 'posta',     name: 'Ufficio Postale', emoji: '✉️', col: 5, row: 2, color: '#63b3ed', kind: 'service' },
  { id: 'ufficio',   name: 'Sede "Merloni SRL"', emoji: '🏢', col: 1, row: 2, color: '#a0aec0', kind: 'office' },
  { id: 'parco',     name: 'Parco delle Sette Lune', emoji: '🌳', col: 4, row: 4, color: '#9ae6b4', kind: 'park', big: true },
  { id: 'discoteca', name: 'Discoteca "Zero Luce"', emoji: '🪩', col: 6, row: 1, color: '#e879f9', kind: 'shop' },
  { id: 'banca',     name: 'Banca Centrale', emoji: '🏦', col: 7, row: 5, color: '#fbbf24', kind: 'service' },
  { id: 'palestra',  name: 'Palestra "Sudore & Co."', emoji: '🏋️', col: 0, row: 0, color: '#60a5fa', kind: 'shop' },
  { id: 'biblioteca',name: 'Biblioteca Civica', emoji: '📚', col: 7, row: 2, color: '#94a3b8', kind: 'service' },
  { id: 'meccanico', name: 'Autofficina "Gino"', emoji: '🛠️', col: 8, row: 1, color: '#f472b6', kind: 'shop' },
  { id: 'ospedale',  name: 'Ospedale Civile', emoji: '🏥', col: 9, row: 3, color: '#fca5a5', kind: 'service' },
  { id: 'stazione',  name: 'Stazione Centrale', emoji: '🚉', col: 8, row: 6, color: '#67e8f9', kind: 'service' },
  { id: 'cinema',    name: 'Cinema "Rivincita"', emoji: '🎬', col: 9, row: 0, color: '#c084fc', kind: 'shop' },
  { id: 'serra',     name: 'Serra Comunale', emoji: '🌻', col: 9, row: 7, color: '#bef264', kind: 'shop' }
];
DATA.PARK_CELLS = [[4, 4], [5, 4]];

// --- personaggi con nome (danno side-quest) ---
DATA.CHARS = [
  { id: 'rosa',      name: 'Rosa la barista', emoji: '🧑', color: '#e879f9', home: 'bar', quest: 'caffe' },
  { id: 'senzanome', name: 'Il Senzanome',    emoji: '🧔', color: '#8d6e63', home: 'parco', quest: 'anello' },
  { id: 'conti',     name: 'Agente Conti',    emoji: '👮', color: '#3b82f6', home: 'posta', quest: 'pacchi' }
];

// --- modelli di auto (ognuno disegnato diversamente) ---
DATA.CAR_MODELS = {
  city:    { name: 'Utilitaria', w: 34, h: 20 },
  berlina: { name: 'Berlina',    w: 42, h: 24 },
  suv:     { name: 'SUV',        w: 46, h: 28, roof: true },
  sport:   { name: 'Sportiva',   w: 44, h: 22, spoiler: true },
  van:     { name: 'Furgone',    w: 50, h: 26, box: true },
  taxi:    { name: 'Taxi',       w: 42, h: 24 },
  police:  { name: 'Polizia',    w: 42, h: 24 }
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
  { x: 0, y: 2300 },     { x: -2100, y: -500 }
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
  'La banca approva i prestiti più in fretta dei miei sogni.'
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
  { x: 0,     y: 2250,  text: 'STAZIONE: parti, se puoi. Torna, se vuoi.' }
];

// --- armi (satiriche, mai letali) ---
DATA.WEAPONS = [
  { id: 'fionda', name: 'Fionda',     emoji: '🪀', owned: true,  cost: 0,   cd: 0.5, dmg: 0, desc: 'Colpisce i passanti: li stordisce (in senso buono).' },
  { id: 'acqua',  name: 'Pistola ad acqua', emoji: '💦', owned: false, cost: 10, cd: 0.25, dmg: 0, desc: 'Rinfresca: rallenta la polizia e ti calma (ansia -3).' },
  { id: 'urlo',   name: 'Urlo liberatorio', emoji: '😤', owned: false, cost: 0,  cd: 8,   dmg: 0, desc: 'Grida: spinge via i passanti, ansia -15. Si sblocca al cap. 6.' }
];
DATA.WEAPON_UNLOCK = { urlo: 5 };   // capitolo minimo per l'urlo

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
  acqua: 10
};
DATA.PAY = {
  pizza: 12, pizzaBonus: 6,
  taxi: 15, taxiBonus: 8,
  cashier: 35,
  arcade: 5,
  raceBase: 60
};
