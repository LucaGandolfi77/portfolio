/* Arena Royale 2 — storm phases, damage and direction indicator */

import * as THREE from 'three';
import { G } from './state.js';
import { STORM_DMG, STORM_PHASES, STORM_WAIT, STORM_SHRINK, clamp } from './config.js';
import { buildStormVisuals, setTargetLineVisible, inStorm } from './world.js';
import { damageEntity } from './combat.js';
import { sfx } from './audio.js';
import { showToast } from './ui.js';

export function updateStorm(dt) {
  if (G.phase !== 'playing') return;
  const storm = G.storm;
  storm.timer -= dt;

  if (storm.state === 'wait') {
    if (storm.timer <= 0) {
      storm.state = 'shrink';
      storm.startR = storm.r;
      storm.timer = STORM_SHRINK;
      document.getElementById('stormBox')?.classList.add('warn');
      showToast('stormComing', 1600);
      sfx(180, 0.7, 'sawtooth', 0.06);
    }
  } else {
    const t = 1 - clamp(storm.timer / STORM_SHRINK, 0, 1);
    storm.r = storm.targetR + (storm.startR - storm.targetR) * (1 - t * t);
    if (storm.timer <= 0) {
      storm.r = storm.targetR;
      storm.phaseIdx++;
      if (storm.phaseIdx < STORM_PHASES.length) {
        storm.state = 'wait';
        storm.timer = STORM_WAIT;
        storm.targetR = STORM_PHASES[storm.phaseIdx].r;
        document.getElementById('stormBox')?.classList.remove('warn');
      } else {
        storm.state = 'end';
        storm.timer = 999;
      }
      buildStormVisuals();
    }
  }
  setTargetLineVisible(storm.state === 'wait');

  storm.dmgAcc += STORM_DMG * dt;
  while (storm.dmgAcc >= 1) {
    storm.dmgAcc -= 1;
    if (G.player && inStorm(G.player.pos)) damageEntity(G.player, 1, false, false, true);
    for (const b of G.bots) {
      if (b.alive && inStorm(b.pos)) damageEntity(b, 1, false, false, true);
    }
  }
}

export function updateStormArrow() {
  if (!G.player) return;
  const outside = inStorm(G.player.pos);
  const el = document.getElementById('stormArrow');
  if (!el) return;
  el.classList.toggle('hidden', !outside);
  if (!outside) return;
  const dx = G.storm.cx - G.player.pos.x;
  const dz = G.storm.cz - G.player.pos.z;
  const angle = Math.atan2(dx, -dz);
  const arrow = el.querySelector('.arrow');
  if (arrow) arrow.style.transform = `rotate(${angle}rad)`;
}
