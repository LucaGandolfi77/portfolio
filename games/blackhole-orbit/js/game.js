// ═══════════════════════════════════════════════════════════════
// BLACKHOLE ORBIT — Game core
// Loop su PixiJS ticker, input desktop+touch (joystick/tap/FIRE),
// gravità del buco nero, energia/munizioni reali, boss event.
// Fix dal report del clone: stats cache per frame, niente resize
// per-frame, selezione per riferimento (non indice), ESC modali.
// ═══════════════════════════════════════════════════════════════

var GAME = {};

GAME.player = null;
GAME.keys = {};
GAME.lastT = 0;
GAME.fireCd = 0;
GAME.paused = false;
GAME.autoSaveT = 0;
GAME.mouse = { x: 0, y: 0 };
GAME.camX = 0;
GAME.camY = 0;

// Stato bersagli (riferimenti agli oggetti, non indici)
GAME.selectedNpc = null;
GAME.attacking = false;
GAME.moveTarget = null;
GAME.mineTarget = null;
GAME._sectorWarn = '';
GAME._noAmmoWarned = false;
GAME.droneAngle = 0;
GAME.droneCd = 0;

// Touch state
GAME.touchMode = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
GAME.joy = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
GAME._tapInfo = null;
GAME._pinch = null;

// ── Utility ─────────────────────────────────────────────────────
GAME.fmt = function (n) {
  if (!isFinite(n)) return '∞';
  return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

GAME.isThrusting = function () {
  if (GAME.joy.active && (Math.abs(GAME.joy.dx) > 0.1 || Math.abs(GAME.joy.dy) > 0.1)) return true;
  var k = GAME.keys;
  return !!(k['W'] || k['KeyW'] || k['S'] || k['KeyS'] || k['A'] || k['KeyA'] || k['D'] || k['KeyD'] ||
            k['ArrowUp'] || k['ArrowDown'] || k['ArrowLeft'] || k['ArrowRight'] ||
            k['Up'] || k['Down'] || k['Left'] || k['Right']) || !!GAME.moveTarget;
};

// ── Input: tastiera + mouse (desktop) ────────────────────────────
GAME.initInput = function () {
  window.addEventListener('keydown', function (e) {
    var tgt = e.target;
    if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.tagName === 'SELECT')) return;
    if (!GAME.player) return;
    var k = e.key || e.code;
    if (k === ' ') k = 'Space';
    else if (k.length === 1) k = k.toUpperCase();
    GAME.keys[k] = true;
    GAME.keys[e.code] = true;

    if (e.code === 'KeyC') { if (!UI.anyPanelOpen()) UI.openShop(); }
    if (e.code === 'KeyM') { if (!UI.anyPanelOpen()) UI.openMap(); }
    if (e.code === 'KeyB') { if (!UI.anyPanelOpen()) UI.openMissions(); }
    if (e.code === 'KeyG') {
      if (GAME.isInGate()) GAME.exitGate();
      else GAME.enterGate();
    }
    if (k === 'Space') e.preventDefault();
    if (e.code === 'ControlLeft' || e.code === 'ControlRight' || k === 'Control') GAME.toggleAttack();
    if (k === '1') GAME.setAmmo('red');
    if (k === '2') GAME.setAmmo('blue');
    if (k === '3') GAME.setAmmo('green');
    if (k === '4') GAME.setAmmo('white');
    if (e.code === 'KeyV') GAME.toggleConfig();
    // ESC: chiude le modali aperte, altrimenti deseleziona il bersaglio
    if (e.code === 'Escape') {
      if (UI.anyPanelOpen()) UI.closeAllPanels();
      else GAME.clearTarget();
    }
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.key) >= 0) e.preventDefault();
  });
  window.addEventListener('keyup', function (e) {
    var tgt = e.target;
    if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA')) return;
    var k = e.key || e.code;
    if (k === ' ') k = 'Space';
    else if (k.length === 1) k = k.toUpperCase();
    GAME.keys[k] = false;
    GAME.keys[e.code] = false;
  });

  var cv = RND.app.canvas;   // Pixi v8: canvas del renderer
  cv.addEventListener('mousemove', function (e) {
    GAME.mouse.x = e.clientX; GAME.mouse.y = e.clientY;
  });
  cv.addEventListener('wheel', function (e) {
    e.preventDefault();
    RND.setZoom(RND.targetZoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
  }, { passive: false });

  // Click desktop: nemico→seleziona, asteroide→mina, vuoto→muovi
  cv.addEventListener('click', function (e) {
    if (e.pointerType === 'touch') return;
    var w = RND.worldFromScreen(e.clientX, e.clientY);
    GAME.handleTap(w.x, w.y, true);
  });

  // ── Touch: joystick dinamico (metà sinistra), tap-selezione, pinch-zoom ──
  cv.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'touch') return;
    AUDIO.resume();
    GAME.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });

    var half = window.innerWidth * 0.48;
    if (e.clientX < half && !GAME.joy.active && GAME.touches.size === 1) {
      GAME.joy.active = true;
      GAME.joy.id = e.pointerId;
      GAME.joy.ox = e.clientX; GAME.joy.oy = e.clientY;
      GAME.joy.dx = 0; GAME.joy.dy = 0;
      GAME.showJoy(e.clientX, e.clientY);
    } else {
      GAME._tapInfo = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
    }
    // due dita → inizia il pinch salvando distanza e zoom di partenza
    if (GAME.touches.size === 2) {
      var pts = Array.from(GAME.touches.values());
      GAME.pinch = { d0: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), z0: RND.targetZoom };
      GAME._tapInfo = null;
    }
  }, { passive: true });

  cv.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'touch') return;
    if (!GAME.touches.has(e.pointerId)) return;
    GAME.touches.get(e.pointerId).x = e.clientX;
    GAME.touches.get(e.pointerId).y = e.clientY;

    // pinch attivo con due dita
    if (GAME.pinch && GAME.touches.size === 2) {
      var pts = Array.from(GAME.touches.values());
      var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (GAME.pinch.d0 > 0) RND.setZoom(GAME.pinch.z0 * (d / GAME.pinch.d0));
      return;
    }

    // movimento joystick
    if (GAME.joy.active && e.pointerId === GAME.joy.id) {
      var dx = e.clientX - GAME.joy.ox, dy = e.clientY - GAME.joy.oy;
      var maxR = 58;
      var mag = Math.hypot(dx, dy);
      if (mag > maxR) { dx = dx / mag * maxR; dy = dy / mag * maxR; }
      GAME.joy.dx = dx / maxR; GAME.joy.dy = dy / maxR;
      GAME.moveJoy(dx, dy);
    }
  }, { passive: true });

  var endPointer = function (e) {
    if (e.pointerType !== 'touch') return;

    // rilascio joystick
    if (GAME.joy.active && e.pointerId === GAME.joy.id) {
      GAME.joy.active = false; GAME.joy.dx = 0; GAME.joy.dy = 0;
      GAME.hideJoy();
    }
    // fine pinch
    if (GAME.touches.size < 2) GAME.pinch = null;
    GAME.touches.delete(e.pointerId);

    // tap breve = selezione bersaglio/asteroide
    if (GAME._tapInfo && GAME._tapInfo.id === e.pointerId) {
      var dtms = performance.now() - GAME._tapInfo.t;
      var moved = Math.hypot(e.clientX - GAME._tapInfo.x, e.clientY - GAME._tapInfo.y);
      if (dtms < 350 && moved < 14 && !UI.anyPanelOpen() && !GAME.paused && GAME.player) {
        var w = RND.worldFromScreen(e.clientX, e.clientY);
        GAME.handleTap(w.x, w.y, false);
      }
      GAME._tapInfo = null;
    }
  };
  cv.addEventListener('pointerup', endPointer);
  cv.addEventListener('pointercancel', endPointer);

  window.addEventListener('blur', function () { GAME.keys = {}; });
};

GAME.showJoy = function (x, y) {
  var b = document.getElementById('joyBase'), k = document.getElementById('joyKnob');
  b.style.left = (x - 60) + 'px'; b.style.top = (y - 60) + 'px';
  k.style.left = (x - 26) + 'px'; k.style.top = (y - 26) + 'px';
  b.classList.remove('hidden'); k.classList.remove('hidden');
};
GAME.moveJoy = function (dx, dy) {
  var k = document.getElementById('joyKnob');
  k.style.left = (GAME.joy.ox + dx - 26) + 'px';
  k.style.top = (GAME.joy.oy + dy - 26) + 'px';
};
GAME.hideJoy = function () {
  document.getElementById('joyBase').classList.add('hidden');
  document.getElementById('joyKnob').classList.add('hidden');
};

// Selezione da tap/click: nemico → bersaglio; asteroide → mining; vuoto → solo desktop muove
GAME.handleTap = function (wx, wy, allowMove) {
  var ent = WORLD.entityAt(wx, wy, 22);
  if (ent) {
    GAME.mineTarget = null;
    GAME.selectNpc(ent);
    UI.toast('Bersaglio: ' + ent.name + (GAME.touchMode ? ' · FUOCO per attaccare' : ' · CTRL per attaccare'));
    return;
  }
  var a = WORLD.nearestAsteroid(wx, wy, 28);
  if (a) {
    GAME.selectNpc(null);
    GAME.mineTarget = a;
    GAME.moveTarget = { x: a.x, y: a.y };
    UI.toast('Mining: ' + DATA.ORES[a.ore].name + ' (' + GAME.fmt(GAME.orePrice(a.ore)) + ' CS)');
    return;
  }
  if (allowMove) {
    GAME.moveTarget = { x: wx, y: wy };   // solo desktop: su mobile ci sono joystick e minimappa
  } else {
    GAME.clearTarget(true);
  }
};

GAME.selectNpc = function (n) {
  GAME.selectedNpc = n || null;
  GAME.attacking = false;
  if (n) AUDIO.select();
  UI.updateTarget();
};

GAME.toggleAttack = function () {
  if (!GAME.selectedNpc || !GAME.selectedNpc.alive) {
    UI.toast('Seleziona prima un nemico');
    if (GAME.selectedNpc && !GAME.selectedNpc.alive) GAME.selectNpc(null);
    return;
  }
  GAME.attacking = !GAME.attacking;
  var fb = document.getElementById('btnFire');
  if (fb) fb.classList.toggle('on', GAME.attacking);
  UI.toast(GAME.attacking ? 'ATTACCO su ' + GAME.selectedNpc.name : 'Attacco fermato', 1100);
};

GAME.provokeNear = function (n) {
  n.hostile = true;
  var list = WORLD.allHostiles();
  for (var i = 0; i < list.length; i++) {
    var o = list[i];
    if (o === n || !o.alive) continue;
    var d = (o.x - n.x) * (o.x - n.x) + (o.y - n.y) * (o.y - n.y);
    if (d < 180 * 180) o.hostile = true;
  }
};

GAME.clearTarget = function (silent) {
  GAME.selectNpc(null);
  GAME.mineTarget = null;
  var fb = document.getElementById('btnFire');
  if (fb) fb.classList.remove('on');
  if (!silent) UI.toast('Bersaglio deselezionato', 900);
};

GAME.setAmmo = function (type) {
  var p = GAME.player;
  if (!p || p.ammo === type) return;
  p.ammo = type;
  GAME._noAmmoWarned = false;
  UI.updateAmmo();
  UI.toast('Munizioni ' + DATA.AMMO[type].name + ' ×' + DATA.AMMO[type].mult + ' · ne hai ' + (p.ammoCounts[type] || 0));
  SAVE.saveAccount(p);
};

// ── Accesso ───────────────────────────────────────────────────────
GAME.enter = function (name) {
  var acc = SAVE.loadAccount(name);
  GAME.player = acc;
  if (acc.admin) { acc.credits = DATA.ADMIN_CAP; acc.voidium = DATA.ADMIN_CAP; }
  SAVE.ensureFields(acc);
  WORLD.load();
  RND.buildEntities();          // crea gli sprite Pixi del mondo
  UI.hideLogin();
  UI.showHud();
  UI.updateAmmo();
  UI.message('Benvenuto, ' + acc.name + (acc.admin ? ' (ADMIN)' : ''), 2000);
  if (acc.admin) UI.toast('Account ADMIN: risorse illimitate', 2500);
  UI.updateHud(acc);
  GAME.clearTarget(true);
  GAME.lastT = performance.now();
  AUDIO.resume();
  AUDIO.startHum();

  if (!GAME._started) {
    GAME._started = true;
    RND.app.ticker.add(function () {
      var t = performance.now();
      var dt = Math.min(0.05, (t - GAME.lastT) / 1000);
      GAME.lastT = t;
      if (!GAME.paused && GAME.player) GAME.update(dt);
      RND.sync(dt, GAME.player);
      UI.drawMinimap();
      UI.updateTarget();
      GAME.autoSaveT += dt;
      if (GAME.autoSaveT > 10) {
        GAME.autoSaveT = 0;
        if (GAME.player) { SAVE.saveAccount(GAME.player); WORLD.syncGalaxy(); }
      }
    });
  }
};

// ── Statistiche derivate (una sola chiamata per frame) ─────────────
GAME.stats = function (p) {
  if (GAME._statsFrame === GAME._frame && GAME._statsP === p) return GAME._statsCache;
  GAME._statsFrame = GAME._frame;
  GAME._statsP = p;

  var ship = DATA.SHIPS[p.ship];
  var B = DATA.BASE_STATS;
  var dmg = 0, rate = 0, range = 0;
  var maxShield = B.shield, shieldRegen = B.shieldRegen;
  var maxEnergy = B.energy, energyRegen = B.energyRegen;
  var speedBoost = 0;
  var slots = p.slots || [];
  var i, key, mod;
  for (i = 0; i < slots.length; i++) {
    key = slots[i];
    if (!key) continue;
    if ((mod = DATA.LASERS[key])) { dmg += mod.dmg; if (mod.rate > rate) rate = mod.rate; if (mod.range > range) range = mod.range; }
    else if ((mod = DATA.SHIELDS[key])) { maxShield += mod.max; shieldRegen += mod.regen; }
    else if ((mod = DATA.GENERATORS[key])) { energyRegen += mod.regen; }
    else if ((mod = DATA.BATTERIES[key])) { maxEnergy += mod.max; }
    else if ((mod = DATA.ENGINES[key])) { speedBoost += mod.boost; }
  }
  var cfg = DATA.CONFIGS[p.config] || DATA.CONFIGS.assalto;
  var dmgMul = cfg.dmg, spdMul = cfg.speed, shdMul = cfg.shield;
  var now = Date.now();
  if (p.boosters && p.boosters.danno > now) dmgMul *= 1.25;
  if (p.boosters && p.boosters.velocita > now) spdMul *= 1.25;
  if (p.boosters && p.boosters.scudo > now) shdMul *= 1.4;
  GAME._statsCache = {
    maxHp: ship.maxHp,
    speed: (ship.speed + speedBoost) * spdMul,
    size: ship.size,
    dmg: Math.round(dmg * dmgMul),
    rate: rate || 1,
    range: range || 200,
    maxShield: Math.round(maxShield * shdMul),
    shieldRegen: shieldRegen,
    maxEnergy: maxEnergy,
    energyRegen: energyRegen
  };
  return GAME._statsCache;
};

// ── Booster / kit ───────────────────────────────────────────────────
GAME.boosterActive = function (p, key) { return !!(p.boosters && p.boosters[key] > Date.now()); };

GAME.buyBooster = function (key) {
  var p = GAME.player;
  var def = DATA.BOOSTERS[key];
  if (!def) return;
  if (!p.admin && p.voidium < def.voidium) { UI.toast('Voidium insufficiente'); return; }
  if (!p.admin) p.voidium -= def.voidium;
  p.boosters[key] = Date.now() + def.dur;
  UI.toast(def.name + ' attivo · ' + def.desc);
  UI.renderShop(); UI.updateHud(p); SAVE.saveAccount(p);
};

GAME.boosterTimeLeft = function (p, key) {
  var ms = (p.boosters ? (p.boosters[key] || 0) : 0) - Date.now();
  if (ms <= 0) return null;
  var h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return h + 'h ' + m + 'm';
};

GAME.useKit = function (key) {
  var p = GAME.player;
  var def = DATA.KITS[key];
  if (!def) return;
  if (!p.admin && p.credits < def.cost) { UI.toast('Crediti insufficienti'); return; }
  if (!p.admin) p.credits -= def.cost;
  var st = GAME.stats(p);
  if (key === 'repair') p.hp = Math.min(st.maxHp, p.hp + Math.round(st.maxHp * 0.6));
  else if (key === 'shield') p.shieldHp = st.maxShield;
  else if (key === 'energy') p.energy = st.maxEnergy;
  UI.toast(def.name + ' usato');
  UI.renderShop(); UI.updateHud(p); SAVE.saveAccount(p);
};

// ── Munizioni acquistabili ───────────────────────────────────────────
GAME.buyAmmo = function (type) {
  var p = GAME.player;
  var def = DATA.AMMO[type];
  if (!def) return;
  if (!p.admin && p.credits < def.cost) { UI.toast('Crediti insufficienti'); return; }
  if (!p.admin) p.credits -= def.cost;
  p.ammoCounts[type] = (p.ammoCounts[type] || 0) + def.pack;
  UI.toast('+' + def.pack + ' munizioni ' + def.name);
  UI.renderShop(); UI.updateAmmo(); SAVE.saveAccount(p);
};

// ── Livelli / rank / minerali ─────────────────────────────────────────
GAME.epForNextLevel = function (l) { return DATA.EP_FOR_LEVEL(l); };

GAME.gainEp = function (amount) {
  var p = GAME.player;
  p.ep += amount;
  var leveled = false;
  while (p.ep >= GAME.epForNextLevel(p.level)) {
    p.ep -= GAME.epForNextLevel(p.level);
    p.level++;
    leveled = true;
    AUDIO.levelUp();
    UI.toast('LIVELLO ' + p.level + '! Nuove orbite sbloccate', 2600);
  }
  if (leveled) { UI.updateHud(p); SAVE.saveAccount(p); }
  return leveled;
};

GAME.rankPoints = function (p) { return Math.floor((p.ep || 0) + (p.honor || 0) * 50 + p.kills * 200); };
GAME.rankTitle = function (p) {
  var pts = GAME.rankPoints(p), title = DATA.RANKS[0].title;
  for (var i = 0; i < DATA.RANKS.length; i++) if (pts >= DATA.RANKS[i].pts) title = DATA.RANKS[i].title;
  return title;
};

GAME.orePrice = function (oreKey) {
  var base = DATA.ORES[oreKey].value;
  var mult = Math.min(2.5, 1 + ((GAME.player && GAME.player.honor) || 0) / 2000);
  return Math.floor(base * mult);
};

GAME.toggleConfig = function () {
  var p = GAME.player;
  p.config = (p.config === 'assalto') ? 'velocita' : 'assalto';
  var cfg = DATA.CONFIGS[p.config];
  UI.toast('Configurazione: ' + cfg.name);
  UI.updateHud(p); SAVE.saveAccount(p);
};

GAME.sellOre = function (oreKey, amount) {
  var p = GAME.player;
  amount = amount || 1;
  if (!p.ores || (p.ores[oreKey] || 0) < amount) { UI.toast('Minerali insufficienti'); return; }
  p.ores[oreKey] -= amount;
  p.credits += GAME.orePrice(oreKey) * amount;
  UI.toast('Venduti ' + amount + ' ' + DATA.ORES[oreKey].name + ' · +' + GAME.fmt(GAME.orePrice(oreKey) * amount) + ' CS');
  UI.renderShop(); UI.updateHud(p); SAVE.saveAccount(p);
};

GAME.canAffordRecipe = function (recipeKey) {
  var p = GAME.player, r = DATA.RECIPES[recipeKey], k;
  if (!r) return false;
  for (k in r.cost) if (r.cost.hasOwnProperty(k)) {
    if (!p.ores || (p.ores[k] || 0) < r.cost[k]) return false;
  }
  return true;
};

GAME.refine = function (recipeKey) {
  var p = GAME.player, r = DATA.RECIPES[recipeKey], k;
  if (!GAME.canAffordRecipe(recipeKey)) { UI.toast('Ingredienti insufficienti'); return; }
  for (k in r.cost) if (r.cost.hasOwnProperty(k)) p.ores[k] -= r.cost[k];
  p.ores[r.out] = (p.ores[r.out] || 0) + 1;
  UI.toast('Raffinato 1 ' + DATA.ORES[r.out].name);
  UI.renderShop(); SAVE.saveAccount(p);
};

// ── Fabbrica Orbitale ───────────────────────────────────────────────
GAME.skylabProcess = function (p) {
  if (!p.skylab || !DATA.RECIPES[p.skylab.recipe]) return;
  var rate = DATA.SKYLAB[p.skylab.level].rate;
  var now = Date.now();
  var elapsed = (now - (p.skylab.lastTick || now)) / 1000;
  if (elapsed < 1) return;
  p.skylab.lastTick = now;
  var units = Math.floor(elapsed / 3600 * rate);
  var r = DATA.RECIPES[p.skylab.recipe], produced = 0, k;
  for (k = 0; k < units; k++) {
    if (!GAME.canAffordRecipe(p.skylab.recipe)) break;
    for (var ing in r.cost) if (r.cost.hasOwnProperty(ing)) p.ores[ing] -= r.cost[ing];
    p.ores[r.out] = (p.ores[r.out] || 0) + 1;
    produced++;
  }
  if (produced > 0) { UI.toast('Fabbrica: +' + produced + ' ' + DATA.ORES[r.out].name, 2000); UI.updateHud(p); }
};

GAME.skylabSetRecipe = function (rk) {
  var p = GAME.player;
  if (!DATA.RECIPES[rk]) return;
  p.skylab.recipe = rk;
  UI.toast('Fabbrica: produzione ' + DATA.ORES[DATA.RECIPES[rk].out].name);
  UI.renderShop(); SAVE.saveAccount(p);
};

GAME.skylabUpgrade = function () {
  var p = GAME.player;
  var next = DATA.SKYLAB[p.skylab.level + 1];
  if (!next) { UI.toast('Livello massimo'); return; }
  if (p.level < next.reqLevel) { UI.toast('Richiesto livello ' + next.reqLevel); return; }
  if (!p.admin && p.credits < next.cost) { UI.toast('Crediti insufficienti'); return; }
  if (!p.admin) p.credits -= next.cost;
  p.skylab.level++;
  UI.toast(next.name + ' attivata (' + next.rate + ' u/h)');
  UI.renderShop(); UI.updateHud(p); SAVE.saveAccount(p);
};

// ── Missioni ───────────────────────────────────────────────────────
GAME.generateMission = function (level) {
  var pool = DATA.MISSION_POOL;
  var tmpl = pool[Math.floor(Math.random() * pool.length)];
  var m = { type: tmpl.type, need: 0, have: 0, label: '', reward: { credits: 0, voidium: 0, ep: 0 }, claimable: false, secs: 0 };
  var base = 120 + level * 140;
  m.reward.credits = Math.round(base * (1 + Math.random() * 0.5));
  m.reward.voidium = Math.max(1, Math.round((1 + level * 0.35) * (0.6 + Math.random())));
  m.reward.ep = Math.round(level * (220 + Math.random() * 180));
  var low, high;

  if (tmpl.type === 'kill') {
    low = tmpl.gen.n[0] + Math.floor(level / 4);
    high = tmpl.gen.n[1] + Math.floor(level / 3);
    m.need = low + Math.floor(Math.random() * (high - low + 1));
    if (tmpl.gen.tier) { m.tier = tmpl.gen.tier; m.label = 'Abbatti ' + m.need + ' nemici di fascia ' + (m.tier[0] + 1) + '-' + (m.tier[1] + 1); }
    else m.label = 'Abbatti ' + m.need + ' nemici';
  } else if (tmpl.type === 'collect') {
    low = tmpl.gen.n[0] + Math.floor(level / 5);
    high = tmpl.gen.n[1] + Math.floor(level / 4);
    m.need = low + Math.floor(Math.random() * (high - low + 1));
    m.oreTier = tmpl.gen.oreTier;
    m.label = 'Raccogli ' + m.need + ' minerali di fascia ' + tmpl.gen.oreTier;
  } else if (tmpl.type === 'reach') {
    m.sector = Math.floor(Math.random() * DATA.SECTORS.length);
    m.need = 1; m.have = 0;
    m.label = 'Raggiungi: ' + DATA.SECTORS[m.sector].name;
    m.reward.credits = Math.round(base * 0.6);
    m.reward.ep = Math.round(m.reward.ep * 0.5);
  } else if (tmpl.type === 'survive') {
    m.secs = tmpl.gen.secs[0] + Math.floor(Math.random() * (tmpl.gen.secs[1] - tmpl.gen.secs[0])) + Math.floor(level * 1.5);
    m.need = m.secs;
    m.label = 'Sopravvivi ' + m.secs + 's in combattimento';
  }
  return m;
};

GAME.refreshMissionBoard = function () {
  var p = GAME.player, board = [], i;
  for (i = 0; i < 3; i++) board.push(GAME.generateMission(p.level));
  p.missionBoard = board;
  SAVE.saveAccount(p);
};

GAME.acceptMission = function (idx) {
  var p = GAME.player;
  if (!p.missionBoard || !p.missionBoard[idx]) return;
  if (p.mission) { UI.toast('Hai già una missione attiva'); return; }
  var m = p.missionBoard[idx];
  m.have = 0; m.secs = 0; m.claimable = false;
  p.mission = m; p.missionBoard = null;
  UI.toast('Missione: ' + m.label);
  UI.updateHud(p); SAVE.saveAccount(p);
};

GAME.claimMission = function () {
  var p = GAME.player;
  var m = p.mission;
  if (!m) return;
  if (!m.claimable) { UI.toast('Missione non completata'); return; }
  if (!p.admin) { p.credits += m.reward.credits; p.voidium += m.reward.voidium; }
  GAME.gainEp(m.reward.ep);
  UI.toast('Completata: +' + m.reward.credits + ' CS · +' + m.reward.voidium + ' VD · +' + m.reward.ep + ' EP');
  p.mission = null;
  GAME.refreshMissionBoard();
  UI.renderMissions(); UI.updateHud(p); SAVE.saveAccount(p);
};

GAME.trackCollect = function (oreKey, amount) {
  var p = GAME.player, m = p.mission;
  if (!m || m.claimable || m.type !== 'collect') return;
  if (m.oreTier !== DATA.ORES[oreKey].tier) return;
  m.have += amount;
  if (m.have >= m.need) { m.claimable = true; UI.toast('Missione completata! B per riscuotere'); }
  UI.updateHud(p);
};

GAME.trackKill = function (npcType) {
  var p = GAME.player, m = p.mission;
  if (!m || m.claimable || m.type !== 'kill') return;
  if (m.tier && !(npcType >= m.tier[0] && npcType <= m.tier[1])) return;
  m.have++;
  if (m.have >= m.need) { m.claimable = true; UI.toast('Missione completata! B per riscuotere'); }
  UI.updateHud(p);
};

GAME.trackMissionState = function (dt) {
  var p = GAME.player, m = p.mission;
  if (!m || m.claimable) return;
  if (m.type === 'reach') {
    if (WORLD.sectorIndexAt(p.x, p.y) === m.sector) {
      m.claimable = true; UI.toast('Missione completata! B per riscuotere'); UI.updateHud(p);
    }
  } else if (m.type === 'survive') {
    if (GAME.inCombat()) {
      m.secs -= dt;
      if (m.secs <= 0) { m.secs = 0; m.claimable = true; UI.toast('Missione completata! B per riscuotere'); UI.updateHud(p); }
    }
  }
};

GAME.inCombat = function () {
  var p = GAME.player, i, n;
  var list = WORLD.allHostiles();
  for (i = 0; i < list.length; i++) {
    n = list[i];
    if (!n.alive) continue;
    var dx = n.x - p.x, dy = n.y - p.y;
    if (dx * dx + dy * dy < (n.aggro * 1.2) * (n.aggro * 1.2)) return true;
  }
  return false;
};

// ── Drone ───────────────────────────────────────────────────────────
GAME.droneFire = function (dt) {
  var p = GAME.player;
  if (!p.drone || !DATA.DRONES[p.drone]) return;
  var def = DATA.DRONES[p.drone];
  GAME.droneCd -= dt;
  GAME.droneAngle += dt * 2.2;
  var target = null;
  if (GAME.attacking && GAME.selectedNpc && GAME.selectedNpc.alive) target = GAME.selectedNpc;
  else if (GAME.mineTarget && GAME.mineTarget.alive) target = GAME.mineTarget;
  if (!target) return;
  var dx = target.x - p.x, dy = target.y - p.y;
  if (dx * dx + dy * dy > def.range * def.range) return;
  if (GAME.droneCd > 0) return;
  GAME.droneCd = 1 / def.rate;
  var angle = Math.atan2(dy, dx);
  var ox = Math.cos(GAME.droneAngle) * 22, oy = Math.sin(GAME.droneAngle) * 22;
  WORLD.fireLaser(p.x + ox, p.y + oy, angle, def.dmg, def.color, 'drone', GAME.mineTarget === target);
};

GAME.droneCollect = function () {
  var p = GAME.player;
  if (!p.drone) return;
  var i, d;
  for (i = WORLD.drops.length - 1; i >= 0; i--) {
    d = WORLD.drops[i];
    if ((d.x - p.x) * (d.x - p.x) + (d.y - p.y) * (d.y - p.y) < 150 * 150) WORLD.collectDrop(d, p);
  }
};

// ── La Frattura ─────────────────────────────────────────────────────
GAME.isInGate = function () { return !!(GAME.player && GAME.player.gate && GAME.player.gate.inside); };

GAME.enterGate = function () {
  var p = GAME.player;
  if (p.level < DATA.GATE.reqLevel) { UI.toast('Richiesto livello ' + DATA.GATE.reqLevel); return; }
  if (GAME.isInGate()) return;
  if (!p.gate) p.gate = { wave: 1 };
  p.gate.inside = true;
  var c = DATA.GATE.portal;
  p.x = c.x; p.y = c.y;
  GAME.moveTarget = null; GAME.mineTarget = null;
  GAME.selectNpc(null);
  AUDIO.warp();
  var tiers = DATA.GATE_TIERS(p.level);
  WORLD.gateClear();
  WORLD.gateSpawnWave(2 + p.gate.wave, tiers[0], tiers[1]);
  UI.message('LA FRATTURA · ONDA ' + p.gate.wave + '/' + (DATA.GATE.waves + 1), 2200);
  SAVE.saveAccount(p);
};

GAME.exitGate = function () {
  var p = GAME.player;
  if (!GAME.isInGate()) return;
  WORLD.gateClear();
  p.gate = null;
  p.x = DATA.GATE.portal.x; p.y = DATA.GATE.portal.y;
  GAME.moveTarget = null;
  UI.toast('Uscito dalla Frattura');
  SAVE.saveAccount(p);
};

GAME.completeGate = function () {
  var p = GAME.player;
  var r = DATA.GATE_REWARD(p.level);
  if (!p.admin) { p.credits += r.credits; p.voidium += r.voidium; }
  p.honor += r.honor;
  p.gateParts = (p.gateParts || 0) + r.parts;
  GAME.gainEp(r.ep);
  UI.message('FRATTURA COMPLETATA! +' + r.parts + ' PARTI', 2600);
  AUDIO.levelUp();
  WORLD.gateClear();
  p.gate = null;
  p.x = DATA.GATE.portal.x; p.y = DATA.GATE.portal.y;
  GAME.moveTarget = null;
  UI.updateHud(p); SAVE.saveAccount(p);
};

GAME.killGateNpc = function (n) {
  n.alive = false;
  var p = GAME.player;
  WORLD.spawnDrop(n.x, n.y, 'credits', n.isBoss ? DATA.GATE.boss.reward : DATA.NPCS[n.type].reward);
  if (n.isBoss || Math.random() < (n.isBoss ? 1 : 0.2)) WORLD.spawnDrop(n.x, n.y, 'voidium', n.isBoss ? 6 : 1 + Math.floor(Math.random() * 2));
  if (!n.isBoss) WORLD.spawnDrop(n.x, n.y, 'ore', DATA.ASTEROID_ORE_AMOUNT, WORLD.pickOre(DATA.SECTORS[3]));
  p.kills++;
  p.honor = (p.honor || 0) + n.honor;
  GAME.gainEp(n.ep);
  GAME.trackKill(n.type);
  WORLD.spawnExplosion(n.x, n.y, n.color, n.isBoss ? 30 : 18);
  AUDIO.explosion(!!n.isBoss);
};

GAME.gateUpdate = function () {
  var p = GAME.player, g = p.gate;
  if (!g || !g.inside) return;
  var A = DATA.GATE.arena;
  p.x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, p.x));
  p.y = Math.max(A.y0 + 20, Math.min(A.y1 - 20, p.y));
  if (WORLD.gateAliveCount() > 0) return;
  var tiers = DATA.GATE_TIERS(p.level);
  if (g.wave < DATA.GATE.waves) {
    g.wave++;
    WORLD.gateSpawnWave(2 + g.wave, tiers[0], tiers[1]);
    UI.message('LA FRATTURA · ONDA ' + g.wave + '/' + (DATA.GATE.waves + 1), 1800);
  } else if (g.wave === DATA.GATE.waves) {
    g.wave++;
    WORLD.gateSpawnBoss();
    UI.message('BOSS: ' + DATA.GATE.boss.short + '!', 2400);
    AUDIO.bossAlert();
  } else {
    GAME.completeGate();
    return;
  }
  SAVE.saveAccount(p);
};

// ── Acquisto moduli ─────────────────────────────────────────────────
GAME.buy = function (type, key) {
  var p = GAME.player, admin = p.admin, def;
  switch (type) {
    case 'ship': def = DATA.SHIPS[key]; break;
    case 'laser': def = DATA.LASERS[key]; break;
    case 'shield': def = DATA.SHIELDS[key]; break;
    case 'gen': def = DATA.GENERATORS[key]; break;
    case 'batt': def = DATA.BATTERIES[key]; break;
    case 'eng': def = DATA.ENGINES[key]; break;
    case 'drone': def = DATA.DRONES[key]; break;
  }
  if (!def) return;
  if (!admin && (p.credits < def.cost || p.voidium < def.voidium)) { UI.toast('Risorse insufficienti'); return; }
  if (!admin) { p.credits -= def.cost; p.voidium -= def.voidium; }

  if (type === 'ship') {
    p.ship = key;
    if (p.owned.ship.indexOf(key) < 0) p.owned.ship.push(key);
    SAVE.resizeSlots(p);
    var st = GAME.stats(p);
    p.hp = st.maxHp; p.shieldHp = st.maxShield; p.energy = st.maxEnergy;
    UI.toast(def.name + ' acquistata!');
  } else if (type === 'drone') {
    p.drone = key;
    UI.toast(def.name + ' equipaggiato!');
  } else {
    if (!p.owned[type]) p.owned[type] = [];
    if (p.owned[type].indexOf(key) < 0) p.owned[type].push(key);
    UI.toast(def.name + ' comprato! Installalo nel tab NAVE');
  }
  UI.renderShop(); UI.updateHud(p); SAVE.saveAccount(p);
};

GAME.installModule = function (slotIdx, moduleKey) {
  var p = GAME.player;
  var n = DATA.SHIPS[p.ship].slots;
  if (slotIdx < 0 || slotIdx >= n) return;
  if (!Array.isArray(p.slots)) p.slots = [];
  p.slots[slotIdx] = moduleKey || '';
  var st = GAME.stats(p);
  if (p.shieldHp > st.maxShield) p.shieldHp = st.maxShield;
  if (p.energy > st.maxEnergy) p.energy = st.maxEnergy;
  UI.updateHud(p); UI.renderShop(); SAVE.saveAccount(p);
};

// ── Danno al giocatore ────────────────────────────────────────────────
GAME.hitPlayer = function (dmg) {
  var p = GAME.player;
  var rem = dmg;
  if (p.shieldHp > 0) {
    var sh = Math.min(p.shieldHp, rem);
    p.shieldHp -= sh; rem -= sh;
  }
  if (rem > 0) {
    p.hp -= rem;
    if (p.hp <= 0) { p.hp = 0; GAME.playerDie(); return true; }
  }
  return false;
};

GAME.playerDie = function (reason) {
  var p = GAME.player;
  var st = GAME.stats(p);
  UI.message(reason || 'NAVE DISTRUTTA!', 2200);
  AUDIO.death();
  if (!p.admin) p.credits = Math.floor(p.credits * 0.8);
  if (GAME.isInGate()) { WORLD.gateClear(); p.gate = null; }
  p.x = DATA.BASE.x; p.y = DATA.BASE.y;
  p.vx = 0; p.vy = 0;
  p.hp = st.maxHp; p.shieldHp = st.maxShield; p.energy = st.maxEnergy;
  GAME.moveTarget = null;
  SAVE.saveAccount(p); UI.updateHud(p);
};

// ── Tiro (con consumo munizioni + energia) ───────────────────────────
GAME.ammoMult = function () {
  var p = GAME.player;
  return (p && DATA.AMMO[p.ammo]) ? DATA.AMMO[p.ammo].mult : 1;
};
GAME.ammoColor = function () {
  var p = GAME.player;
  return (p && DATA.AMMO[p.ammo]) ? DATA.AMMO[p.ammo].color : '#4fd6ff';
};

// Verifica e consuma 1 munizione del tipo corrente; ritorna il tipo effettivo o null
GAME.consumeAmmo = function () {
  var p = GAME.player;
  if (p.admin) return p.ammo;
  if ((p.ammoCounts[p.ammo] || 0) > 0) {
    p.ammoCounts[p.ammo]--;
    return p.ammo;
  }
  // fallback automatico sul primo tipo disponibile
  var order = ['white', 'green', 'blue', 'red'];
  for (var i = 0; i < order.length; i++) {
    if ((p.ammoCounts[order[i]] || 0) > 0) {
      p.ammo = order[i];
      p.ammoCounts[order[i]]--;
      GAME._noAmmoWarned = false;
      UI.updateAmmo();
      return order[i];
    }
  }
  if (!GAME._noAmmoWarned) {
    GAME._noAmmoWarned = true;
    UI.toast('Munizioni esaurite! Comprale nel negozio (C)', 2600);
  }
  return null;
};

GAME.fire = function () {
  var p = GAME.player;
  var st = GAME.stats(p);

  var hasEnemy = GAME.attacking && GAME.selectedNpc && GAME.selectedNpc.alive;
  var hasAst = GAME.mineTarget && GAME.mineTarget.alive;
  if (!hasEnemy && !hasAst) return;

  // energia: senza energia si spara a raffica ridotta (rate metà)
  if (p.energy < DATA.ENERGY_PER_SHOT) {
    if (GAME.fireCd <= 0) GAME.fireCd = 2 / st.rate;
    return;
  }
  var type = GAME.consumeAmmo();
  if (!type) return;
  p.energy -= DATA.ENERGY_PER_SHOT;

  var mult = DATA.AMMO[type] ? DATA.AMMO[type].mult : 1;
  var dmg = Math.round(st.dmg * mult);
  var color = DATA.AMMO[type] ? DATA.AMMO[type].color : '#fff';

  if (hasEnemy) {
    var n = GAME.selectedNpc;
    var dx = n.x - p.x, dy = n.y - p.y;
    if (dx * dx + dy * dy < st.range * st.range) {
      WORLD.fireLaser(p.x, p.y, Math.atan2(dy, dx), dmg, color, 'player', false);
    }
    return;
  }
  var a = GAME.mineTarget;
  var ax = a.x - p.x, ay = a.y - p.y;
  if (ax * ax + ay * ay < st.range * st.range) {
    WORLD.fireLaser(p.x, p.y, Math.atan2(ay, ax), dmg, color, 'player', true);
  }
};

// ── Morte NPC ─────────────────────────────────────────────────────────
GAME.killNpc = function (n) {
  n.alive = false;
  n.respawnAt = Date.now() + (12 + Math.random() * 8) * 1000;
  var npc = DATA.NPCS[n.type];
  var p = GAME.player;
  WORLD.spawnDrop(n.x, n.y, 'credits', npc.reward);
  if (Math.random() < npc.voidiumChance) WORLD.spawnDrop(n.x, n.y, 'voidium', 1 + Math.floor(Math.random() * 3));
  p.kills++;
  p.honor = (p.honor || 0) + npc.honor;
  GAME.gainEp(npc.ep);
  GAME.trackKill(n.type);
  WORLD.spawnExplosion(n.x, n.y, npc.color, 18);
  AUDIO.explosion(npc.size >= 23);
  UI.message('+' + npc.reward + ' CS · +' + npc.ep + ' EP', 1100);
  if (GAME.selectedNpc === n) GAME.selectNpc(null);
};

// ── Mining ─────────────────────────────────────────────────────────────
GAME.mineAsteroid = function (a, dmg) {
  var p = GAME.player;
  a.res -= dmg;
  if (a.res <= 0) {
    a.alive = false;
    a.respawnAt = Date.now() + (20 + Math.random() * 15) * 1000;
    var amount = DATA.ASTEROID_ORE_AMOUNT + (WORLD.isRichSpot(a.x, a.y) ? 2 : 0);
    if (GAME.boosterActive(p, 'mining')) amount += Math.ceil(amount * 0.5);
    WORLD.spawnDrop(a.x, a.y, 'ore', amount, a.ore);
    if (a.uri) WORLD.spawnDrop(a.x, a.y, 'voidium', 1);
    WORLD.spawnExplosion(a.x, a.y, DATA.ORES[a.ore].color, 12);
    AUDIO.explosion(false);
    UI.message('+' + amount + ' ' + DATA.ORES[a.ore].name, 900);
    if (GAME.mineTarget === a) GAME.mineTarget = null;
  }
};

GAME.hitLaser = function (l) {
  var i, n;
  if (l.isAst) {
    for (i = 0; i < WORLD.asteroids.length; i++) {
      n = WORLD.asteroids[i];
      if (!n.alive) continue;
      if ((l.x - n.x) * (l.x - n.x) + (l.y - n.y) * (l.y - n.y) < (n.r + 4) * (n.r + 4)) {
        GAME.mineAsteroid(n, l.dmg);
        return true;
      }
    }
    return false;
  }
  var idx;
  for (i = 0; i < WORLD.npcs.length; i++) {
    n = WORLD.npcs[i];
    if (!n.alive) continue;
    if ((l.x - n.x) * (l.x - n.x) + (l.y - n.y) * (l.y - n.y) < (n.size + 4) * (n.size + 4)) {
      n.hp -= l.dmg;
      GAME.provokeNear(n);
      AUDIO.hit();
      if (n.hp <= 0) GAME.killNpc(n);
      return true;
    }
  }
  for (i = 0; i < WORLD.gateNpcs.length; i++) {
    n = WORLD.gateNpcs[i];
    if (!n.alive) continue;
    if ((l.x - n.x) * (l.x - n.x) + (l.y - n.y) * (l.y - n.y) < (n.size + 4) * (n.size + 4)) {
      n.hp -= l.dmg;
      AUDIO.hit();
      if (n.hp <= 0) GAME.killGateNpc(n);
      return true;
    }
  }
  for (i = 0; i < WORLD.bosses.length; i++) {
    n = WORLD.bosses[i];
    if (!n.alive) continue;
    if ((l.x - n.x) * (l.x - n.x) + (l.y - n.y) * (l.y - n.y) < (n.size + 4) * (n.size + 4)) {
      n.hp -= l.dmg;
      AUDIO.hit();
      if (n.hp <= 0) { WORLD.killEventBoss(n, GAME.player); GAME.trackMissionBoss(); }
      return true;
    }
  }
  return false;
};

GAME.trackMissionBoss = function () {};

// ── Update principale ───────────────────────────────────────────────────
GAME.update = function (dt) {
  GAME._frame = (GAME._frame || 0) + 1;
  var p = GAME.player;
  var st = GAME.stats(p);
  var ax = 0, ay = 0, thrusting = false;

  if (!p.vx) p.vx = 0;
  if (!p.vy) p.vy = 0;

  // input manuale: tastiera o joystick touch
  var manual = false;
  var k = GAME.keys;
  if (k['W'] || k['KeyW'] || k['ArrowUp'] || k['Up']) { ay -= 1; manual = true; }
  if (k['S'] || k['KeyS'] || k['ArrowDown'] || k['Down']) { ay += 1; manual = true; }
  if (k['A'] || k['KeyA'] || k['ArrowLeft'] || k['Left']) { ax -= 1; manual = true; }
  if (k['D'] || k['KeyD'] || k['ArrowRight'] || k['Right']) { ax += 1; manual = true; }

  var joyMag = Math.hypot(GAME.joy.dx, GAME.joy.dy);
  var usingJoystick = GAME.joy.active && joyMag > 0.12;

  var outOfEnergy = p.energy <= 0.5;

  if (usingJoystick) {
    manual = true; thrusting = true;
    ax = GAME.joy.dx; ay = GAME.joy.dy;
    p.vx += ax * st.speed * dt * 10 * joyMag;
    p.vy += ay * st.speed * dt * 10 * joyMag;
    p.angle = Math.atan2(ay, ax);
  } else if (manual) {
    GAME.moveTarget = null;
    thrusting = true;
    var mag = Math.sqrt(ax * ax + ay * ay);
    ax /= mag; ay /= mag;
    p.vx += ax * st.speed * dt * 10;
    p.vy += ay * st.speed * dt * 10;
    p.angle = Math.atan2(ay, ax);
  } else if (GAME.moveTarget) {
    var mdx = GAME.moveTarget.x - p.x, mdy = GAME.moveTarget.y - p.y;
    var dist = Math.sqrt(mdx * mdx + mdy * mdy);
    if (dist < 22) GAME.moveTarget = null;
    else {
      thrusting = true;
      p.vx += (mdx / dist) * st.speed * dt * 10;
      p.vy += (mdy / dist) * st.speed * dt * 10;
      p.angle = Math.atan2(mdy, mdx);
    }
  }

  // ENERGIA REALE: la spinta consuma energia; a secco si viaggia più lenti
  if (thrusting && !outOfEnergy) {
    p.energy = Math.max(0, p.energy - DATA.BOOST_ENERGY_PER_SEC * dt);
  }

  // attrito + limite velocità (ridotto se a secco di energia)
  p.vx *= (1 - 2.5 * dt);
  p.vy *= (1 - 2.5 * dt);
  var spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
  var maxSpd = st.speed * (outOfEnergy && thrusting ? 0.55 : 1);
  if (spd > maxSpd) { p.vx = p.vx / spd * maxSpd; p.vy = p.vy / spd * maxSpd; }

  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.x = Math.max(20, Math.min(DATA.WORLD_W - 20, p.x));
  p.y = Math.max(20, Math.min(DATA.WORLD_H - 20, p.y));

  // GRAVITÀ DEL BUCO NERO
  var swallowed = !GAME.isInGate() && WORLD.applyGravity(p, dt);
  if (swallowed) {
    GAME.playerDie('INGHIOTTITO DAL BUCO NERO!');
    WORLD.spawnExplosion(DATA.BLACKHOLE.x, DATA.BLACKHOLE.y, '#a78bfa', 34);
    AUDIO.death();
    return;
  }

  // rigenerazioni
  p.shieldHp = Math.min(st.maxShield, p.shieldHp + st.shieldRegen * dt);
  p.energy = Math.min(st.maxEnergy, p.energy + st.energyRegen * dt);

  // intensità dell'hum audio vicino al BH
  AUDIO.setHumIntensity(WORLD.gravIntensityAt(p.x, p.y));

  // fabbrica passiva
  GAME.skylabT = (GAME.skylabT || 0) + dt;
  if (GAME.skylabT > 5) { GAME.skylabT = 0; GAME.skylabProcess(p); }

  // fuoco
  GAME.fireCd -= dt;
  if (GAME.fireCd <= 0) { GAME.fireCd = 1 / st.rate; GAME.fire(); }

  GAME.droneFire(dt);
  GAME.droneCollect();
  GAME.trackMissionState(dt);
  GAME.gateUpdate();

  // hint portale frattura
  if (!GAME.isInGate()) {
    var gc = DATA.GATE.portal;
    var gdx = gc.x - p.x, gdy = gc.y - p.y;
    if (gdx * gdx + gdy * gdy < 200 * 200 && !GAME._gateHint) {
      GAME._gateHint = true;
      if (p.level >= DATA.GATE.reqLevel) UI.toast('La Frattura è vicina: premi G o il pulsante ⌘ FRATTURA', 3000);
      else UI.toast('Frattura: richiesto livello ' + DATA.GATE.reqLevel, 3000);
    }
    if (gdx * gdx + gdy * gdy >= 260 * 260) GAME._gateHint = false;

    // avviso orizzonte degli eventi imminente
    var bhDist = Math.hypot(p.x - DATA.BLACKHOLE.x, p.y - DATA.BLACKHOLE.y);
    var warnEl = document.getElementById('bhWarn');
    if (warnEl) warnEl.classList.toggle('on', bhDist < DATA.BLACKHOLE.horizon + 160);
  }

  WORLD.update(dt, p);

  // collisioni laser giocatore/drone
  var i, l;
  for (i = WORLD.lasers.length - 1; i >= 0; i--) {
    l = WORLD.lasers[i];
    if (l.owner === 'player' || l.owner === 'drone') {
      if (GAME.hitLaser(l)) WORLD.lasers.splice(i, 1);
    }
  }

  // orbita corrente
  var secIdx = WORLD.sectorIndexAt(p.x, p.y);
  var sec = DATA.SECTORS[secIdx];
  UI.setSector(sec.name + ' · LIV.' + sec.reqLevel);
  if (p.level < sec.reqLevel && GAME._sectorWarn !== sec.name) {
    GAME._sectorWarn = sec.name;
    UI.toast('Attenzione: ' + sec.name + ' richiede livello ' + sec.reqLevel + ' (sei ' + p.level + ')', 2600);
  }
  if (GAME._sectorWarn === sec.name && p.level >= sec.reqLevel) GAME._sectorWarn = '';

  UI.updateHud(p);
};

// ── Init ───────────────────────────────────────────────────────────────
GAME.init = function () {
  GAME.touches = new Map();   // pointerId → {x,y} (per pinch)
  GAME.pinch = null;
  GAME._frame = 0;

  RND.init(document.getElementById('game-container'), function (webgl) {
    if (!webgl) {
      var warn = document.getElementById('webglWarn');
      if (warn) warn.classList.remove('hidden');
    }
  });

  GAME.initInput();
  GAME.initTouchButtons();
  UI.init();
  UI.showLogin();
};

GAME.initTouchButtons = function () {
  // FUOCO: alterna l'attacco sul bersaglio selezionato
  var bf = document.getElementById('btnFire');
  if (bf) bf.addEventListener('click', function () {
    AUDIO.resume();
    if (!GAME.player) return;
    GAME.toggleAttack();
  });

  // deseleziona
  var bx = document.getElementById('btnDeselect');
  if (bx) bx.addEventListener('click', function () { GAME.clearTarget(); });

  // scorciatoie pannelli
  var mapBtn = function (id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };
  mapBtn('btnShop', function () { if (!$('shop') || UI.anyPanelOpen()) UI.closeAllPanels(); UI.openShop(); });
  mapBtn('btnMap', function () { if (UI.anyPanelOpen()) UI.closeAllPanels(); UI.openMap(); });
  mapBtn('btnMissions', function () { if (UI.anyPanelOpen()) UI.closeAllPanels(); UI.openMissions(); });
  mapBtn('btnGate', function () { if (GAME.isInGate()) GAME.exitGate(); else GAME.enterGate(); });
  mapBtn('btnConfig', function () { GAME.toggleConfig(); });
};
