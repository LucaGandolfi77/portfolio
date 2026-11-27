/* Bar Blu — logic tests (node games/bar-blu/test/logic-test.mjs) */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import { parseScript, walkNodes, splitArgs } from '../js/engine/script.js';
import { Runner, newStoryState, evaluate, applyEffect, interpolate } from '../js/engine/runner.js';
import { SOURCES, START, NIGHTS } from '../js/story/index.js';
import { CAST, REGULARS, DRINKS, silhouette } from '../js/cast.js';
import { spinOutcome } from '../js/ui/minigames.js';

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };
const script = parseScript(SOURCES);
const COMMANDS = new Set(['bg', 'fx', 'music', 'sfx', 'show', 'hide', 'wait', 'title', 'rush', 'saletta', 'postcard', 'memory', 'input', 'credits', 'end']);
const BGS = new Set(['mattina', 'pomeriggio', 'sera', 'notte', 'candele', 'saletta', 'palco', 'cantina', 'esterno-notte', 'esterno-alba', 'esterno-chiuso']);

/** Plays the whole story; `pick(event, runner)` chooses an option index. */
function playthrough(pick) {
  const r = new Runner(script, newStoryState());
  r.goto(START);
  let e, steps = 0;
  while ((e = r.next()).t !== 'end') {
    if (++steps > 8000) throw new Error('endless loop at ' + r.state.knot);
    if (e.t === 'choices') r.choose(pick(e, r));
    else if (e.t === 'cmd' && e.name === 'rush') r.state.vars.mance += 3;
    else if (e.t === 'cmd' && e.name === 'input') r.state.vars[e.args[0]] = 'Prova';
  }
  return { end: e, state: r.state };
}

run('parser: scenes, speakers, choices, gathers', () => {
  const s = parseScript({ t: '=== a\nLUCA (piano): Ciao.\n> Narra.\n* [Uno]\n  ~ x = 1\n* {x > 0} [Due] -> b\nDopo.\n=== b\n@end fine' });
  const a = s.knots.a;
  eq(a[0].t, 'say'); eq(a[0].who, 'luca'); eq(a[0].dir, 'piano');
  eq(a[1].t, 'narr'); eq(a[1].text, 'Narra.');
  eq(a[2].t, 'choice'); eq(a[2].options.length, 2); eq(a[2].options[1].cond, 'x > 0');
  eq(a[3].text, 'Dopo.');
  eq(splitArgs('postcard id "due parole"').join('|'), 'postcard|id|due parole');
});

run('expressions and effects, without eval', () => {
  const st = newStoryState();
  applyEffect(st, 'mance = 5; trust.ugo += 2; flag; mance -= 1');
  eq(st.vars.mance, 4); eq(st.trust.ugo, 2); eq(st.vars.flag, true);
  const look = (n) => (n.startsWith('trust.') ? st.trust[n.slice(6)] || 0 : st.vars[n] ?? 0);
  ok(evaluate('mance >= 1 && trust.ugo > 1 && !nope', look));
  ok(evaluate("(a || flag) && origin != 'fuga'", look));
  eq(evaluate('2 + 3 - 1', look), 4);
  eq(interpolate('{mance} € e {sconosciuto}', st), '4 € e {sconosciuto}');
  let threw = false; try { evaluate('alert(1)', look); } catch (e) { threw = true; }
  ok(threw, 'function calls must be rejected');
});

run('the script: 7 nights, every jump and command valid', () => {
  ok(Object.keys(script.knots).length >= 60, 'too few scenes');
  for (const n of [START, ...NIGHTS]) ok(script.knots[n], `missing ${n}`);
  for (const [k, nodes] of Object.entries(script.knots)) {
    walkNodes(nodes, (n) => {
      if (n.t === 'goto') ok(script.knots[n.target], `${n.where}: -> ${n.target} does not exist`);
      if (n.t === 'cmd') {
        ok(COMMANDS.has(n.name), `${n.where}: unknown @${n.name}`);
        if (n.name === 'bg') ok(BGS.has(n.args[0]), `${n.where}: unknown background ${n.args[0]}`);
        if (n.name === 'show') ok(CAST[n.args[0]]?.look, `${n.where}: no silhouette for ${n.args[0]}`);
      }
      if (n.t === 'say') ok(CAST[n.who] || /^[a-z ]+$/.test(n.who), `${n.where}: speaker ${n.who}`);
      if (n.cond) evaluate(n.cond, () => 0);
      if (n.t === 'choice') for (const o of n.options) if (o.cond) evaluate(o.cond, () => 0);
    });
  }
});

run('every scene is reachable from the start', () => {
  const seen = new Set([START]);
  const queue = [START];
  while (queue.length) {
    const k = queue.shift();
    walkNodes(script.knots[k], (n) => { if (n.t === 'goto' && !seen.has(n.target)) { seen.add(n.target); queue.push(n.target); } });
  }
  const orphans = Object.keys(script.knots).filter((k) => !seen.has(k));
  eq(orphans.length, 0, `orphans: ${orphans.join(', ')}`);
});

run('2000 random playthroughs: no dead ends, every ending reached', () => {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const endings = {};
  for (let i = 0; i < 2000; i++) {
    const { end, state } = playthrough((e) => e.options[Math.floor(rnd() * e.options.length)].index);
    ok(end.reason !== 'fallthrough', `fell off the end of ${end.knot}`);
    endings[state.vars.finale] = (endings[state.vars.finale] || 0) + 1;
    ok(state.vars.ugo_salvo !== state.vars.ugo_morto || !state.vars.ugo_salvo, 'Ugo both saved and dead');
  }
  for (const f of ['luce', 'tramonto', 'ronzio', 'buio']) ok(endings[f] > 0, `ending ${f} never reached: ${JSON.stringify(endings)}`);
});

run('a kind, attentive player can reach the light', () => {
  const score = (o) => {
    let s = 0;
    walkNodes(o.body, (n) => {
      if (n.t === 'fx') { s += (n.expr.match(/trust\.\w+\s*\+=/g) || []).length * 2; if (/trust\.\w+\s*-=/.test(n.expr)) s -= 3; if (/quarta|ugo_morto|gigi_truffato/.test(n.expr)) s -= 6; if (/salv|piano_spegnere|giulia_viene|seme|cantato|seduta|matteo/.test(n.expr)) s += 4; }
      if (n.t === 'goto' && /giulia_si|ugo_chiave|ugo_dormitorio|casta|fine_luce|n6_busta/.test(n.target)) s += 5;
      if (n.t === 'cmd' && n.name === 'saletta') s -= 2;
    });
    return s;
  };
  const { state } = playthrough((e, r) => {
    const node = r.pending.node;
    let best = e.options[0], bs = -1e9;
    for (const o of e.options) {
      let s = score(node.options[o.index]);
      if (/sospeso/i.test(o.text)) s += r.state.vars.sospesi < 4 ? 3 : -1;
      if (/le tue mance/.test(o.text)) s += 9;
      if (s > bs) { bs = s; best = o; }
    }
    return best.index;
  });
  eq(state.vars.finale, 'luce');
  ok(state.vars.ugo_salvo && state.vars.gigi_salvo, 'Ugo and Gigi should be saved');
  ok(state.vars.colletta >= 2400, `colletta ${state.vars.colletta}`);
});

run('the machines: about nine euros back out of ten, many near misses', () => {
  let seed = 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let paid = 0, near = 0;
  const N = 40000;
  for (let i = 0; i < N; i++) { const o = spinOutcome(rnd); paid += o.pay; if (o.near) near++; ok(o.reels.length === 3); }
  near_(paid / N);
  function near_(rtp) { ok(rtp > 0.84 && rtp < 0.97, `RTP ${rtp.toFixed(3)}`); }
  ok(near / N > 0.2, 'not enough near misses');
});

run('cast: every regular orders a real drink, silhouettes render', () => {
  for (const r of REGULARS) ok(DRINKS[r.drink], r.name);
  for (const [id, c] of Object.entries(CAST)) if (c.look) ok(silhouette(c.look, c.color, id).startsWith('<svg'), id);
});

run('the player is never gendered in narration or dialogue', () => {
  const bad = /\b(Bravo|sei arrivato|sei stanco|Il giovane|sei nuovo|sei bravo)\b/;
  for (const [file, src] of Object.entries(SOURCES)) {
    src.split('\n').forEach((line, i) => ok(!bad.test(line), `${file}:${i + 1}: ${line.trim()}`));
  }
});

run('PWA: the service worker precaches every module and background', () => {
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  const files = [];
  const walk = (dir, pre) => { for (const f of readdirSync(new URL(dir, import.meta.url), { withFileTypes: true })) { if (f.isDirectory()) walk(dir + f.name + '/', pre + f.name + '/'); else files.push(pre + f.name); } };
  walk('../js/', './js/');
  for (const f of files) ok(sw.includes(f), `sw misses ${f}`);
  for (const bg of BGS) {
    ok(sw.includes(`./art/${bg}.webp`), `sw misses ${bg}`);
    ok(existsSync(new URL(`../art/${bg}.webp`, import.meta.url)), `art/${bg}.webp missing`);
  }
});

summary(passed, total);
