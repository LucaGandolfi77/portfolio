/* NBA Sim — test logici (node projects/nba_simulator/test/logic-test.js) */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const store = {};
global.localStorage = { getItem(k){return store[k]||null;}, setItem(k,v){store[k]=String(v);}, removeItem(k){delete store[k];} };
global.window = global;
const base = path.join(__dirname, '..', 'js');
['data.js','engine.js','season.js','playoffs.js','stats.js','storage.js','audio.js'].forEach(function (f) {
    eval(fs.readFileSync(path.join(base, f), 'utf8'));
});

const D = window.NBAData, E = window.NBAEngine, SE = window.NBASeason, PO = window.NBAPlayoffs, ST = window.NBAStats;
let passed = 0;
function test(name, fn) {
    try { fn(); console.log('✓', name); passed++; }
    catch (e) { console.error('✗', name, '\n ', e.message); process.exitCode = 1; }
}

test('14 squadre con roster da 8', function () {
    assert.strictEqual(D.keys.length, 14);
    D.keys.forEach(function (k) {
        assert.strictEqual(D.TEAMS[k].players.length, 8);
        assert.ok(D.TEAMS[k].strategy);
    });
});
test('simulazione completa termina', function () {
    const s = E.simulateGame(D.TEAMS.LAL, D.TEAMS.BOS);
    assert.strictEqual(s.quarters.length, 4);
    assert.ok(s.score.home >= 0 && s.score.away >= 0);
    assert.ok(s.score.home > 40 && s.score.away > 40);
    assert.ok(['home','away','tie'].indexOf(s.winner) >= 0);
    assert.ok(s.events.length > 50);
});
test('eventi hanno testo IT e EN', function () {
    const sim = new E.Sim(D.TEAMS.LAL, D.TEAMS.GSW);
    for (let i = 0; i < 40; i++) sim.step();
    const ev = sim.events[0];
    assert.ok(ev.it && ev.en && ev.it !== ev.en);
});
test('punteggio e quarti coerenti', function () {
    const s = E.simulateGame(D.TEAMS.DEN, D.TEAMS.MIL);
    const qh = s.quarters.reduce(function (a,q) { return a+q.home; },0);
    const qa = s.quarters.reduce(function (a,q) { return a+q.away; },0);
    assert.strictEqual(qh, s.score.home);
    assert.strictEqual(qa, s.score.away);
});
test('win probability monotonic', function () {
    assert.ok(E.winProbability(10, 600) > E.winProbability(0, 600));
    assert.ok(E.winProbability(10, 60) > E.winProbability(10, 600));
});
test('fatica e sostituzioni avvengono', function () {
    const sim = new E.Sim(D.TEAMS.LAL, D.TEAMS.BOS);
    for (let i = 0; i < 2500 && !sim.over; i++) sim.step();
    const subs = sim.events.filter(function (e) { return e.kind === 'sub'; }).length;
    assert.ok(subs > 0, 'nessuna sostituzione');
});
test('shot chart e win prob registrati', function () {
    const s = E.simulateGame(D.TEAMS.PHX, D.TEAMS.DAL);
    assert.ok(s.shots.length > 20);
    assert.ok(s.winProb.length > 10);
});
test('schedule: 26 settimane, 26 partite a squadra', function () {
    const weeks = SE.buildSchedule(D.keys);
    assert.strictEqual(weeks.length, 26);
    const counts = {}; D.keys.forEach(function (k) { counts[k] = 0; });
    weeks.forEach(function (w) { w.forEach(function (p) { counts[p[0]]++; counts[p[1]]++; }); });
    D.keys.forEach(function (k) { assert.strictEqual(counts[k], 26); });
});
test('stagione: standings e vittorie', function () {
    const season = SE.newSeason(D.keys);
    SE.playWeek(season, E.simulateGame, D.TEAMS);
    assert.strictEqual(season.week, 1);
    const st = SE.standingsSorted(season);
    assert.strictEqual(st.length, 14);
    // pareggi non assegnano né vittoria né sconfitta
    assert.ok(st.reduce(function (a,s) { return a+s.w+s.l; },0) >= 12);
});
test('playoff: bracket e campione', function () {
    const season = SE.newSeason(D.keys);
    const seeds = SE.standingsSorted(season).slice(0,8).map(function (r) { return r.team; });
    const br = PO.createBracket(seeds, 8);
    assert.strictEqual(br.rounds[0].matchups.length, 4);
    for (let i = 0; i < 3; i++) PO.playRound(br, E.simulateGame, D.TEAMS);
    assert.strictEqual(br.complete, true);
    assert.ok(br.champion);
});
test('statistiche: efficienza e confronto', function () {
    const s = E.simulateGame(D.TEAMS.NYK, D.TEAMS.OKC);
    const eff = ST.efficiency(s.players[s.top.name]);
    assert.ok(typeof eff === 'number');
    const cmp = ST.comparison(s);
    assert.strictEqual(cmp.length, 8);
    assert.ok(cmp[0].label === 'PTS');
});
test('zone tiro', function () {
    const s = E.simulateGame(D.TEAMS.CLE, D.TEAMS.MIA);
    const z = ST.shotZones(s.shots);
    assert.ok(z.three.a > 0 || z.mid.a > 0);
});
test('storage: salvataggio, history e pronostici', function () {
    const S = window.NBAStorage;
    S.reset();
    S.addHistory({ id: 1, home: 'LAL', away: 'BOS', hs: 100, as: 90 });
    S.recordPrediction('home','home');
    S.recordPrediction('away','home');
    assert.strictEqual(S.data.history.length, 1);
    assert.strictEqual(S.data.predictions.correct, 1);
    S.load();
    assert.strictEqual(S.data.predictions.total, 2);
});
test('squadra custom persistente', function () {
    const S = window.NBAStorage;
    S.reset();
    S.addCustomTeam({ name: 'Test Team', short: 'TST', color: '#ffffff', players: D.TEAMS.LAL.players });
    S.load();
    assert.strictEqual(S.data.customTeams.length, 1);
});

console.log('\n' + passed + ' test superati.');
