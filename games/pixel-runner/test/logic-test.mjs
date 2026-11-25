import { test, eq, ok, summary } from '../../_kit/test-harness.js';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const store = new Map();
globalThis.localStorage = {
  getItem: k => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};
globalThis.window = { addEventListener() {}, dispatchEvent() {} };

const { setup, jump, dash, attack, update, draw } = await import(join(ROOT, 'js/game.js'));
const { STAGES, MODES, STR, POWERUPS, OBJECTIVES, VERSION, GRAVITY, JUMP } = await import(join(ROOT, 'js/config.js'));
const storage = await import(join(ROOT, 'js/storage.js'));

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

const fake = (mode = 'classic', difficulty = 'normal') => ({
  status:'playing', mode, difficulty, score:0, combo:0,
  view:{ w:400, h:600 },
  fx:{ burst() {}, hit() {}, blink() {}, float() {} },
  t:k => k, addScore(n) { this.score += n; }, end(s) { this.status = s; }
});

run('five stages with rising speed', () => {
  eq(STAGES.length, 5);
  ok(STAGES[4].speed > STAGES[0].speed);
  ok(STAGES[4].bossHp > STAGES[0].bossHp);
});
run('four modes and six power-ups are configured', () => {
  eq(MODES.length, 4);
  ok(MODES.some(m => m.id === 'bossrush'));
  eq(POWERUPS.length, 6);
  eq(OBJECTIVES.length, 3);
  ok(GRAVITY > 0 && JUMP > 0);
});
run('i18n dictionaries are aligned', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  eq(Object.keys(STR.en.modes).length, 4);
  ok(Object.values(STR.en).filter(v => typeof v === 'string').every(v => v.length));
});
run('setup starts grounded at stage 0', () => {
  const g = fake(); setup(g);
  eq(g.data.stage, 0); ok(g.data.grounded); eq(g.data.y, 0);
  eq(g.data.magnet, 0); eq(g.data.double, 0); eq(g.data.slow, 0);
});
run('boss rush starts with a boss', () => {
  const g = fake('bossrush'); setup(g);
  ok(g.data.boss && g.data.boss.hp > 0);
  eq(g.data.stage, 0);
});
run('jump sets upward velocity', () => {
  const g = fake(); setup(g); jump(g);
  ok(g.data.vy < 0); ok(!g.data.grounded);
});
run('cannot double jump', () => {
  const g = fake(); setup(g); jump(g);
  const v = g.data.vy; jump(g);
  eq(g.data.vy, v);
});
run('dash has cooldown', () => {
  const g = fake(); setup(g); dash(g);
  ok(g.data.dashCooldown > 0);
  const c = g.data.dashCooldown; dash(g);
  eq(g.data.dashCooldown, c);
});
run('update moves runner and accumulates distance', () => {
  const g = fake(); setup(g);
  update(0.2, g);
  ok(g.data.distance > 0);
  ok(g.score > 0);
});
run('power-ups apply temporary effects', () => {
  const g = fake(); setup(g);
  g.data.pickups.push({ x:-2000, y:300, type:'magnet', taken:false });
  g.data.pickups.push({ x:-2000, y:300, type:'double', taken:false });
  g.data.pickups.push({ x:-2000, y:300, type:'slow', taken:false });
  update(0.016, g);
  ok(g.data.magnet >= 0 && g.data.double >= 0 && g.data.slow >= 0);
  g.data.magnet = 5; g.data.double = 5; g.data.slow = 3;
  update(0.016, g);
  ok(g.data.magnet > 0 && g.data.double > 0 && g.data.slow > 0);
});
run('slow motion reduces speed', () => {
  const a = fake(); setup(a); update(0.016, a);
  const b = fake(); setup(b); b.data.slow = 4; update(0.016, b);
  ok(b.data.speed < a.data.speed);
});
run('attack damages boss and scores more with double', () => {
  const g = fake(); setup(g);
  g.data.boss = { hp:3, maxHp:3, x:300 };
  attack(g);
  eq(g.data.boss.hp, 2);
  const plain = g.score;
  const h = fake(); setup(h); h.data.double = 5;
  h.data.boss = { hp:3, maxHp:3, x:300 };
  attack(h);
  ok(h.score > plain);
});
run('boss defeat advances the stage', () => {
  const g = fake(); setup(g);
  g.data.boss = { hp:0, maxHp:8, x:300 };
  update(0.016, g);
  eq(g.data.stage, 1);
  eq(g.data.bossesDefeated, 1);
});
run('gravity brings runner back to floor', () => {
  const g = fake(); setup(g); jump(g);
  for (let i = 0; i < 120; i++) update(0.01, g);
  eq(g.data.y, 0); ok(g.data.grounded);
});
run('draw does not throw with a 2D-like context', () => {
  const g = fake(); setup(g);
  const noop = () => ({ addColorStop() {} });
  const ctx = {
    createLinearGradient:noop, fillRect(){}, beginPath(){}, moveTo(){}, lineTo(){},
    stroke(){}, fill(){}, arc(){}, fillText(){}, save(){}, restore(){}
  };
  draw(ctx, g, { w:400, h:600 }, 123);
  ok(true);
});
run('profile starts empty and validates corrupt data', () => {
  const p = storage.initialProfile();
  eq(p.version, VERSION); eq(p.runs, 0); eq(p.stages, 1);
  eq(storage.normalizeProfile(null).runs, 0);
  eq(storage.normalizeProfile({ version:99 }).runs, 0);
  const bad = storage.normalizeProfile({ ...p, challenges:null, objectives:null, stages:99 });
  eq(bad.challenges.length, 0); eq(bad.stages, 5);
});
run('runs, bosses and objectives persist', () => {
  let p = storage.initialProfile();
  const res = storage.recordRun(p, { mode:'classic', difficulty:'normal', score:2500, bosses:2, stage:1, won:false });
  p = res.profile;
  eq(p.runs, 1); eq(p.bosses, 2); eq(p.stages, 3);
  eq(p.best['classic:normal'], 2500);
  eq(p.scores['classic:normal'][0].score, 2500);
  eq(storage.objectives(p).length, 3);
  p = storage.recordChallenge(p, { seed:42, target:20000, score:21000, won:true });
  eq(p.challenges.length, 1);
});
run('persistence helpers round-trip', () => {
  store.clear();
  let p = storage.initialProfile(); p.runs = 4;
  storage.saveProfile(p);
  eq(storage.loadProfile().runs, 4);
  storage.savePrefs({ sound:false, theme:'light' });
  eq(storage.loadPrefs().sound, false);
});
run('all modules, PWA assets and README exist', () => {
  ['config','i18n','storage','glass','ui','main','game'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n));
  ['styles.css','manifest.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','README.md'].forEach(p =>
    ok(existsSync(join(ROOT, p)), p));
});
run('HTML is GitHub-Pages safe', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(!html.includes('../../top_buttons.js'));
  ok(!html.includes('miraggio-pass'));
  ok(!html.includes('unpkg.com') && !html.includes('jsdelivr'));
  ok(html.indexOf('<script src="../../projects/_shared/shell.js"') < html.indexOf('</body>'));
  ok(html.includes('type="module" src="js/main.js"'));
});
run('SW precaches every module and asset', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  ok(sw.includes('pf-pixel-runner-shell-v1'));
  ['js/game.js','js/storage.js','js/ui.js','styles.css','../_kit/arcade.js'].forEach(f =>
    ok(sw.includes(f), f));
  ok(!sw.includes('top_buttons.js'));
});
run('catalog and root SW updated', () => {
  const root = join(ROOT, '..', '..');
  const catalog = readFileSync(join(root, 'assets/js/catalog-data.js'), 'utf8');
  ok(catalog.includes("'games/pixel-runner/index.html'"));
  ok(catalog.includes('six power-ups'));
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  ok((sw.includes("name.startsWith('portfolio-')") && sw.includes('isNestedApp')));
});

summary(passed, total);
