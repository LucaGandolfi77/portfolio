/* Arena Royale 2 — HUD, minimap, overlays and bilingual interface */

import * as THREE from 'three';
import { G } from './state.js';
import { BOT_COUNT, MAP_HALF, WEAPONS, STORM_WAIT } from './config.js';
import { stats } from './store.js';
import { getSound, getLang } from './store.js';
import { t, applyLanguage } from './i18n.js';
import { toast, stopConfetti } from './effects.js';

const ids = [
  'hud', 'hpFill', 'hpVal', 'killsVal', 'aliveVal', 'streakBox', 'streakVal',
  'stormVal', 'stormBox', 'stormTimerRing', 'minimap', 'weaponBox', 'weaponRar',
  'weaponName', 'weaponAmmo', 'ammoPips', 'switchBtn', 'dropAlert', 'botBars',
  'pickupBar', 'pickupFill', 'pickupLabel', 'killFeed', 'damageDir', 'fpsBox',
  'records', 'endTitle', 'endInfo', 'endKills', 'endStats', 'endRecords',
  'soundBtn', 'soundBtn2', 'langBtn', 'pauseBtn', 'pausedOverlay', 'endOverlay',
  'startOverlay', 'vignette', 'toast', 'toastText',
  'startBtn', 'status', 'resumeBtn', 'quitBtn', 'restartBtn'
];

export const el = {};
let minimapCtx = null;

export function initUI() {
  for (const id of ids) el[id] = document.getElementById(id);
  const map = el.minimap;
  if (map) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    map.width = Math.round(110 * dpr);
    map.height = Math.round(110 * dpr);
    minimapCtx = map.getContext('2d');
    minimapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  applyLanguage();
  applySoundUI();
  updateRecordsUI();
}

export function showToast(message, ms = 1800) {
  const translated = t(message);
  toast(translated === message ? message : translated, ms);
}

export function applySoundUI() {
  const icon = getSound() ? '🔊' : '🔇';
  if (el.soundBtn) el.soundBtn.textContent = icon;
  if (el.soundBtn2) el.soundBtn2.textContent = icon;
}

export function applyLangUI() {
  applyLanguage();
  if (el.langBtn) el.langBtn.textContent = getLang() === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  updateRecordsUI();
}

export function updateRecordsUI() {
  if (!el.records) return;
  el.records.innerHTML =
    `🏆 ${t('records')}: <b>${stats.wins}</b> ${t('wins')} · 💀 <b>${stats.kills}</b> ${t('totalKills')} · ` +
    `🥇 ${t('bestPlace')}: <b>N°${stats.bestPlace}</b> · ⚡ max <b>${stats.maxStreak}</b>`;
}

export function updateStreakUI() {
  if (!el.streakBox) return;
  el.streakVal.textContent = G.streak;
  el.streakBox.classList.toggle('hidden', G.streak < 2);
}

export function showEnd({ won, place, abandoned = false }) {
  if (el.endTitle) {
    el.endTitle.textContent = abandoned
      ? '🚪 ' + t('abandoned')
      : won ? '🏆 ' + t('victory') : '💀 ' + t('gameover');
  }
  if (el.endInfo) {
    el.endInfo.textContent = won
      ? t('survivor')
      : `${t('position')}: ${place}/${BOT_COUNT + 1}`;
  }
  if (el.endKills) el.endKills.textContent = `${t('eliminations')}: ${G.kills}`;
  if (el.endStats) {
    el.endStats.textContent = `${t('shots')}: ${G.matchShots} · ${t('accuracy')}: ${accuracy()}% · ${t('streak')}: ${G.streak}`;
  }
  if (!won) stopConfetti();
  el.endOverlay?.classList.remove('hidden');
}

function accuracy() {
  return G.matchShots > 0 ? Math.round((G.matchHits / G.matchShots) * 100) : 0;
}

export function updateHud() {
  const p = G.player;
  if (!p) return;
  const hp = Math.max(0, Math.round(p.hp));
  if (el.hpFill) {
    el.hpFill.style.width = hp + '%';
    el.hpFill.classList.toggle('critical', hp < 35);
  }
  if (el.hpVal) el.hpVal.textContent = hp;
  if (el.killsVal) el.killsVal.textContent = G.kills;
  if (el.aliveVal) el.aliveVal.textContent = G.bots.filter(b => b.alive).length + 1;

  const w = WEAPONS[p.weapon];
  if (el.weaponName) el.weaponName.textContent = w.name;
  if (el.weaponAmmo) {
    if (p.weapon === 'fists') {
      el.weaponAmmo.textContent = '∞';
      el.weaponAmmo.classList.remove('low');
    } else {
      const max = WEAPONS[p.gunWeapon].ammo;
      el.weaponAmmo.textContent = Math.max(0, Math.round(p.ammo)) + '/' + max;
      el.weaponAmmo.classList.toggle('low', p.ammo <= max * 0.2);
    }
  }
  if (el.weaponRar) {
    el.weaponRar.textContent = p.weapon === 'fists'
      ? (p.gunWeapon ? '👊 ' + t('fists') : t('common'))
      : p.gunLeg ? t('legend') : t('common');
  }
  el.weaponBox?.classList.toggle('legend', !!p.gunLeg);
  el.weaponBox?.classList.toggle('legend-mode', G.legendT > 0);
  if (el.ammoPips) {
    if (p.weapon === 'fists' || !p.gunWeapon) el.ammoPips.innerHTML = '';
    else {
      const max = WEAPONS[p.gunWeapon].ammo;
      const ratio = Math.max(0, Math.min(1, p.ammo / max));
      const pips = 10;
      const filled = Math.round(ratio * pips);
      el.ammoPips.innerHTML = Array.from({ length: pips }, (_, i) =>
        `<i class="${i < filled ? 'on' : ''}"></i>`).join('');
    }
  }
  if (el.switchBtn) {
    el.switchBtn.classList.toggle('hidden', !p.gunWeapon);
    /* Without a gun the button is hidden and there is no name to show. */
    if (p.gunWeapon) {
      el.switchBtn.textContent = p.weapon === 'fists'
        ? '🔫 ' + WEAPONS[p.gunWeapon].name
        : '👊 ' + t('fists');
    }
  }

  const storm = G.storm;
  if (el.stormVal) {
    if (storm.state === 'wait') {
      const s = Math.max(0, Math.ceil(storm.timer));
      el.stormVal.textContent = `${t('stormIn')} ${s}s`;
    } else if (storm.state === 'shrink') el.stormVal.textContent = t('stormComing');
    else el.stormVal.textContent = t('stormFinal');
  }
  if (el.stormTimerRing) {
    const ratio = storm.state === 'wait' ? 1 - storm.timer / STORM_WAIT : 0;
    el.stormTimerRing.style.setProperty('--p', Math.round(ratio * 100) + '%');
  }
  el.stormBox?.classList.toggle('warn', storm.state === 'shrink');
  el.vignette?.classList.toggle('active', hp < 35);
}

export function updateBotBars() {
  if (!el.botBars) return;
  const used = new Set();
  for (const b of G.bots) {
    if (!b.alive || !G.camera) continue;
    const v = b.pos.clone().add(new THREE.Vector3(0, 2.1, 0)).project(G.camera);
    if (v.z > 1) continue;
    const x = ((v.x + 1) / 2) * window.innerWidth;
    const y = ((-v.y + 1) / 2) * window.innerHeight;
    if (x < -20 || x > window.innerWidth + 20 || y < -20 || y > window.innerHeight + 20) continue;
    let bar = b.barEl;
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'botbar';
      const fill = document.createElement('div');
      bar.appendChild(fill);
      el.botBars.appendChild(bar);
      b.barEl = bar;
    }
    used.add(b);
    bar.style.left = x + 'px';
    bar.style.top = y + 'px';
    bar.firstChild.style.width = Math.max(0, b.hp / 80 * 100) + '%';
  }
  for (const b of G.bots) {
    if (b.barEl && !used.has(b) && b.barEl.parentNode) {
      b.barEl.parentNode.removeChild(b.barEl);
      b.barEl = null;
    }
  }
}

export function drawMinimap() {
  if (!minimapCtx || !G.player) return;
  const ctx = minimapCtx;
  const S = 110;
  const scale = S / (MAP_HALF * 2.3);
  ctx.clearRect(0, 0, S, S);
  const cx = S / 2, cy = S / 2;
  ctx.fillStyle = 'rgba(30,42,66,.65)';
  ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = 'rgba(255,255,255,.18)';
  ctx.strokeRect(0.5, 0.5, S - 1, S - 1);

  ctx.strokeStyle = '#ff6b5e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, G.storm.r * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(127,212,255,.8)';
  ctx.beginPath();
  ctx.arc(cx, cy, G.storm.targetR * scale, 0, Math.PI * 2);
  ctx.stroke();

  for (const b of G.bots) {
    if (!b.alive) continue;
    ctx.fillStyle = '#ff6b5e';
    ctx.beginPath();
    ctx.arc(cx + b.pos.x * scale, cy + b.pos.z * scale, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#5ee0ff';
  ctx.beginPath();
  ctx.arc(cx + G.player.pos.x * scale, cy + G.player.pos.z * scale, 3.2, 0, Math.PI * 2);
  ctx.fill();
}

export function updateFps() {
  if (!el.fpsBox) return;
  el.fpsBox.textContent = `${Math.round(G.fpsAvg)} ${t('fps')} · ${G.curDpr.toFixed(2)}x`;
}

export function resetHud() {
  el.killFeed && (el.killFeed.innerHTML = '');
  el.pickupBar?.classList.add('hidden');
  el.dropAlert?.classList.add('hidden');
  el.streakBox?.classList.add('hidden');
  el.vignette?.classList.remove('active');
  el.hpFill?.classList.remove('critical');
  el.endOverlay?.classList.add('hidden');
  el.pausedOverlay?.classList.add('hidden');
}
