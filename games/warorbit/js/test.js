// ═══════════════════════════════════════════════════════════════
// WAR ORBIT — automatic test engine
// Plays the game with the real APIs and checks features that could
// fail. Run from the pause menu (🧪 Test) or ?test=1.
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';
  var T = window.__TEST__ = { results: [], steps: [], running: false, idx: 0 };

  function check(name, cond, detail) { T.results.push({ name: name, pass: !!cond, detail: detail || '' }); }
  function step(name, fn) { T.steps.push({ name: name, fn: fn }); }
  function tel(x, y) { G.player.x = x; G.player.y = y; }

  // ─────────────── SCENARI ───────────────

  step('Start: faction, world, player', function () {
    startGame('solar', 'TestPilot');
    check('player spawned with hull', G.player && G.player.hp > 0);
    check('aliens on map', G.aliens.length >= 6, G.aliens.length + ' aliens');
    check('rocks on map', G.rocks.length >= 20, G.rocks.length + ' rocks');
    check('faction solar', G.faction === 'solar');
    check('starter ship shuttle', G.ship === 'shuttle');
  });

  step('Movement and map bounds', function () {
    G.paused = false; G.over = false;
    var p0 = { x: G.player.x, y: G.player.y };
    G.keys['w'] = true; update(0.3); G.keys['w'] = false;
    check('W moves ship', G.player.y < p0.y);
    tel(99999, 99999);
    update(0.1);
    check('clamped to map', G.player.x <= mapSize() / 2 - 10 && G.player.y <= mapSize() / 2 - 10);
  });

  step('Combat: auto-fire kills an alien', function () {
    G.paused = false; G.over = false;
    var btc0 = G.btc, exp0 = G.exp;
    G.aliens = [];
    G.ammo.rlx = 5000;
    addAlien('hydro', G.player.x + 120, G.player.y);
    G.autofire = true;
    var guard = 0;
    while (G.aliens.length > 0 && guard++ < 300) update(0.05);
    check('alien destroyed', guard < 300 && G.aliens.length === 0, 'iterations ' + guard);
    check('BTC reward', G.btc > btc0, '+' + (G.btc - btc0));
    check('EXP gained', G.exp > exp0);
  });

  step('Resources: collect a rock', function () {
    G.paused = false; G.over = false;
    var c0 = G.cargo.mercury;
    var r = G.rocks[0];
    if (r) { tel(r.x, r.y); update(0.05); }
    check('rock collected', G.cargo.mercury === c0 + 1, G.cargo.mercury + '/' + (c0 + 1));
  });

  step('Ammo: buy and consume', function () {
    G.paused = false; G.over = false;
    var a0 = G.ammo.rlx, b0 = G.btc;
    buyAmmo('rlx');
    check('ammo purchased', G.ammo.rlx === a0 + DATA.AMMO.rlx.amt, 'btc ' + G.btc);
  });

  step('Extensions: repair and nuke', function () {
    G.paused = false; G.over = false;
    G.ext = 'repair'; G.extT = 0;
    var st = shipStats();
    G.player.hp = st.hpMax * 0.5;
    useExt();
    update(1.0);
    check('repair active', G.extOn > 0);
    update(2.0);
    check('hull regenerated', G.player.hp > st.hpMax * 0.5, 'hp ' + Math.round(G.player.hp));
    // nuke
    G.ext = 'bomb'; G.extT = 0;
    addAlien('hydro', G.player.x + 100, G.player.y);
    var a = G.aliens[G.aliens.length - 1];
    var before = a.hp;
    useExt();
    check('nuke damages aliens', a.hp < before, a.hp + '/' + before);
  });

  step('Rockets', function () {
    G.paused = false; G.over = false;
    G.rockets = 10; G.rocketT = 0;
    addAlien('hydro', G.player.x + 160, G.player.y);
    fireRocket();
    check('rocket launched', G.shots.length > 0 && G.rockets === 9);
  });

  step('Portals and level gate', function () {
    G.paused = false; G.over = false;
    G.level = 1; G.map = 'x1';
    G.player.x = -mapSize() / 2 + 60; G.player.y = -mapSize() / 2 + 60;
    tryInteract();
    check('level gate blocks X-2', G.map === 'x1');
    G.level = 3;
    tryInteract();
    check('warp to X-2', G.map === 'x2');
  });

  step('Shop: buy, equip, squad', function () {
    G.paused = false; G.over = false;
    G.level = 8; G.btc = 1000000; G.plt = 1000000;
    buy('ship', 'veles');
    check('ship bought & equipped', G.ownedShips.indexOf('veles') >= 0 && G.ship === 'veles');
    buy('gun', 'lg2');
    check('gun bought', G.gun === 'lg2');
    buy('ext', 'invuln');
    check('extension bought', G.ownedExts.indexOf('invuln') >= 0);
    equipItem('ext', 'invuln');
    check('extension equipped', G.ext === 'invuln');
    // risorse
    G.cargo.azurit = 5; G.btc = 50000;
    upgradeHull();
    check('hull upgrade +15%', G.upHull === 1);
    G.cargo.mercury = 10;
    refineResources();
    check('refine 5->1', G.cargo.erbium === 1 && G.cargo.mercury === 5, G.cargo.mercury + ' mercury left');
    var b0 = G.btc;
    sellResources();
    check('resources sold', G.btc > b0);
    toggleSquad();
    update(0.2);
    check('squad of 3 wingmen', G.wingmen.length === 3, G.wingmen.length + ' wingmen');
  });

  step('Event: Battle Royale', function () {
    G.paused = false; G.over = false;
    startRoyal();
    check('20 royale bots', G.royal && G.royal.bots.length === 20);
    var z0 = G.royal.zone;
    G.royal.t = 200; update(0.2);
    check('zone shrinks', G.royal.zone < z0, G.royal.zone + '/' + z0);
    G.royal.bots = [];
    update(0.1);
    check('royale won with reward', G.event !== 'royal' && G.plt > 0, 'plt ' + G.plt);
  });

  step('Event: Convoy', function () {
    G.paused = false; G.over = false;
    startConvoy();
    check('4 freighters', G.convoy && G.convoy.freighters.length === 4);
    G.convoy.freighters = [];
    update(0.1);
    check('convoy finished', G.event !== 'convoy' && G.btc > 0);
  });

  step('Death and respawn', function () {
    G.paused = false; G.over = false;
    G.player.hp = 1; G.player.shield = 0; G.extOn = 0;
    damagePlayer(1000);
    check('death overlay shown', G.over === true && !document.getElementById('deathBox').classList.contains('hidden'));
    respawn();
    check('respawn restores hull', G.over === false && G.player.hp === shipStats().hpMax, 'hp ' + Math.round(G.player.hp));
  });

  step('Save & load', function () {
    G.btc = 77777; G.honor = 12345;
    save();
    G.btc = 0; G.honor = 0;
    var ok = load();
    check('save/load roundtrip', ok && G.btc === 77777 && G.honor === 12345, 'btc ' + G.btc);
  });

  // ─────────────── RUNNER ───────────────
  function ensurePanel() {
    var box = document.getElementById('testReport');
    if (box) return box;
    box = document.createElement('div');
    box.id = 'testReport';
    box.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;bottom:10px;z-index:900;background:rgba(2,6,23,.97);border:1px solid #38bdf8;border-radius:14px;padding:14px;overflow-y:auto;font:12px/1.6 monospace;color:#e2e8f0;';
    box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="color:#38bdf8">🧪 WAR ORBIT TEST ENGINE</b><button id="testClose" style="background:#334155;border:none;color:#fff;border-radius:8px;padding:6px 12px;cursor:pointer">✕</button></div><div id="testLog"></div>';
    document.body.appendChild(box);
    document.getElementById('testClose').addEventListener('click', function () { box.style.display = 'none'; });
    return box;
  }
  function logLine(html) {
    var log = document.getElementById('testLog');
    if (log) log.innerHTML += html;
  }
  function run() {
    if (T.running) return;
    T.running = true; T.results = []; T.idx = 0;
    var box = ensurePanel();
    box.style.display = 'block';
    logLine('<div style="color:#93c5fd">Starting tests... ' + T.steps.length + ' scenarios</div>');
    while (T.idx < T.steps.length) next();
    finish();
  }
  function next() {
    if (T.idx >= T.steps.length) return;
    var s = T.steps[T.idx++];
    var before = T.results.length;
    try { s.fn(); } catch (e) { check(s.name + ' — runtime error', false, String(e && e.message || e)); }
    var fresh = T.results.slice(before);
    var fail = fresh.filter(function (r) { return !r.pass; }).length;
    logLine('<div style="color:' + (fail ? '#f87171' : '#4ade80') + '">' + (fail ? '✗' : '✓') + ' ' + s.name + (fail ? ' — ' + fail + ' FAIL' : '') + '</div>');
    fresh.forEach(function (r) {
      if (!r.pass) logLine('<div style="color:#fca5a5;padding-left:14px">  • ' + r.name + (r.detail ? ' (' + r.detail + ')' : '') + '</div>');
    });
  }
  function finish() {
    var pass = T.results.filter(function (r) { return r.pass; }).length;
    var total = T.results.length;
    T.running = false;
    logLine('<div style="margin-top:10px;font-weight:800;color:' + (pass === total ? '#4ade80' : '#f87171') + '">RESULT: ' + pass + '/' + total + ' PASS</div>');
  }

  window.__TEST__.run = run;
  if (location.search.indexOf('test=1') >= 0) {
    window.addEventListener('load', function () { setTimeout(run, 400); });
  }
})();
