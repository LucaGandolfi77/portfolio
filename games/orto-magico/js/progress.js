/** progress.js — album, record e streak (puro). */

import { SEEDS } from './config.js';
import { dailySeed } from './modes.js';

const STORIES = {
  lettuce: 'Cresce in silenzio, ma sa quando essere raccolta.',
  carrot: 'Le sue radici ricordano ogni primavera.',
  strawberry: 'Dolce solo chi ha pazienza.',
  tomato: 'Il rosso dell’estate in un boccone.',
  sunflower: 'Guarda sempre il sole, anche di notte.',
  rose: 'Ogni petalo nasconde un segreto.',
  mushroom: 'Ama l’ombra e la pioggia.',
  cactus: 'Non ha fretta: nemmeno tu dovresti averla.',
  orchid: 'Esotica, preziosa, irriducibile.',
  pepper: 'Piccante come un ricordo d’estate.',
  lettuce2: 'La versione rossa della calma.',
  pumpkin: 'Il suo peso è una promessa d’autunno.',
  wheat: 'Il grano cresce dove qualcuno ha seminato.',
  holly: 'Verde anche quando tutto dorme.',
  moonflower: 'Fiorisce solo sotto la luna.',
  starfruit: 'Un frutto caduto da una stella.',
  rainbowrose: 'Ibrido impossibile, nato nella serra.'
};

export function albumEntries(state = {}) {
  const collection = state.collection || {};
  return Object.entries(SEEDS).map(([id, seed]) => ({
    id,
    name: seed.name,
    emoji: seed.emoji,
    count: collection[id] || 0,
    story: STORIES[id] || 'Una pianta del giardino.',
    mutant: !!seed.mutant
  }));
}

export function collectionCount(state = {}) {
  return Object.keys(state.collection || {}).length;
}

export function updateStreak(state, today = dailySeed()) {
  const last = state.streak && state.streak.last;
  return {
    ...state,
    streak: { last: today, count: last === today ? state.streak.count : state.streak.count + 1 }
  };
}

export function shareText(state = {}) {
  return `🌿 Orto Magico — ${state.totalHarvests || 0} raccolti · ${state.level || 1} livello · ${collectionCount(state)}/${Object.keys(SEEDS).length} varietà · ${state.coins || 0} monete`;
}

export function bestHarvest(state = {}) { return state.bestHarvest || 0; }

export function seasonProgress(state = {}) {
  const done = (state.seasonsHarvested || []).length;
  return { done, total: 4, ratio: done / 4 };
}
