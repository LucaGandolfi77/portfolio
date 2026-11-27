/* ============================================================
   Agente Zero — "Operazione Zero": 6 chapters × 6 missions (pure)
   ------------------------------------------------------------
   Mission types:
     make    baskets out of `shots`
     swish   clean baskets out of `shots`
     streak  longest run of baskets within `shots`
     clock   points before `time` runs out
     buzzer  baskets with a few seconds for every shot
     duel    more baskets than the rival out of `shots`
   `stars` are the thresholds for one, two and three stars.
   ============================================================ */
import { spotAt as S } from './court-data.js';

const m = (type, shots, stars, spots, extra = {}) => ({ type, shots, stars, spots, ...extra });
const wind = (x, y = 0) => ({ wind: [x, y] });
const moving = (amp, freq) => ({ moving: { amp, freq } });
/** A defender one step in front of the first spot, toward the hoop. */
const guard = (spot, period = 2.2) => {
  const l = Math.hypot(spot.x, spot.y) || 1;
  return { defender: { x: spot.x * (1 - 1.15 / l), y: spot.y * (1 - 1.15 / l), period } };
};

export const CHAPTERS = [
  {
    id: 'bunker', place: 'bunker',
    name: { it: 'Il Bunker', en: 'The Bunker' },
    op: { it: 'Operazione Ruggine', en: 'Operation Rust' },
    intro: {
      it: 'Nives: «Ho giocato dodici anni da playmaker. Tu hai un campetto, una rete di ferro e un pallone sgonfio. Basta. Da oggi sei Agente Zero: zero scuse.»',
      en: 'Nives: “Twelve years I played point guard. You have a cage court, a chain fence and a flat ball. Good enough. From today you are Agent Zero: zero excuses.”',
    },
    missions: [
      m('make', 6, [2, 3, 5], [S(0, 3)]),
      m('make', 8, [3, 5, 6], [S(-40, 3.6), S(40, 3.6)]),
      m('swish', 8, [1, 2, 4], [S(0, 4.2)]),
      m('streak', 10, [2, 3, 5], [S(0, 3.8)]),
      m('clock', 99, [8, 12, 18], [S(-35, 3.5), S(0, 4.2), S(35, 3.5)], { time: 40 }),
      m('duel', 8, [4, 5, 6], [S(0, 4.2), S(-30, 4.8), S(30, 4.8)], { rival: 3 }),
    ],
  },
  {
    id: 'gym', place: 'gym',
    name: { it: 'La palestra', en: 'The school gym' },
    op: { it: 'Operazione Gesso', en: 'Operation Chalk' },
    intro: {
      it: 'Nives: «Parquet consumato, odore di gomma. Qui si impara la media distanza, quella che nessuno vuole più allenare.»',
      en: 'Nives: “Worn floorboards, smell of rubber. Here you learn the mid-range, the shot nobody wants to practise anymore.”',
    },
    missions: [
      m('make', 8, [3, 5, 6], [S(-28, 5.2), S(28, 5.2)]),
      m('swish', 10, [2, 3, 5], [S(0, 4.2), S(-60, 4.5), S(60, 4.5)]),
      m('buzzer', 8, [3, 4, 6], [S(-45, 4.5), S(15, 5), S(55, 4)], { clock: 5 }),
      m('streak', 10, [3, 4, 6], [S(0, 5)]),
      m('clock', 99, [12, 18, 26], [S(-50, 4.4), S(-20, 5.2), S(20, 5.2), S(50, 4.4)], { time: 45 }),
      m('duel', 10, [5, 6, 8], [S(-35, 5.4), S(0, 5.6), S(35, 5.4)], { rival: 4 }),
    ],
  },
  {
    id: 'roof', place: 'roof',
    name: { it: 'Il tetto', en: 'The rooftop' },
    op: { it: 'Operazione Antenna', en: 'Operation Antenna' },
    intro: {
      it: 'Nives: «Sesto piano. Il vento non lo vedi, vedi la bandierina. Mira dove la palla vuole andare, non dove vorresti tu.»',
      en: 'Nives: “Sixth floor. You cannot see wind, you see the flag. Aim where the ball wants to go, not where you wish it would.”',
    },
    missions: [
      m('make', 8, [3, 4, 6], [S(0, 4.2)], wind(1.2)),
      m('make', 8, [3, 4, 6], [S(-40, 4.8), S(40, 4.8)], wind(-1.6)),
      m('swish', 10, [2, 3, 4], [S(0, 4.8)], wind(1.8)),
      m('buzzer', 8, [3, 4, 6], [S(-25, 5), S(25, 5)], { clock: 5, ...wind(-1.4, 0.6) }),
      m('make', 8, [2, 4, 5], [S(-45, 6.8), S(0, 6.8)], wind(1.4)),
      m('duel', 10, [4, 5, 7], [S(-30, 5.6), S(30, 5.6), S(0, 6.8)], { rival: 3, ...wind(-2, 0) }),
    ],
  },
  {
    id: 'beach', place: 'beach',
    name: { it: 'Il lungomare', en: 'The seafront' },
    op: { it: 'Operazione Salsedine', en: 'Operation Sea Salt' },
    intro: {
      it: 'Kappa: «Il canestro è su un carrello dei gelati. Si muove. Come le tue certezze, Zero.»',
      en: 'Kappa: “The hoop is bolted to an ice-cream cart. It moves. Like your confidence, Zero.”',
    },
    missions: [
      m('make', 8, [2, 4, 5], [S(0, 3.6)], moving(0.35, 0.16)),
      m('make', 10, [3, 4, 6], [S(-30, 4.4), S(30, 4.4)], moving(0.45, 0.18)),
      m('streak', 12, [2, 3, 5], [S(0, 4.2)], moving(0.4, 0.2)),
      m('clock', 99, [10, 16, 22], [S(-30, 4), S(0, 4.5), S(30, 4)], { time: 50, ...moving(0.35, 0.15) }),
      m('make', 8, [3, 4, 6], [S(-86, 6.7), S(86, 6.7)], wind(1)),
      m('duel', 10, [4, 5, 6], [S(0, 5), S(-45, 4.6), S(45, 4.6)], { rival: 3, ...moving(0.5, 0.2) }),
    ],
  },
  {
    id: 'hall', place: 'hall',
    name: { it: 'Il palazzetto', en: 'The county hall' },
    op: { it: 'Operazione Muraglia', en: 'Operation Great Wall' },
    intro: {
      it: 'Nives: «Torneo regionale. Davanti avrai mani. Non tirare contro le mani: tira quando scendono.»',
      en: 'Nives: “County tournament. There will be hands in your face. Do not shoot into them: shoot when they drop.”',
    },
    missions: [
      m('make', 8, [3, 4, 6], [S(0, 4.4)], guard(S(0, 4.4), 2.6)),
      m('make', 8, [3, 4, 6], [S(-45, 5)], guard(S(-45, 5), 2.2)),
      m('buzzer', 8, [3, 4, 5], [S(30, 5.4)], { clock: 5, ...guard(S(30, 5.4), 2.4) }),
      m('streak', 12, [3, 4, 6], [S(0, 5.2)], guard(S(0, 5.2), 2.2)),
      m('clock', 99, [14, 20, 28], [S(-45, 6.8), S(-20, 5), S(20, 5), S(45, 6.8)], { time: 50 }),
      m('duel', 10, [5, 6, 7], [S(0, 6.8)], { rival: 4, ...guard(S(0, 6.8), 2) }),
    ],
  },
  {
    id: 'arena', place: 'arena',
    name: { it: 'L’arena della finale', en: 'The final arena' },
    op: { it: 'Operazione Zero', en: 'Operation Zero' },
    intro: {
      it: 'Nives: «Ottomila persone. Ascoltane zero. Ci sei tu, il ferro e il numero che porti.»',
      en: 'Nives: “Eight thousand people. Hear zero of them. There is you, the rim and the number on your back.”',
    },
    missions: [
      m('make', 8, [3, 5, 6], [S(-45, 6.85), S(0, 6.85), S(45, 6.85)]),
      m('swish', 10, [2, 3, 5], [S(-86, 6.7), S(86, 6.7), S(0, 5)]),
      m('buzzer', 8, [2, 4, 5], [S(0, 7.4), S(-30, 7), S(30, 7)], { clock: 4 }),
      m('clock', 99, [15, 22, 32], [S(-60, 6.8), S(-25, 5), S(25, 6.8), S(60, 5)], { time: 55 }),
      m('make', 6, [1, 2, 3], [S(0, 12.4)]),
      m('duel', 10, [6, 7, 8], [S(-40, 6.85), S(0, 7), S(40, 6.85)], { rival: 5, final: true }),
    ],
  },
];

export const missionId = (c, i) => `${CHAPTERS[c].id}-${i + 1}`;
export const getMission = (c, i) => CHAPTERS[c]?.missions[i] || null;
export const chapterStars = (stars, c) => CHAPTERS[c].missions.reduce((n, _, i) => n + (stars[missionId(c, i)] || 0), 0);
export const totalStars = (stars) => CHAPTERS.reduce((n, _, c) => n + chapterStars(stars, c), 0);
export const STARS_PER_CHAPTER = 8;

export function chapterUnlocked(stars, c) {
  if (c === 0) return true;
  const prevDone = CHAPTERS[c - 1].missions.every((_, i) => (stars[missionId(c - 1, i)] || 0) > 0);
  return prevDone && totalStars(stars) >= c * STARS_PER_CHAPTER;
}

export function missionUnlocked(stars, c, i) {
  if (!chapterUnlocked(stars, c)) return false;
  return i === 0 || (stars[missionId(c, i - 1)] || 0) > 0;
}
