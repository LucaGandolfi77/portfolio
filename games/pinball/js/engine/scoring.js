/* Pure scoring helpers — shared by the engine, profile and tests */
import { PHYSICS, TABLES } from '../config.js';

export const MULT_STEPS = PHYSICS.MULT_STEPS;
export const multiplier = index => MULT_STEPS[Math.max(0, Math.min(MULT_STEPS.length - 1, index))];
export const formatScore = n => Math.max(0, Math.round(Number(n) || 0)).toLocaleString('en-US');
export const highKey = tableId => 'pb_high_' + tableId;
export const tableById = id => TABLES.find(t => t.id === id) || TABLES[0];
export const tableIndex = id => Math.max(0, TABLES.findIndex(t => t.id === id));

export function rankScores(items) {
  return items.slice().sort((a, b) => b.score - a.score).slice(0, 5);
}
export function isRecord(scores, tableId, score) {
  const list = scores[tableId] || [];
  return score > 0 && (list.length < 5 || score > Math.min(...list.map(x => x.score)));
}
export function challengeSeed(day = new Date().toISOString().slice(0, 10)) {
  let h = 2166136261;
  for (let i = 0; i < day.length; i++) { h ^= day.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function seededRandom(seed) {
  let a = seed >>> 0 || 1;
  return () => {
    a ^= a << 13; a ^= a >>> 17; a ^= a << 5;
    return (a >>> 0) / 4294967296;
  };
}
