/* Seba — logic tests. Run: node games/seba/test/logic-test.mjs */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import * as G from '../js/state.js';
import { NEEDS, ITEMS, GAMES, PASS_OUT_MS } from '../js/rules.js';
import { CITIES } from '../js/places/cities.js';
import { WARDROBE, SLOTS, STARTER, itemById } from '../js/wardrobe.js';
import { sebaSVG, EXPRESSIONS } from '../js/seba/rig.js';
import { LINES, say } from '../js/seba/lines.js';
import { STRINGS } from '../js/strings.js';
import { cityScene, barScene, kitchenScene, bathScene, sofaScene, balconyScene } from '../js/places/scenery.js';
import { ACHIEVEMENTS, checkAchievements } from '../js/achievements.js';
import { RECIPES, INGREDIENTS, recipesFor, isDone, isPrefix, orderScore } from '../js/games/shift.js';
import { makeChart, judge, perfOf as djPerf, LANES } from '../js/games/dj.js';
import { collides, perfOf as dancePerf, DURATION, LIVES } from '../js/games/dance.js';
import { newLight, stepLight, perfOf as lightPerf } from '../js/games/lighter.js';
import { newRun, stepRun, move, runDone, perfOf as runPerf } from '../js/games/runner.js';
import { QUESTIONS, pickQuestions, perfOf as quizPerf } from '../js/games/quiz.js';
import { postcardSVG, wrapText } from '../js/ui/journal.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const H = G.HOUR, T0 = Date.UTC(2026, 5, 1, 18);
const results = [];
const t = (name, fn) => results.push(test(name, fn));
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const inRange = (s) => NEEDS.every((n) => s.needs[n] >= 0 && s.needs[n] <= 100) && s.drunk >= 0 && s.drunk <= 100 &&
  s.liver >= 5 && s.liver <= 100 && s.lungs >= 5 && s.lungs <= 100 && s.tips >= 0 && Number.isInteger(s.tips) && s.hangover >= 0;

t('needs decay with time and sleeping restores them', () => {
  const s = G.newState(T0);
  const food = s.needs.food;
  G.tick(s, T0 + 2 * H);
  near(s.needs.food, food - 14, 0.01);
  G.setSleep(s, true);
  const sleep = s.needs.sleep, thirst = s.needs.thirst;
  G.tick(s, T0 + 3 * H);
  near(s.needs.sleep, Math.min(100, sleep + 18), 0.01);
  near(s.needs.thirst, thirst - 9 * 0.35, 0.01);
});

t('offline time is capped at 12 hours and Seba dozes off by himself', () => {
  const a = G.newState(T0), b = G.newState(T0);
  G.tick(a, T0 + 12 * H); G.tick(b, T0 + 900 * H);
  eq(JSON.stringify(a.needs), JSON.stringify(b.needs));
  const s = G.newState(T0); s.needs.sleep = 5;
  const r = G.catchUp(s, T0 + 4 * H);
  ok(s.asleep && r.events.some((e) => e.type === 'dozed'));
  ok(s.needs.sleep > 40, 'sleeping on the counter restores energy');
});

t('a clock moved backwards neither breaks nor freezes Seba', () => {
  const s = G.hydrate({ ...G.newState(T0 + 50 * H) }, T0);
  eq(s.last, T0);
  G.tick(s, T0 - H);
  ok(inRange(s));
});

t('drinking costs tips, raises the booze and counts double when hungry', () => {
  const s = G.newState(T0); s.needs.food = 80;
  G.consume(s, 'spritz', T0);
  eq(s.tips, 25); eq(s.drunk, 14);
  const e = G.newState(T0); e.needs.food = 5;
  G.consume(e, 'spritz', T0);
  eq(e.drunk, 28);
  G.consume(e, 'acqua', T0);
  eq(e.drunk, 14); eq(e.tips, 25);
});

t('the hangover arrives when the party wears off, in proportion to the peak', () => {
  const night = (n) => { const s = G.newState(T0); s.needs.food = 90; s.tips = 200; for (let i = 0; i < n; i++) G.consume(s, 'negroni', T0, () => 0.99); G.tick(s, T0 + 5 * H); return s; };
  eq(night(1).stats.hangovers, undefined);
  const mild = night(3), wild = night(4);
  ok(mild.stats.hangovers === 1 && wild.stats.hangovers === 1);
  ok(G.hangoverFrom(80, 90) > G.hangoverFrom(62, 90));
  ok(G.hangoverFrom(80, 20) > G.hangoverFrom(80, 90), 'a tired liver pays more');
  eq(G.hangoverFrom(40, 90), 0);
});

t('passing out is never a dead end: wait it out or use the bucket', () => {
  const s = G.newState(T0); s.needs.food = 90; s.tips = 100;
  for (let i = 0; i < 5; i++) G.consume(s, 'shot', T0, () => 0.99);
  ok(G.isPassedOut(s, T0) && s.asleep);
  eq(G.consume(s, 'acqua', T0).reason, 'asleep');
  const copy = structuredClone(s);
  const r = G.setSleep(copy, false, T0 + 1000);
  ok(r.ok && r.events.some((e) => e.type === 'bucket') && !copy.asleep && copy.drunk <= 55);
  const woke = G.tick(s, T0 + PASS_OUT_MS + 1000);
  ok(woke.events.some((e) => e.type === 'revived') && !s.asleep);
});

t('refusals: broke, full, locked, and the free water is always there', () => {
  const s = G.newState(T0); s.tips = 0;
  eq(G.consume(s, 'birra', T0).reason, 'broke');
  ok(G.consume(s, 'acqua', T0).ok);
  ok(G.canPlay(s, 'shift', T0).ok, 'working is always possible');
  s.needs.sleep = 0; s.needs.thirst = 0;
  ok(G.canPlay(s, 'shift', T0).ok && G.canPlay(s, 'runner', T0).ok);
  eq(G.canPlay(s, 'dj', T0).reason, 'tired');
  s.needs.sleep = 50; eq(G.canPlay(s, 'dance', T0).reason, 'thirsty');
  s.needs.food = 99; s.tips = 50; eq(G.consume(s, 'kebab', T0).reason, 'full');
  eq(G.buy(s, 'corona-oro').reason, 'level');
});

t('2000 random actions keep every number in range and never lock the game', () => {
  const r = rng(99);
  let s = G.newState(T0), now = T0;
  const ids = [...Object.keys(ITEMS), 'local'];
  for (let i = 0; i < 2000; i++) {
    now += Math.floor(r() * 2 * H);
    G.tick(s, now);
    const pick = Math.floor(r() * 8);
    if (pick === 0) G.consume(s, ids[Math.floor(r() * ids.length)], now, r);
    if (pick === 1) G.setSleep(s, !s.asleep, now);
    if (pick === 2) G.wash(s, r() * 40, now);
    if (pick === 3) { const g = Object.keys(GAMES)[Math.floor(r() * 6)]; if (G.canPlay(s, g, now).ok) G.applyGame(s, g, r(), { now }); }
    if (pick === 4) G.fly(s, CITIES[Math.floor(r() * CITIES.length)].id, now);
    if (pick === 5 && G.canRave(s, now).ok) G.applyRave(s, r(), now);
    if (pick === 6) G.applyAfter(s, r(), now);
    if (pick === 7) { const w = WARDROBE[Math.floor(r() * WARDROBE.length)]; if (!G.buy(s, w.id).ok) G.wear(s, w.id); else G.wear(s, w.id); }
    ok(inRange(s), `out of range at step ${i}: ${JSON.stringify(s.needs)}`);
    checkAchievements(s);
    if (i % 200 === 0) s = G.hydrate(JSON.parse(JSON.stringify(s)), now);
  }
  if (s.asleep) G.setSleep(s, false, now);
  ok(G.consume(s, 'acqua', now).ok && G.canPlay(s, 'shift', now).ok);
});

t('save data survives a round trip and rubbish is discarded', () => {
  const s = G.newState(T0); s.tips = 123; s.visited = ['berlino']; s.needs.fun = 11;
  const back = G.hydrate(JSON.parse(JSON.stringify(s)), T0);
  eq(back.tips, 123); eq(back.needs.fun, 11); eq(back.visited[0], 'berlino');
  const junk = G.hydrate({ v: 1, tips: 'lots', needs: { food: 1e9 }, owned: ['nope'], outfit: { hat: 'corona-oro' }, trip: { city: 'atlantide' } }, T0);
  eq(junk.tips, 30); eq(junk.needs.food, 100); eq(junk.outfit.hat, null); eq(junk.trip, null);
  for (const id of STARTER) ok(junk.owned.includes(id));
  eq(G.hydrate(null, T0).v, 1);
});

t('levels, rewards and the grumpy bartender', () => {
  eq(G.levelOf(0), 1); eq(G.levelOf(45), 2); eq(G.levelOf(180), 3);
  const a = G.newState(T0), b = G.newState(T0); b.needs.smoke = 0;
  const ra = G.applyGame(a, 'shift', 1, { flawless: true, now: T0 });
  const rb = G.applyGame(b, 'shift', 1, { now: T0 });
  ok(ra.tips > rb.tips, 'no smoke break, smaller tips');
  eq(a.stats['flawless.shift'], 1);
  ok(ra.events.some((e) => e.type === 'level') === (G.levelOf(a.xp) > 1));
});

t('fourteen cities: a trip goes arrived → raved → done, home is free', () => {
  eq(CITIES.length, 14);
  eq(new Set(CITIES.map((c) => c.id)).size, 14);
  for (const c of CITIES) for (const l of ['it', 'en']) for (const k of ['name', 'drink', 'rave', 'after', 'hello']) ok(c[l][k], `${c.id}.${l}.${k}`);
  const s = G.newState(T0);
  eq(G.fly(s, 'berlino', T0).reason, 'level');
  s.xp = 45 * 49; s.tips = 22;
  ok(G.fly(s, 'berlino', T0).ok); eq(s.city, 'berlino'); eq(s.tips >= 0, true); eq(s.trip.stage, 'arrived');
  eq(G.applyAfter(s, 1, T0).reason, 'no-rave');
  ok(G.applyRave(s, 1, T0).ok); eq(s.trip.stage, 'raved');
  ok(G.applyAfter(s, 1, T0).ok); eq(s.trip.stage, 'done');
  s.tips = 0; ok(G.fly(s, 'milano', T0).ok); eq(s.city, 'milano'); eq(s.trip, null);
  ok(G.applyRave(s, 0.5, T0).ok, 'the home rave works too');
  ok(G.applyAfter(s, 0.5, T0).ok); eq(s.trip, null);
  s.needs.hygiene = 3; eq(G.canRave(s, T0).reason, 'stinky');
});

t('night pays better', () => {
  const day = new Date(2026, 5, 1, 15).getTime(), night = new Date(2026, 5, 1, 1).getTime();
  eq(G.nightBonus(day), 1); eq(G.nightBonus(night), 1.3);
});

t('wardrobe: at least sixty pieces, buying and wearing work', () => {
  ok(WARDROBE.length >= 60, `only ${WARDROBE.length}`);
  eq(new Set(WARDROBE.map((w) => w.id)).size, WARDROBE.length);
  for (const w of WARDROBE) ok(SLOTS.includes(w.slot) && w.price > 0 && w.name.it && w.name.en);
  const s = G.newState(T0); s.tips = 50;
  ok(G.buy(s, 'cappellino-rosso').ok); eq(s.tips, 38);
  eq(G.buy(s, 'cappellino-rosso').reason, 'owned');
  G.wear(s, 'cappellino-rosso'); eq(s.outfit.hat, 'cappellino-rosso');
  G.wear(s, 'cappellino-rosso'); eq(s.outfit.hat, null);
  ok(itemById(STARTER[0]));
});

t('the rig draws every face and every piece as clean SVG', () => {
  const check = (svg) => { ok(svg.startsWith('<svg') && svg.endsWith('</svg>')); ok(!/NaN|undefined|null/.test(svg), 'broken value in SVG'); };
  for (const e of EXPRESSIONS) check(sebaSVG({ expr: e }));
  const faces = new Set(EXPRESSIONS.map((e) => sebaSVG({ expr: e })));
  eq(faces.size, EXPRESSIONS.length, 'two faces look the same');
  for (const w of WARDROBE) { const svg = sebaSVG({ outfit: { [w.slot]: w.id } }); check(svg); ok(svg !== sebaSVG({ outfit: {} }), `${w.id} invisible`); }
});

t('every state maps to a drawable face', () => {
  const r = rng(5);
  for (let i = 0; i < 500; i++) {
    const s = G.newState(T0);
    for (const n of NEEDS) s.needs[n] = r() * 100;
    s.drunk = r() * 100; s.hangover = r() * 90; s.lungs = r() * 100; s.asleep = r() < 0.1;
    ok(EXPRESSIONS.includes(G.expression(s, T0)));
  }
});

t('scenery draws every room and city', () => {
  const all = [barScene(), kitchenScene(), bathScene(), sofaScene(), sofaScene(true), balconyScene('milano', 22), balconyScene('tokyo', 7),
    ...CITIES.flatMap((c) => [cityScene(c.id), cityScene(c.id, 'dawn')])];
  for (const svg of all) ok(svg.startsWith('<svg') && !/NaN|undefined/.test(svg));
  eq(new Set(CITIES.map((c) => cityScene(c.id))).size, CITIES.length);
});

t('lines: same pools in both languages, roughly three hundred of them', () => {
  eq(JSON.stringify(Object.keys(LINES.it).sort()), JSON.stringify(Object.keys(LINES.en).sort()));
  const count = Object.values(LINES.it).flat().length + Object.values(LINES.en).flat().length;
  ok(count >= 280, `only ${count} lines`);
  for (const l of ['it', 'en']) for (const [k, pool] of Object.entries(LINES[l])) ok(pool.length && pool.every((x) => x.trim()), `${l}.${k}`);
  ok(say('it', 'greet'));
  eq(say('it', 'missing'), '');
  const code = readFileSync(join(ROOT, 'js/main.js'), 'utf8');
  for (const m of code.matchAll(/speak\('(\w+)'/g)) ok(LINES.it[m[1]], `main.js says unknown pool ${m[1]}`);
});

t('interface strings match across languages and every key used exists', () => {
  const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? flat(v, `${p}${k}.`) : [`${p}${k}`]));
  eq(JSON.stringify(flat(STRINGS.it).sort()), JSON.stringify(flat(STRINGS.en).sort()));
  const keys = new Set(flat(STRINGS.it));
  for (const id of Object.keys(ITEMS)) ok(keys.has(`item.${id}`), `item.${id}`);
  for (const id of Object.keys(GAMES)) ok(keys.has(`game.${id}.help`));
  for (const n of NEEDS) ok(keys.has(`need.${n}`));
  const files = readdirSync(join(ROOT, 'js'), { recursive: true }).filter((f) => String(f).endsWith('.js'));
  for (const f of files) for (const m of readFileSync(join(ROOT, 'js', String(f)), 'utf8').matchAll(/\bt\('([\w.]+)'/g)) ok(keys.has(m[1]), `${f}: ${m[1]}`);
  for (const r of ['asleep', 'broke', 'full', 'tired', 'thirsty', 'stinky', 'level', 'here']) ok(keys.has(`reason.${r}`));
});

t('achievements: forty or so, unique, and none unlocked at birth', () => {
  ok(ACHIEVEMENTS.length >= 40);
  eq(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length);
  eq(checkAchievements(G.newState(T0)).length, 0);
  const s = G.newState(T0); G.consume(s, 'acqua', T0);
  eq(checkAchievements(s)[0].id, 'first-sip');
  eq(checkAchievements(s).length, 0);
});

t('a legend can unlock every achievement', () => {
  const s = G.newState(T0);
  const keys = ['kind.drink', 'use.acqua', 'kind.smoke', 'use.menta', 'coughs', 'use.kebab', 'nightBite', 'use.frutta', 'showers', 'fullNights', 'dozed', 'shifts', 'flawless.shift', 'flawless.dj', 'flawless.dance', 'flawless.runner', 'flawless.lighter', 'flawless.quiz', 'figuracce', 'passouts', 'hangovers', 'raves', 'afters', 'earned', 'bought', 'pets', 'nightOwl'];
  for (const k of keys) s.stats[k] = 5000;
  s.xp = 45 * 100; s.lungs = 100; s.visited = CITIES.slice(1).map((c) => c.id); s.owned = WARDROBE.map((w) => w.id);
  for (const slot of SLOTS) s.outfit[slot] = WARDROBE.find((w) => w.slot === slot).id;
  checkAchievements(s);
  eq(s.achievements.length, ACHIEVEMENTS.length);
});

t('counter: recipes use real ingredients and scoring rewards speed', () => {
  for (const r of RECIPES) ok(r.parts.every((p) => INGREDIENTS[p]), r.id);
  ok(recipesFor(1).length >= 3 && recipesFor(10).length === RECIPES.length);
  const r = RECIPES[0];
  ok(isPrefix(r, r.parts.slice(0, 1)) && !isDone(r, r.parts.slice(0, 1)) && isDone(r, r.parts));
  ok(orderScore(true, 20, 0) === 1 && orderScore(true, 0, 0) === 0.7 && orderScore(false, 20, 0) === 0);
});

t('decks: charts are playable and judging is fair', () => {
  for (const c of CITIES) {
    const notes = makeChart(c.bpm, 12345);
    ok(notes.length >= 35);
    notes.forEach((n, i) => { ok(n.lane >= 0 && n.lane < LANES); if (i) ok(n.t > notes[i - 1].t, 'out of order'); });
  }
  eq(judge(0.02), 'perfect'); eq(judge(-0.12), 'good'); eq(judge(0.3), null);
  eq(djPerf(10, 0, 10), 1); eq(djPerf(0, 0, 10, 99), 0);
});

t('floor: collisions and score', () => {
  ok(collides(0, 0, 30, 30, 44) && !collides(0, 0, 40, 40, 44));
  eq(dancePerf(DURATION, 12, 10, LIVES), 1);
  ok(dancePerf(5, 0, 5, 0) < 0.2);
});

t('lighter: a sensible player lights it, holding forever or never does worse', () => {
  const play = (strategy, seed) => { const s = newLight(); for (let i = 0; i < 2400; i++) { const out = stepLight(s, 1 / 60, strategy(s), seed); if (out) return { out, s }; } return { out: null, s }; };
  let smart = 0, never = 0;
  for (let k = 0; k < 40; k++) {
    if (play((s) => s.wind > 0.35, k * 0.37).out === 'lit') smart++;
    if (play(() => false, k * 0.37).out === 'lit') never++;
  }
  ok(smart >= 32, `smart player lit ${smart}/40`);
  ok(never < smart / 2, `doing nothing lit ${never}/40`);
  eq(lightPerf(true, 1, 1), 1); ok(lightPerf(false, 3, 0.5) < 0.5);
});

t('walk home: dodging pays, drunk mirrors the controls', () => {
  const run = (bot, seed) => {
    const r = rng(seed), s = newRun();
    while (!runDone(s)) {
      if (bot) {
        const danger = (l) => s.things.some((o) => o.lane === l && o.kind !== 'kebab' && o.y > 0.45 && o.y < 0.86);
        if (danger(s.lane)) { const free = [0, 1, 2].filter((l) => !danger(l) && Math.abs(l - s.lane) === 1)[0]; if (free !== undefined) move(s, free - s.lane); }
      }
      stepRun(s, 1 / 60, 0, r);
    }
    return s;
  };
  let bot = 0, idle = 0;
  for (let k = 1; k <= 30; k++) { bot += runPerf(run(true, k * 77)); idle += runPerf(run(false, k * 77)); }
  ok(bot > idle, `bot ${bot} idle ${idle}`);
  const s = newRun(); s.t = 6; stepRun(s, 0.01, 90, rng(3)); ok(s.flip); move(s, -1); eq(s.lane, 2);
});

t('blunders: enough situations, each with a best way out', () => {
  ok(QUESTIONS.length >= 14);
  for (const q of QUESTIONS) { eq(q.opts.length, 3); ok(q.opts.some((o) => o.score === 2), q.id); for (const o of q.opts) ok(o.label.it && o.label.en && o.out.it && o.out.en); }
  eq(new Set(pickQuestions(3, rng(4)).map((q) => q.id)).size, 3);
  eq(quizPerf([2, 2, 2]), 1); eq(quizPerf([]), 0);
});

t('postcards are self-contained and wrap their line', () => {
  const svg = postcardSVG({ t: T0, kind: 'rave', city: 'tokyo', outfit: {}, expr: 'hype', line: 'Una "frase" lunga <con> simboli & tante parole che deve andare a capo almeno una volta' }, 'it');
  ok(!/NaN|undefined/.test(svg) && svg.includes('&amp;') && svg.includes('&lt;con&gt;'));
  eq(wrapText('uno due tre quattro cinque sei', 10, 2).length, 2);
});

t('the service worker precaches every file the app needs', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  const listed = [...sw.matchAll(/'(\.\.?\/[^']*)'/g)].map((m) => m[1]);
  for (const p of listed) if (p !== './') ok(existsSync(join(ROOT, p)), `missing ${p}`);
  for (const f of readdirSync(join(ROOT, 'js'), { recursive: true })) {
    if (String(f).endsWith('.js')) ok(listed.includes(`./${relative(ROOT, join(ROOT, 'js', String(f)))}`), `not cached: ${f}`);
  }
  ok(sw.includes("PREFIX = 'seba-'"));
});

summary(results.filter(Boolean).length, results.length);
