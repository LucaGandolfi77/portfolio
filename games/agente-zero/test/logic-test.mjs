/* Agente Zero — logic tests. Run: node games/agente-zero/test/logic-test.mjs */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import * as P from '../js/physics.js';
import * as S from '../js/shot.js';
import * as M from '../js/modes.js';
import * as G from '../js/state.js';
import { CHAPTERS, missionId, chapterUnlocked, missionUnlocked, totalStars } from '../js/career.js';
import { spotAt, isThree, zoneOf, ZONES, PRACTICE_SPOTS, CONTEST_SPOTS } from '../js/court-data.js';
import { LINES, say, lineKey } from '../js/lines.js';
import { STRINGS } from '../js/strings.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const results = [];
const t = (name, fn) => results.push(test(name, fn));
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

const from = (spot) => { const p = P.releasePoint(spot.x, spot.y); return { p, ideal: P.idealShot(p) }; };
const fire = (spot, err, env, t0 = 0) => { const f = from(spot); return P.simulate(P.makeShot(f.p, f.ideal, err, t0), env); };

/** Searches a scoring release the way a player could: power, aim and timing. */
function findScore(spot, env = {}) {
  const f = from(spot);
  const times = env.moving || env.defender ? [0, 0.35, 0.7, 1.05, 1.4, 1.75, 2.1, 2.45, 2.8, 3.5, 4.2, 5] : [0];
  for (const t0 of times) {
    for (let ai = 0; ai <= 20; ai++) {
      const aim = (ai % 2 ? 1 : -1) * Math.ceil(ai / 2) * 0.014;
      for (let pi = 0; pi <= 14; pi++) {
        const power = 1 + (pi % 2 ? 1 : -1) * Math.ceil(pi / 2) * 0.008;
        if (P.simulate(P.makeShot(f.p, f.ideal, { power, aim }, t0), env).scored) return { power, aim, t0 };
      }
    }
  }
  return null;
}

/* ---------- physics ---------- */
t('the ideal shot is a swish from every practice and contest spot', () => {
  for (const s of [...PRACTICE_SPOTS, ...CONTEST_SPOTS]) eq(fire(s, {}).result, 'swish', JSON.stringify(s));
});
t('a very short shot is an airball', () => {
  for (const s of [PRACTICE_SPOTS[2], PRACTICE_SPOTS[8]]) eq(fire(s, { power: 0.9 }).result, 'airball');
});
t('a shot a little off bounces on the rim', () => {
  const r = fire(spotAt(0, 4.2), { power: 0.975 });
  ok(r.touches.rim > 0, 'no rim contact: ' + r.result);
});
t('the same release gives the same flight', () => {
  const a = fire(spotAt(30, 5), { power: 1.021, aim: 0.012 }), b = fire(spotAt(30, 5), { power: 1.021, aim: 0.012 });
  eq(a.result, b.result);
  eq(JSON.stringify(a.path.at(-1)), JSON.stringify(b.path.at(-1)));
});
t('aim to the right goes right', () => {
  const r = fire(spotAt(0, 5), { aim: 0.08 });
  const mid = r.path[40];
  ok(mid.p[0] > 0.05, 'x=' + mid.p[0]);
});
t('the ball never passes through the rim wire', () => {
  const rand = rng(7);
  for (let i = 0; i < 120; i++) {
    const s = spotAt((rand() - 0.5) * 170, 2.5 + rand() * 8);
    const r = fire(s, { power: 0.95 + rand() * 0.1, aim: (rand() - 0.5) * 0.07 });
    for (const f of r.path) {
      const [x, y, z] = f.p;
      const h = Math.hypot(x - f.hx, y);
      const d = Math.hypot(h - P.RIM.r, z - P.RIM.z);
      ok(d > P.BALL_R - 0.045, `inside the wire: ${d.toFixed(3)}`);
      ok(z >= P.BALL_R - 1e-6, 'under the floor');
    }
    ok(Number.isFinite(r.path.at(-1).p[0]), 'not finite');
  }
});
t('wind pushes the ball and can still be beaten', () => {
  const s = spotAt(0, 4.8);
  const r = fire(s, {}, { wind: [1.8, 0] });
  ok(r.path[60].p[0] > fire(s, {}).path[60].p[0] + 0.05, 'wind did nothing');
  ok(findScore(s, { wind: [1.8, 0] }), 'unbeatable');
});
t('the hoop moves and the hand rises', () => {
  const env = { moving: { amp: 0.5, freq: 0.25 } };
  near(P.hoopX(env, 1), 0.5, 1e-9);
  near(P.hoopX({}, 1), 0);
  const d = { defender: { x: 0, y: -3, period: 2 } };
  ok(P.handAt(d, 0.45)[2] > P.handAt(d, 1.5)[2] + 0.8, 'no jump');
  eq(P.handAt({}, 1), null);
});
t('a hand in the way blocks the shot', () => {
  const s = spotAt(0, 5);
  const f = from(s);
  // a hand right at the top of the release
  const env = { defender: { x: 0, y: f.p[1] + 0.45, period: 2 } };
  const results = [0, 0.2, 0.45, 0.7, 1.4].map((t0) => P.simulate(P.makeShot(f.p, f.ideal, {}, t0), env).result);
  ok(results.includes('blocked'), results.join());
  ok(results.includes('swish') || results.includes('rim'), 'never open: ' + results.join());
});
t('sampleAt interpolates the path', () => {
  const r = fire(spotAt(0, 4), {});
  const a = P.sampleAt(r.path, 0), b = P.sampleAt(r.path, 99);
  near(a.p[2], P.RELEASE_Z, 1e-9);
  eq(b.p[2], r.path.at(-1).p[2]);
});

/* ---------- gestures ---------- */
const swipe = (h, ratio, d, dx = 0) => [0, 0.5, 1].map((k) => ({ x: 200 + dx * k, y: 700 - S.idealSwipe(d) * ratio * h * k, t: k * 120 }));
t('the ideal swipe has power 1 and no aim', () => {
  const r = S.fromSwipe(swipe(800, 1, 5), 800, 5);
  near(r.power, 1, 1e-6);
  near(r.aim, 0, 1e-9);
  near(r.side, 0, 1e-9);
});
t('longer is stronger, taps and downward drags are not shots', () => {
  ok(S.fromSwipe(swipe(800, 1.2, 5), 800, 5).power > 1.02);
  ok(S.fromSwipe(swipe(800, 0.8, 5), 800, 5).power < 0.98);
  eq(S.fromSwipe([{ x: 0, y: 0 }, { x: 0, y: -10 }], 800, 5), null);
  eq(S.fromSwipe([{ x: 0, y: 0 }, { x: 0, y: 300 }], 800, 5), null);
  eq(S.fromSwipe([{ x: 0, y: 0 }], 800, 5), null);
  ok(S.fromSwipe(swipe(800, 1, 5, 40), 800, 5).aim > 0, 'right swipe aims right');
});
t('easy is more forgiving than hard', () => {
  const e = S.fromSwipe(swipe(800, 1.2, 5), 800, 5, 'easy'), h = S.fromSwipe(swipe(800, 1.2, 5), 800, 5, 'hard');
  ok(e.power - 1 < h.power - 1);
  ok(S.greenZone('easy') > S.greenZone('hard'));
});
t('the meter goes up and down and its middle is perfect', () => {
  near(S.meterAt(0), 0); near(S.meterAt(0.75), 1); near(S.meterAt(1.5), 0); near(S.meterAt(0.375), 0.5);
  near(S.fromMeter(0.5, 0).power, 1);
  for (const d of ['easy', 'normal', 'hard']) {
    const half = S.greenZone(d) / 2;
    for (const m of [0.5 - half, 0.5 + half]) ok(fire(spotAt(0, 4.2), S.fromMeter(m, 0, d)).scored, `${d} ${m}`);
  }
});
t('a skilled computer scores more than a poor one', () => {
  const count = (skill) => {
    const r = rng(11);
    let n = 0;
    for (let i = 0; i < 150; i++) if (fire(spotAt(0, 5), S.aiError(r, skill, 5)).scored) n++;
    return n / 150;
  };
  const lo = count(0.2), hi = count(0.85);
  ok(hi > lo + 0.15, `${lo} ${hi}`);
  ok(hi < 0.99 && lo > 0.1, `${lo} ${hi}`);
});

/* ---------- court ---------- */
t('zones and threes', () => {
  ok(isThree(spotAt(0, 6.9))); ok(!isThree(spotAt(0, 5))); ok(isThree(spotAt(88, 6.65)));
  eq(zoneOf(spotAt(0, 2)), 'near-c'); eq(zoneOf(spotAt(-60, 5)), 'mid-l'); eq(zoneOf(spotAt(60, 7)), 'three-r'); eq(zoneOf(spotAt(0, 12)), 'deep-c');
  for (const s of PRACTICE_SPOTS) ok(ZONES.includes(zoneOf(s)));
});

/* ---------- modes ---------- */
const shoot = (m, made, result = made ? 'swish' : 'miss') => { ok(M.release(m), 'cannot release'); return M.applyShot(m, { scored: made, result }); };
t('three in a row light the ball and double the points', () => {
  const m = M.newMatch('timed', { rng: rng(3) });
  const pts = [];
  for (let i = 0; i < 4; i++) pts.push(shoot(m, true, 'rim').points);
  eq(pts.join(), '2,2,2,4');
  ok(M.onFire(m));
  shoot(m, false);
  ok(!M.onFire(m));
  eq(m.bestStreak, 4);
});
t('the clock ends the match, but a ball in the air counts', () => {
  const m = M.newMatch('timed', { rng: rng(3) });
  M.release(m);
  eq(M.tick(m, 61), 'buzzer');
  ok(!m.over);
  const out = M.applyShot(m, { scored: true, result: 'swish' });
  ok(out.points > 0 && m.over);
  ok(!M.release(m));
  const idle = M.newMatch('timed');
  M.tick(idle, 61);
  ok(idle.over);
});
t('timed mode moves farther as baskets add up', () => {
  const m = M.newMatch('timed', { rng: rng(5) });
  const first = Math.hypot(m.spot.x, m.spot.y);
  for (let i = 0; i < 30; i++) shoot(m, true);
  ok(Math.hypot(m.spot.x, m.spot.y) > first + 2.5);
  ok(Math.hypot(m.spot.x, m.spot.y) < 9);
});
t('three-point contest: five racks, money ball, maximum 30', () => {
  const m = M.newMatch('three');
  const spots = new Set();
  while (!m.over) { spots.add(m.spot.x.toFixed(1)); shoot(m, true); }
  eq(m.attempts, 25);
  eq(m.score, 30);
  eq(spots.size, 5);
});
t('daily challenge is the same for everybody and lasts ten shots', () => {
  eq(JSON.stringify(M.dailyShots(20261127)), JSON.stringify(M.dailyShots(20261127)));
  ok(JSON.stringify(M.dailyShots(20261127)) !== JSON.stringify(M.dailyShots(20261128)));
  const m = M.newMatch('daily', { seed: 20261127 });
  while (!m.over) shoot(m, false);
  eq(m.attempts, M.DAILY_SHOTS);
});
t('every daily shot can be scored', () => {
  for (let d = 0; d < 12; d++) for (const s of M.dailyShots(20261101 + d)) ok(findScore(s.spot, s.env), `day ${d} ${JSON.stringify(s)}`);
});
t('Z-E-R-O: letters, lead and winner', () => {
  const m = M.newMatch('zero', { rng: rng(9) });
  eq(M.turnOf(m), 'you');
  ok(M.setSpot(m, spotAt(30, 5)));
  shoot(m, true);
  eq(M.turnOf(m), 'cpu');
  ok(!M.setSpot(m, spotAt(0, 3)), 'cannot move while the rival copies');
  const out = shoot(m, false);
  eq(out.letter, 'cpu'); eq(m.letters.cpu, 1); eq(m.leader, 'you');
  shoot(m, false); // you miss the lead
  eq(m.leader, 'cpu'); eq(M.turnOf(m), 'cpu');
  shoot(m, true);
  eq(M.turnOf(m), 'you');
  shoot(m, true);
  eq(m.leader, 'cpu'); eq(m.letters.you, 0);
  while (!m.over) { shoot(m, true); if (!m.over) shoot(m, false); }
  eq(m.winner, 'cpu'); eq(m.letters.you, 4); eq(m.attempts > 0, true);
});
t('training never ends', () => {
  const m = M.newMatch('training');
  for (let i = 0; i < 50; i++) shoot(m, i % 2 === 0);
  ok(!m.over);
});

/* ---------- career ---------- */
t('six chapters of six missions with sensible thresholds', () => {
  eq(CHAPTERS.length, 6);
  for (const c of CHAPTERS) {
    eq(c.missions.length, 6, c.id);
    for (const m of c.missions) {
      ok(m.stars[0] < m.stars[1] && m.stars[1] < m.stars[2], c.id + ' order');
      if (m.type !== 'clock') ok(m.stars[2] <= m.shots, c.id + ' impossible');
      if (m.type === 'duel') eq(m.stars[0], m.rival + 1, c.id + ' duel');
      ok(m.spots.length > 0);
    }
  }
});
t('every career spot can be scored', () => {
  CHAPTERS.forEach((c, ci) => c.missions.forEach((m, mi) => {
    const env = { wind: m.wind, moving: m.moving, defender: m.defender };
    for (const s of m.spots) ok(findScore(s, env), `${missionId(ci, mi)} ${s.x.toFixed(1)},${s.y.toFixed(1)}`);
  }));
});
t('every mission ends, whether you always score or always miss', () => {
  CHAPTERS.forEach((c, ci) => c.missions.forEach((spec, mi) => {
    for (const made of [true, false]) {
      const m = M.newMatch('career', { chapter: ci, mission: mi, rng: rng(2) });
      let guard = 0;
      while (!m.over && guard++ < 60) { shoot(m, made); if (spec.type === 'clock') M.tick(m, 2); }
      ok(m.over, `${missionId(ci, mi)} ${made} never ends`);
      const s = M.summaryOf(m);
      eq(s.stars, made ? 3 : 0, `${missionId(ci, mi)} ${made}`);
    }
  }));
});
t('shot clock counts as a miss', () => {
  const m = M.newMatch('career', { chapter: 1, mission: 2 });
  eq(M.tick(m, 6), 'late');
  eq(m.attempts, 1); eq(m.makes, 0); eq(m.shotClock, 5);
});
t('the rival scores exactly the promised baskets', () => {
  const m = M.newMatch('career', { chapter: 0, mission: 5, rng: rng(4) });
  eq(m.rivalSeq.filter(Boolean).length, 3);
});
t('chapters and missions unlock in order', () => {
  const stars = {};
  ok(missionUnlocked(stars, 0, 0)); ok(!missionUnlocked(stars, 0, 1)); ok(!chapterUnlocked(stars, 1));
  for (let i = 0; i < 6; i++) stars[missionId(0, i)] = 1;
  ok(!chapterUnlocked(stars, 1), 'needs 8 stars');
  stars[missionId(0, 0)] = 3;
  ok(chapterUnlocked(stars, 1)); ok(missionUnlocked(stars, 1, 0)); ok(!chapterUnlocked(stars, 2));
  eq(totalStars(stars), 8);
});

/* ---------- save ---------- */
t('a broken save becomes a valid one', () => {
  for (const raw of [null, 5, 'x', [], { xp: -4, stats: { shots: 'no' }, look: { jersey: 'night', skin: 'zzz' }, medals: ['nope', 'first'] }]) {
    const s = G.hydrate(raw);
    ok(s.xp >= 0 && s.stats.shots === 0 && s.look.jersey === 'classic' && s.look.skin === 's2');
  }
  const s = G.newState(); s.xp = 600; s.look.shoes = 'red';
  eq(JSON.stringify(G.hydrate(JSON.parse(JSON.stringify(s)))), JSON.stringify(s));
});
t('shots feed statistics, XP and medals', () => {
  const s = G.newState();
  const spot = spotAt(0, 7);
  G.recordShot(s, { spot, env: { wind: [1, 0] }, out: { who: 'you', made: true, result: 'swish' } });
  G.recordShot(s, { spot, out: { who: 'you', made: false, result: 'airball' } });
  G.recordShot(s, { spot, out: { who: 'cpu', made: true, result: 'swish' } });
  eq(s.stats.shots, 2); eq(s.stats.makes, 1); eq(s.stats.threes, 1); eq(s.stats.airballs, 1); eq(s.stats.windMakes, 1);
  eq(s.stats.zones['three-c'].join(), '2,1');
  ok(s.xp > 0);
  const fresh = G.checkMedals(s);
  ok(fresh.includes('first') && fresh.includes('swish1') && fresh.includes('airball'));
  eq(G.checkMedals(s).length, 0);
});
t('items unlock with level and medals', () => {
  const s = G.newState();
  ok(!G.setLook(s, 'ball', 'gold'));
  ok(G.setLook(s, 'hair', 'afro'));
  ok(!G.setLook(s, 'hair', 'mohawk'));
  s.medals.push('champion');
  ok(G.setLook(s, 'ball', 'gold'));
  s.xp = G.xpForLevel(7);
  eq(G.levelOf(s.xp), 7);
  ok(G.setLook(s, 'shoes', 'black'));
  for (const slot of G.SLOTS) for (const i of G.ITEMS[slot]) if (i.medal) ok(G.MEDALS.some((m) => m.id === i.medal), i.medal);
});
t('finishing a mission keeps the best stars and reports what is new', () => {
  const s = G.newState();
  const m = G.beginMatch(s, M.newMatch('career', { chapter: 0, mission: 0 }));
  while (!m.over) { const o = shoot(m, true); G.recordShot(s, { spot: o.spot, out: o }); }
  const r = G.finishMatch(s, m, M.summaryOf(m));
  eq(r.newStars, 3); eq(s.stars['bunker-1'], 3); ok(r.xp > 100); ok(r.medals.includes('first')); ok(r.levelUp);
  const again = G.finishMatch(s, m, { ...M.summaryOf(m), stars: 1 });
  eq(again.newStars, 0); eq(s.stars['bunker-1'], 3);
});

/* ---------- text ---------- */
const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keys(v, p + k + '.') : [p + k])).sort();
t('Italian and English have the same keys', () => {
  eq(keys(STRINGS.it).join(), keys(STRINGS.en).join());
  eq(STRINGS.it.howtoText.length, STRINGS.en.howtoText.length);
  eq(Object.keys(LINES.it).join(), Object.keys(LINES.en).join());
  for (const k of Object.keys(LINES.it)) { eq(LINES.it[k].length, LINES.en[k].length, k); ok(LINES.it[k].length >= 3, k); }
});
t('every id has a label', () => {
  for (const lang of ['it', 'en']) {
    const d = STRINGS[lang];
    for (const m of G.MEDALS) ok(d.medal[m.id], lang + ' medal ' + m.id);
    for (const s of PRACTICE_SPOTS) ok(d.spots[s.id], lang + ' spot ' + s.id);
    for (const [slot, list] of Object.entries(G.LOOKS)) for (const id of list) ok(d.lookNames[slot][id], lang + slot + id);
    for (const slot of G.SLOTS) for (const i of G.ITEMS[slot]) ok(d.lookNames[slot][i.id], lang + slot + i.id);
    for (const id of M.MODES) ok(d.modes[id] && d.modeDesc[id], lang + id);
    for (const c of CHAPTERS) { ok(c.name[lang] && c.op[lang] && c.intro[lang]); for (const m of c.missions) ok(d.goal[m.type], m.type); }
  }
});
t('lines follow the shot', () => {
  eq(lineKey({ made: true, result: 'swish' }), 'swish');
  eq(lineKey({ made: true, result: 'swish', ignited: true }), 'fire');
  eq(lineKey({ made: false, result: 'airball' }), 'airball');
  eq(lineKey({ made: false, result: 'miss' }), 'miss');
  const a = say('it', 'swish', () => 0);
  ok(a && say('it', 'swish', () => 0, a) !== a);
});

/* ---------- files ---------- */
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
t('the service worker precaches every file', () => {
  if (!existsSync(join(ROOT, 'sw.js'))) throw new Error('sw.js missing');
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  for (const f of [...walk(join(ROOT, 'js')), ...walk(join(ROOT, 'icons'))]) ok(sw.includes(`'./${relative(ROOT, f)}'`), relative(ROOT, f));
});

summary(results.filter(Boolean).length, results.length);
