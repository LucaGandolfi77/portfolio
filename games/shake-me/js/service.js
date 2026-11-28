/* ============================================================
   Shake Me — evenings, customers, daily challenge (pure)
   ============================================================ */
import { seededRandom, dailySeed } from '../../_kit/core.js';
import { RECIPES } from './data/recipes.js';
import { BY_ID } from './data/ingredients.js';
import { starsOf, TIERS } from './judge.js';

export const NIGHTS = 12;
export const ORDERS = 5;
export const PASS = 55;

/** How hard a recipe is to make, for the order the bar learns them. */
export function effort(r) {
  const lines = r.ings.filter((l) => !l.optional);
  const counted = lines.filter((l) => l.unit !== 'ml' && l.unit !== 'some').length;
  const odd = lines.filter((l) => l.stage !== 'base').length;
  const tech = { build: 0, stir: 1.5, shake: 1.5, swizzle: 2.5, blend: 2.5 }[r.method];
  return lines.length + counted * 0.5 + odd + tech + (r.muddle ? 2 : 0) + (r.rim && !r.rimOptional ? 1 : 0)
    + r.garnish.filter((g) => !g.optional).length * 0.3;
}

const IBA = RECIPES.filter((r) => r.iba);
const ZERO = RECIPES.filter((r) => !r.iba);
const ORDERED = [...IBA].sort((a, b) => effort(a) - effort(b) || a.id.localeCompare(b.id));

/** The new cocktails of each evening: 102 split as evenly as possible. */
export const NIGHT_MENU = Array.from({ length: NIGHTS }, (_, n) => {
  const from = Math.round((n * IBA.length) / NIGHTS), to = Math.round(((n + 1) * IBA.length) / NIGHTS);
  return ORDERED.slice(from, to).map((r) => r.id);
});

export const tierOf = (night) => (night < 4 ? 'easy' : night < 8 ? 'medium' : 'hard');

export const CUSTOMERS = [
  { id: 'ada', color: '#d9775b', hair: '#2b1b14', it: 'Ada, la maestra di yoga', en: 'Ada, the yoga teacher' },
  { id: 'bruno', color: '#5b7fd9', hair: '#d8d2c8', it: 'Bruno, il tassista in pensione', en: 'Bruno, the retired cabbie' },
  { id: 'cleo', color: '#b05bd9', hair: '#d8a24a', it: 'Cleo, la violinista', en: 'Cleo, the violinist' },
  { id: 'dario', color: '#5bb07a', hair: '#1c1410', it: 'Dario, l’architetto', en: 'Dario, the architect' },
  { id: 'elsa', color: '#d9b45b', hair: '#7a2e1a', it: 'Elsa, la giornalista', en: 'Elsa, the reporter' },
  { id: 'farid', color: '#5bc4d9', hair: '#14100c', it: 'Farid, lo chef', en: 'Farid, the chef' },
  { id: 'greta', color: '#d95b8f', hair: '#e8d6a8', it: 'Greta e Ugo, sposi da ieri', en: 'Greta and Ugo, married yesterday' },
  { id: 'hiro', color: '#7a7ad9', hair: '#0c0c10', it: 'Hiro, il turista curioso', en: 'Hiro, the curious tourist' },
  { id: 'irma', color: '#a8a8a8', hair: '#f2f2f2', it: 'Irma, novant’anni e un Negroni', en: 'Irma, ninety and a Negroni' },
  { id: 'luca', color: '#d98a3e', hair: '#4a2e1a', it: 'Luca, l’autista astemio', en: 'Luca, the sober driver', sober: true },
];

/** The five orders of an evening: three new cocktails, two already known. */
export function nightOrders(night, seed = 0) {
  const rng = seededRandom(seed * 131 + night * 7919 + 17);
  for (let i = 0; i < 5; i++) rng();
  const pick = (list) => list.splice(Math.floor(rng() * list.length), 1)[0];
  const fresh = [...NIGHT_MENU[night]];
  const old = NIGHT_MENU.slice(0, night).flat();
  const ids = [];
  const newCount = night === 0 ? ORDERS : 3;
  for (let i = 0; i < newCount && fresh.length; i++) ids.push(pick(fresh));
  while (ids.length < ORDERS) ids.push(old.length ? pick(old) : pick(fresh));
  // every third evening the sober driver comes in
  if (night % 3 === 2) ids[ORDERS - 1] = ZERO[((night / 3) | 0) % ZERO.length].id;
  const people = CUSTOMERS.filter((c) => !c.sober);
  return ids.map((id) => ({
    recipe: id,
    customer: ZERO.some((z) => z.id === id) ? 'luca' : people[Math.floor(rng() * people.length)].id,
  }));
}

/** The average needed to pass an evening: lower while the marks are on the jigger. */
export const passOf = (night) => TIERS[tierOf(night)].pass ?? PASS;

export function nightResult(scores, night = 4) {
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const pass = passOf(night);
  return { avg, pass, passed: avg >= pass, stars: avg >= pass ? Math.max(1, starsOf(avg)) : 0 };
}

/** Recipes the player may pick freely: everything of the evenings reached. */
export function unlockedRecipes(nightStars) {
  let reached = 0;
  while (reached + 1 < NIGHTS && (nightStars[reached] || 0) > 0) reached++;
  const ids = new Set(NIGHT_MENU.slice(0, reached + 1).flat());
  const zeros = ZERO.filter((_, i) => i * 3 + 2 <= reached + 2 || i < 2).map((r) => r.id);
  return [...ids, ...zeros];
}

export function dailyOrders(seed = dailySeed()) {
  const rng = seededRandom(seed);
  for (let i = 0; i < 8; i++) rng();
  const list = [...IBA];
  return Array.from({ length: 3 }, () => list.splice(Math.floor(rng() * list.length), 1)[0].id);
}

/** A random cocktail for the "by heart" mode, from those already made. */
export function memoryPick(madeIds, rng = Math.random, avoid = null) {
  const pool = madeIds.filter((id) => id !== avoid && BY_ID && RECIPES.some((r) => r.id === id && r.iba));
  const list = pool.length ? pool : NIGHT_MENU[0];
  return list[Math.floor(rng() * list.length)];
}
