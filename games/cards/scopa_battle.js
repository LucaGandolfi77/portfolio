/* Card Collector — Scopa-style card battle, ES module version */

import { state, commit } from './state.js';
import { CARDS } from './data.js';
import { addXP, addGold } from './economy.js';
import { toast, celebrate, floatText } from './effects.js';

let playerDeck = [], enemyDeck = [], table = [], playerHand = [], enemyHand = [];
let playerHp = 100, enemyHp = 100, turn = 'player', lastCapturer = null;
let cachedStart = null;
let busy = false;

const byId = id => CARDS.find(c => c.id === Number(id));

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function initScopaBattle() {
  let deck = state.data.scopaDeck.length
    ? state.data.scopaDeck.map(id => byId(id)).filter(Boolean).map(card => ({ ...card, level: state.data.collection[card.id]?.level || 1 }))
    : Object.keys(state.data.collection).map(id => byId(id)).filter(Boolean).map(card => ({ ...card, level: state.data.collection[card.id]?.level || 1 }));

  while (deck.length < 12) {
    const random = CARDS[Math.floor(Math.random() * CARDS.length)];
    deck.push({ ...random, level: 1 });
  }
  deck = deck.slice(0, 12);

  const enemy = Array.from({ length: 12 }, () => ({ ...CARDS[Math.floor(Math.random() * CARDS.length)], level: 1 }));
  const process = d => d.map((card, i) => ({
    ...card,
    scopaValue: card.scopaValue || (i % 10) + 1,
    scopaSuit: card.element || ['Fire', 'Water', 'Earth', 'Air'][Math.floor(Math.random() * 4)],
    uid: Math.random().toString(36).slice(2, 9)
  }));

  playerDeck = shuffle(process(deck));
  enemyDeck = shuffle(process(enemy));
  table = []; playerHand = []; enemyHand = [];
  playerHp = 100; enemyHp = 100; turn = 'player'; lastCapturer = null; busy = false;

  deal(true);
  for (let i = 0; i < 2; i++) {
    if (playerDeck.length) table.push(playerDeck.pop());
    if (enemyDeck.length) table.push(enemyDeck.pop());
  }
  document.getElementById('scopaStartScreen').style.display = 'none';
  render();
  message('yourTurn');
}

function deal() {
  while (playerHand.length < 3 && playerDeck.length) playerHand.push(playerDeck.pop());
  while (enemyHand.length < 3 && enemyDeck.length) enemyHand.push(enemyDeck.pop());
}

function render() {
  const bar = id => document.getElementById(id);
  bar('playerHpBar').style.width = playerHp + '%';
  bar('playerHpText').textContent = `${playerHp}/100`;
  bar('enemyHpBar').style.width = enemyHp + '%';
  bar('enemyHpText').textContent = `${enemyHp}/100`;

  const start = document.getElementById('scopaStartScreen') || cachedStart;
  if (start) cachedStart = start;
  const tableEl = bar('scopaTable');
  tableEl.innerHTML = '';
  if (start && start.style.display !== 'none') { tableEl.appendChild(start); return; }

  table.forEach(card => tableEl.appendChild(cardEl(card)));
  const handEl = bar('playerHand');
  handEl.innerHTML = '';
  playerHand.forEach((card, i) => {
    const el = cardEl(card);
    el.onclick = () => play('player', i);
    handEl.appendChild(el);
  });
  const enemyEl = bar('enemyHand');
  enemyEl.innerHTML = '';
  enemyHand.forEach(() => {
    const el = document.createElement('div');
    el.className = 'scopa-card back';
    enemyEl.appendChild(el);
  });
}

function cardEl(card) {
  const el = document.createElement('div');
  el.className = `scopa-card ${card.rarity}`;
  el.innerHTML = `<div class="scopa-card-val">${card.scopaValue === 1 ? 'A' : card.scopaValue}</div>
    <div class="scopa-card-suit">${card.emoji}</div>
    <div class="scopa-card-str">${card.attack}</div>`;
  return el;
}

function message(text) { document.getElementById('scopaMessage').textContent = text; }

function play(who, index) {
  if (busy) return;
  if (who === 'player' && turn !== 'player') return;
  const hand = who === 'player' ? playerHand : enemyHand;
  const card = hand.splice(index, 1)[0];
  if (!card) return;

  const capture = checkCapture(card, table);
  let extra = false;
  if (capture) {
    table = table.filter(c => !capture.captured.includes(c));
    lastCapturer = who;
    let dmg = Math.floor(card.attack / 5) + (card.level || 1) * 2;
    const power = special(card, who, dmg);
    dmg = power.damage;
    extra = power.extra;
    if (!table.length) {
      const bonus = capture.type === 'ace_sweep' ? 20 : 10;
      dmg += bonus;
      popup(who === 'player' ? 'enemy' : 'player', bonus, capture.type === 'ace_sweep' ? 'ACE POWER!' : 'SCOPA!');
    }
    damage(who === 'player' ? 'enemy' : 'player', dmg);
    message(who === 'player' ? 'youCaptured' : 'enemyCaptured');
  } else {
    table.push(card);
    message(who === 'player' ? 'youPlayed' : 'enemyPlayed');
  }
  render();
  if (playerHp <= 0 || enemyHp <= 0) { finish(); return; }

  if (!playerHand.length && !enemyHand.length) {
    if (playerDeck.length || enemyDeck.length) { deal(); render(); }
    else { table = []; render(); finish(); return; }
  }
  if (!extra) {
    if (who === 'player') { turn = 'enemy'; busy = true; setTimeout(enemyTurn, 900); }
    else turn = 'player';
  } else if (who === 'enemy') { busy = true; setTimeout(enemyTurn, 900); }
}

function checkCapture(card, cards) {
  if (card.scopaValue === 1 && !cards.some(c => c.scopaValue === 1) && cards.length) {
    return { captured: [...cards], type: 'ace_sweep' };
  }
  const direct = cards.find(c => c.scopaValue === card.scopaValue);
  if (direct) return { captured: [direct], type: 'match' };
  const sum = findSum(card.scopaValue, cards);
  return sum ? { captured: sum, type: 'sum' } : null;
}

function findSum(target, cards) {
  for (let i = 0; i < cards.length; i++)
    for (let j = i + 1; j < cards.length; j++)
      if (cards[i].scopaValue + cards[j].scopaValue === target) return [cards[i], cards[j]];
  for (let i = 0; i < cards.length; i++)
    for (let j = i + 1; j < cards.length; j++)
      for (let k = j + 1; k < cards.length; k++)
        if (cards[i].scopaValue + cards[j].scopaValue + cards[k].scopaValue === target) return [cards[i], cards[j], cards[k]];
  return null;
}

function enemyTurn() {
  busy = false;
  if (turn !== 'enemy') return;
  let index = enemyHand.findIndex(card => checkCapture(card, table));
  if (index < 0) index = Math.floor(Math.random() * enemyHand.length);
  play('enemy', index);
}

function damage(target, amount) {
  if (target === 'player') playerHp = Math.max(0, playerHp - amount);
  else enemyHp = Math.max(0, enemyHp - amount);
  popup(target, amount);
}

function popup(target, amount, text = null, color = null) {
  const el = document.createElement('div');
  el.className = 'damage-popup';
  el.textContent = text || `-${amount}`;
  if (color) el.style.color = color;
  const rect = document.getElementById(target === 'player' ? 'playerHpBar' : 'enemyHpBar').getBoundingClientRect();
  el.style.left = (rect.left + rect.width / 2) + 'px';
  el.style.top = rect.top + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function heal(target, amount) {
  if (target === 'player') playerHp = Math.min(100, playerHp + amount);
  else enemyHp = Math.min(100, enemyHp + amount);
  popup(target, amount, 'HEAL', 'green');
}

function special(card, who, current) {
  let dmg = current, extra = false;
  const target = who === 'player' ? 'enemy' : 'player';
  const hit = (n, label) => { dmg += n; popup(target, n, label); };
  switch (card.specialPower) {
    case 'Bomb': hit(10, 'BOMB!'); break;
    case 'Water Strike': hit(12, 'SPLASH!'); break;
    case 'Thief': hit(5, 'STOLEN!'); heal(who, 5); break;
    case 'Ice Wizard': case 'Freeze': hit(8, 'FROZEN!'); break;
    case 'Stealth': hit(10, 'SNEAK!'); break;
    case 'Witch': hit(7, 'CURSE!'); break;
    case 'Fire Breath': hit(15, 'BURN!'); break;
    case 'Heal Aura': case 'Warmth': heal(who, 15); break;
    case 'Dark Pact': hit(20, 'DARKNESS!'); damage(who, 5); break;
    case 'Shield': heal(who, 10); dmg += 5; break;
    case 'Giant': heal(who, 10); break;
    case 'Cataclysm': hit(30, 'CATACLYSM!'); damage(who, 5); break;
    case 'Thunderstrike': hit(25, 'THUNDER!'); break;
    case "Nature's Wrath": hit(15, 'WRATH!'); heal(who, 15); break;
    case 'Black Hole': hit(35, 'VOID!'); break;
    case 'Time Stop': hit(15, 'TIME STOP!'); extra = true; break;
    case 'Quantum State':
      if (Math.random() > 0.5) hit(25, 'ALIVE!'); else heal(who, 25);
      break;
    case 'Erase History': case 'The Delete Button': hit(50, 'DELETED!'); break;
    case 'Gift Rain': hit(20, 'GIFTS!'); heal(who, 10); break;
    case 'Cookies': heal(who, 30); break;
    case 'Slip': hit(5, 'OOPS!'); break;
    case 'Critical Pain': hit(25, 'OUCH!'); break;
    case 'Panic at the Disco': hit(Math.floor(Math.random() * 15) + 5, 'DISCO!'); break;
    case 'Gas Cloud': hit(18, 'STINKY!'); break;
    case 'Randomize': hit(Math.floor(Math.random() * 30) + 1, 'GLITCH!'); break;
    case 'Disconnect': hit(15, '404!'); break;
    case 'Scream': hit(15, 'KAREN!'); break;
    case 'Steal Gift': hit(10, 'YOINK!'); heal(who, 10); break;
    case 'Bag Kidnap': hit(20, 'BAGGED!'); break;
    case 'Squeak': hit(1, 'SQUEAK!'); break;
    case 'Snap': hit(12, 'SNAP!'); break;
    case 'Flash': hit(10, 'FLASH!'); break;
    case 'Craft': case 'Evasion': heal(who, 5); break;
  }
  return { damage: dmg, extra };
}

function finish() {
  const win = playerHp > enemyHp;
  if (win) {
    state.data.battlesWon++;
    addGold(100);
    addXP(50);
    celebrate();
    toast('battleWon');
  } else toast('battleLost');
  commit();
  message(win ? 'victory' : 'defeat');
  setTimeout(() => {
    const tableEl = document.getElementById('scopaTable');
    tableEl.innerHTML = '';
    const start = cachedStart || document.getElementById('scopaStartScreen');
    if (start) { start.style.display = 'block'; tableEl.appendChild(start); }
  }, 2600);
}
