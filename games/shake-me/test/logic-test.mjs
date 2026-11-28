/* Shake Me — logic tests. Run: node games/shake-me/test/logic-test.mjs */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, eq, ok, summary } from '../../_kit/test-harness.js';
import { RECIPES, RECIPE, parseIngredient } from '../js/data/recipes.js';
import { INGREDIENTS, BY_ID } from '../js/data/ingredients.js';
import { GARNISH, GLASSES, TOOL_FOR } from '../js/data/bar.js';
import * as W from '../js/workbench.js';
import { judge, starsOf } from '../js/judge.js';
import { stepsOf, perfectPlay, play, doseText, nextStep } from '../js/steps.js';
import { TIERS, bandOf } from '../js/judge.js';
import * as V from '../js/service.js';
import * as S from '../js/state.js';
import { STRINGS } from '../js/strings.js';
import { LINES, verdictLine } from '../js/lines.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const results = [];
const t = (name, fn) => results.push(test(name, fn));
const perfect = (r) => play(W.newBench(), perfectPlay(r));
const without = (moves, fn) => moves.filter((m) => !fn(m));
const run = (r, moves, tier = 'easy') => judge(r, play(W.newBench(), moves), tier);

/* ---------- data ---------- */
t('102 IBA cocktails, 34 per category, plus 10 alcohol-free', () => {
  const c = {};
  for (const r of RECIPES) c[r.cat] = (c[r.cat] || 0) + 1;
  eq(JSON.stringify(c), JSON.stringify({ unforgettables: 34, contemporary: 34, newera: 34, zero: 10 }));
  eq(new Set(RECIPES.map((r) => r.id)).size, RECIPES.length);
  ok(RECIPES.filter((r) => r.cat === 'zero').every((r) => !r.iba));
});
t('every ingredient, glass and garnish exists; every dose is positive', () => {
  for (const r of RECIPES) {
    for (const l of r.ings) {
      for (const id of l.ids) ok(BY_ID[id], `${r.id}: ${id}`);
      ok(l.unit === 'some' || l.amount > 0, r.id);
      ok(['base', 'top', 'float', 'rinse'].includes(l.stage), r.id);
    }
    for (const g of r.glass) ok(GLASSES.some((x) => x.id === g), r.id);
    for (const g of r.garnish) for (const id of g.ids) ok(GARNISH[id], `${r.id}: ${id}`);
    ok(['none', 'cubes', 'crushed', '*'].includes(r.ice), r.id);
    ok(TOOL_FOR[r.method], r.id);
  }
});
t('the alcohol-free recipes contain no alcohol', () => {
  for (const r of RECIPES.filter((x) => x.cat === 'zero')) for (const l of r.ings) for (const id of l.ids) eq(BY_ID[id].abv, 0, `${r.id}: ${id}`);
});
t('no brand names anywhere in the data', () => {
  const brands = /campari|aperol|luxardo|chartreuse|cointreau|grand marnier|kahl[uú]a|smirnoff|angostura|peychaud|drambuie|b[ée]n[ée]dictine|lillet|cynar|cinzano|fernet[- ]branca|nonino|lagavulin|frangelico|havana club|goslings|pernod|monin|tabasco|sangue morlacco/i;
  for (const i of INGREDIENTS) ok(!brands.test(i.name.it + i.name.en), i.id);
  for (const r of RECIPES) for (const lang of ['it', 'en']) ok(!brands.test(stepsOf(r, lang).join(' ')), r.id);
  for (const g of Object.values(GARNISH)) ok(!brands.test(g.it + g.en), g.id);
});
t('a few recipes match the IBA specs exactly', () => {
  const spec = (id) => RECIPE[id].ings.map((l) => `${l.amount ?? 'some'} ${l.unit} ${l.ids.join('|')}${l.stage === 'base' ? '' : ':' + l.stage}`).join('; ');
  eq(spec('negroni'), '30 ml gin; 30 ml red-bitter; 30 ml sweet-vermouth');
  eq(spec('daiquiri'), '60 ml white-rum; 20 ml lime; 2 bs sugar');
  eq(spec('margarita'), '50 ml tequila; 20 ml triple-sec; 15 ml lime');
  eq(spec('aviation'), '45 ml gin; 15 ml maraschino; 15 ml lemon; 1 bs violette');
  eq(spec('spritz'), '90 ml prosecco; 60 ml orange-aperitif; some some soda:top');
  eq(RECIPE['sazerac'].ings[1].stage, 'rinse');
  eq(RECIPE['tequila-sunrise'].ings[2].stage, 'float');
});
t('the ingredient syntax parses', () => {
  eq(JSON.stringify(parseIngredient('opt 2 dash orange-bitters:top')), JSON.stringify({ ids: ['orange-bitters'], amount: 2, unit: 'dash', stage: 'top', optional: true }));
  eq(JSON.stringify(parseIngredient('45 bourbon|rye')), JSON.stringify({ ids: ['bourbon', 'rye'], amount: 45, unit: 'ml', stage: 'base', optional: false }));
  eq(parseIngredient('some soda:top').unit, 'some');
});

/* ---------- the judge ---------- */
t('by the book scores 100 for all 112 recipes, at every tier', () => {
  for (const r of RECIPES) for (const tier of ['easy', 'medium', 'hard']) eq(judge(r, perfect(r), tier).score, 100, `${r.id} ${tier}`);
});
t('a dose off by 20% is fine when easy, costs when hard', () => {
  const r = RECIPE.negroni;
  const moves = perfectPlay(r).map((m) => (m[0] === 'pour' && m[1] === 'gin' ? ['pour', 'gin', 36, 'ml', m[4]] : m));
  const easy = run(r, moves, 'easy'), hard = run(r, moves, 'hard');
  eq(easy.score, 100);
  ok(hard.score < 100 && hard.parts.dose < 25 && hard.defects.some((d) => d.key === 'doseHigh' && d.ing === 'gin'));
  const way = perfectPlay(r).map((m) => (m[0] === 'pour' && m[1] === 'gin' ? ['pour', 'gin', 60, 'ml', m[4]] : m));
  ok(run(r, way, 'easy').parts.dose < 20);
});
t('each typical mistake loses its own points', () => {
  const r = RECIPE.daiquiri;
  const base = perfectPlay(r);
  const missing = run(r, without(base, (m) => m[0] === 'pour' && m[1] === 'lime'));
  ok(missing.defects.some((d) => d.key === 'missing' && d.ing === 'lime') && missing.parts.ing < 35);
  const extra = run(r, [...base, ['pour', 'cola', 50, 'ml', 'glass']]);
  ok(extra.defects.some((d) => d.key === 'extra' && d.ing === 'cola'));
  const glass = run(r, base.map((m) => (m[0] === 'chooseGlass' ? ['chooseGlass', 'highball'] : m)));
  eq(glass.parts.glass, 5);
  const noShake = run(r, without(base, (m) => m[0] === 'act'));
  ok(noShake.defects.some((d) => d.key === 'noAction'));
  const long = run(r, base.map((m) => (m[0] === 'act' ? ['act', 'shake', 1.15] : m)));
  ok(long.defects.some((d) => d.key === 'actionLong') && long.parts.tech < 15);
  const dry = run(r, without(base, (m) => m[0] === 'setToolIce'));
  ok(dry.defects.some((d) => d.key === 'noIce'));
  const garnish = run(r, [...base, ['toggleGarnish', 'olive']]);
  ok(garnish.defects.some((d) => d.key === 'garnishExtra'));
  const stirInstead = run(r, base.map((m) => (m[0] === 'chooseTool' ? ['chooseTool', 'mixing'] : m[0] === 'act' ? ['act', 'stir', 0.6] : m)));
  ok(stirInstead.defects.some((d) => d.key === 'tool') && stirInstead.parts.tech <= 5);
});
t('order matters: bubbles last, rinse first, muddle before', () => {
  const fizz = RECIPE['gin-fizz'];
  const moves = perfectPlay(fizz).map((m) => (m[0] === 'pour' && m[1] === 'soda' ? ['pour', 'soda', 1, 'some', 'tool'] : m));
  const i = moves.findIndex((m) => m[1] === 'soda');
  const early = [...moves.slice(0, i), ...moves.slice(i + 1)];
  early.splice(early.findIndex((m) => m[0] === 'setToolIce'), 0, moves[i]);
  ok(run(fizz, early).defects.some((d) => d.key === 'top'));
  const saz = RECIPE.sazerac;
  const late = perfectPlay(saz).filter((m) => !(m[0] === 'pour' && m[1] === 'absinthe'));
  late.splice(late.findIndex((m) => m[0] === 'toggleGarnish'), 0, ['pour', 'absinthe', 10, 'ml', 'glass']);
  ok(run(saz, late).defects.some((d) => d.key === 'rinse'));
  const mojito = run(RECIPE.mojito, without(perfectPlay(RECIPE.mojito), (m) => m[0] === 'muddle'));
  ok(mojito.defects.some((d) => d.key === 'muddle'));
});
t('rims: required, optional and unwanted', () => {
  const crusta = run(RECIPE['brandy-crusta'], without(perfectPlay(RECIPE['brandy-crusta']), (m) => m[0] === 'setRim'));
  ok(crusta.defects.some((d) => d.key === 'rimMissing'));
  eq(judge(RECIPE.margarita, perfect(RECIPE.margarita)).score, 100);
  eq(run(RECIPE.margarita, [...perfectPlay(RECIPE.margarita), ['setRim', 'salt']]).score, 100);
  ok(run(RECIPE.negroni, [...perfectPlay(RECIPE.negroni), ['setRim', 'sugar']]).defects.some((d) => d.key === 'rimExtra'));
});
t('alternatives and optional ingredients are accepted', () => {
  const r = RECIPE.boulevardier;
  eq(run(r, perfectPlay(r).map((m) => (m[1] === 'bourbon' ? ['pour', 'rye', 45, 'ml', m[4]] : m))).score, 100);
  eq(run(RECIPE['whiskey-sour'], [...perfectPlay(RECIPE['whiskey-sour']).slice(0, 5), ['pour', 'egg-white', 1, 'some', 'tool'], ...perfectPlay(RECIPE['whiskey-sour']).slice(5)]).score, 100);
});
t('nothing poured scores almost nothing; stars follow the score', () => {
  const b = W.newBench(); W.chooseGlass(b, 'rocks');
  ok(judge(RECIPE.negroni, b).score < 30);
  eq([0, 54, 55, 74, 75, 89, 90, 100].map(starsOf).join(), '0,0,1,1,2,2,3,3');
});

t('following the guide step by step makes every drink perfectly', () => {
  for (const r of RECIPES) {
    const b = W.newBench();
    let n = 0, step;
    while ((step = nextStep(r, b)) && n++ < 60) {
      const [fn, ...args] = step;
      const err = W[fn](b, ...args);
      ok(!err, `${r.id}: ${fn} ${err}`);
    }
    eq(nextStep(r, b), null, r.id);
    eq(judge(r, b, 'easy').score, 100, r.id);
  }
});
t('the guide skips what is already done and starts with the glass', () => {
  const r = RECIPE.daiquiri, b = W.newBench();
  eq(nextStep(r, b)[0], 'chooseGlass');
  W.chooseGlass(b, 'cocktail'); W.chooseTool(b, 'shaker');
  eq(nextStep(r, b).slice(0, 2).join(), 'pour,white-rum');
});
t('the first evenings forgive more', () => {
  ok(TIERS.easy.tol > TIERS.medium.tol && TIERS.medium.tol > TIERS.hard.tol);
  ok(TIERS.easy.guide && !TIERS.medium.guide && !TIERS.hard.guide);
  ok(bandOf('shake', 'easy')[0] < bandOf('shake', 'hard')[0] && bandOf('shake', 'easy')[1] > bandOf('shake', 'hard')[1]);
  const r = RECIPE.daiquiri;
  const short = perfectPlay(r).map((m) => (m[0] === 'act' ? ['act', 'shake', 0.33] : m));
  eq(run(r, short, 'easy').parts.tech, 15);
  ok(run(r, short, 'hard').parts.tech < 15);
  const res = V.nightResult([48, 50, 46, 44, 52], 0);
  ok(res.passed && res.stars >= 1 && res.pass === 45);
  ok(!V.nightResult([48, 50, 46, 44, 52], 6).passed);
});

/* ---------- the bench ---------- */
t('the bench refuses impossible moves', () => {
  const b = W.newBench();
  eq(W.pour(b, 'gin', 30, 'ml'), 'noTool');
  eq(W.chooseTool(b, 'shaker'), null);
  eq(W.pour(b, 'gin', 30, 'ml', 'glass'), 'noGlass');
  eq(W.pour(b, 'gin', 30, 'ml'), null);
  eq(W.chooseTool(b, 'mixing'), 'toolBusy');
  eq(W.act(b, 'stir', 0.5), 'wrongTool');
  eq(W.strain(b), 'noGlass');
  eq(W.muddle(b), 'nothingToMuddle');
  W.chooseGlass(b, 'cocktail');
  eq(W.strain(b), null);
  eq(W.pour(b, 'gin', 10, 'ml', 'tool'), 'strained');
  eq(W.defaultTarget(b), 'glass');
  eq(W.chooseGlass(b, 'rocks'), 'glassBusy');
  ok(W.contents(b).glass.length === 1 && W.contents(b).tool.length === 0);
});

/* ---------- evenings ---------- */
t('twelve evenings share out all 102 IBA cocktails, easy ones first', () => {
  const all = V.NIGHT_MENU.flat();
  eq(all.length, 102); eq(new Set(all).size, 102);
  for (const m of V.NIGHT_MENU) ok(m.length >= 8 && m.length <= 9);
  ok(V.effort(RECIPE[V.NIGHT_MENU[0][0]]) < V.effort(RECIPE[V.NIGHT_MENU[11][0]]));
  eq([0, 3, 4, 7, 8, 11].map(V.tierOf).join(), 'easy,easy,medium,medium,hard,hard');
});
t('an evening has five orders, new and old, with the sober driver every third', () => {
  for (let n = 0; n < V.NIGHTS; n++) {
    const o = V.nightOrders(n, 7);
    eq(o.length, 5);
    eq(JSON.stringify(o), JSON.stringify(V.nightOrders(n, 7)));
    const known = new Set(V.NIGHT_MENU.slice(0, n + 1).flat());
    for (const x of o) ok(known.has(x.recipe) || RECIPE[x.recipe].cat === 'zero', `${n} ${x.recipe}`);
    eq(o.filter((x) => x.customer === 'luca').length, n % 3 === 2 ? 1 : 0);
    ok(o.filter((x) => V.NIGHT_MENU[n].includes(x.recipe)).length >= (n ? 3 : 4));
  }
  eq(V.nightResult([60, 50, 70, 40, 80]).avg, 60);
  ok(V.nightResult([60, 50, 70, 40, 80]).passed && !V.nightResult([50, 50, 50, 50, 50]).passed);
});
t('daily and by-heart picks', () => {
  eq(V.dailyOrders(20261128).join(), V.dailyOrders(20261128).join());
  ok(V.dailyOrders(20261128).join() !== V.dailyOrders(20261129).join());
  eq(new Set(V.dailyOrders(20261128)).size, 3);
  ok(V.NIGHT_MENU[0].includes(V.memoryPick([])));
  eq(V.memoryPick(['negroni', 'zero-mojito'], () => 0), 'negroni');
  ok(V.memoryPick(['negroni', 'daiquiri'], () => 0, 'negroni') === 'daiquiri');
});

/* ---------- save ---------- */
t('a broken save becomes a valid one, a good one survives', () => {
  for (const raw of [null, 3, [], { nights: { 0: 9, 1: -1 }, best: { negroni: 'x' }, made: { a: 2 } }]) {
    const s = S.hydrate(raw);
    ok(Object.values(s.nights).every((v) => v <= 3) && !('negroni' in s.best));
  }
  const s = S.newState();
  S.recordServe(s, 'negroni', 80); S.finishNight(s, 0, { avg: 80, stars: 2, passed: true }); S.finishDaily(s, 20261128, 240);
  eq(JSON.stringify(S.hydrate(JSON.parse(JSON.stringify(s)))), JSON.stringify(s));
  const again = S.recordServe(s, 'negroni', 70);
  ok(!again.first && !again.newBest); eq(s.best.negroni, 80); eq(s.made.negroni, 2);
  eq(S.finishNight(s, 0, { avg: 60, stars: 1 }).improved, false); eq(s.nights[0], 2);
});

/* ---------- text ---------- */
const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keys(v, p + k + '.') : [p + k])).sort();
t('Italian and English match', () => {
  eq(keys(STRINGS.it).join(), keys(STRINGS.en).join());
  eq(keys(LINES.it).join(), keys(LINES.en).join());
  for (const i of INGREDIENTS) ok(i.name.it && i.name.en, i.id);
  for (const g of Object.values(GARNISH)) ok(g.it && g.en, g.id);
  for (const c of V.CUSTOMERS) ok(c.it && c.en && LINES.it.customer[c.id], c.id);
});
t('every recipe has a written method in both languages', () => {
  for (const r of RECIPES) for (const lang of ['it', 'en']) {
    const s = stepsOf(r, lang);
    ok(s.length >= 3 && s.every((x) => x && !x.includes('{') && !x.includes('undefined')), `${r.id} ${lang}`);
    for (const l of r.ings) ok(doseText(l, lang).length > 2);
  }
});
t('Tobia names the main mistake', () => {
  const names = { ing: (id) => BY_ID[id]?.name.it.toLowerCase() ?? '', dose: (n, u) => `${n} ${u}`, thing: (v) => String(v), action: (a) => a, garnish: (g) => g, rim: (r) => r };
  const res = run(RECIPE.negroni, without(perfectPlay(RECIPE.negroni), (m) => m[1] === 'gin'));
  const line = verdictLine('it', res, names, () => 0);
  ok(line.includes('gin'), line);
  ok(!verdictLine('en', judge(RECIPE.negroni, perfect(RECIPE.negroni)), names, () => 0).includes('{'));
});

/* ---------- files ---------- */
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
t('the service worker precaches every file', () => {
  ok(existsSync(join(ROOT, 'sw.js')));
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  for (const f of [...walk(join(ROOT, 'js')), ...walk(join(ROOT, 'icons'))]) ok(sw.includes(`'./${relative(ROOT, f)}'`), relative(ROOT, f));
});

summary(results.filter(Boolean).length, results.length);
