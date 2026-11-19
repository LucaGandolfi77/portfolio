/* Arena Royale 2 — player, bots, movement and loot pickup */

import * as THREE from 'three';
import { G } from './state.js';
import {
  BOT_COUNT, BOT_COLORS, BOT_WEAPONS, PLAYER_SPEED, PICKUP_DIST,
  AMMO_NEED, WEAPONS, rand, rollWeapon
} from './config.js';
import { sfx } from './audio.js';
import { resolveEntity, dropWeaponAt, removeLoot, inStorm } from './world.js';
import { showToast } from './ui.js';
import { t } from './i18n.js';

export function makeCharacter(color) {
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
  G.scene.add(grp);
  return grp;
}

export function makePlayer() {
  const player = {
    grp: makeCharacter(0x3fb8e8),
    pos: new THREE.Vector3(rand(-6, 6), 0, rand(-6, 6)),
    hp: 100, weapon: 'fists', gunWeapon: null, gunLeg: false,
    meleeMode: false, leg: false, ammo: Infinity,
    reloadCd: 0, recoilT: 0, alive: true, aimYaw: 0, hitT: 0
  };
  player.grp.position.copy(player.pos);
  G.player = player;
  return player;
}

export function makeBot(i) {
  const a = (i / BOT_COUNT) * Math.PI * 2 + rand(-0.4, 0.4);
  const r = rand(55, 105);
  const gun = rollWeapon(BOT_WEAPONS);
  const bot = {
    grp: makeCharacter(BOT_COLORS[i % BOT_COLORS.length]),
    pos: new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r),
    hp: 80,
    gunWeapon: gun, weapon: gun,
    leg: Math.random() < 0.2,
    ammo: WEAPONS[gun].ammo,
    speed: rand(5.6, 7.2),
    reloadCd: rand(0.2, 1),
    recoilT: 0, pickupProg: 0, alive: true,
    aimYaw: rand(0, Math.PI * 2),
    wanderT: 0, wanderTarget: new THREE.Vector3(), hitT: 0,
    barEl: null
  };
  bot.grp.position.copy(bot.pos);
  return bot;
}

export function toggleMelee() {
  if (G.phase !== 'playing' || !G.player || !G.player.gunWeapon) return;
  G.player.meleeMode = !G.player.meleeMode;
  G.player.weapon = G.player.meleeMode ? 'fists' : G.player.gunWeapon;
  sfx(300, 0.06, 'square', 0.04);
}

export function applyEntityVisual(e) {
  e.grp.position.copy(e.pos);
  e.grp.rotation.y = e.aimYaw;
  if (e.recoilT > 0) {
    const k = (e.recoilT / 0.09) * 0.22;
    e.grp.position.x -= Math.sin(e.aimYaw) * k;
    e.grp.position.z -= Math.cos(e.aimYaw) * k;
  }
  const s = e.hitT > 0 ? 1.12 : 1;
  e.grp.scale.set(s, s, s);
}

export function updateAim() {
  const { joyAim, mouseX, mouseY, mouseUsed } = G.input;
  if (joyAim.active) {
    const d = Math.hypot(joyAim.dx, joyAim.dy);
    if (d > 0.12) G.aimDir.set(joyAim.dx, 0, joyAim.dy).normalize();
  } else if (mouseUsed && G.camera && G.player) {
    const rect = G.renderer.domElement.getBoundingClientRect();
    const nx = ((mouseX - rect.left) / rect.width) * 2 - 1;
    const ny = -((mouseY - rect.top) / rect.height) * 2 + 1;
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(nx, ny), G.camera);
    const hit = new THREE.Vector3();
    if (ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) {
      const d = new THREE.Vector3(hit.x - G.player.pos.x, 0, hit.z - G.player.pos.z);
      if (d.lengthSq() > 0.01) G.aimDir.copy(d).normalize();
    }
  }
}

export function updatePlayer(dt, fireFn) {
  const p = G.player;
  if (!p || !p.alive || G.phase !== 'playing') return;
  p.hitT -= dt;
  p.reloadCd -= dt;
  p.recoilT -= dt;

  const { joyMove, keys } = G.input;
  let mx = joyMove.dx, mz = joyMove.dy;
  if (keys.up) mz = -1;
  if (keys.down) mz = 1;
  if (keys.left) mx = -1;
  if (keys.right) mx = 1;
  const ml = Math.hypot(mx, mz);
  if (ml > 1) { mx /= ml; mz /= ml; }
  if (ml > 0.15) {
    p.pos.x += mx * PLAYER_SPEED * dt;
    p.pos.z += mz * PLAYER_SPEED * dt;
    resolveEntity(p, 0.5);
  }

  updateAim();
  p.aimYaw = Math.atan2(G.aimDir.x, G.aimDir.z);
  if ((G.input.joyAim.active || G.input.mouseDown) && p.reloadCd <= 0) {
    fireFn(p, G.aimDir.x, G.aimDir.z, true);
  }
  updateLootPickup(dt, (best, bestD) => {
    const bar = document.getElementById('pickupBar');
    const fill = document.getElementById('pickupFill');
    const label = document.getElementById('pickupLabel');
    if (best && bestD < PICKUP_DIST) {
      bar?.classList.remove('hidden');
      const ratio = Math.min(1, best.prog / best.need);
      if (fill) fill.style.width = Math.round(ratio * 100) + '%';
      if (label) {
        const name = best.kind === 'ammo' ? t('ammo') : WEAPONS[best.weapon].name;
        label.textContent = `${t('collecting')} ${name} ${Math.round(ratio * 100)}%`;
      }
      if (best.prog >= best.need) {
        collectLoot(best);
        bar?.classList.add('hidden');
      }
    } else bar?.classList.add('hidden');
  });
  applyEntityVisual(p);
}

export function updateLootPickup(dt, onCollect) {
  let best = null, bestD = PICKUP_DIST;
  for (const it of G.loot) {
    const d = Math.hypot(G.player.pos.x - it.pos.x, G.player.pos.z - it.pos.z);
    if (d < bestD) { bestD = d; best = it; }
    if (d < PICKUP_DIST) {
      if (it.readyT > 0) it.readyT -= dt;
      else it.prog += dt;
    } else if (it.prog > 0) {
      it.prog = Math.max(0, it.prog - dt * 2);
    }
  }
  onCollect(best, bestD);
}

export function collectLoot(item) {
  const p = G.player;
  removeLoot(item);
  if (item.kind === 'ammo') {
    if (p.gunWeapon) {
      const w = WEAPONS[p.gunWeapon];
      const gain = w.ammoPickup || 20;
      const before = p.ammo;
      p.ammo = Math.min(w.ammo, p.ammo + gain);
      showToast('ammo +' + (p.ammo - before), 1000);
      sfx(500, 0.1, 'square', 0.05);
    } else showToast('needWeapon', 1000);
    return;
  }
  if (p.gunWeapon === item.weapon) {
    p.ammo = WEAPONS[item.weapon].ammo;
  } else {
    dropWeaponAt(p, p.pos.x, p.pos.z);
    p.gunWeapon = item.weapon;
    p.gunLeg = item.leg;
    p.leg = item.leg;
    p.ammo = WEAPONS[item.weapon].ammo;
    p.meleeMode = false;
  }
  p.weapon = p.meleeMode ? 'fists' : p.gunWeapon;
  showToast('newWeapon · ' + WEAPONS[item.weapon].name + (item.leg ? ' ★' : ''), 1200);
  sfx(420, 0.12, 'square', 0.06);
}

export function updateBot(bot, dt, fireFn) {
  if (!bot.alive || G.phase !== 'playing' || !G.player) return;
  bot.hitT -= dt;
  bot.reloadCd -= dt;
  bot.recoilT -= dt;

  const toPlayer = new THREE.Vector3().subVectors(G.player.pos, bot.pos);
  const dist = Math.hypot(toPlayer.x, toPlayer.z);
  const inZona = !inStorm(bot.pos);
  const w = WEAPONS[bot.weapon];
  const lowAmmo = bot.ammo <= 0;

  let ammoTarget = null, ammoDist = 999;
  if (lowAmmo) {
    for (const it of G.loot) {
      if (it.kind !== 'ammo') continue;
      const d = Math.hypot(it.pos.x - bot.pos.x, it.pos.z - bot.pos.z);
      if (d < ammoDist) { ammoDist = d; ammoTarget = it; }
    }
  }

  let target;
  if (!inZona) target = new THREE.Vector3(G.storm.cx, 0, G.storm.cz);
  else if (lowAmmo && dist < 4.6) target = G.player.pos;
  else if (lowAmmo && ammoTarget && ammoDist < 60) target = ammoTarget.pos;
  else if (dist < w.range + 3) target = G.player.pos;
  else {
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

  if (lowAmmo) {
    if (dist < 4.6 && bot.reloadCd <= 0) {
      bot.reloadCd = WEAPONS.fists.reload;
      fireFn(bot, toPlayer.x / (dist || 1), toPlayer.z / (dist || 1), false);
    }
  } else if (dist < w.range && bot.reloadCd <= 0) {
    bot.reloadCd = Math.max(w.reload, 0.25);
    const ang = Math.atan2(toPlayer.x, toPlayer.z) + rand(-0.12, 0.12);
    fireFn(bot, Math.sin(ang), Math.cos(ang), false);
  }

  if (lowAmmo && ammoTarget) {
    const d = Math.hypot(ammoTarget.pos.x - bot.pos.x, ammoTarget.pos.z - bot.pos.z);
    if (d < PICKUP_DIST) {
      bot.pickupProg += dt;
      if (bot.pickupProg >= AMMO_NEED) {
        bot.pickupProg = 0;
        removeLoot(ammoTarget);
        bot.ammo = WEAPONS[bot.gunWeapon].ammo;
        bot.weapon = bot.gunWeapon;
        sfx(500, 0.1, 'square', 0.03);
      }
    } else bot.pickupProg = 0;
  }
  applyEntityVisual(bot);
}
