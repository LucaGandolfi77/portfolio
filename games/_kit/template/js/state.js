import { load, store } from '../../storage.js';

const KEY = 'gametemplate.save.v1';
export const state = load(KEY, { best: 0, runs: 0, sound: true });
export function save() { store(KEY, state); }
export function record(score) {
  state.runs++;
  const isRecord = score > state.best;
  if (isRecord) state.best = score;
  save();
  return isRecord;
}
