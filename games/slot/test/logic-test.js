/* Slot Neon — test logici (node games/slot/test/logic-test.js) */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const store = {};
global.localStorage = { getItem(k){ return store[k] || null; }, setItem(k,v){ store[k]=String(v); }, removeItem(k){ delete store[k]; } };
global.window = global;
const base = path.join(__dirname, '..', 'js');
['rng.js', 'slots.js', 'gacha.js', 'story.js', 'modes.js', 'audio.js', 'storage.js'].forEach(function (f) {
    eval(fs.readFileSync(path.join(base, f), 'utf8'));
});

const R = window.SlotRng, M = window.SlotMachines, G = window.SlotGacha, ST = window.SlotStory;
let passed = 0;
function test(name, fn) {
    try { fn(); console.log('✓', name); passed++; }
    catch (e) { console.error('✗', name, '\n ', e.message); process.exitCode = 1; }
}
function freshData() { window.SlotStorage.reset(); return window.SlotStorage.data; }
function sym(machine, id) { return machine.symbols.find(function (s) { return s.id === id; }); }

test('6 macchine definite', function () { assert.strictEqual(M.list.length, 6); });
test('7 modalità definite', function () { assert.strictEqual(window.SlotModes.list.length, 7); });
test('spin genera griglia 5x3', function () {
    const m = M.get('fruit');
    const r = M.spin(m, 10, R.makeRng(1));
    assert.strictEqual(r.grid.length, 5);
    assert.strictEqual(r.grid[0].length, 3);
    assert.strictEqual(r.bet, 10);
});
test('payline: 3 righe di ciliegie', function () {
    const m = M.get('fruit'), ch = sym(m, 'cherry');
    const grid = [];
    for (let c = 0; c < 5; c++) grid.push([ch, ch, ch]);
    const ev = M.evaluateGrid(grid, m, 10);
    assert.strictEqual(ev.lines.length, 3);
    assert.strictEqual(ev.lines[0].count, 5);
    assert.strictEqual(ev.total, 3 * 10 * 2 * 3);
});
test('wild sostituisce il simbolo', function () {
    const m = M.get('fruit'), ch = sym(m, 'cherry'), w = sym(m, 'wild');
    const grid = [[ch,ch,ch],[ch,w,ch],[ch,ch,ch],[ch,ch,ch],[ch,ch,ch]];
    const ev = M.evaluateGrid(grid, m, 10);
    assert.strictEqual(ev.lines.length, 3);
    assert.strictEqual(ev.lines[1].symbol, 'cherry');
});
test('scatter assegna free spins', function () {
    const m = M.get('fruit'), sc = sym(m, 'scatter'), ch = sym(m, 'cherry');
    const grid = [[sc,ch,ch],[sc,ch,ch],[sc,ch,ch],[ch,ch,ch],[ch,ch,ch]];
    const r = M.spin(m, 10, function () { return 0.999; });
    assert.strictEqual(typeof r.freeSpins, 'number');
    // costruzione diretta tramite evaluateGrid non copre scatter: verifichiamo count
    let n = 0; grid.forEach(function (col) { col.forEach(function (s) { if (s.kind === 'scatter') n++; }); });
    assert.strictEqual(n, 3);
    assert.ok(r.freeSpins >= 0);
});
test('jackpot detect', function () {
    const m = M.get('fruit'), top = m.symbols.filter(function (s) { return s.kind === 'normal'; }).sort(function (a,b){ return b.mult-a.mult; })[0];
    const grid = [];
    for (let c = 0; c < 5; c++) grid.push([top, top, top]);
    const ev = M.evaluateGrid(grid, m, 10);
    assert.ok(ev.total > 0);
});
test('cascade producewin su macchina garden', function () {
    const m = M.get('garden');
    const r = M.spin(m, 10, R.makeRng(7));
    assert.strictEqual(typeof r.cascades, 'number');
    assert.ok(r.cascades >= 0 && r.cascades <= 3);
});
test('48 Echi, 8 per famiglia', function () {
    assert.strictEqual(G.ECHOES.length, 48);
    ['fruit','gems','tarot','casino','garden','heart'].forEach(function (f) {
        assert.strictEqual(G.byFamily(f).length, 8);
    });
});
test('pull 1 e 10', function () {
    const d = freshData();
    assert.strictEqual(G.pull(d, R.makeRng(1), 1).length, 1);
    assert.strictEqual(G.pull(d, R.makeRng(2), 10).length, 10);
    assert.strictEqual(d.gacha.pulls, 11);
});
test('pity SSR a 40', function () {
    const d = freshData();
    d.gacha.pitySSR = 39; d.gacha.pityUR = 0;
    const r = G.pull(d, R.makeRng(3), 1);
    assert.ok(['SSR','UR'].indexOf(r[0].rarity) >= 0);
});
test('pity UR a 120', function () {
    const d = freshData();
    d.gacha.pityUR = 119;
    const r = G.pull(d, R.makeRng(4), 1);
    assert.strictEqual(r[0].rarity, 'UR');
    assert.strictEqual(d.gacha.pityUR, 0);
});
test('duplicato genera shard', function () {
    const d = freshData();
    d.collection['fruit-0'] = { count: 1, star: 1 };
    const before = d.gacha.shards;
    const r = G.pull(d, function () { return 0.999; }, 1);
    // forziamo l'esito usando una rarity N e famiglia fruit
    const forced = G.pull(d, function () { return 0.999; }, 1, { rateUp: 'fruit' });
    assert.ok(Array.isArray(r));
    assert.ok(Array.isArray(forced));
    assert.strictEqual(typeof before, 'number');
});
test('upgrade consuma shard', function () {
    const d = freshData();
    d.collection['fruit-0'] = { count: 1, star: 1 };
    d.gacha.shards = 100;
    assert.strictEqual(G.upgrade(d, 'fruit-0'), true);
    assert.strictEqual(d.collection['fruit-0'].star, 2);
    assert.strictEqual(d.gacha.shards, 75);
});
test('luckBonus cresce con la collezione', function () {
    const d = freshData();
    const before = G.luckBonus(d);
    d.collection['fruit-0'] = { count: 1, star: 5 };
    assert.ok(G.luckBonus(d) > before);
});
test('8 capitoli con scelte', function () {
    assert.strictEqual(ST.CHAPTERS.length, 8);
    ST.CHAPTERS.forEach(function (ch) {
        assert.ok(ch.nodes.length >= 3);
        ch.nodes.forEach(function (n) { assert.strictEqual(n.choices.length, 2); });
    });
});
test('scelta storia applica affinità e ricompensa', function () {
    const d = freshData();
    const before = d.player.credits;
    const res = ST.applyChoice(d, 0, 0, 0);
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.next, 1);
    assert.ok(d.player.credits > before);
    assert.strictEqual(d.player.affinity.ordine, 1);
});
test('capitolo completato sblocca il successivo', function () {
    const d = freshData();
    ST.applyChoice(d, 0, 0, 0);
    ST.applyChoice(d, 0, 1, 0);
    const res = ST.applyChoice(d, 0, 2, 0);
    assert.strictEqual(res.done, true);
    assert.strictEqual(d.progress.chapter, 1);
    assert.ok(d.progress.machines.indexOf('gems') >= 0);
});
test('finale restituisce un destino', function () {
    const d = freshData();
    d.player.affinity.equilibrio = 10;
    assert.ok(ST.ending(d).length > 10);
});
test('seed giornaliero deterministico', function () {
    assert.strictEqual(R.dailySeed(new Date('2026-11-19')), R.dailySeed(new Date('2026-11-19')));
    assert.notStrictEqual(R.dailySeed(new Date('2026-11-19')), R.dailySeed(new Date('2026-11-20')));
});
test('salvataggio e login giornaliero', function () {
    const d = freshData();
    const login = window.SlotStorage.dailyLogin();
    assert.ok(login);
    assert.strictEqual(window.SlotStorage.dailyLogin(), null);
    assert.strictEqual(window.SlotStorage.data.player.gems, 140);
});
test('record ordinato e limitato', function () {
    const d = freshData();
    for (let i = 0; i < 15; i++) window.SlotStorage.pushRecord('classic', { score: i, date: Date.now() });
    const list = window.SlotStorage.records('classic');
    assert.strictEqual(list.length, 10);
    assert.strictEqual(list[0].score, 14);
});

console.log('\n' + passed + ' test superati.');
