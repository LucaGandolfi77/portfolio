/* DITTOPIA — quest chain and progression (deadlock-free) */

import { QUESTS, MOVE_ORDER } from './config.js';
import { world } from './world.js';
import { pokemon } from './pokemon.js';
import * as AUDIO from './audio.js';

function placedHas(type) { return world.getPlaced().some(p => p.type === type); }

export function objectiveFor(state) {
  const q = QUESTS.find(x => x.id === state.quest.current);
  return q ? `★ ${q.title} — ${q.goal}` : '★ Kanto rinata 🌸';
}

export function setFlag(state, flag) {
  state.quest.flags[flag] = true;
  advance(state);
}

export function advance(state, notify = () => {}, dialogue = () => {}) {
  const quest = QUESTS.find(q => q.id === state.quest.current);
  if (!quest) return false;
  if (state.quest._completing === quest.id) return false;

  let done = false;
  if (quest.flag) done = !!state.quest.flags[quest.flag];
  else if (quest.need) done = Object.entries(quest.need).every(([key, amount]) => (state.player.inv[key] || 0) >= amount);
  else if (quest.place) done = quest.place.every(type => (state.player.inv[type] || 0) > 0 || placedHas(type));
  else if (quest.craft) done = (state.player.inv[quest.craft] || 0) > 0;
  else if (quest.needFriends) done = pokemon.friendsCount() >= quest.needFriends && !!state.quest.flags.cave_explored;
  else if (quest.id === 'q1') done = !!state.quest.flags.talked_tangrowth;

  if (!done) return false;

  state.quest._completing = quest.id;
  AUDIO.sfxFanfare();
  notify(`Missione completata: ${quest.title}`);
  if (quest.teaches && !state.player.moves[quest.teaches]) {
    state.player.moves[quest.teaches] = true;
    notify(`Hai imparato ${quest.teaches}!`);
  }

  const next = QUESTS.find(q => q.id === quest.next);
  state.quest.current = next ? next.id : null;
  if (next) dialogue(next.lines.map(line => `Professor Tangrowth: ${line}`));
  state.quest._completing = null;
  return true;
}

export function passive(state, notify, dialogue) {
  const current = state.quest.current;
  if (!current) return;
  if (current === 'q4') {
    const watered = (world.getSpecials().sprouts || []).filter(s => s.watered).length;
    if (watered >= 3) setFlag(state, 'watered3');
  }
  if (current === 'q8') {
    const cave = world.getSpecials().caveEntrance;
    const player = state.player;
    if (pokemon.friendsCount() >= 12 && cave && Math.abs(player.x - cave.x) < 4 && player.y < cave.y + 2) {
      setFlag(state, 'cave_explored');
    }
  }
  advance(state, notify, dialogue);
}

export function allQuests() { return QUESTS; }
