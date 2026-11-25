/* ============================================================================
   CATALOGO — 48 carte fisse, deterministiche e senza asset esterni.
   Gli ID sono stabili: i salvataggi possono referenziarli per sempre.
   ============================================================================ */
import { RARITIES, CARD_LEVELS, CARD_LEVEL_BONUS } from './config.js';

/* [nome, ruolo, rarità] — 20 comuni, 13 rari, 9 epici, 6 leggendari. */
const DATA = [
  ['Gianluca Paraffina', 'P', 'comune'],
  ['Marco Ballerino', 'P', 'comune'],
  ['Giggio Buffone', 'P', 'raro'],
  ['Ivan Manona', 'P', 'raro'],
  ['Manuel Noveau', 'P', 'epico'],
  ['Sir Reginald Save', 'P', 'leggendario'],

  ['Sandro Bastoni', 'D', 'comune'],
  ['Erling Fosso', 'D', 'comune'],
  ['Paolo Pallone', 'D', 'comune'],
  ['Gianni Muro', 'D', 'comune'],
  ['Alessio Rullo', 'D', 'comune'],
  ['Nicola Catenaccio', 'D', 'comune'],
  ['Fabio Chiellino', 'D', 'raro'],
  ['Diego Armando Marcatore', 'D', 'raro'],
  ['Sergio Rametto', 'D', 'raro'],
  ['Virgil Van Daino', 'D', 'epico'],
  ['Franco Beckenbue', 'D', 'epico'],
  ['Josep Piquet', 'D', 'epico'],
  ['Thiago Silvestro', 'D', 'leggendario'],
  ['Cafone', 'D', 'leggendario'],

  ['Andrea Pirlotto', 'C', 'comune'],
  ['Gennaro Gattusone', 'C', 'comune'],
  ['Marco Tardello', 'C', 'comune'],
  ['Claudio Marchisiotto', 'C', 'comune'],
  ['Daniele De Rossino', 'C', 'comune'],
  ['Roberto Baggione', 'C', 'comune'],
  ['Frank Righetto', 'C', 'raro'],
  ['Zinedine Zidano', 'C', 'raro'],
  ['Xavi Hernandone', 'C', 'raro'],
  ['Andres Iniestone', 'C', 'raro'],
  ['Luka Modricchio', 'C', 'raro'],
  ['Paul Poggio', 'C', 'epico'],
  ['Kevin De Bruno', 'C', 'epico'],
  ['Ngolo Kantino', 'C', 'epico'],
  ['Michel Platone', 'C', 'leggendario'],
  ['Lothar Mattone', 'C', 'leggendario'],

  ['Cristiano Robaldo', 'A', 'comune'],
  ['Lionel Messiolo', 'A', 'comune'],
  ['Gabriel Battistone', 'A', 'comune'],
  ['Luca Tonino', 'A', 'comune'],
  ['Alessandro Del Pierotto', 'A', 'comune'],
  ['Filippo Inzaghino', 'A', 'comune'],
  ['Ronaldo Fenomenone', 'A', 'raro'],
  ['Romario De Sovra', 'A', 'raro'],
  ['Thierry Enrico', 'A', 'raro'],
  ['Kylian Mbappone', 'A', 'epico'],
  ['Erling Haalando', 'A', 'epico'],
  ['Peleone', 'A', 'leggendario']
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rngFrom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round1 = n => Math.round(n * 10) / 10;
const round2 = n => Math.round(n * 100) / 100;

export const CATALOG = DATA.map(([name, role, rarity], i) => {
  const def = RARITIES[rarity];
  const rng = rngFrom(hash(name + '|' + role + '|' + rarity));
  const j1 = rng(), j2 = rng(), j3 = rng();
  const id = 'c' + String(i + 1).padStart(3, '0');
  return {
    id,
    name,
    role,
    rarity,
    order: i,
    skill: round1(def.skill[0] + (def.skill[1] - def.skill[0]) * (0.22 + j1 * 0.7)),
    quotazione: Math.round(def.quotazione[0] + (def.quotazione[1] - def.quotazione[0]) * (0.2 + j2 * 0.72)),
    costanza: round2(def.costanza[0] + (def.costanza[1] - def.costanza[0]) * (0.2 + j3 * 0.72))
  };
});

export const CARD_BY_ID = Object.fromEntries(CATALOG.map(c => [c.id, c]));

/* La rosa iniziale usa carte comuni: P1 D4 C3 A2. */
export const STARTER_CARD_IDS = [
  'c001', 'c007', 'c008', 'c009', 'c010',
  'c021', 'c022', 'c023', 'c037', 'c038'
];

export function getCard(id) {
  return CARD_BY_ID[id] || null;
}

export function cardsOfRarity(rarity) {
  return CATALOG.filter(c => c.rarity === rarity);
}

export function rarityRank(rarity) {
  const order = ['comune', 'raro', 'epico', 'leggendario'];
  return Math.max(0, order.indexOf(rarity));
}

/** Livello e progresso a partire dalle copie TOTALI trovate (found). */
export function levelInfo(found) {
  const n = Math.max(1, Math.floor(found || 1));
  let level = 1;
  for (let i = 1; i < CARD_LEVELS.length; i++) {
    if (n >= CARD_LEVELS[i]) level = i + 1;
  }
  const currentAt = CARD_LEVELS[level - 1];
  const nextAt = level < CARD_LEVELS.length ? CARD_LEVELS[level] : null;
  const progress = nextAt ? Math.max(0, Math.min(1, (n - currentAt) / (nextAt - currentAt))) : 1;
  return {
    level, found: n, currentAt, nextAt, progress,
    toNext: nextAt ? Math.max(0, nextAt - n) : 0,
    max: nextAt === null
  };
}

/** Statistiche effettive della carta al livello dato. */
export function cardPower(card, found) {
  const lvl = levelInfo(found);
  const steps = lvl.level - 1;
  return {
    level: lvl.level,
    skill: round1(card.skill + steps * CARD_LEVEL_BONUS.skill),
    quotazione: Math.round(card.quotazione + steps * CARD_LEVEL_BONUS.quotazione),
    costanza: round2(Math.min(0.99, card.costanza + steps * CARD_LEVEL_BONUS.costanza)),
    levelInfo: lvl
  };
}

export function starsFor(skill) {
  return Math.max(1, Math.min(5, Math.round(skill / 2)));
}
