// ═══════════════════════════════════════════════════════════════
// BLACKHOLE ORBIT — Renderer PixiJS v8 (WebGL/WebGPU)
// Port del layer grafico da Canvas2D: entità GPU, bloom additivo,
// disco d'accrescimento particellare e camera con zoom fluido.
// ═══════════════════════════════════════════════════════════════

var RND = {};
var SPRITE = {};

RND.app = null;
RND.zoom = 1;
RND.targetZoom = 1;
RND.ready = false;

// Layer del mondo (ordine di disegno)
RND.layers = {};

// ═══════════════ UTILITÀ COLORE ═══════════════

function shadeColor(hex, pct) {
  var num = parseInt(hex.slice(1), 16);
  var r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  r = Math.max(0, Math.min(255, Math.round(r + (pct / 100) * 255)));
  g = Math.max(0, Math.min(255, Math.round(g + (pct / 100) * 255)));
  b = Math.max(0, Math.min(255, Math.round(b + (pct / 100) * 255)));
  return (r << 16) | (g << 8) | b;
}

SPRITE.adminColor = '#ffd54a';

// ═══════════════ INIT ═══════════════

RND.init = function (containerEl, onReady) {
  var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  var app = new PIXI.Application({
    background: '#05070d',
    resizeTo: window,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 2),
    autoDensity: true,
    powerPreference: 'high-performance'
  });
  containerEl.appendChild(app.canvas);   // Pixi v8: .view è stato rimosso
  RND.app = app;

  // Layer in ordine di profondità
  var L = RND.layers;
  L.starsFar   = new PIXI.Container();   // stelle lontane (parallax ridotto)
  L.stars      = new PIXI.Container();
  L.bh         = new PIXI.Container();   // buco nero + disco d'accrescimento
  L.basePortal = new PIXI.Container();
  L.asteroids  = new PIXI.Container();
  L.drops      = new PIXI.Container();
  L.npcs       = new PIXI.Container();
  L.gateNpcs   = new PIXI.Container();
  L.lasers     = new PIXI.Container();
  L.fx         = new PIXI.Container();
  L.player     = new PIXI.Container();
  L.uiWorld    = new PIXI.Container();   // anelli di selezione, gittate, destinazioni

  Object.keys(L).forEach(function (k) { app.stage.addChild(L[k]); });

  // Il contenitore mondo gestisce la camera (pivot al centro schermo)
  RND.world = new PIXI.Container();
  Object.keys(L).forEach(function (k) { RND.world.addChild(L[k]); });
  app.stage.addChild(RND.world);

  RND.buildStars();
  RND.buildBlackhole();

  window.addEventListener('resize', function () { RND.onResize(); });

  if (typeof PIXI !== 'undefined' && !app.renderer.type) {
    // WebGL non disponibile: PIXI.Application lancia già errore prima di qui
  }
  RND.ready = true;
  if (onReady) onReady(isWebGLAvailable());
};

function isWebGLAvailable() {
  try {
    var c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

RND.onResize = function () {
  if (!RND.ready) return;
  RND.centerCamera();
};

RND.centerCamera = function () {
  var w = RND.app.renderer.width / (RND.app.renderer.resolution || 1);
  var h = RND.app.renderer.height / (RND.app.renderer.resolution || 1);
  RND.world.position.set(w / 2, h / 2);
};

RND.screenSize = function () {
  var r = RND.app ? RND.app.renderer : { width: window.innerWidth, height: window.innerHeight };
  return { w: r.width / (r.resolution || 1), h: r.height / (r.resolution || 1) };
};

// Conversione coordinate schermo → mondo (tenendo conto di zoom e camera)
RND.worldFromScreen = function (sx, sy) {
  var s = RND.screenSize();
  return {
    x: RND.camX + (sx - s.w / 2) / RND.zoom,
    y: RND.camY + (sy - s.h / 2) / RND.zoom
  };
};

// Zoom con clamp (pinch su mobile, rotella su desktop)
RND.setZoom = function (z) {
  RND.targetZoom = Math.max(0.55, Math.min(1.9, z));
};
RND.pinchZoom = function (factor) {
  RND.setZoom(RND.targetZoom * factor);
};

// ═══════════════ STELLE (due layer parallasse) ═══════════════

RND.buildStars = function () {
  SPRITE.starsFar = [];
  SPRITE.stars = [];
  var gFar = new PIXI.Graphics();
  var gNear = new PIXI.Graphics();
  var i;
  for (i = 0; i < 170; i++) {
    SPRITE.starsFar.push({ x: Math.random() * DATA.WORLD_W, y: Math.random() * DATA.WORLD_H, a: 0.18 + Math.random() * 0.3 });
  }
  for (i = 0; i < 260; i++) {
    SPRITE.stars.push({
      x: Math.random() * DATA.WORLD_W,
      y: Math.random() * DATA.WORLD_H,
      r: Math.random() * 1.4 + 0.3,
      a: 0.25 + Math.random() * 0.7
    });
  }
  SPRITE.starsFar.forEach(function (s) {
    gFar.beginFill(0xbfd0ff, s.a); gFar.drawCircle(s.x, s.y, 1); gFar.endFill();
  });
  SPRITE.stars.forEach(function (s) {
    gNear.beginFill(0xffffff, s.a); gNear.drawCircle(s.x, s.y, s.r); gNear.endFill();
  });
  RND.layers.starsFar.addChild(gFar);
  RND.layers.stars.addChild(gNear);

  // nebulose soft (pochi cerchi grandi sfocati via alpha bassa)
  var neb = new PIXI.Graphics();
  var hues = [0x7c5cff, 0x22d3ee, 0xff6ec7];
  for (i = 0; i < 6; i++) {
    neb.beginFill(hues[i % 3], 0.05);
    neb.drawCircle(Math.random() * DATA.WORLD_W, Math.random() * DATA.WORLD_H, 220 + Math.random() * 260);
    neb.endFill();
  }
  RND.layers.starsFar.addChildAt(neb, 0);
};

// ═══════════════ BUCO NERO + DISCO D'ACCRESCIMENTO ═══════════════

RND.buildBlackhole = function () {
  var BH = DATA.BLACKHOLE;
  var c = new PIXI.Container();
  c.position.set(BH.x, BH.y);

  // alone gravitazionale (gradiente radiale pre-renderizzato)
  var glowTex = RND.radialTexture(420, ['rgba(124,92,255,0.30)', 'rgba(124,92,255,0)']);
  var glow = new PIXI.Sprite(glowTex);
  glow.anchor.set(0.5);
  glow.width = glow.height = 900;
  c.addChild(glow);

  // disco d'accrescimento: particelle in orbita (ellisse inclinata)
  var disk = new PIXI.Container();
  disk.scale.y = 0.42;                       // prospettiva inclinata
  var nParts = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 70 : 120;
  SPRITE.diskParts = [];
  for (var i = 0; i < nParts; i++) {
    var p = new PIXI.Graphics();
    var hue = [0xffd54a, 0xff8a3c, 0xffffff, 0x7cd6ff][i % 4];
    p.beginFill(hue, 0.5 + Math.random() * 0.5);
    p.drawCircle(0, 0, 1.2 + Math.random() * 2.2);
    p.endFill();
    var orbit = 135 + Math.random() * 150;
    SPRITE.diskParts.push({
      g: p,
      orbit: orbit,
      speed: (BH.spinSpeed * (240 / orbit)) * (Math.random() < 0.94 ? 1 : -1),
      phase: Math.random() * Math.PI * 2
    });
    disk.addChild(p);
  }
  // due anelli luminosi del disco
  [150, 225].forEach(function (rr, idx) {
    var ring = new PIXI.Graphics();
    ring.lineStyle(2.5 - idx, idx === 0 ? 0xffc46b : 0x7cd6ff, 0.35 - idx * 0.1);
    ring.drawEllipse(0, 0, rr, rr);
    disk.addChild(ring);
  });
  c.addChild(disk);
  SPRITE.bhDisk = disk;

  // orizzonte degli eventi: cerchio nero assoluto + bordo viola pulsante
  var hole = new PIXI.Graphics();
  hole.beginFill(0x000000);
  hole.drawCircle(0, 0, BH.horizon);
  hole.endFill();
  hole.beginFill(0x000000, 0.92);
  hole.drawCircle(0, 0, BH.horizon + 14);
  hole.endFill();
  var rim = new PIXI.Graphics();
  rim.lineStyle(3, 0xa78bfa, 0.9);
  rim.drawCircle(0, 0, BH.horizon + 2);
  c.addChild(hole);
  c.addChild(rim);
  SPRITE.bhRim = rim;

  RND.layers.bh.addChild(c);
  SPRITE.blackhole = c;
};

// Texture radiale riutilizzabile (alone morbido)
RND.radialTexture = function (size, stops) {
  var cv = document.createElement('canvas');
  cv.width = cv.height = size;
  var ctx = cv.getContext('2d');
  var g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(function (st) { g.addColorStop(st[0], st[1]); });
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return PIXI.Texture.from(cv);
};

// ═══════════════ NAVI ═══════════════

// Costruisce un Container-nave (poligoni fedeli al disegno originale).
SPRITE.makeShip = function (colorHex, scale) {
  scale = scale || 1;
  var color = parseInt(String(colorHex).replace('#', ''), 16);
  var dark = shadeColor(colorHex, -28);
  var darker = shadeColor(colorHex, -45);

  var c = new PIXI.Container();

  // fiamma del propulsore (dietro lungo -X), visibile solo in spinta
  var flame = new PIXI.Graphics();
  flame.beginFill(0xffb43c, 0.95);
  flame.moveTo(-scale * 0.75, -scale * 0.16);
  flame.lineTo(-scale * 0.75 - scale * 0.75, 0);
  flame.lineTo(-scale * 0.75, scale * 0.16);
  flame.closePath();
  flame.endFill();
  flame.beginFill(0xfff0b4, 0.9);
  flame.moveTo(-scale * 0.75, -scale * 0.10);
  flame.lineTo(-scale * 0.75 - scale * 0.45, 0);
  flame.lineTo(-scale * 0.75, scale * 0.10);
  flame.closePath();
  flame.endFill();
  flame.visible = false;
  c.addChild(flame);
  SPRITE.flameRef(c, flame);

  // ali posteriori
  var wings = new PIXI.Graphics();
  wings.beginFill(dark);
  wings.moveTo(-scale * 0.25, -scale * 0.10);
  wings.lineTo(-scale * 0.95, -scale * 0.55);
  wings.lineTo(-scale * 0.60, 0);
  wings.lineTo(-scale * 0.95, scale * 0.55);
  wings.lineTo(-scale * 0.25, scale * 0.10);
  wings.closePath();
  wings.endFill();
  wings.lineStyle(1, 0xffffff, 0.22);
  wings.drawRect(0, 0, 0, 0);
  c.addChild(wings);

  // scafo principale
  var hull = new PIXI.Graphics();
  hull.beginFill(color);
  hull.moveTo(scale * 1.05, 0);
  hull.lineTo(scale * 0.35, -scale * 0.38);
  hull.lineTo(-scale * 0.5, -scale * 0.30);
  hull.lineTo(-scale * 0.7, 0);
  hull.lineTo(-scale * 0.5, scale * 0.30);
  hull.lineTo(scale * 0.35, scale * 0.38);
  hull.closePath();
  hull.endFill();
  hull.lineStyle(1.2, 0xffffff, 0.38);
  hull.moveTo(scale * 1.05, 0);
  hull.lineTo(scale * 0.35, -scale * 0.38);
  hull.lineTo(-scale * 0.5, -scale * 0.30);
  hull.lineTo(-scale * 0.7, 0);
  hull.lineTo(-scale * 0.5, scale * 0.30);
  hull.lineTo(scale * 0.35, scale * 0.38);
  hull.closePath();
  // linea di accento sul dorso
  hull.lineStyle(Math.max(1, scale * 0.06), 0xffffff, 0.32);
  hull.moveTo(scale * 0.85, 0);
  hull.lineTo(-scale * 0.45, 0);
  c.addChild(hull);

  // cabina
  var cab = new PIXI.Graphics();
  cab.beginFill(0xaae6ff, 0.88);
  cab.moveTo(scale * 0.45, -scale * 0.18);
  cab.quadraticCurveTo(scale * 0.72, 0, scale * 0.45, scale * 0.18);
  cab.closePath();
  cab.endFill();
  c.addChild(cab);

  // ugelli
  var noz = new PIXI.Graphics();
  noz.beginFill(darker);
  noz.drawRect(-scale * 0.75, -scale * 0.2, scale * 0.12, scale * 0.4);
  noz.endFill();
  c.addChild(noz);

  return c;
};

// salva il riferimento alla fiamma come proprietà nascosta del Container
SPRITE.flameRef = function (container, flame) {
  container._flame = flame;
};
SPRITE.setThrust = function (shipC, on) {
  if (shipC && shipC._flame) {
    shipC._flame.visible = !!on;
    if (on) shipC._flame.scale.x = 0.7 + Math.random() * 0.6;
  }
};

// Barra HP sopra una nave
SPRITE.makeHpBar = function (size) {
  var g = new PIXI.Graphics();
  g._w = size * 2;
  return g;
};
SPRITE.drawHpBar = function (g, w, frac, colorHex) {
  g.clear();
  g.beginFill(0x000000, 0.55);
  g.drawRect(-w, -(g._offY || 24), w * 2, 4);
  g.endFill();
  if (frac > 0) {
    g.beginFill(parseInt(String(colorHex).replace('#', ''), 16), 1);
    g.drawRect(-w, -(g._offY || 24), w * 2 * Math.max(0, Math.min(1, frac)), 4);
    g.endFill();
  }
};

// ═══════════════ ASTEROIDI ═══════════════

SPRITE.makeAsteroid = function (r, oreColorHex) {
  var rot = r * 0.7, n = 9;
  var g = new PIXI.Graphics();
  g.beginFill(0x6b5b4e);
  for (var i = 0; i <= n; i++) {
    var a = (i / n) * Math.PI * 2 + rot;
    var rad = r * (0.75 + 0.25 * Math.abs(Math.sin(a * 3 + rot)));
    var px = Math.cos(a) * rad, py = Math.sin(a) * rad;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath();
  g.endFill();
  // venature del minerale
  if (oreColorHex) {
    var oc = parseInt(String(oreColorHex).replace('#', ''), 16);
    g.lineStyle(2, oc, 0.5);
    for (i = 0; i < 3; i++) {
      var va = rot + i * 2.1;
      g.moveTo(Math.cos(va) * r * 0.25, Math.sin(va) * r * 0.25);
      g.lineTo(Math.cos(va) * r * 0.85, Math.sin(va) * r * 0.85);
    }
  }
  g.lineStyle(1.5, 0x3d3128, 1);
  for (i = 0; i <= n; i++) {
    var aa = (i / n) * Math.PI * 2 + rot;
    var rad2 = r * (0.75 + 0.25 * Math.abs(Math.sin(aa * 3 + rot)));
    if (i === 0) g.moveTo(Math.cos(aa) * rad2, Math.sin(aa) * rad2);
    else g.lineTo(Math.cos(aa) * rad2, Math.sin(aa) * rad2);
  }
  return g;
};

// ═══════════════ DROP ═══════════════

SPRITE.makeDrop = function (type, oreColorHex) {
  var g = new PIXI.Graphics();
  if (type === 'credits') {
    g.beginFill(0xffe97a); g.drawCircle(0, 0, 5); g.endFill();
    g.lineStyle(1, 0xb8860b); g.drawCircle(0, 0, 5);
  } else if (type === 'voidium') {
    g.beginFill(0xc58bff);
    g.moveTo(0, -6); g.lineTo(5, 0); g.lineTo(0, 6); g.lineTo(-5, 0);
    g.closePath(); g.endFill();
    g.lineStyle(1, 0x7a4fd0);
    g.moveTo(0, -6); g.lineTo(5, 0); g.lineTo(0, 6); g.lineTo(-5, 0);
    g.closePath();
  } else {
    var oc = oreColorHex ? parseInt(String(oreColorHex).replace('#', ''), 16) : 0xc58bff;
    g.beginFill(oc); g.drawCircle(0, 0, 5); g.endFill();
    g.lineStyle(1, 0x000000, 0.5); g.drawCircle(0, 0, 5);
  }
  return g;
};

// ═══════════════ LASER ═══════════════

SPRITE.makeLaser = function (colorHex) {
  var col = parseInt(String(colorHex).replace('#', ''), 16);
  var g = new PIXI.Graphics();
  g.beginFill(col, 0.95);
  g.drawRect(-14, -1.1, 14, 2.2);
  g.endFill();
  g.beginFill(0xffffff, 0.9);
  g.drawCircle(0, 0, 2.4);
  g.endFill();
  // alone additivo
  var halo = new PIXI.Sprite(RND.radialTexture(24, [['0', hexToRgbaStr(colorHex, 0.55)], ['1', 'rgba(0,0,0,0)']]));
  halo.anchor.set(0.5);
  halo.blendMode = PIXI.BLEND_MODES.ADD;
  halo.scale.set(0.9);
  g.addChildAt(halo, 0);
  return g;
};

function hexToRgbaStr(hex, a) {
  var n = parseInt(String(hex).replace('#', ''), 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}

// ═══════════════ ESPLOSIONI ═══════════════

SPRITE.makeExplosion = function (ex) {
  var c = new PIXI.Container();
  ex.particles.forEach(function (p) {
    var col = parseInt(String(p.color).replace('#', ''), 16);
    var g = new PIXI.Graphics();
    g.beginFill(col);
    g.drawCircle(0, 0, 2 + 3 * (p.life / p.maxLife));
    g.endFill();
    g.x = p.x; g.y = p.y;
    g._p = p;
    c.addChild(g);
  });
  return c;
};

// ═══════════════ BASE E PORTALE ═══════════════

SPRITE.makeBase = function () {
  var c = new PIXI.Container();
  var halo = new PIXI.Graphics();
  halo.beginFill(0x2fd3ff, 0.13);
  halo.drawCircle(0, 0, 27);
  halo.endFill();
  var core = new PIXI.Graphics();
  core.beginFill(0x1a3a52);
  core.drawCircle(0, 0, 16);
  core.endFill();
  core.lineStyle(2, 0x2fd3ff, 1);
  core.drawCircle(0, 0, 16);
  c.addChild(halo); c.addChild(core);
  var label = new PIXI.Text('BASE', { fontFamily: 'sans-serif', fontSize: 9, fontWeight: 'bold', fill: 0x2fd3ff });
  label.anchor.set(0.5);
  label.y = 1;
  c.addChild(label);
  return c;
};

SPRITE.makePortal = function () {
  var c = new PIXI.Container();
  var halo = new PIXI.Graphics();
  halo.beginFill(0x9f6bff, 0.22);
  halo.drawCircle(0, 0, 30);
  halo.endFill();
  c.addChild(halo);
  var core = new PIXI.Graphics();
  core.beginFill(0x9f6bff);
  core.drawCircle(0, 0, 10);
  core.endFill();
  c.addChild(core);
  var dashed = new PIXI.Graphics();
  c.addChild(dashed);
  c._dash = dashed;
  var label = new PIXI.Text('LA FRATTURA', { fontFamily: 'sans-serif', fontSize: 10, fontWeight: 'bold', fill: 0xc9a6ff });
  label.anchor.set(0.5);
  label.y = -40;
  c.addChild(label);
  return c;
};

// ═══════════════ CERCHI PUNTINATI ═══════════════

SPRITE.dashedCircle = function (g, x, y, r, color, alpha, dashFrac) {
  var segs = Math.max(12, Math.floor(r / 3));
  var step = (Math.PI * 2) / segs;
  var fill = parseInt(String(color).replace('#', ''), 16);
  g.lineStyle(1.6, fill, alpha);
  for (var a = 0; a < Math.PI * 2; a += step * 2) {
    g.arc(x, y, r, a, a + step * (dashFrac || 0.55));
  }
};

// ═══════════════ COSTRUZIONE ENTITÀ ═══════════════

RND.buildEntities = function () {
  var L = RND.layers;

  // pulizia layer dinamici
  [L.basePortal, L.asteroids, L.npcs, L.gateNpcs, L.lasers, L.fx, L.player, L.uiWorld].forEach(function (layer) {
    while (layer.children.length) layer.removeChildAt(0).destroy({ children: true });
  });

  var p = GAME.player;
  if (!p) return;

  // giocatore
  var pColor = p.admin ? SPRITE.adminColor : DATA.SHIPS[p.ship].color;
  var shipSize = DATA.SHIPS[p.ship].size;
  var pc = SPRITE.makeShip(pColor, shipSize);
  L.player.addChild(pc);
  SPRITE._playerShip = pc;

  // drone
  SPRITE._droneShip = null;
  if (p.drone && DATA.DRONES[p.drone]) {
    var dc = SPRITE.makeShip(DATA.DRONES[p.drone].color, 7);
    L.player.addChild(dc);
    SPRITE._droneShip = dc;
  }

  // base e portale
  var base = SPRITE.makeBase();
  base.position.set(DATA.BASE.x, DATA.BASE.y);
  L.basePortal.addChild(base);

  var portal = SPRITE.makePortal();
  portal.position.set(DATA.GATE.portal.x, DATA.GATE.portal.y);
  L.basePortal.appendChild(portal);
  SPRITE._portalSpr = portal;

  // asteroidi
  WORLD.asteroids.forEach(function (a) {
    a._spr = null; // creato piggy in sync quando vivo
  });

  // npc mondo
  WORLD.npcs.forEach(function (n) { RND.attachNpc(n, L.npcs); });
};

RND.attachNpc = function (n, layer) {
  n._spr = SPRITE.makeShip(n.color, n.size);
  var bar = new PIXI.Graphics();
  bar._offY = -(n.size + 10);
  bar._w = n.size;
  n._spr.addChild(bar);
  n._hpBar = bar;
  layer.addChild(n._spr);
};

RND.layerForNpc = function (n) {
  return (n.isGate || n.isEvent) ? RND.layers.gateNpcs : RND.layers.npcs;
};

// ═══════════════ SYNC PER FRAME ═══════════════

RND.sync = function (dt, p) {
  if (!RND.ready || !p) return;
  var L = RND.layers;

  // zoom fluido
  RND.zoom += (RND.targetZoom - RND.zoom) * Math.min(1, dt * 8);
  var s = RND.screenSize();
  var viewW = s.w / RND.zoom, viewH = s.h / RND.zoom;

  // camera che segue il giocatore (clampata ai bordi del mondo)
  var camX, camY;
  if (viewW >= DATA.WORLD_W) camX = (DATA.WORLD_W - viewW) / 2;
  else camX = Math.max(0, Math.min(DATA.WORLD_W - viewW, p.x - viewW / 2));
  if (viewH >= DATA.WORLD_H) camY = (DATA.WORLD_H - viewH) / 2;
  else camY = Math.max(0, Math.min(DATA.WORLD_H - viewH, p.y - viewH / 2));
  RND.camX = camX; RND.camY = camY;

  RND.world.scale.set(RND.zoom);
  RND.world.pivot.set(camX, camY);
  RND.centerCamera();

  // parallasse stelle lontane (si muovono al 30% della camera)
  L.starsFar.position.set(camX * 0.7, camY * 0.7);

  // ── buco nero: disco rotante + bordo pulsante ──
  var t = performance.now() / 1000;
  SPRITE.diskParts.forEach(function (part) {
    part.phase += part.speed * dt;
    part.g.x = Math.cos(part.phase) * part.orbit;
    part.g.y = Math.sin(part.phase) * part.orbit;
    part.g.alpha = 0.45 + 0.4 * Math.abs(Math.sin(part.phase * 2));
  });
  SPRITE.bhDisk.rotation = t * 0.05;
  SPRITE.bhRim.alpha = 0.75 + 0.25 * Math.sin(t * 2.2);

  // portale pulsante
  if (SPRITE._portalSpr && SPRITE._portalSpr._dash) {
    var dd = SPRITE._portalSpr._dash;
    dd.clear();
    dd.lineStyle(2, 0x9f6bff, 0.9);
    var rr = 30 * (1 + 0.12 * Math.sin(t * 3));
    for (var ang = 0; ang < Math.PI * 2; ang += Math.PI / 9) {
      dd.arc(0, 0, rr, ang, ang + Math.PI / 18);
    }
  }

  // ── asteroidi (sprite piggyback sull'oggetto runtime) ──
  WORLD.asteroids.forEach(function (a) {
    if (a.alive && !a._spr) {
      a._spr = SPRITE.makeAsteroid(a.r, DATA.ORES[a.ore] ? DATA.ORES[a.ore].color : '#c58bff');
      L.asteroids.addChild(a._spr);
    }
    if (a._spr) {
      a._spr.visible = a.alive;
      if (!a.alive && a._spr.parent) { /* resta ma invisibile */ }
    }
  });

  // ── NPC mondo ──
  WORLD.npcs.forEach(function (n) {
    if (n.alive && !n._spr) RND.attachNpc(n, L.npcs);
    RND.updateNpcSprite(n);
  });

  // ── NPC frattura + boss evento (lista dinamica) ──
  var dynList = WORLD.gateNpcs.concat(WORLD.bosses);
  dynList.forEach(function (n) {
    if (n.alive && !n._spr) RND.attachNpc(n, RND.layerForNpc(n));
    RND.updateNpcSprite(n);
  });

  // rimuovi gli sprite dei morti da più di 3s (danno tempo di vedere l'esplosione)
  WORLD.npcs.concat(WORLD.gateNpcs).concat(WORLD.bosses).forEach(function (n) {
    if (!n.alive && n._spr) {
      n._deadT = (n._deadT || 0) + dt;
      if (n._deadT > 3) {
        n._spr.destroy({ children: true });
        n._spr = null; n._hpBar = null; n._deadT = 0;
      }
    } else if (n.alive) n._deadT = 0;
  });

  // ── giocatore ──
  if (SPRITE._playerShip) {
    SPRITE._playerShip.x = p.x;
    SPRITE._playerShip.y = p.y;
    SPRITE._playerShip.rotation = p.angle;
    SPRITE.setThrust(SPRITE._playerShip, GAME.isThrusting());
  }

  // drone in orbita
  if (SPRITE._droneShip) {
    if (!p.drone) { SPRITE._droneShip.destroy({ children: true }); SPRITE._droneShip = null; }
    else {
      var dox = Math.cos(GAME.droneAngle) * 24, doy = Math.sin(GAME.droneAngle) * 24;
      SPRITE._droneShip.x = p.x + dox;
      SPRITE._droneShip.y = p.y + doy;
      SPRITE._droneShip.rotation = p.angle + GAME.droneAngle;
      SPRITE.setThrust(SPRITE._droneShip, true);
    }
  } else if (p.drone && DATA.DRONES[p.drone]) {
    SPRITE._droneShip = SPRITE.makeShip(DATA.DRONES[p.drone].color, 7);
    L.player.addChild(SPRITE._droneShip);
  }

  // ── laser (creazione/distruzione piggyback) ──
  WORLD.lasers.forEach(function (l) {
    if (!l._spr) {
      l._spr = SPRITE.makeLaser(l.color);
      L.lasers.addChild(l._spr);
    }
    l._spr.x = l.x; l._spr.y = l.y;
    l._spr.rotation = Math.atan2(l.vy, l.vx);
  });
  sweepOrphans(L.lasers, WORLD.lasers);

  // ── drops ──
  WORLD.drops.forEach(function (d) {
    if (!d._spr) {
      d._spr = SPRITE.makeDrop(d.type, d.ore ? DATA.ORES[d.ore].color : null);
      d._spr._baseScale = 1;
      L.drops.addChild(d._spr);
    }
    var pulse = 1 + 0.25 * Math.sin(performance.now() / 180 + d.x);
    d._spr.x = d.x; d._spr.y = d.y;
    d._spr.scale.set(pulse);
  });
  sweepOrphans(L.drops, WORLD.drops);

  // ── esplosioni ──
  WORLD.explosions.forEach(function (ex) {
    if (!ex._spr) {
      ex._spr = SPRITE.makeExplosion(ex);
      L.fx.addChild(ex._spr);
    }
    ex._spr.children.forEach(function (cg) {
      cg.x = cg._p.x; cg.y = cg._p.y;
      cg.alpha = Math.max(0, cg._p.life / cg._p.maxLife);
    });
  });
  sweepOrphans(L.fx, WORLD.explosions);

  // ── UI nel mondo: selezione, gittate, destinazione, mining ──
  var ug = RND.uiGfx;
  if (!ug || !ug.parent) { ug = new PIXI.Graphics(); L.uiWorld.addChild(ug); RND.uiGfx = ug; }
  ug.clear();

  // destinazione movimento
  if (GAME.moveTarget) {
    var mx = GAME.moveTarget.x, my = GAME.moveTarget.y;
    ug.lineStyle(1.5, 0xffffff, 0.75);
    ug.drawCircle(mx, my, 8);
    ug.moveTo(mx - 12, my); ug.lineTo(mx - 4, my);
    ug.moveTo(mx + 4, my); ug.lineTo(mx + 12, my);
    ug.moveTo(mx, my - 12); ug.lineTo(mx, my - 4);
    ug.moveTo(mx, my + 4); ug.lineTo(mx, my + 12);
  }

  // anello di mining sull'asteroide bersaglio
  if (GAME.mineTarget && GAME.mineTarget.alive) {
    SPRITE.dashedCircle(ug, GAME.mineTarget.x, GAME.mineTarget.y, GAME.mineTarget.r + 6, '#ffd54a', 0.8, 0.5);
  }

  // gittata giocatore quando c'è un bersaglio
  var st = GAME.stats(p);
  if (GAME.selectedNpc || GAME.mineTarget) {
    SPRITE.dashedCircle(ug, p.x, p.y, st.range, '#4fd6ff', 0.35, 0.35);
  }

  // bersaglio nemico: anello + sua gittata
  if (GAME.selectedNpc && GAME.selectedNpc.alive) {
    var sn = GAME.selectedNpc;
    SPRITE.dashedCircle(ug, sn.x, sn.y, sn.size + 8, GAME.attacking ? '#ff2d4d' : '#2fd3ff', 0.95, 0.55);
    SPRITE.dashedCircle(ug, sn.x, sn.y, sn.range, GAME.attacking ? 'rgba(255,45,77,1)' : '#ff5b6a', 0.3, 0.3);
  }

  // avviso orizzonte: cerchio rosso attorno al BH se vicino
  var bhDist = Math.hypot(p.x - DATA.BLACKHOLE.x, p.y - DATA.BLACKHOLE.y);
  if (bhDist < DATA.BLACKHOLE.falloff + 120) {
    var urgency = 1 - (bhDist - DATA.BLACKHOLE.horizon) / (DATA.BLACKHOLE.falloff + 120 - DATA.BLACKHOLE.horizon);
    SPRITE.dashedCircle(ug, DATA.BLACKHOLE.x, DATA.BLACKHOLE.y, DATA.BLACKHOLE.horizon + 40,
      '#ff2d4d', 0.15 + 0.65 * urgency, 0.6);
  }
};

function sweepOrphans(layer, liveArray) {
  for (var i = layer.children.length - 1; i >= 0; i--) {
    var spr = layer.children[i];
    var found = false;
    for (var j = 0; j < liveArray.length; j++) if (liveArray[j]._spr === spr) { found = true; break; }
    if (!found) spr.destroy({ children: true });
  }
}

// Aggiorna posizione/rotazione/hp-bar di un singolo NPC
RND.updateNpcSprite = function (n) {
  if (!n._spr) return;
  n._spr.visible = !!n.alive;
  if (!n.alive) return;
  n._spr.x = n.x;
  n._spr.y = n.y;
  n._spr.rotation = n.angle;
  SPRITE.setThrust(n._spr, true);
  if (n._hpBar) {
    SPRITE.drawHpBar(n._hpBar, n.size, n.hp / n.maxHp, n.isBoss ? '#ff2d4d' : '#e8546a');
  }
};
