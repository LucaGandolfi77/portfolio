/* Gacha chest reveal sequence: shake, open, beam, card, celebrate */

import { fxFor, phaseDurations, PHASES, nextPhase, confettiCount } from '../data/chest-fx.js';
import { createChest } from '../render/chest.js';
import { miniAvatarUrl } from '../render/mini-avatar.js';

let active = null;

function el(id) { return document.getElementById(id); }

function confetti(container, tier, reduced) {
  const count = confettiCount(tier, reduced);
  if (!container || !count) return;
  container.innerHTML = '';
  const colors = ['#ffd166', '#4de8ff', '#a78bfa', '#ff7b9c', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%';
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = (Math.random() * 0.3).toFixed(2) + 's';
    s.style.animationDuration = (0.9 + Math.random() * 0.8).toFixed(2) + 's';
    container.appendChild(s);
  }
}

export function revealChest(pull, reward, context = {}) {
  const modal = el('chestModal');
  const canvas = el('chestCanvas');
  if (!modal || !canvas) return;
  if (active) active.close();

  const fx = fxFor(pull.tier);
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const sfx = context.sfx;
  const i18n = context.i18n;
  const durations = phaseDurations(pull.tier, reduced);
  const timeline = PHASES.slice(1).map(phase => ({ phase, ms: durations[phase] || 0 }));
  const total = timeline.reduce((a, p) => a + p.ms, 0);

  modal.hidden = false;
  el('chestCard').hidden = true;
  el('chestFx').innerHTML = '';
  el('chestRarity').textContent = '';
  el('chestCard').style.setProperty('--rarity', fx.color);
  el('chestStamp').textContent = pull.guaranteed && i18n ? i18n.t('guaranteed') : fx.stamp;
  el('chestStamp').style.color = fx.color;
  el('chestRarity').style.color = fx.color;

  const chest = createChest(canvas);
  if (chest) {
    chest.setRarity(pull.tier);
    const wrap = canvas.parentElement;
    chest.resize(wrap.clientWidth, wrap.clientHeight, Math.min(1.5, window.devicePixelRatio || 1));
  }

  if (reward && reward.player) {
    const p = reward.player;
    el('chestNumber').textContent = p.jersey == null ? 1 : p.jersey;
    el('chestAvatar').src = miniAvatarUrl(p, context.team || null, 128);
    el('chestName').textContent = p.name;
    el('chestSub').textContent = reward.duplicate
      ? (i18n ? i18n.t('duplicate') : 'Duplicate')
      : `${p.pos} · ${p.ovr} OVR`;
    el('chestOvr').textContent = String(p.ovr);
  } else {
    el('chestNumber').textContent = '✦';
    el('chestAvatar').removeAttribute('src');
    el('chestName').textContent = i18n ? i18n.t('fragments') : 'Fragments';
    el('chestSub').textContent = '';
    el('chestOvr').textContent = String(fx.particles);
  }

  let raf = 0;
  let closed = false;
  let finished = false;
  let currentPhase = 'idle';
  const start = performance.now();

  function close() {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(raf);
    modal.hidden = true;
    el('chestCard').hidden = true;
    if (chest) chest.dispose();
    active = null;
    if (context.onDone) context.onDone();
  }

  function finish() {
    if (finished) return;
    finished = true;
    el('chestRarity').textContent = fx.stamp;
    el('chestCard').hidden = false;
    confetti(el('chestFx'), pull.tier, reduced);
    if (!reduced && fx.flash) {
      modal.style.background = `rgba(255,255,255,${fx.flash})`;
      setTimeout(() => { modal.style.background = ''; }, 140);
    }
    setTimeout(close, reduced ? 900 : 2200);
  }

  function frame(now) {
    if (closed) return;
    const elapsed = now - start;
    let acc = 0;
    let phase = 'done';
    let progress = 1;
    for (const item of timeline) {
      if (elapsed <= acc + item.ms || item.ms <= 0) {
        phase = item.phase;
        progress = item.ms > 0 ? (elapsed - acc) / item.ms : 1;
        break;
      }
      acc += item.ms;
    }
    if (elapsed >= total) { phase = 'done'; progress = 1; }

    if (phase !== currentPhase) {
      if (phase === 'shake' && sfx) sfx.chest('click');
      if (phase === 'beam' && sfx) sfx.chest(fx.sound);
      if (phase === 'card') el('chestRarity').textContent = fx.stamp;
      if (phase === 'celebrate') {
        el('chestCard').hidden = false;
        if (sfx && pull.tier === 'legendary') sfx.chest('legend');
        if (navigator.vibrate) navigator.vibrate(fx.haptic);
      }
      currentPhase = phase;
    }
    if (chest) { chest.setPhase(phase, progress); chest.render(now); }
    if (phase === 'done') finish();
    else raf = requestAnimationFrame(frame);
  }

  el('chestSkip').addEventListener('click', close, { once: true });
  modal.addEventListener('click', e => { if (e.target === modal) close(); }, { once: true });
  raf = requestAnimationFrame(frame);

  active = { close };
  return active;
}
