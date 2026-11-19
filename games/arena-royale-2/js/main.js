/* Arena Royale 2 — bootstrap and main loop */

import * as THREE from 'three';
import { G, resetRuntime } from './state.js';
import {
  BOT_COUNT, WEAPONS
} from './config.js';
import { stats } from './store.js';
import { getSound, setSound, getLang, setLang } from './store.js';
import { initAudio, sfx } from './audio.js';
import { initEffects, updateParticles, updateExplosions, stopConfetti, toast } from './effects.js';
import { initThree, resize, buildForest, buildObstacles, buildStormVisuals, spawnInitialLoot, startSupplyDrop, inStorm } from './world.js';
import { makePlayer, makeBot, updatePlayer, updateBot, collectLoot, updateLootPickup, applyEntityVisual } from './entities.js';
import { fireEntity, updateProjectiles, recordMatchResult } from './combat.js';
import { updateStorm, updateStormArrow } from './storm.js';
import {
  initUI, el, showToast, applySoundUI, applyLangUI, updateRecordsUI,
  updateStreakUI, updateHud, updateBotBars, drawMinimap, updateFps, resetHud, showEnd
} from './ui.js';
import { initInput, resetInputVisuals } from './input.js';
import { disposeObject } from './dispose.js';

function disposeAll() {
  for (const list of [G.bots, G.projectiles, G.loot, G.crates, G.rocks]) {
    for (const item of list) disposeObject(item.grp || item.mesh);
  }
  G.bots = []; G.projectiles = []; G.loot = []; G.crates = []; G.rocks = [];
  for (const p of G.particles) disposeObject(p.mesh);
  G.particles = [];
  for (const ex of G.explosions) disposeObject(ex.mesh);
  G.explosions = [];
  if (G.player) disposeObject(G.player.grp);
  if (G.forestMesh) disposeObject(G.forestMesh);
  if (document.getElementById('botBars')) document.getElementById('botBars').innerHTML = '';
  for (const b of G.bots) b.barEl = null;
  stopConfetti();
}

function resetMatch() {
  disposeAll();
  resetRuntime();

  buildForest();
  buildObstacles();
  buildStormVisuals();
  spawnInitialLoot();
  makePlayer();
  for (let i = 0; i < BOT_COUNT; i++) G.bots.push(makeBot(i));

  resetHud();
  resetInputVisuals();
  updateRecordsUI();
  updateStreakUI();
  if (window.matchMedia('(pointer: fine)').matches) {
    document.getElementById('crosshair')?.classList.remove('hidden');
  }
  G.phase = 'playing';
  el.startOverlay?.classList.add('hidden');
  el.endOverlay?.classList.add('hidden');
  el.pausedOverlay?.classList.add('hidden');
  G.lastT = performance.now();
  showToast('inArena', 2000);
}

function togglePause() {
  if (G.phase === 'playing') {
    G.phase = 'paused';
    el.pausedOverlay?.classList.remove('hidden');
    G.input.mouseDown = false;
    sfx(480, 0.12, 'sine', 0.05);
  } else if (G.phase === 'paused') {
    G.phase = 'playing';
    el.pausedOverlay?.classList.add('hidden');
    G.lastT = performance.now();
  }
}

function updateLootVisuals(dt) {
  for (const it of G.loot) {
    it.t += dt;
    if (it.supply && it.readyT > 0) {
      it.fallT = (it.fallT || 0) + dt;
      it.grp.position.y = Math.max(0, 55 - it.fallT * 26);
      it.grp.rotation.y += dt * 4;
    } else {
      it.grp.position.y = Math.abs(Math.sin(it.t * 2)) * 0.3;
      it.grp.rotation.y += dt * 2;
    }
  }
  updateExplosions(dt);
  updateParticles(dt);
}

function updateAimLine() {
  if (!G.aimLine || !G.player) return;
  const w = WEAPONS[G.player.weapon];
  const len = w && w.melee ? 2 : 4;
  const pts = [
    new THREE.Vector3(G.player.pos.x + G.aimDir.x * 1.1, 0.9, G.player.pos.z + G.aimDir.z * 1.1),
    new THREE.Vector3(G.player.pos.x + G.aimDir.x * (1.1 + len), 0.9, G.player.pos.z + G.aimDir.z * (1.1 + len))
  ];
  G.aimLine.geometry.dispose();
  G.aimLine.geometry = new THREE.BufferGeometry().setFromPoints(pts);
  G.aimLine.material.color.setHex(G.legendT > 0 ? 0xffd75e : 0x78dcff);
}

function updateCamera(dt) {
  if (!G.player || !G.camera) return;
  const target = G.player.pos.clone().add(new THREE.Vector3(0, 26, 15));
  G.camera.position.lerp(target, 1 - Math.exp(-4.5 * dt));
  if (G.shake > 0.001) {
    G.camera.position.x += (Math.random() - 0.5) * G.shake * 0.9;
    G.camera.position.z += (Math.random() - 0.5) * G.shake * 0.9;
    G.shake *= Math.exp(-5.5 * dt);
  }
  G.camera.lookAt(G.player.pos);
}

function monitorPerformance(rawDt) {
  G.fpsAcc += 1 / Math.max(rawDt, 1e-4);
  G.fpsN++;
  G.fpsTimer += rawDt;
  if (G.fpsTimer < 2) return;
  G.fpsAvg = G.fpsAcc / G.fpsN;
  G.fpsAcc = 0; G.fpsN = 0; G.fpsTimer = 0;
  const maxDpr = Math.min(window.devicePixelRatio || 1, 2);
  if (G.fpsAvg < 40 && G.targetDpr > 1.2) G.targetDpr = Math.max(1.2, G.targetDpr - 0.25);
  else if (G.fpsAvg > 56 && G.targetDpr < maxDpr) G.targetDpr = Math.min(maxDpr, G.targetDpr + 0.25);
  if (G.targetDpr !== G.curDpr) {
    G.curDpr = G.targetDpr;
    G.renderer.setPixelRatio(G.curDpr);
    resize();
  }
}

function loop(now) {
  const rawDt = Math.min(1 / 30, (now - G.lastT) / 1000);
  G.lastT = now;

  if (G.phase === 'playing') {
    const dt = rawDt * G.timeScale;
    G.timeScale += (1 - G.timeScale) * Math.min(1, rawDt * 3);
    if (G.legendT > 0) {
      G.legendT -= dt;
      if (G.legendT <= 0) {
        document.getElementById('hud')?.classList.remove('legend');
        document.getElementById('weaponBox')?.classList.remove('legend-mode');
        showToast('legendOff', 1200);
      }
    }
    updateStorm(dt);
    updatePlayer(dt, fireEntity);
    for (const bot of G.bots) updateBot(bot, dt, fireEntity);
    updateProjectiles(dt);
    updateLootVisuals(dt);
    updateAimLine();
    updateStormArrow();
    monitorPerformance(rawDt);

    if (!G.dropActive) {
      G.dropTimer -= dt;
      if (G.dropTimer <= 0) {
        G.dropTimer = 35;
        startSupplyDrop();
      }
    }
  }

  updateCamera(rawDt);
  if (G.renderer && G.scene && G.camera) G.renderer.render(G.scene, G.camera);

  if (G.phase === 'playing' || G.phase === 'paused') {
    updateHud();
    updateBotBars();
    drawMinimap();
    updateFps();
  }
  requestAnimationFrame(loop);
}

/* ---------- Bootstrap ---------- */
initUI();
initEffects({ ...el, confettiCanvas: document.getElementById('confettiCanvas') });
if (el.langBtn) el.langBtn.textContent = getLang() === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
applyLangUI();

initInput({ onPause: togglePause, onAudio: initAudio });

el.startBtn?.addEventListener('click', () => {
  initAudio();
  try { initThree(document.getElementById('gameCanvas')); }
  catch (e) { el.status.textContent = 'WebGL non disponibile.'; return; }
  G.started = true;
  try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* ignore */ }
  resetMatch();
  requestAnimationFrame(loop);
});

el.restartBtn?.addEventListener('click', resetMatch);
el.pauseBtn?.addEventListener('click', togglePause);
el.resumeBtn?.addEventListener('click', togglePause);
el.quitBtn?.addEventListener('click', () => {
  if (G.phase !== 'paused') return;
  const place = G.bots.filter(b => b.alive).length + 1;
  G.phase = 'over';
  showEnd({ won: false, place, abandoned: true });
  recordMatchResult({ won: false, place });
  el.pausedOverlay.classList.add('hidden');
});

el.soundBtn?.addEventListener('click', () => {
  setSound(!getSound());
  applySoundUI();
  if (getSound()) sfx(500, 0.08, 'square', 0.05);
});
el.soundBtn2?.addEventListener('click', () => {
  setSound(!getSound());
  applySoundUI();
});
el.langBtn?.addEventListener('click', () => {
  setLang(getLang() === 'it' ? 'en' : 'it');
  applyLangUI();
});

window.addEventListener('resize', () => { if (G.started) resize(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && G.phase === 'playing') togglePause();
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

el.status.textContent = 'Pronto! Tocca per giocare';
el.startBtn.disabled = false;
