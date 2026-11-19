/* Card Collector — fortune wheel where the prize matches the landing segment */

import { WHEEL_SEGMENTS, CARDS } from './data.js';
import { state, commit, addCard } from './state.js';
import { spend, addXP, progressQuest } from './economy.js';
import { toast, celebrate } from './effects.js';

let rotation = 0;
let spinning = false;
let raf = 0;

function segments() {
  const total = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
  let angle = -Math.PI / 2;
  return WHEEL_SEGMENTS.map(s => {
    const arc = (s.weight / total) * Math.PI * 2;
    const segment = { ...s, start: angle, end: angle + arc, center: angle + arc / 2 };
    angle += arc;
    return segment;
  });
}

function weightedIndex() {
  const total = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    roll -= WHEEL_SEGMENTS[i].weight;
    if (roll <= 0) return i;
  }
  return WHEEL_SEGMENTS.length - 1;
}

export function drawWheel(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 8;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  segments().forEach(seg => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, seg.start, seg.end);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(10,14,26,.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.rotate(seg.center);
    ctx.translate(radius * 0.62, 0);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = 'rgba(8,10,20,.88)';
    ctx.font = `600 ${Math.max(9, size / 26)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(seg.label, 0, 0);
    ctx.restore();
  });
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, size / 14, 0, Math.PI * 2);
  ctx.fillStyle = '#0d1222';
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function applyPrize(seg) {
  const result = { label: seg.label, type: seg.type };
  if (seg.type === 'gold') {
    state.data.gold = Math.min(99999, state.data.gold + seg.amount);
    result.amount = seg.amount;
  } else if (seg.type === 'gems') {
    state.data.gems = Math.min(99999, state.data.gems + seg.amount);
    result.amount = seg.amount;
  } else if (seg.type === 'xp') {
    addXP(seg.amount, true);
    result.amount = seg.amount;
  } else if (seg.type === 'card') {
    const card = pickByRarity(seg.rarity);
    if (card) { addCard(card.id); result.card = card; }
  }
  return result;
}

function pickByRarity(rarity) {
  const pool = CARDS.filter(c => c.rarity === rarity);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

export function spin(count = 1, canvas = null, onDone = () => {}) {
  if (spinning) return;
  const cost = 500 * count;
  if (!spend('gold', cost)) return;

  const picks = Array.from({ length: count }, weightedIndex);
  const finish = () => {
    spinning = false;
    const results = picks.map(i => applyPrize(WHEEL_SEGMENTS[i]));
    commit();
    const cardsWon = results.filter(r => r.card).length;
    if (cardsWon) progressQuest('cards', cardsWon);
    if (results.some(r => r.type === 'card' && r.card?.rarity === 'legendary')) celebrate();
    onDone(results);
  };

  if (count > 1 || !canvas) { finish(); return; }

  spinning = true;
  const targetIndex = picks[0];
  const seg = segments()[targetIndex];
  const targetBase = -Math.PI / 2 - seg.center;
  const start = rotation;
  const fullTurns = 5;
  let target = targetBase;
  while (target < start + fullTurns * Math.PI * 2) target += Math.PI * 2;

  const duration = 2400;
  const t0 = performance.now();
  const animate = now => {
    const t = Math.min(1, (now - t0) / duration);
    const ease = 1 - Math.pow(1 - t, 4);
    rotation = start + (target - start) * ease;
    drawWheel(canvas);
    if (t < 1) raf = requestAnimationFrame(animate);
    else finish();
  };
  raf = requestAnimationFrame(animate);
}

export function stopWheel() { cancelAnimationFrame(raf); spinning = false; }
