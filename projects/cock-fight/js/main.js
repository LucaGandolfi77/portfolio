/* Cockpit Arena — bootstrap and orchestration */
import { STR, STATS, EQUIPMENT, BREEDS, CHAMPIONSHIP, CURRENCY } from './config.js';
import { detect, initLang, setLang, t, getLang } from './i18n.js';
import { profile, save, addMoney, logResult, resetProfile } from './storage.js';
import { makeOpponent, odds, power, settleBet, stepFight, newFightState,
  deterministicFight, train, levelInfo } from './engine.js';
import { seeded, dailySeed } from './rng.js';
import { Arena } from './render.js';
import * as AUDIO from './audio.js';
import { ui } from './ui.js';

const $ = id => document.getElementById(id);
const arena = new Arena($('arena'));
let sound = (() => { try { return localStorage.getItem('pf.cockpit.sound') !== '0'; } catch (e) { return true; } })();
let stake = 25;
let pending = null;
let current = null;
let phase = 0, phaseDir = 1;
let lastSim = null, simA = null, simB = null;
let time = 0;

function toast(msg) { ui.toast(msg); }

function newPending() {
  pending = { opponent: makeOpponent(profile.round), quote: odds(profile.rooster, { stats: makeOpponent(profile.round).stats }) };
  const foe = makeOpponent(profile.round, seeded(dailySeed() + profile.round));
  pending.opponent = foe;
  pending.quote = odds(profile.rooster, foe);
  ui.renderBetting();
}

function oddsText() {
  if (!pending) return '—';
  return `${profile.rooster.name}: ${pending.quote.oddsA}×  ·  ${pending.opponent.name}: ${pending.quote.oddsB}×`;
}

function startFight() {
  if (!pending) newPending();
  current = {
    opponent: pending.opponent, quote: pending.quote,
    state: newFightState(), bet: null, finished: false
  };
  $('fightLog').innerHTML = '';
  log(`⚔ ${profile.rooster.name} vs ${current.opponent.name}`);
  ui.setTab('arena');
  toast(t('fight') + '!');
}

function log(text, cls = '') {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  d.textContent = text;
  $('fightLog').prepend(d);
}

function judge() {
  const d = Math.abs(phase - 0.5);
  return d < 0.055 ? 'perfect' : d < 0.18 ? 'good' : 'miss';
}

function action(a) {
  if (!current || current.finished) startFight();
  if (current.finished) return;
  const quality = judge();
  const rng = Math.random;
  const step = stepFight(current.state, profile.rooster, current.opponent, a, quality, rng);
  const label = { attack: '⚔', defend: '🛡', wait: '⏳', special: '✨' }[a];
  const qLabel = quality === 'perfect' ? t('perfect') : quality === 'good' ? t('good') : t('miss');
  log(`R${step.round} ${label} ${qLabel} · ${step.dmgA} / ${step.dmgB}`,
    quality === 'perfect' ? 'perfect' : quality === 'miss' ? 'miss' : '');
  arena.float(arena.w * 0.6, arena.h * 0.45, '-' + step.dmgA, quality === 'perfect' ? '#ffd166' : '#ff6b9d');
  arena.float(arena.w * 0.3, arena.h * 0.45, '-' + step.dmgB, '#4de8ff');
  arena.hit(quality === 'perfect' ? 12 : 6);
  AUDIO.init(sound); AUDIO.resume();
  (quality === 'perfect' ? AUDIO.sfx.perfect : quality === 'miss' ? AUDIO.sfx.miss : AUDIO.sfx.hit)();
  if (step.done) finishFight(step.winner);
}

function finishFight(winner) {
  current.finished = true;
  const result = { winner, rounds: current.state.rounds || current.state.round,
    perfects: current.state.perfects, hpA: current.state.hpA, hpB: current.state.hpB };
  const won = winner === 'a';
  let net = 0;
  if (current.bet) {
    const settled = settleBet(current.bet, result, current.quote);
    net += settled.net;
    current.bet.settled = settled;
    log(`🎰 ${settled.won ? '+' : ''}${CURRENCY}${settled.net}`);
  }
  if (won) {
    const reward = current.opponent.reward || 100;
    net += reward;
    profile.wins++;
    const level = levelInfo(profile.rooster.xp);
    profile.rooster.xp += 40 + current.state.perfects * 5;
    const medal = result.rounds <= 4 ? 'gold' : result.rounds <= 7 ? 'silver' : 'bronze';
    profile.medals[profile.round] = medal;
    if (levelInfo(profile.rooster.xp) > level) toast(t('level') + ' ' + levelInfo(profile.rooster.xp));
    AUDIO.sfx.win();
  } else {
    profile.losses++;
    AUDIO.sfx.lose();
  }
  addMoney(net);
  logResult({ won, net, rounds: result.rounds, round: profile.round + 1 });
  if (won && profile.round < CHAMPIONSHIP.length - 1) profile.round++;
  if (won && profile.round >= CHAMPIONSHIP.length - 1) profile.champion = true;
  save();
  ui.renderAll();
  ui.modal(won ? t('victory') : t('defeat'),
    `<p>${profile.rooster.name} · ${result.rounds} ${t('rounds')} · PERFECT ${result.perfects}</p>
     <p><b>${net >= 0 ? '+' : ''}${CURRENCY}${net}</b></p>`,
    [{ label: t('ok'), primary: true, fn: () => { newPending(); startFight(); } }]);
}

function placeBet(type) {
  if (!pending) newPending();
  if (profile.wallet < stake) { toast(t('noMoney')); return; }
  if (!current || current.finished) startFight();
  if (current.bet) { toast(t('placeBet')); return; }
  addMoney(-stake);
  const bet = { type, stake, value: type === 'rounds' ? 5 : type === 'perfect' ? 2 : 1, odds: pending.quote };
  current.bet = bet;
  profile.bets.unshift({ label: `${type} · ${stake}`, stake, won: false, net: -stake, t: Date.now() });
  if (profile.bets.length > 60) profile.bets.length = 60;
  save();
  ui.renderBetting(); ui.wallet();
  toast(t('placeBet'));
}

function trainStat(stat) {
  const cost = 60 + (levelInfo(profile.rooster.xp) - 1) * 25;
  if (profile.wallet < cost) { toast(t('noMoney')); return; }
  if ((profile.rooster.stats[stat] || 0) >= 20) return;
  addMoney(-cost);
  profile.rooster = train(profile.rooster, stat, Math.random);
  save(); ui.renderAll(); toast(t('training') + ' ' + stat);
}

function equip(id) {
  const def = EQUIPMENT[id];
  if (!def) return;
  if (profile.rooster.equipment.includes(id)) { toast(t('alreadyOwned')); return; }
  if (profile.wallet < def.cost) { toast(t('noMoney')); return; }
  addMoney(-def.cost);
  profile.rooster.equipment.push(id);
  save(); ui.renderAll();
}

function simulate() {
  const a = simA, b = simB;
  if (!a || !b) return;
  const seed = dailySeed() + Math.floor(Math.random() * 100000);
  const result = deterministicFight(a, b, seed);
  lastSim = { result, a, b, seed, quote: odds(a, b) };
  ui.lastSim = lastSim;
  ui.simA = a; ui.simB = b;
  ui.renderSimulator();
  AUDIO.sfx.click();
}
function simBet() {
  if (!lastSim) simulate();
  if (!lastSim) return;
  if (profile.wallet < stake) { toast(t('noMoney')); return; }
  addMoney(-stake);
  const won = lastSim.result.winner === 'a';
  const oddsValue = won ? lastSim.quote.oddsA : lastSim.quote.oddsB;
  const payout = won ? Math.round(stake * oddsValue) : 0;
  const net = payout - stake;
  addMoney(payout);
  profile.bets.unshift({ label: `SIM · ${stake}`, stake, won, net, t: Date.now() });
  logResult({ won, net, rounds: lastSim.result.rounds, round: 0, sim: true });
  save(); ui.renderAll();
  toast(`${t('settled')} ${net >= 0 ? '+' : ''}${CURRENCY}${net}`);
}

function populateSim() {
  const options = BREEDS.map((b, i) => `<option value="${i}">${b.name[getLang()]}</option>`).join('');
  $('simASelect').innerHTML = options;
  $('simBSelect').innerHTML = options;
  $('simBSelect').selectedIndex = 1;
  $('simASelect').onchange = updateSim;
  $('simBSelect').onchange = updateSim;
  updateSim();
}
function updateSim() {
  const mk = i => {
    const b = BREEDS[+i] || BREEDS[0];
    return { name: b.name[getLang()], breed: b.id, stats: { ...b.stats },
      weights: [0.4, 0.25, 0.2, 0.15] };
  };
  simA = mk($('simASelect').value);
  simB = mk($('simBSelect').value);
  ui.simA = simA; ui.simB = simB;
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - (frame.last || now)) / 1000);
  frame.last = now;
  time += dt;
  phase += phaseDir * dt * 1.6;
  if (phase >= 1) { phase = 1; phaseDir = -1; }
  if (phase <= 0) { phase = 0; phaseDir = 1; }
  arena.draw({ time, a: { name: profile.rooster.name, breed: profile.rooster.breed },
    b: current?.opponent || pending?.opponent,
    hpA: current ? current.state.hpA : 100, hpB: current ? current.state.hpB : 100,
    fight: current, timing: ui.tab === 'arena' ? phase : null });
}

initLang(detect());
AUDIO.init(sound); AUDIO.resume();
ui.initUI({
  lang: () => setLang(getLang() === 'it' ? 'en' : 'it'),
  sound: () => { sound = !sound; AUDIO.setSound(sound); try { localStorage.setItem('pf.cockpit.sound', sound ? '1' : '0'); } catch (e) {} toast(t('sound') + ' ' + (sound ? 'ON' : 'OFF')); },
  reset: () => { resetProfile(); newPending(); ui.renderAll(); },
  action, nextRound: startFight, train: trainStat, equip,
  simulate, simBet, placeBet, oddsText,
  stake: v => {
    stake = v;
    document.querySelectorAll('[data-stake]').forEach(b => b.classList.toggle('on', +b.dataset.stake === v));
  },
  onTab: tab => { if (tab === 'betting') ui.renderBetting(); if (tab === 'simulator') ui.renderSimulator(); }
});
document.querySelectorAll('[data-stake]').forEach(b => b.classList.toggle('on', +b.dataset.stake === stake));
newPending();
populateSim();
ui.renderAll();
requestAnimationFrame(frame);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
