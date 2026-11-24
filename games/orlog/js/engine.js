/**
 * engine.js — risoluzione dei turni di Orlog (pura, testabile in Node).
 */

import { FACES, FAVORS, findFavor } from './config.js';

export const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export function mulberry32(seed) {
  let state = (Number(seed) || 1) >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function dailySeed(date = new Date()) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function createMatch({
  mode = 'classic', bossId = null, seed = null, hp = 15, tokens = 0,
  relics = [], talents = [], mutators = [], rounds = 1
} = {}) {
  const rng = seed === null ? Math.random : mulberry32(seed);
  return {
    mode, bossId, seed, rng, round: 1, rounds, phase: 'roll',
    rollsLeft: talents.includes('seer') ? 4 : 3,
    maxHp: hp,
    player: {
      hp, tokens: tokens + (talents.includes('blessed') ? 2 : 0),
      dice: [], locked: [], favor: null, relics: relics.slice(), talents: talents.slice()
    },
    enemy: {
      hp, tokens: 4 + Math.floor(rounds / 2), dice: [], locked: [], favor: null,
      name: bossId || 'Challenger'
    },
    mutators: mutators.slice(),
    log: [], winner: null
  };
}

export function rollDice(match, count = 6) {
  const faces = FACES.map((face) => face.id);
  const total = count + (match.mutators.includes('extra') ? 1 : 0);
  return Array.from({ length: total }, () => faces[Math.floor(match.rng() * faces.length)]);
}

export function countFaces(dice) {
  const counts = { melee: 0, block: 0, ranged: 0, shield: 0, steal: 0, token: 0 };
  for (const face of dice) if (face in counts) counts[face] += 1;
  return counts;
}

export function bestCombo(dice) {
  const counts = countFaces(dice);
  return Math.max(...Object.values(counts));
}

export function applyFavor(match, side, favorId) {
  const favor = findFavor(favorId);
  const actor = match[side], foe = match[side === 'player' ? 'enemy' : 'player'];
  const events = [];
  if (!favor || actor.tokens < favor.cost) return events;
  actor.tokens -= favor.cost;
  actor.favor = favor.id;
  events.push({ type: 'favor', side, name: favor.name });

  const relicBonus = side === 'player' && actor.relics.includes('hammer') ? 1 : 0;
  const talentBonus = side === 'player' && actor.talents.includes('warrior') ? 1 : 0;
  switch (favor.kind) {
    case 'damage': foe.hp -= favor.value; events.push({ type: 'damage', side, amount: favor.value }); break;
    case 'heal': actor.hp = Math.min(match.maxHp, actor.hp + favor.value); events.push({ type: 'heal', side, amount: favor.value }); break;
    case 'steal': {
      const amount = Math.min(favor.value, foe.tokens);
      foe.tokens -= amount; actor.tokens += amount;
      events.push({ type: 'steal', side, amount }); break;
    }
    case 'damageSteal': {
      foe.hp -= favor.value + relicBonus + talentBonus;
      const amount = Math.min(favor.extra, foe.tokens);
      foe.tokens -= amount; actor.tokens += amount;
      events.push({ type: 'damage', side, amount: favor.value + relicBonus + talentBonus });
      events.push({ type: 'steal', side, amount }); break;
    }
    case 'blockMelee': actor.blockAllMelee = true; break;
    case 'swapHp': {
      const current = actor.hp; actor.hp = foe.hp; foe.hp = current;
      events.push({ type: 'swapHp', side }); break;
    }
    case 'healDamage': {
      actor.hp = Math.min(match.maxHp, actor.hp + favor.value);
      foe.hp -= favor.value;
      events.push({ type: 'heal', side, amount: favor.value });
      events.push({ type: 'damage', side, amount: favor.value }); break;
    }
    case 'cancel': foe.favorCancelled = true; events.push({ type: 'cancel', side }); break;
    case 'gain': actor.tokens += favor.value; events.push({ type: 'gain', side, amount: favor.value }); break;
  }
  return events;
}

export function chooseAI(match) {
  const ai = match.enemy;
  const affordable = FAVORS.filter((favor) => {
    const cost = match.mutators.includes('free') ? 1 : favor.cost;
    return ai.tokens >= cost;
  });
  if (!affordable.length || match.rng() < 0.25) return null;
  if (ai.hp < match.maxHp * 0.4) {
    const heal = affordable.find((favor) => favor.kind === 'heal');
    if (heal) return heal.id;
  }
  if (match.player.hp <= 4) {
    const damage = affordable.find((favor) => favor.kind === 'damage' || favor.kind === 'damageSteal');
    if (damage) return damage.id;
  }
  return affordable[Math.floor(match.rng() * affordable.length)].id;
}

/** Risolve un round. Restituisce eventi per UI/audio. */
export function resolve(match, { playerFavor = null, aiFavor = null } = {}) {
  const events = [];
  if (match.winner) return events;
  const player = match.player, enemy = match.enemy;
  player.blockAllMelee = false; enemy.blockAllMelee = false;
  player.favorCancelled = false; enemy.favorCancelled = false;

  const cost = (favorId, side) => {
    const base = findFavor(favorId).cost;
    let value = match.mutators.includes('free') ? 1 : base;
    if (side === 'player' && player.relics.includes('runes')) value = Math.max(1, value - 1);
    return value;
  };
  const spend = (favorId, side) => { const actor = match[side]; const amount = cost(favorId, side); if (actor.tokens >= amount) actor.tokens -= amount; };

  if (playerFavor) {
    const favor = findFavor(playerFavor);
    spend(playerFavor, 'player');
    events.push({ type: 'favor', side: 'player', name: favor.name });
    applyFavorEffect(match, 'player', favor, events);
  }
  if (aiFavor && !player.favorCancelled) {
    const favor = findFavor(aiFavor);
    spend(aiFavor, 'enemy');
    events.push({ type: 'favor', side: 'enemy', name: favor.name });
    applyFavorEffect(match, 'enemy', favor, events);
  }

  const p = countFaces(player.dice), a = countFaces(enemy.dice);
  const damageMultiplier = match.mutators.includes('double') ? 2 : 1;
  const meleeBonus = player.talents.includes('warrior') ? 1 : 0;
  const rangedBonus = player.talents.includes('hunter') ? 1 : 0;
  const blockBonus = player.talents.includes('warden') || player.relics.includes('shield') ? 1 : 0;

  const pMelee = Math.max(0, p.melee + meleeBonus - a.block - (enemy.blockAllMelee ? 99 : 0)) * damageMultiplier;
  const pRanged = Math.max(0, p.ranged + rangedBonus - a.shield) * damageMultiplier;
  const aMelee = Math.max(0, a.melee - p.block - blockBonus - (player.blockAllMelee ? 99 : 0)) * damageMultiplier;
  const aRanged = Math.max(0, a.ranged - p.shield) * damageMultiplier;
  enemy.hp -= pMelee; enemy.hp -= pRanged;
  player.hp -= aMelee; player.hp -= aRanged;
  if (pMelee) events.push({ type: 'damage', side: 'player', amount: pMelee });
  if (pRanged) events.push({ type: 'damage', side: 'player', amount: pRanged });
  if (aMelee) events.push({ type: 'damage', side: 'enemy', amount: aMelee });
  if (aRanged) events.push({ type: 'damage', side: 'enemy', amount: aRanged });

  let pSteal = p.steal + (player.talents.includes('trader') ? 1 : 0);
  const pStolen = Math.min(pSteal, enemy.tokens);
  enemy.tokens -= pStolen; player.tokens += pStolen;
  if (pStolen) events.push({ type: 'steal', side: 'player', amount: pStolen });
  const aStolen = Math.min(a.steal, player.tokens);
  player.tokens -= aStolen; enemy.tokens += aStolen;
  if (aStolen) events.push({ type: 'steal', side: 'enemy', amount: aStolen });

  const pGain = p.token + (player.relics.includes('horn') ? 1 : 0);
  const aGain = a.token;
  player.tokens += pGain; enemy.tokens += aGain;
  if (pGain) events.push({ type: 'gain', side: 'player', amount: pGain });
  if (aGain) events.push({ type: 'gain', side: 'enemy', amount: aGain });
  if (player.relics.includes('apple')) {
    player.hp = Math.min(match.maxHp, player.hp + 1);
    events.push({ type: 'heal', side: 'player', amount: 1 });
  }

  player.hp = Math.max(0, player.hp);
  enemy.hp = Math.max(0, enemy.hp);
  match.combo = bestCombo(player.dice);
  match.round += 1;
  if (enemy.hp <= 0) match.winner = 'player';
  else if (player.hp <= 0) match.winner = 'enemy';
  if (match.winner) events.push({ type: 'end', winner: match.winner });
  return events;
}

function applyFavorEffect(match, side, favor, events) {
  const actor = match[side], foe = match[side === 'player' ? 'enemy' : 'player'];
  const bonus = side === 'player' && actor.relics.includes('hammer') ? 1 : 0;
  switch (favor.kind) {
    case 'damage': foe.hp -= favor.value; events.push({ type: 'damage', side, amount: favor.value }); break;
    case 'heal': actor.hp = Math.min(match.maxHp, actor.hp + favor.value); events.push({ type: 'heal', side, amount: favor.value }); break;
    case 'steal': {
      const amount = Math.min(favor.value + bonus, foe.tokens);
      foe.tokens -= amount; actor.tokens += amount;
      events.push({ type: 'steal', side, amount }); break;
    }
    case 'damageSteal': {
      const amount = Math.min(favor.extra, foe.tokens);
      foe.hp -= favor.value + bonus; foe.tokens -= amount; actor.tokens += amount;
      events.push({ type: 'damage', side, amount: favor.value + bonus });
      events.push({ type: 'steal', side, amount }); break;
    }
    case 'blockMelee': actor.blockAllMelee = true; break;
    case 'swapHp': { const value = actor.hp; actor.hp = foe.hp; foe.hp = value; events.push({ type: 'swapHp', side }); break; }
    case 'healDamage': actor.hp = Math.min(match.maxHp, actor.hp + favor.value); foe.hp -= favor.value; events.push({ type: 'damage', side, amount: favor.value }); break;
    case 'cancel': foe.favorCancelled = true; events.push({ type: 'cancel', side }); break;
    case 'gain': actor.tokens += favor.value; events.push({ type: 'gain', side, amount: favor.value }); break;
  }
}
