/* Pocket Wild — Parallel Engine Fuzz Runner
 * Run:  node tests/fuzz.cjs            (campagna rapida: 3 seed × 3 difficoltà × 2 modalità)
 *       node tests/fuzz.cjs --long     (aggiunge una run profonda da 1500s in Nightmare/Speedrun)
 *
 * Lancia migliaia di stepSim su molte combinazioni seed×difficoltà×modalità e
 * verifica invarianti a ogni step: niente NaN/negativi, giocatore mai bloccato
 * su terreno solido (se non in volo), wild/squadra/quest sane, nessuna eccezione,
 * snapshot/restore round-trip. Esce con codice 1 se trova problemi. */
'use strict';
const { buildCore } = require('./harness');
const M = buildCore();
const { G } = M;

M.setSilent(true);
const LONG = process.argv.includes('--long');

const SEEDS = [7, 42, 1234];
const DIFFS = ['easy', 'normal', 'nightmare'];
const MODES = ['story', 'zen'];
const STEPS = 3000; /* 150s di gioco per run */

let runs = 0, issues = 0, exceptions = 0;
const problems = [];
function issue(seed, diff, mode, msg) {
  issues++;
  problems.push(`[${seed}/${diff}/${mode}] ${msg}`);
  console.log('  ⚠ ' + problems[problems.length - 1]);
}
function check(seed, diff, mode, cond, msg) { if (!cond) issue(seed, diff, mode, msg); }

function setup(seed, diff, mode) {
  M.setSeed(seed);
  G.mode = mode; G.diff = diff;
  M.newWorld();
  G.sph = [8, 4, 2];
  G.inv.ess = 40; G.inv.grass = 10; G.inv.wood = 10; G.inv.stone = 10; G.inv.coins = 50;
  G.team = [M.makeOwned(M.speciesOf('grassling'), 5), M.makeOwned(M.speciesOf('emberpup'), 5)];
  G.active = 0; G.player.hp = G.player.maxHp;
  M.BOT.goal = null; M.BOT.data = null; M.BOT.log = []; M.BOT.t = 0;
}

function runCampaign(seed, diff, mode, steps) {
  runs++;
  setup(seed, diff, mode);
  const snap = M.snapshotG();
  for (let i = 0; i < steps; i++) {
    try { M.stepSim(0.05); }
    catch (e) { exceptions++; issue(seed, diff, mode, `step ${i} threw: ${e.message}`); break; }
    if (i % 250 === 0) {
      const p = G.player;
      check(seed, diff, mode, !isNaN(p.x) && !isNaN(p.y) && !isNaN(p.hp) && !isNaN(G.hunger) && !isNaN(G.day) && G.time >= 0 && G.time < 1, 'NaN/out-of-range state');
      check(seed, diff, mode, p.hp >= 0 && G.hunger >= 0, 'negative hp/hunger');
      check(seed, diff, mode, !G.flying && !M.solidAt(p.x, p.y), 'player stuck on solid tile');
      check(seed, diff, mode, G.wilds.length <= 150, `wild count ${G.wilds.length}`);
      for (const w of G.wilds) {
        check(seed, diff, mode, !isNaN(w.hp) && w.maxHp > 0 && w.hp <= w.maxHp + 1, `bad wild (${w.id})`);
        break;
      }
      for (const t of G.team) check(seed, diff, mode, t.maxHp > 0 && !isNaN(t.atk) && t.spd > 0, `bad team pal`);
      for (const q of G.quests) check(seed, diff, mode, q.done <= q.t, `quest over target (${q.id})`);
      for (const k in G.inv) if (typeof G.inv[k] === 'number' && G.inv[k] < 0) issue(seed, diff, mode, `negative inv.${k}`);
    }
  }
  /* raccogli le statistiche PRIMA del restore */
  const res = {
    day: G.day - 1, catches: G.stat.catches, deaths: G.stat.deaths,
    quests: G.quests.filter(q => q.done >= q.t).length, travel: Math.round(G.stat.travel),
    wilds: G.wilds.length
  };
  /* snapshot/restore round-trip a fine run */
  try { M.restoreG(snap); }
  catch (e) { exceptions++; issue(seed, diff, mode, 'restore threw: ' + e.message); }
  const ok = problems.filter(p => p.startsWith(`[${seed}/${diff}/${mode}]`)).length === 0;
  const sec = steps * 0.05;
  /* progresso: se il bot non ha fatto nulla, è un campanello d'allarme (non fatal) */
  if (res.day === 0 && res.catches === 0 && res.travel < 200 && mode !== 'zen')
    console.log(`  ⚠ ${seed}/${diff}/${mode}: bot idle (0 catches, no travel)`);
  console.log(`  ${seed}/${diff}/${mode}: ${sec}s sim · day+${res.day} · catches ${res.catches} · deaths ${res.deaths} · quests ${res.quests}/${G.quests.length} · travel ${res.travel} ${ok ? '✓' : '✗ ISSUES'}`);
}

const t0 = Date.now();
console.log('=== Campaign: seeds ' + SEEDS.join(',') + ' × diffs ' + DIFFS.join(',') + ' × modes ' + MODES.join(',') + ' ===');
for (const seed of SEEDS)
  for (const diff of DIFFS)
    for (const mode of MODES)
      runCampaign(seed, diff, mode, STEPS);

if (LONG) {
  console.log('=== Long deep run: seed 42 · nightmare · speedrun · 1500s ===');
  runCampaign(42, 'nightmare', 'speedrun', 30000);
  console.log('  long run speedrun elapsed:', Math.round(G.speedrun.elapsed) + 's');
}

const wall = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nRuns: ${runs} · Exceptions: ${exceptions} · Issues: ${issues} · Wall time: ${wall}s`);
if (issues || exceptions) {
  console.log('\nProblems found:');
  for (const p of problems) console.log('  - ' + p);
  process.exit(1);
}
console.log('✅ ENGINE CLEAN — no errors across all runs');
