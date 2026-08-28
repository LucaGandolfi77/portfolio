// ═══════════════════════════════════════════════════════════════
// RIVINCITA — motore di test automatico
// "Gioca" al gioco usando le vere API di game.js e verifica le
// caratteristiche che potrebbero andare in fail. Attiva con:
//   ?test=1   (avvio automatico)   oppure   pulsante 🧪 nel menu
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';
  var T = window.__TEST__ = { results: [], steps: [], running: false, idx: 0 };

  function check(name, cond, detail) {
    T.results.push({ name: name, pass: !!cond, detail: detail || '' });
  }
  function step(name, fn) { T.steps.push({ name: name, fn: fn }); }

  // helper di gioco
  function tel(x, y) { G.player.x = x; G.player.y = y; }
  function adv(n) { for (var i = 0; i < n; i++) advanceDialogue(); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function resetState() { restartGame(); }
  // riposiziona i personaggi dove sono di default (l'Ansia li sposta via)
  function placeChars() {
    G.chars.forEach(function (c) {
      var b = buildingById(c.home);
      var dx = c.home === 'parco' ? 150 : 90;
      c.x = b.cx + dx; c.y = b.cy + 110;
    });
  }

  // ─────────────────── SCENARI ───────────────────

  step('Mappa estesa & contenuti', function () {
    check('17 edifici', buildings.length >= 17, buildings.length + ' edifici');
    check('mondo 4800x4800', DATA.WORLD === 4800, 'WORLD=' + DATA.WORLD);
    check('griglia 10x10', DATA.GRID === 10);
    check('16 auto rubabili', G.cars.length >= 16, G.cars.length + ' auto');
    check('26 passanti', G.npcs.length >= 26, G.npcs.length + ' passanti');
    check('7 modelli di auto', Object.keys(DATA.CAR_MODELS).length >= 7, Object.keys(DATA.CAR_MODELS).length + ' modelli');
    check('16 colori auto', DATA.CAR_COLORS.length >= 16, DATA.CAR_COLORS.length + ' colori');
    check('3 personaggi con nome', G.chars.length === 3, G.chars.length + ' personaggi');
    check('3 armi definite', G.weapon.items.length === 3);
    check('side quest: 3', Object.keys(DATA.SIDE_QUESTS).length === 3);
    var allOk = G.cars.every(function (c) { return DATA.CAR_MODELS[c.model] && DATA.CAR_COLORS.indexOf(c.color) >= 0; });
    check('auto con modello e colore validi', allOk);
  });

  step('Dialoghi: prologo → capitolo 1', function () {
    resetState();
    check('dialogo aperto', !!G.dialogue);
    adv(4);
    check('stage 1 dopo il prologo', G.stage === 1, 'stage=' + G.stage);
    check('dialogo chiuso', G.dialogue === null);
  });

  step('Movimento, confini e collisioni', function () {
    tel(-1400, 400); // zona strada libera
    var p0 = { x: G.player.x, y: G.player.y };
    G.keys['w'] = true; update(0.3); G.keys['w'] = false;
    check('W avanza (y decresce)', G.player.y < p0.y);
    G.keys['d'] = true; update(0.3); G.keys['d'] = false;
    check('D va a destra (x cresce)', G.player.x > p0.x);
    // confine
    tel(DATA.WORLD / 2 - 100, 0); G.keys['d'] = true; update(0.5); G.keys['d'] = false;
    check('confine destro bloccato', G.player.x <= DATA.WORLD / 2 - 28, 'x=' + G.player.x.toFixed(0));
    tel(-DATA.WORLD / 2 + 100, 0); G.keys['a'] = true; update(0.5); G.keys['a'] = false;
    check('confine sinistro bloccato', G.player.x >= -DATA.WORLD / 2 + 28, 'x=' + G.player.x.toFixed(0));
    // collisione edificio: prova a entrare nel minimarket dal lato
    var m = buildingById('market');
    tel(m.x - 25, m.cy);
    G.keys['d'] = true; update(0.5); G.keys['d'] = false;
    check('non entra nell\'edificio', G.player.x <= m.x - 8, 'x=' + G.player.x.toFixed(0));
  });

  step('Turno di cassa (minigame) → capitolo 2', function () {
    G.stage = 1; G.job = null; G.side = null; G.dialogue = null;
    startCashier();
    check('minigame cassa avviato', G.minigame === 'cashier');
    var guard = 0;
    while (G.minigame === 'cashier' && guard++ < 40) {
      cashier.picked = cashier.order.slice();
      confirmOrder();
    }
    check('turno completato', G.minigame === null);
    check('pagato €' + DATA.PAY.cashier, G.money >= 80 + DATA.PAY.cashier, '€' + G.money);
    check('stage 2 dopo il turno', G.stage === 2, 'stage=' + G.stage);
  });

  step('La moto → capitolo 3', function () {
    G.stage = 2;
    if (G.player.inCar) exitCar();
    tel(DATA.MOTO.x + 8, DATA.MOTO.y + 8);
    tryInteract();
    check('dialogo della moto', !!G.dialogue);
    adv(3);
    check('stage 3 (moto presa)', G.stage === 3, 'stage=' + G.stage);
  });

  step('Lavoro pizza: 3 consegne', function () {
    G.stage = 3; G.job = null;
    startPizzaJob(3);
    check('job pizza attivo', G.job && G.job.kind === 'pizza');
    var m0 = G.money;
    for (var i = 0; i < 3; i++) {
      var t = jobTarget();
      tel(t.x, t.y);
      updateJob(0.1);
    }
    check('3 consegne completate', G.job === null);
    check('pagato', G.money > m0, '+€' + (G.money - m0));
  });

  step('Lavoro taxi: 2 corse', function () {
    G.stage = 4; G.job = null;
    startTaxiJob(2);
    var m0 = G.money;
    for (var i = 0; i < 2; i++) {
      var t = jobTarget();
      tel(t.x, t.y);
      updateJob(0.1);
    }
    check('2 corse completate', G.job === null);
    check('pagato', G.money > m0, '+€' + (G.money - m0));
  });

  step('Ansia: cap, panico, caffè, panchina', function () {
    G.rentT = 99999;
    // allontana i personaggi così la panchina non "cattura" un dialogo
    G.chars.forEach(function (c) { c.x = 9999; c.y = 9999; });
    G.dialogue = null; G.side = null; G.minigame = null;
    // marca l'acqua come già comprata così il bar serve il caffè
    G.weapon.items.forEach(function (w) { if (w.id === 'acqua') w.owned = true; });
    G.player.anxiety = 40;
    addAnxiety(70);
    check('cap massimo 100', G.player.anxiety === 100, 'ansia=' + G.player.anxiety);
    check('panico sopra 90', panicActive() === true);
    // caffè al bar
    G.money = 100;
    var bar = buildingById('bar');
    tel(bar.cx, bar.cy);
    tryInteract();
    check('caffè -25 ansia', G.player.anxiety === 75, 'ansia=' + G.player.anxiety);
    // panchina
    tel(G.bench.x, G.bench.y);
    tryInteract();
    check('panchina -30 ansia', G.player.anxiety === 45, 'ansia=' + G.player.anxiety);
  });

  step('Armi: fionda, acqua (bar), urlo (cap.6)', function () {
    G.dialogue = null; G.minigame = null;
    // reset proprietà armi: solo la fionda
    G.weapon.items.forEach(function (w) { w.owned = w.id === 'fionda'; });
    G.weapon.slot = 0; G.weapon.cd = 0;
    G.money = 50;
    // fionda
    fireWeapon();
    check('fionda spara', G.shots.length > 0);
    G.shots = [];
    // acqua: compra al bar
    var bar = buildingById('bar');
    tel(bar.cx, bar.cy);
    tryInteract();
    var owned = G.weapon.items.filter(function (w) { return w.id === 'acqua' && w.owned; }).length;
    check('pistola ad acqua comprata (€10)', owned === 1);
    check('soldi scalati', G.money === 40, '€' + G.money);
    // equipaggia acqua e spara (ansia -3)
    cycleWeapon();
    check('cambio arma su acqua', weaponCurrent().id === 'acqua');
    G.weapon.cd = 0;
    var a0 = G.player.anxiety;
    fireWeapon();
    check('acqua spara e calma (-3)', G.player.anxiety === a0 - 3 && G.shots.length > 0, 'ansia=' + G.player.anxiety);
    G.shots = [];
    // urlo: sbloccato al cap.6
    G.stage = 6;
    hud();
    var urloOwned = G.weapon.items.filter(function (w) { return w.id === 'urlo' && w.owned; }).length;
    check('urlo sbloccato al cap.6', urloOwned === 1);
    G.weapon.slot = G.weapon.items.indexOf(G.weapon.items.filter(function (w) { return w.id === 'urlo'; })[0]);
    G.weapon.cd = 0;
    var u0 = G.player.anxiety;
    fireWeapon();
    check('urlo: -15 ansia', G.player.anxiety === u0 - 15, 'ansia=' + G.player.anxiety);
  });

  step('Auto e polizia: furto, inseguimento, multa', function () {
    G.wanted = 0; G.police = []; G.dialogue = null;
    var c = G.cars[0];
    tel(c.x + 5, c.y + 5);
    tryInteract();
    check('salito in auto', G.player.inCar !== null);
    check('1 stella ricercato', G.wanted === 1, 'wanted=' + G.wanted);
    // inseguimento non crasha
    update(0.2);
    check('polizia insegue', G.police.length >= 1);
    // preso
    var m0 = G.money;
    bust();
    check('multa applicata', G.money === Math.max(0, m0 - 100), '€' + G.money);
    check('stelle azzerate', G.wanted === 0);
    check('respawn in casa', dist(G.player, { x: buildingById('casa').cx, y: buildingById('casa').y + buildingById('casa').h + 40 }) < 5);
  });

  step('Side quest: caffè (Rosa)', function () {
    G.side = null; placeChars();
    var rosa = G.chars.filter(function (c) { return c.id === 'rosa'; })[0];
    tel(rosa.x, rosa.y);
    tryInteract();
    adv(2);
    check('side quest caffè attiva', G.side && G.side.id === 'caffe');
    var m0 = G.money;
    for (var i = 0; i < 4; i++) {
      // sposta il passante su un punto di strada libero e avvicinati
      G.npcs[i].x = 500; G.npcs[i].y = -500 + i * 40;
      tel(G.npcs[i].x + 2, G.npcs[i].y + 2);
      tryInteract();
    }
    check('4 caffè consegnati e completata', G.side === null);
    check('premio +€25', G.money === m0 + 25, '€' + G.money);
  });

  step('Side quest: anello (Senzanome)', function () {
    G.side = null; placeChars();
    var sz = G.chars.filter(function (c) { return c.id === 'senzanome'; })[0];
    tel(sz.x, sz.y);
    tryInteract();
    adv(2);
    check('side quest anello attiva', G.side && G.side.id === 'anello');
    sz.x = 9999; sz.y = 9999; // il Senzanome si allontana mentre cerchi
    var m0 = G.money;
    var ring = null;
    for (var i = 0; i < G.ring.length; i++) if (G.ring[i].has) ring = G.ring[i];
    tel(ring.x, ring.y);
    tryInteract();
    check('anello trovato e completata', G.side === null && ring.found);
    check('premio +€40', G.money === m0 + 40, '€' + G.money);
  });

  step('Side quest: pacchi (Agente Conti)', function () {
    G.side = null; placeChars(); G.minigame = null; G.dialogue = null;
    var conti = G.chars.filter(function (c) { return c.id === 'conti'; })[0];
    tel(conti.x, conti.y);
    tryInteract();
    adv(2);
    check('side quest pacchi avviata (minigame)', G.side && G.side.id === 'pacchi' && G.minigame === 'pacchi');
    var m0 = G.money;
    var guard = 0;
    while (G.minigame === 'pacchi' && guard++ < 20) {
      pickPacco(pacchi.cur);
    }
    check('5 pacchi smistati e completata', G.side === null);
    check('premio +€30', G.money === m0 + 30, '€' + G.money);
  });

  step('Minigiochi: arcade e corsa', function () {
    G.money = 100;
    startArcade();
    check('arcade avviato', G.minigame === 'arcade');
    arc.dead = true; endArcade(true);
    check('arcade chiuso', G.minigame === null);
    startRace();
    check('corsa avviata', G.minigame === 'race' && race !== null);
    var m0 = G.money;
    for (var lap = 0; lap < DATA.RACE.laps; lap++) {
      for (var cp = 0; cp < DATA.RACE.check; cp++) {
        var pt = race.checkpoints[cp];
        tel(pt.x, pt.y);
        updateRace(0.1);
      }
    }
    check('corsa completata con premio', G.minigame === null && G.money > m0, '+€' + (G.money - m0));
  });

  step('Pausa / menu / uscita', function () {
    toggleMenu();
    check('pausa attiva', G.paused === true);
    check('overlay visibile', document.getElementById('menuOverlay').classList.contains('open'));
    toggleMenu();
    check('pausa disattivata', G.paused === false);
  });

  step('Compra pizzeria e finale narrato', function () {
    G.dialogue = null; G.minigame = null; G.side = null; G.job = null;
    G.money = 2000; G.stage = 8;
    var pz = buildingById('pizza');
    tel(pz.cx, pz.cy);
    tryInteract();
    adv(3);
    check('pizzeria comprata', G.ownsPizza === true);
    check('stage 9', G.stage === 9);
    finishLastJob();
    adv(5);
    check('finale avviato', G.over === true);
    check('finale visibile', !document.getElementById('finaleBox').classList.contains('hidden'));
    restartGame();
    check('ricomincia pulito', G.stage === 0 && G.over === false && G.money === 80);
  });

  // ─────────────────── RUNNER ───────────────────
  function ensurePanel() {
    var box = document.getElementById('testReport');
    if (box) return box;
    box = document.createElement('div');
    box.id = 'testReport';
    box.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;bottom:10px;z-index:900;background:rgba(4,10,24,.96);border:1px solid #3b82f6;border-radius:14px;padding:14px;overflow-y:auto;font:12px/1.6 monospace;color:#e2e8f0;';
    box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="color:#38bdf8">🧪 MOTORE DI TEST</b><button id="testClose" style="background:#334155;border:none;color:#fff;border-radius:8px;padding:6px 12px;cursor:pointer">✕ chiudi</button></div><div id="testLog"></div>';
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
    logLine('<div style="color:#93c5fd">Avvio test... ' + T.steps.length + ' scenari</div>');
    resetState();
    setTimeout(next, 60);
  }
  function next() {
    if (T.idx >= T.steps.length) { finish(); return; }
    var s = T.steps[T.idx++];
    var before = T.results.length;
    try { s.fn(); } catch (e) { check(s.name + ' — errore esecuzione', false, String(e && e.message || e)); }
    var fresh = T.results.slice(before);
    var fail = fresh.filter(function (r) { return !r.pass; }).length;
    logLine('<div style="color:' + (fail ? '#f87171' : '#4ade80') + '">' + (fail ? '✗' : '✓') + ' ' + s.name + (fail ? ' — ' + fail + ' FAIL' : '') + '</div>');
    fresh.forEach(function (r) {
      if (!r.pass) logLine('<div style="color:#fca5a5;padding-left:14px">  • ' + r.name + (r.detail ? ' (' + r.detail + ')' : '') + '</div>');
    });
    setTimeout(next, 30);
  }
  function finish() {
    var pass = T.results.filter(function (r) { return r.pass; }).length;
    var total = T.results.length;
    T.running = false;
    logLine('<div style="margin-top:10px;font-weight:800;color:' + (pass === total ? '#4ade80' : '#f87171') + '">RISULTATO: ' + pass + '/' + total + ' PASS</div>');
    if (pass === total) logLine('<div style="color:#93c5fd">Il gioco supera tutti i test. 🎉</div>');
  }

  window.__TEST__.run = run;

  // avvio automatico con ?test=1
  if (location.search.indexOf('test=1') >= 0) {
    window.addEventListener('load', function () { setTimeout(run, 400); });
  }
})();
