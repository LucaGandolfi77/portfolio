// ═══════════════════════════════════════════════════════════════
// BLACKHOLE ORBIT — Mondo condiviso
// Genera e persiste asteroidi/NPC, gestisce gravità del buco nero,
// respawn e l'evento periodico degli Arcorti del Vuoto.
// ═══════════════════════════════════════════════════════════════

var WORLD = {};

WORLD.asteroids = [];
WORLD.npcs = [];
WORLD.drops = [];
WORLD.lasers = [];
WORLD.explosions = [];
WORLD.galaxy = null;
WORLD.bossEventT = 0;
WORLD.bosses = [];          // mini-boss evento (runtime)

// --- Costruzione galassia ---------------------------------------------------
WORLD.pickOre = function (sec) {
  var pool = sec.ores;
  return pool[Math.floor(Math.random() * pool.length)];
};

WORLD.sectorIndexAt = function (x, y) {
  for (var j = 0; j < DATA.SECTORS.length; j++) {
    if (x >= DATA.SECTORS[j].x0 && x <= DATA.SECTORS[j].x1 &&
        y >= DATA.SECTORS[j].y0 && y <= DATA.SECTORS[j].y1) return j;
  }
  return 0;
};

// Gli asteroidi entro BH_RICH_RADIUS dal buco nero sono "ricchi":
// più risorse e probabilità Voidium triplicata (rischio/ricompensa).
WORLD.isRichSpot = function (x, y) {
  var dx = x - DATA.BLACKHOLE.x, dy = y - DATA.BLACKHOLE.y;
  return (dx * dx + dy * dy) < DATA.BH_RICH_RADIUS * DATA.BH_RICH_RADIUS;
};

WORLD.newAsteroid = function (x, y) {
  var secIdx = WORLD.sectorIndexAt(x, y);
  var rich = WORLD.isRichSpot(x, y);
  return {
    x: x, y: y,
    r: 14 + Math.random() * 18,
    res: (30 + Math.floor(Math.random() * 40)) + (rich ? 25 : 0),
    uri: Math.random() < DATA.ASTEROID_VOIDIUM_CHANCE * (rich ? 3 : 1),
    ore: WORLD.pickOre(DATA.SECTORS[secIdx]),
    alive: true,
    respawnAt: 0
  };
};

WORLD.newGalaxy = function () {
  var g = { asteroids: [], npcs: [] }, i, x, y, count, secIdx, sec;
  for (i = 0; i < 96; i++) {
    // evita di generare asteroidi dentro l'orizzonte degli eventi
    do {
      x = 120 + Math.random() * (DATA.WORLD_W - 240);
      y = 120 + Math.random() * (DATA.WORLD_H - 240);
    } while (Math.hypot(x - DATA.BLACKHOLE.x, y - DATA.BLACKHOLE.y) < DATA.BLACKHOLE.horizon + 90);
    g.asteroids.push(WORLD.newAsteroid(x, y));
  }
  count = 26;
  for (i = 0; i < count; i++) {
    do {
      x = 200 + Math.random() * (DATA.WORLD_W - 400);
      y = 200 + Math.random() * (DATA.WORLD_H - 400);
    } while (Math.hypot(x - DATA.BLACKHOLE.x, y - DATA.BLACKHOLE.y) < DATA.BLACKHOLE.horizon + 120);
    secIdx = WORLD.sectorIndexAt(x, y);
    sec = DATA.SECTORS[secIdx];
    g.npcs.push({
      type: sec.tierMin + Math.floor(Math.random() * (sec.tierMax - sec.tierMin + 1)),
      x: x, y: y,
      alive: true,
      respawnAt: 0
    });
  }
  return g;
};

WORLD.load = function () {
  WORLD.galaxy = SAVE.loadWorld();
  if (!WORLD.galaxy || !WORLD.galaxy.asteroids || !WORLD.galaxy.asteroids.length) {
    WORLD.galaxy = WORLD.newGalaxy();
    SAVE.saveWorld(WORLD.galaxy);
  }
  WORLD.buildRuntime();
};

// Runtime dalla galassia persistente (stato vivo: alive/respawnAt conservati)
WORLD.buildRuntime = function () {
  var i, a, n, npcDef;
  WORLD.asteroids = [];
  WORLD.npcs = [];
  WORLD.drops = [];
  WORLD.lasers = [];
  WORLD.explosions = [];
  WORLD.bosses = [];
  WORLD.bossEventT = 0;

  for (i = 0; i < WORLD.galaxy.asteroids.length; i++) {
    a = WORLD.galaxy.asteroids[i];
    WORLD.asteroids.push({
      x: a.x, y: a.y, r: a.r,
      res: typeof a.res === 'number' ? a.res : 35,
      uri: !!a.uri,
      ore: a.ore || 'umbrium',
      alive: a.alive !== false,
      respawnAt: a.respawnAt || 0
    });
  }
  for (i = 0; i < WORLD.galaxy.npcs.length; i++) {
    n = WORLD.galaxy.npcs[i];
    npcDef = DATA.NPCS[n.type];
    if (!npcDef) continue;
    WORLD.npcs.push(WORLD.makeNpc(n.type, n.x, n.y, {
      alive: n.alive !== false,
      respawnAt: n.respawnAt || 0,
      isGate: false
    }));
  }
};

// Factory unificata NPC (mondo, gate e boss-event)
WORLD.makeNpc = function (type, x, y, opts) {
  opts = opts || {};
  var def = type >= 0 ? DATA.NPCS[type] : DATA.GATE.boss;
  return {
    id: WORLD._nid = (WORLD._nid || 0) + 1,
    type: type,
    name: opts.name || def.name,
    hp: def.hp, maxHp: def.hp,
    x: x, y: y,
    vx: 0, vy: 0,
    angle: Math.random() * Math.PI * 2,
    speed: def.speed,
    dmg: def.dmg,
    aggro: def.aggro,
    range: def.range,
    color: def.color,
    size: def.size,
    ep: opts.ep !== undefined ? opts.ep : def.ep,
    honor: opts.honor !== undefined ? opts.honor : def.honor,
    isGate: !!opts.isGate,
    isBoss: !!opts.isBoss,
    isEvent: !!opts.isEvent,
    alive: opts.alive !== false,
    hostile: !!opts.hostile,
    shootCd: Math.random() * 0.8,
    wanderT: 0,
    targetX: 0, targetY: 0,
    respawnAt: opts.respawnAt || 0
  };
};

// Riscrive lo stato runtime nella galassia persistente (chiamato all'autosave)
WORLD.syncGalaxy = function () {
  var i;
  for (i = 0; i < WORLD.asteroids.length; i++) {
    var a = WORLD.asteroids[i], ga = WORLD.galaxy.asteroids[i];
    if (!ga) continue;
    ga.res = a.res; ga.alive = a.alive; ga.respawnAt = a.respawnAt;
    ga.uri = a.uri; ga.ore = a.ore;
  }
  for (i = 0; i < WORLD.npcs.length; i++) {
    var n = WORLD.npcs[i], gn = WORLD.galaxy.npcs[i];
    if (!gn) continue;
    gn.alive = n.alive; gn.respawnAt = n.respawnAt;
  }
  SAVE.saveWorld(WORLD.galaxy);
};

// --- Gravitazione del buco nero ----------------------------------------------
// Applica un'accelerazione verso il BH. Ritorna true se il corpo è caduto
// dentro l'orizzonte degli eventi.
WORLD.applyGravity = function (body, dt) {
  var BH = DATA.BLACKHOLE;
  var dx = BH.x - body.x, dy = BH.y - body.y;
  var dist = Math.sqrt(dx * dx + dy * dy) || 1;
  if (dist < BH.horizon) return true;
  if (dist < BH.falloff) {
    var f = BH.pull / (dist * dist);
    body.vx += (dx / dist) * f * dt;
    body.vy += (dy / dist) * f * dt;
  }
  return false;
};

WORLD.gravIntensityAt = function (x, y) {
  var BH = DATA.BLACKHOLE;
  var d = Math.hypot(x - BH.x, y - BH.y);
  return Math.max(0, Math.min(1, 1 - (d - BH.horizon) / (BH.falloff - BH.horizon)));
};

// --- Query --------------------------------------------------------------------
WORLD.nearestAsteroid = function (x, y, maxR) {
  var best = null, bd = maxR * maxR, i, a, d;
  for (i = 0; i < WORLD.asteroids.length; i++) {
    a = WORLD.asteroids[i];
    if (!a.alive) continue;
    d = (a.x - x) * (a.x - x) + (a.y - y) * (a.y - y);
    if (d < bd) { bd = d; best = a; }
  }
  return best;
};

WORLD.npcById = function (id) {
  var all = WORLD.npcs.concat(WORLD.gateNpcs).concat(WORLD.bosses);
  for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  return null;
};

WORLD.allHostiles = function () {
  return WORLD.npcs.concat(WORLD.gateNpcs).concat(WORLD.bosses);
};

// Trova l'entità nemica vicina al punto (per tap/click). Ritorna l'oggetto o null.
WORLD.entityAt = function (x, y, radius) {
  var best = null, bd = radius * radius, i, n, d;
  var list = WORLD.allHostiles();
  for (i = 0; i < list.length; i++) {
    n = list[i];
    if (!n.alive) continue;
    d = (n.x - x) * (n.x - x) + (n.y - y) * (n.y - y);
    if (d < bd) { bd = d; best = n; }
  }
  return best;
};

// --- Drop -----------------------------------------------------------------------
WORLD.spawnDrop = function (x, y, type, amount, ore) {
  WORLD.drops.push({ x: x, y: y, type: type, amount: amount, ore: ore || null, life: 45 });
};

WORLD.collectDrop = function (d, player) {
  if (d.type === 'credits') player.credits += d.amount;
  else if (d.type === 'voidium') player.voidium += d.amount;
  else if (d.type === 'ore') {
    if (!player.ores) player.ores = SAVE.emptyOres();
    player.ores[d.ore] = (player.ores[d.ore] || 0) + d.amount;
    if (typeof GAME !== 'undefined' && GAME.trackCollect) GAME.trackCollect(d.ore, d.amount);
  }
  var idx = WORLD.drops.indexOf(d);
  if (idx >= 0) WORLD.drops.splice(idx, 1);
  if (typeof AUDIO !== 'undefined') AUDIO.pickup();
};

// --- Esplosioni ---------------------------------------------------------------------
WORLD.spawnExplosion = function (x, y, color, n) {
  var i, particles = [], angle, spd;
  n = n || 14;
  for (i = 0; i < n; i++) {
    angle = Math.random() * Math.PI * 2;
    spd = 30 + Math.random() * 90;
    particles.push({
      x: x, y: y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 0.5 + Math.random() * 0.5,
      maxLife: 1,
      color: color
    });
  }
  WORLD.explosions.push({ x: x, y: y, particles: particles, t: 0 });
};

// --- Laser -----------------------------------------------------------------------------
WORLD.fireLaser = function (x, y, angle, dmg, color, owner, isAst) {
  WORLD.lasers.push({
    x: x, y: y,
    vx: Math.cos(angle) * 480, vy: Math.sin(angle) * 480,
    dmg: dmg, color: color, owner: owner,
    isAst: !!isAst, life: 1
  });
  if (typeof AUDIO !== 'undefined') {
    if (owner === 'npc') AUDIO.enemyLaser();
    else AUDIO.laser(owner === 'drone' ? 900 : 720);
  }
};

// --- La Frattura (arena) ------------------------------------------------------------------
WORLD.gateNpcs = [];
WORLD.gateClear = function () { WORLD.gateNpcs = []; };

WORLD.gateSpawnWave = function (count, tierMin, tierMax) {
  var A = DATA.GATE.arena, i, type, x, y;
  for (i = 0; i < count; i++) {
    type = tierMin + Math.floor(Math.random() * (tierMax - tierMin + 1));
    x = A.x0 + 60 + Math.random() * (A.x1 - A.x0 - 120);
    y = A.y0 + 60 + Math.random() * (A.y1 - A.y0 - 120);
    WORLD.gateNpcs.push(WORLD.makeNpc(type, x, y, { isGate: true, hostile: true }));
  }
};

WORLD.gateSpawnBoss = function () {
  var b = DATA.GATE.boss, A = DATA.GATE.arena;
  WORLD.gateNpcs.push(WORLD.makeNpc(-1, (A.x0 + A.x1) / 2, (A.y0 + A.y1) / 2, {
    isGate: true, isBoss: true, hostile: true,
    ep: 5000, honor: 800, name: b.short
  }));
};

WORLD.gateAliveCount = function () {
  var c = 0;
  for (var i = 0; i < WORLD.gateNpcs.length; i++) if (WORLD.gateNpcs[i].alive) c++;
  return c;
};

// --- Evento Boss: Archonti del Vuoto ---------------------------------------------------------
// Ogni BOSS_EVENT.interval secondi di gioco, nell'Orbita dell'Orizzonte
// compaiono mini-boss annunciati. Restano finché non vengono distrutti.
WORLD.updateBossEvent = function (dt, player, onSpawn) {
  var alive = WORLD.bosses.some(function (b) { return b.alive; });
  if (alive) return;
  WORLD.bossEventT += dt;
  if (WORLD.bossEventT < DATA.BOSS_EVENT.interval) return;
  WORLD.bossEventT = 0;

  var st = DATA.BOSS_EVENT.stats;
  for (var i = 0; i < DATA.BOSS_EVENT.count; i++) {
    var x = DATA.SECTORS[3].x0 + 150 + Math.random() * (DATA.SECTORS[3].x1 - DATA.SECTORS[3].x0 - 300);
    var y = DATA.SECTORS[3].y0 + 150 + Math.random() * (DATA.SECTORS[3].y1 - DATA.SECTORS[3].y0 - 300);
    WORLD.bosses.push(WORLD.makeNpc(4, x, y, {
      isEvent: true, isBoss: false, hostile: true,
      name: st.name + ' ' + (i + 1),
      hp: st.hp, dmg: st.dmg, speed: st.speed,
      aggro: st.aggro, range: st.range, color: st.color, size: st.size,
      ep: st.ep, honor: st.honor
    }));
  }
  if (onSpawn) onSpawn(st.name, DATA.BOSS_EVENT.count);
};

WORLD.killEventBoss = function (n, player) {
  var st = DATA.BOSS_EVENT.stats;
  WORLD.spawnDrop(n.x, n.y, 'credits', st.reward);
  if (Math.random() < st.voidiumChance) WORLD.spawnDrop(n.x, n.y, 'voidium', 4 + Math.floor(Math.random() * 5));
  WORLD.spawnDrop(n.x, n.y, 'ore', DATA.ASTEROID_ORE_AMOUNT + 2, 'horizonium');
  player.kills++;
  player.honor = (player.honor || 0) + n.honor;
  GAME.gainEp(n.ep);
  GAME.trackKill(n.type);
  WORLD.spawnExplosion(n.x, n.y, n.color, 26);
  AUDIO.explosion(true);
};

// --- AI NPC --------------------------------------------------------------------------------------
WORLD.stepNpc = function (n, dt, player) {
  var dx = player.x - n.x, dy = player.y - n.y;
  var dist = Math.sqrt(dx * dx + dy * dy);

  if (n.hostile && dist < n.aggro) {
    n.angle = Math.atan2(dy, dx);
    n.vx = Math.cos(n.angle) * n.speed;
    n.vy = Math.sin(n.angle) * n.speed;
    n.shootCd -= dt;
    if (n.shootCd <= 0 && dist < n.range) {
      n.shootCd = 1.4;
      WORLD.fireLaser(n.x, n.y, n.angle, n.dmg, n.color, 'npc');
    }
  } else {
    n.wanderT -= dt;
    if (n.wanderT <= 0) {
      n.wanderT = 2 + Math.random() * 3;
      n.targetX = n.x + (Math.random() - 0.5) * 500;
      n.targetY = n.y + (Math.random() - 0.5) * 500;
      if (n.isGate) {
        n.targetX = Math.max(DATA.GATE.arena.x0 + 30, Math.min(DATA.GATE.arena.x1 - 30, n.targetX));
        n.targetY = Math.max(DATA.GATE.arena.y0 + 30, Math.min(DATA.GATE.arena.y1 - 30, n.targetY));
      } else {
        n.targetX = Math.max(60, Math.min(DATA.WORLD_W - 60, n.targetX));
        n.targetY = Math.max(60, Math.min(DATA.WORLD_H - 60, n.targetY));
      }
    }
    dx = n.targetX - n.x; dy = n.targetY - n.y;
    var wd = Math.sqrt(dx * dx + dy * dy);
    if (wd > 20) {
      n.angle = Math.atan2(dy, dx);
      n.vx = Math.cos(n.angle) * n.speed * 0.4;
      n.vy = Math.sin(n.angle) * n.speed * 0.4;
    } else { n.vx = 0; n.vy = 0; }
  }

  // anche i nemici risentono della gravità del buco nero (fuori dal gate)
  if (!n.isGate && WORLD.applyGravity(n, dt)) {
    n.alive = false;
    n.respawnAt = Date.now() + (12 + Math.random() * 8) * 1000;
    WORLD.spawnExplosion(n.x, n.y, n.color, 16);
    return;
  }

  n.x += n.vx * dt;
  n.y += n.vy * dt;
  if (n.isGate) {
    n.x = Math.max(DATA.GATE.arena.x0 + 20, Math.min(DATA.GATE.arena.x1 - 20, n.x));
    n.y = Math.max(DATA.GATE.arena.y0 + 20, Math.min(DATA.GATE.arena.y1 - 20, n.y));
  } else {
    n.x = Math.max(30, Math.min(DATA.WORLD_W - 30, n.x));
    n.y = Math.max(30, Math.min(DATA.WORLD_H - 30, n.y));
  }
};

// --- Aggiornamento mondo --------------------------------------------------------------------------
WORLD.update = function (dt, player) {
  var i, n, d, l, ex;

  for (i = 0; i < WORLD.npcs.length; i++) {
    n = WORLD.npcs[i];
    if (!n.alive) continue;
    WORLD.stepNpc(n, dt, player);
  }
  for (i = 0; i < WORLD.gateNpcs.length; i++) {
    n = WORLD.gateNpcs[i];
    if (!n.alive) continue;
    WORLD.stepNpc(n, dt, player);
  }
  for (i = 0; i < WORLD.bosses.length; i++) {
    n = WORLD.bosses[i];
    if (!n.alive) continue;
    WORLD.stepNpc(n, dt, player);
  }

  // laser
  for (i = WORLD.lasers.length - 1; i >= 0; i--) {
    l = WORLD.lasers[i];
    l.x += l.vx * dt;
    l.y += l.vy * dt;
    l.life -= dt;
    if (l.life <= 0) { WORLD.lasers.splice(i, 1); continue; }
    if (l.owner === 'npc') {
      var pdx = l.x - player.x, pdy = l.y - player.y;
      if (pdx * pdx + pdy * pdy < 15 * 15) {
        WORLD.lasers.splice(i, 1);
        AUDIO.hit();
        if (GAME.hitPlayer(l.dmg)) WORLD.spawnExplosion(player.x, player.y, '#ff8a5b', 8);
      }
    }
  }

  // respawn NPC mondo (persistito)
  var now = Date.now();
  for (i = 0; i < WORLD.npcs.length; i++) {
    n = WORLD.npcs[i];
    if (!n.alive) {
      if (!n.respawnAt) n.respawnAt = now + 14000;
      if (now >= n.respawnAt) {
        var def = DATA.NPCS[n.type];
        n.alive = true;
        n.hp = def.hp; n.maxHp = def.hp;
        n.x = 200 + Math.random() * (DATA.WORLD_W - 400);
        n.y = 200 + Math.random() * (DATA.WORLD_H - 400);
        if (WORLD.isRichSpot(n.x, n.y)) { n.x += 500; }
        n.wanderT = 0;
        n.hostile = false;
        n.respawnAt = 0;
      }
    }
  }

  // respawn asteroidi (persistito)
  for (i = 0; i < WORLD.asteroids.length; i++) {
    var a = WORLD.asteroids[i];
    if (!a.alive) {
      if (!a.respawnAt) a.respawnAt = now + (20 + Math.random() * 15) * 1000;
      if (now >= a.respawnAt) {
        var fresh = WORLD.newAsteroid(a.x, a.y);
        a.res = fresh.res; a.uri = fresh.uri; a.ore = fresh.ore;
        a.alive = true; a.respawnAt = 0;
      }
    }
  }

  // drops: la gravità li curva leggermente verso il buco nero
  for (i = WORLD.drops.length - 1; i >= 0; i--) {
    d = WORLD.drops[i];
    d.life -= dt;
    if (d.life <= 0) { WORLD.drops.splice(i, 1); continue; }
    var BH = DATA.BLACKHOLE;
    var bdx = BH.x - d.x, bdy = BH.y - d.y;
    var bd = Math.sqrt(bdx * bdx + bdy * bdy) || 1;
    if (bd < BH.falloff * 1.4) {
      d.x += (bdx / bd) * 14 * dt;
      d.y += (bdy / bd) * 14 * dt;
    }
    var pdx2 = d.x - player.x, pdy2 = d.y - player.y;
    if (pdx2 * pdx2 + pdy2 * pdy2 < 26 * 26) WORLD.collectDrop(d, player);
  }

  // esplosioni
  for (i = WORLD.explosions.length - 1; i >= 0; i--) {
    ex = WORLD.explosions[i];
    ex.t += dt;
    var anyAlive = false;
    for (var p = 0; p < ex.particles.length; p++) {
      var part = ex.particles[p];
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.vx *= (1 - 2 * dt);
      part.vy *= (1 - 2 * dt);
      part.life -= dt;
      if (part.life > 0) anyAlive = true;
    }
    if (!anyAlive) WORLD.explosions.splice(i, 1);
  }

  // evento boss periodico
  WORLD.updateBossEvent(dt, player, function (name, cnt) {
    UI.message('⚠ ' + cnt + '× ' + name + ' nell\'Orizzonte!', 3200);
    AUDIO.bossAlert();
  });
};
