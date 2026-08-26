/* ============================================================
 *  ARENA ROYALE 2 — twin-stick shooter battle royale (AR2+)
 *
 *  - Mappa enorme, armi e munizioni raccolte da terra (2s sulle armi)
 *  - Joystick sinistro = movimento, destro = mira e spara (mobile)
 *  - PC: WASD + mouse (mira) + click (spara)
 *  - Niente auto-fire: spari tu, con le tue munizioni
 *  - Supply drop dal cielo con armi speciali
 *  - Tempesta che si restringe: fuori si subisce danno
 *
 *  AR2+ (juicy edition):
 *  - Risoluzione adattiva (FPS-based) per iPhone
 *  - Screen shake, numeri danno, tracer, muzzle flash, rinculo
 *  - Poof di morte, confetti vittoria, slow-mo
 *  - Kill streak, statistiche localStorage, pausa, suoni on/off
 *  - KONAMI code = MODALITÀ LEGGENDA (danno x3)
 *  - Freccia tempesta, vignetta HP basso, haptics
 * ============================================================ */
"use strict";

import * as THREE from "three";

const $ = (id) => document.getElementById(id);

const els = {
  canvas: $("gameCanvas"),
  hud: $("hud"),
  hpFill: $("hpFill"),
  hpVal: $("hpVal"),
  killsVal: $("killsVal"),
  aliveVal: $("aliveVal"),
  streakBox: $("streakBox"),
  streakVal: $("streakVal"),
  stormVal: $("stormVal"),
  stormBox: $("stormBox"),
  stormArrow: $("stormArrow"),
  minimap: $("minimap"),
  weaponBox: $("weaponBox"),
  weaponRar: $("weaponRar"),
  weaponName: $("weaponName"),
  weaponAmmo: $("weaponAmmo"),
  switchBtn: $("switchBtn"),
  dropAlert: $("dropAlert"),
  botBars: $("botBars"),
  pickupBar: $("pickupBar"),
  pickupFill: $("pickupFill"),
  pickupLabel: $("pickupLabel"),
  joyBase: $("joyBase"),
  joyKnob: $("joyKnob"),
  joyBase2: $("joyBase2"),
  joyKnob2: $("joyKnob2"),
  crosshair: $("crosshair"),
  toast: $("toast"),
  toastText: $("toastText"),
  startOverlay: $("startOverlay"),
  startBtn: $("startBtn"),
  status: $("status"),
  records: $("records"),
  endOverlay: $("endOverlay"),
  endTitle: $("endTitle"),
  endInfo: $("endInfo"),
  endKills: $("endKills"),
  endStats: $("endStats"),
  endRecords: $("endRecords"),
  restartBtn: $("restartBtn"),
  pauseBtn: $("pauseBtn"),
  pausedOverlay: $("pausedOverlay"),
  resumeBtn: $("resumeBtn"),
  quitBtn: $("quitBtn"),
  soundBtn: $("soundBtn"),
  soundBtn2: $("soundBtn2"),
  vignette: $("vignette"),
  flashOverlay: $("flashOverlay"),
  damageNumbers: $("damageNumbers"),
  confettiCanvas: $("confettiCanvas"),
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};

/* ---------- Costanti ---------- */
const MAP_HALF = 130;                 /* mappa quadrata 260x260 */
const BOT_COUNT = 9;
const PLAYER_SPEED = 9.5;
const PICKUP_NEED = 2.0;              /* secondi per raccogliere un'arma */
const AMMO_NEED = 0.8;                /* secondi per le munizioni */
const PICKUP_DIST = 1.6;

const STORM_DMG = 12;
const STORM_PHASES = [ { r: 100 }, { r: 78 }, { r: 58 }, { r: 40 }, { r: 26 }, { r: 15 } ];
const STORM_WAIT = 10;
const STORM_SHRINK = 8;

/* ---------- Armi (Surviv.io-style) ---------- */
const WEAPONS = {
  fists:     { name: "PUGNI",           dmgMin: 15, dmgMax: 15, pellets: 1, range: 4.2, reload: 0.30, projSpeed: 0, ammo: Infinity, head: false, supply: false, melee: true,  spread: 0,    color: 0xcccccc, legDmg: null },
  peacemaker:{ name: "PEACEMAKER",      dmgMin: 7,  dmgMax: 7,  pellets: 1, range: 15, reload: 0.50, projSpeed: 24, ammo: 60, ammoPickup: 20, head: true,  supply: false, melee: false, spread: 0.015, color: 0xc8a06a, legDmg: [8, 8] },
  ar:        { name: "ASSAULT RIFLE",   dmgMin: 6,  dmgMax: 9,  pellets: 1, range: 19, reload: 0.20, projSpeed: 26, ammo: 60, ammoPickup: 20, head: false, supply: false, melee: false, spread: 0.03,  color: 0x5f8fd0, legDmg: [7, 10] },
  smg:       { name: "SMG",             dmgMin: 5,  dmgMax: 7,  pellets: 1, range: 22, reload: 0.10, projSpeed: 26, ammo: 90, ammoPickup: 30, head: false, supply: false, melee: false, spread: 0.07,  color: 0xb06ad0, legDmg: [6, 8] },
  shotgun:   { name: "SHOTGUN",         dmgMin: 5,  dmgMax: 10, pellets: 4, range: 9,  reload: 1.40, projSpeed: 20, ammo: 30, ammoPickup: 10, head: false, supply: false, melee: false, spread: 0.16,  color: 0xe0863a, legDmg: [6, 12] },
  sniper:    { name: "SNIPER",          dmgMin: 15, dmgMax: 30, pellets: 1, range: 17, reload: 0.83, projSpeed: 36, ammo: 12, ammoPickup: 5,  head: false, supply: false, melee: false, spread: 0,     color: 0x3fc0b0, legDmg: null },
  dbs:       { name: "D. SHOTGUN",      dmgMin: 7,  dmgMax: 14, pellets: 2, range: 17, reload: 0.66, projSpeed: 20, ammo: 20, ammoPickup: 8,  head: false, supply: false, melee: false, spread: 0.14,  color: 0xd85a5a, legDmg: null },
  scar:      { name: "SCAR",            dmgMin: 9,  dmgMax: 15, pellets: 1, range: 15, reload: 0.35, projSpeed: 28, ammo: 60, ammoPickup: 20, head: false, supply: false, melee: false, spread: 0.04,  color: 0x5fc06a, legDmg: null },
  kar99:     { name: "KAR99",           dmgMin: 25, dmgMax: 50, pellets: 1, range: 17, reload: 1.77, projSpeed: 40, ammo: 12, ammoPickup: 5,  head: false, supply: false, melee: false, spread: 0,     color: 0x9a7a4a, legDmg: [26, 52] },
  minigun:   { name: "MINIGUN",         dmgMin: 9,  dmgMax: 15, pellets: 1, range: 16, reload: 0.09, projSpeed: 30, ammo: 300, ammoPickup: 100, head: false, supply: true,  melee: false, spread: 0.11, color: 0x8a92a8, legDmg: null },
  bazooka:   { name: "BAZOOKA",         dmgMin: 70, dmgMax: 70, pellets: 1, range: 18, reload: 2.20, projSpeed: 14, ammo: 6,  ammoPickup: 3,  head: false, supply: true,  melee: false, spread: 0,    color: 0x8aa05a, legDmg: [75, 75], explosive: true },
  quadzooka: { name: "QUADZOOKA",       dmgMin: 20, dmgMax: 20, pellets: 4, range: 19, reload: 0.90, projSpeed: 16, ammo: 16, ammoPickup: 6,  head: false, supply: true,  melee: false, spread: 0.1,  color: 0x5ac8c0, legDmg: [25, 25], explosive: true },
};
const LOOT_WEIGHTS = [
  ["peacemaker", 1.3], ["ar", 1.1], ["smg", 1.0], ["shotgun", 0.8],
  ["sniper", 0.5], ["dbs", 0.6], ["scar", 0.5], ["kar99", 0.25],
];
const LEG_CHANCE = 0.18;
const BOT_WEAPONS = [["ar", 3], ["smg", 3], ["shotgun", 2], ["scar", 1.5], ["sniper", 0.6]];

function rollWeapon(table) {
  let total = 0;
  for (const [, w] of table) total += w;
  let t = Math.random() * total;
  for (const [k, w] of table) { t -= w; if (t <= 0) return k; }
  return table[0][0];
}

/* ---------- Stato partita ---------- */
let phase = "menu";
let player = null;
let bots = [];
let projectiles = [];
let crates = [];
let rocks = [];
let trees = [];
let loot = [];
let explosions = [];
let particles = [];
let kills = 0;
let streak = 0;
let dropTimer = 25;
let dropActive = false;
let timeScale = 1;
let shake = 0;
let legendT = 0;               /* modalità leggenda (Konami) */
let matchShots = 0, matchHits = 0;

const storm = {
  cx: 0, cz: 0, r: 120, targetR: STORM_PHASES[0].r,
  startR: 120, state: "wait", timer: STORM_WAIT, phaseIdx: 0, dmgAcc: 0,
};

let lastT = performance.now();
let started = false;

/* ---------- Record (localStorage) ---------- */
const STATS_KEY = "ar2.stats.v1";
const stats = store.get(STATS_KEY, { matches: 0, wins: 0, kills: 0, bestPlace: BOT_COUNT + 1, maxStreak: 0 });
function saveStats() { store.set(STATS_KEY, stats); }
function updateRecordsUI(target) {
  const el = target || els.records;
  if (!el) return;
  el.innerHTML =
    "🏆 Record: <b>" + stats.wins + "</b> vittorie · 💀 <b>" + stats.kills + "</b> eliminazioni · " +
    "🥇 miglior piazzamento: <b>N°" + stats.bestPlace + "</b> · ⚡ streak max: <b>" + stats.maxStreak + "</b>";
}

/* ---------- Suoni ---------- */
let actx = null;
let soundOn = store.get("ar2.sound.v1", true);
function applySoundUI() {
  const icon = soundOn ? "🔊" : "🔇";
  if (els.soundBtn) els.soundBtn.textContent = icon;
  if (els.soundBtn2) els.soundBtn2.textContent = icon;
}
function toggleSound() {
  soundOn = !soundOn;
  store.set("ar2.sound.v1", soundOn);
  applySoundUI();
  if (soundOn) sfx(500, 0.08, "square", 0.05);
}
function sfx(freq, dur, type, vol) {
  try {
    if (!soundOn || !actx) return;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type || "square";
    o.frequency.value = freq;
    g.gain.value = vol || 0.04;
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    o.connect(g).connect(actx.destination);
    o.start();
    o.stop(actx.currentTime + dur);
  } catch (e) { /* muto */ }
}
function initAudio() {
  try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
}
function buzz(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
}

/* ---------- Three.js ---------- */
let scene, camera, renderer;
let forestMesh = null;
let aimLine = null;
const aimDir = new THREE.Vector3(0, 0, -1);
const PROJ_MAT = new THREE.MeshBasicMaterial({ color: 0xffe27a });
const PU_MAT = new THREE.MeshBasicMaterial({ color: 0xffd75e });
const SUP_MAT = new THREE.MeshBasicMaterial({ color: 0xff9a3a });

/* Risoluzione adattiva: alza/abbassa il pixel ratio in base agli FPS */
let curDpr = 1;
let targetDpr = 1;
let fpsAcc = 0, fpsN = 0, fpsAvg = 60, fpsTimer = 0;

function initThree() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas: els.canvas, antialias: true, powerPreference: "high-performance" });
  } catch (e) { throw e; }
  curDpr = targetDpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(curDpr);

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x1a2340, 90, 220);
  camera = new THREE.PerspectiveCamera(54, 1, 0.1, 800);

  scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x3a3f55, 1.0));
  const sun = new THREE.DirectionalLight(0xffe6c0, 1.15);
  sun.position.set(40, 70, 30);
  scene.add(sun);

  /* terreno quadrato */
  const gGeo = new THREE.PlaneGeometry(MAP_HALF * 2, MAP_HALF * 2, 90, 90);
  gGeo.rotateX(-Math.PI / 2);
  const gPos = gGeo.attributes.position;
  const gCol = new Float32Array(gPos.count * 3);
  const cA = new THREE.Color(0.32, 0.50, 0.25);
  const cB = new THREE.Color(0.24, 0.38, 0.21);
  const cC = new THREE.Color(0.20, 0.32, 0.20);
  const tmp = new THREE.Color();
  for (let i = 0; i < gPos.count; i++) {
    const d = Math.hypot(gPos.getX(i), gPos.getZ(i)) / MAP_HALF;
    if (d < 0.75) tmp.copy(cA).lerp(cB, d / 0.75);
    else tmp.copy(cB).lerp(cC, (d - 0.75) / 0.25);
    gCol[i * 3] = tmp.r; gCol[i * 3 + 1] = tmp.g; gCol[i * 3 + 2] = tmp.b;
  }
  gGeo.setAttribute("color", new THREE.BufferAttribute(gCol, 3));
  scene.add(new THREE.Mesh(gGeo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));

  /* mura di confine (4 lati) */
  const wallMat = new THREE.MeshLambertMaterial({ color: 0x4a5570, flatShading: true });
  const wl = MAP_HALF + 1;
  const wb = new THREE.BoxGeometry(wl * 2, 3, 1.2);
  const ws = new THREE.BoxGeometry(1.2, 3, wl * 2);
  for (const [geo, x, z] of [[wb, 0, -wl], [wb, 0, wl], [ws, -wl, 0], [ws, wl, 0]]) {
    const m = new THREE.Mesh(geo, wallMat);
    m.position.set(x, 1.5, z);
    scene.add(m);
  }

  buildStormVisuals();

  /* linea di mira del giocatore (creata una sola volta) */
  const aimGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1),
  ]);
  aimLine = new THREE.Line(aimGeo, new THREE.LineBasicMaterial({ color: 0x78dcff, transparent: true, opacity: 0.75 }));
  scene.add(aimLine);

  resize();
}

/* ---------- Foresta (InstancedMesh) ---------- */
function buildForest() {
  const geo = new THREE.ConeGeometry(1.3, 6, 6);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cTrunk = new THREE.Color(0.38, 0.28, 0.18);
  const cA = new THREE.Color(0.20, 0.42, 0.18);
  const cB = new THREE.Color(0.14, 0.32, 0.14);
  const t = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const h = (pos.getY(i) + 3) / 6;
    if (h < 0.28) t.copy(cTrunk);
    else t.copy(cA).lerp(cB, clamp((h - 0.28) / 0.72, 0, 1));
    colors[i * 3] = t.r; colors[i * 3 + 1] = t.g; colors[i * 3 + 2] = t.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const inst = new THREE.InstancedMesh(geo, mat, 900);
  forestMesh = inst;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  let placed = 0;
  /* griglia con jitter: distribuzione uniforme */
  const cell = 8.6;
  for (let gx = -MAP_HALF + 4; gx < MAP_HALF - 4; gx += cell) {
    for (let gz = -MAP_HALF + 4; gz < MAP_HALF - 4; gz += cell) {
      if (placed >= 900) break;
      const x = gx + rand(-3, 3), z = gz + rand(-3, 3);
      if (Math.hypot(x, z) < 10) continue;               /* zona di spawn libera */
      if (Math.abs(x) > MAP_HALF - 2 || Math.abs(z) > MAP_HALF - 2) continue;
      const sc = 0.8 + Math.random() * 0.8;
      s.set(sc, sc * (0.9 + Math.random() * 0.5), sc);
      p.set(x, -0.4, z);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
      m.compose(p, q, s);
      inst.setMatrixAt(placed, m);
      trees.push({ x, z, r: 0.7 });
      placed++;
    }
  }
  inst.count = placed;
  scene.add(inst);
}

/* ---------- Rocce e casse ---------- */
function blockedAt(x, z, minD) {
  for (const o of rocks) if (Math.hypot(x - o.x, z - o.z) < minD) return true;
  for (const c of crates) if (Math.hypot(x - c.x, z - c.z) < minD) return true;
  for (const t of trees) if (Math.hypot(x - t.x, z - t.z) < minD) return true;
  return false;
}

function buildObstacles() {
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x7a8296, flatShading: true });
  const crateMat = new THREE.MeshLambertMaterial({ color: 0xa8713a, flatShading: true });
  const crateDark = new THREE.MeshLambertMaterial({ color: 0x7e5127, flatShading: true });

  let placed = 0, tries = 0;
  while (placed < 18 && tries < 1200) {
    tries++;
    const x = rand(-MAP_HALF + 5, MAP_HALF - 5), z = rand(-MAP_HALF + 5, MAP_HALF - 5);
    if (Math.hypot(x, z) < 11 || blockedAt(x, z, 4)) continue;
    const g = new THREE.DodecahedronGeometry(rand(1.1, 1.9), 0);
    g.rotateY(rand(0, 6));
    const m = new THREE.Mesh(g, rockMat);
    m.position.set(x, 0.8, z);
    m.scale.y = 0.8;
    scene.add(m);
    rocks.push({ mesh: m, x, z, half: 1.9 });
    placed++;
  }
  placed = 0; tries = 0;
  while (placed < 26 && tries < 1200) {
    tries++;
    const x = rand(-MAP_HALF + 5, MAP_HALF - 5), z = rand(-MAP_HALF + 5, MAP_HALF - 5);
    if (Math.hypot(x, z) < 11 || blockedAt(x, z, 3.5)) continue;
    const grp = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), crateMat);
    box.position.y = 0.75;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 1.5), crateDark);
    lid.position.y = 1.55;
    grp.add(box, lid);
    grp.position.set(x, 0, z);
    scene.add(grp);
    crates.push({ grp, x, z, half: 0.8, hp: 30 });
    placed++;
  }
}

/* ---------- Tempesta (visual) ---------- */
let stormLineGeo = null, dangerGeo = null, targetLineGeo = null;
let stormLine, dangerRing, targetLine;

function makeCircleLine(r) {
  const pts = [];
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

function buildStormVisuals() {
  if (stormLineGeo) { stormLineGeo.dispose(); dangerGeo.dispose(); targetLineGeo.dispose(); }
  if (stormLine) scene.remove(stormLine);
  if (dangerRing) scene.remove(dangerRing);
  if (targetLine) scene.remove(targetLine);

  stormLineGeo = makeCircleLine(storm.r);
  stormLine = new THREE.LineLoop(stormLineGeo, new THREE.LineBasicMaterial({ color: 0xff5a45 }));
  stormLine.position.y = 0.18;
  scene.add(stormLine);

  const outer = Math.hypot(MAP_HALF, MAP_HALF) + 5;
  dangerGeo = new THREE.RingGeometry(storm.r, outer, 64);
  dangerRing = new THREE.Mesh(
    dangerGeo,
    new THREE.MeshBasicMaterial({ color: 0xff3b2a, transparent: true, opacity: 0.20, side: THREE.DoubleSide, depthWrite: false })
  );
  dangerRing.rotation.x = -Math.PI / 2;
  dangerRing.position.y = 0.12;
  scene.add(dangerRing);

  targetLineGeo = makeCircleLine(storm.targetR);
  targetLine = new THREE.LineLoop(targetLineGeo, new THREE.LineBasicMaterial({ color: 0x7fd4ff, transparent: true, opacity: 0.9 }));
  targetLine.position.y = 0.16;
  targetLine.visible = storm.state === "wait";
  scene.add(targetLine);
}

/* ---------- Personaggi ---------- */
function makeCharacter(color) {
  const grp = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color, flatShading: true });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0x22263a, flatShading: true });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 1.1, 8), mat);
  body.position.y = 0.55;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), mat);
  head.position.y = 1.35;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.14), darkMat);
  visor.position.set(0, 1.38, 0.3);
  const gun = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.85), darkMat);
  gun.position.set(0, 0.78, 0.62);
  grp.add(body, head, visor, gun);
  scene.add(grp);
  return grp;
}

function makePlayer() {
  player = {
    grp: makeCharacter(0x3fb8e8),
    pos: new THREE.Vector3(rand(-6, 6), 0, rand(-6, 6)),
    hp: 100,
    weapon: "fists",          /* arma attualmente in mano */
    gunWeapon: null,          /* l'arma "vera" raccolta (pistola/fucile) */
    gunLeg: false,
    meleeMode: false,         /* true = pugni in mano */
    leg: false,
    ammo: Infinity,
    reloadCd: 0,
    recoilT: 0,
    alive: true,
    aimYaw: 0,
    hitT: 0,
  };
  player.grp.position.copy(player.pos);
}

function toggleMelee() {
  if (phase !== "playing" || !player || !player.gunWeapon) return;
  player.meleeMode = !player.meleeMode;
  player.weapon = player.meleeMode ? "fists" : player.gunWeapon;
  sfx(300, 0.06, "square", 0.04);
}

function makeBot(i) {
  const a = (i / BOT_COUNT) * Math.PI * 2 + rand(-0.4, 0.4);
  const r = rand(55, 105);
  const gun = rollWeapon(BOT_WEAPONS);
  const bot = {
    grp: makeCharacter([0xff6b5e, 0xffb13b, 0x9d5cff, 0x58d66b, 0xff5ec4, 0x41c8e0, 0xffa94d, 0x8a9a5a, 0xe87a3a][i % 9]),
    pos: new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r),
    hp: 80,
    gunWeapon: gun,           /* l'arma del bot */
    weapon: gun,              /* arma in mano (può diventare "fists") */
    leg: Math.random() < 0.2,
    ammo: WEAPONS[gun].ammo,  /* munizioni FINITE */
    speed: rand(5.6, 7.2),
    reloadCd: rand(0.2, 1),
    recoilT: 0,
    pickupProg: 0,
    alive: true,
    aimYaw: rand(0, Math.PI * 2),
    wanderT: 0,
    wanderTarget: new THREE.Vector3(),
    hitT: 0,
    barEl: null,              /* barra HP riusata */
  };
  bot.grp.position.copy(bot.pos);
  return bot;
}

function weaponStats(w, leg) {
  if (leg && w.legDmg) {
    return { dmgMin: w.legDmg[0], dmgMax: w.legDmg[1], ammo: w.ammo };
  }
  return { dmgMin: w.dmgMin, dmgMax: w.dmgMax, ammo: w.ammo };
}

/* ---------- Loot (armi e munizioni a terra) ---------- */
function makeLootMesh(kind, weaponKey, leg) {
  const grp = new THREE.Group();
  if (kind === "ammo") {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshBasicMaterial({ color: 0x7ce08a }));
    m.position.y = 0.4;
    grp.add(m);
  } else {
    const w = WEAPONS[weaponKey];
    const col = leg ? 0xffd75e : w.color;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.7, 6), new THREE.MeshLambertMaterial({ color: col, flatShading: true }));
    m.position.y = 0.5;
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.5), new THREE.MeshLambertMaterial({ color: 0x22263a, flatShading: true }));
    tip.position.set(0, 0.5, 0.42);
    grp.add(m, tip);
  }
  scene.add(grp);
  return grp;
}

function spawnLoot(kind, weaponKey, leg, x, z, readyT) {
  const grp = makeLootMesh(kind, weaponKey, leg);
  grp.position.set(x, 0, z);            /* il visual DEVE stare dove si raccoglie */
  loot.push({
    grp,
    kind, weapon: weaponKey, leg,
    pos: new THREE.Vector3(x, 0, z),
    t: rand(0, 6),
    readyT: readyT || 0,
    prog: 0,
    need: kind === "ammo" ? AMMO_NEED : PICKUP_NEED,
  });
}

function lootNear(x, z, minD) {
  for (const it of loot) {
    if (Math.hypot(it.pos.x - x, it.pos.z - z) < minD) return true;
  }
  return false;
}

function spawnInitialLoot() {
  let placed = 0, tries = 0;
  while (placed < 40 && tries < 8000) {
    tries++;
    const x = rand(-MAP_HALF + 8, MAP_HALF - 8), z = rand(-MAP_HALF + 8, MAP_HALF - 8);
    if (Math.hypot(x, z) < 14 || blockedAt(x, z, 2.4) || lootNear(x, z, 2.2)) continue;
    const w = rollWeapon(LOOT_WEIGHTS);
    spawnLoot("weapon", w, Math.random() < LEG_CHANCE, x, z, 0);
    placed++;
  }
  placed = 0; tries = 0;
  while (placed < 48 && tries < 8000) {
    tries++;
    const x = rand(-MAP_HALF + 8, MAP_HALF - 8), z = rand(-MAP_HALF + 8, MAP_HALF - 8);
    if (Math.hypot(x, z) < 14 || blockedAt(x, z, 2) || lootNear(x, z, 1.6)) continue;
    spawnLoot("ammo", "ar", false, x, z, 0);
    placed++;
  }
}

function dropWeaponAt(e, x, z) {
  if (!e.gunWeapon) return;
  spawnLoot("weapon", e.gunWeapon, e.gunLeg, x + rand(-1.6, 1.6), z + rand(-1.6, 1.6), 1.2);
}

/* ---------- Supply drop ---------- */
function startSupplyDrop() {
  const x = rand(-MAP_HALF + 10, MAP_HALF - 10);
  const z = rand(-MAP_HALF + 10, MAP_HALF - 10);
  const w = ["minigun", "bazooka", "quadzooka"][Math.floor(Math.random() * 3)];
  const grp = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), SUP_MAT);
  const strap = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.25, 1.7), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  strap.position.y = 0.9;
  grp.add(box, strap);
  grp.position.set(x, 55, z);
  scene.add(grp);
  loot.push({
    grp, kind: "weapon", weapon: w, leg: Math.random() < 0.5,
    pos: new THREE.Vector3(x, 0, z),
    t: 0, readyT: 2.5, prog: 0, need: PICKUP_NEED,
    supply: true, fallT: 0,
  });
  dropActive = true;
  els.dropAlert.classList.remove("hidden");
  showToast("📦 SUPPLY DROP IN ARRIVO!", 2000);
  sfx(200, 0.8, "sawtooth", 0.06);
}

/* ---------- Particelle (poof, muzzle flash, esplosioni piccole) ---------- */
function spawnParticle(x, y, z, vx, vy, vz, color, life, size, gravity) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(size, 6, 5),
    new THREE.MeshBasicMaterial({ color, transparent: true })
  );
  m.position.set(x, y, z);
  scene.add(m);
  particles.push({ mesh: m, vel: new THREE.Vector3(vx, vy, vz), life: life, t: 0, gravity: gravity !== false });
}

function poof(x, y, z, color, n) {
  n = n || 10;
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(2, 7);
    spawnParticle(
      x + rand(-0.2, 0.2), y + rand(0, 1.4), z + rand(-0.2, 0.2),
      Math.cos(a) * sp, rand(2, 6), Math.sin(a) * sp,
      color, rand(0.4, 0.8), rand(0.16, 0.3)
    );
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.t += dt;
    if (p.t >= p.life) {
      scene.remove(p.mesh);
      p.mesh.material.dispose();
      particles.splice(i, 1);
      continue;
    }
    if (p.gravity) p.vel.y -= 12 * dt;
    p.mesh.position.addScaledVector(p.vel, dt);
    const k = 1 - p.t / p.life;
    p.mesh.material.opacity = Math.min(1, k * 1.6);
    p.mesh.scale.setScalar(0.6 + k * 0.8);
  }
}

/* ---------- Proiettili / esplosioni / pugni ---------- */
function fireEntity(e, dirX, dirZ, fromPlayer) {
  const w = WEAPONS[e.weapon];
  const stats = weaponStats(w, e.leg);
  e.reloadCd = w.reload;
  e.recoilT = 0.09;
  const dmgMul = fromPlayer && legendT > 0 ? 3 : 1;

  if (w.melee) {
    /* pugni: danno istantaneo in un arco, attraversa i muri */
    const base = Math.atan2(dirX, dirZ);
    const targets = fromPlayer ? bots : [player];
    let hitAny = false;
    for (const t of targets) {
      if (!t.alive) continue;
      const dx = t.pos.x - e.pos.x, dz = t.pos.z - e.pos.z;
      const d = Math.hypot(dx, dz);
      if (d > w.range) continue;
      let ang = Math.atan2(dx, dz) - base;
      while (ang > Math.PI) ang -= Math.PI * 2;
      while (ang < -Math.PI) ang += Math.PI * 2;
      if (Math.abs(ang) < 1.4) {   /* arco generoso: i pugni colpiscono */
        damageEntity(t, rand(stats.dmgMin, stats.dmgMax) * dmgMul, fromPlayer, false);
        hitAny = true;
      }
    }
    if (hitAny) { sfx(180, 0.12, "square", 0.05); buzz(10); }
    return;
  }

  if (e.ammo <= 0) {
    sfx(120, 0.1, "square", 0.04);
    return;
  }
  e.ammo--;
  if (fromPlayer) matchShots++;

  const base = Math.atan2(dirX, dirZ);
  const pellets = w.pellets;
  for (let i = 0; i < pellets; i++) {
    let ang = base;
    if (pellets > 1) ang += (i / (pellets - 1) - 0.5) * w.spread * 2;
    else ang += (Math.random() - 0.5) * w.spread * 2;
    const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    const p = {
      grp: new THREE.Mesh(new THREE.SphereGeometry(w.name === "BAZOOKA" || w.name === "QUADZOOKA" ? 0.34 : 0.2, 6, 5), PROJ_MAT),
      pos: e.pos.clone().addScaledVector(dir, 1.1),
      vel: dir.clone().multiplyScalar(w.projSpeed),
      dmg: rand(stats.dmgMin, stats.dmgMax) * dmgMul,
      fromPlayer,
      head: w.head,
      explosive: !!w.explosive,
      traveled: 0,
      range: w.range,
      owner: e,
      stretch: !w.explosive,
    };
    p.pos.y = w.head ? 1.32 : 0.9;
    p.grp.position.copy(p.pos);
    scene.add(p.grp);
    projectiles.push(p);
  }
  sfx(fromPlayer ? 620 : 340, 0.08, "square", fromPlayer ? 0.03 : 0.02);
  if (w.name === "BAZOOKA" || w.name === "QUADZOOKA") sfx(90, 0.25, "sawtooth", 0.06);

  /* muzzle flash */
  const gx = e.pos.x + Math.sin(base) * 1.2, gz = e.pos.z + Math.cos(base) * 1.2;
  spawnParticle(gx, 0.9, gz, 0, 0, 0, 0xffe27a, 0.07, 0.34, false);
  if (fromPlayer) {
    sfx(240, 0.05, "square", 0.02);
    addShake(w.name === "BAZOOKA" || w.name === "QUADZOOKA" ? 0.5 : 0.12);
  }
}

function explode(x, z, dmg, fromPlayer) {
  /* danno ad area */
  const targets = fromPlayer ? bots : [player];
  for (const t of targets) {
    if (!t.alive) continue;
    const d = Math.hypot(t.pos.x - x, t.pos.z - z);
    if (d < 3.6) {
      const f = d < 1.4 ? 1 : 1 - ((d - 1.4) / 2.2) * 0.6;
      damageEntity(t, dmg * f, fromPlayer, false);
    }
  }
  for (let ci = crates.length - 1; ci >= 0; ci--) {
    const c = crates[ci];
    if (Math.hypot(c.x - x, c.z - z) < 2.4) { c.hp -= dmg; if (c.hp <= 0) breakCrate(c); }
  }
  /* effetto visivo: anello che si espande */
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.4, 0.8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffa050, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.25, z);
  scene.add(ring);
  explosions.push({ mesh: ring, t: 0 });
  poof(x, 0.6, z, 0xffa050, 12);
  addShake(fromPlayer ? 0.55 : 0.35);
  sfx(70, 0.5, "sawtooth", 0.07);
  buzz(25);
}

function breakCrate(crate) {
  scene.remove(crate.grp);
  if (Math.random() < 0.55) spawnLoot("ammo", "ar", false, crate.x, crate.z, 0.5);
  poof(crate.x, 0.8, crate.z, 0xa8713a, 8);
  const i = crates.indexOf(crate);
  if (i >= 0) crates.splice(i, 1);
}

/* ---------- Danno ---------- */
function damageEntity(e, amount, fromPlayer, headshot, quiet) {
  if (!e.alive) return;
  e.hp -= amount;
  e.hitT = 0.12;
  if (e === player) {
    sfx(240, 0.1, "sawtooth", 0.05);
    if (!quiet) {
      buzz(15);
      els.flashOverlay.classList.remove("hit");
      void els.flashOverlay.offsetWidth;   /* restart animazione */
      els.flashOverlay.classList.add("hit");
      addShake(0.35);
      streak = 0;
      updateStreakUI();
      spawnDamageNumber(e, Math.round(amount), true);
    }
  } else if (!quiet) {
    spawnDamageNumber(e, Math.round(amount), false, !!headshot);
  }
  if (e.hp <= 0) {
    e.alive = false;
    e.hp = 0;
    if (e === player) onPlayerDeath();
    else onBotDeath(e, fromPlayer);
  }
}

/* numeri danno fluttuanti (DOM) */
function spawnDamageNumber(e, amount, onPlayer, crit) {
  const v = e.pos.clone().add(new THREE.Vector3(rand(-0.3, 0.3), 1.7, rand(-0.3, 0.3))).project(camera);
  if (v.z > 1) return;
  const x = ((v.x + 1) / 2) * window.innerWidth;
  const y = ((-v.y + 1) / 2) * window.innerHeight;
  if (x < -30 || x > window.innerWidth + 30 || y < -30 || y > window.innerHeight + 30) return;
  const el = document.createElement("div");
  el.className = "dmg-num" + (crit ? " crit" : "") + (onPlayer ? " enemy" : "");
  el.textContent = "-" + amount;
  el.style.left = x + "px";
  el.style.top = y + "px";
  els.damageNumbers.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function matchAccuracy() {
  return matchShots > 0 ? Math.round((matchHits / matchShots) * 100) : 0;
}

function onPlayerDeath() {
  phase = "over";
  const place = bots.filter((b) => b.alive).length + 1;
  els.endTitle.textContent = "💀 GAME OVER";
  els.endInfo.textContent = "Posizione: " + place + "/" + (BOT_COUNT + 1);
  els.endKills.textContent = "Eliminazioni: " + kills;
  els.endStats.textContent = "Colpi: " + matchShots + " · Precisione: " + matchAccuracy() + "% · Streak: " + streak;
  els.endRecords.textContent = "";
  els.endOverlay.classList.remove("hidden");
  endMatchStats(place);
  sfx(140, 0.5, "sawtooth", 0.06);
  buzz([60, 40, 80]);
}

function onBotDeath(bot, fromPlayer) {
  scene.remove(bot.grp);
  poof(bot.pos.x, 0.7, bot.pos.z, 0xff6b5e, 12);
  if (bot.barEl && bot.barEl.parentNode) bot.barEl.parentNode.removeChild(bot.barEl);
  if (fromPlayer) {
    kills++;
    streak++;
    stats.maxStreak = Math.max(stats.maxStreak, streak);
    saveStats();
    updateStreakUI();
    showKillStreak();
    sfx(300, 0.2, "sawtooth", 0.06);
    buzz(30);
  }
  if (bot.gunWeapon !== "fists") spawnLoot("weapon", bot.gunWeapon, bot.leg, bot.pos.x, bot.pos.z, 1.2);
  if (phase !== "playing") return;
  const alive = bots.filter((b) => b.alive).length;
  if (alive === 0) {
    phase = "victory";
    stats.wins++;
    stats.kills += kills;
    saveStats();
    els.endTitle.textContent = "🏆 VITTORIA!";
    els.endInfo.textContent = "Sei l'ultimo sopravvissuto!";
    els.endKills.textContent = "Eliminazioni: " + kills;
    els.endStats.textContent = "Colpi: " + matchShots + " · Precisione: " + matchAccuracy() + "% · Streak: " + streak;
    els.endRecords.textContent = "";
    els.endOverlay.classList.remove("hidden");
    endMatchStats(1);
    showToast("🏆 VITTORIA!", 2500);
    sfx(520, 0.4, "square", 0.06);
    buzz([80, 60, 80, 60, 120]);
    timeScale = 0.35;                  /* slow-mo finale */
    setTimeout(() => { timeScale = 1; }, 1100);
    startConfetti();
  }
}

function endMatchStats(place) {
  stats.matches++;
  stats.kills += kills;
  if (place < stats.bestPlace) stats.bestPlace = place;
  saveStats();
  els.endRecords.textContent =
    "🏆 Record: " + stats.wins + " vittorie · 💀 " + stats.kills + " totali · 🥇 best N°" + stats.bestPlace;
}

/* kill streak */
const STREAK_MSGS = { 2: "⚡ DOPPIO!", 3: "🔥 RAGE!", 4: "☠️ IMPLACABILE!", 5: "👑 GODLIKE!" };
function showKillStreak() {
  if (streak >= 2) {
    const msg = STREAK_MSGS[Math.min(streak, 5)] || "👑 GODLIKE!";
    showToast(msg + " (" + streak + " di fila)", 1200);
  }
}
function updateStreakUI() {
  els.streakVal.textContent = streak;
  els.streakBox.classList.toggle("hidden", streak < 2);
}

/* ---------- Collisioni ---------- */
function circleBlocked(x, z, r) {
  for (const o of rocks) {
    const dx = Math.max(Math.abs(x - o.x) - o.half, 0);
    const dz = Math.max(Math.abs(z - o.z) - o.half, 0);
    if (dx * dx + dz * dz < r * r) return o;
  }
  for (const c of crates) {
    const dx = Math.max(Math.abs(x - c.x) - c.half, 0);
    const dz = Math.max(Math.abs(z - c.z) - c.half, 0);
    if (dx * dx + dz * dz < r * r) return c;
  }
  for (const t of trees) {
    if ((x - t.x) ** 2 + (z - t.z) ** 2 < (r + t.r) ** 2) return t;
  }
  return null;
}

function resolveEntity(e, r) {
  const hit = circleBlocked(e.pos.x, e.pos.z, r);
  if (hit) {
    if (hit.half !== undefined) {
      const px = clamp(e.pos.x, hit.x - hit.half, hit.x + hit.half);
      const pz = clamp(e.pos.z, hit.z - hit.half, hit.z + hit.half);
      const dx = e.pos.x - px, dz = e.pos.z - pz;
      if (Math.abs(dx) > Math.abs(dz)) e.pos.x = px + (dx >= 0 ? r : -r);
      else e.pos.z = pz + (dz >= 0 ? r : -r);
    } else {
      const dx = e.pos.x - hit.x, dz = e.pos.z - hit.z;
      const d = Math.hypot(dx, dz) || 1;
      e.pos.x = hit.x + (dx / d) * (r + hit.r);
      e.pos.z = hit.z + (dz / d) * (r + hit.r);
    }
  }
  e.pos.x = clamp(e.pos.x, -MAP_HALF + 0.6, MAP_HALF - 0.6);
  e.pos.z = clamp(e.pos.z, -MAP_HALF + 0.6, MAP_HALF - 0.6);
}

/* ---------- Tempesta ---------- */
function inStorm(p) {
  return Math.hypot(p.x - storm.cx, p.z - storm.cz) > storm.r;
}

function updateStorm(dt) {
  if (phase !== "playing") return;
  storm.timer -= dt;
  if (storm.state === "wait") {
    if (storm.timer <= 0) {
      storm.state = "shrink";
      storm.startR = storm.r;
      storm.timer = STORM_SHRINK;
      els.stormBox.classList.add("warn");
      showToast("🔥 LA TEMPESTA SI RESTRINGE!", 1600);
      sfx(180, 0.7, "sawtooth", 0.06);
    }
  } else {
    const t = 1 - clamp(storm.timer / STORM_SHRINK, 0, 1);
    storm.r = storm.targetR + (storm.startR - storm.targetR) * (1 - t * t);
    if (storm.timer <= 0) {
      storm.r = storm.targetR;
      storm.phaseIdx++;
      if (storm.phaseIdx < STORM_PHASES.length) {
        storm.state = "wait";
        storm.timer = STORM_WAIT;
        storm.targetR = STORM_PHASES[storm.phaseIdx].r;
        els.stormBox.classList.remove("warn");
      } else {
        storm.state = "end";
        storm.timer = 999;
      }
      buildStormVisuals();
    }
  }

  storm.dmgAcc += STORM_DMG * dt;
  while (storm.dmgAcc >= 1) {
    storm.dmgAcc -= 1;
    if (inStorm(player.pos)) damageEntity(player, 1, false, false, true);
    for (const b of bots) if (b.alive && inStorm(b.pos)) damageEntity(b, 1, false, false, true);
  }
}

/* freccia che indica il centro della tempesta quando sei fuori */
function updateStormArrow() {
  if (!player) return;
  const outside = inStorm(player.pos);
  els.stormArrow.classList.toggle("hidden", !outside);
  if (outside) {
    const dx = storm.cx - player.pos.x;
    const dz = storm.cz - player.pos.z;
    /* schermo: world +z -> screen su (-y); angolo dal "su" verso il centro */
    const ang = Math.atan2(dx, -dz);
    const arrow = els.stormArrow.querySelector(".arrow");
    if (arrow) arrow.style.transform = "rotate(" + ang + "rad)";
  }
}

/* ---------- Input: joystick gemelli + mouse ---------- */
const joyMove = { active: false, id: null, bx: 0, by: 0, dx: 0, dy: 0, rad: 50 };
const joyAim = { active: false, id: null, bx: 0, by: 0, dx: 0, dy: 0, rad: 50 };
let mouseX = 0, mouseY = 0, mouseDown = false, mouseUsed = false;
const keys = { up: false, down: false, left: false, right: false };

function showJoy(j, base, knob) {
  base.classList.remove("hidden");
  base.style.left = j.bx + "px";
  base.style.top = j.by + "px";
  knob.style.left = "50%";
  knob.style.top = "50%";
}
function updateJoy(j, base, knob) {
  knob.style.left = (50 + j.dx * 50) + "%";
  knob.style.top = (50 + j.dy * 50) + "%";
}
function hideJoy(j, base) {
  j.active = false; j.id = null; j.dx = 0; j.dy = 0;
  base.classList.add("hidden");
}

window.addEventListener("pointerdown", (e) => {
  if (phase !== "playing") return;
  const target = e.target;
  if (target && typeof target.closest === "function" && target.closest("#hud, #toast")) return;
  const touch = e.pointerType === "touch";
  if (touch) {
    if (e.clientX < window.innerWidth * 0.5) {
      if (joyMove.active) return;
      joyMove.active = true; joyMove.id = e.pointerId;
      joyMove.bx = e.clientX; joyMove.by = e.clientY;
      showJoy(joyMove, els.joyBase, els.joyKnob);
    } else {
      if (joyAim.active) return;
      joyAim.active = true; joyAim.id = e.pointerId;
      joyAim.bx = e.clientX; joyAim.by = e.clientY;
      showJoy(joyAim, els.joyBase2, els.joyKnob2);
    }
  } else {
    mouseUsed = true;
    mouseDown = true;
    mouseX = e.clientX; mouseY = e.clientY;
    els.crosshair.classList.remove("hidden");
    els.crosshair.style.left = mouseX + "px";
    els.crosshair.style.top = mouseY + "px";
  }
});
window.addEventListener("pointermove", (e) => {
  if (e.pointerType === "touch") {
    if (joyMove.active && e.pointerId === joyMove.id) {
      const dx = e.clientX - joyMove.bx, dy = e.clientY - joyMove.by;
      const d = Math.hypot(dx, dy);
      const m = Math.min(d, joyMove.rad);
      joyMove.dx = d > 1 ? (dx / d) * (m / joyMove.rad) : 0;
      joyMove.dy = d > 1 ? (dy / d) * (m / joyMove.rad) : 0;
      updateJoy(joyMove, els.joyBase, els.joyKnob);
    } else if (joyAim.active && e.pointerId === joyAim.id) {
      const dx = e.clientX - joyAim.bx, dy = e.clientY - joyAim.by;
      const d = Math.hypot(dx, dy);
      const m = Math.min(d, joyAim.rad);
      joyAim.dx = d > 1 ? (dx / d) * (m / joyAim.rad) : 0;
      joyAim.dy = d > 1 ? (dy / d) * (m / joyAim.rad) : 0;
      updateJoy(joyAim, els.joyBase2, els.joyKnob2);
    }
  } else {
    mouseX = e.clientX; mouseY = e.clientY;
    if (mouseUsed) {
      els.crosshair.classList.remove("hidden");
      els.crosshair.style.left = mouseX + "px";
      els.crosshair.style.top = mouseY + "px";
    }
  }
});
window.addEventListener("pointerup", (e) => {
  if (e.pointerType === "touch") {
    if (joyMove.active && e.pointerId === joyMove.id) hideJoy(joyMove, els.joyBase);
    if (joyAim.active && e.pointerId === joyAim.id) hideJoy(joyAim, els.joyBase2);
  } else {
    mouseDown = false;
  }
});
window.addEventListener("pointercancel", (e) => {
  if (e.pointerType === "touch") {
    if (joyMove.active && e.pointerId === joyMove.id) hideJoy(joyMove, els.joyBase);
    if (joyAim.active && e.pointerId === joyAim.id) hideJoy(joyAim, els.joyBase2);
  } else mouseDown = false;
});

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.up = true;
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.down = true;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
  handleSecretKeys(e);
});
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.up = false;
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.down = false;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
});

els.switchBtn.addEventListener("click", toggleMelee);
window.addEventListener("keydown", (e) => {
  if (e.key === "q" || e.key === "Q" || e.key === "e" || e.key === "E") toggleMelee();
  if (e.key === "Escape" || e.key === "p" || e.key === "P") togglePause();
});

/* ---------- Segreti: KONAMI + GG ---------- */
const KONAMI = ["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"];
let secretKeys = [];
let lastKeys = [];
function handleSecretKeys(e) {
  const k = e.key.toLowerCase();
  secretKeys.push(k);
  if (secretKeys.length > KONAMI.length) secretKeys.shift();
  if (secretKeys.join(",") === KONAMI.join(",")) {
    secretKeys = [];
    activateLegend();
    return;
  }
  lastKeys.push(k);
  if (lastKeys.length > 2) lastKeys.shift();
  if (lastKeys.join(",") === "g,g") {
    lastKeys = [];
    showToast("GG! 🎉", 1500);
    startConfetti();
  }
}

/* MODALITÀ LEGGENDA: danno x3 per 20s */
function activateLegend() {
  if (phase !== "playing") return;
  legendT = 20;
  els.hud.classList.add("legend");
  els.weaponBox.classList.add("legend-mode");
  showToast("👑 MODALITÀ LEGGENDA! Danno ×3 (20s)", 2200);
  sfx(880, 0.6, "sawtooth", 0.08);
  buzz([60, 40, 60]);
}

/* ---------- Pausa ---------- */
function togglePause() {
  if (phase === "playing") {
    phase = "paused";
    els.pausedOverlay.classList.remove("hidden");
    sfx(260, 0.1, "square", 0.04);
  } else if (phase === "paused") {
    phase = "playing";
    els.pausedOverlay.classList.add("hidden");
    lastT = performance.now();
    sfx(320, 0.1, "square", 0.04);
  }
}

/* direzione di mira: joystick destro o mouse */
function updateAim() {
  if (joyAim.active) {
    const d = Math.hypot(joyAim.dx, joyAim.dy);
    if (d > 0.12) aimDir.set(joyAim.dx, 0, joyAim.dy).normalize();
  } else if (mouseUsed) {
    const rect = els.canvas.getBoundingClientRect();
    const nx = ((mouseX - rect.left) / rect.width) * 2 - 1;
    const ny = -((mouseY - rect.top) / rect.height) * 2 + 1;
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(nx, ny), camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    if (ray.ray.intersectPlane(plane, hit)) {
      const d = new THREE.Vector3(hit.x - player.pos.x, 0, hit.z - player.pos.z);
      if (d.lengthSq() > 0.01) aimDir.copy(d).normalize();
    }
  }
}

/* ---------- Giocatore ---------- */
function updatePlayer(dt) {
  if (!player.alive || phase !== "playing") return;
  player.hitT -= dt;
  player.reloadCd -= dt;
  player.recoilT -= dt;

  /* movimento: joystick sinistro o tastiera */
  let mx = joyMove.dx, mz = joyMove.dy;
  if (keys.up) mz = -1;
  if (keys.down) mz = 1;
  if (keys.left) mx = -1;
  if (keys.right) mx = 1;
  const ml = Math.hypot(mx, mz);
  if (ml > 1) { mx /= ml; mz /= ml; }
  if (ml > 0.15) {
    player.pos.x += mx * PLAYER_SPEED * dt;
    player.pos.z += mz * PLAYER_SPEED * dt;
    resolveEntity(player, 0.5);
  }

  updateAim();
  player.aimYaw = Math.atan2(aimDir.x, aimDir.z);

  /* sparo manuale */
  const firing = joyAim.active || mouseDown;
  if (firing && player.reloadCd <= 0) {
    fireEntity(player, aimDir.x, aimDir.z, true);
  }

  /* raccolta loot */
  updateLootPickup(dt);

  applyEntityVisual(player);
}

function updateLootPickup(dt) {
  let best = null, bestD = PICKUP_DIST;
  for (const it of loot) {
    const d = Math.hypot(player.pos.x - it.pos.x, player.pos.z - it.pos.z);
    if (d < bestD) { bestD = d; best = it; }
    if (d < PICKUP_DIST) {
      if (it.readyT > 0) it.readyT -= dt;
      else it.prog += dt;
    } else if (it.prog > 0) {
      it.prog = Math.max(0, it.prog - dt * 2);   /* perde progresso uscendo */
    }
  }
  if (best && bestD < PICKUP_DIST) {
    els.pickupBar.classList.remove("hidden");
    els.pickupFill.style.width = Math.min(100, (best.prog / best.need) * 100) + "%";
    const label = best.kind === "ammo" ? "MUNIZIONI" : (WEAPONS[best.weapon].name + (best.leg ? " ★" : ""));
    els.pickupLabel.textContent = "RACCOLTA " + label + " " + Math.round(Math.min(1, best.prog / best.need) * 100) + "%";
    if (best.prog >= best.need) {
      collectLoot(best);
      els.pickupBar.classList.add("hidden");
    }
  } else {
    els.pickupBar.classList.add("hidden");
  }
}

function collectLoot(it) {
  const i = loot.indexOf(it);
  if (i >= 0) loot.splice(i, 1);
  scene.remove(it.grp);
  if (it.supply) { dropActive = false; els.dropAlert.classList.add("hidden"); }

  if (it.kind === "ammo") {
    if (player.gunWeapon) {
      /* le munizioni aggiungono solo una PARTE, non ricaricano tutto */
      const w = WEAPONS[player.gunWeapon];
      const gain = w.ammoPickup || 20;
      const before = player.ammo;
      player.ammo = Math.min(w.ammo, player.ammo + gain);
      showToast("➕ MUNIZIONI +" + (player.ammo - before), 1000);
      sfx(500, 0.1, "square", 0.05);
    } else {
      showToast("Serve un'arma per le munizioni", 1000);
    }
    return;
  }

  /* arma: se è la stessa, ricarica; altrimenti scambia (la vecchia cade) */
  if (player.gunWeapon === it.weapon) {
    player.ammo = WEAPONS[it.weapon].ammo;
  } else {
    dropWeaponAt(player, player.pos.x, player.pos.z);
    player.gunWeapon = it.weapon;
    player.gunLeg = it.leg;
    player.leg = it.leg;               /* sincronizzato per il danno leggendario */
    player.ammo = WEAPONS[it.weapon].ammo;
    player.meleeMode = false;          /* equipaggia subito la nuova arma */
  }
  player.weapon = player.meleeMode ? "fists" : player.gunWeapon;
  showToast("🔫 " + WEAPONS[it.weapon].name + (it.leg ? " ★ LEGGENDARIA!" : ""), 1200);
  sfx(420, 0.12, "square", 0.06);
}

/* ---------- AI nemici ---------- */
function updateBot(bot, dt) {
  if (!bot.alive || phase !== "playing") return;
  bot.hitT -= dt;
  bot.reloadCd -= dt;
  bot.recoilT -= dt;

  const toPlayer = new THREE.Vector3().subVectors(player.pos, bot.pos);
  const dist = Math.hypot(toPlayer.x, toPlayer.z);
  const inZona = !inStorm(bot.pos);
  const w = WEAPONS[bot.weapon];
  const lowAmmo = bot.ammo <= 0;

  /* cerca le munizioni più vicine quando è a secco */
  let ammoTarget = null, ammoDist = 999;
  if (lowAmmo) {
    for (const it of loot) {
      if (it.kind !== "ammo") continue;
      const d = Math.hypot(it.pos.x - bot.pos.x, it.pos.z - bot.pos.z);
      if (d < ammoDist) { ammoDist = d; ammoTarget = it; }
    }
  }

  let target = null;
  if (!inZona) {
    target = new THREE.Vector3(storm.cx, 0, storm.cz);
  } else if (lowAmmo && dist < 4.6) {
    target = player.pos;                       /* pugni! */
  } else if (lowAmmo && ammoTarget && ammoDist < 60) {
    target = ammoTarget.pos;                   /* vai a prendere munizioni */
  } else if (dist < w.range + 3) {
    target = player.pos;
  } else {
    bot.wanderT -= dt;
    if (bot.wanderT <= 0) {
      bot.wanderT = rand(2, 4.5);
      const a = rand(0, Math.PI * 2), r = rand(5, 18);
      bot.wanderTarget.set(bot.pos.x + Math.cos(a) * r, 0, bot.pos.z + Math.sin(a) * r);
    }
    target = bot.wanderTarget;
  }

  const dir = new THREE.Vector3().subVectors(target, bot.pos);
  dir.y = 0;
  if (dir.lengthSq() > 0.5) {
    dir.normalize();
    bot.pos.addScaledVector(dir, bot.speed * dt);
    resolveEntity(bot, 0.5);
    bot.aimYaw = Math.atan2(dir.x, dir.z);
  }

  /* spara / pugni */
  if (lowAmmo) {
    if (dist < 4.6 && bot.reloadCd <= 0) {
      bot.reloadCd = WEAPONS.fists.reload;
      fireEntity(bot, toPlayer.x / (dist || 1), toPlayer.z / (dist || 1), false);
    }
  } else if (dist < w.range && bot.reloadCd <= 0) {
    bot.reloadCd = Math.max(w.reload, 0.25);
    const ang = Math.atan2(toPlayer.x, toPlayer.z) + rand(-0.12, 0.12);
    fireEntity(bot, Math.sin(ang), Math.cos(ang), false);
  }

  /* raccoglie munizioni standoci sopra */
  if (lowAmmo && ammoTarget) {
    const d = Math.hypot(ammoTarget.pos.x - bot.pos.x, ammoTarget.pos.z - bot.pos.z);
    if (d < PICKUP_DIST) {
      bot.pickupProg += dt;
      if (bot.pickupProg >= AMMO_NEED) {
        bot.pickupProg = 0;
        const li = loot.indexOf(ammoTarget);
        if (li >= 0) loot.splice(li, 1);
        scene.remove(ammoTarget.grp);
        bot.ammo = WEAPONS[bot.gunWeapon].ammo;
        bot.weapon = bot.gunWeapon;           /* torna in mano l'arma */
        sfx(500, 0.1, "square", 0.03);
      }
    } else {
      bot.pickupProg = 0;
    }
  }

  applyEntityVisual(bot);
}

/* ---------- Proiettili ---------- */
const UP_VEC = new THREE.Vector3(0, 0, 1);
function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    const step = p.vel.clone().multiplyScalar(dt);
    p.pos.add(step);
    p.traveled += step.length();
    p.grp.position.copy(p.pos);
    if (p.stretch) {
      /* tracer: allunga il proiettile lungo la direzione */
      p.grp.quaternion.setFromUnitVectors(UP_VEC, p.vel.clone().normalize());
      p.grp.scale.set(0.55, 0.55, 2.4);
    }

    let dead = false;
    if (Math.abs(p.pos.x) > MAP_HALF || Math.abs(p.pos.z) > MAP_HALF) dead = true;
    if (p.traveled > p.range) dead = true;

    if (!dead) {
      for (const o of rocks) {
        const dx = Math.max(Math.abs(p.pos.x - o.x) - o.half, 0);
        const dz = Math.max(Math.abs(p.pos.z - o.z) - o.half, 0);
        if (dx * dx + dz * dz < 0.25) { dead = true; break; }
      }
    }
    if (!dead) {
      for (const t of trees) {
        if ((p.pos.x - t.x) ** 2 + (p.pos.z - t.z) ** 2 < (t.r + 0.25) ** 2) { dead = true; break; }
      }
    }
    if (!dead) {
      for (let ci = crates.length - 1; ci >= 0; ci--) {
        const c = crates[ci];
        const dx = Math.max(Math.abs(p.pos.x - c.x) - c.half, 0);
        const dz = Math.max(Math.abs(p.pos.z - c.z) - c.half, 0);
        if (dx * dx + dz * dz < 0.25) {
          c.hp -= p.dmg;
          sfx(260, 0.08, "triangle", 0.04);
          if (c.hp <= 0) breakCrate(c);
          dead = true;
          break;
        }
      }
    }

    /* entità: corpo o testa */
    if (!dead && p.fromPlayer) {
      for (const b of bots) {
        if (!b.alive) continue;
        const d = Math.hypot(b.pos.x - p.pos.x, b.pos.z - p.pos.z);
        if (p.head) {
          const hd = Math.hypot(b.pos.x - p.pos.x, b.pos.z - p.pos.z);
          if (hd < 0.45) {
            matchHits++;
            damageEntity(b, p.dmg * 2, true, true);
            dead = true; break;
          }
        } else if (d < 0.7) {
          matchHits++;
          damageEntity(b, p.dmg, true, false);
          dead = true; break;
        }
      }
    }
    if (!dead && !p.fromPlayer && player.alive) {
      const d = Math.hypot(player.pos.x - p.pos.x, player.pos.z - p.pos.z);
      if (p.head) {
        if (d < 0.45) { damageEntity(player, p.dmg * 2, false, true); dead = true; }
      } else if (d < 0.7) {
        damageEntity(player, p.dmg, false, false); dead = true;
      }
    }

    if (dead) {
      scene.remove(p.grp);
      if (p.explosive) explode(p.pos.x, p.pos.z, p.dmg, p.fromPlayer);
      projectiles.splice(i, 1);
    }
  }
}

/* ---------- Loot/effetti/aggiornamenti vari ---------- */
function updateLootVisuals(dt) {
  for (const it of loot) {
    it.t += dt;
    if (it.supply && it.readyT > 0) {
      /* caduta del supply drop */
      it.fallT = (it.fallT || 0) + dt;
      it.grp.position.y = Math.max(0, 55 - it.fallT * 26);
      it.grp.rotation.y += dt * 4;
    } else {
      it.grp.position.y = Math.abs(Math.sin(it.t * 2)) * 0.3;
      it.grp.rotation.y += dt * 2;
    }
  }
  for (let i = explosions.length - 1; i >= 0; i--) {
    const ex = explosions[i];
    ex.t += dt / 0.35;
    const s = 0.8 + ex.t * 12;
    ex.mesh.scale.set(s, s, s);
    ex.mesh.material.opacity = Math.max(0, 1 - ex.t);
    if (ex.t >= 1) {
      scene.remove(ex.mesh);
      ex.mesh.material.dispose();
      explosions.splice(i, 1);
    }
  }
  updateParticles(dt);
}

function updateAimLine() {
  if (!aimLine || !player) return;
  const w = WEAPONS[player.weapon];
  const len = w.melee ? 2 : 4;
  const pts = [
    new THREE.Vector3(player.pos.x + aimDir.x * 1.1, 0.9, player.pos.z + aimDir.z * 1.1),
    new THREE.Vector3(player.pos.x + aimDir.x * (1.1 + len), 0.9, player.pos.z + aimDir.z * (1.1 + len)),
  ];
  aimLine.geometry.dispose();
  aimLine.geometry = new THREE.BufferGeometry().setFromPoints(pts);
  aimLine.material.color.setHex(legendT > 0 ? 0xffd75e : 0x78dcff);
}

function applyEntityVisual(e) {
  e.grp.position.copy(e.pos);
  e.grp.rotation.y = e.aimYaw;
  /* rinculo: sposta leggermente indietro lungo la mira */
  if (e.recoilT > 0) {
    const k = (e.recoilT / 0.09) * 0.22;
    e.grp.position.x -= Math.sin(e.aimYaw) * k;
    e.grp.position.z -= Math.cos(e.aimYaw) * k;
  }
  const s = e.hitT > 0 ? 1.12 : 1;
  e.grp.scale.set(s, s, s);
}

/* ---------- Camera ---------- */
function addShake(a) { shake = Math.min(shake + a, 1.3); }
function updateCamera(dt) {
  if (!player) return;
  const target = player.pos.clone().add(new THREE.Vector3(0, 26, 15));
  camera.position.lerp(target, 1 - Math.exp(-4.5 * dt));
  if (shake > 0.001) {
    camera.position.x += (Math.random() - 0.5) * shake * 0.9;
    camera.position.z += (Math.random() - 0.5) * shake * 0.9;
    shake *= Math.exp(-5.5 * dt);
  }
  camera.lookAt(player.pos);
}

/* ---------- HUD ---------- */
function updateHud() {
  els.hpFill.style.width = Math.max(0, player.hp) + "%";
  els.hpVal.textContent = Math.max(0, Math.round(player.hp));
  els.killsVal.textContent = kills;
  els.aliveVal.textContent = bots.filter((b) => b.alive).length + 1;

  const w = WEAPONS[player.weapon];
  els.weaponName.textContent = w.name;
  if (player.weapon === "fists") {
    els.weaponAmmo.textContent = "∞";
    els.weaponAmmo.classList.remove("low");
    els.weaponBox.classList.remove("leg");
    els.weaponRar.textContent = player.gunWeapon ? "👊 PUGNI" : "DEFAULT";
  } else {
    const max = WEAPONS[player.gunWeapon].ammo;
    els.weaponAmmo.textContent = Math.max(0, Math.round(player.ammo)) + "/" + max;
    els.weaponAmmo.classList.toggle("low", player.ammo <= max * 0.2);
    els.weaponBox.classList.toggle("leg", player.gunLeg);
    els.weaponRar.textContent = player.gunLeg ? "★ LEGGENDARIA" : "COMUNE";
  }
  els.weaponBox.classList.toggle("legend-mode", legendT > 0);
  /* tasto cambio pugni/arma */
  if (player.gunWeapon) {
    els.switchBtn.classList.remove("hidden");
    els.switchBtn.textContent = player.weapon === "fists"
      ? "🔫 " + WEAPONS[player.gunWeapon].name
      : "👊 PUGNI";
  } else {
    els.switchBtn.classList.add("hidden");
  }

  if (storm.state === "wait") els.stormVal.textContent = "Tempesta fra " + Math.max(0, Math.ceil(storm.timer)) + "s";
  else if (storm.state === "shrink") els.stormVal.textContent = "🔥 LA TEMPESTA ARRIVA!";
  else els.stormVal.textContent = "Cerchio finale!";

  /* vignetta HP basso */
  els.vignette.classList.toggle("active", player.hp < 35);
}

function updateBotBars() {
  /* riuso delle barre: niente DOM thrash ogni frame */
  const used = new Set();
  for (const b of bots) {
    if (!b.alive) continue;
    const v = b.pos.clone().add(new THREE.Vector3(0, 2.1, 0)).project(camera);
    if (v.z > 1) continue;
    const x = ((v.x + 1) / 2) * window.innerWidth;
    const y = ((-v.y + 1) / 2) * window.innerHeight;
    if (x < -20 || x > window.innerWidth + 20 || y < -20 || y > window.innerHeight + 20) continue;
    let bar = b.barEl;
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "botbar";
      const fill = document.createElement("div");
      bar.appendChild(fill);
      els.botBars.appendChild(bar);
      b.barEl = bar;
    }
    used.add(b);
    bar.style.left = x + "px";
    bar.style.top = y + "px";
    bar.firstChild.style.width = Math.max(0, b.hp / 80 * 100) + "%";
  }
  for (const b of bots) {
    if (b.barEl && !used.has(b) && b.barEl.parentNode) {
      b.barEl.parentNode.removeChild(b.barEl);
      b.barEl = null;
    }
  }
}

function drawMinimap() {
  const ctx = els.minimap.getContext("2d");
  const S = 110;
  const scale = S / (MAP_HALF * 2.3);
  ctx.clearRect(0, 0, S, S);
  const cx = S / 2, cy = S / 2;
  /* arena */
  ctx.fillStyle = "rgba(60, 90, 50, 0.5)";
  ctx.fillRect(0, 0, S, S);
  /* tempesta */
  ctx.beginPath();
  ctx.arc(cx + storm.cx * scale, cy + storm.cz * scale, storm.r * scale, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 80, 50, 0.75)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + storm.cx * scale, cy + storm.cz * scale, storm.r * scale, 0, Math.PI * 2);
  ctx.strokeStyle = "#ff5a45";
  ctx.lineWidth = 2;
  ctx.stroke();
  /* loot: armi gialle, munizioni verdi, supply drop arancione */
  ctx.fillStyle = "rgba(255, 215, 94, 0.8)";
  for (const it of loot) {
    if (it.kind === "ammo" || it.supply) continue;
    ctx.fillRect(cx + it.pos.x * scale - 1, cy + it.pos.z * scale - 1, 2, 2);
  }
  ctx.fillStyle = "rgba(124, 224, 138, 0.8)";
  for (const it of loot) {
    if (it.kind !== "ammo") continue;
    ctx.fillRect(cx + it.pos.x * scale - 1, cy + it.pos.z * scale - 1, 2, 2);
  }
  ctx.fillStyle = "rgba(255, 154, 58, 1)";
  for (const it of loot) {
    if (!it.supply) continue;
    ctx.beginPath();
    ctx.arc(cx + it.pos.x * scale, cy + it.pos.z * scale, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  /* giocatore */
  ctx.beginPath();
  ctx.arc(cx + player.pos.x * scale, cy + player.pos.z * scale, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "#3fb8e8";
  ctx.fill();
  /* nemici */
  for (const b of bots) {
    if (!b.alive) continue;
    ctx.beginPath();
    ctx.arc(cx + b.pos.x * scale, cy + b.pos.z * scale, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b5e";
    ctx.fill();
  }
}

/* ---------- Toast ---------- */
let toastTimer = 0;
function showToast(msg, ms) {
  els.toastText.textContent = msg;
  els.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.add("hidden"), ms || 1800);
}

/* ---------- Confetti ---------- */
let confettiRaf = 0;
let confettiParts = [];
const CONFETTI_COLORS = ["#ffd75e", "#ff6b5e", "#5ac8e0", "#58d66b", "#ff5ec4", "#b06ad0", "#ffffff"];
function startConfetti() {
  const cv = els.confettiCanvas;
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
  cv.classList.add("show");
  const ctx = cv.getContext("2d");
  confettiParts = [];
  for (let i = 0; i < 140; i++) {
    confettiParts.push({
      x: Math.random() * cv.width,
      y: -20 - Math.random() * cv.height * 0.5,
      w: rand(5, 10), h: rand(8, 14),
      vx: rand(-1.5, 1.5), vy: rand(2, 5),
      rot: Math.random() * Math.PI, vr: rand(-0.2, 0.2),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      sway: rand(0, Math.PI * 2),
    });
  }
  let t0 = performance.now();
  const step = (now) => {
    const dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    ctx.clearRect(0, 0, cv.width, cv.height);
    let alive = 0;
    for (const p of confettiParts) {
      p.sway += dt * 3;
      p.x += p.vx + Math.sin(p.sway) * 0.8;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y < cv.height + 30) alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive > 0) confettiRaf = requestAnimationFrame(step);
    else { cv.classList.remove("show"); ctx.clearRect(0, 0, cv.width, cv.height); confettiRaf = 0; }
  };
  cancelAnimationFrame(confettiRaf);
  confettiRaf = requestAnimationFrame(step);
}

/* ---------- Reset partita ---------- */
function resetMatch() {
  for (const b of bots) scene.remove(b.grp);
  bots = [];
  for (const p of projectiles) scene.remove(p.grp);
  projectiles = [];
  for (const it of loot) scene.remove(it.grp);
  loot = [];
  for (const c of crates) scene.remove(c.grp);
  crates = [];
  for (const o of rocks) scene.remove(o.mesh);
  rocks = [];
  if (forestMesh) scene.remove(forestMesh);   /* evita foreste duplicate */
  forestMesh = null;
  trees = [];
  for (const p of particles) { scene.remove(p.mesh); p.mesh.material.dispose(); }
  particles = [];
  if (player) scene.remove(player.grp);
  player = null;
  kills = 0;
  streak = 0;
  legendT = 0;
  matchShots = 0; matchHits = 0;
  timeScale = 1;
  shake = 0;
  dropTimer = 25;
  dropActive = false;
  els.dropAlert.classList.add("hidden");
  els.pickupBar.classList.add("hidden");
  els.hud.classList.remove("legend");
  els.weaponBox.classList.remove("legend-mode");
  els.vignette.classList.remove("active");
  els.damageNumbers.innerHTML = "";
  els.streakBox.classList.add("hidden");
  els.pausedOverlay.classList.add("hidden");
  els.endOverlay.classList.add("hidden");
  els.confettiCanvas.classList.remove("show");
  cancelAnimationFrame(confettiRaf);

  storm.cx = 0; storm.cz = 0;
  storm.r = 120; storm.startR = 120;
  storm.targetR = STORM_PHASES[0].r;
  storm.state = "wait"; storm.timer = STORM_WAIT;
  storm.phaseIdx = 0; storm.dmgAcc = 0;
  els.stormBox.classList.remove("warn");

  buildForest();
  buildObstacles();
  buildStormVisuals();
  spawnInitialLoot();

  makePlayer();
  for (let i = 0; i < BOT_COUNT; i++) bots.push(makeBot(i));

  phase = "playing";
  els.endOverlay.classList.add("hidden");
  els.startOverlay.classList.add("hidden");
  lastT = performance.now();
  showToast("🔥 IN ARENA! Trova un'arma!", 2000);
}

/* ---------- Risoluzione adattiva ---------- */
function monitorPerformance(rawDt) {
  fpsAcc += 1 / Math.max(rawDt, 1e-4);
  fpsN++;
  fpsTimer += rawDt;
  if (fpsTimer >= 2) {
    fpsAvg = fpsAcc / fpsN;
    fpsAcc = 0; fpsN = 0; fpsTimer = 0;
    const maxDpr = Math.min(window.devicePixelRatio || 1, 2);
    if (fpsAvg < 40 && targetDpr > 1.2) {
      targetDpr = Math.max(1.2, targetDpr - 0.25);
    } else if (fpsAvg > 56 && targetDpr < maxDpr) {
      targetDpr = Math.min(maxDpr, targetDpr + 0.25);
    }
    if (targetDpr !== curDpr) {
      curDpr = targetDpr;
      renderer.setPixelRatio(curDpr);
      resize();
    }
  }
}

/* ---------- Loop ---------- */
function loop(now) {
  const rawDt = Math.min(1 / 30, (now - lastT) / 1000);
  lastT = now;

  if (phase === "playing") {
    const dt = rawDt * timeScale;
    timeScale += (1 - timeScale) * Math.min(1, rawDt * 3);
    if (legendT > 0) {
      legendT -= dt;
      if (legendT <= 0) {
        els.hud.classList.remove("legend");
        els.weaponBox.classList.remove("legend-mode");
        showToast("Fine della modalità leggenda…", 1200);
      }
    }
    updateStorm(dt);
    updatePlayer(dt);
    for (const b of bots) updateBot(b, dt);
    updateProjectiles(dt);
    updateLootVisuals(dt);
    updateAimLine();
    updateStormArrow();
    monitorPerformance(rawDt);

    /* supply drop periodico */
    if (!dropActive) {
      dropTimer -= dt;
      if (dropTimer <= 0) {
        dropTimer = 35;
        startSupplyDrop();
      }
    }
  }

  updateCamera(rawDt);
  renderer.render(scene, camera);

  if (phase === "playing") {
    updateHud();
    updateBotBars();
    drawMinimap();
  }
  requestAnimationFrame(loop);
}

/* ---------- Resize ---------- */
function resize() {
  if (!renderer) return;
  const w = els.canvas.clientWidth, h = els.canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", () => { if (started) resize(); });

/* ---------- Pausa automatica quando la tab è nascosta ---------- */
document.addEventListener("visibilitychange", () => {
  if (document.hidden && phase === "playing") togglePause();
});

/* ---------- Avvio ---------- */
els.startBtn.addEventListener("click", () => {
  initAudio();
  try { initThree(); } catch (e) { els.status.textContent = "WebGL non disponibile."; return; }
  started = true;
  if (window.matchMedia("(pointer: fine)").matches) {
    els.crosshair.classList.remove("hidden");
  }
  try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {}); } catch (e) {}
  resetMatch();
  requestAnimationFrame(loop);
});

els.restartBtn.addEventListener("click", () => resetMatch());

els.pauseBtn.addEventListener("click", togglePause);
els.resumeBtn.addEventListener("click", togglePause);
els.quitBtn.addEventListener("click", () => {
  /* abbandona: conteggiata come sconfitta */
  if (phase === "paused") {
    phase = "over";
    const place = bots.filter((b) => b.alive).length + 1;
    els.endTitle.textContent = "🚪 PARTITA ABBANDONATA";
    els.endInfo.textContent = "Posizione: " + place + "/" + (BOT_COUNT + 1);
    els.endKills.textContent = "Eliminazioni: " + kills;
    els.endStats.textContent = "Colpi: " + matchShots + " · Precisione: " + matchAccuracy() + "%";
    els.endRecords.textContent = "";
    endMatchStats(place);
    els.pausedOverlay.classList.add("hidden");
    els.endOverlay.classList.remove("hidden");
  }
});
els.soundBtn.addEventListener("click", toggleSound);
els.soundBtn2.addEventListener("click", toggleSound);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

applySoundUI();
updateRecordsUI();
els.status.textContent = "Pronto! Tocca per giocare";
els.startBtn.disabled = false;
