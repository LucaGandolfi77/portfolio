/* Ultimo Colore — logic tests. Run: node games/ultimo-colore/test/logic-test.mjs */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import * as E from '../js/battle/engine.js';
import * as T from '../js/battle/timing.js';
import * as P from '../js/world/progress.js';
import { HEROES, HERO_IDS, skillsAt, levelFor, XP_TABLE, ITEMS } from '../js/data/party.js';
import { ENEMIES } from '../js/data/enemies.js';
import { MEMORIES, MEMORY, LEARN, TEACH_COST } from '../js/data/memories.js';
import { NODES, NODE, FIRST } from '../js/data/map.js';
import { SCENES, TALKS, DIARY, SPEAKERS } from '../js/data/story.js';
import { STRINGS } from '../js/strings.js';
import { fadePixels, weight } from '../js/render/fade.js';
import { heroSVG, foeSVG } from '../js/render/sprites.js';
import * as L from '../js/world/layout.js';
import * as PL from '../js/data/places.js';
import * as W from '../js/world/terrain.js';
import * as F from '../js/world/field.js';
import { WILD, CHESTS, STATUES } from '../js/data/places.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const results = [];
const t = (name, fn) => results.push(test(name, fn));
const rng = (seed) => { let s = seed; for (let i = 0; i < 3; i++) s = (s * 16807) % 2147483647; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const fixed = () => 0.5;
const battle = (o = {}) => E.createBattle({ party: ['ilario', 'tecla'], enemies: ['cocci'], rng: fixed, items: { olio: 3, cera: 1 }, ...o });
/** Advances until it is this hero's turn. */
function turnOf(b, id) {
  for (let i = 0; i < 40; i++) {
    const r = E.next(b);
    if (r.type === 'hero') { if (r.actor.id === id) return r.actor; E.heroAct(b, r.actor.id, { kind: 'attack', taps: ['miss'], target: b.enemies[0].id }); continue; }
    if (r.type === 'enemy') { E.enemyAct(b, r.actor.id, r.move, r.move.hits.map(() => 'dodge')); continue; }
    throw new Error('battle over: ' + r.type);
  }
  throw new Error('never');
}
function enemyTurn(b) {
  for (let i = 0; i < 40; i++) {
    const r = E.next(b);
    if (r.type === 'enemy') return r;
    if (r.type !== 'hero') throw new Error('over ' + r.type);
    E.heroAct(b, r.actor.id, { kind: 'attack', taps: ['miss'] });
  }
  throw new Error('never');
}

/* ---------- timing ---------- */
const strike = { at: 1000, kind: 'strike' }, low = { at: 1000, kind: 'low' };
t('parry is tighter than dodge; low blows must be jumped', () => {
  const j = (h, kind, ms, d = 'normal') => T.judgeDefence([h], [{ t: ms, kind }], d)[0];
  eq(j(strike, 'parry', 1000), 'parry'); eq(j(strike, 'parry', 1100), 'parry'); eq(j(strike, 'parry', 1150), 'hit');
  eq(j(strike, 'dodge', 1200), 'dodge'); eq(j(strike, 'dodge', 1260), 'hit');
  eq(j(strike, 'jump', 1000), 'hit'); eq(j(low, 'dodge', 1000), 'hit'); eq(j(low, 'parry', 1000), 'hit');
  eq(j(low, 'jump', 1000), 'leap'); eq(j(low, 'jump', 1180), 'jump');
  eq(j(strike, 'parry', 1150, 'easy'), 'parry'); eq(j(strike, 'parry', 1100, 'hard'), 'hit');
  eq(T.judgeDefence([strike], [{ t: 1140, kind: 'parry' }], 'normal', true)[0], 'parry', 'safe course widens');
});
t('mashing does not work: a wasted press locks the hands', () => {
  const spam = Array.from({ length: 20 }, (_, i) => ({ t: 400 + i * 60, kind: 'parry' }));
  const wins = [1000, 1070, 1130, 1210].filter((at) => T.judgeDefence([{ at, kind: 'strike' }], spam, 'hard')[0] === 'parry').length;
  ok(wins < 4, 'spam always wins');
  const [a, b] = T.judgeDefence([{ at: 1000, kind: 'strike' }, { at: 1500, kind: 'strike' }], [{ t: 990, kind: 'parry' }, { t: 1495, kind: 'parry' }], 'normal');
  eq(a + b, 'parryparry');
});
t('attack taps', () => {
  eq(T.judgeTap(900, 910, 'normal'), 'perfect'); eq(T.judgeTap(900, 1040, 'normal'), 'good'); eq(T.judgeTap(900, 1200, 'normal'), 'miss'); eq(T.judgeTap(900, null, 'easy'), 'miss');
  eq(T.tapBeats(3).length, 3);
});

/* ---------- battle ---------- */
t('turn order follows speed', () => {
  const b = E.createBattle({ party: ['bastiano', 'nora'], enemies: ['granchio'], rng: fixed });
  eq(E.next(b).actor.id, 'nora');
});
t('attacking gives AP, skills spend it, perfect hits hit harder', () => {
  const dmg = (q) => { const b = battle(); const h = turnOf(b, 'tecla'); const e = b.enemies[0]; const hp = e.hp; E.heroAct(b, h.id, { kind: 'attack', taps: [q], target: e.id }); return hp - e.hp; };
  ok(dmg('perfect') > dmg('good') && dmg('good') > dmg('miss'));
  const b = battle(); const h = turnOf(b, 'tecla'); const ap = h.ap;
  E.heroAct(b, h.id, { kind: 'attack', taps: ['good'] }); eq(h.ap, ap + 1); ok(b.enemies[0].weak, 'Tecla reveals');
  const h2 = turnOf(b, 'ilario'); const a2 = h2.ap;
  E.heroAct(b, h2.id, { kind: 'skill', skill: 'stoppino', taps: ['good', 'good'] }); eq(h2.ap, a2 - 2);
  eq(E.heroAct(b, h2.id, { kind: 'attack' }), null, 'not your turn any more');
});
t('a spark does not end the turn and is limited', () => {
  const b = battle({ enemies: ['granchio'] }); const h = turnOf(b, 'tecla'); h.ap = 9;
  for (let i = 0; i < E.SPARKS_PER_TURN; i++) ok(E.heroAct(b, h.id, { kind: 'spark', taps: ['perfect'] }), 'spark ' + i);
  eq(E.heroAct(b, h.id, { kind: 'spark', taps: ['perfect'] }), null);
  eq(h.ap, 6); eq(b.current, 'tecla'); ok(b.enemies[0].weak && b.enemies[0].brk > 20);
});
t('parrying every hit costs nothing, gives AP and counters', () => {
  const b = battle(); const r = enemyTurn(b); const target = E.find(b, r.move.targets[0]);
  const hp = target.hp, ap = target.ap, ehp = b.enemies[0].hp;
  const ev = E.enemyAct(b, r.actor.id, r.move, r.move.hits.map(() => 'parry'));
  eq(target.hp, hp); eq(target.ap, Math.min(E.AP_MAX, ap + r.move.hits.length));
  ok(ev.some((x) => x.t === 'counter') && b.enemies[0].hp < ehp);
  ok(b.heroes[0].sparks > 0, 'Ilario sparks');
});
t('dodging avoids damage but gives no counter; being hit hurts', () => {
  const b = battle(); let r = enemyTurn(b); let target = E.find(b, r.move.targets[0]); let hp = target.hp;
  let ev = E.enemyAct(b, r.actor.id, r.move, r.move.hits.map(() => 'dodge'));
  eq(target.hp, hp); ok(!ev.some((x) => x.t === 'counter'));
  r = enemyTurn(b); target = E.find(b, r.move.targets[0]); hp = target.hp;
  ev = E.enemyAct(b, r.actor.id, r.move, r.move.hits.map(() => 'hit'));
  ok(target.hp < hp);
});
t('story mode needs no reflexes and still hurts a little', () => {
  const b = battle({ difficulty: 'story' }); const r = enemyTurn(b);
  const target = E.find(b, r.move.targets[0]); const hp = target.hp;
  E.enemyAct(b, r.actor.id, r.move, []);
  ok(target.hp < hp && hp - target.hp < ENEMIES.cocci.atk * 1.4);
});
t('filling the break bar makes the enemy lose its turn', () => {
  const b = battle({ enemies: ['granchio'] }); const h = turnOf(b, 'tecla'); const e = b.enemies[0];
  e.brk = e.brkMax - 1;
  const ev = E.heroAct(b, h.id, { kind: 'skill', skill: 'segna', taps: ['good'] });
  ok(ev.some((x) => x.t === 'break') && e.broken && e.skip && e.marked > 0);
  let acted = false, recovered = false;
  for (let i = 0; i < 12 && !recovered; i++) {
    const r = E.next(b);
    recovered = r.events.some((x) => x.t === 'recover');
    if (recovered) break;
    if (r.type === 'enemy') { acted = true; break; }
    if (r.type === 'hero') E.heroAct(b, r.actor.id, { kind: 'attack', taps: ['miss'] });
  }
  ok(recovered && !acted && !e.broken && e.brk === 0);
});
t('Nora’s tempo, Bastiano’s charges, Ilario’s flare', () => {
  const b = E.createBattle({ party: ['nora', 'bastiano', 'ilario'], enemies: ['airone'], rng: fixed });
  const n = turnOf(b, 'nora'); E.heroAct(b, n.id, { kind: 'attack', taps: ['perfect'] }); eq(n.tempo, 1);
  const bas = turnOf(b, 'bastiano'); const ap = bas.ap;
  E.heroAct(b, bas.id, { kind: 'skill', skill: 'rintocco', taps: ['good'] }); eq(bas.charge, 1); eq(bas.ap, ap + 2);
  const i = turnOf(b, 'ilario'); i.sparks = 3;
  const ev = E.heroAct(b, i.id, { kind: 'attack', taps: ['good'] }); ok(ev.some((x) => x.t === 'flare')); eq(i.sparks, 0);
  const n2 = turnOf(b, 'nora'); n2.tempo = 3; E.heroAct(b, n2.id, { kind: 'attack', taps: ['miss'] }); eq(n2.tempo, 0);
});
t('items heal and revive, and are used up', () => {
  const b = battle(); const h = turnOf(b, 'tecla'); const other = b.heroes[0];
  other.hp = 0;
  eq(E.heroAct(b, h.id, { kind: 'item', item: 'olio', target: other.id }), null, 'oil cannot raise');
  ok(E.heroAct(b, h.id, { kind: 'item', item: 'cera', target: other.id }));
  ok(other.hp > 0); eq(b.items.cera, 0);
  const h2 = turnOf(b, 'tecla'); h2.hp = 10; E.heroAct(b, h2.id, { kind: 'item', item: 'olio', target: h2.id }); ok(h2.hp > 10);
});
t('memories change the fight', () => {
  const plain = battle();
  const b = battle({ equipped: { ilario: ['cera', 'nodo', 'alba'], tecla: ['fiammifero'] } });
  ok(b.heroes[0].maxHp > plain.heroes[0].maxHp && b.heroes[0].atk > plain.heroes[0].atk);
  eq(b.heroes[0].ap, E.AP_START + 2);
  const r = enemyTurn(b);
  r.move.targets = ['tecla'];
  b.heroes[1].hp = 1;
  E.enemyAct(b, r.actor.id, r.move, r.move.hits.map(() => 'hit').map((x, i) => (i ? 'dodge' : x)));
  eq(b.heroes[1].hp, 1, 'endures once');
  for (const m of MEMORIES) ok(Object.keys(m.fx).length === 1, m.id);
});
t('the stag changes at half health', () => {
  const b = E.createBattle({ party: ['ilario'], enemies: ['cervo'], rng: fixed });
  const e = b.enemies[0]; eq(E.movesOf(e).length, 3);
  const h = turnOf(b, 'ilario'); e.hp = e.maxHp / 2 + 5;
  const ev = E.heroAct(b, h.id, { kind: 'attack', taps: ['perfect'] });
  ok(ev.some((x) => x.t === 'phase') && e.phase === 2 && E.movesOf(e).length === 5);
});
t('every value stays in range through hundreds of random battles', () => {
  const r = rng(99);
  const foes = Object.keys(ENEMIES);
  for (let n = 0; n < 150; n++) {
    const b = E.createBattle({ party: HERO_IDS, level: 1 + (n % 6), enemies: [foes[n % foes.length], foes[(n * 3) % foes.length]], difficulty: ['story', 'easy', 'normal', 'hard'][n % 4], items: { olio: 2, cera: 1 }, equipped: { nora: ['passi', 'fame', 'lettera'], ilario: ['pane', 'ago', 'rete'] }, rng: r });
    const res = E.autoPlay(b, { tap: () => ['perfect', 'good', 'miss'][Math.floor(r() * 3)], defend: (h) => (r() < 0.5 ? (h.kind === 'low' ? 'leap' : 'parry') : 'hit') });
    ok(res.result !== 'stall', 'stall ' + n);
    for (const a of [...b.heroes, ...b.enemies]) ok(a.hp >= 0 && a.hp <= a.maxHp && Number.isInteger(a.hp), `${a.id} ${a.hp}`);
    for (const h of b.heroes) ok(h.ap >= 0 && h.ap <= E.AP_MAX && h.tempo <= 5 && h.charge <= 5 && h.sparks <= 3);
  }
});

/** Plays the whole road with a given player; returns the win rate of each fight. */
function road(difficulty, player, runs = 60) {
  const wins = {};
  for (let seed = 1; seed <= runs; seed++) {
    const r = rng(seed * 977);
    const s = P.newGame(difficulty);
    for (const node of NODES) {
      if (node.optional) continue;
      P.join(s, node.join);
      if (node.type === 'camp') P.rest(s);
      if (node.enemies) {
        P.autoEquip(s);
        const b = E.createBattle({ party: s.party, level: P.level(s), enemies: node.enemies, difficulty, items: s.items, equipped: s.equipped, hp: s.hp, rng: r });
        const res = E.autoPlay(b, player(r));
        wins[node.id] = (wins[node.id] || 0) + (res.result === 'win' ? 1 / runs : 0);
        P.afterBattle(s, b, E.rewards(b));
        if (res.result !== 'win') s.hp = {};
      }
      P.complete(s, node.id);
    }
    ok(s.actDone);
  }
  return wins;
}
const skilled = (r) => ({ tap: () => (r() < 0.5 ? 'perfect' : r() < 0.9 ? 'good' : 'miss'), defend: (h) => { const x = r(); return x < 0.45 ? (h.kind === 'low' ? 'leap' : 'parry') : x < 0.8 ? (h.kind === 'low' ? 'jump' : 'dodge') : 'hit'; } });
const clumsy = (r) => ({ tap: () => (r() < 0.5 ? 'good' : 'miss'), defend: (h) => (r() < 0.25 ? (h.kind === 'low' ? 'jump' : 'dodge') : 'hit') });
t('the whole act can be won: a skilled player on normal, anyone in story mode', () => {
  for (const [id, w] of Object.entries(road('normal', skilled))) ok(w > 0.9, `normal ${id} ${w.toFixed(2)}`);
  for (const [id, w] of Object.entries(road('story', clumsy))) ok(w > 0.9, `story ${id} ${w.toFixed(2)}`);
});
t('the last boss does bite a clumsy player', () => {
  ok(road('normal', clumsy).cervo < 0.97);
  ok(road('hard', clumsy).cervo < 0.7);
});

/* ---------- road and camp ---------- */
t('the road opens node by node, optional ones can be skipped', () => {
  const s = P.newGame();
  eq(P.available(s).join(), FIRST);
  P.complete(s, 'casa'); eq(P.available(s).join(), 'ponte');
  for (const id of ['ponte', 'darsena', 'stiva', 'canale']) { P.join(s, NODE[id].join); P.complete(s, id); }
  eq(P.available(s).sort().join(), 'campanaro,reti');
  ok(s.party.includes('nora') && s.party.includes('tecla'));
  P.complete(s, 'campanaro'); ok(P.available(s).includes('campanile') && P.available(s).includes('reti'));
  const before = s.owned.length; P.complete(s, 'campanaro'); eq(s.owned.length, before, 'only once');
});
t('every node can be reached and every memory found exactly once', () => {
  const seen = new Set([FIRST]);
  for (const n of NODES) for (const x of n.next) { ok(NODE[x], x); seen.add(x); }
  eq(seen.size, NODES.length);
  const rewards = NODES.flatMap((n) => n.reward || []);
  eq(rewards.length, MEMORIES.length); eq(new Set(rewards).size, MEMORIES.length);
  for (const m of rewards) ok(MEMORY[m], m);
  for (const n of NODES) { ok(existsSync(join(ROOT, 'art', n.art + '.webp')), n.art); for (const e of n.enemies || []) ok(ENEMIES[e], e); }
});
t('memories are worn one copy at a time, learned after four fights, then taught', () => {
  const s = P.newGame(); P.join(s, ['tecla']); s.owned = ['nodo'];
  eq(P.toggleMemory(s, 'ilario', 'nodo'), null);
  eq(P.toggleMemory(s, 'tecla', 'nodo'), 'taken');
  const b = E.createBattle({ party: s.party, enemies: ['cocci'], equipped: s.equipped });
  let out;
  for (let i = 0; i < LEARN; i++) out = P.afterBattle(s, b, { xp: 0, light: 20 });
  eq(out.learned.length, 1); ok(P.knows(s, 'ilario', 'nodo'));
  eq(P.toggleMemory(s, 'tecla', 'nodo'), null, 'free again once learned');
  ok(P.canTeach(s, 'tecla', 'nodo'));
  const light = s.light; ok(P.teach(s, 'tecla', 'nodo')); eq(s.light, light - TEACH_COST); ok(!P.teach(s, 'tecla', 'nodo'));
  s.owned.push('alba', 'cera', 'passi'); for (const m of ['alba', 'cera']) P.toggleMemory(s, 'tecla', m);
  eq(P.toggleMemory(s, 'tecla', 'passi'), 'full');
});
t('health carries over, camps restore it', () => {
  const s = P.newGame(); const b = E.createBattle({ party: s.party, enemies: ['cocci'], items: s.items });
  b.heroes[0].hp = Math.round(b.heroes[0].maxHp * 0.2); b.items.olio = 0;
  P.afterBattle(s, b, { xp: 60, light: 1 });
  near(s.hp.ilario, 0.55, 0.02); eq(P.level(s), 2);
  P.rest(s); eq(JSON.stringify(s.hp), '{}'); eq(s.items.olio, P.SUPPLY.olio);
});
t('two talks per camp, only with those who travel', () => {
  const s = P.newGame(); P.join(s, ['tecla']);
  eq(P.talksAt(s, 'campo1').length, 1);
  P.join(s, ['nora', 'bastiano']); eq(P.talksAt(s, 'campo1').length, 3);
  P.hadTalk(s, 'c1-ila-nora'); P.hadTalk(s, 'c1-tec-bas'); eq(P.talksLeft(s, 'campo1'), 0);
});
t('a save survives storage; rubbish does not break it', () => {
  eq(P.hydrate(null), null); eq(P.hydrate({}), null);
  const s = P.newGame('hard'); P.join(s, ['tecla']); P.complete(s, 'casa'); s.owned = ['nodo']; P.toggleMemory(s, 'tecla', 'nodo'); P.addBond(s, 'ilario-tecla');
  eq(JSON.stringify(P.hydrate(JSON.parse(JSON.stringify(s)))), JSON.stringify(s));
  const bad = P.hydrate({ v: 1, difficulty: 'x', party: ['dragon'], done: ['nowhere'], owned: ['zzz'], equipped: { ilario: ['nodo'] }, xp: -5, hp: { ilario: 9 } });
  eq(bad.difficulty, 'normal'); eq(bad.party.join(), 'ilario'); eq(bad.done.length, 0); eq(bad.xp, 0); eq(bad.equipped.ilario.length, 0); eq(bad.hp.ilario, 1);
});
t('levels', () => { eq(levelFor(0), 1); eq(levelFor(XP_TABLE[3]), 4); eq(skillsAt('nora', 1).length, 2); eq(skillsAt('nora', 5).length, 4); });

/* ---------- the open lagoon ---------- */
const ORDER = ['casa', 'ponte', 'darsena', 'stiva', 'canale', 'reti', 'campanaro', 'campanile', 'campo1', 'secche', 'statua', 'airone', 'campo2', 'cervo'];
const goalAt = (id) => (id === 'stiva' ? L.BOAT_AT : NODE[id].at);
const reachOf = (id) => (NODE[id].enemies ? (NODE[id].type === 'boss' ? 84 : 60) : NODE[id].type === 'camp' ? 100 : 80);
t('every story point can be walked to, in order, with the gates of that moment', () => {
  let done = [], pos = L.SPAWN;
  for (const id of ORDER) {
    const path = W.findPath(pos, goalAt(id), { boat: done.includes('stiva'), done }, reachOf(id));
    ok(path, `${id} unreachable`);
    pos = path.at(-1);
    done = [...done, id];
  }
});
t('closed passages really close the way, and the sea needs the boat', () => {
  const upTo = (id) => ORDER.slice(0, ORDER.indexOf(id) + 1);
  for (const [after, target] of [['casa', 'darsena'], ['stiva', 'reti'], ['campanile', 'secche'], ['secche', 'campo2'], ['airone', 'cervo']]) {
    const done = upTo(after);
    eq(W.findPath(L.SPAWN, goalAt(target), { boat: done.includes('stiva'), done }, 60), null, `${target} open after ${after}`);
  }
  eq(W.findPath(L.SPAWN, goalAt('reti'), { boat: false, done: upTo('campo1') }, 60), null, 'walked on water');
});
t('chests, statues and wandering enemies are all on reachable ground', () => {
  const ctx = { boat: true, done: ORDER };
  for (const x of [...CHESTS, ...STATUES]) ok(W.findPath(L.SPAWN, x, ctx, 62), x.id);
  for (const x of STATUES) ok(!['solid'].includes(W.kindAt(x.x, x.y, ORDER)), x.id + ' inside something');
  for (const w of WILD) { ok(W.canStand(w.x, w.y, ctx), w.id); ok(!w.after || NODE[w.after], w.id); for (const e of w.enemies) ok(ENEMIES[e], e); }
  eq(new Set([...WILD, ...CHESTS, ...STATUES].map((x) => x.id)).size, WILD.length + CHESTS.length + STATUES.length);
});
t('walls stop movement and feet slide along them', () => {
  const ctx = { boat: false, done: [] };
  ok(W.canStand(L.SPAWN.x, L.SPAWN.y, ctx));
  let p = { ...L.SPAWN };
  const rand = rng(5);
  for (let i = 0; i < 1500; i++) {
    p = W.move(p, (rand() - 0.5) * 40, (rand() - 0.5) * 40, ctx);
    ok(W.canStand(p.x, p.y, ctx), `inside a wall at ${p.x},${p.y}`);
  }
  const house = W.houseBlock(L.HOUSES[0]);
  const start = { x: house.x - 20, y: house.y + house.h / 2 };
  const slid = W.move(start, 60, 40, { boat: true, done: [] });
  ok(slid.x < house.x && slid.y > start.y + 20, 'no slide');
});

const journey = (upTo) => {
  const s = P.newGame();
  for (const id of ORDER.slice(0, ORDER.indexOf(upTo) + 1)) { P.join(s, NODE[id].join); P.complete(s, id); }
  return s;
};
t('story fights stand where the story is; wanderers need the boat', () => {
  const early = F.createField(journey('casa'));
  eq(early.groups.map((g) => g.id).join(), 'ponte');
  const later = F.createField(journey('campo1'));
  ok(later.groups.some((g) => g.id === 'secche') && later.groups.filter((g) => g.wild).length > 8);
});
t('walking moves the party, leaves footsteps and saves the place', () => {
  const s = journey('casa'), f = F.createField(s);
  for (let i = 0; i < 40; i++) F.update(s, f, 1 / 60, { x: 1, y: 0 });
  ok(f.pos.x > L.SPAWN.x + 60 && f.facing === 1 && f.trail.length > 5);
  eq(s.pos.x, Math.round(f.pos.x));
});
t('an unaware enemy can be surprised; a chasing one surprises you', () => {
  const s = journey('campo1');
  const f = F.createField(s);
  const g = f.groups.find((x) => x.id === 'w-sud');
  g.dir = { x: 1, y: 0 };
  f.grace = 0; f.pos = { x: g.x - 115, y: g.y };
  ok(!F.notices(g, f.pos), 'sees behind itself');
  ok(F.notices(g, { x: g.x + 150, y: g.y }) && F.notices(g, { x: g.x - 50, y: g.y }));
  F.update(s, f, 0.001);
  eq(f.near.kind, 'strike'); eq(f.near.id, 'w-sud');
  g.dir = { x: 1, y: 0 }; f.pos = { x: g.x - 30, y: g.y };
  const direct = F.update(s, f, 0.001);
  eq(direct.type, 'encounter'); eq(direct.advantage, 'party');
  const f2 = F.createField(s);
  const g2 = f2.groups.find((x) => x.id === 'w-sud');
  f2.grace = 0; f2.pos = { x: g2.x - 150, y: g2.y };
  let ev = null; const states = new Set();
  for (let i = 0; i < 300 && !ev; i++) { if (g2.state === 'idle') g2.dir = { x: -1, y: 0 }; ev = F.update(s, f2, 1 / 60); states.add(g2.state); }
  ok(states.has('chase'), [...states].join());
  eq(ev.advantage, 'enemy');
});
t('running far enough sends them home; retreating gives a moment of peace', () => {
  const s = journey('campo1'), f = F.createField(s);
  const g = f.groups.find((x) => x.id === 'w-sud');
  g.state = 'chase'; f.pos = { x: g.x - 600, y: g.y }; f.grace = 99;
  F.update(s, f, 1 / 60); eq(g.state, 'return');
  for (let i = 0; i < 600 && g.state !== 'idle'; i++) F.update(s, f, 1 / 60);
  eq(g.state, 'idle');
  f.pos = { x: g.x - 30, y: g.y };
  const before = Math.hypot(f.pos.x - g.x, f.pos.y - g.y);
  F.retreat(s, f, g);
  ok(Math.hypot(f.pos.x - g.x, f.pos.y - g.y) > before + 80 && f.grace > 1);
});
t('beaten wanderers stay gone until the party rests', () => {
  const s = journey('campo1');
  s.cleared.push('w-sud');
  ok(!F.createField(s).groups.some((g) => g.id === 'w-sud'));
  P.rest(s);
  ok(F.createField(s).groups.some((g) => g.id === 'w-sud'));
});
t('scenes start by themselves only when they should', () => {
  const s = P.newGame(), f = F.createField(s);
  const ev = F.update(s, f, 0.016);
  eq(ev.type, 'auto'); eq(ev.node, 'casa');
  const end = journey('cervo');
  eq(F.update(end, F.createField(end), 0.016).node, 'tramonto');
});
t('what can be done from here: board, camp, chest, statue, closed way', () => {
  const at = (s, p) => { const f = F.createField(s); f.pos = { ...p }; f.grace = 99; F.update(s, f, 0.001); return f.near; };
  eq(at(journey('darsena'), { x: 1745, y: 2408 }).kind, 'board');
  const s = journey('campanile');
  eq(at(s, NODE.campo1.at).kind, 'camp');
  eq(at(journey('airone'), NODE.campo1.at).kind, 'camp', 'camps stay open');
  const c = CHESTS[0];
  eq(at(journey('casa'), c).kind, 'chest');
  const bag = journey('casa'); const oil = bag.items.olio;
  ok(F.openChest(bag, c.id)); eq(F.openChest(bag, c.id), null); eq(bag.items.olio, oil + c.olio);
  const st = STATUES[0];
  eq(at(journey('casa'), { x: st.x - 30, y: st.y + 20 }).kind, 'statue');
  F.readStatue(bag, st.id); F.readStatue(bag, st.id); eq(bag.read.length, 1);
  eq(at(journey('casa'), { x: 1003, y: 2606 }).kind, 'gate');
});
t('the compass points to the next step, not to a side path', () => {
  eq(F.objective(journey('casa')).id, 'ponte');
  eq(F.objective(journey('canale')).id, 'campanaro');
  for (const n of NODES) if (!n.auto) ok(n.goal?.it && n.goal?.en, n.id);
});
t('surprise decides who moves first', () => {
  const slow = { party: ['bastiano'], enemies: ['cocci'], rng: fixed };
  eq(E.next(E.createBattle(slow)).type, 'enemy');
  const amb = E.createBattle({ ...slow, advantage: 'party' });
  eq(amb.heroes[0].ap, E.AP_START + 1); eq(E.next(amb).type, 'hero');
  eq(E.next(E.createBattle({ party: ['nora'], enemies: ['granchio'], rng: fixed, advantage: 'enemy' })).type, 'enemy');
});
t('a journey from the old route map wakes up in the lagoon', () => {
  const old = { v: 1, party: ['ilario', 'tecla'], done: ['casa', 'ponte', 'darsena'] };
  const s = P.hydrate(old);
  eq(s.pos.x, NODE.darsena.at.x);
  ok(F.createField(s).pos.x > 0);
  const stuck = P.hydrate({ ...old, pos: { x: 700, y: 2200 } });
  ok(W.canStand(F.createField(stuck).pos.x, F.createField(stuck).pos.y, F.ctxOf(stuck)), 'left in a wall');
  const kept = P.hydrate({ ...old, cleared: ['w-sud', 'w-sud'], opened: ['c-casa'], read: ['s-bimbo'], camp: 'campo1', pos: { x: 900, y: 2900 } });
  eq(kept.cleared.length, 1); eq(kept.opened.length, 1); eq(kept.camp, null, 'camp not reached yet'); eq(kept.pos.x, 900);
});
t('the painter’s copy of the map is up to date', () => {
  const j = JSON.parse(readFileSync(join(ROOT, 'blender', 'world.json'), 'utf8'));
  for (const k of ['WORLD', 'LEAN', 'ISLANDS', 'SHALLOWS', 'PIERS', 'HOUSES', 'TOWER', 'WILLOWS', 'CAMPS', 'WALLS', 'SHARDS']) eq(JSON.stringify(j[k]), JSON.stringify(L[k]), k);
  eq(JSON.stringify(j.STATUES), JSON.stringify([...PL.STATUES, PL.ADA]), 'STATUES');
  ok(existsSync(join(ROOT, 'art', 'world.webp')));
});

/* ---------- words and pictures ---------- */
const beatsOf = (list) => list.flatMap((b) => (b.c ? b.c.flatMap((o) => [['choice', o.it, o.en], ...beatsOf(o.beats || [])]) : [b]));
t('every scene and talk is written in both languages, by known speakers', () => {
  const all = [...Object.values(SCENES), ...Object.values(TALKS).flat().map((x) => x.beats)];
  for (const scene of all) for (const [who, it, en] of beatsOf(scene)) {
    ok(who === 'choice' || who in SPEAKERS, who);
    ok(it && en && (it.length < 20 || it !== en), `${who}: ${it}`);
  }
  for (const n of NODES) ok(SCENES[n.scene], 'scene ' + n.scene);
  for (const n of NODES) if (n.diary) ok(DIARY[n.diary], n.diary);
  for (const d of Object.values(DIARY)) ok(d.it && d.en && d.title.it && d.title.en);
  for (const c of Object.values(TALKS).flat()) { ok(c.who.every((h) => HEROES[h])); eq(c.pair.split('-').length, 2); }
});
const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keys(v, p + k + '.') : [p + k])).sort();
t('Italian and English interface match', () => {
  eq(keys(STRINGS.it).join(), keys(STRINGS.en).join());
  eq(STRINGS.it.howtoText.length, STRINGS.en.howtoText.length);
  for (const h of Object.values(HEROES)) for (const s of h.skills) ok(s.it && s.en && s.dit && s.den, s.id);
  for (const e of Object.values(ENEMIES)) for (const m of [...e.moves, ...(e.phase?.moves || [])]) ok(m.name.it && m.name.en);
  for (const i of Object.values(ITEMS)) ok(i.it && i.en);
});
t('everyone has a picture', () => {
  for (const h of [...HERO_IDS, 'ombra', 'vela', 'ada']) ok(heroSVG(h, { portrait: true }).startsWith('<svg'), h);
  for (const e of Object.keys(ENEMIES)) ok(foeSVG(e).startsWith('<svg'), e);
});
t('green leaves the pictures, the other colours stay', () => {
  const px = new Uint8ClampedArray([40, 180, 60, 255, 220, 40, 30, 255, 40, 70, 220, 255, 90, 90, 90, 255]);
  fadePixels(px, 'green', 1);
  ok(Math.abs(px[0] - px[1]) < 3 && Math.abs(px[1] - px[2]) < 3, 'green greyed');
  eq(px[4], 220); eq(px[10], 220); eq(px[12], 90);
  eq(weight(-1, [55, 185]), 0); eq(weight(120, [55, 185]), 1); ok(weight(45, [55, 185]) > 0 && weight(45, [55, 185]) < 1);
});

/* ---------- files ---------- */
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
t('the service worker precaches every file', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  for (const f of [...walk(join(ROOT, 'js')), ...walk(join(ROOT, 'art')), ...walk(join(ROOT, 'icons'))]) ok(sw.includes(`'./${relative(ROOT, f)}'`), relative(ROOT, f));
});

summary(results.filter(Boolean).length, results.length);
