/* Pure progression, inventory and quest logic */
import { ITEMS, SKILLS, QUESTS, LEVEL_XP, VERSION } from '../config.js';

export const getItem = id => ITEMS.find(i => i.id === id);
export const getSkill = id => SKILLS.find(s => s.id === id);
const clone = s => JSON.parse(JSON.stringify(s));

export function initialState() {
  return {
    version: VERSION,
    level: 1, xp: 0, gold: 0,
    hp: 100, maxHp: 100, mana: 60, maxMana: 60,
    kills: 0, totalGold: 0, cryptKills: 0,
    zone: 'grove', x: 410, y: 300, facing: 1,
    inventory: [
      { itemId: 'health_potion', quantity: 3 },
      { itemId: 'mana_potion', quantity: 2 },
      { itemId: 'wooden_sword', quantity: 1 }
    ],
    equipment: { weapon: 'wooden_sword', armor: null, shield: null, accessory: null },
    cooldowns: Object.fromEntries(SKILLS.map(s => [s.id, 0])),
    quests: Object.fromEntries(QUESTS.map(q => [q.id, 0])),
    claimed: []
  };
}

export function stats(state) {
  let attack = 2 + (state.level - 1) * 2;
  let defense = state.level - 1;
  Object.values(state.equipment).forEach(id => {
    const item = getItem(id);
    if (!item?.effect) return;
    if (item.effect.type === 'attack') attack += item.effect.value;
    if (item.effect.type === 'defense') defense += item.effect.value;
  });
  return { attack, defense };
}

export function addXp(state, amount) {
  const next = clone(state);
  next.xp += amount;
  let levels = 0;
  while (next.xp >= LEVEL_XP(next.level)) {
    next.xp -= LEVEL_XP(next.level);
    next.level++;
    next.maxHp += 18; next.hp = next.maxHp;
    next.maxMana += 10; next.mana = next.maxMana;
    levels++;
  }
  return { state: next, levels };
}

export function addLoot(state, gold, xp) {
  let next = clone(state);
  next.gold += gold; next.totalGold += gold; next.kills++;
  const r = addXp(next, xp);
  next = r.state;
  return { state: next, levels: r.levels };
}

export function useItem(state, index) {
  const slot = state.inventory[index];
  const item = getItem(slot?.itemId);
  if (!item || item.type !== 'consumable') return null;
  const next = clone(state);
  if (item.effect.type === 'heal') next.hp = Math.min(next.maxHp, next.hp + item.effect.value);
  if (item.effect.type === 'mana') next.mana = Math.min(next.maxMana, next.mana + item.effect.value);
  if (slot.quantity > 1) next.inventory[index].quantity--;
  else next.inventory.splice(index, 1);
  return next;
}

export function equipItem(state, index) {
  const slot = state.inventory[index];
  const item = getItem(slot?.itemId);
  if (!item || !item.slot) return null;
  const next = clone(state);
  const old = next.equipment[item.slot];
  next.equipment[item.slot] = item.id;
  next.inventory.splice(index, 1);
  if (old) {
    const existing = next.inventory.find(s => s.itemId === old);
    if (existing) existing.quantity++;
    else next.inventory.push({ itemId: old, quantity: 1 });
  }
  return next;
}

export function dropItem(state, index) {
  if (!state.inventory[index]) return null;
  const next = clone(state);
  next.inventory.splice(index, 1);
  return next;
}

export function buyItem(state, itemId) {
  const item = getItem(itemId);
  if (!item || state.gold < item.price) return null;
  const next = clone(state);
  next.gold -= item.price;
  const existing = next.inventory.find(s => s.itemId === itemId);
  if (existing) existing.quantity++;
  else next.inventory.push({ itemId, quantity: 1 });
  return next;
}

export function questProgress(state, kind, value, zoneId) {
  const next = clone(state);
  const events = [];
  if (kind === 'kill') {
    if (zoneId === 'crypt') next.cryptKills += value;
    next.quests.first_blood = Math.min(5, next.quests.first_blood + value);
    next.quests.crypt_guardian = Math.min(4, next.quests.crypt_guardian + (zoneId === 'crypt' ? value : 0));
  }
  if (kind === 'gold') next.quests.treasure = Math.min(80, next.quests.treasure + value);
  QUESTS.forEach(q => {
    if (next.quests[q.id] >= q.goal && !next.claimed.includes(q.id)) events.push(q.id);
  });
  return { state: next, ready: events };
}

export function claimQuest(state, id) {
  const q = QUESTS.find(x => x.id === id);
  if (!q || state.quests[id] < q.goal || state.claimed.includes(id)) return null;
  const next = clone(state);
  next.claimed.push(id);
  next.gold += q.reward;
  return next;
}

export function tickCooldowns(state, dt) {
  const next = clone(state);
  let changed = false;
  SKILLS.forEach(s => {
    if (next.cooldowns[s.id] > 0) {
      next.cooldowns[s.id] = Math.max(0, next.cooldowns[s.id] - dt);
      changed = true;
    }
  });
  return changed ? next : state;
}

/* Validate persisted saves against the current schema. */
export function normalize(raw) {
  const base = initialState();
  if (!raw || typeof raw !== 'object' || raw.version !== VERSION) return base;
  const out = { ...base, ...raw };
  out.inventory = Array.isArray(raw.inventory) ? raw.inventory.filter(s => getItem(s.itemId)) : base.inventory;
  out.equipment = { ...base.equipment, ...(raw.equipment || {}) };
  out.cooldowns = { ...base.cooldowns, ...(raw.cooldowns || {}) };
  out.quests = { ...base.quests, ...(raw.quests || {}) };
  out.claimed = Array.isArray(raw.claimed) ? raw.claimed : [];
  out.hp = Math.max(0, Math.min(out.maxHp, Number(out.hp) || 0));
  out.mana = Math.max(0, Math.min(out.maxMana, Number(out.mana) || 0));
  return out;
}
