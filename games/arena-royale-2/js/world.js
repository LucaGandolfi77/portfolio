/* Arena Royale 2 — Three.js scene, terrain, obstacles, loot and collisions */

import * as THREE from 'three';
import { G } from './state.js';
import {
  MAP_HALF, BOT_COUNT, PICKUP_NEED, AMMO_NEED, LEG_CHANCE,
  LOOT_WEIGHTS, WEAPONS, clamp, rand, rollWeapon
} from './config.js';
import { disposeObject } from './dispose.js';
import { sfx } from './audio.js';
import { showToast } from './ui.js';
import { poof } from './effects.js';

const PROJ_MAT = new THREE.MeshBasicMaterial({ color: 0xffe27a });
const SUP_MAT = new THREE.MeshBasicMaterial({ color: 0xff9a3a });

let stormLineGeo = null, dangerGeo = null, targetLineGeo = null;
let stormLine = null, dangerRing = null, targetLine = null;

export function initThree(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  G.curDpr = G.targetDpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(G.curDpr);
  G.renderer = renderer;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x1a2340, 90, 220);
  G.scene = scene;
  G.camera = new THREE.PerspectiveCamera(54, 1, 0.1, 800);

  scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x3a3f55, 1.0));
  const sun = new THREE.DirectionalLight(0xffe6c0, 1.15);
  sun.position.set(40, 70, 30);
  scene.add(sun);

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
  gGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3));
  scene.add(new THREE.Mesh(gGeo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));

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

  const aimGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1)
  ]);
  G.aimLine = new THREE.Line(aimGeo, new THREE.LineBasicMaterial({ color: 0x78dcff, transparent: true, opacity: 0.75 }));
  scene.add(G.aimLine);
  resize();
}

export function resize() {
  if (!G.renderer || !G.camera) return;
  const canvas = G.renderer.domElement;
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  G.renderer.setSize(w, h, false);
  G.camera.aspect = w / h;
  G.camera.updateProjectionMatrix();
}

export function buildForest() {
  if (G.forestMesh) { disposeObject(G.forestMesh); G.forestMesh = null; }
  G.trees = [];
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
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const inst = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), 900);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  let placed = 0;
  const cell = 8.6;
  for (let gx = -MAP_HALF + 4; gx < MAP_HALF - 4; gx += cell) {
    for (let gz = -MAP_HALF + 4; gz < MAP_HALF - 4; gz += cell) {
      if (placed >= 900) break;
      const x = gx + rand(-3, 3), z = gz + rand(-3, 3);
      if (Math.hypot(x, z) < 10 || Math.abs(x) > MAP_HALF - 2 || Math.abs(z) > MAP_HALF - 2) continue;
      const sc = 0.8 + Math.random() * 0.8;
      s.set(sc, sc * (0.9 + Math.random() * 0.5), sc);
      p.set(x, -0.4, z);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
      m.compose(p, q, s);
      inst.setMatrixAt(placed, m);
      G.trees.push({ x, z, r: 0.7 });
      placed++;
    }
  }
  inst.count = placed;
  G.scene.add(inst);
  G.forestMesh = inst;
}

export function blockedAt(x, z, minD) {
  for (const o of G.rocks) if (Math.hypot(x - o.x, z - o.z) < minD) return true;
  for (const c of G.crates) if (Math.hypot(x - c.x, z - c.z) < minD) return true;
  for (const t of G.trees) if (Math.hypot(x - t.x, z - t.z) < minD) return true;
  return false;
}

export function buildObstacles() {
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
    const mesh = new THREE.Mesh(g, rockMat);
    mesh.position.set(x, 0.8, z);
    mesh.scale.y = 0.8;
    G.scene.add(mesh);
    G.rocks.push({ mesh, x, z, half: 1.9 });
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
    G.scene.add(grp);
    G.crates.push({ grp, x, z, half: 0.8, hp: 30 });
    placed++;
  }
}

/* ---------- Storm visuals ---------- */
function makeCircleLine(r) {
  const pts = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

export function buildStormVisuals() {
  if (!G.scene) return;
  if (stormLineGeo) { stormLineGeo.dispose(); dangerGeo.dispose(); targetLineGeo.dispose(); }
  for (const obj of [stormLine, dangerRing, targetLine]) if (obj) disposeObject(obj);

  stormLineGeo = makeCircleLine(G.storm.r);
  stormLine = new THREE.LineLoop(stormLineGeo, new THREE.LineBasicMaterial({ color: 0xff5a45 }));
  stormLine.position.y = 0.18;
  G.scene.add(stormLine);

  const outer = Math.hypot(MAP_HALF, MAP_HALF) + 5;
  dangerGeo = new THREE.RingGeometry(G.storm.r, outer, 64);
  dangerRing = new THREE.Mesh(dangerGeo, new THREE.MeshBasicMaterial({
    color: 0xff3b2a, transparent: true, opacity: 0.20, side: THREE.DoubleSide, depthWrite: false
  }));
  dangerRing.rotation.x = -Math.PI / 2;
  dangerRing.position.y = 0.12;
  G.scene.add(dangerRing);

  targetLineGeo = makeCircleLine(G.storm.targetR);
  targetLine = new THREE.LineLoop(targetLineGeo, new THREE.LineBasicMaterial({ color: 0x7fd4ff, transparent: true, opacity: 0.9 }));
  targetLine.position.y = 0.16;
  targetLine.visible = G.storm.state === 'wait';
  G.scene.add(targetLine);
}

export function setTargetLineVisible(visible) {
  if (targetLine) targetLine.visible = visible;
}

/* ---------- Loot ---------- */
function makeLootMesh(kind, weaponKey, leg) {
  const grp = new THREE.Group();
  if (kind === 'ammo') {
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
  G.scene.add(grp);
  return grp;
}

export function spawnLoot(kind, weaponKey, leg, x, z, readyT = 0, supply = false) {
  const grp = makeLootMesh(kind, weaponKey, leg);
  grp.position.set(x, 0, z);
  const item = {
    grp, kind, weapon: weaponKey, leg,
    pos: new THREE.Vector3(x, 0, z),
    t: rand(0, 6), readyT, prog: 0,
    need: kind === 'ammo' ? AMMO_NEED : PICKUP_NEED,
    supply, fallT: 0
  };
  if (supply) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), SUP_MAT);
    const strap = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.25, 1.7), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    strap.position.y = 0.9;
    grp.add(box, strap);
    grp.position.y = 55;
    G.dropActive = true;
    showToast('supplyIncoming', 2000);
    sfx(200, 0.8, 'sawtooth', 0.06);
  }
  G.loot.push(item);
  return item;
}

function lootNear(x, z, minD) {
  return G.loot.some(it => Math.hypot(it.pos.x - x, it.pos.z - z) < minD);
}

export function spawnInitialLoot() {
  let placed = 0, tries = 0;
  while (placed < 40 && tries < 8000) {
    tries++;
    const x = rand(-MAP_HALF + 8, MAP_HALF - 8), z = rand(-MAP_HALF + 8, MAP_HALF - 8);
    if (Math.hypot(x, z) < 14 || blockedAt(x, z, 2.4) || lootNear(x, z, 2.2)) continue;
    spawnLoot('weapon', rollWeapon(LOOT_WEIGHTS), Math.random() < LEG_CHANCE, x, z, 0);
    placed++;
  }
  placed = 0; tries = 0;
  while (placed < 48 && tries < 8000) {
    tries++;
    const x = rand(-MAP_HALF + 8, MAP_HALF - 8), z = rand(-MAP_HALF + 8, MAP_HALF - 8);
    if (Math.hypot(x, z) < 14 || blockedAt(x, z, 2) || lootNear(x, z, 1.6)) continue;
    spawnLoot('ammo', 'ar', false, x, z, 0);
    placed++;
  }
}

export function dropWeaponAt(entity, x, z) {
  if (!entity.gunWeapon) return;
  spawnLoot('weapon', entity.gunWeapon, entity.gunLeg, x + rand(-1.6, 1.6), z + rand(-1.6, 1.6), 1.2);
}

export function startSupplyDrop() {
  const x = rand(-MAP_HALF + 10, MAP_HALF - 10);
  const z = rand(-MAP_HALF + 10, MAP_HALF - 10);
  const w = ['minigun', 'bazooka', 'quadzooka'][Math.floor(Math.random() * 3)];
  spawnLoot('weapon', w, Math.random() < 0.5, x, z, 2.5, true);
}

export function removeLoot(item) {
  const i = G.loot.indexOf(item);
  if (i >= 0) G.loot.splice(i, 1);
  disposeObject(item.grp);
  if (item.supply) G.dropActive = false;
}

/* ---------- Collision helpers ---------- */
export function circleBlocked(x, z, r) {
  for (const o of G.rocks) {
    const dx = Math.max(Math.abs(x - o.x) - o.half, 0);
    const dz = Math.max(Math.abs(z - o.z) - o.half, 0);
    if (dx * dx + dz * dz < r * r) return o;
  }
  for (const c of G.crates) {
    const dx = Math.max(Math.abs(x - c.x) - c.half, 0);
    const dz = Math.max(Math.abs(z - c.z) - c.half, 0);
    if (dx * dx + dz * dz < r * r) return c;
  }
  for (const t of G.trees) {
    if ((x - t.x) ** 2 + (z - t.z) ** 2 < (r + t.r) ** 2) return t;
  }
  return null;
}

export function resolveEntity(e, r) {
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

export function inStorm(p) {
  return Math.hypot(p.x - G.storm.cx, p.z - G.storm.cz) > G.storm.r;
}

export { PROJ_MAT };
