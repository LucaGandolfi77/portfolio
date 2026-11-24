/** ui.js — rendering e feedback visivo. */

import { t } from './i18n.js';

const $ = (id) => document.getElementById(id);
const CIRCUMFERENCE = 2 * Math.PI * 74;

export function setPill(id, text, kind = '') {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'glass-pill ' + kind;
}

let toastTimer = null;
export function toast(message) {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 2400);
}

export function renderScore(score, confidence, band, ambiguous) {
  const ring = $('scoreRing');
  if (ring) ring.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, score))));
  $('scoreValue').textContent = String(Math.round(score * 100));
  $('confidenceValue').textContent = Math.round(confidence * 100) + '%';
  $('confidenceText').textContent = ambiguous ? t('status.ambiguous') : t('status.smiling');
  const card = $('scoreCard');
  card.classList.toggle('is-high', band === 'high' && !ambiguous);
  card.classList.toggle('is-low', band === 'low' || ambiguous);
  $('app').classList.toggle('smiling', score > 0.7 && !ambiguous);
}

export function renderEmotions(labels, probabilities) {
  const holder = $('emotionBars');
  if (!holder) return;
  const pairs = labels.map((label, index) => ({ label, score: probabilities[index] || 0 }))
    .sort((a, b) => b.score - a.score).slice(0, 4);
  holder.innerHTML = pairs.map(({ label, score }) => {
    const key = label.toLowerCase();
    const name = t('emotion.' + key) !== 'emotion.' + key ? t('emotion.' + key) : label;
    return `<div class="emotion-row"><span>${name}</span><div class="emotion-track"><i style="width:${Math.round(score * 100)}%"></i></div><b>${Math.round(score * 100)}%</b></div>`;
  }).join('');
}

export function renderTeeth({ whiteness, alignment, active }) {
  $('whitenessValue').textContent = Math.round(whiteness * 100) + '%';
  $('alignmentValue').textContent = Math.round(alignment * 100) + '%';
  $('whitenessBar').style.width = Math.round(whiteness * 100) + '%';
  $('alignmentBar').style.width = Math.round(alignment * 100) + '%';
  $('teethHint').textContent = active ? t('section.teeth') : t('msg.teethWait');
}

export function renderBest(best) {
  $('bestValue').textContent = best ? best.score + '%' : '—';
}
