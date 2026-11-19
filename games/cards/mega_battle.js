/* Card Collector — Mega Battle (lane arena), ES module version */

import { state, commit } from './state.js';
import { CARD_BY_ID } from './data.js';
import { addXP, addGold } from './economy.js';
import { toast, celebrate } from './effects.js';
import { showSection } from './ui.js';

let canvas, ctx, loopId = 0, lastTime = 0;
let entities = [], projectiles = [], towers = [];
let elixir = 5, enemyElixir = 5, hand = [], selected = -1, gameOver = false;

const W = 400;
const H = 400;
const RATE = 0.7;

export function initMegaBattle() {
  if (state.data.deck.length < 8) {
    toast('deckNeededMega', 'error');
    showSection('deck');
    return;
  }
  document.getElementById('megaBattleMenu').classList.add('is-hidden');
  document.getElementById('megaBattleGame').classList.remove('is-hidden');
  document.getElementById('mbGameOver').classList.add('is-hidden');

  canvas = document.getElementById('megaBattleCanvas');
  ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  const size = Math.min(window.innerWidth - 40, 460);
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';

  canvas.addEventListener('mousedown', handleInput);
  canvas.addEventListener('touchstart', handleInput, { passive: false });
  startGame();
}

export function closeMegaBattle() {
  cancelAnimationFrame(loopId);
  loopId = 0;
  document.getElementById('megaBattleMenu').classList.remove('is-hidden');
  document.getElementById('megaBattleGame').classList.add('is-hidden');
}

function makeTower(x, y, team, type, color) {
  const hp = type === 'KING' ? 3000 : 2000;
  return { x, y, team, type, hp, maxHp: hp, range: 150, attackSpeed: 1.1, cooldown: 0, color, dmg: type === 'KING' ? 90 : 70 };
}

function cardForBattle(id) {
  const card = CARD_BY_ID[Number(id)];
  if (!card) return null;
  const level = state.data.collection[id]?.level || 1;
  const scale = 1 + (level - 1) * 0.1;
  const data = {
    id: card.id, name: card.name, emoji: card.emoji,
    cost: Math.max(1, Math.min(9, Math.floor((card.attack + card.defense) / 5))),
    hp: card.defense * 20 * scale, dmg: card.attack * 5 * scale,
    speed: 1.5, range: 30, type: 'ground', count: 1, attackSpeed: 1.1, cooldown: 0
  };
  if (card.rarity === 'common') { data.count = 2; data.hp *= 0.6; }
  if (/Archer|Mage|Wisp/.test(card.name)) data.range = 120;
  if (/Dragon|Bird|Bat/.test(card.name)) { data.type = 'flying'; data.speed = 2; }
  if (/Giant|Golem/.test(card.name)) { data.speed = 0.8; data.hp *= 2; }
  data.maxHp = data.hp;
  return data;
}

function startGame() {
  entities = []; projectiles = []; towers = [];
  elixir = 5; enemyElixir = 5; gameOver = false; selected = -1;

  towers.push(
    makeTower(W / 2, H - 50, 0, 'KING', '#4aa8ff'),
    makeTower(60, H - 100, 0, 'PRINCESS', '#4aa8ff'),
    makeTower(W - 60, H - 100, 0, 'PRINCESS', '#4aa8ff'),
    makeTower(W / 2, 50, 1, 'KING', '#ff6b7d'),
    makeTower(60, 100, 1, 'PRINCESS', '#ff6b7d'),
    makeTower(W - 60, 100, 1, 'PRINCESS', '#ff6b7d')
  );

  const deck = [...state.data.deck].sort(() => Math.random() - 0.5);
  hand = deck.slice(0, 4).map(cardForBattle).filter(Boolean);
  renderHand();
  lastTime = performance.now();
  cancelAnimationFrame(loopId);
  loopId = requestAnimationFrame(loop);
}

function loop(now) {
  if (gameOver) return;
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  loopId = requestAnimationFrame(loop);
}

function update(dt) {
  elixir = Math.min(10, elixir + RATE * dt);
  enemyElixir = Math.min(10, enemyElixir + RATE * dt);
  document.getElementById('mbElixirFill').style.width = (elixir * 10) + '%';
  document.getElementById('mbElixirText').textContent = Math.floor(elixir);

  if (enemyElixir > 4 && Math.random() < 0.012) {
    const id = state.data.deck[Math.floor(Math.random() * state.data.deck.length)];
    const data = cardForBattle(id);
    if (data) { spawn(data, Math.random() * W, 150, 1); enemyElixir -= data.cost; }
  }

  [...towers, ...entities].forEach(e => {
    if (e.hp <= 0) return;
    e.cooldown -= dt;
    const target = findTarget(e, e.team === 0 ? 1 : 0);
    if (target) {
      if (e.cooldown <= 0) {
        projectiles.push({ x: e.x, y: e.y, target, speed: 260, dmg: e.dmg || 50, color: e.team === 0 ? '#4aa8ff' : '#ff6b7d' });
        e.cooldown = e.attackSpeed || 1;
      }
    } else if (e.speed) {
      const buildings = towers.filter(t => t.team !== e.team && t.hp > 0);
      let closest = null, min = Infinity;
      buildings.forEach(b => {
        const d = Math.hypot(b.x - e.x, b.y - e.y);
        if (d < min) { min = d; closest = b; }
      });
      if (closest) {
        const angle = Math.atan2(closest.y - e.y, closest.x - e.x);
        e.x += Math.cos(angle) * e.speed * 60 * dt;
        e.y += Math.sin(angle) * e.speed * 60 * dt;
      }
    }
  });

  projectiles.forEach(p => {
    const dx = p.target.x - p.x;
    const dy = p.target.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8) {
      p.target.hp -= p.dmg;
      p.active = false;
    } else {
      p.x += (dx / dist) * p.speed * dt;
      p.y += (dy / dist) * p.speed * dt;
    }
  });
  projectiles = projectiles.filter(p => p.active !== false && p.target.hp > 0);
  entities = entities.filter(e => e.hp > 0);
  towers.forEach(t => { if (t.hp < 0) t.hp = 0; });

  const king = team => towers.find(t => t.team === team && t.type === 'KING');
  if (king(0).hp <= 0) finish(false);
  else if (king(1).hp <= 0) finish(true);
}

function findTarget(source, team) {
  const options = [...towers, ...entities].filter(t => t.team === team && t.hp > 0);
  let closest = null, min = Infinity;
  options.forEach(t => {
    const d = Math.hypot(t.x - source.x, t.y - source.y);
    if (d < min) { min = d; closest = t; }
  });
  return closest && min <= source.range ? closest : null;
}

function spawn(data, x, y, team) {
  for (let i = 0; i < (data.count || 1); i++) {
    entities.push({ ...data, x: x + Math.random() * 18 - 9, y: y + Math.random() * 18 - 9, team, maxHp: data.hp });
  }
}

function draw() {
  ctx.fillStyle = '#2f6b3a';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,.05)';
  for (let x = 0; x < W; x += 40) ctx.fillRect(x, 0, 1, H);
  ctx.fillStyle = '#2f7fb5';
  ctx.fillRect(0, H / 2 - 10, W, 20);
  ctx.fillStyle = '#9aa7b8';
  ctx.fillRect(40, H / 2 - 13, 46, 26);
  ctx.fillRect(W - 86, H / 2 - 13, 46, 26);

  towers.forEach(t => {
    if (t.hp <= 0) return;
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.roundRect(t.x - 16, t.y - 16, 32, 32, 7);
    ctx.fill();
    hpBar(t.x, t.y - 26, 32, t.hp / t.maxHp);
  });
  entities.forEach(e => {
    ctx.font = '20px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(e.emoji, e.x, e.y);
    hpBar(e.x, e.y - 15, 20, e.hp / e.maxHp);
  });
  projectiles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function hpBar(x, y, w, ratio) {
  ctx.fillStyle = 'rgba(0,0,0,.6)';
  ctx.fillRect(x - w / 2, y, w, 4);
  ctx.fillStyle = '#5ef0a8';
  ctx.fillRect(x - w / 2, y, w * Math.max(0, ratio), 4);
}

function renderHand() {
  const box = document.getElementById('mbHand');
  box.innerHTML = '';
  hand.forEach((card, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'hand-card' + (selected === i ? ' selected' : '');
    el.innerHTML = `<span class="hand-cost">${card.cost}</span><span class="hand-emoji">${card.emoji}</span><span class="hand-name">${card.name}</span>`;
    el.disabled = elixir < card.cost;
    el.onclick = ev => { ev.stopPropagation(); if (elixir >= card.cost) { selected = i; renderHand(); } };
    box.appendChild(el);
  });
}

function handleInput(e) {
  if (selected < 0 || !hand[selected]) return;
  const rect = canvas.getBoundingClientRect();
  const point = e.touches?.[0] || e;
  const x = (point.clientX - rect.left) * (W / rect.width);
  const y = (point.clientY - rect.top) * (H / rect.height);
  if (y < H / 2) return;
  const card = hand[selected];
  if (elixir < card.cost) return;
  elixir -= card.cost;
  spawn(card, x, y, 0);
  const id = state.data.deck[Math.floor(Math.random() * state.data.deck.length)];
  hand[selected] = cardForBattle(id) || card;
  selected = -1;
  renderHand();
}

function finish(win) {
  gameOver = true;
  cancelAnimationFrame(loopId);
  document.getElementById('mbGameOver').classList.remove('is-hidden');
  const text = document.getElementById('mbResultText');
  text.textContent = win ? 'VICTORY!' : 'DEFEAT!';
  text.className = win ? 'win' : 'lose';
  if (win) {
    state.data.battlesWon++;
    addGold(500);
    addXP(100);
    celebrate();
  } else {
    addXP(20);
  }
  commit();
}
