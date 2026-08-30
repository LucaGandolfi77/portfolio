// ═══════════════════════════════════════════════════════════════
// WAR ORBIT — engine (top-down space MMO, clone of War Universe)
// Movement, combat, aliens, resources, levels, shop, portals,
// events (Battle Royal, Convoy), squad wingmen, minimap, save.
// iPhone (joystick) + desktop (WASD).
// ═══════════════════════════════════════════════════════════════

'use strict';
var $ = function (id) { return document.getElementById(id); };

var canvas, ctx, W, H, DPR;
var G = {
  started: false, paused: false, over: false,
  faction: 'solar', pilot: 'Pilot',
  btc: 5000, plt: 0, exp: 0, honor: 0, level: 1,
  ship: 'shuttle', gun: 'lg1', shieldGen: 'sg1', speedGen: 'acc1', ext: 'repair',
  ammo: { rlx: 2000, glx: 0, blx: 0, wlx: 0 }, ammoSel: 'rlx',
  rockets: 100,
  ownedShips: ['shuttle'], ownedGuns: ['lg1'], ownedShields: ['sg1'], ownedSpeeds: ['acc1'], ownedExts: ['repair'],
  cargo: { mercury: 0, erbium: 0, cerium: 0, azurit: 0, uranit: 0, darkonit: 0 },
  upHull: 0, upShield: 0, upDmg: 0,
  squad: false,
  map: 'x1',
  player: null,
  keys: {}, joy: { x: 0, y: 0, active: false },
  camera: { x: 0, y: 0 },
  aliens: [], rocks: [], shots: [], eshots: [], drops: [], boxes: [],
  wingmen: [], freighters: [],
  autofire: true,
  extT: 0, extOn: 0, rocketT: 0, invis: 0,
  event: null,        // 'royal' | 'convoy'
  royal: null, convoy: null,
  toastT: null, lastT: 0, shake: 0, time: 0,
  safe: { x: 0, y: 0 },
  mm: null
};

// ══════════ CANVAS / STARS ══════════
var stars = [];
function initCanvas() {
  canvas = $('c'); ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  buildStars();
  G.mm = $('minimap').getContext('2d');
}
function resize() {
  W = window.innerWidth; H = window.innerHeight;
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  buildStars();
}
function buildStars() {
  stars = [];
  var n = Math.min(120, Math.floor(W * H / 6000));
  for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4, tw: Math.random() * 6.28 });
}

// ══════════ PLAYER ══════════
function shipStats() {
  var s = DATA.SHIPS[G.ship];
  var sg = DATA.SHIELDS[G.shieldGen] || DATA.SHIELDS.sg1;
  var ac = DATA.SPEEDS[G.speedGen] || DATA.SPEEDS.acc1;
  var hullMul = 1 + G.upHull * 0.15, shieldMul = 1 + G.upShield * 0.15;
  return {
    hpMax: Math.round(s.hp * hullMul), shieldMax: Math.round((s.shield + sg.shield) * shieldMul),
    speed: s.speed + ac.spd, regen: sg.regen
  };
}
function spawnPlayer() {
  var m = DATA.MAPS[G.map];
  var st = shipStats();
  G.player = {
    x: G.safe.x, y: G.safe.y, a: 0,
    hp: st.hpMax, shield: st.shieldMax, regen: st.regen,
    speed: st.speed, dead: false
  };
  G.camera.x = G.player.x; G.camera.y = G.player.y;
}

// ══════════ MAPS ══════════
function mapSize() { return DATA.MAPS[G.map].size; }
function buildMap(keepPlayer) {
  var m = DATA.MAPS[G.map];
  G.aliens = []; G.rocks = []; G.shots = []; G.eshots = []; G.drops = []; G.boxes = [];
  G.convoy = null;
  // rocce di risorse
  var size = m.size / 2 - 120;
  for (var i = 0; i < m.rockN; i++) {
    G.rocks.push({ x: -size + Math.random() * size * 2, y: -size + Math.random() * size * 2, r: 10 + Math.random() * 8, res: m.rocks[(Math.random() * m.rocks.length) | 0], hp: 1 });
  }
  // base / safe zone (centro, lato)
  G.safe = { x: -m.size / 2 + 180, y: -m.size / 2 + 180 };
  // alieni
  spawnAliens();
  if (!keepPlayer) spawnPlayer();
  // eventi periodici
  G.time = 0;
}
function spawnAliens() {
  var m = DATA.MAPS[G.map];
  var n = 6 + Math.floor(Math.random() * 4);
  for (var i = 0; i < n; i++) {
    var kind = m.aliens[(Math.random() * m.aliens.length) | 0];
    if (kind === 'quattroid' && Math.random() > 0.25) kind = m.aliens[0];
    addAlien(kind);
  }
}
function addAlien(kind, x, y) {
  var a = DATA.ALIENS[kind];
  if (!a) return;
  var size = mSize();
  var px = x !== undefined ? x : -size + Math.random() * size * 2;
  var py = y !== undefined ? y : -size + Math.random() * size * 2;
  G.aliens.push({
    kind: kind, x: px, y: py, a: Math.random() * 6.28,
    hp: a.hp, shield: a.shield, maxHp: a.hp, speed: a.speed, dmg: a.dmg, r: a.size,
    btc: a.btc, plt: a.plt, exp: a.exp, honor: a.honor, color: a.color, t: Math.random() * 10
  });
}
function mSize() { return mapSize() / 2 - 120; }

// ══════════ INPUT ══════════
function bindInput() {
  window.addEventListener('keydown', function (e) {
    G.keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'e') tryInteract();
    if (e.key.toLowerCase() === 'q') useExt();
    if (e.key.toLowerCase() === 'r') fireRocket();
    if (e.key === 'Escape') toggleMenu();
    if (['1','2','3','4'].indexOf(e.key) >= 0) selectAmmo(['rlx','glx','blx','wlx'][parseInt(e.key,10)-1]);
    if (e.key === ' ') { e.preventDefault(); G.autofire = !G.autofire; hud(); toast(G.autofire ? 'Auto-fire ON' : 'Auto-fire OFF'); }
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
  $('actBtn').addEventListener('touchstart', function (e) { e.preventDefault(); tryInteract(); }, { passive: false });
  $('actBtn').addEventListener('mousedown', tryInteract);
  $('extBtn').addEventListener('touchstart', function (e) { e.preventDefault(); useExt(); }, { passive: false });
  $('extBtn').addEventListener('mousedown', useExt);
  $('rocketBtn').addEventListener('touchstart', function (e) { e.preventDefault(); fireRocket(); }, { passive: false });
  $('rocketBtn').addEventListener('mousedown', fireRocket);
  $('ammoBtn').addEventListener('touchstart', function (e) { e.preventDefault(); cycleAmmo(); }, { passive: false });
  $('ammoBtn').addEventListener('mousedown', cycleAmmo);
  $('fireBtn').addEventListener('touchstart', function (e) { e.preventDefault(); G.autofire = !G.autofire; hud(); toast(G.autofire ? 'Auto-fire ON' : 'Auto-fire OFF'); }, { passive: false });
  $('fireBtn').addEventListener('mousedown', function () { G.autofire = !G.autofire; hud(); toast(G.autofire ? 'Auto-fire ON' : 'Auto-fire OFF'); });
  canvas.addEventListener('click', function (e) {
    if (e.pointerType === 'touch') return;
    var w = screenToWorld(e.clientX, e.clientY);
    var p = G.player;
    G.player.aim = Math.atan2(w.y - p.y, w.x - p.x);
  });
}
function moveVector() {
  var x = 0, y = 0, k = G.keys;
  if (k['w'] || k['arrowup']) y -= 1;
  if (k['s'] || k['arrowdown']) y += 1;
  if (k['a'] || k['arrowleft']) x -= 1;
  if (k['d'] || k['arrowright']) x += 1;
  if (G.joy.active) { x += G.joy.x; y += G.joy.y; }
  var m = Math.hypot(x, y);
  if (m > 1) { x /= m; y /= m; }
  return { x: x, y: y, m: m };
}

// ══════════ INTERAZIONE (base, portali) ══════════
function nearestPortal() {
  var p = G.player, best = null, bd = 70, m = mapSize() / 2 - 60;
  var spots = [
    { x: -m, y: -m, to: null }, { x: m, y: -m, to: null }, { x: -m, y: m, to: null }, { x: m, y: m, to: null }
  ];
  var mdef = DATA.MAPS[G.map];
  var order = ['x1','x2','x3'];
  var idx = order.indexOf(G.map);
  spots[0].to = idx < 2 ? order[idx + 1] : null;   // avanti
  spots[1].to = idx > 0 ? order[idx - 1] : null;   // indietro
  for (var i = 0; i < spots.length; i++) {
    var d = Math.hypot(p.x - spots[i].x, p.y - spots[i].y);
    if (d < bd && spots[i].to) { bd = d; best = spots[i]; }
  }
  return best;
}
function inSafeZone() {
  var p = G.player, s = G.safe;
  return Math.hypot(p.x - s.x, p.y - s.y) < 150;
}
function tryInteract() {
  if (G.paused || G.over || G.event) return;
  if (inSafeZone()) { openBase(); return; }
  var pt = nearestPortal();
  if (pt) {
    if (DATA.MAPS[pt.to].level > G.level) { toast('Requires level ' + DATA.MAPS[pt.to].level + ' (you are ' + G.level + ')'); return; }
    G.map = pt.to;
    buildMap(true);
    toast('Warp to ' + DATA.MAPS[G.map].name + '!');
    hud();
  }
}
function screenToWorld(sx, sy) {
  return { x: (sx - W / 2) + G.camera.x, y: (sy - H / 2) + G.camera.y };
}

// ══════════ COMBAT ══════════
function nearestAlien(range) {
  var p = G.player, best = null, bd = range;
  for (var i = 0; i < G.aliens.length; i++) {
    var a = G.aliens[i];
    if (a.hp <= 0) continue;
    var d = Math.hypot(a.x - p.x, a.y - p.y);
    if (d < bd) { bd = d; best = a; }
  }
  return best;
}
function selectAmmo(id) {
  if (DATA.AMMO[id]) { G.ammoSel = id; hud(); }
}
function cycleAmmo() {
  var order = ['rlx', 'glx', 'blx', 'wlx'];
  var idx = order.indexOf(G.ammoSel);
  for (var i = 1; i <= 4; i++) {
    var cand = order[(idx + i) % 4];
    if (G.ammo[cand] > 0) { G.ammoSel = cand; break; }
  }
  hud();
  toast('Ammo: ' + DATA.AMMO[G.ammoSel].name);
}
function fire() {
  var p = G.player, gun = DATA.GUNS[G.gun], am = DATA.AMMO[G.ammoSel];
  if (!am || G.ammo[G.ammoSel] <= 0) { G.autofire = false; hud(); toast('Out of ' + am.name + '! Buy ammo at the base.'); return; }
  var t = nearestAlien(gun.range);
  if (!t) return;
  var a = Math.atan2(t.y - p.y, t.x - p.x);
  G.shots.push({ x: p.x + Math.cos(a) * 18, y: p.y + Math.sin(a) * 18, a: a, sp: 520, dmg: gun.dmg * am.mult * (1 + G.upDmg * 0.15), life: 0.9, owner: 'p' });
  G.ammo[G.ammoSel]--;
  G.invis = 0;
  hud();
}
function fireRocket() {
  if (G.rocketT > 0 || G.rockets <= 0) { if (G.rockets <= 0) toast('No rockets'); return; }
  var p = G.player, t = nearestAlien(500);
  var a = t ? Math.atan2(t.y - p.y, t.x - p.x) : p.a;
  G.shots.push({ x: p.x + Math.cos(a) * 18, y: p.y + Math.sin(a) * 18, a: a, sp: 300, dmg: DATA.ROCKET.dmg, life: 2.4, owner: 'p', rocket: true });
  G.rockets--; G.rocketT = DATA.ROCKET.cd;
  G.invis = 0;
  toast('🚀 Rocket away!');
  hud();
}
function useExt() {
  if (G.extT > 0) return;
  var e = DATA.EXTS[G.ext];
  if (!e) return;
  if (e.id === 'bomb') {
    var hit = 0;
    G.aliens.forEach(function (a) {
      if (a.hp <= 0) return;
      var d = Math.hypot(a.x - G.player.x, a.y - G.player.y);
      if (d < e.radius) { var pct = 0.10 + Math.random() * 0.15; a.hp -= a.maxHp * pct; hit++; }
    });
    G.shake = 1; toast('☢️ NUKE! ' + hit + ' aliens damaged (10-25% HP)');
  } else if (e.id === 'invuln') {
    G.extOn = e.dur; toast('🛡️ Invulnerable for ' + e.dur + 's');
  } else if (e.id === 'repair') {
    G.extOn = e.dur; toast('🔧 Repair active (' + e.dur + 's)');
  } else if (e.id === 'invis') {
    G.invis = e.dur; toast('👻 Invisible (' + e.dur + 's)');
  }
  G.extT = e.cd;
  hud();
}
function updateCombat(dt) {
  var p = G.player;
  var gun = DATA.GUNS[G.gun];
  if (G.autofire) { G.fireT = (G.fireT || 0) - dt; if (G.fireT <= 0) { fire(); G.fireT = 1 / gun.rate; } }
  G.rocketT = Math.max(0, G.rocketT - dt);
  G.extT = Math.max(0, G.extT - dt);
  G.extOn = Math.max(0, G.extOn - dt);
  G.invis = Math.max(0, G.invis - dt);
  // tiri
  for (var i = G.shots.length - 1; i >= 0; i--) {
    var s = G.shots[i];
    // hit check before moving: point-blank shots must not fly past a close alien
    if (s.owner === 'p') {
      for (var j = 0; j < G.aliens.length; j++) {
        var a = G.aliens[j];
        if (a.hp <= 0) continue;
        if (Math.hypot(a.x - s.x, a.y - s.y) < a.r + 6) { hitAlien(a, s.dmg); s.life = 0; break; }
      }
    } else {
      if (p.hp > 0 && Math.hypot(p.x - s.x, p.y - s.y) < 14) { damagePlayer(s.dmg); s.life = 0; }
      G.wingmen.forEach(function (wm) {
        if (wm.hp > 0 && Math.hypot(wm.x - s.x, wm.y - s.y) < 14) { wm.hp -= s.dmg; s.life = 0; }
      });
    }
    if (s.life > 0) { s.x += Math.cos(s.a) * s.sp * dt; s.y += Math.sin(s.a) * s.sp * dt; s.life -= dt; }
    if (s.life <= 0) G.shots.splice(i, 1);
  }
  // esplosioni
  if (G.extOn > 0 && G.ext === 'repair' && p.hp > 0) {
    var st = shipStats();
    p.hp = Math.min(st.hpMax, p.hp + st.hpMax * 0.1 * dt);
  }
}

function hitAlien(a, dmg) {
  if (a.shield > 0) { var sd = Math.min(a.shield, dmg); a.shield -= sd; dmg -= sd; }
  a.hp -= dmg;
  if (a.hp <= 0) killAlien(a);
}
function killAlien(a) {
  a.hp = 0;
  var m = a.owner === 'wm' ? 0.4 : 1;
  G.btc += Math.round(a.btc * m);
  G.plt += Math.round(a.plt * m);
  G.exp += Math.round(a.exp * m);
  G.honor += Math.round(a.honor * m);
  checkLevel();
  // drop risorse secondarie
  var sec = ['azurit', 'uranit', 'darkonit'][Math.floor(Math.random() * 3)];
  G.drops.push({ x: a.x, y: a.y, res: sec, n: 1 + ((Math.random() * 2) | 0) });
  if (Math.random() < 0.08) G.boxes.push({ x: a.x, y: a.y, kind: 'box' });
  toast('💥 ' + DATA.ALIENS[a.kind].name + ' destroyed! +' + Math.round(a.btc * m) + ' BTC');
  hud();
  if (G.event === 'royal' && G.royal) G.royal.kills++;
}
function damagePlayer(dmg) {
  var p = G.player;
  if (G.extOn > 0 && G.ext === 'invuln') return;
  if (G.event === 'royal' || inSafeZone()) { /* same logic */ }
  if (p.shield > 0) { var sd = Math.min(p.shield, dmg); p.shield -= sd; dmg -= sd; }
  p.hp -= dmg;
  G.shake = Math.max(G.shake, 0.4);
  if (p.hp <= 0) playerDeath();
  hud();
}
function playerDeath() {
  var p = G.player;
  p.hp = 0;
  G.over = true; G.paused = false;
  toast('☠️ Ship destroyed!');
  $('deathBox').classList.remove('hidden');
  hud();
}
function respawn() {
  G.map = 'x1';
  buildMap(false);
  G.over = false;
  $('deathBox').classList.add('hidden');
  toast('Repaired at base (free for shuttle pilots... and everyone else).');
  hud();
}

// ══════════ LEVEL / RANK ══════════
function checkLevel() {
  while (G.level < 15 && G.exp >= levelExp(G.level)) { G.exp -= levelExp(G.level); G.level++; toast('⬆️ Level ' + G.level + '!'); }
  hud();
}
function levelExp(l) { return 800 * l * l; }
function rankName() {
  var n = 'Private';
  for (var i = 0; i < DATA.RANKS.length; i++) if (G.honor >= DATA.RANKS[i].honor) n = DATA.RANKS[i].name;
  return n;
}
function honorDiscount() { return Math.min(10, Math.floor(G.honor / 10000000)); }
function price(cost, cur) {
  var d = honorDiscount();
  var v = Math.round(cost * (1 - d / 100));
  return { v: v, cur: cur || 'BTC' };
}

// ══════════ ALIENS AI ══════════
function updateAliens(dt) {
  var p = G.player;
  for (var i = G.aliens.length - 1; i >= 0; i--) {
    var a = G.aliens[i];
    if (a.hp <= 0) { if (G.aliens[i].deadT === undefined) { G.aliens[i].deadT = 0.8; } a = G.aliens[i]; a.deadT -= dt; if (a.deadT <= 0) G.aliens.splice(i, 1); continue; }
    a.t += dt;
    var d = Math.hypot(p.x - a.x, p.y - a.y);
    var aggro = 420;
    if (d < aggro && p.hp > 0 && !(inSafeZone() && d > 240)) {
      a.a = Math.atan2(p.y - a.y, p.x - a.x);
      var sp = a.speed * (d > 120 ? 1 : 0.4);
      a.x += Math.cos(a.a) * sp * dt; a.y += Math.sin(a.a) * sp * dt;
      if (d < 130 && G.eFire === undefined) { G.eFire = {}; }
      if (d < 150 && (a.t % 2.5) < dt * 0.5) {
        G.eshots.push({ x: a.x + Math.cos(a.a) * a.r, y: a.y + Math.sin(a.a) * a.r, a: a.a, sp: 200, dmg: a.dmg, life: 3 });
      }
      if (d < a.r + 14 && p.hp > 0 && a.t % 1.2 < dt * 2) damagePlayer(a.dmg * 0.3);
    } else {
      a.a += Math.sin(a.t * 0.7 + i) * 0.05;
      a.x += Math.cos(a.a) * a.speed * 0.3 * dt; a.y += Math.sin(a.a) * a.speed * 0.3 * dt;
    }
    clampToMap(a);
  }
  // tiri nemici
  for (var e = G.eshots.length - 1; e >= 0; e--) {
    var s = G.eshots[e];
    s.x += Math.cos(s.a) * s.sp * dt; s.y += Math.sin(s.a) * s.sp * dt;
    s.life -= dt;
    if (p.hp > 0 && Math.hypot(p.x - s.x, p.y - s.y) < 14) { damagePlayer(s.dmg); s.life = 0; }
    G.wingmen.forEach(function (wm) {
      if (wm.hp > 0 && Math.hypot(wm.x - s.x, wm.y - s.y) < 14) { wm.hp -= s.dmg * 0.5; s.life = 0; }
    });
    if (s.life <= 0) G.eshots.splice(e, 1);
  }
  // respawn se vuoto
  if (G.aliens.filter(function (x) { return x.hp > 0; }).length === 0) { setTimeout(spawnAliens, 2000); }
}
function clampToMap(e) {
  var lim = mapSize() / 2 - 20;
  e.x = Math.max(-lim, Math.min(lim, e.x));
  e.y = Math.max(-lim, Math.min(lim, e.y));
}

// ══════════ RACCOLTA RISORSE ══════════
function updatePickups(dt) {
  var p = G.player, st = shipStats();
  // rocce
  for (var i = G.rocks.length - 1; i >= 0; i--) {
    var r = G.rocks[i];
    if (Math.hypot(p.x - r.x, p.y - r.y) < 24) { G.cargo[r.res]++; G.rocks.splice(i, 1); toast('⛏️ +1 ' + DATA.RESOURCES[r.res].name); hud(); }
  }
  // drop
  for (var j = G.drops.length - 1; j >= 0; j--) {
    var d = G.drops[j];
    if (Math.hypot(p.x - d.x, p.y - d.y) < 24) { G.cargo[d.res] += d.n; G.drops.splice(j, 1); toast('💠 +' + d.n + ' ' + DATA.RESOURCES[d.res].name); hud(); }
  }
  // box
  for (var b = G.boxes.length - 1; b >= 0; b--) {
    var bx = G.boxes[b];
    if (Math.hypot(p.x - bx.x, p.y - bx.y) < 26) {
      var cur = Math.random() < 0.5 ? 'btc' : 'plt';
      var amt = cur === 'btc' ? 2000 + Math.random() * 5000 : 50 + Math.random() * 200;
      G[cur] += Math.round(amt);
      G.boxes.splice(b, 1);
      toast('📦 Bonus box: +' + Math.round(amt) + (cur === 'btc' ? ' BTC' : ' PLT'));
      hud();
    }
  }
  // rigenerazione scudo
  if (p.hp > 0) {
    p.shield = Math.min(st.shieldMax, p.shield + p.regen * dt);
    if (inSafeZone()) p.hp = Math.min(st.hpMax, p.hp + st.hpMax * 0.08 * dt);
  }
}

// ══════════ SQUAD (wingmen) ══════════
function updateWingmen(dt) {
  if (!G.squad) { G.wingmen = []; return; }
  var p = G.player;
  while (G.wingmen.length < 3) {
    G.wingmen.push({ x: p.x + Math.random() * 60 - 30, y: p.y + Math.random() * 60 - 30, hp: 3000, maxHp: 3000, t: 0 });
  }
  for (var i = 0; i < G.wingmen.length; i++) {
    var wm = G.wingmen[i];
    if (wm.hp <= 0) { wm.resp = (wm.resp || 0) - dt; if (wm.resp <= 0) { wm.hp = wm.maxHp; wm.x = p.x; wm.y = p.y; } continue; }
    wm.t += dt;
    var t = nearestAlienFor(wm, 380);
    if (t) {
      var a = Math.atan2(t.y - wm.y, t.x - wm.x);
      wm.x += Math.cos(a) * 150 * dt; wm.y += Math.sin(a) * 150 * dt;
      if (wm.t % 0.6 < dt * 2) {
        t.owner = 'wm';
        hitAlien(t, 40);
      }
    } else {
      var off = { x: p.x + Math.cos(i * 2.1) * 45, y: p.y + Math.sin(i * 2.1) * 45 };
      var d = Math.hypot(off.x - wm.x, off.y - wm.y);
      if (d > 20) { wm.x += (off.x - wm.x) / d * 170 * dt; wm.y += (off.y - wm.y) / d * 170 * dt; }
    }
    clampToMap(wm);
  }
}
function nearestAlienFor(wm, range) {
  var best = null, bd = range;
  for (var i = 0; i < G.aliens.length; i++) {
    var a = G.aliens[i];
    if (a.hp <= 0) continue;
    var d = Math.hypot(a.x - wm.x, a.y - wm.y);
    if (d < bd) { bd = d; best = a; }
  }
  return best;
}

// ══════════ EVENTI ══════════
// --- Battle Royal ---
function startRoyal() {
  G.event = 'royal';
  G.map = 'x1';
  G.royal = { zone: 1100, t: 0, kills: 0, bots: [] };
  buildMap(false);
  var names = ['VegaPilot','OrionHunter','SolarKid','NovaWolf','StellarGhost','NebulaX','CosmicFox','GalaxyAce','QuasarQ','LunaRider','AstroKid','PulseFire','Orbit_O','CometC','Helios1','VoidFlyer','NovaK','DriftKing','ZenithZ','FluxFox'];
  for (var i = 0; i < 20; i++) {
    G.royal.bots.push({
      name: names[i % names.length], x: Math.random() * 1600 - 800, y: Math.random() * 1600 - 800,
      hp: 4000 + Math.random() * 2000, maxHp: 6000, dmg: 200, r: 14, a: Math.random() * 6.28, t: 0, color: '#f87171'
    });
  }
  toast('🏁 BATTLE ROYALE — last one standing wins!');
  G.player.x = 0; G.player.y = 0; // spawn al centro della zona
  hud();
}
function updateRoyal(dt) {
  if (!G.royal) return;
  var r = G.royal;
  r.t += dt;
  if (r.t > 150) r.zone = Math.max(120, r.zone - 26 * dt);
  else if (r.t > 30) r.zone = Math.max(220, r.zone - 18 * dt);
  // bot
  var p = G.player;
  for (var i = r.bots.length - 1; i >= 0; i--) {
    var b = r.bots[i];
    if (b.hp <= 0) { r.bots.splice(i, 1); continue; }
    var d = Math.hypot(p.x - b.x, p.y - b.y);
    if (d < 500 && p.hp > 0) {
      b.a = Math.atan2(p.y - b.y, p.x - b.x);
      b.x += Math.cos(b.a) * 170 * dt; b.y += Math.sin(b.a) * 170 * dt;
      b.t += dt;
      if (d < 320 && b.t % 1.4 < dt * 2) {
        G.eshots.push({ x: b.x + Math.cos(b.a) * b.r, y: b.y + Math.sin(b.a) * b.r, a: b.a, sp: 260, dmg: b.dmg * 0.5, life: 2.5 });
      }
    } else { b.a += Math.sin(r.t + i) * 0.05; b.x += Math.cos(b.a) * 40 * dt; b.y += Math.sin(b.a) * 40 * dt; }
    clampToMap(b);
    // radiazione fuori zona
    var dz = Math.hypot(b.x, b.y);
    if (dz > r.zone) b.hp -= 300 * dt;
  }
  // radiazione per il giocatore
  if (Math.hypot(p.x, p.y) > r.zone && p.hp > 0) { damagePlayer(400 * dt); toast('☢️ Radiation! Get inside the zone!'); }
  // fine
  var alive = r.bots.filter(function (b) { return b.hp > 0; }).length;
  if (alive === 0 && p.hp > 0) { royalWin(); }
  hud();
}
function royalWin() {
  var reward = 500000;
  G.plt += reward;
  toast('🏆 BATTLE ROYALE WON! +' + reward + ' PLT');
  G.event = null; G.royal = null;
  G.map = 'x1'; buildMap(false);
  hud();
}
// --- Convoy ---
function startConvoy() {
  G.event = 'convoy';
  var m = mapSize() / 2 - 200;
  G.convoy = { freighters: [], saved: 0, destroyed: 0 };
  for (var i = 0; i < 4; i++) {
    G.convoy.freighters.push({ x: -m, y: -m + i * 120, y0: -m + i * 120, hp: 4000, maxHp: 4000, t: 0 });
  }
  toast('🚚 CONVOY — protect the freighters!');
  hud();
}
function updateConvoy(dt) {
  if (!G.convoy) return;
  var c = G.convoy;
  var m = mapSize() / 2 - 200;
  for (var i = c.freighters.length - 1; i >= 0; i--) {
    var f = c.freighters[i];
    f.x += 90 * dt;
    f.t += dt;
    // guardie attaccano chi si avvicina al convoglio
    if (Math.hypot(G.player.x - f.x, G.player.y - f.y) < 240 && G.player.hp > 0) { /* avvisa */ }
    if (f.x > m) { c.saved++; c.freighters.splice(i, 1); continue; }
    // ondate di alieni
    if (f.t % 6 < dt * 2 && G.aliens.length < 14) addAlien('hyper-jenta', f.x - 200, f.y);
    if (f.hp <= 0) { c.destroyed++; c.freighters.splice(i, 1); }
  }
  if (c.freighters.length === 0) {
    var bonus = 20000 + c.saved * 15000;
    G.btc += bonus;
    toast('🏁 Convoy over: ' + c.saved + ' saved, ' + c.destroyed + ' lost. +' + bonus + ' BTC');
    G.event = null; G.convoy = null;
    hud();
  }
}

// ══════════ HUD ══════════
function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
function hud() {
  var p = G.player;
  $('hudBt').textContent = 'BTC ' + fmt(G.btc);
  $('hudPt').textContent = 'PLT ' + fmt(G.plt);
  $('hudLv').textContent = 'Lv ' + G.level + ' · ' + rankName();
  $('hudMap').textContent = 'Map ' + DATA.MAPS[G.map].name + ' · ' + DATA.FACTIONS[0].name;
  if (p) {
    var st = shipStats();
    $('hpBar').style.width = Math.max(0, p.hp / st.hpMax * 100) + '%';
    $('shBar').style.width = Math.max(0, p.shield / st.shieldMax * 100) + '%';
  }
  var am = DATA.AMMO[G.ammoSel];
  $('ammoBtn').textContent = am.name + ' (' + fmt(G.ammo[G.ammoSel]) + ')';
  var ex = DATA.EXTS[G.ext];
  $('extBtn').textContent = ex.emoji;
  $('rocketBtn').textContent = '🚀 ' + fmt(G.rockets);
  $('fireBtn').textContent = G.autofire ? 'AUTO' : 'MAN';
  $('fireBtn').classList.toggle('on', G.autofire);
  $('wanted').textContent = G.event === 'royal' ? '🏁 ROYALE' : (G.event === 'convoy' ? '🚚 CONVOY' : 'FREE');
}
function toast(msg, ms) {
  var el = $('toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(G.toastT);
  G.toastT = setTimeout(function () { el.classList.remove('on'); }, ms || 2200);
}

// ══════════ RENDER ══════════
function render() {
  ctx.fillStyle = '#04060f';
  ctx.fillRect(0, 0, W, H);
  // stelle (parallax lieve)
  for (var i = 0; i < stars.length; i++) {
    var s = stars[i];
    ctx.globalAlpha = 0.4 + 0.4 * Math.sin(performance.now() / 900 + s.tw);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(s.x - s.r / 2, s.y - s.r / 2, s.r, s.r);
  }
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.translate(W / 2 - G.camera.x, H / 2 - G.camera.y);
  if (G.shake > 0.02) { ctx.translate((Math.random() - 0.5) * 12 * G.shake, (Math.random() - 0.5) * 12 * G.shake); G.shake *= 0.9; }

  var lim = mapSize() / 2;
  // confine
  ctx.strokeStyle = 'rgba(148,163,184,.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-lim, -lim, mapSize(), mapSize());
  // sfondo mappa
  ctx.fillStyle = 'rgba(10,16,32,.6)';
  ctx.fillRect(-lim, -lim, mapSize(), mapSize());

  // zona sicura / base
  var s = G.safe;
  ctx.strokeStyle = 'rgba(74,222,128,.4)';
  ctx.setLineDash([10, 8]);
  ctx.beginPath(); ctx.arc(s.x, s.y, 150, 0, 6.28); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#10b981';
  roundRect(ctx, s.x - 26, s.y - 26, 52, 52, 8); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '18px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('⛽', s.x, s.y + 1);

  // portali
  var m = lim - 60;
  [[-m, -m], [m, -m], [-m, m], [m, m]].forEach(function (pt) {
    ctx.fillStyle = 'rgba(139,92,246,.5)';
    ctx.beginPath(); ctx.arc(pt[0], pt[1], 26 + Math.sin(performance.now() / 300) * 4, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2; ctx.stroke();
  });

  // rocce
  G.rocks.forEach(function (r) {
    ctx.fillStyle = '#64748b';
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.28); ctx.fill();
    ctx.fillStyle = DATA.RESOURCES[r.res].color;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r * 0.4, 0, 6.28); ctx.fill();
  });
  // drop
  G.drops.forEach(function (d) {
    ctx.fillStyle = DATA.RESOURCES[d.res].color;
    ctx.beginPath(); ctx.arc(d.x, d.y, 6, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
  });
  // box
  G.boxes.forEach(function (b) {
    ctx.fillStyle = '#fbbf24';
    roundRect(ctx, b.x - 8, b.y - 8, 16, 16, 3); ctx.fill();
    ctx.fillStyle = '#78350f'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('!', b.x, b.y + 1);
  });

  // freighters (convoy)
  if (G.convoy) {
    G.convoy.freighters.forEach(function (f) {
      ctx.fillStyle = '#475569';
      roundRect(ctx, f.x - 22, f.y - 14, 44, 28, 6); ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(f.x + 6, f.y - 10, 10, 20);
      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('CARGO', f.x, f.y + 3);
      // barra hp
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(f.x - 20, f.y - 20, 40, 4);
      ctx.fillStyle = '#4ade80'; ctx.fillRect(f.x - 20, f.y - 20, 40 * Math.max(0, f.hp / f.maxHp), 4);
    });
  }

  // alieni
  G.aliens.forEach(function (a) {
    if (a.hp <= 0) {
      ctx.globalAlpha = Math.max(0, a.deadT || 0);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(a.x, a.y, 8, 0, 6.28); ctx.fill();
      ctx.globalAlpha = 1;
      return;
    }
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.a + Math.PI / 2);
    ctx.fillStyle = a.color;
    ctx.beginPath();
    ctx.moveTo(0, -a.r);
    ctx.lineTo(a.r * 0.7, a.r);
    ctx.lineTo(-a.r * 0.7, a.r);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
    // hp/shield bar
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(a.x - a.r, a.y - a.r - 8, a.r * 2, 3);
    ctx.fillStyle = a.shield > 0 ? '#38bdf8' : '#ef4444';
    ctx.fillRect(a.x - a.r, a.y - a.r - 8, a.r * 2 * Math.max(0, (a.hp + a.shield) / (a.maxHp + (DATA.ALIENS[a.kind].shield))), 3);
  });

  // wingmen
  G.wingmen.forEach(function (wm) {
    if (wm.hp <= 0) return;
    ctx.fillStyle = '#4ade80';
    ctx.beginPath(); ctx.arc(wm.x, wm.y, 8, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  });

  // bot battle royale
  if (G.royal) {
    G.royal.bots.forEach(function (b) {
      ctx.fillStyle = '#f87171';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.28); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = '9px system-ui'; ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(b.name, b.x, b.y - b.r - 4);
    });
    // zona
    ctx.strokeStyle = 'rgba(248,113,113,.7)';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.arc(0, 0, G.royal.zone, 0, 6.28); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(248,113,113,.08)';
    ctx.beginPath(); ctx.arc(0, 0, G.royal.zone, 0, 6.28); ctx.fill();
  }

  // player
  var p = G.player;
  if (p.hp > 0) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a + Math.PI / 2);
    ctx.fillStyle = G.invis > 0 ? 'rgba(148,163,184,.5)' : DATA.SHIPS[G.ship].color;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(11, 12);
    ctx.lineTo(0, 6);
    ctx.lineTo(-11, 12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
    // scudo visivo
    if (p.shield > 0.5) {
      ctx.strokeStyle = 'rgba(56,189,248,.35)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 18, 0, 6.28); ctx.stroke();
    }
    if (G.extOn > 0 && G.ext === 'invuln') {
      ctx.strokeStyle = 'rgba(250,204,21,.8)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, 22 + Math.sin(performance.now() / 120) * 3, 0, 6.28); ctx.stroke();
    }
  }

  // tiri
  G.shots.forEach(function (s) {
    ctx.fillStyle = s.rocket ? '#f59e0b' : '#fff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.rocket ? 5 : 3, 0, 6.28); ctx.fill();
  });
  G.eshots.forEach(function (s) {
    ctx.fillStyle = '#f87171';
    ctx.beginPath(); ctx.arc(s.x, s.y, 3, 0, 6.28); ctx.fill();
  });

  ctx.restore();

  // vignetta ansia? no. radar radiation overlay for royal
  if (G.royal && p.hp > 0 && Math.hypot(p.x, p.y) > G.royal.zone) {
    ctx.fillStyle = 'rgba(248,113,113,' + Math.min(0.4, 0.2 + Math.sin(performance.now() / 200) * 0.1) + ')';
    ctx.fillRect(0, 0, W, H);
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

// ══════════ MINIMAP ══════════
function renderMinimap() {
  var mm = G.mm, MM = 130, f = MM / (mapSize() + 200);
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var cv = $('minimap');
  if (cv.width !== Math.round(MM * dpr)) { cv.width = Math.round(MM * dpr); cv.height = Math.round(MM * dpr); }
  mm.setTransform(dpr, 0, 0, dpr, 0, 0);
  mm.clearRect(0, 0, MM, MM);
  mm.fillStyle = '#0b1120';
  mm.fillRect(0, 0, MM, MM);
  var tx = function (wx) { return (wx + (mapSize() / 2 + 100)) * f; };
  var ty = function (wy) { return (wy + (mapSize() / 2 + 100)) * f; };
  // rocce
  mm.fillStyle = '#334155';
  G.rocks.forEach(function (r) { mm.fillRect(tx(r.x) - 1, ty(r.y) - 1, 2, 2); });
  // base
  mm.fillStyle = '#4ade80';
  mm.beginPath(); mm.arc(tx(G.safe.x), ty(G.safe.y), 3, 0, 6.28); mm.fill();
  // alieni
  mm.fillStyle = '#f87171';
  G.aliens.forEach(function (a) { if (a.hp > 0) mm.fillRect(tx(a.x) - 1, ty(a.y) - 1, 2, 2); });
  // freighters
  if (G.convoy) {
    mm.fillStyle = '#22d3ee';
    G.convoy.freighters.forEach(function (f) { mm.fillRect(tx(f.x) - 2, ty(f.y) - 1, 4, 2); });
  }
  // player
  var p = G.player;
  mm.fillStyle = '#fff';
  mm.strokeStyle = '#38bdf8';
  mm.lineWidth = 2;
  mm.beginPath(); mm.arc(tx(p.x), ty(p.y), 3, 0, 6.28); mm.fill(); mm.stroke();
}

// ══════════ MENU / BASE ══════════
function toggleMenu() {
  G.paused = !G.paused;
  $('menuOverlay').classList.toggle('open', G.paused);
}
function openBase() {
  G.paused = true;
  renderShop();
  $('baseOverlay').classList.remove('hidden');
}
function closeBase() { G.paused = false; $('baseOverlay').classList.add('hidden'); hud(); save(); }
function exitGame() {
  try { if (window.history && window.history.length > 1) window.history.back(); else window.location.href = '../index.html#games'; }
  catch (e) { window.location.href = '../index.html#games'; }
}

// ══════════ SHOP / HANGAR ══════════
function buy(kind, id) {
  var def = null, owned = null;
  if (kind === 'ship') { def = DATA.SHIPS[id]; owned = G.ownedShips; }
  else if (kind === 'gun') { def = DATA.GUNS[id]; owned = G.ownedGuns; }
  else if (kind === 'shield') { def = DATA.SHIELDS[id]; owned = G.ownedShields; }
  else if (kind === 'speed') { def = DATA.SPEEDS[id]; owned = G.ownedSpeeds; }
  else if (kind === 'ext') { def = DATA.EXTS[id]; owned = G.ownedExts; }
  if (!def || owned.indexOf(id) >= 0) return;
  if (G.level < def.level) { toast('Requires level ' + def.level); return; }
  var pr = price(def.cost, def.cur);
  if (pr.cur === 'BTC' && G.btc < pr.v) { toast('Not enough BTC'); return; }
  if (pr.cur === 'PLT' && G.plt < pr.v) { toast('Not enough PLT'); return; }
  if (pr.cur === 'BTC') G.btc -= pr.v; else G.plt -= pr.v;
  owned.push(id);
  if (kind === 'ship') G.ship = id;
  else if (kind === 'gun') G.gun = id;
  else if (kind === 'shield') G.shieldGen = id;
  else if (kind === 'speed') G.speedGen = id;
  else if (kind === 'ext') G.ext = id;
  toast(def.name + ' purchased!');
  spawnPlayer(); save(); renderShop(); hud();
}
function buyAmmo(id) {
  var am = DATA.AMMO[id];
  var pr = price(am.cost);
  if (G.btc < pr.v) { toast('Not enough BTC'); return; }
  if (G.level < am.level) { toast('Requires level ' + am.level); return; }
  G.btc -= pr.v;
  G.ammo[id] += am.amt;
  toast('+' + am.amt + ' ' + am.name);
  save(); renderShop(); hud();
}
function buyRockets() {
  if (G.level < DATA.ROCKET.level) { toast('Requires level ' + DATA.ROCKET.level); return; }
  if (G.btc < DATA.ROCKET.cost) { toast('Not enough BTC'); return; }
  G.btc -= DATA.ROCKET.cost; G.rockets += DATA.ROCKET.amt;
  save(); renderShop(); hud();
}
function sellResources() {
  var total = 0;
  for (var k in G.cargo) { total += G.cargo[k] * DATA.RESOURCES[k].price; G.cargo[k] = 0; }
  G.btc += total;
  toast('Sold resources: +' + fmt(total) + ' BTC');
  save(); renderShop(); hud();
}
function refineResources() {
  var steps = [['mercury', 'erbium'], ['erbium', 'cerium']];
  var did = false;
  for (var i = 0; i < steps.length; i++) {
    if (G.cargo[steps[i][0]] >= DATA.COSTS.refine) {
      G.cargo[steps[i][0]] -= DATA.COSTS.refine;
      G.cargo[steps[i][1]]++;
      did = true;
      break;
    }
  }
  toast(did ? 'Refined 5 → 1 (next tier)' : 'Need 5 of a primary resource to refine');
  save(); renderShop(); hud();
}
function upgradeHull() { doUpgrade('hull', 'azurit', 'upHull'); }
function upgradeShield() { doUpgrade('shield', 'uranit', 'upShield'); }
function upgradeDmg() { doUpgrade('dmg', 'darkonit', 'upDmg'); }
function doUpgrade(kind, res, stat) {
  if (G.cargo[res] < 1) { toast('Needs 1 ' + DATA.RESOURCES[res].name); return; }
  if (G.btc < DATA.COSTS[kind + 'Up']) { toast('Needs ' + fmt(DATA.COSTS[kind + 'Up']) + ' BTC'); return; }
  G.cargo[res]--; G.btc -= DATA.COSTS[kind + 'Up'];
  G[stat]++;
  toast((kind === 'hull' ? 'Hull' : kind === 'shield' ? 'Shield' : 'Firepower') + ' upgraded (+15%)');
  spawnPlayer(); save(); renderShop(); hud();
}
function renderShop() {
  var rows = '';
  rows += '<h3>🚀 Ships</h3>';
  Object.keys(DATA.SHIPS).forEach(function (id) {
    var s = DATA.SHIPS[id];
    var owned = G.ownedShips.indexOf(id) >= 0;
    var sel = G.ship === id ? ' (equipped)' : '';
    rows += '<div class="row">' + s.name + (s.ability ? ' · ' + s.ability : '') + ' ' + s.desc + '<br><small>HP ' + s.hp + ' · SH ' + s.shield + ' · SPD ' + s.speed + ' · slots ' + s.slots + '</small>' +
      (owned ? '<button class="mini" onclick="equipItem(\'ship\',\'' + id + '\')">Equip</button>' + (sel ? '<b> ✓</b>' : '') :
        '<button class="mini" onclick="buy(\'ship\',\'' + id + '\')">Buy ' + fmt(s.cost) + ' ' + (s.cur || 'BTC') + '</button>') + '</div>';
  });
  rows += '<h3>🔫 Guns</h3>';
  Object.keys(DATA.GUNS).forEach(function (id) {
    var g = DATA.GUNS[id];
    var owned = G.ownedGuns.indexOf(id) >= 0;
    rows += '<div class="row">' + g.name + ' (dmg ' + g.dmg + ', rate ' + g.rate + ') ' +
      (owned ? '<button class="mini" onclick="equipItem(\'gun\',\'' + id + '\')">Equip</button>' + (G.gun === id ? ' ✓' : '') :
        '<button class="mini" onclick="buy(\'gun\',\'' + id + '\')">Buy ' + fmt(g.cost) + ' ' + (g.cur || 'BTC') + '</button>') + '</div>';
  });
  rows += '<h3>🧪 Ammo</h3>';
  Object.keys(DATA.AMMO).forEach(function (id) {
    var a = DATA.AMMO[id];
    rows += '<div class="row">' + a.name + ' (x' + a.mult + ' dmg) <button class="mini" onclick="buyAmmo(\'' + id + '\')">+' + a.amt + ' · ' + fmt(a.cost) + ' BTC</button></div>';
  });
  rows += '<div class="row">🚀 ' + DATA.ROCKET.name + ' (dmg ' + DATA.ROCKET.dmg + ') <button class="mini" onclick="buyRockets()">+' + DATA.ROCKET.amt + ' · ' + fmt(DATA.ROCKET.cost) + ' BTC</button></div>';
  rows += '<h3>🛡️ Shields / ⚡ Speed</h3>';
  Object.keys(DATA.SHIELDS).forEach(function (id) {
    var s = DATA.SHIELDS[id];
    var owned = G.ownedShields.indexOf(id) >= 0;
    rows += '<div class="row">' + s.name + ' (+' + s.shield + ' SH, +' + s.regen + '/s) ' +
      (owned ? '<button class="mini" onclick="equipItem(\'shield\',\'' + id + '\')">Equip</button>' + (G.shieldGen === id ? ' ✓' : '') :
        '<button class="mini" onclick="buy(\'shield\',\'' + id + '\')">Buy ' + fmt(s.cost) + ' ' + (s.cur || 'BTC') + '</button>') + '</div>';
  });
  Object.keys(DATA.SPEEDS).forEach(function (id) {
    var s = DATA.SPEEDS[id];
    var owned = G.ownedSpeeds.indexOf(id) >= 0;
    rows += '<div class="row">' + s.name + ' (+' + s.spd + ' speed) ' +
      (owned ? '<button class="mini" onclick="equipItem(\'speed\',\'' + id + '\')">Equip</button>' + (G.speedGen === id ? ' ✓' : '') :
        '<button class="mini" onclick="buy(\'speed\',\'' + id + '\')">Buy ' + fmt(s.cost) + ' ' + (s.cur || 'BTC') + '</button>') + '</div>';
  });
  rows += '<h3>🧩 Extensions (1 active, ' + DATA.EXTS[G.ext].name + ')</h3>';
  Object.keys(DATA.EXTS).forEach(function (id) {
    var e = DATA.EXTS[id];
    var owned = G.ownedExts.indexOf(id) >= 0;
    rows += '<div class="row">' + e.emoji + ' ' + e.label + ' — ' + e.desc + ' ' +
      (owned ? '<button class="mini" onclick="equipItem(\'ext\',\'' + id + '\')">Equip</button>' + (G.ext === id ? ' ✓' : '') :
        '<button class="mini" onclick="buy(\'ext\',\'' + id + '\')">Buy ' + fmt(e.cost) + ' ' + (e.cur || 'BTC') + '</button>') + '</div>';
  });
  rows += '<h3>⛏️ Resources & Upgrades</h3>';
  var cargoStr = '';
  for (var k in G.cargo) cargoStr += DATA.RESOURCES[k].emoji + ' ' + DATA.RESOURCES[k].name + ': ' + G.cargo[k] + ' ';
  rows += '<div class="row">' + cargoStr + '<button class="mini" onclick="sellResources()">Sell all</button><button class="mini" onclick="refineResources()">Refine 5→1</button></div>';
  rows += '<div class="row">Upgrades: <button class="mini" onclick="upgradeHull()">Hull ' + G.upHull + ' (1 Azurit)</button> <button class="mini" onclick="upgradeShield()">Shield ' + G.upShield + ' (1 Uranit)</button> <button class="mini" onclick="upgradeDmg()">Power ' + G.upDmg + ' (1 Darkonit)</button></div>';
  rows += '<div class="row">👥 Squad wingmen: <button class="mini" onclick="toggleSquad()">' + (G.squad ? 'ON (3 wingmen)' : 'OFF') + '</button></div>';
  rows += '<div class="row">📦 Events: <button class="mini" onclick="startRoyal()">Battle Royale</button> <button class="mini" onclick="startConvoy()">Convoy</button></div>';
  $('shopList').innerHTML = rows;
}
function equipItem(kind, id) {
  if (kind === 'ship') G.ship = id;
  else if (kind === 'gun') G.gun = id;
  else if (kind === 'shield') G.shieldGen = id;
  else if (kind === 'speed') G.speedGen = id;
  else if (kind === 'ext') G.ext = id;
  spawnPlayer(); save(); renderShop(); hud(); toast('Equipped');
}
function toggleSquad() { G.squad = !G.squad; save(); renderShop(); hud(); toast(G.squad ? 'Squad of 3 wingmen formed' : 'Squad dismissed'); }

// ══════════ SAVE / LOAD ══════════
function save() {
  try { localStorage.setItem(DATA.SAVE_KEY, JSON.stringify(G)); } catch (e) {}
}
function load() {
  try {
    var raw = localStorage.getItem(DATA.SAVE_KEY);
    if (!raw) return false;
    var d = JSON.parse(raw);
    Object.keys(d).forEach(function (k) { if (k !== 'player' && k !== 'aliens' && k !== 'rocks' && k !== 'shots') G[k] = d[k]; });
    return true;
  } catch (e) { return false; }
}

// ══════════ LOOP ══════════
function update(dt) {
  if (G.paused || G.over || !G.player) return;
  G.time += dt;
  var p = G.player;
  var mv = moveVector();
  if (mv.m > 0.1) {
    p.a = Math.atan2(mv.y, mv.x);
    p.x += mv.x * p.speed * dt;
    p.y += mv.y * p.speed * dt;
    clampToMap(p);
  }
  clampToMap(p);
  G.camera.x += (p.x - G.camera.x) * Math.min(1, 6 * dt);
  G.camera.y += (p.y - G.camera.y) * Math.min(1, 6 * dt);
  if (G.event === 'royal') { updateRoyal(dt); }
  else if (G.event === 'convoy') { updateConvoy(dt); }
  updateAliens(dt);
  updateCombat(dt);
  updatePickups(dt);
  updateWingmen(dt);
  hud();
}
function loop(t) {
  var dt = G.lastT ? Math.min((t - G.lastT) / 1000, 0.05) : 0;
  G.lastT = t;
  update(dt);
  render();
  renderMinimap();
  requestAnimationFrame(loop);
}

// ══════════ START ══════════
function startGame(faction, pilot) {
  G.faction = faction; G.pilot = pilot || 'Pilot';
  $('startScreen').classList.add('hidden');
  G.started = true;
  G.map = 'x1';
  buildMap(false);
  hud();
  toast('Welcome to War Orbit, ' + G.pilot + '! (' + DATA.FACTIONS.filter(function (f) { return f.id === faction; })[0].name + ')');
  requestAnimationFrame(loop);
}
function continueGame() {
  var ok = load();
  $('startScreen').classList.add('hidden');
  G.started = true;
  buildMap(false);
  hud();
  toast(ok ? 'Welcome back, ' + G.pilot + '!' : 'New pilot profile');
  requestAnimationFrame(loop);
}
function init() {
  initCanvas();
  bindInput();
  $('menuResume').addEventListener('click', toggleMenu);
  $('menuRestart').addEventListener('click', function () { try { localStorage.removeItem(DATA.SAVE_KEY); } catch (e) {} location.reload(); });
  $('menuExit').addEventListener('click', exitGame);
  $('baseClose').addEventListener('click', closeBase);
  $('respawnBtn').addEventListener('click', respawn);
  var fsel = $('factionSel');
  DATA.FACTIONS.forEach(function (f) {
    var o = document.createElement('option');
    o.value = f.id; o.textContent = f.name;
    fsel.appendChild(o);
  });
  $('btnStart').addEventListener('click', function () { startGame(fsel.value, $('pilotName').value.trim() || 'Pilot'); });
  $('btnContinue').addEventListener('click', continueGame);
  hud();
}
init();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { G: G, DATA: DATA, init: init, update: update, render: render, startGame: startGame, buy: buy, hud: hud, buildMap: buildMap, startRoyal: startRoyal, startConvoy: startConvoy, toast: toast };
}
