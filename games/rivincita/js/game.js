// ═══════════════════════════════════════════════════════════════
// RIVINCITA — engine GTA 2D top-down
// Mappa grande · armi satiriche · side quest · personaggi ·
// auto/polizia, ansia, lavori, minigiochi, missioni, satira.
// iPhone (joystick) + desktop (WASD).
// ═══════════════════════════════════════════════════════════════

'use strict';
var $ = function (id) { return document.getElementById(id); };

var canvas, ctx, W, H, DPR;
var G = {
  player: { x: 0, y: 0, angle: 0, speed: 150, inCar: null, anxiety: 40 },
  money: 80,
  wanted: 0,
  stage: 0,
  paused: false,
  over: false,
  keys: {},
  joy: { x: 0, y: 0, active: false },
  camera: { x: 0, y: 0 },
  cars: [],
  npcs: [],
  police: [],
  chars: [],
  shots: [],
  effects: [],
  dialogue: null,
  job: null,
  minigame: null,
  side: null,          // side quest attiva: {id, count, state}
  sideDone: 0,
  weapon: { slot: 0, cd: 0, items: null },
  evidence: false,
  ownsPizza: false,
  chillT: 0,
  music: true,
  photoFlash: 0,
  shake: 0,
  lastT: 0,
  npcLineT: 0,
  rentT: 0,
  bench: { x: 0, y: 0 },
  ring: [],
  traffic: [],          // auto NPC in movimento
  trafficT: 0,          // timer per spawn traffico
  collectibles: [],     // oggetti da trovare (side quest)
  eventT: 0,            // timer per eventi dinamici
  eventCd: 0,           // cooldown evento attivo
  phone: null,          // sistema telefono (missioni)
  missionLog: [],       // log missioni completate
  interior: null,       // edificio corrente {id, data, playerX, playerY}
  interiorItems: []     // stato oggetti interni
};

// ══════════ CANVAS ══════════
function resize() {
  W = window.innerWidth; H = window.innerHeight;
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
var ZOOM = 0.35, targetZoom = 0.35;
function setZoom(z) { targetZoom = Math.max(0.2, Math.min(0.85, z)); }
function zoomBy(f) { setZoom(targetZoom * f); }

function initCanvas() {
  canvas = $('c');
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  // zoom con la rotella (desktop)
  canvas.addEventListener('wheel', function (e) { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
  $('zoomIn').addEventListener('click', function () { zoomBy(1.25); });
  $('zoomOut').addEventListener('click', function () { zoomBy(1 / 1.25); });
}

// ══════════ CITTÀ ══════════
var buildings = [], roads = [], billboards = [];
function buildCity() {
  buildings = DATA.BUILDINGS.map(function (b) {
    var w = b.big ? DATA.BLOCK * 2.1 - 20 : DATA.BLOCK - 24;
    var h = b.big ? DATA.BLOCK - 24 : DATA.BLOCK - 24;
    return {
      id: b.id, name: b.name, emoji: b.emoji, color: b.color, kind: b.kind, job: b.job,
      x: DATA.cellX(b.col), y: DATA.cellY(b.row), w: w, h: h,
      cx: DATA.cellX(b.col) + w / 2, cy: DATA.cellY(b.row) + h / 2
    };
  });
  roads = [];
  for (var i = 0; i <= DATA.GRID; i++) {
    roads.push({ x: -DATA.WORLD / 2 + i * DATA.CELL, y: -DATA.WORLD / 2, w: DATA.ROAD, h: DATA.WORLD, v: true });
    roads.push({ x: -DATA.WORLD / 2, y: -DATA.WORLD / 2 + i * DATA.CELL, w: DATA.WORLD, h: DATA.ROAD, v: false });
  }
  billboards = DATA.BILLBOARDS.slice();
  G.cars = DATA.CARS.map(function (p) {
    // modello casuale (taxi più raro) + colore casuale dalla palette
    var models = Object.keys(DATA.CAR_MODELS).filter(function (m) { return m !== 'police'; });
    var model = Math.random() < 0.12 ? 'taxi' : models[(Math.random() * models.length) | 0];
    var color = DATA.CAR_COLORS[(Math.random() * DATA.CAR_COLORS.length) | 0];
    return { x: p.x, y: p.y, angle: Math.random() * 6.28, model: model, color: color, stolen: false, speed: 0 };
  });
  G.npcs = [];
  for (var n = 0; n < 40; n++) {
    var npcType = null;
    var roll = Math.random();
    var cumPct = 0;
    for (var t = 0; t < DATA.NPC_TYPES.length; t++) {
      cumPct += DATA.NPC_TYPES[t].pct;
      if (roll < cumPct) { npcType = DATA.NPC_TYPES[t]; break; }
    }
    if (!npcType) npcType = { type: 'normal', emoji: '🧑', speed: 20 + Math.random() * 20, color: '#64748b', pct: 0 };
    G.npcs.push({
      x: Math.random() * DATA.WORLD - DATA.WORLD / 2,
      y: Math.random() * DATA.WORLD - DATA.WORLD / 2,
      a: Math.random() * 6.28, v: npcType.speed, knock: 0, kdir: 0,
      npcType: npcType.type, npcColor: npcType.color, npcEmoji: npcType.emoji,
      reaction: 0
    });
  }
  G.police = [];
  G.chars = DATA.CHARS.map(function (c) {
    var b = buildingById(c.home);
    var dx = c.home === 'parco' ? 150 : (c.home === 'discoteca' ? -100 : 90);
    var dy = c.home === 'discoteca' ? -60 : 110;
    var px = b.cx + dx, py = b.cy + dy;
    return { id: c.id, name: c.name, emoji: c.emoji, color: c.color, home: c.home, x: px, y: py, quest: c.quest, talked: false };
  });
  // panchina del parco
  var park = buildingById('parco');
  G.bench = { x: park.x + park.w - 130, y: park.y + park.h - 55 };
  // punti anello (parco)
  G.ring = [];
  var ringIdx = Math.floor(Math.random() * 4);
  for (var r = 0; r < 4; r++) {
    G.ring.push({
      x: park.x + 80 + Math.random() * (park.w - 160),
      y: park.y + 60 + Math.random() * (park.h - 120),
      has: r === ringIdx, found: false
    });
  }
  // traffico iniziale
  G.traffic = [];
  G.trafficT = 0;
  // oggetti da trovare (collezionabili)
  G.collectibles = [];
  initCollectibles();
}
function buildingById(id) {
  for (var i = 0; i < buildings.length; i++) if (buildings[i].id === id) return buildings[i];
  return null;
}
function homeSpawn() {
  var h = buildingById('casa');
  return { x: h.cx, y: h.y + h.h + 40 };
}
function collidesRect(x, y, r) {
  var lim = DATA.WORLD / 2 - 30;
  if (x < -lim || x > lim || y < -lim || y > lim) return true;
  for (var i = 0; i < buildings.length; i++) {
    var b = buildings[i];
    if (b.kind === 'park') continue;   // il parco è calpestabile
    if (x + r > b.x && x - r < b.x + b.w && y + r > b.y && y - r < b.y + b.h) return true;
  }
  return false;
}

// ══════════ COLLEZIONABILI ══════════
function initCollectibles() {
  G.collectibles = [];
  Object.keys(DATA.COLLECTIBLE_SPAWNS).forEach(function (key) {
    var spawns = DATA.COLLECTIBLE_SPAWNS[key];
    spawns.forEach(function (sp, i) {
      G.collectibles.push({ type: key, x: sp.x, y: sp.y, id: key + '_' + i, found: false });
    });
  });
}

// ══════════ INTERNI ══════════
function enterBuilding(buildingId) {
  var data = DATA.INTERIORS[buildingId];
  if (!data) return;
  // salva posizione esterna del giocatore
  G.interior = {
    id: buildingId,
    data: data,
    exitX: G.player.x,
    exitY: G.player.y,
    playerX: data.spawn.x,
    playerY: data.spawn.y
  };
  G.player.x = data.spawn.x;
  G.player.y = data.spawn.y;
  G.player.angle = -Math.PI / 2; // guarda verso l'alto
  G.player.inCar = null;
  toast('📍 Sei dentro: ' + data.label);
  hud();
}

function exitBuilding() {
  if (!G.interior) return;
  G.player.x = G.interior.exitX;
  G.player.y = G.interior.exitY;
  G.player.angle = 0;
  G.interior = null;
  toast('📍 Sei uscito.');
  hud();
}

function interiorCollides(x, y, r) {
  if (!G.interior) return false;
  var d = G.interior.data;
  // muri perimetrali
  if (x - r < 0 || x + r > d.w || y - r < 0 || y + r > d.h) return true;
  // muri interni
  for (var i = 0; i < d.walls.length; i++) {
    var w = d.walls[i];
    if (x + r > w.x && x - r < w.x + w.w && y + r > w.y && y - r < w.y + w.h) return true;
  }
  // ostacoli (items con collisione)
  for (var j = 0; j < d.items.length; j++) {
    var it = d.items[j];
    if (x + r > it.x && x - r < it.x + it.w && y + r > it.y && y - r < it.y + it.h) return true;
  }
  return false;
}

function interiorNearestInteractable() {
  if (!G.interior) return null;
  var p = G.player;
  var d = G.interior.data;
  var best = null, bd = 60;
  for (var i = 0; i < d.items.length; i++) {
    var it = d.items[i];
    var cx = it.x + it.w / 2, cy = it.y + it.h / 2;
    var dist = Math.hypot(p.x - cx, p.y - cy);
    if (dist < bd && it.act) { bd = dist; best = it; }
  }
  // porta di uscita
  var doorDist = Math.hypot(p.x - d.exit.x, p.y - d.exit.y);
  if (doorDist < 50 && doorDist < bd) { best = { act: '__exit', label: '🚪 Esci' }; }
  return best;
}

function interiorInteract() {
  if (!G.interior) return;
  var a = interiorNearestInteractable();
  if (!a) return;
  if (a.act === '__exit') { exitBuilding(); return; }
  var action = DATA.INTERIOR_ACTIONS[a.act];
  if (!action) return;
  // mostra testo
  if (action.text) toast(action.text, 3500);
  if (action.anxiety) addAnxiety(action.anxiety);
  if (action.money) { G.money += action.money; hud(); }
  if (action.action === 'startCashier') {
    if (G.stage === 1) { showDialogue(DATA.STORY[1].dialogo, function () { startCashier(); }); }
    else if (G.stage > 1) { startCashier(); }
    else toast('Prima leggi il diario (capitolo 1).');
  } else if (action.action === 'startBoxing') {
    if (G.money >= 5) { G.money -= 5; startBoxing(); }
    else toast('L\'ingresso all\'arena costa €5.');
  }
}

function updateInterior(dt) {
  if (!G.interior) return;
  var mv = moveVector();
  if (mv.m > 0.1) {
    var sp = 150 * dt;
    var nx = G.player.x + mv.x * sp;
    var ny = G.player.y + mv.y * sp;
    if (!interiorCollides(nx, G.player.y, 10)) G.player.x = nx;
    if (!interiorCollides(G.player.x, ny, 10)) G.player.y = ny;
    G.player.angle = Math.atan2(mv.x, mv.y);
  }
}

function renderInterior() {
  if (!G.interior) return false;
  var d = G.interior.data;
  var p = G.player;

  // sfondo
  ctx.fillStyle = d.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  // centra la vista sull'interno
  var scale = Math.min(W / d.w, H / d.h) * 0.85;
  ctx.translate(W / 2, H / 2);
  ctx.scale(scale, scale);
  ctx.translate(-d.w / 2, -d.h / 2);

  // muri perimetrali
  ctx.fillStyle = '#4a5568';
  ctx.fillRect(0, 0, d.w, 12);
  ctx.fillRect(0, d.h - 12, d.w, 12);
  ctx.fillRect(0, 0, 12, d.h);
  ctx.fillRect(d.w - 12, 0, 12, d.h);

  // muri interni
  ctx.fillStyle = '#5a6577';
  d.walls.forEach(function (w) {
    ctx.fillRect(w.x, w.y, w.w, w.h);
  });

  // pavimento (schema a scacchi)
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (var gx = 12; gx < d.w - 12; gx += 30) {
    for (var gy = 12; gy < d.h - 12; gy += 30) {
      if ((Math.floor(gx / 30) + Math.floor(gy / 30)) % 2 === 0) {
        ctx.fillRect(gx, gy, 30, 30);
      }
    }
  }

  // oggetti
  d.items.forEach(function (it) {
    ctx.fillStyle = it.color;
    roundRect(ctx, it.x, it.y, it.w, it.h, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // etichetta
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(it.label, it.x + it.w / 2, it.y + it.h / 2);
  });

  // porta di uscita (pulsante)
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath(); ctx.arc(d.exit.x, d.exit.y, 14, 0, 6.28); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚪', d.exit.x, d.exit.y);

  // giocatore
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, 6.28); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fcd9b8';
  ctx.beginPath(); ctx.arc(p.x, p.y - 3, 5, 0, 6.28); ctx.fill();
  // indicatore direzione
  ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + Math.sin(p.angle) * 10, p.y + Math.cos(p.angle) * 10);
  ctx.stroke();

  // etichetta interazione
  var a = interiorNearestInteractable();
  if (a && !G.dialogue && !G.minigame && !G.paused) {
    var lbl = a.label || a.act;
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    roundRect(ctx, p.x - 80, p.y - 38, 160, 20, 6); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(lbl, p.x, p.y - 25);
  }

  // nome edificio in alto
  ctx.font = 'bold 16px system-ui';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText('📍 ' + d.label, d.w / 2, d.h - 30);

  ctx.restore();
  return true;
}

// ══════════ TRAFFICO NPC ══════════
function spawnTrafficCar() {
  if (G.traffic.length >= DATA.TRAFFIC.maxCars) return;
  var horizontal = Math.random() < 0.5;
  var roadIdx = Math.floor(Math.random() * (DATA.GRID + 1));
  var roadCenter = -DATA.WORLD / 2 + roadIdx * DATA.CELL + DATA.ROAD / 2;
  var startEdge = -DATA.WORLD / 2 - 100;
  var endEdge = DATA.WORLD / 2 + 100;
  var model = DATA.TRAFFIC.models[(Math.random() * DATA.TRAFFIC.models.length) | 0];
  var color = DATA.CAR_COLORS[(Math.random() * DATA.CAR_COLORS.length) | 0];
  var speed = DATA.TRAFFIC.speedRange[0] + Math.random() * (DATA.TRAFFIC.speedRange[1] - DATA.TRAFFIC.speedRange[0]);
  var goingForward = Math.random() < 0.5;
  var car;
  if (horizontal) {
    car = { x: goingForward ? startEdge : endEdge, y: roadCenter, angle: goingForward ? 0 : Math.PI, model: model, color: color, speed: speed, horizontal: true, forward: goingForward };
  } else {
    car = { x: roadCenter, y: goingForward ? startEdge : endEdge, angle: goingForward ? Math.PI / 2 : -Math.PI / 2, model: model, color: color, speed: speed, horizontal: false, forward: goingForward };
  }
  G.traffic.push(car);
}

function updateTraffic(dt) {
  G.trafficT -= dt;
  if (G.trafficT <= 0) {
    G.trafficT = DATA.TRAFFIC.spawnInterval + Math.random() * 2;
    spawnTrafficCar();
  }
  for (var i = G.traffic.length - 1; i >= 0; i--) {
    var c = G.traffic[i];
    var dir = c.forward ? 1 : -1;
    if (c.horizontal) c.x += c.speed * dir * dt;
    else c.y += c.speed * dir * dt;
    // rimuovi auto fuori dai bordi
    if (c.x < -DATA.WORLD / 2 - 200 || c.x > DATA.WORLD / 2 + 200 ||
        c.y < -DATA.WORLD / 2 - 200 || c.y > DATA.WORLD / 2 + 200) {
      G.traffic.splice(i, 1);
      continue;
    }
    // evita collisioni con il giocatore
    var d = Math.hypot(G.player.x - c.x, G.player.y - c.y);
    if (d < 30 && !G.player.inCar) {
      // il giocatore viene investito!
      addAnxiety(8);
      G.shake = 0.5;
      toast('🚗 Auto in movimento! Stai attento!');
    }
    // collisioni con passanti
    for (var n = 0; n < G.npcs.length; n++) {
      var np = G.npcs[n];
      if (Math.hypot(np.x - c.x, np.y - c.y) < 20) {
        np.knock = 0.5;
        np.kdir = Math.atan2(np.y - c.y, np.x - c.x);
      }
    }
  }
}

// ══════════ REAZIONI NPC ══════════
function updateNPCReactions(dt) {
  G.npcs.forEach(function (n) {
    if (n.reaction > 0) { n.reaction -= dt; return; }
    var d = Math.hypot(n.x - G.player.x, n.y - G.player.y);
    if (d < 50 && Math.random() < 0.008) {
      var lines = DATA.NPC_REACTIONS[0].lines;
      if (d < 30) lines = DATA.NPC_REACTIONS[2].lines;
      else if (d < 40) lines = DATA.NPC_REACTIONS[1].lines;
      toast('💬 ' + lines[(Math.random() * lines.length) | 0], 2500);
      n.reaction = 8;
    }
  });
}

// ══════════ EVENTI DINAMICI ══════════
function triggerDynamicEvent() {
  var ev = DATA.DYNAMIC_EVENTS[(Math.random() * DATA.DYNAMIC_EVENTS.length) | 0];
  toast(ev.text, 3500);
  if (ev.anxiety) addAnxiety(ev.anxiety);
  if (ev.money) { G.money += ev.money; hud(); }
}
function bindInput() {
  window.addEventListener('keydown', function (e) {
    G.keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') { e.preventDefault(); fireWeapon(); }
    if (e.key.toLowerCase() === 'e') {
      if (G.interior) interiorInteract();
      else tryInteract();
    }
    if (e.key.toLowerCase() === 'm') toggleMusic();
    if (e.key.toLowerCase() === 'v') tryPhoto();
    if (e.key.toLowerCase() === 'q') cycleWeapon();
    if (e.key === 'Escape') {
      if (G.interior) exitBuilding();
      else toggleMenu();
    }
  });
  window.addEventListener('keyup', function (e) { G.keys[e.key.toLowerCase()] = false; });

  var joyEl = $('joy'), knob = $('joyKnob');
  var jc = { x: 0, y: 0 };
  function joyCenter() { var r = joyEl.getBoundingClientRect(); jc.x = r.left + r.width / 2; jc.y = r.top + r.height / 2; }
  joyCenter(); window.addEventListener('resize', joyCenter);
  function setJoy(t) {
    var dx = t.clientX - jc.x, dy = t.clientY - jc.y, d = Math.hypot(dx, dy), mx = 42;
    var nx = d > mx ? dx / d * mx : dx, ny = d > mx ? dy / d * mx : dy;
    G.joy.x = nx / mx; G.joy.y = ny / mx;
    knob.style.transform = 'translate(' + nx + 'px,' + ny + 'px)';
  }
  joyEl.addEventListener('touchstart', function (e) { e.preventDefault(); e.stopPropagation(); G.joy.active = true; setJoy(e.touches[0]); }, { passive: false });
  document.addEventListener('touchmove', function (e) {
    if (!G.joy.active) return;
    for (var i = 0; i < e.touches.length; i++) if (joyEl.contains(e.touches[i].target)) { setJoy(e.touches[i]); break; }
  }, { passive: false });
  document.addEventListener('touchend', function (e) {
    if (!G.joy.active) return;
    var still = false;
    for (var i = 0; i < e.touches.length; i++) if (joyEl.contains(e.touches[i].target)) still = true;
    if (!still) { G.joy.active = false; G.joy.x = 0; G.joy.y = 0; knob.style.transform = 'translate(0,0)'; }
  });
  $('actBtn').addEventListener('touchstart', function (e) { e.preventDefault(); if (G.interior) interiorInteract(); else tryInteract(); }, { passive: false });
  $('actBtn').addEventListener('mousedown', function () { if (G.interior) interiorInteract(); else tryInteract(); });
  $('attackBtn').addEventListener('touchstart', function (e) { e.preventDefault(); fireWeapon(); }, { passive: false });
  $('attackBtn').addEventListener('mousedown', fireWeapon);
  $('carBtn').addEventListener('touchstart', function (e) { e.preventDefault(); toggleCarAction(); }, { passive: false });
  $('carBtn').addEventListener('mousedown', toggleCarAction);
}

// pulsante auto: entra/esci
function toggleCarAction() {
  if (G.paused || G.over || G.dialogue || G.minigame) return;
  if (G.player.inCar) { exitCar(); return; }
  var a = nearestInteractable();
  if (a && a.act === 'car') enterCar(a.car);
  else toast('Nessuna auto vicina.');
}

function moveVector() {
  var x = 0, y = 0;
  var k = G.keys;
  if (k['w'] || k['arrowup']) y -= 1;
  if (k['s'] || k['arrowdown']) y += 1;
  if (k['a'] || k['arrowleft']) x -= 1;
  if (k['d'] || k['arrowright']) x += 1;
  if (G.joy.active) { x += G.joy.x; y += G.joy.y; }
  var m = Math.hypot(x, y);
  if (m > 1) { x /= m; y /= m; }
  return { x: x, y: y, m: m };
}

// ══════════ ANSIA ══════════
function addAnxiety(v) {
  G.player.anxiety = Math.max(0, Math.min(100, G.player.anxiety + v));
  if (G.player.anxiety >= 95 && Math.random() < 0.02) {
    toast('😰 Attacco di panico! Fermati, respira (parco o caffè).');
    G.shake = 1;
  }
  hud();
}
function panicActive() { return G.player.anxiety >= 90; }

// ══════════ TOAST / HUD ══════════
var toastT = null;
function toast(msg, ms) {
  var el = $('toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(function () { el.classList.remove('on'); }, ms || 2400);
}
function starsHtml() {
  var s = '';
  for (var i = 0; i < 3; i++) s += i < G.wanted ? '★' : '☆';
  return s;
}
function weaponCurrent() { return G.weapon.items[G.weapon.slot]; }
function hud() {
  $('money').textContent = '€' + G.money;
  var anx = Math.round(G.player.anxiety);
  $('anxVal').textContent = anx + '%';
  var bar = $('anxBar');
  bar.style.width = anx + '%';
  bar.style.background = anx > 70 ? '#e53e3e' : anx > 40 ? '#ed8936' : '#38a169';
  $('wanted').textContent = '🚨 ' + starsHtml();
  var st = DATA.STORY[Math.min(G.stage, DATA.STORY.length - 1)];
  $('stageName').textContent = 'Cap. ' + (G.stage + 1) + ' · ' + st.name;
  $('objective').textContent = '🎯 ' + currentObjective();
  $('jobTag').style.display = G.job ? 'block' : 'none';
  if (G.job) $('jobTag').textContent = G.job.kind === 'pizza' ? '🍕 ' + G.job.left + ' consegne' : G.job.kind === 'taxi' ? '🚕 ' + G.job.left + ' corse' : '';
  var w = weaponCurrent();
  $('weapon').textContent = (w ? w.emoji + ' ' + w.name : '🔧') + ' · Q';
  // cooldown bar
  var cdBar = $('cdBar');
  if (cdBar) {
    var cdPct = w ? Math.max(0, G.weapon.cd / w.cd) : 0;
    cdBar.style.width = (cdPct * 100) + '%';
    cdBar.style.background = cdPct > 0 ? '#f59e0b' : '#38a169';
  }
  // pulsante auto contestuale
  var cb = $('carBtn');
  cb.textContent = G.player.inCar ? '🚪' : '🚗';
  cb.title = G.player.inCar ? 'Esci dall\'auto' : 'Entra in auto';
  // sblocco armi per capitolo
  for (var ui = 0; ui < G.weapon.items.length; ui++) {
    if (G.weapon.items[ui].id === 'urlo') {
      G.weapon.items[ui].owned = G.stage >= (DATA.WEAPON_UNLOCK.urlo + 1);
    }
    if (G.weapon.items[ui].id === 'fischio') {
      G.weapon.items[ui].owned = G.stage >= (DATA.WEAPON_UNLOCK.fischio + 1);
    }
  }
  if (!weaponCurrent().owned) G.weapon.slot = 0;
  $('sideLine').style.display = G.side ? 'block' : 'none';
  if (G.side) {
    var q = DATA.SIDE_QUESTS[G.side.id];
    $('sideLine').textContent = '📋 ' + q.name + ' (' + sideProgress() + ')';
  }
}
function currentObjective() {
  var st = DATA.STORY[Math.min(G.stage, DATA.STORY.length - 1)];
  if (G.stage === 8 && !G.ownsPizza) return 'Ti servono €' + DATA.COSTS.pizzaShop + ' (ne hai ' + G.money + ') — fai consegne!';
  if (G.stage === 6 && !G.evidence) return st.objective + ' — fotografa con V dentro la sede';
  if (G.stage === 5) return 'Resta 10 secondi sulla panchina del parco';
  return st.objective;
}
function sideProgress() {
  if (!G.side) return '';
  var q = DATA.SIDE_QUESTS[G.side.id];
  if (G.side.id === 'caffe') return G.side.count + '/' + q.count + ' caffè';
  if (G.side.id === 'anello') return 'cerca il luccichio...';
  if (G.side.id === 'pacchi') return G.side.count + '/' + q.count + ' pacchi';
  if (G.side.id === 'utensili') return G.side.count + '/' + q.count + ' utensili';
  if (G.side.id === 'libri') return G.side.count + '/' + q.count + ' libri';
  if (G.side.id === 'djset') return G.side.count + '/' + q.count + ' dischi';
  return '';
}

// ══════════ DIALOGO ══════════
function showDialogue(lines, onDone) {
  if (G.dialogue || G.minigame) return;
  G.dialogue = { lines: lines, idx: 0, onDone: onDone || null };
  renderDialogueLine();
  $('dlg').classList.add('on');
}
function renderDialogueLine() {
  var l = G.dialogue.lines[G.dialogue.idx];
  $('dlgName').textContent = l.n;
  $('dlgText').textContent = l.t;
  $('dlgNext').textContent = G.dialogue.idx < G.dialogue.lines.length - 1 ? '▼' : '✔';
}
function advanceDialogue() {
  if (!G.dialogue) return;
  G.dialogue.idx++;
  if (G.dialogue.idx >= G.dialogue.lines.length) {
    var cb = G.dialogue.onDone;
    G.dialogue = null;
    $('dlg').classList.remove('on');
    if (cb) cb();
  } else renderDialogueLine();
}
$('dlg').addEventListener('click', advanceDialogue);
document.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') advanceDialogue(); });

function nextStage() {
  G.stage++;
  G.job = null;
  hud();
  if (G.stage >= DATA.STORY.length) startFinale();
}

// ══════════ ARMI ══════════
function cycleWeapon() {
  var owned = G.weapon.items.filter(function (w) { return w.owned; });
  if (!owned.length) return;
  var cur = weaponCurrent();
  G.weapon.slot = (owned.indexOf(cur) + 1) % owned.length;
  G.weapon.slot = G.weapon.items.indexOf(owned[G.weapon.slot]);
  toast(weaponCurrent().emoji + ' ' + weaponCurrent().name + ': ' + weaponCurrent().desc);
  hud();
}
function fireWeapon() {
  if (G.paused || G.over || G.dialogue || G.minigame) return;
  var w = weaponCurrent();
  if (!w || !w.owned) { toast('Nessuna arma equipaggiata (Q per cambiare).'); return; }
  if (G.weapon.cd > 0) return;
  G.weapon.cd = w.cd;
  var p = G.player;
  var a = p.inCar ? p.inCar.angle : p.angle;
  if (w.id === 'fionda') {
    G.shots.push({ x: p.x + Math.sin(a) * 16, y: p.y + Math.cos(a) * 16, a: a, sp: 380, type: 'fionda', life: 0.9 });
    addAttackFx(p.x + Math.sin(a) * 20, p.y + Math.cos(a) * 20, 'muzzle', '#f59e0b');
    toast('🪀 FIONDA! (satira inclusa)');
  } else if (w.id === 'acqua') {
    G.shots.push({ x: p.x + Math.sin(a) * 16, y: p.y + Math.cos(a) * 16, a: a, sp: 420, type: 'acqua', life: 0.6 });
    addAttackFx(p.x + Math.sin(a) * 20, p.y + Math.cos(a) * 20, 'muzzle', '#38bdf8');
    addAnxiety(-3);
  } else if (w.id === 'urlo') {
    addAnxiety(-15);
    G.shake = 0.6;
    addAttackFx(p.x, p.y, 'slash', '#ef4444');
    G.npcs.forEach(function (n) { var d = Math.hypot(n.x - p.x, n.y - p.y); if (d < 140) { n.knock = 0.8; n.kdir = Math.atan2(n.y - p.y, n.x - p.x); } });
    toast('😤 URLO LIBERATORIO! L\'ansia scende di 15.');
  } else if (w.id === 'fischio') {
    G.npcs.forEach(function (n) {
      var d = Math.hypot(n.x - p.x, n.y - p.y);
      if (d < 200) { n.a = Math.atan2(p.y - n.y, p.x - n.x); n.v = 10; setTimeout(function () { n.v = n.npcType === 'runner' ? 80 : 20 + Math.random() * 20; }, 3000); }
    });
    addAnxiety(-2);
    toast('📣 FISCHIO! I passanti si fermano a guardarti. Utile per le consegne.');
  }
}
// effetti visivi attacco
var attackFx = [];
function addAttackFx(x, y, type, color) {
  attackFx.push({ x: x, y: y, type: type, color: color || '#fff', timer: 12 });
}
function autoFireWeapon(dt) {
  if (G.paused || G.over || G.dialogue || G.minigame || G.interior) return;
  var w = weaponCurrent();
  if (!w || !w.owned) return;
  if (G.weapon.cd > 0) return;
  var p = G.player;
  // trova nemico piu vicino (polizia > NPC)
  var target = null;
  var bestD = 220;
  for (var c = 0; c < G.police.length; c++) {
    var cop = G.police[c];
    var d = Math.hypot(cop.x - p.x, cop.y - p.y);
    if (d < bestD) { bestD = d; target = cop; }
  }
  if (!target) {
    for (var n = 0; n < G.npcs.length; n++) {
      var np = G.npcs[n];
      var dn = Math.hypot(np.x - p.x, np.y - p.y);
      if (dn < 150) { target = np; bestD = dn; break; }
    }
  }
  if (!target) return;
  // orienta il giocatore verso il nemico
  p.angle = Math.atan2(target.x - p.x, target.y - p.y);
  // controlla se il nemico e nella direzione corretta (conico)
  var aToTarget = Math.atan2(target.y - p.y, target.x - p.x);
  var angleDiff = Math.abs(p.angle - aToTarget);
  if (angleDiff > Math.PI) angleDiff = 6.28 - angleDiff;
  if (angleDiff > 1.2) return;
  // spara automaticamente
  fireWeapon();
}
function updateShots(dt) {
  var p = G.player;
  for (var i = G.shots.length - 1; i >= 0; i--) {
    var s = G.shots[i];
    s.x += Math.cos(s.a) * s.sp * dt;
    s.y += Math.sin(s.a) * s.sp * dt;
    s.life -= dt;
    // passanti
    var hitNpc = false;
    for (var n = 0; n < G.npcs.length && !hitNpc; n++) {
      var np = G.npcs[n];
      if (Math.hypot(np.x - s.x, np.y - s.y) < 16) {
        np.knock = 0.6; np.kdir = s.a;
        hitNpc = true;
      }
    }
    // polizia
    for (var c = 0; c < G.police.length; c++) {
      var cop = G.police[c];
      if (Math.hypot(cop.x - s.x, cop.y - s.y) < 22) {
        if (s.type === 'acqua') { cop.slow = 2.5; toast('💦 La polizia è... rinfrescata! Rallenta.'); }
        if (s.type === 'fionda') { cop.slow = Math.max(cop.slow || 0, 1.2); }
        s.life = 0;
      }
    }
    if (hitNpc || s.life <= 0) G.shots.splice(i, 1);
  }
}

// ══════════ INTERAZIONE ══════════
function nearestInteractable() {
  var p = G.player, best = null, bd = 80;
  var spots = [
    { b: buildingById('casa'), act: 'door' },
    { b: buildingById('market'), act: 'market' },
    { b: buildingById('pizza'), act: 'pizza' },
    { b: buildingById('taxi'), act: 'taxi' },
    { b: buildingById('bar'), act: 'bar' },
    { b: buildingById('posta'), act: 'posta' },
    { b: buildingById('ufficio'), act: 'ufficio' },
    { b: buildingById('edicola'), act: 'edicola' },
    { b: buildingById('ristorante'), act: 'ristorante' },
    { b: buildingById('arena'), act: 'arena' },
    { b: buildingById('meccanico'), act: 'meccanico' },
    { b: buildingById('biblioteca'), act: 'biblioteca' },
    { b: buildingById('discoteca'), act: 'discoteca' },
    { b: buildingById('cinema'), act: 'cinema' },
    { b: buildingById('palestra'), act: 'palestra' }
  ];
  var i, d;
  for (i = 0; i < spots.length; i++) {
    if (!spots[i].b) continue;
    d = Math.hypot(p.x - spots[i].b.cx, p.y - spots[i].b.cy);
    if (d < bd) { bd = d; best = spots[i]; }
  }
  d = Math.hypot(p.x - G.bench.x, p.y - G.bench.y);
  if (d < 100 && d < bd) { best = { act: 'park' }; bd = d; }
  d = Math.hypot(p.x - DATA.MOTO.x, p.y - DATA.MOTO.y);
  if (d < 80 && d < bd) { best = { act: 'moto' }; bd = d; }
  // auto (la più vicina vince)
  for (i = 0; i < G.cars.length; i++) {
    d = Math.hypot(p.x - G.cars[i].x, p.y - G.cars[i].y);
    if (d < 60 && d < bd) { bd = d; best = { act: 'car', car: G.cars[i] }; }
  }
  // anello (parco) — priorità alta quando la side quest è attiva
  if (G.side && G.side.id === 'anello') {
    for (i = 0; i < G.ring.length; i++) {
      d = Math.hypot(p.x - G.ring[i].x, p.y - G.ring[i].y);
      if (d < 50 && d < bd) { bd = d; best = { act: 'ring', ring: G.ring[i] }; }
    }
  }
  // personaggi con nome (il più vicino vince)
  for (i = 0; i < G.chars.length; i++) {
    d = Math.hypot(p.x - G.chars[i].x, p.y - G.chars[i].y);
    if (d < 70 && d < bd) { bd = d; best = { act: 'char', ch: G.chars[i] }; }
  }
  // consegna caffè: passa da un passante
  if (G.side && G.side.id === 'caffe') {
    for (i = 0; i < G.npcs.length; i++) {
      d = Math.hypot(p.x - G.npcs[i].x, p.y - G.npcs[i].y);
      if (d < 45) { best = { act: 'deliverCoffee' }; }
    }
  }
  // collezionabili (utensili, libri, dischi)
  if (G.side && DATA.COLLECTIBLE_SPAWNS[G.side.id]) {
    for (i = 0; i < G.collectibles.length; i++) {
      var col = G.collectibles[i];
      if (col.type === G.side.id && !col.found) {
        d = Math.hypot(p.x - col.x, p.y - col.y);
        if (d < 45 && d < bd) { bd = d; best = { act: 'collect', collectible: col }; }
      }
    }
  }
  return best;
}
function interactLabel(a) {
  if (!a) return '';
  if (a.act === 'door') return '📍 Entra in Casa';
  if (a.act === 'market') return '📍 Entra in Minimarket';
  if (a.act === 'pizza') return '📍 Entra in Pizzeria';
  if (a.act === 'taxi') return '📍 Entra in Taxi';
  if (a.act === 'bar') return '☕ Caffè (€' + DATA.COSTS.caffe + ')';
  if (a.act === 'posta') return '📍 Entra in Posta';
  if (a.act === 'ufficio') return '📍 Entra in Sede Merloni';
  if (a.act === 'park') return '🌳 Panchina (rilassa)';
  if (a.act === 'moto') return '🏍️ La moto';
  if (a.act === 'car') return '🚗 Salta in auto';
  if (a.act === 'char') return a.ch.emoji + ' ' + a.ch.name;
  if (a.act === 'ring') return '✨ Luccichio... prova a raccogliere';
  if (a.act === 'deliverCoffee') return '☕ Consegna il caffè';
  if (a.act === 'edicola') return '📍 Entra in Edicola';
  if (a.act === 'ristorante') return '📍 Entra in Trattoria';
  if (a.act === 'arena') return '📍 Entra in Arena';
  if (a.act === 'meccanico') return '📍 Entra in Autofficina';
  if (a.act === 'biblioteca') return '📍 Entra in Biblioteca';
  if (a.act === 'discoteca') return '📍 Entra in Discoteca';
  if (a.act === 'cinema') return '📍 Entra in Cinema';
  if (a.act === 'palestra') return '📍 Entra in Palestra';
  if (a.act === 'collect') {
    var info = DATA.COLLECTIBLES[a.collectible.type];
    return info.emoji + ' Raccogli ' + info.name;
  }
  return '';
}
function tryInteract() {
  if (G.paused || G.over || G.dialogue || G.minigame) return;
  // se dentro un edificio, gestisci interazione interna
  if (G.interior) { interiorInteract(); return; }
  var a = nearestInteractable();
  if (!a) return;
  var act = a.act;
  if (act === 'door') {
    if (G.stage === 0) showDialogue(DATA.STORY[0].dialogo, function () { nextStage(); });
    else enterBuilding('casa');
  } else if (act === 'market') {
    if (G.stage === 1) { showDialogue(DATA.STORY[1].dialogo, function () { startCashier(); }); }
    else if (G.stage < 1) toast('Prima leggi il diario (capitolo 1).');
    else enterBuilding('market');
  } else if (act === 'pizza') {
    if (G.stage === 3) { showDialogue(DATA.STORY[3].dialogo, function () { startPizzaJob(3); }); }
    else if (G.stage === 8) { buyPizzeria(); }
    else if (G.stage === 9 && G.ownsPizza) { startPizzaJob(1, true); }
    else enterBuilding('pizza');
  } else if (act === 'taxi') {
    if (G.stage === 4) { showDialogue(DATA.STORY[4].dialogo, function () { startTaxiJob(2); }); }
    else enterBuilding('taxi');
  } else if (act === 'bar') {
    var acq = null;
    for (var wi = 0; wi < G.weapon.items.length; wi++) if (G.weapon.items[wi].id === 'acqua') acq = G.weapon.items[wi];
    if (acq && !acq.owned) {
      if (G.money >= DATA.COSTS.acqua) {
        acq.owned = true;
        G.money -= DATA.COSTS.acqua;
        toast('💦 Pistola ad acqua comprata! (Q per equipaggiarla)');
        hud();
      } else toast('La pistola ad acqua costa €' + DATA.COSTS.acqua + '. Il bar, invece, è comprensivo.');
    } else if (G.money >= DATA.COSTS.caffe) {
      G.money -= DATA.COSTS.caffe; addAnxiety(-25);
      toast('☕ Caffè. L\'ansia scende di 25.');
      hud();
    } else toast('Non hai i €' + DATA.COSTS.caffe + ' per il caffè. Satira inclusa.');
  } else if (act === 'posta') {
    if (G.stage === 7) { showDialogue(DATA.STORY[7].dialogo, function () { nextStage(); }); }
    else enterBuilding('posta');
  } else if (act === 'ufficio') {
    if (G.stage === 6) enterBuilding('ufficio');
    else toast('La sede Merloni. Meglio non entrare senza motivo.');
  } else if (act === 'park') {
    if (G.stage === 5) {
      G.chillT = 10;
      showDialogue(DATA.STORY[5].dialogo, function () { G.chillT = 0; nextStage(); });
    } else {
      addAnxiety(-30);
      toast('🌳 Panchina: l\'ansia scende di 30. Consigliata.');
      hud();
    }
  } else if (act === 'moto') {
    if (G.stage === 2) { showDialogue(DATA.STORY[2].dialogo, function () { G.stage = 3; hud(); toast('🏍️ Moto presa! Ora vai in pizzeria.'); }); }
    else toast('La moto abbandonata. Il tuo biglietto per la rivincita.');
  } else if (act === 'car') {
    if (a.car) enterCar(a.car);
  } else if (act === 'char') {
    talkToChar(a.ch);
  } else if (act === 'ring') {
    if (a.ring.has && !a.ring.found) {
      a.ring.found = true;
      completeSide('anello');
    } else if (a.ring.found) {
      toast('Hai già l\'anello.');
    } else {
      toast('Niente: solo foglie e un ricordo.');
    }
  } else if (act === 'deliverCoffee') {
    if (G.side && G.side.id === 'caffe') {
      G.side.count++;
      toast('☕ Caffè consegnato (' + G.side.count + '/' + DATA.SIDE_QUESTS.caffe.count + '). Il passante ringrazia.');
      hud();
      if (G.side.count >= DATA.SIDE_QUESTS.caffe.count) completeSide('caffe');
    }
  } else if (act === 'collect') {
    if (G.side && G.side.id === a.collectible.type) {
      a.collectible.found = true;
      G.side.count++;
      var ci = DATA.COLLECTIBLES[a.collectible.type];
      toast(ci.emoji + ' ' + ci.name + ' trovato! (' + G.side.count + '/' + DATA.SIDE_QUESTS[G.side.id].count + ')');
      hud();
      if (G.side.count >= DATA.SIDE_QUESTS[G.side.id].count) completeSide(G.side.id);
    }
  } else if (act === 'edicola') {
    if (G.money >= 2) {
      G.money -= 2;
      addAnxiety(-5);
      toast('📰 Giornale letto. Le notizie sono tristi, ma almeno sai cosa succede. -5 ansia.');
      hud();
    } else toast('Il giornale costa €2. Anche la conoscenza ha un prezzo.');
  } else if (act === 'ristorante') {
    if (G.money >= 8) {
      G.money -= 8;
      addAnxiety(-20);
      toast('🍝 Pasto alla trattoria. La Nonna cuoce bene. -20 ansia. +€0 (ma +vita).');
      hud();
    } else toast('Il piatto della casa costa €8. La fame, invece, è gratis.');
  } else if (act === 'arena') {
    if (G.money >= 5) {
      G.money -= 5;
      startBoxing();
    } else toast('L\'ingresso all\'arena costa €5. La violenza, come sempre, ha un prezzo.');
  } else if (act === 'meccanico') {
    if (G.player.inCar) {
      if (G.money >= DATA.COSTS.riparazione) {
        G.money -= DATA.COSTS.riparazione;
        G.player.inCar.speed = 0;
        toast('🛠️ Auto riparata! -€' + DATA.COSTS.riparazione);
        hud();
      } else toast('La riparazione costa €' + DATA.COSTS.riparazione + '. Gino è gentile ma non gratis.');
    } else enterBuilding('meccanico');
  } else if (act === 'biblioteca') {
    addAnxiety(-10);
    toast('📚 Ti sei perso tra i libri. L\'ansia scende di 10. Consigliato.');
    hud();
  } else if (act === 'discoteca') {
    if (G.money >= 7) {
      G.money -= 7;
      addAnxiety(-18);
      toast('🪩 Musica forte! L\'ansia scende di 18. Per un\'ora, il mondo tace.');
      hud();
    } else toast('L\'ingresso alla discoteca costa €7. La musica, invece, è ovunque.');
  } else if (act === 'cinema') {
    if (G.money >= 6) {
      G.money -= 6;
      addAnxiety(-15);
      toast('🎬 Film vista! Due ore di escape. L\'ansia scende di 15.');
      hud();
    } else toast('Il biglietto costa €6. La realtà è gratis (e pure brutta).');
  } else if (act === 'palestra') {
    addAnxiety(-8);
    toast('🏋️ Allenamento fatto! L\'ansia scende di 8. I muscoli ringraziano.');
    hud();
  }
  hud();
}
function talkToChar(ch) {
  if (G.side) { toast('Hai già una side-quest attiva. Finiscila prima!'); return; }
  var q = DATA.SIDE_QUESTS[ch.quest];
  var lines = [{ n: ch.name, t: q.text }];
  if (!ch.talked) {
    ch.talked = true;
    var intro = 'Ciao Marco!';
    if (ch.id === 'senzanome') intro = 'Sei il primo che si ferma ad ascoltarmi. Ho perso l\'anello di mia moglie...';
    else if (ch.id === 'rosa') intro = 'Marco! Ho un favore da chiederti. Un giro di caffè per la città.';
    else if (ch.id === 'conti') intro = 'Agente Conti: aiuto! I pacchi della posta mi seppelliscono.';
    else if (ch.id === 'gino') intro = 'Ehi Marco! Ho perso tutti i miei utensili nell\'officina. Li trovi nel parcheggio?';
    else if (ch.id === 'luca') intro = 'Marco! I libri sono spariti dalla biblioteca. Li hanno sparsi per la città...';
    else if (ch.id === 'dj_nina') intro = 'Marco! Ho bisogno dei miei dischi per il set di stasera. Li trovi in giro?';
    lines.unshift({ n: ch.name, t: intro });
  }
  showDialogue(lines, function () {
    G.side = { id: ch.quest, count: 0, state: {} };
    if (ch.quest === 'pacchi') startPacchiMinigame();
    hud();
  });
}
function completeSide(id) {
  var q = DATA.SIDE_QUESTS[id];
  G.money += q.reward.money;
  addAnxiety(q.reward.anxiety);
  G.side = null;
  G.sideDone++;
  toast(q.done);
  hud();
}

// ══════════ AUTO & POLIZIA ══════════
function enterCar(car) {
  if (G.player.inCar) return;
  G.player.inCar = car;
  car.stolen = true;
  G.wanted = Math.min(3, G.wanted + 1);
  toast('🚗 Sei al volante. ' + starsHtml());
  hud();
}
function exitCar() {
  if (!G.player.inCar) return;
  var c = G.player.inCar;
  G.player.x = c.x + Math.cos(c.angle + Math.PI) * 30;
  G.player.y = c.y + Math.sin(c.angle + Math.PI) * 30;
  G.player.angle = c.angle;
  G.player.inCar = null;
  hud();
}
function tryPhoto() {
  if (G.stage === 6 && !G.evidence) {
    var u = buildingById('ufficio');
    var d = Math.hypot(G.player.x - u.cx, G.player.y - u.cy);
    if (d < 150) {
      G.evidence = true;
      G.photoFlash = 1;
      toast('📸 Fotografato! Merloni non sa ancora quanto gli costerà.');
      hud();
    } else toast('Avvicinati alla sede Merloni per fotografare.');
  }
}
function updateCars(dt) {
  var p = G.player;
  if (p.inCar) {
    var c = p.inCar;
    var mv = moveVector();
    var throttle = -mv.y;
    var steer = mv.x;
    if (G.keys[' ']) throttle = -1;
    c.speed += throttle * 170 * dt;
    c.speed = Math.max(-90, Math.min(280, c.speed));
    c.angle += steer * 2.2 * dt * (c.speed > 0 ? 1 : -1);
    var nx = c.x + Math.cos(c.angle) * c.speed * dt;
    var ny = c.y + Math.sin(c.angle) * c.speed * dt;
    if (!collidesRect(nx, ny, 16)) { c.x = nx; c.y = ny; }
    p.x = c.x; p.y = c.y; p.angle = c.angle;
    if (G.keys['e']) exitCar();
  } else {
    var mv2 = moveVector();
    if (mv2.m > 0.1) {
      var sp = (panicActive() ? 60 : 150) * dt;
      var nx2 = p.x + mv2.x * sp, ny2 = p.y + mv2.y * sp;
      if (!collidesRect(nx2, ny2, 12)) { p.x = nx2; p.y = ny2; }
      p.angle = Math.atan2(mv2.x, mv2.y);
    }
  }
  // passanti (con stordimento fionda)
  G.npcs.forEach(function (n) {
    if (n.knock > 0) {
      n.knock -= dt;
      n.x += Math.cos(n.kdir) * 160 * dt;
      n.y += Math.sin(n.kdir) * 160 * dt;
    } else {
      n.x += Math.cos(n.a) * n.v * dt;
      n.y += Math.sin(n.a) * n.v * dt;
      if (Math.random() < 0.003) n.a = Math.random() * 6.28;
      if (collidesRect(n.x, n.y, 8)) n.a += Math.PI;
    }
  });
  updatePolice(dt);
  updateShots(dt);
  if (G.weapon.cd > 0) G.weapon.cd -= dt;
}

function updatePolice(dt) {
  var p = G.player;
  if (G.wanted <= 0) { G.police = []; return; }
  if (!G.police.length) {
    G.police.push({ x: DATA.POLICE.x, y: DATA.POLICE.y, a: 0, v: 0, slow: 0 });
  }
  G.police.forEach(function (cop) {
    if (cop.slow > 0) cop.slow -= dt;
    var dx = p.x - cop.x, dy = p.y - cop.y, d = Math.hypot(dx, dy);
    cop.a = Math.atan2(dx, dy);
    var maxV = cop.slow > 0 ? 110 : 240;
    cop.v = Math.min(maxV, cop.v + 60 * dt);
    var sp = Math.min(cop.v, d) * dt;
    var nx = cop.x + Math.cos(cop.a) * sp, ny = cop.y + Math.sin(cop.a) * sp;
    if (!collidesRect(nx, ny, 16)) { cop.x = nx; cop.y = ny; }
    if (d < 46 && (p.inCar ? p.inCar.speed < 30 : true)) bust();
  });
  var far = Math.hypot(p.x - DATA.POLICE.x, p.y - DATA.POLICE.y);
  if (far > 3000 && Math.random() < 0.002) { G.wanted = Math.max(0, G.wanted - 1); hud(); }
}
function bust() {
  G.wanted = 0; G.police = [];
  G.money = Math.max(0, G.money - 100);
  addAnxiety(25);
  G.shake = 1.2;
  toast('🚨 Preso! Multa: €100. L\'ansia ringrazia.');
  var h = homeSpawn();
  G.player.x = h.x; G.player.y = h.y;
  if (G.player.inCar) { G.player.inCar = null; }
  hud();
}

// ══════════ LAVORI ══════════
function randomDropoff() {
  var spots = [
    [-900, -500], [1500, 400], [-400, 1800], [1300, -1300],
    [-2000, 700], [500, -500], [-1300, 1600], [2000, -500],
    [-300, -2000], [1200, 2000], [-2200, -1200], [2200, 1500],
    [300, 2300], [-1600, -2200]
  ];
  return spots[Math.floor(Math.random() * spots.length)];
}
function startPizzaJob(count, final) {
  if (G.job) return;
  G.job = { kind: 'pizza', left: count, final: !!final, target: randomDropoff(), timer: 45 };
  toast('🍕 Prendi le pizze! Consegna al punto rosso entro ' + G.job.timer + 's.');
  hud();
}
function startTaxiJob(count) {
  if (G.job) return;
  G.job = { kind: 'taxi', left: count, target: randomDropoff(), timer: 40 };
  toast('🚕 Passeggero a bordo! Destinazione segnata. ' + G.job.timer + 's.');
  hud();
}
function jobTarget() {
  if (!G.job) return null;
  return { x: G.job.target[0], y: G.job.target[1] };
}
function updateJob(dt) {
  if (!G.job) return;
  var p = G.player;
  var t = jobTarget();
  G.job.timer -= dt;
  if (G.job.timer <= 0) {
    toast('⏰ Tempo scaduto! Il lavoro... ti giudica.');
    addAnxiety(15);
    failJob();
    return;
  }
  var d = Math.hypot(p.x - t.x, p.y - t.y);
  if (d < 55) {
    G.job.left--;
    if (G.job.left <= 0) {
      var pay = G.job.kind === 'pizza' ? DATA.PAY.pizza : DATA.PAY.taxi;
      var bonus = (G.job.timer > 10) ? (G.job.kind === 'pizza' ? DATA.PAY.pizzaBonus : DATA.PAY.taxiBonus) : 0;
      G.money += pay + bonus;
      addAnxiety(-5);
      toast('✅ Consegna! +€' + (pay + bonus) + (bonus ? ' (puntualità)' : ''));
      hud();
      if (G.job.final) { finishLastJob(); return; }
      failJob();
      return;
    }
    G.job.target = randomDropoff();
    G.job.timer = Math.max(25, G.job.timer);
    hud();
  }
}
function failJob() {
  var kind = G.job ? G.job.kind : null;
  G.job = null;
  hud();
  if (kind === 'pizza' && G.stage === 3 && !G.ownsPizza) toast('Torna in pizzeria per riprovare.');
  if (kind === 'taxi' && G.stage === 4) toast('Torna al taxi per un\'altra corsa.');
}
function finishLastJob() {
  G.job = null;
  showDialogue(DATA.STORY[9].dialogo, startFinale);
}
function buyPizzeria() {
  if (G.ownsPizza) { toast('La pizzeria è tua!'); return; }
  if (G.money < DATA.COSTS.pizzaShop) { toast('Ti servono €' + DATA.COSTS.pizzaShop + ' — fai consegne!'); return; }
  G.money -= DATA.COSTS.pizzaShop;
  G.ownsPizza = true;
  showDialogue(DATA.STORY[8].dialogo, function () { G.stage = 9; hud(); toast('🍕 Congratulazioni, titolare! Ora la consegna numero 1000.'); });
}

// ══════════ FINALE ══════════
function startFinale() {
  G.over = true;
  G.paused = false;
  $('dlg').classList.remove('on');
  var box = $('finaleBox'), list = $('finaleText');
  box.classList.remove('hidden');
  list.innerHTML = '';
  DATA.FINALE.forEach(function (line) {
    var p = document.createElement('p');
    p.textContent = line;
    list.appendChild(p);
  });
  hud();
}
function restartGame() {
  G.stage = 0; G.money = 80; G.wanted = 0; G.over = false; G.paused = false;
  G.evidence = false; G.ownsPizza = false; G.job = null; G.minigame = null;
  G.side = null; G.sideDone = 0;
  G.weapon.slot = 0; G.weapon.cd = 0;
  DATA.WEAPONS.forEach(function (w) { w.owned = w.id === 'fionda'; });
  var h = homeSpawn();
  G.player.x = h.x; G.player.y = h.y; G.player.inCar = null; G.player.anxiety = 40;
  G.chillT = 0;
  G.traffic = []; G.trafficT = 0;
  G.eventT = 30; G.eventCd = 0;
  G.collectibles = [];
  G.interior = null;
  initCollectibles();
  $('finaleBox').classList.add('hidden');
  $('menuOverlay').classList.remove('open');
  hud();
  toast('Nuova vita. Stessa città.');
}

// ══════════ MENU ══════════
function toggleMenu() {
  if (G.over) return;
  G.paused = !G.paused;
  $('menuOverlay').classList.toggle('open', G.paused);
}
function toggleMusic() {
  G.music = !G.music;
  $('musicBtn').textContent = G.music ? '🎵' : '🔇';
  toast(G.music ? '🎵 Musica interna attiva. Vibra.' : '🔇 Silenzio. Anche l\'ansia si riposa.');
  hud();
}
function exitGame() {
  try {
    if (window.history && window.history.length > 1) window.history.back();
    else window.location.href = '../index.html#games';
  } catch (e) { window.location.href = '../index.html#games'; }
}

// ══════════ MINIGIOCHI ══════════
var cashier = null;
function startCashier() {
  G.minigame = 'cashier';
  cashier = { client: 0, heart: 3, order: [], picked: [] };
  nextCashierClient();
  $('cashierBox').classList.remove('hidden');
  $('miniTitle').textContent = '🏪 Turno di cassa';
}
function nextCashierClient() {
  cashier.client++;
  if (cashier.client > DATA.SHIFT_LEN) { endCashier(); return; }
  var items = DATA.CASHIER_ITEMS.slice();
  var order = [];
  for (var i = 0; i < 3; i++) order.push(items.splice(Math.floor(Math.random() * items.length), 1)[0]);
  cashier.order = order;
  cashier.picked = [];
  renderCashier();
}
function renderCashier() {
  $('cashierClient').textContent = 'Cliente ' + cashier.client + '/' + DATA.SHIFT_LEN + ' · ❤️ ' + cashier.heart;
  $('cashierOrder').innerHTML = cashier.order.map(function (o) { return '<span class="ci">' + o.emoji + '</span>'; }).join('');
  $('cashierPicked').innerHTML = cashier.picked.map(function (o) { return '<span class="ci">' + o.emoji + '</span>'; }).join('');
  $('cashierItems').innerHTML = '';
  DATA.CASHIER_ITEMS.forEach(function (it, i) {
    var b = document.createElement('button');
    b.className = 'shopItem';
    b.textContent = it.emoji + ' ' + it.name + ' (€' + it.price + ')';
    b.onclick = function () { pickItem(i); };
    $('cashierItems').appendChild(b);
  });
}
function pickItem(idx) {
  var it = DATA.CASHIER_ITEMS[idx];
  if (cashier.picked.indexOf(it) >= 0) return;
  cashier.picked.push(it);
  renderCashier();
}
function confirmOrder() {
  var ok = cashier.picked.length === cashier.order.length &&
    cashier.order.every(function (o) { return cashier.picked.indexOf(o) >= 0; });
  if (ok) {
    toast('✅ Cliente servito!');
    nextCashierClient();
  } else {
    cashier.heart--;
    addAnxiety(10);
    toast('❌ Ordine sbagliato. Il cliente sbuffa. -1 ❤️');
    cashier.picked = [];
    renderCashier();
    if (cashier.heart <= 0) { endCashier(true); }
  }
}
function endCashier(fail) {
  G.minigame = null;
  $('cashierBox').classList.add('hidden');
  if (fail) { toast('🏪 Turno finito male. Il capo ti guarda male.'); addAnxiety(10); }
  else {
    G.money += DATA.PAY.cashier;
    toast('🏪 Turno finito! +€' + DATA.PAY.cashier);
    hud();
    if (G.stage === 1) nextStage();
  }
}
$('cashierOk').addEventListener('click', confirmOrder);

// --- pacchi (side quest Agente Conti) ---
var pacchi = null;
function startPacchiMinigame() {
  G.minigame = 'pacchi';
  pacchi = { done: 0, cur: null, wrong: 0 };
  $('pacchiBox').classList.remove('hidden');
  nextPacco();
}
function nextPacco() {
  var n = Math.floor(Math.random() * 5) + 1;
  pacchi.cur = n;
  $('pacchiCall').textContent = '📢 Pacco numero ' + n + '!';
  renderPacchi();
}
function renderPacchi() {
  $('pacchiList').innerHTML = '';
  var names = ['SPEDIZIONE', 'ANNULLATO', 'RITIRATO', 'IN VIAGGIO', 'CONSEGNATO'];
  for (var i = 0; i < 5; i++) {
    var b = document.createElement('button');
    b.className = 'shopItem';
    b.textContent = '📦 ' + (i + 1) + ' · ' + names[i];
    b.onclick = function (idx) { return function () { pickPacco(idx + 1); }; }(i);
    $('pacchiList').appendChild(b);
  }
}
function pickPacco(n) {
  if (n === pacchi.cur) {
    pacchi.done++;
    toast('✅ Pacco ' + n + ' smistato!');
    if (pacchi.done >= 5) { endPacchi(); return; }
    nextPacco();
  } else {
    pacchi.wrong++;
    addAnxiety(8);
    toast('❌ Non era il pacco ' + n + '!');
  }
}
function endPacchi() {
  G.minigame = null;
  $('pacchiBox').classList.add('hidden');
  completeSide('pacchi');
}
$('pacchiClose').addEventListener('click', function () {
  if (G.minigame === 'pacchi') {
    G.minigame = null;
    $('pacchiBox').classList.add('hidden');
    G.side = null;
    toast('Hai mollato la fila. Anche questo è legittimo.');
  }
});

// --- arcade ---
var arc = null;
function startArcade() {
  if (G.money < 2) { toast('L\'arcade costa €2.'); return; }
  G.money -= 2;
  hud();
  G.minigame = 'arcade';
  arc = { snake: [{ x: 8, y: 8 }], dir: { x: 1, y: 0 }, food: null, score: 0, t: 0, dead: false, key: { x: 1, y: 0 } };
  placeFood();
  $('arcadeBox').classList.remove('hidden');
}
function placeFood() {
  do { arc.food = { x: Math.floor(Math.random() * DATA.ARCADE.grid), y: Math.floor(Math.random() * DATA.ARCADE.grid) }; }
  while (arc.snake.some(function (s) { return s.x === arc.food.x && s.y === arc.food.y; }));
}
function updateArcade(dt) {
  if (G.minigame !== 'arcade' || !arc || arc.dead) return;
  arc.t += dt;
  var interval = 1 / DATA.ARCADE.speed;
  if (arc.t >= interval) {
    arc.t -= interval;
    arc.dir = { x: arc.key.x, y: arc.key.y };
    var head = { x: arc.snake[0].x + arc.dir.x, y: arc.snake[0].y + arc.dir.y };
    var hitWall = head.x < 0 || head.y < 0 || head.x >= DATA.ARCADE.grid || head.y >= DATA.ARCADE.grid;
    var hitSelf = arc.snake.some(function (s) { return s.x === head.x && s.y === head.y; });
    if (hitWall || hitSelf) { arc.dead = true; endArcade(true); return; }
    arc.snake.unshift(head);
    if (head.x === arc.food.x && head.y === arc.food.y) { arc.score++; placeFood(); }
    else arc.snake.pop();
    renderArcade();
  }
}
function renderArcade() {
  if (!arc) return;
  var c2 = $('arcadeC').getContext('2d');
  var g = DATA.ARCADE.grid, cs = DATA.ARCADE.cell;
  c2.setTransform(1, 0, 0, 1, 0, 0);
  c2.clearRect(0, 0, g * cs, g * cs);
  c2.fillStyle = '#0f172a';
  c2.fillRect(0, 0, g * cs, g * cs);
  arc.snake.forEach(function (s, i) {
    c2.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
    c2.fillRect(s.x * cs + 1, s.y * cs + 1, cs - 2, cs - 2);
  });
  c2.fillStyle = '#f87171';
  c2.fillRect(arc.food.x * cs + 2, arc.food.y * cs + 2, cs - 4, cs - 4);
  $('arcadeScore').textContent = 'Punti: ' + arc.score;
}
function endArcade(fail) {
  G.minigame = null;
  $('arcadeBox').classList.add('hidden');
  var win = arc && !fail ? arc.score : 0;
  if (win > 0) { G.money += win * DATA.PAY.arcade; toast('🎮 Partita: +€' + win * DATA.PAY.arcade); hud(); }
  else toast('🎮 Game over. La sconfitta è temporanea. (Anche questa.)');
  arc = null;
}
window.addEventListener('keydown', function (e) {
  if (G.minigame !== 'arcade' || !arc) return;
  var k = e.key.toLowerCase();
  if (k === 'arrowup' || k === 'w') { arc.key = { x: 0, y: -1 }; }
  if (k === 'arrowdown' || k === 's') { arc.key = { x: 0, y: 1 }; }
  if (k === 'arrowleft' || k === 'a') { arc.key = { x: -1, y: 0 }; }
  if (k === 'arrowright' || k === 'd') { arc.key = { x: 1, y: 0 }; }
});

// --- corsa clandestina ---
var race = null;
function startRace() {
  G.minigame = 'race';
  race = { lap: 0, cp: 0, t: 0, checkpoints: [] };
  for (var i = 0; i < DATA.RACE.check; i++) {
    var a = i / DATA.RACE.check * Math.PI * 2;
    race.checkpoints.push({ x: Math.cos(a) * DATA.RACE.radius, y: Math.sin(a) * DATA.RACE.radius });
  }
  $('raceBox').classList.remove('hidden');
  toast('🏁 Corsa! Tocca i ' + DATA.RACE.check + ' checkpoint, ' + DATA.RACE.laps + ' giri.');
}
function updateRace(dt) {
  if (G.minigame !== 'race' || !race) return;
  race.t += dt;
  var p = G.player;
  var cp = race.checkpoints[race.cp];
  if (Math.hypot(p.x - cp.x, p.y - cp.y) < 70) {
    race.cp++;
    if (race.cp >= race.checkpoints.length) {
      race.cp = 0; race.lap++;
      if (race.lap >= DATA.RACE.laps) {
        var prize = DATA.PAY.raceBase + Math.max(0, Math.round(140 - race.t * 2));
        G.money += prize;
        toast('🏁 ARRIVATO! +€' + prize + ' (' + Math.round(race.t) + 's)');
        hud();
        endRace();
        return;
      }
      toast('🏁 Giro ' + (race.lap + 1) + '/' + DATA.RACE.laps);
    }
  }
  $('raceInfo').textContent = 'Giro ' + (race.lap + 1) + '/' + DATA.RACE.laps + ' · Checkpoint ' + (race.cp + 1) + '/' + DATA.RACE.check + ' · ' + Math.round(race.t) + 's';
}
function endRace() {
  G.minigame = null; race = null;
  $('raceBox').classList.add('hidden');
}

// --- boxe (arena) ---
var boxing = null;
function startBoxing() {
  G.minigame = 'boxing';
  boxing = { hp: 100, enemyHp: 80, round: 1, maxRounds: 3, score: 0, combo: 0, t: 0, enemyCd: 0, playerCd: 0 };
  $('boxingBox').classList.remove('hidden');
  renderBoxing();
  toast('🥊 Round 1! Colpisci con SPAZIO o clicca!');
}
function renderBoxing() {
  if (!boxing) return;
  $('boxingHP').textContent = '❤️ ' + boxing.hp + '%';
  $('boxingEnemyHP').textContent = '💀 Avversario: ' + boxing.enemyHp + '%';
  $('boxingScore').textContent = 'Punti: ' + boxing.score + ' · Combo: x' + boxing.combo + ' · Round: ' + boxing.round + '/' + boxing.maxRounds;
  $('boxingBarHP').style.width = boxing.hp + '%';
  $('boxingBarHP').style.background = boxing.hp > 60 ? '#38a169' : boxing.hp > 30 ? '#ed8936' : '#e53e3e';
  $('boxingBarEnemy').style.width = boxing.enemyHp + '%';
}
function updateBoxing(dt) {
  if (G.minigame !== 'boxing' || !boxing) return;
  boxing.t += dt;
  boxing.playerCd = Math.max(0, boxing.playerCd - dt);
  boxing.enemyCd = Math.max(0, boxing.enemyCd - dt);
  // avversario colpisce
  if (boxing.enemyCd <= 0) {
    var dmg = 8 + Math.random() * 7;
    boxing.hp = Math.max(0, boxing.hp - dmg);
    boxing.enemyCd = 0.8 + Math.random() * 0.6;
    boxing.combo = 0;
    G.shake = 0.3;
    renderBoxing();
    if (boxing.hp <= 0) { endBoxing(false); return; }
  }
  // round successivo
  if (boxing.enemyHp <= 0) {
    if (boxing.round >= boxing.maxRounds) { endBoxing(true); return; }
    boxing.round++;
    boxing.enemyHp = 60 + boxing.round * 15;
    boxing.score += 50;
    toast('🥊 Round ' + boxing.round + '! Avversario più forte!');
    renderBoxing();
  }
}
function boxingPunch() {
  if (!boxing || boxing.playerCd > 0) return;
  var dmg = 10 + Math.random() * 10;
  boxing.combo++;
  if (boxing.combo > 2) dmg += boxing.combo * 2;
  boxing.enemyHp = Math.max(0, boxing.enemyHp - dmg);
  boxing.score += 10 + boxing.combo * 2;
  boxing.playerCd = 0.35;
  G.shake = 0.2;
  renderBoxing();
}
function endBoxing(win) {
  G.minigame = null;
  $('boxingBox').classList.add('hidden');
  if (win) {
    var prize = 20 + boxing.score;
    G.money += prize;
    addAnxiety(-10);
    toast('🏆 Vittoria! +€' + prize + ' (+ ' + boxing.score + ' punti)');
  } else {
    addAnxiety(10);
    toast('🥊 Sconfitta! Ma hai guadagnato rispetto. L\'ansia sale di 10.');
  }
  boxing = null;
  hud();
}
window.addEventListener('keydown', function (e) {
  if (G.minigame === 'boxing' && e.key === ' ') { e.preventDefault(); boxingPunch(); }
});

// ══════════ EVENTI RANDOM ══════════
function randomEvents(dt) {
  G.npcLineT -= dt;
  if (G.npcLineT <= 0) {
    G.npcLineT = 25 + Math.random() * 30;
    var near = G.npcs.some(function (n) { return Math.hypot(n.x - G.player.x, n.y - G.player.y) < 130; });
    if (near) toast('💬 ' + DATA.NPC_LINES[Math.floor(Math.random() * DATA.NPC_LINES.length)], 3000);
  }
  G.rentT -= dt;
  if (G.rentT <= 0) {
    G.rentT = 120 + Math.random() * 90;
    if (G.money >= DATA.COSTS.affitto) {
      G.money -= DATA.COSTS.affitto;
      addAnxiety(5);
      toast('📄 Affitto pagato: -€' + DATA.COSTS.affitto + '. La città ringrazia.');
    } else {
      addAnxiety(15);
      toast('📄 Affitto SCADUTO. L\'ansia sale di 15. Trova lavoro!');
    }
    hud();
  }
}

// ══════════ CHILL / MUSICA ══════════
function updateChill(dt) {
  if (G.chillT > 0) {
    G.chillT -= dt;
    addAnxiety(-4 * dt);
    hud();
  }
  if (G.music && Math.random() < 0.004) addAnxiety(-1);
}

// ══════════ RENDER ══════════
function render() {
  // se dentro un edificio, renderizza l'interno
  if (renderInterior()) {
    if (G.photoFlash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,' + G.photoFlash + ')';
      ctx.fillRect(0, 0, W, H);
      G.photoFlash = Math.max(0, G.photoFlash - 0.08);
    }
    return;
  }
  ctx.fillStyle = '#dfe7ef';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(ZOOM, ZOOM);
  ctx.translate(-G.camera.x, -G.camera.y);
  if (G.shake > 0.02) { ctx.translate((Math.random() - 0.5) * 14 * G.shake, (Math.random() - 0.5) * 14 * G.shake); G.shake *= 0.9; }

  ctx.fillStyle = '#c9d8c0';
  ctx.fillRect(-DATA.WORLD / 2 - 40, -DATA.WORLD / 2 - 40, DATA.WORLD + 80, DATA.WORLD + 80);

  roads.forEach(function (r) {
    ctx.fillStyle = '#eef1f5';
    ctx.fillRect(r.x, r.y, r.w, r.h);
  });
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 14]);
  for (var i = 0; i <= DATA.GRID; i++) {
    var sx = -DATA.WORLD / 2 + i * DATA.CELL + DATA.ROAD / 2;
    ctx.beginPath(); ctx.moveTo(sx, -DATA.WORLD / 2); ctx.lineTo(sx, DATA.WORLD / 2); ctx.stroke();
    var sy = -DATA.WORLD / 2 + i * DATA.CELL + DATA.ROAD / 2;
    ctx.beginPath(); ctx.moveTo(-DATA.WORLD / 2, sy); ctx.lineTo(DATA.WORLD / 2, sy); ctx.stroke();
  }
  ctx.setLineDash([]);

  // parco
  var park = buildingById('parco');
  ctx.fillStyle = '#9ae6b4';
  ctx.fillRect(park.x, park.y, park.w, park.h);
  ctx.fillStyle = '#68d391';
  [[park.x + 120, park.y + 60], [park.x + 260, park.y + 120], [park.x + 60, park.y + 160], [park.x + 340, park.y + 40]].forEach(function (t) {
    ctx.beginPath(); ctx.arc(t[0], t[1], 14, 0, 6.28); ctx.fill();
  });
  // panchina
  ctx.fillStyle = '#8b5a2b';
  roundRect(ctx, G.bench.x - 20, G.bench.y - 6, 40, 12, 4); ctx.fill();

  // edifici
  buildings.forEach(function (b) {
    if (b.id === 'parco') return;
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(b.x + 6, b.y + 6, b.w, b.h);
    ctx.fillStyle = b.color;
    roundRect(ctx, b.x, b.y, b.w, b.h, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = '26px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.emoji, b.cx, b.cy - 10);
    ctx.font = 'bold 11px system-ui';
    ctx.fillStyle = '#1f2937';
    ctx.fillText(b.name, b.cx, b.cy + 18);
  });

  // cartelloni
  billboards.forEach(function (bb) {
    ctx.fillStyle = '#111827';
    roundRect(ctx, bb.x - 130, bb.y - 14, 260, 30, 8);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bb.text, bb.x, bb.y + 1);
  });

  // moto
  var mt = DATA.MOTO;
  ctx.fillStyle = '#374151';
  roundRect(ctx, mt.x - 14, mt.y - 8, 28, 16, 6);
  ctx.fill();
  ctx.fillStyle = '#e53e3e';
  ctx.beginPath(); ctx.arc(mt.x, mt.y - 4, 6, 0, 6.28); ctx.fill();
  if (G.stage === 2) {
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🏍️', mt.x, mt.y - 26);
  }

  // anello (side quest)
  if (G.side && G.side.id === 'anello') {
    G.ring.forEach(function (r) {
      if (r.found) return;
      var puls = 0.5 + 0.5 * Math.sin(performance.now() / 250 + r.x);
      ctx.globalAlpha = 0.5 + puls * 0.5;
      ctx.fillStyle = r.has ? '#f59e0b' : '#a8a29e';
      ctx.beginPath(); ctx.arc(r.x, r.y, 8, 0, 6.28); ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  // auto parcheggiate
  G.cars.forEach(function (c) {
    if (c === G.player.inCar) return;
    drawCar(c.x, c.y, c.angle, c.model, c.color);
  });
  // polizia
  G.police.forEach(function (cop) { drawCar(cop.x, cop.y, cop.a, 'police', '#1d4ed8'); });

  // traffico in movimento
  G.traffic.forEach(function (c) {
    drawCar(c.x, c.y, c.angle, c.model, c.color);
  });

  // collezionabili (oggetti da trovare)
  G.collectibles.forEach(function (col) {
    if (col.found) return;
    if (G.side && G.side.id === col.type) {
      var info = DATA.COLLECTIBLES[col.type];
      var puls = 0.5 + 0.5 * Math.sin(performance.now() / 300 + col.x * 0.1);
      ctx.globalAlpha = 0.6 + puls * 0.4;
      ctx.fillStyle = info.color;
      ctx.beginPath(); ctx.arc(col.x, col.y, 10, 0, 6.28); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.font = '14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(info.emoji, col.x, col.y - 14);
      ctx.globalAlpha = 1;
    }
  });

  // personaggi con nome
  G.chars.forEach(function (ch) {
    ctx.fillStyle = ch.color;
    ctx.beginPath(); ctx.arc(ch.x, ch.y, 9, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = '12px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(ch.emoji, ch.x, ch.y - 16);
  });

  // passanti
  G.npcs.forEach(function (n) {
    var baseColor = n.npcColor || '#64748b';
    ctx.fillStyle = n.knock > 0 ? '#fbbf24' : baseColor;
    ctx.beginPath(); ctx.arc(n.x, n.y, 6, 0, 6.28); ctx.fill();
    // tipo NPC (piccolo indicatore)
    if (n.npcType && n.npcType !== 'normal' && n.npcType !== 'worker') {
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(n.npcEmoji, n.x, n.y - 10);
    }
  });

  // proiettili con scia
  G.shots.forEach(function (s) {
    var col = s.type === 'acqua' ? '#38bdf8' : '#f59e0b';
    // scia
    ctx.globalAlpha = 0.3;
    for (var t = 1; t <= 3; t++) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(s.x - Math.cos(s.a) * t * 4, s.y - Math.sin(s.a) * t * 4, 3 - t * 0.5, 0, 6.28);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // nucleo
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 5, 0, 6.28);
    ctx.fill();
    // alone luminoso
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 9, 0, 6.28);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  // effetti attacco (flash, slash)
  attackFx.forEach(function (fx) {
    var alpha = fx.timer / 12;
    ctx.globalAlpha = alpha;
    if (fx.type === 'muzzle') {
      ctx.fillStyle = fx.color;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 8 * (1 - alpha) + 4, 0, 6.28);
      ctx.fill();
    } else if (fx.type === 'slash') {
      ctx.strokeStyle = fx.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 20 * (1 - alpha) + 5, 0, Math.PI * 0.8);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  attackFx.forEach(function (fx) { fx.timer--; });
  attackFx = attackFx.filter(function (fx) { return fx.timer > 0; });

  // destinazione lavoro
  if (G.job) {
    var t = jobTarget();
    ctx.fillStyle = 'rgba(239,68,68,0.25)';
    ctx.beginPath(); ctx.arc(t.x, t.y, 30 + Math.sin(performance.now() / 300) * 6, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.stroke();
    ctx.font = 'bold 16px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('📍', t.x, t.y);
  }

  drawPlayer();

  if (G.minigame === 'race' && race) {
    race.checkpoints.forEach(function (cp, i) {
      ctx.fillStyle = i === race.cp ? '#38bdf8' : 'rgba(56,189,248,0.4)';
      ctx.beginPath(); ctx.arc(cp.x, cp.y, 22, 0, 6.28); ctx.fill();
      ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 3; ctx.stroke();
    });
  }

  ctx.restore();

  if (G.photoFlash > 0) {
    ctx.fillStyle = 'rgba(255,255,255,' + G.photoFlash + ')';
    ctx.fillRect(0, 0, W, H);
    G.photoFlash = Math.max(0, G.photoFlash - 0.08);
  }
  var anx = G.player.anxiety;
  if (anx > 60) {
    ctx.fillStyle = 'rgba(220,38,38,' + (anx - 60) / 100 * 0.22 + ')';
    ctx.fillRect(0, 0, W, H);
  }
}
function drawCar(x, y, a, model, color) {
  var m = DATA.CAR_MODELS[model] || DATA.CAR_MODELS.berlina;
  var w = m.w, h = m.h;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  // ombra
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  roundRect(ctx, -w / 2 + 3, -h / 2 + 3, w, h, 6); ctx.fill();
  // corpo
  ctx.fillStyle = color;
  roundRect(ctx, -w / 2, -h / 2, w, h, Math.min(6, h / 2));
  ctx.fill();
  // fascia inferiore
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  roundRect(ctx, -w / 2, h / 2 - 4, w, 4, 2); ctx.fill();
  // vetri
  ctx.fillStyle = 'rgba(224,242,254,0.85)';
  var gw = w * 0.32, gx = -gw / 2 - 2;
  roundRect(ctx, gx, -h / 2 + 2, gw, h - 4, 3); ctx.fill();
  // sportiva: alettone
  if (m.spoiler) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    roundRect(ctx, -w / 2 - 2, -h / 2 - 2, 6, h + 4, 2); ctx.fill();
  }
  // SUV: barre sul tetto
  if (m.roof) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    roundRect(ctx, -6, -h / 2 - 1, 12, 3, 2); ctx.fill();
  }
  // furgone: portellone
  if (m.box) {
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
  }
  // fari anteriori (+x)
  ctx.fillStyle = '#fff';
  roundRect(ctx, w / 2 - 2, -h / 2 + 3, 3, 4, 1); ctx.fill();
  roundRect(ctx, w / 2 - 2, h / 2 - 7, 3, 4, 1); ctx.fill();
  // luci posteriori
  ctx.fillStyle = '#ef4444';
  roundRect(ctx, -w / 2 - 1, -h / 2 + 3, 3, 4, 1); ctx.fill();
  roundRect(ctx, -w / 2 - 1, h / 2 - 7, 3, 4, 1); ctx.fill();
  // taxi: insegna sul tetto
  if (model === 'taxi') {
    ctx.fillStyle = '#111';
    roundRect(ctx, -5, -h / 2 - 5, 10, 5, 2); ctx.fill();
    ctx.fillStyle = '#f6e05e';
    ctx.font = 'bold 6px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TAXI', 0, -h / 2 - 2);
  }
  // polizia: lampeggianti
  if (model === 'police') {
    var blink = Math.sin(performance.now() / 120) > 0;
    ctx.fillStyle = blink ? '#3b82f6' : '#ef4444';
    roundRect(ctx, -6, -h / 2 - 4, 5, 4, 2); ctx.fill();
    ctx.fillStyle = blink ? '#ef4444' : '#3b82f6';
    roundRect(ctx, 1, -h / 2 - 4, 5, 4, 2); ctx.fill();
  }
  // pickup: cassone posteriore
  if (m.truck) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    roundRect(ctx, -w / 2 + 2, -h / 2 + 2, w * 0.4, h - 4, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-w / 2 + 3, -h / 2 + 3, w * 0.4 - 2, h - 6);
  }
  // moto/bici: cmdline centrale
  if (m.bike) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(-w / 2 + 2, -1, w - 4, 2);
    // ruote
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath(); ctx.arc(-w / 2 + 4, 0, 3, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.arc(w / 2 - 4, 0, 3, 0, 6.28); ctx.fill();
    // manubrio
    ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(w / 2 - 6, -4); ctx.lineTo(w / 2 - 2, -4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2 - 6, 4); ctx.lineTo(w / 2 - 2, 4); ctx.stroke();
  }
  // ruote
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  [[-w / 2 + 6, -h / 2 + 3], [-w / 2 + 6, h / 2 - 3], [w / 2 - 6, -h / 2 + 3], [w / 2 - 6, h / 2 - 3]].forEach(function (wh) {
    ctx.beginPath(); ctx.arc(wh[0], wh[1], 3, 0, 6.28); ctx.fill();
  });
  ctx.restore();
}
function drawPlayer() {
  var p = G.player;
  if (p.inCar) {
    drawCar(p.inCar.x, p.inCar.y, p.inCar.angle, p.inCar.model, p.inCar.stolen ? '#7c2d12' : p.inCar.color);
    return;
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.arc(0, 2, 12, 0, 6.28); ctx.fill();
  var bodyColor = panicActive() ? '#e53e3e' : '#3b82f6';
  ctx.fillStyle = bodyColor;
  ctx.beginPath(); ctx.arc(0, 0, 11, 0, 6.28); ctx.fill();
  ctx.fillStyle = '#fcd9b8';
  ctx.beginPath(); ctx.arc(0, -3, 6, 0, 6.28); ctx.fill();
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.sin(p.angle) * 10, Math.cos(p.angle) * 10);
  ctx.stroke();
  ctx.restore();
  var a = nearestInteractable();
  if (a && !G.dialogue && !G.minigame && !G.paused) {
    var lbl = interactLabel(a);
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    roundRect(ctx, p.x - 80, p.y - 48, 160, 22, 8); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(lbl, p.x, p.y - 33);
  }
}
function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

// ══════════ LOOP ══════════
function update(dt) {
  if (G.paused || G.over) return;
  G.camera.x += (G.player.x - G.camera.x) * Math.min(1, 6 * dt);
  G.camera.y += (G.player.y - G.camera.y) * Math.min(1, 6 * dt);

  if (G.interior) {
    updateInterior(dt);
    return;
  }
  if (G.minigame === 'arcade') { updateArcade(dt); return; }
  if (G.minigame === 'race') { updateRace(dt); updateCars(dt); return; }
  if (G.minigame === 'boxing') { updateBoxing(dt); return; }

  updateCars(dt);
  autoFireWeapon(dt);
  updateJob(dt);
  updateChill(dt);
  randomEvents(dt);
  updateTraffic(dt);
  updateNPCReactions(dt);
  G.eventT -= dt;
  if (G.eventT <= 0) {
    G.eventT = 45 + Math.random() * 60;
    triggerDynamicEvent();
  }
  hud();
}
function loop(t) {
  var dt = G.lastT ? Math.min((t - G.lastT) / 1000, 0.05) : 0;
  G.lastT = t;
  ZOOM += (targetZoom - ZOOM) * Math.min(1, 8 * dt);
  update(dt);
  render();
  renderMinimap();
  requestAnimationFrame(loop);
}


// ══════════ MINIMAPPA ══════════
var mm = $('minimap');
var mmCtx = mm.getContext('2d');
var MM = 130;
function renderMinimap() {
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (mm.width !== Math.round(MM * dpr)) { mm.width = Math.round(MM * dpr); mm.height = Math.round(MM * dpr); }
  mmCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mmCtx.clearRect(0, 0, MM, MM);

  // se dentro un edificio, mostra la minimappa dell'interno
  if (G.interior) {
    var d = G.interior.data;
    var f = MM / Math.max(d.w, d.h);
    mmCtx.fillStyle = d.bg;
    mmCtx.fillRect(0, 0, MM, MM);
    // muri
    mmCtx.fillStyle = '#4a5568';
    mmCtx.fillRect(0, 0, MM, 2);
    mmCtx.fillRect(0, MM - 2, MM, 2);
    mmCtx.fillRect(0, 0, 2, MM);
    mmCtx.fillRect(MM - 2, 0, 2, MM);
    // items
    d.items.forEach(function (it) {
      mmCtx.fillStyle = it.color;
      mmCtx.fillRect(it.x * f, it.y * f, Math.max(2, it.w * f), Math.max(2, it.h * f));
    });
    // porta
    mmCtx.fillStyle = '#e74c3c';
    mmCtx.beginPath(); mmCtx.arc(d.exit.x * f, d.exit.y * f, 3, 0, 6.28); mmCtx.fill();
    // giocatore
    mmCtx.fillStyle = '#3b82f6';
    mmCtx.beginPath(); mmCtx.arc(G.player.x * f, G.player.y * f, 3, 0, 6.28); mmCtx.fill();
    return;
  }

  var f2 = MM / DATA.WORLD;
  var tx = function (wx) { return (wx + DATA.WORLD / 2) * f2; };
  var ty = function (wy) { return (wy + DATA.WORLD / 2) * f2; };
  // prato
  mmCtx.fillStyle = '#a7c896';
  mmCtx.fillRect(0, 0, MM, MM);
  // strade
  var rw = Math.max(2, DATA.ROAD * f2);
  mmCtx.fillStyle = '#e8ecf1';
  var i;
  for (i = 0; i <= DATA.GRID; i++) {
    var cx = (i * DATA.CELL + DATA.ROAD / 2) * f2;
    mmCtx.fillRect(cx - rw / 2, 0, rw, MM);
    var cy = (i * DATA.CELL + DATA.ROAD / 2) * f2;
    mmCtx.fillRect(0, cy - rw / 2, MM, rw);
  }
  // edifici e parco
  buildings.forEach(function (b) {
    mmCtx.fillStyle = b.kind === 'park' ? '#9ae6b4' : b.color;
    mmCtx.fillRect(tx(b.x), ty(b.y), Math.max(2, b.w * f2), Math.max(2, b.h * f2));
  });
  // destinazione lavoro
  if (G.job) {
    var t = jobTarget();
    mmCtx.fillStyle = '#ef4444';
    mmCtx.beginPath(); mmCtx.arc(tx(t.x), ty(t.y), 4, 0, 6.28); mmCtx.fill();
  }
  // checkpoint corsa
  if (G.minigame === 'race' && race) {
    race.checkpoints.forEach(function (cp, i) {
      mmCtx.fillStyle = i === race.cp ? '#38bdf8' : 'rgba(56,189,248,0.5)';
      mmCtx.beginPath(); mmCtx.arc(tx(cp.x), ty(cp.y), 3, 0, 6.28); mmCtx.fill();
    });
  }
  // auto e polizia
  G.cars.forEach(function (c) {
    if (c === G.player.inCar) return;
    mmCtx.fillStyle = c.color;
    mmCtx.fillRect(tx(c.x) - 2, ty(c.y) - 2, 4, 4);
  });
  // traffico in movimento
  G.traffic.forEach(function (c) {
    mmCtx.fillStyle = 'rgba(255,255,255,0.4)';
    mmCtx.fillRect(tx(c.x) - 1, ty(c.y) - 1, 3, 3);
  });
  G.police.forEach(function (cop) {
    mmCtx.fillStyle = '#1d4ed8';
    mmCtx.fillRect(tx(cop.x) - 2, ty(cop.y) - 2, 4, 4);
  });
  // personaggi e anello
  G.chars.forEach(function (ch) {
    mmCtx.fillStyle = ch.color;
    mmCtx.beginPath(); mmCtx.arc(tx(ch.x), ty(ch.y), 3, 0, 6.28); mmCtx.fill();
  });
  if (G.side && G.side.id === 'anello') {
    G.ring.forEach(function (r) {
      if (r.has && !r.found) {
        mmCtx.fillStyle = '#f59e0b';
        mmCtx.beginPath(); mmCtx.arc(tx(r.x), ty(r.y), 3, 0, 6.28); mmCtx.fill();
      }
    });
  }
  // collezionabili attivi
  if (G.side && DATA.COLLECTIBLE_SPAWNS[G.side.id]) {
    G.collectibles.forEach(function (col) {
      if (col.type === G.side.id && !col.found) {
        var info = DATA.COLLECTIBLES[col.type];
        mmCtx.fillStyle = info.color;
        mmCtx.beginPath(); mmCtx.arc(tx(col.x), ty(col.y), 3, 0, 6.28); mmCtx.fill();
      }
    });
  }
  // giocatore
  var p = G.player;
  mmCtx.fillStyle = '#fff';
  mmCtx.strokeStyle = '#3b82f6';
  mmCtx.lineWidth = 2;
  mmCtx.beginPath(); mmCtx.arc(tx(p.x), ty(p.y), 4, 0, 6.28); mmCtx.fill(); mmCtx.stroke();
}

// ══════════ AVVIO ══════════
function init() {
  initCanvas();
  buildCity();
  // vicolo vicino al minimarket (moto)
  DATA.MOTO = { x: buildingById('market').cx - 260, y: buildingById('market').cy + 180 };
  // armi
  G.weapon.items = DATA.WEAPONS.map(function (w) { return { id: w.id, name: w.name, emoji: w.emoji, owned: w.id === 'fionda', cd: w.cd, desc: w.desc }; });
  // spawn a casa
  var h = homeSpawn();
  G.player.x = h.x; G.player.y = h.y;
  bindInput();
  $('menuResume').addEventListener('click', toggleMenu);
  $('menuRestart').addEventListener('click', restartGame);
  $('menuExit').addEventListener('click', exitGame);
  $('musicBtn').addEventListener('click', toggleMusic);
  $('finaleRestart').addEventListener('click', restartGame);
  $('btnArcade').addEventListener('click', function () {
    if (G.dialogue || G.minigame) return;
    var bar = buildingById('bar');
    if (Math.hypot(G.player.x - bar.cx, G.player.y - bar.cy) < 100) startArcade();
    else toast('L\'arcade è al Bar Centrale.');
  });
  $('btnRace').addEventListener('click', function () {
    if (G.dialogue || G.minigame) return;
    startRace();
  });
  $('btnPhoto').addEventListener('click', tryPhoto);
  $('btnCycle').addEventListener('click', cycleWeapon);
  $('boxingPunch').addEventListener('click', boxingPunch);
  $('boxingPunch').addEventListener('touchstart', function (e) { e.preventDefault(); boxingPunch(); }, { passive: false });
  hud();
  showDialogue(DATA.STORY[0].dialogo, function () { G.stage = 1; hud(); });
  requestAnimationFrame(loop);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { G: G, DATA: DATA, init: init, update: update, render: render, tryInteract: tryInteract, advanceDialogue: advanceDialogue, fireWeapon: fireWeapon, startCashier: startCashier, confirmOrder: confirmOrder, startPizzaJob: startPizzaJob, startTaxiJob: startTaxiJob, startArcade: startArcade, startRace: startRace, startBoxing: startBoxing, nextStage: nextStage, completeSide: completeSide, cycleWeapon: cycleWeapon, buildingById: buildingById, spawnTrafficCar: spawnTrafficCar, triggerDynamicEvent: triggerDynamicEvent, enterBuilding: enterBuilding, exitBuilding: exitBuilding };
}
