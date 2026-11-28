/* ============================================================
   Ultimo Colore — the turn-based battle (pure, no DOM)
   ------------------------------------------------------------
   createBattle → next() says whose turn it is → heroAct() or
   enemyAct() with the timing results → a list of events for the
   screen to play. Nothing here reads the clock.
   ============================================================ */
import { HEROES, statsAt, skillsAt, ITEMS } from '../data/party.js';
import { ENEMIES } from '../data/enemies.js';
import { MEMORY } from '../data/memories.js';
import { rules } from './timing.js';

export const AP_MAX = 9;
export const AP_START = 3;
export const SPARKS_PER_TURN = 3;
const TAP = { perfect: 1.3, good: 1, miss: 0.65 };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Sum of a memory effect over a hero's equipped memories. */
export const fx = (hero, key) => hero.memories.reduce((n, id) => n + (MEMORY[id]?.fx[key] || 0), 0);

function makeHero(id, level, opts) {
  const base = statsAt(id, level);
  const memories = (opts.equipped?.[id] || []).filter((m) => MEMORY[m]);
  const h = {
    side: 'hero', id, name: HEROES[id].name, memories, level,
    ap: AP_START, sparks: 0, tempo: 0, charge: 0, shield: 0, endured: false, attacked: false,
  };
  h.maxHp = Math.round(base.hp * (1 + fx(h, 'hp')));
  h.atk = base.atk * (1 + fx(h, 'atk'));
  h.spd = base.spd + fx(h, 'spd');
  const share = opts.hp?.[id];
  h.hp = share === undefined ? h.maxHp : clamp(Math.round(h.maxHp * share), 1, h.maxHp);
  h.ap = Math.min(AP_MAX, h.ap + fx(h, 'startAp'));
  h.shield = Math.round(h.maxHp * fx(h, 'shield'));
  return h;
}

function makeEnemy(type, i) {
  const e = ENEMIES[type];
  return { side: 'enemy', id: `${type}-${i}`, type, name: e.name, hp: e.hp, maxHp: e.hp, atk: e.atk, spd: e.spd, brk: 0, brkMax: e.brk, broken: false, skip: false, burn: 0, marked: 0, weak: false, phase: 1, lastMove: null };
}

export function createBattle({ party, level = 1, enemies, difficulty = 'normal', items = {}, equipped = {}, hp = {}, autoParry = false, rng = Math.random, advantage = null }) {
  const b = {
    heroes: party.map((id) => makeHero(id, level, { equipped, hp })),
    enemies: enemies.map(makeEnemy),
    difficulty, autoParry, rng, advantage, items: { olio: 0, cera: 0, ...items },
    round: 0, queue: [], current: null, wide: 0, over: null, sparksLeft: SPARKS_PER_TURN, dragged: false,
    stats: { parries: 0, perfects: 0, hitsTaken: 0 },
  };
  // striking first: a little more breath to begin with
  if (advantage === 'party') for (const h of b.heroes) h.ap = Math.min(AP_MAX, h.ap + 1);
  return b;
}

export const living = (list) => list.filter((a) => a.hp > 0);
export const find = (b, id) => b.heroes.find((h) => h.id === id) || b.enemies.find((e) => e.id === id);

function checkOver(b) {
  if (!living(b.enemies).length) b.over = 'win';
  else if (!living(b.heroes).length) b.over = 'lose';
  return b.over;
}

const vary = (b) => 0.93 + b.rng() * 0.14;

/** Ombra, the lantern dog, helps between rounds. */
function ombra(b, events) {
  if (b.round < 2 || b.rng() > 0.24) return;
  if (b.items.olio < 2 && b.rng() < 0.5) { b.items.olio++; events.push({ t: 'ombra', what: 'olio' }); return; }
  const list = living(b.enemies).filter((e) => !e.broken);
  if (!list.length) return;
  const e = list[Math.floor(b.rng() * list.length)];
  events.push({ t: 'ombra', what: 'bark', target: e.id });
  addBreak(b, e, 14, events);
}

/** Moves to the next turn. Returns {type: 'hero'|'enemy'|'win'|'lose', actor, move, events}. */
export function next(b) {
  const events = [];
  for (let guard = 0; guard < 80; guard++) {
    if (checkOver(b)) return { type: b.over, events };
    if (!b.queue.length) {
      b.round++;
      ombra(b, events);
      // in the first round whoever surprised the other acts first
      const first = b.round === 1 && b.advantage ? (b.advantage === 'party' ? 'hero' : 'enemy') : null;
      b.queue = [...living(b.heroes), ...living(b.enemies)]
        .sort((x, y) => (first ? (y.side === first) - (x.side === first) : 0) || (y.spd + (y.tempo || 0)) - (x.spd + (x.tempo || 0)) || (x.side === 'hero' ? -1 : 1))
        .map((a) => a.id);
      continue;
    }
    const actor = find(b, b.queue.shift());
    if (!actor || actor.hp <= 0) continue;
    if (actor.side === 'hero') {
      if (fx(actor, 'mend') && actor.hp < actor.maxHp / 3) heal(actor, actor.maxHp * fx(actor, 'mend'), events);
      b.current = actor.id;
      b.sparksLeft = SPARKS_PER_TURN;
      return { type: 'hero', actor, events };
    }
    if (actor.burn > 0) {
      actor.burn--;
      damage(b, actor, Math.max(4, actor.maxHp * 0.05), events, 'burn');
      if (actor.hp <= 0) continue;
    }
    if (actor.skip) {
      actor.skip = false;
      if (actor.broken) { actor.broken = false; actor.brk = 0; events.push({ t: 'recover', target: actor.id }); }
      else events.push({ t: 'stagger', target: actor.id });
      continue;
    }
    b.current = actor.id;
    return { type: 'enemy', actor, move: chooseMove(b, actor), events };
  }
  return { type: 'lose', events };
}

export function movesOf(enemy) {
  const e = ENEMIES[enemy.type];
  return enemy.phase > 1 && e.phase ? [...e.moves, ...e.phase.moves] : e.moves;
}

function chooseMove(b, enemy) {
  const list = movesOf(enemy).filter((m) => m.id !== enemy.lastMove);
  const pool = list.length ? list : movesOf(enemy);
  const move = pool[Math.floor(b.rng() * pool.length)];
  enemy.lastMove = move.id;
  const heroes = living(b.heroes);
  const target = move.target === 'all' ? heroes.map((h) => h.id) : [heroes[Math.floor(b.rng() * heroes.length)].id];
  return { ...move, targets: target };
}

function heal(hero, amount, events) {
  if (hero.hp <= 0) return;
  const v = Math.min(hero.maxHp - hero.hp, Math.round(amount * (1 + fx(hero, 'healUp'))));
  hero.hp += v;
  if (v > 0) events.push({ t: 'heal', target: hero.id, amount: v });
}

function gainAp(hero, n, events) {
  const v = Math.min(AP_MAX - hero.ap, n);
  hero.ap += v;
  if (v > 0) events.push({ t: 'ap', target: hero.id, amount: v });
}

function addBreak(b, enemy, amount, events) {
  if (enemy.hp <= 0 || enemy.broken) return;
  enemy.brk = Math.min(enemy.brkMax, enemy.brk + Math.round(amount));
  if (enemy.brk >= enemy.brkMax) {
    enemy.broken = true;
    enemy.skip = true;
    events.push({ t: 'break', target: enemy.id });
  }
}

function damage(b, enemy, raw, events, kind = 'hit') {
  if (enemy.hp <= 0) return 0;
  const k = (enemy.broken ? 1.5 : 1) * (enemy.marked > 0 ? 1.25 : 1);
  const v = Math.max(1, Math.round(raw * (kind === 'burn' ? 1 : k)));
  enemy.hp = Math.max(0, enemy.hp - v);
  events.push({ t: 'damage', target: enemy.id, amount: v, kind });
  const spec = ENEMIES[enemy.type].phase;
  if (spec && enemy.phase === 1 && enemy.hp > 0 && enemy.hp <= enemy.maxHp * spec.at) {
    enemy.phase = 2;
    enemy.atk *= spec.atk;
    events.push({ t: 'phase', target: enemy.id, line: spec.line });
  }
  if (enemy.hp === 0) events.push({ t: 'fall', target: enemy.id });
  return v;
}

/** A hero's damage multiplier from passives and memories. */
function power(hero) {
  let k = 1 + hero.tempo * 0.08;
  if (hero.hp < hero.maxHp / 3) k += fx(hero, 'fury');
  return k;
}

export const canUse = (b, hero, action) => {
  if (b.over || hero.hp <= 0 || b.current !== hero.id) return false;
  if (action.kind === 'attack') return true;
  if (action.kind === 'spark') return hero.ap >= 1 && b.sparksLeft > 0;
  if (action.kind === 'item') return (b.items[action.item] || 0) > 0;
  const s = skillsAt(hero.id, hero.level).find((x) => x.id === action.skill);
  return !!s && hero.ap >= s.ap;
};

/**
 * The acting hero does something.
 * action: {kind: 'attack'|'skill'|'spark'|'item', skill, item, target, taps: []}
 * A spark does not end the turn; everything else does.
 */
export function heroAct(b, heroId, action) {
  const hero = find(b, heroId);
  if (!hero || !canUse(b, hero, action)) return null;
  const events = [];
  const taps = action.taps?.length ? action.taps : ['good'];
  const targetE = () => {
    const t = find(b, action.target);
    return t && t.side === 'enemy' && t.hp > 0 ? t : living(b.enemies)[0];
  };
  const burnFirst = (e) => {
    if (!hero.attacked && fx(hero, 'firstBurn') && e.hp > 0) { e.burn = 2; events.push({ t: 'status', target: e.id, status: 'burn' }); }
  };
  const flare = () => {
    if (hero.id !== 'ilario' || hero.sparks < 3) return 1;
    hero.sparks = 0;
    events.push({ t: 'flare', target: hero.id });
    return 1.7;
  };
  const strike = (e, mult, q, brk, extra = 1) => {
    const bonus = q === 'perfect' ? 1 + fx(hero, 'perfect') : 1;
    const before = e.hp;
    damage(b, e, hero.atk * mult * TAP[q] * bonus * power(hero) * extra * vary(b), events, q);
    addBreak(b, e, 9 * mult * TAP[q] * brk, events);
    if (before > 0 && e.hp === 0 && fx(hero, 'killAp')) gainAp(hero, fx(hero, 'killAp'), events);
  };

  if (action.kind === 'spark') {
    const e = targetE();
    const q = taps[0];
    hero.ap -= 1;
    b.sparksLeft--;
    const onWeak = q === 'perfect';
    if (q !== 'miss') {
      damage(b, e, hero.atk * 0.45 * (onWeak ? (e.weak ? 2 : 1.3) : 1) * (1 + fx(hero, 'spark')) * vary(b), events, 'spark');
      addBreak(b, e, onWeak ? (e.weak ? 24 : 10) : 4, events);
      if (onWeak && !e.weak) { e.weak = true; events.push({ t: 'status', target: e.id, status: 'weak' }); }
    } else events.push({ t: 'miss', target: e.id });
    checkOver(b);
    return events;
  }

  if (action.kind === 'item') {
    const item = ITEMS[action.item];
    const who = find(b, action.target) || hero;
    if (item.revive && who.hp > 0) return null;
    if (item.heal && who.hp <= 0) return null;
    b.items[action.item]--;
    if (item.revive) { who.hp = Math.round(who.maxHp * item.revive); events.push({ t: 'revive', target: who.id }); }
    else heal(who, who.maxHp * item.heal, events);
    b.current = null;
    return events;
  }

  if (action.kind === 'attack') {
    const e = targetE();
    const q = taps[0];
    const k = flare();
    if (hero.id === 'tecla' && !e.weak) { e.weak = true; events.push({ t: 'status', target: e.id, status: 'weak' }); }
    strike(e, 1, q, 1, k);
    burnFirst(e);
    gainAp(hero, 1, events);
  } else {
    const s = skillsAt(hero.id, hero.level).find((x) => x.id === action.skill);
    hero.ap -= s.ap;
    const targets = s.target === 'all' ? living(b.enemies) : s.target === 'one' ? [targetE()] : [];
    const quality = taps.filter((q) => q === 'perfect').length / taps.length;
    const supportK = 0.8 + quality * 0.4;
    if (s.heal) for (const h of living(b.heroes)) heal(h, h.maxHp * s.heal * supportK, events);
    if (s.fx === 'wide') { b.wide = 2; events.push({ t: 'wide' }); }
    if (s.fx === 'shield') for (const h of living(b.heroes)) { h.shield = Math.max(h.shield, Math.round(h.maxHp * 0.22 * supportK)); events.push({ t: 'shield', target: h.id, amount: h.shield }); }
    if (targets.length) {
      let k = flare();
      if (s.fx === 'ring') { k *= s.target === 'all' ? 1 + hero.charge * 1.0 : 1 + hero.charge * 0.28; hero.charge = 0; }
      for (const q of taps) for (const e of targets) if (e.hp > 0) strike(e, s.mult, q, s.brk ?? 1, k);
      for (const e of targets) {
        burnFirst(e);
        if (e.hp <= 0) continue;
        if (s.fx === 'burn') { e.burn = 3; events.push({ t: 'status', target: e.id, status: 'burn' }); }
        if (s.fx === 'mark') { e.marked = 3; e.weak = true; events.push({ t: 'status', target: e.id, status: 'mark' }); }
        if (s.fx === 'stagger' && quality === 1 && !e.skip) { e.skip = true; events.push({ t: 'status', target: e.id, status: 'stagger' }); }
      }
      if (s.fx === 'charge') { hero.charge = Math.min(5, hero.charge + 1); gainAp(hero, 2, events); events.push({ t: 'charge', target: hero.id, amount: hero.charge }); }
    }
  }
  hero.attacked = true;
  if (hero.id === 'nora') {
    const all = taps.every((q) => q === 'perfect');
    if (all) hero.tempo = Math.min(5, hero.tempo + 1);
    else if (taps.includes('miss')) hero.tempo = 0;
    events.push({ t: 'tempo', target: hero.id, amount: hero.tempo });
  }
  b.current = null;
  checkOver(b);
  return events;
}

/**
 * The enemy's move lands. `outcomes` has one entry per hit
 * ('parry'|'dodge'|'jump'|'leap'|'hit'); in story mode it is ignored.
 */
export function enemyAct(b, enemyId, move, outcomes = []) {
  const enemy = find(b, enemyId);
  if (!enemy || enemy.hp <= 0 || b.over) return null;
  const events = [];
  const rule = rules(b.difficulty);
  const targets = () => move.targets.map((id) => find(b, id)).filter((h) => h.hp > 0);
  let clean = 0;
  move.hits.forEach((hit, i) => {
    let res = rule.auto ? 'auto' : outcomes[i] || 'hit';
    if (!rule.auto && res === 'hit' && b.autoParry && b.rng() < 0.5) res = hit.kind === 'low' ? 'leap' : 'parry';
    const list = targets();
    if (!list.length) return;
    events.push({ t: 'swing', target: enemy.id, hit: i, result: res });
    if (res === 'parry' || res === 'leap') {
      clean++;
      b.stats.parries++;
      for (const h of list) {
        gainAp(h, 1, events);
        if (fx(h, 'parryHeal')) heal(h, h.maxHp * fx(h, 'parryHeal'), events);
        if (res === 'leap' && fx(h, 'jumpAp')) gainAp(h, fx(h, 'jumpAp'), events);
        if (fx(h, 'parryBreak')) addBreak(b, enemy, fx(h, 'parryBreak'), events);
      }
      const ilario = b.heroes.find((h) => h.id === 'ilario' && h.hp > 0);
      if (ilario && ilario.sparks < 3) { ilario.sparks++; events.push({ t: 'sparks', target: ilario.id, amount: ilario.sparks }); }
      addBreak(b, enemy, 6, events);
      return;
    }
    if (res === 'dodge' || res === 'jump') {
      for (const h of list) {
        if (res === 'jump' && fx(h, 'jumpAp')) gainAp(h, fx(h, 'jumpAp'), events);
        if (res === 'dodge' && fx(h, 'dodgeAp') && b.rng() < fx(h, 'dodgeAp')) gainAp(h, 1, events);
      }
      return;
    }
    for (const h of list) {
      let v = enemy.atk * hit.mult * rule.damage * (res === 'auto' ? 0.55 : 1) * (1 - fx(h, 'guard')) * vary(b);
      v = Math.max(1, Math.round(v));
      const soaked = Math.min(h.shield, v);
      h.shield -= soaked;
      v -= soaked;
      b.stats.hitsTaken++;
      if (h.id === 'nora') h.tempo = 0;
      if (v >= h.hp && fx(h, 'endure') && !h.endured) { h.endured = true; v = h.hp - 1; events.push({ t: 'endure', target: h.id }); }
      h.hp = Math.max(0, h.hp - v);
      events.push({ t: 'hurt', target: h.id, amount: v, soaked });
      if (h.hp === 0) {
        events.push({ t: 'down', target: h.id });
        // the dog knows when someone is about to fall
        if (!b.dragged && b.rng() < 0.4) { b.dragged = true; h.hp = 1; events.push({ t: 'ombra', what: 'drag', target: h.id }); }
      }
    }
  });
  // every hit answered perfectly: the party strikes back
  if (!rule.auto && clean === move.hits.length && targets().length) {
    for (const h of targets()) {
      events.push({ t: 'counter', target: h.id });
      damage(b, enemy, h.atk * (move.target === 'all' ? 0.7 : 1.3) * (1 + fx(h, 'counter')) * vary(b), events, 'counter');
      addBreak(b, enemy, 12, events);
    }
  }
  if (b.wide > 0) b.wide--;
  if (enemy.marked > 0) enemy.marked--;
  b.current = null;
  checkOver(b);
  return events;
}

/** Light and experience for a won battle. */
export function rewards(b) {
  let xp = 0, light = 0;
  for (const e of b.enemies) { xp += ENEMIES[e.type].xp; light += ENEMIES[e.type].light; }
  const bonus = Math.max(0, ...b.heroes.map((h) => fx(h, 'light')));
  return { xp, light: Math.round(light * (1 + bonus)) };
}

/**
 * Plays a whole battle by itself, for tests and balancing.
 * skill: {tap(): quality, defend(hit): outcome}
 */
export function autoPlay(b, skill, limit = 400) {
  for (let turn = 0; turn < limit; turn++) {
    const t = next(b);
    if (t.type === 'win' || t.type === 'lose') return { result: t.type, turns: turn };
    if (t.type === 'enemy') { enemyAct(b, t.actor.id, t.move, t.move.hits.map((h) => skill.defend(h))); continue; }
    const hero = t.actor;
    const hurt = living(b.heroes).find((h) => h.hp < h.maxHp * 0.35);
    const fallen = b.heroes.find((h) => h.hp <= 0);
    const list = skillsAt(hero.id, hero.level).filter((s) => s.ap <= hero.ap);
    const target = living(b.enemies).sort((x, y) => x.hp - y.hp)[0].id;
    let action = null;
    if (fallen && b.items.cera) action = { kind: 'item', item: 'cera', target: fallen.id };
    else if (hurt && list.some((s) => s.heal)) action = { kind: 'skill', skill: list.find((s) => s.heal).id };
    else if (hurt && b.items.olio) action = { kind: 'item', item: 'olio', target: hurt.id };
    else {
      const attacks = list.filter((s) => s.mult && s.ap > 0 && !(s.fx === 'ring' && hero.charge < 2)).sort((x, y) => y.ap - x.ap);
      const charge = list.find((s) => s.fx === 'charge');
      if (attacks.length) action = { kind: 'skill', skill: attacks[0].id };
      else if (charge) action = { kind: 'skill', skill: charge.id };
      else action = { kind: 'attack' };
    }
    const s = action.kind === 'skill' ? skillsAt(hero.id, hero.level).find((x) => x.id === action.skill) : null;
    heroAct(b, hero.id, { ...action, target: action.target || target, taps: Array.from({ length: s?.taps || 1 }, () => skill.tap()) });
  }
  return { result: 'stall', turns: limit };
}
