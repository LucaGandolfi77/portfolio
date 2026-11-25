/* Court Clash — 3D chest sequence followed by a multi-card reveal */

import { fxFor, phaseDurations } from '../data/chest-fx.js';
import { createChest } from '../render/chest.js';
import { miniAvatarUrl } from '../render/mini-avatar.js';

let active = null;
const el = id => document.getElementById(id);

function confetti(container, tier, reduced) {
  if (!container || reduced) return;
  const fx = fxFor(tier);
  if (!fx.confetti && tier !== 'legendary') return;
  container.innerHTML = '';
  const colors = ['#ffd166', '#4de8ff', '#a78bfa', '#ff7b9c', '#ffffff'];
  const count = tier === 'legendary' ? 90 : 40;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%';
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = (Math.random() * 0.25).toFixed(2) + 's';
    s.style.animationDuration = (0.9 + Math.random() * 0.8).toFixed(2) + 's';
    container.appendChild(s);
  }
}

function rewardCard(card, i18n) {
  const label = card.isNew
    ? i18n.t('cardNew')
    : (card.overflow ? `+${card.overflow} 🪙` : i18n.t('cardCopy'));
  return `<article class="reward-card rarity-${card.rarity}" style="--rarity:${card.rarityColor || '#4de8ff'};--i:${card.index || 0}">
    <span class="reward-flag ${card.isNew ? 'new' : ''}">${label}</span>
    <span class="reward-level">Lv${card.level || 1}</span>
    <img src="${miniAvatarUrl(card, { color: card.teamColor || '#4de8ff' }, 128)}" alt="${card.name}" loading="lazy">
    <b>${card.name}</b>
    <small>${card.teamCode || ''} · ${card.pos || ''}</small>
    <span class="reward-ovr">${card.ovr || 0}</span>
  </article>`;
}

export function openChestModal({ tier, cards, coins, xp = 0, sfx, i18n, onDone }) {
  const modal = el('chestModal');
  const canvas = el('chestCanvas');
  if (!modal || !canvas) return null;
  if (active) active.close();

  const fx = fxFor(tier);
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const reveal = el('chestReveal');
  const grid = el('chestCards');
  const skip = el('btnChestSkip');
  const continueBtn = el('btnChestContinue');

  modal.hidden = false;
  reveal.hidden = true;
  el('chestFx').innerHTML = '';
  el('chestRarity').textContent = '';
  el('chestRarity').style.color = fx.color;
  el('chestRevealKicker').textContent = `${i18n.t('chest' + tier.charAt(0).toUpperCase() + tier.slice(1))} · ${i18n.t('matchReward')}`;
  el('chestRevealTitle').textContent = i18n.t('chestRevealTitle');
  el('chestCoins').textContent = String(coins || 0);
  const xpEl = el('chestXp');
  if (xpEl) {
    xpEl.hidden = !xp;
    const xpAmount = el('chestXpAmount');
    if (xpAmount) xpAmount.textContent = String(xp || 0);
  }
  grid.innerHTML = (cards || []).map((card, i) => rewardCard({ ...card, index: i }, i18n)).join('');
  skip.hidden = false;
  skip.disabled = false;
  continueBtn.hidden = true;

  const chest = createChest(canvas);
  if (chest) {
    chest.setRarity(tier);
    const wrap = canvas.parentElement;
    chest.resize(wrap.clientWidth, wrap.clientHeight, Math.min(1.5, window.devicePixelRatio || 1));
    chest.setPhase('idle', 0);
  }

  let raf = 0;
  let closed = false;
  let revealed = false;
  const start = performance.now();
  const durations = phaseDurations(tier, reduced);
  const sequence = [
    ['shake', durations.shake || 0],
    ['open', durations.open || 0],
    ['beam', durations.beam || 0],
    ['card', durations.card || 0],
    ['celebrate', durations.celebrate || 0]
  ];
  const total = sequence.reduce((a, p) => a + p[1], 0);

  function finishReveal() {
    if (revealed) return;
    revealed = true;
    cancelAnimationFrame(raf);
    if (chest) chest.setPhase('done', 1);
    el('chestRarity').textContent = fx.stamp;
    reveal.hidden = false;
    skip.hidden = true;
    continueBtn.hidden = false;
    modal.classList.add('revealed');
    confetti(el('chestFx'), tier, reduced);
    if (sfx) sfx.chest(tier === 'legendary' ? 'legend' : tier === 'epic' ? 'epic' : 'rise');
    if (navigator.vibrate) navigator.vibrate(fx.haptic);
  }

  function frame(now) {
    if (closed) return;
    const elapsed = now - start;
    if (elapsed >= total) { finishReveal(); return; }
    let acc = 0;
    let phase = 'shake';
    let progress = 0;
    for (const [name, ms] of sequence) {
      if (elapsed <= acc + ms || ms <= 0) {
        phase = name;
        progress = ms > 0 ? (elapsed - acc) / ms : 1;
        break;
      }
      acc += ms;
    }
    if (chest) {
      chest.setPhase(phase, Math.max(0, Math.min(1, progress)));
      chest.render(now);
    }
    raf = requestAnimationFrame(frame);
  }

  function close() {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(raf);
    modal.hidden = true;
    modal.classList.remove('revealed');
    if (chest) chest.dispose();
    active = null;
    if (onDone) onDone();
  }

  skip.onclick = finishReveal;
  continueBtn.onclick = close;
  modal.onclick = event => { if (event.target === modal && !revealed) finishReveal(); };

  if (reduced) {
    setTimeout(finishReveal, 180);
  } else if (!chest) {
    setTimeout(finishReveal, 500);
  } else {
    raf = requestAnimationFrame(frame);
  }

  active = { close };
  return active;
}
