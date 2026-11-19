/* Arena Royale 2 — weapons, projectiles, damage and match outcomes */

import * as THREE from 'three';
import { G, aliveBots } from './state.js';
import { MAP_HALF, BOT_COUNT, WEAPONS, weaponStats, rand } from './config.js';
import { PROJ_MAT, spawnLoot, removeLoot, inStorm } from './world.js';
import {
  sfx, buzz
} from './audio.js';
import {
  spawnParticle, poof, explosionRing, addShake,
  spawnDamageNumber, killFeed, damageDirection, flashHit, startConfetti, toast
} from './effects.js';
import { showEnd, updateStreakUI, updateRecordsUI } from './ui.js';
import { recordMatch, stats } from './store.js';
import { t } from './i18n.js';

const UP_VEC = new THREE.Vector3(0, 0, 1);
const STREAK_KEYS = { 2: 'kill1', 3: 'kill2', 4: 'kill3', 5: 'kill4' };
const STREAK_ICONS = { 2: '⚡', 3: '🔥', 4: '☠️', 5: '👑' };

export function matchAccuracy() {
  return G.matchShots > 0 ? Math.round((G.matchHits / G.matchShots) * 100) : 0;
}

export function fireEntity(entity, dirX, dirZ, fromPlayer) {
  const w = WEAPONS[entity.weapon];
  const st = weaponStats(w, entity.leg);
  entity.reloadCd = w.reload;
  entity.recoilT = 0.09;
  const dmgMul = fromPlayer && G.legendT > 0 ? 3 : 1;

  if (w.melee) {
    const base = Math.atan2(dirX, dirZ);
    const targets = fromPlayer ? G.bots : [G.player];
    let hitAny = false;
    for (const target of targets) {
      if (!target || !target.alive) continue;
      const dx = target.pos.x - entity.pos.x, dz = target.pos.z - entity.pos.z;
      if (Math.hypot(dx, dz) > w.range) continue;
      let ang = Math.atan2(dx, dz) - base;
      while (ang > Math.PI) ang -= Math.PI * 2;
      while (ang < -Math.PI) ang += Math.PI * 2;
      if (Math.abs(ang) < 1.4) {
        damageEntity(target, rand(st.dmgMin, st.dmgMax) * dmgMul, fromPlayer, false, false, entity.pos);
        hitAny = true;
      }
    }
    if (hitAny) { sfx(180, 0.12, 'square', 0.05); buzz(10); }
    return;
  }

  if (entity.ammo <= 0) {
    if (fromPlayer && Math.random() < 0.2) toast(t('noAmmo'), 700);
    sfx(120, 0.1, 'square', 0.04);
    return;
  }
  entity.ammo--;
  if (fromPlayer) G.matchShots++;

  const base = Math.atan2(dirX, dirZ);
  for (let i = 0; i < w.pellets; i++) {
    let ang = base;
    if (w.pellets > 1) ang += (i / (w.pellets - 1) - 0.5) * w.spread * 2;
    else ang += (Math.random() - 0.5) * w.spread * 2;
    const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    const radius = w.explosive ? 0.34 : 0.2;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 6, 5), PROJ_MAT);
    const p = {
      grp: mesh,
      pos: entity.pos.clone().addScaledVector(dir, 1.1),
      vel: dir.clone().multiplyScalar(w.projSpeed),
      dmg: rand(st.dmgMin, st.dmgMax) * dmgMul,
      fromPlayer, head: w.head, explosive: !!w.explosive,
      traveled: 0, range: w.range, owner: entity, stretch: !w.explosive
    };
    p.pos.y = w.head ? 1.32 : 0.9;
    mesh.position.copy(p.pos);
    G.scene.add(mesh);
    G.projectiles.push(p);
  }
  sfx(fromPlayer ? 620 : 340, 0.08, 'square', fromPlayer ? 0.03 : 0.02);
  if (w.explosive) sfx(90, 0.25, 'sawtooth', 0.06);
  const gx = entity.pos.x + Math.sin(base) * 1.2;
  const gz = entity.pos.z + Math.cos(base) * 1.2;
  spawnParticle(gx, 0.9, gz, 0, 0, 0, 0xffe27a, 0.07, 0.34, false);
  if (fromPlayer) {
    sfx(240, 0.05, 'square', 0.02);
    addShake(w.explosive ? 0.5 : 0.12);
  }
}

export function explode(x, z, dmg, fromPlayer) {
  const targets = fromPlayer ? G.bots : [G.player];
  for (const target of targets) {
    if (!target || !target.alive) continue;
    const d = Math.hypot(target.pos.x - x, target.pos.z - z);
    if (d < 3.6) {
      const f = d < 1.4 ? 1 : 1 - ((d - 1.4) / 2.2) * 0.6;
      damageEntity(target, dmg * f, fromPlayer, false, false, { x, y: 0, z });
    }
  }
  for (let i = G.crates.length - 1; i >= 0; i--) {
    const c = G.crates[i];
    if (Math.hypot(c.x - x, c.z - z) < 2.4) {
      c.hp -= dmg;
      if (c.hp <= 0) breakCrate(c);
    }
  }
  explosionRing(x, z);
  poof(x, 0.6, z, 0xffa050, 12);
  addShake(fromPlayer ? 0.55 : 0.35);
  sfx(70, 0.5, 'sawtooth', 0.07);
  buzz(25);
}

export function breakCrate(crate) {
  if (Math.random() < 0.55) spawnLoot('ammo', 'ar', false, crate.x, crate.z, 0.5);
  poof(crate.x, 0.8, crate.z, 0xa8713a, 8);
  const i = G.crates.indexOf(crate);
  if (i >= 0) {
    const grp = crate.grp;
    G.crates.splice(i, 1);
    if (grp) {
      grp.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      G.scene.remove(grp);
    }
  }
}

export function damageEntity(entity, amount, fromPlayer, headshot, quiet, sourcePos) {
  if (!entity || !entity.alive) return;
  entity.hp -= amount;
  entity.hitT = 0.12;
  if (entity === G.player) {
    sfx(240, 0.1, 'sawtooth', 0.05);
    if (!quiet) {
      buzz(15);
      flashHit();
      addShake(0.35);
      if (sourcePos) damageDirection(sourcePos, entity.pos);
      G.streak = 0;
      updateStreakUI();
      spawnDamageNumber(entity, Math.round(amount), true, false);
    }
  } else if (!quiet) {
    spawnDamageNumber(entity, Math.round(amount), false, !!headshot);
  }
  if (entity.hp <= 0) {
    entity.alive = false;
    entity.hp = 0;
    if (entity === G.player) onPlayerDeath();
    else onBotDeath(entity, fromPlayer);
  }
}

export function onPlayerDeath() {
  G.phase = 'over';
  const place = aliveBots() + 1;
  showEnd({ won: false, place });
  recordMatchResult({ won: false, place });
  sfx(140, 0.5, 'sawtooth', 0.06);
  buzz([60, 40, 80]);
}

export function onBotDeath(bot, fromPlayer) {
  if (bot.grp) {
    G.scene.remove(bot.grp);
    bot.grp.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
  }
  poof(bot.pos.x, 0.7, bot.pos.z, 0xff6b5e, 12);
  if (bot.barEl && bot.barEl.parentNode) bot.barEl.parentNode.removeChild(bot.barEl);
  bot.barEl = null;

  if (fromPlayer) {
    G.kills++;
    G.streak++;
    stats.maxStreak = Math.max(stats.maxStreak, G.streak);
    updateStreakUI();
    const icon = STREAK_ICONS[Math.min(G.streak, 5)] || '👑';
    if (G.streak >= 2) {
      toast(`${icon} ${t(STREAK_KEYS[Math.min(G.streak, 5)] || 'kill4')} (${G.streak})`, 1200);
    }
    killFeed(`🎯 ${t('eliminations')} +1`, 'player');
    sfx(300, 0.2, 'sawtooth', 0.06);
    buzz(30);
  }
  if (bot.gunWeapon && bot.gunWeapon !== 'fists') {
    spawnLoot('weapon', bot.gunWeapon, bot.leg, bot.pos.x, bot.pos.z, 1.2);
  }
  if (G.phase !== 'playing') return;
  if (aliveBots() === 0) {
    G.phase = 'victory';
    showEnd({ won: true, place: 1 });
    recordMatchResult({ won: true, place: 1 });
    toast('victory', 2500);
    sfx(520, 0.4, 'square', 0.06);
    buzz([80, 60, 80, 60, 120]);
    G.timeScale = 0.35;
    setTimeout(() => { G.timeScale = 1; }, 1100);
    startConfetti();
  }
}

export function updateProjectiles(dt) {
  for (let i = G.projectiles.length - 1; i >= 0; i--) {
    const p = G.projectiles[i];
    const step = p.vel.clone().multiplyScalar(dt);
    p.pos.add(step);
    p.traveled += step.length();
    p.grp.position.copy(p.pos);
    if (p.stretch) {
      p.grp.quaternion.setFromUnitVectors(UP_VEC, p.vel.clone().normalize());
      p.grp.scale.set(0.55, 0.55, 2.4);
    }
    let dead = false;
    if (Math.abs(p.pos.x) > MAP_HALF || Math.abs(p.pos.z) > MAP_HALF) dead = true;
    if (p.traveled > p.range) dead = true;

    if (!dead) for (const o of G.rocks) {
      const dx = Math.max(Math.abs(p.pos.x - o.x) - o.half, 0);
      const dz = Math.max(Math.abs(p.pos.z - o.z) - o.half, 0);
      if (dx * dx + dz * dz < 0.25) { dead = true; break; }
    }
    if (!dead) for (const tr of G.trees) {
      if ((p.pos.x - tr.x) ** 2 + (p.pos.z - tr.z) ** 2 < (tr.r + 0.25) ** 2) { dead = true; break; }
    }
    if (!dead) for (let ci = G.crates.length - 1; ci >= 0; ci--) {
      const c = G.crates[ci];
      const dx = Math.max(Math.abs(p.pos.x - c.x) - c.half, 0);
      const dz = Math.max(Math.abs(p.pos.z - c.z) - c.half, 0);
      if (dx * dx + dz * dz < 0.25) {
        c.hp -= p.dmg;
        sfx(260, 0.08, 'triangle', 0.04);
        if (c.hp <= 0) breakCrate(c);
        dead = true;
        break;
      }
    }
    if (!dead && p.fromPlayer) {
      for (const b of G.bots) {
        if (!b.alive) continue;
        const d = Math.hypot(b.pos.x - p.pos.x, b.pos.z - p.pos.z);
        if (p.head ? d < 0.45 : d < 0.7) {
          G.matchHits++;
          damageEntity(b, p.head ? p.dmg * 2 : p.dmg, true, !!p.head, false, p.pos);
          dead = true;
          break;
        }
      }
    }
    if (!dead && !p.fromPlayer && G.player && G.player.alive) {
      const d = Math.hypot(G.player.pos.x - p.pos.x, G.player.pos.z - p.pos.z);
      if (p.head ? d < 0.45 : d < 0.7) {
        damageEntity(G.player, p.head ? p.dmg * 2 : p.dmg, false, !!p.head, false, p.pos);
        dead = true;
      }
    }
    if (dead) {
      p.grp.geometry.dispose();
      G.scene.remove(p.grp);
      if (p.explosive) explode(p.pos.x, p.pos.z, p.dmg, p.fromPlayer);
      G.projectiles.splice(i, 1);
    }
  }
}

export function recordMatchResult({ won, place }) {
  recordMatch({ place, kills: G.kills, won });
  updateRecordsUI();
}
