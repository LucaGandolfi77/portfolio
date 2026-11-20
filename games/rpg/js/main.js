/* RPG Adventure — bootstrap and DOM interface */

import { STR, DIFFICULTY, ZONES, ITEMS } from './config.js';
import { profile, save, questDone } from './state.js';
import { RPG } from './engine.js';
import { drawBattle } from './render.js';
import { makeLoop } from '../../_kit/core.js';
import { createI18n } from '../../_kit/i18n.js';
import * as AUDIO from '../../_kit/audio.js';
import { FX } from '../../_kit/fx.js';
import { registerSW, setupCanvas } from '../../_kit/pwa.js';

const i18n = createI18n(STR, 'en');
const t = i18n.t;
let view;
const fx = new FX();

let engine = new RPG(profile, {
  onLog: () => refresh(),
  onHit: info => {
    fx.hit(info.amount);
    fx.burst(info.target === 'enemy' ? view.w * 0.72 : view.w * 0.28, view.h * 0.55,
      info.heal ? '#5ef0a8' : info.target === 'enemy' ? '#ffd166' : '#ff6b9d', 12);
    AUDIO.sfx[info.heal ? 'coin' : info.target === 'enemy' ? 'good' : 'bad']();
  },
  onReward: () => AUDIO.sfx.coin(),
  onLevelUp: () => { AUDIO.sfx.win(); fx.blink(0.3, '#ffd166'); },
  onStatus: status => {
    save();
    if (status === 'gameover') AUDIO.sfx.lose();
    if (status === 'victory' || status === 'zoneclear') AUDIO.sfx.win();
    refresh();
  }
});

let time = 0;
const loop = makeLoop(dt => { time += dt; }, () => drawBattle(view, engine, fx, time));

const app = document.getElementById('app');
app.innerHTML = `
  <canvas id="game" style="position:fixed;inset:0;z-index:-1"></canvas>
  <div id="ui">
    <header>
      <div><b data-i18n="title">RPG ADVENTURE</b><small id="subtitle"></small></div>
      <div class="tools">
        <button id="btn-sound" class="chip">♪</button>
        <button id="btn-lang" class="chip">IT / EN</button>
      </div>
    </header>
    <div class="stats">
      <span>LV <b id="s-level">1</b></span>
      <span>HP <b id="s-hp">60</b></span>
      <span>ATK <b id="s-atk">8</b></span>
      <span>DEF <b id="s-def">2</b></span>
      <span>XP <b id="s-xp">0</b></span>
      <span>GOLD <b id="s-gold">0</b></span>
    </div>
    <div id="menu" class="panel">
      <h1 data-i18n="title">RPG ADVENTURE</h1>
      <p data-i18n="subtitle"></p>
      <div class="diff-row" id="diff-row"></div>
      <button class="big" id="btn-new" data-i18n="play">NEW GAME</button>
      <button id="btn-zones" data-i18n="zone">ZONE</button>
      <div id="quests"></div>
    </div>
    <div id="battle" class="panel hidden">
      <h2 id="zone-name"></h2>
      <div id="log" class="log"></div>
      <div class="actions">
        <button id="btn-atk" class="primary" data-i18n="attack">ATTACK</button>
        <button id="btn-guard" data-i18n="guard">GUARD</button>
        <button id="btn-flee" data-i18n="flee">FLEE</button>
        <button id="btn-potion" data-i18n="potion">POTION</button>
      </div>
    </div>
    <div id="result" class="panel hidden">
      <h2 id="result-title"></h2>
      <p id="result-text"></p>
      <button class="primary" id="btn-continue"></button>
      <button id="btn-back" data-i18n="menu">MENU</button>
    </div>
    <div id="shop" class="panel hidden">
      <h2 data-i18n="inventory">INVENTORY</h2>
      <div id="shop-list"></div>
      <button id="btn-shop-close" data-i18n="close">CLOSE</button>
    </div>
  </div>`;

const $ = id => document.getElementById(id);
view = setupCanvas($('game'));
loop.start();
function show(id) {
  ['menu', 'battle', 'result', 'shop'].forEach(x => $(x).classList.toggle('hidden', x !== id));
}
function renderDiff() {
  $('diff-row').innerHTML = Object.entries(DIFFICULTY).map(([key, d]) =>
    `<button class="${profile.difficulty === key ? 'on' : ''}" data-diff="${key}">${t(key)}</button>`).join('');
  $('diff-row').querySelectorAll('button').forEach(b => b.onclick = () => {
    profile.difficulty = b.dataset.diff; save(); renderDiff();
  });
}
function renderQuests() {
  const q = [
    profile.kills >= 3,
    profile.bosses >= 1,
    profile.level >= 3
  ];
  $('quests').innerHTML = `<h3>${t('quests')}</h3>` +
    STR.en.questList.map((label, i) => {
      const key = ['Defeat 3 slimes', 'Defeat a boss', 'Reach level 3'][i];
      const text = t('questList')[i] || key;
      return `<div class="quest ${q[i] || questDone(i) ? 'done' : ''}">${q[i] || questDone(i) ? '✓' : '○'} ${text}</div>`;
    }).join('');
}
function refresh() {
  $('s-level').textContent = engine.level;
  $('s-hp').textContent = `${engine.heroHp}/${engine.maxHp}`;
  $('s-atk').textContent = engine.atk;
  $('s-def').textContent = engine.def;
  $('s-xp').textContent = profile.xp;
  $('s-gold').textContent = profile.gold;
  $('zone-name').textContent = `${t('zone')} ${engine.zone + 1} · ${t('zoneNames')[engine.zone]}`;
  $('log').innerHTML = engine.log.slice(0, 8).map(x => `<div>${x}</div>`).join('');
  $('btn-potion').textContent = `${t('potion')} (${profile.inventory?.potion || 0})`;
  renderQuests();
}
function startGame(zone) {
  AUDIO.init(profile.sound); AUDIO.resume();
  engine.start(zone);
  show('battle'); refresh();
}
function showResult() {
  const status = engine.status;
  const titles = { gameover: t('lose'), zoneclear: t('win'), victory: t('allClear'), fled: t('fled') };
  $('result-title').textContent = titles[status] || t('win');
  $('result-text').textContent = `${t('gold')} ${profile.gold} · ${t('xp')} ${profile.xp}`;
  const btn = $('btn-continue');
  if (status === 'zoneclear') { btn.textContent = t('nextZone'); btn.onclick = () => startGame(engine.zone + 1); }
  else if (status === 'victory') { btn.textContent = t('menu'); btn.onclick = () => { engine.reset(); show('menu'); refresh(); }; }
  else { btn.textContent = t('retry'); btn.onclick = () => startGame(engine.zone); }
  show('result');
}
function openShop() {
  $('shop-list').innerHTML = Object.entries(ITEMS).map(([key, def]) => {
    const label = t('items')[key] || key;
    const owned = profile.inventory[key] || 0;
    return `<div class="shop-row"><b>${label}</b><span>${def.price} ${t('gold')}</span>
      <span>×${owned}</span><button data-buy="${key}">+</button></div>`;
  }).join('');
  $('shop-list').querySelectorAll('button').forEach(b => b.onclick = () => {
    if (engine.buy(b.dataset.buy)) { save(); AUDIO.sfx.coin(); openShop(); refresh(); }
  });
  show('shop');
}

$('btn-new').onclick = () => startGame(0);
$('btn-zones').onclick = () => {
  const list = ZONES.map((z, i) => `<button class="zone-btn ${i === 0 ? '' : ''}" data-zone="${i}">${i + 1}. ${t('zoneNames')[i]}</button>`).join('');
  $('quests').innerHTML = `<h3>${t('zone')}</h3>${list}`;
  $('quests').querySelectorAll('button').forEach(b => b.onclick = () => startGame(+b.dataset.zone));
};
$('btn-atk').onclick = () => { engine.playerAttack(); if (engine.status !== 'playing') showResult(); };
$('btn-guard').onclick = () => { engine.guard(); if (engine.status !== 'playing') showResult(); };
$('btn-flee').onclick = () => { engine.flee(); if (engine.status !== 'playing') showResult(); };
$('btn-potion').onclick = () => { engine.usePotion(); refresh(); };
$('btn-back').onclick = () => { engine.reset(); show('menu'); refresh(); };
$('btn-shop-close').onclick = () => show(engine.status === 'playing' ? 'battle' : 'menu');
$('btn-sound').onclick = () => { profile.sound = !profile.sound; save(); AUDIO.setSound(profile.sound); $('btn-sound').textContent = profile.sound ? '♪' : '✕'; };
$('btn-lang').onclick = () => i18n.setLang(i18n.getLang() === 'it' ? 'en' : 'it');

document.addEventListener('keydown', e => {
  if (engine.status !== 'playing') return;
  if (e.code === 'Space') { e.preventDefault(); engine.playerAttack(); }
  if (e.key.toLowerCase() === 'g') engine.guard();
  if (e.key.toLowerCase() === 'f') engine.flee();
  if (e.key.toLowerCase() === 'p') engine.usePotion();
  if (engine.status !== 'playing') showResult();
});
document.getElementById('game').onclick = openShop;

i18n.apply();
i18n.onChange(() => { i18n.apply(); renderDiff(); refresh(); $('btn-sound').textContent = profile.sound ? '♪' : '✕'; });
renderDiff();
renderQuests();
refresh();
$('btn-sound').textContent = profile.sound ? '♪' : '✕';
registerSW();
