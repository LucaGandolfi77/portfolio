/* Game Kit — meta progression: missions, achievements, XP and streaks.
   Usable as ES module in modern games and via dynamic import in classic scripts. */

import { load, store } from './storage.js';
import { grantXP, levelFor, touchStreak } from './progression.js';

export function createMetaLayer({ key, missions = [], achievements = [] }) {
  const state = load(key, {
    xp: 0, level: 1, counters: {}, missions: {}, achievements: {},
    streak: { count: 0, last: '' }, totals: { events: 0 }
  });
  state.counters = state.counters || {};
  state.missions = state.missions || {};
  state.achievements = state.achievements || {};

  function saveMeta() { store(key, state); }

  function check(defs, storeKey, event, value) {
    const unlocked = [];
    for (const def of defs) {
      if (def.event !== event || state[storeKey][def.id]) continue;
      const count = (state.counters[event] || 0);
      const target = typeof def.goal === 'function' ? def.goal(state) : (def.goal || 1);
      if (count >= target) {
        state[storeKey][def.id] = Date.now();
        const xp = def.reward || 40;
        grantXP(state, xp, def.id);
        if (def.unlock) state.unlocks = [...new Set([...(state.unlocks || []), def.unlock])];
        unlocked.push({ id: def.id, label: def.label, xp });
      }
    }
    return unlocked;
  }

  function record(event, value = 1) {
    state.counters[event] = (state.counters[event] || 0) + (typeof value === 'number' ? value : 1);
    state.totals.events++;
    state.level = levelFor(state.xp);
    const unlocked = [
      ...check(missions, 'missions', event, value),
      ...check(achievements, 'achievements', event, value)
    ];
    saveMeta();
    return unlocked;
  }

  function daily() {
    return touchStreak(state, new Date());
  }

  function summary() {
    return {
      xp: state.xp,
      level: state.level || levelFor(state.xp),
      streak: state.streak,
      missions: missions.map(m => ({ ...m, done: !!state.missions[m.id] })),
      achievements: achievements.map(a => ({ ...a, done: !!state.achievements[a.id] })),
      counters: { ...state.counters }
    };
  }

  function labelFor(list, id) {
    const def = [...missions, ...achievements].find(d => d.id === id);
    return def ? def.label : id;
  }

  function announce(unlocked, format = u => `★ ${u.label} +${u.xp} XP`) {
    return unlocked.map(format).join('  ·  ');
  }

  return { state, record, daily, summary, labelFor, announce, saveMeta };
}
