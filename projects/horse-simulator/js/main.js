/**
 * main.js — The Royal Derby: state machine, gara, replay e UI.
 */

import {
  createRace, stepRace, ranking, oddsOf, settleBet, applySeason,
  photoFinishMargin, recordSample, pickMeeting
} from './sim.js';
import { createTrack } from './track.js';
import { createFinishScene } from './finish3d.js';
import { createAudio } from './audio.js';
import { initLang, getLang, setLang, t, applyStatic, onLanguageChange } from './i18n.js';
import { loadProfile, saveProfile } from './storage.js';
import {
  renderMeeting, renderBoard, renderSlip, renderStable, renderResults,
  renderSeason, addLog, betTypeButtons
} from './ui.js';

const SILKS = ['#9e2b25', '#d4af37', '#2c3550', '#c8791a', '#2b6ea8', '#b8952b', '#6f4b8e', '#a6a8ae'];
const $ = (id) => document.getElementById(id);

let profile = loadProfile();
let race = null, bets = {}, stake = 50, betType = 'win', phase = 'idle';
let lastT = 0, samples = [], forecastFirst = null, selectedId = null, countdownTimer = null;
let lastHoof = 0, resultData = null;

const track = createTrack($('trackCanvas'));
const finish = createFinishScene($('finishCanvas'), {
  onEnd: () => { $('replayPlay').textContent = '▶'; }
});
const audio = createAudio();

function persist() { profile = saveProfile(profile); }
function wallet() { $('walletAmt').textContent = '€' + Math.round(profile.wallet); }

function log(text, kind) {
  addLog($('feed'), text, kind);
}

function renderAll() {
  wallet();
  if (race) renderBoard(race, bets, betType, t, backHorse);
  renderSlip(bets, race ? race.horses : [], t, removeBet);
  renderStable(race ? race.horses : [], profile, t, renameHorse, recolorHorse, SILKS);
  renderSeason(profile.standings, t);
  renderMeeting(race, t);
}

function prepareMeeting(announce = true) {
  const meeting = pickMeeting(Math.random);
  race = createRace({
    ...meeting,
    names: profile.names, colors: profile.colors, jockeys: profile.jockeys,
    rng: Math.random
  });
  bets = {};
  forecastFirst = null;
  phase = 'idle';
  samples = [];
  resultData = null;
  $('resultModal').classList.remove('on');
  $('finishPanel').classList.remove('on');
  finish.hide();
  $('banner').classList.remove('on');
  $('countdown').classList.remove('on');
  $('feed').innerHTML = '';
  if (announce) {
    log(t('header.meeting') + ': ' + race.course.name + ' · ' + t('weather.' + race.weather.id) + ' · ' + t('ground.' + race.ground.id), 'info');
  }
  renderAll();
  track.draw({ race, bets, timer: 0, selectedId }, performance.now());
}

function backHorse(id) {
  if (phase !== 'idle') return;
  if (betType === 'forecast') {
    if (!forecastFirst || forecastFirst === id) {
      forecastFirst = id;
      const horse = race.horses.find((h) => h.id === id);
      log(t('bet.forecast') + ': ' + horse.name + ' → scegli il secondo.', 'gold');
      renderAll();
      return;
    }
    const first = race.horses.find((h) => h.id === forecastFirst);
    const price = oddsOf(race.horses, first) * oddsOf(race.horses, race.horses.find((h) => h.id === id));
    placeBet(id, price, 'forecast', forecastFirst);
    forecastFirst = null;
    return;
  }
  const horse = race.horses.find((h) => h.id === id);
  placeBet(id, oddsOf(race.horses, horse), betType);
}

function placeBet(id, odds, type, forecastId) {
  if (profile.wallet < stake) {
    log(t('bet.noFunds'), 'imp');
    audio.error();
    return;
  }
  if (bets[id]) {
    profile.wallet += bets[id].stake;
    delete bets[id];
  }
  profile.wallet -= stake;
  bets[id] = { stake, odds: +odds.toFixed(1), type, forecastId };
  persist();
  log(t('bet.placed') + ': ' + race.horses.find((h) => h.id === id).name + ' · €' + stake, 'gold');
  audio.bell();
  renderAll();
}

function removeBet(id) {
  if (phase !== 'idle' || !bets[id]) return;
  profile.wallet += bets[id].stake;
  delete bets[id];
  persist();
  renderAll();
}

function clearBets() {
  if (phase !== 'idle') return;
  Object.values(bets).forEach((bet) => { profile.wallet += bet.stake; });
  bets = {};
  persist();
  renderAll();
}

function renameHorse(id, name) {
  if (!name) return;
  const horse = race.horses.find((h) => h.id === id);
  horse.name = name;
  profile.names[id] = name;
  persist();
  renderAll();
}

function recolorHorse(id, color) {
  const horse = race.horses.find((h) => h.id === id);
  horse.color = color;
  profile.colors[id] = color;
  persist();
  renderAll();
  track.draw({ race, bets, timer: race.timer, selectedId }, performance.now());
}

function countdown() {
  if (phase !== 'idle') return;
  phase = 'countdown';
  $('startBtn').disabled = true;
  let count = 3;
  const el = $('countdown');
  el.classList.add('on');
  el.textContent = count;
  audio.bell();
  countdownTimer = setInterval(() => {
    count -= 1;
    if (count > 0) { el.textContent = count; audio.bell(); return; }
    clearInterval(countdownTimer);
    el.textContent = t('race.go');
    audio.go();
    setTimeout(() => el.classList.remove('on'), 650);
    beginRace();
  }, 850);
}

function beginRace() {
  phase = 'racing';
  race.timer = 0;
  lastT = 0;
  samples = [];
  log(t('comment.off'), 'imp');
  requestAnimationFrame(loop);
}

function loop(now) {
  if (phase !== 'racing') return;
  if (!lastT) lastT = now;
  const dt = Math.min((now - lastT) / 1000, 0.05);
  lastT = now;
  const events = stepRace(race, dt);

  for (const event of events) {
    if (event.event === 'lap') log('🔁 ' + event.horse.name + ' ' + t('comment.lap') + ' ' + event.horse.splitTimes.at(-1).time + 's', 'gold');
    if (event.event === 'place') {
      if (event.place <= 3) log('🏆 ' + event.horse.name + ' — ' + event.place + '°', 'imp');
      audio.flash();
    }
  }
  if (!race._homeShown && ranking(race)[0].progress > 0.78) {
    race._homeShown = true;
    $('banner').classList.add('on');
    log(t('comment.home'), 'imp');
    setTimeout(() => $('banner').classList.remove('on'), 4200);
    audio.cheer(0.6);
  }
  if (now - lastHoof > 260) {
    lastHoof = now;
    audio.hoof(Math.min(1, race.horses[0].progress));
  }

  samples.push(recordSample(race));
  if (samples.length > 150) samples.shift();

  renderBoard(race, bets, betType, t, backHorse);
  track.draw({ race, bets, timer: race.timer, selectedId }, now);
  if (race.running) requestAnimationFrame(loop);
  else finishRace();
}

function finishRace() {
  phase = 'finish';
  const ranked = ranking(race);
  const winner = ranked[0];
  const margin = photoFinishMargin(race);
  const settlements = Object.entries(bets).map(([id, bet]) => {
    const result = settleBet({ ...bet, horseId: id }, ranked);
    const horse = race.horses.find((h) => h.id === id);
    return { id, name: horse ? horse.name : id, ...result };
  });
  const net = settlements.reduce((sum, s) => sum + s.gain, 0);
  profile.wallet = Math.max(0, profile.wallet + net);
  profile.standings = applySeason(profile.standings, ranked, race);
  ranked.forEach((horse, index) => {
    const career = profile.career[horse.id] || { races: 0, wins: 0, places: 0, best: null, earned: 0 };
    career.races += 1;
    if (index === 0) career.wins += 1;
    if (index < 3) career.places += 1;
    if (career.best === null || Number(horse.finishTime) < Number(career.best)) career.best = horse.finishTime;
    profile.career[horse.id] = career;
  });
  resultData = { ranked, settlements, net, margin, winner };
  persist();
  wallet();
  renderAll();
  audio.cheer(1.2);
  log(margin !== null && margin < 0.15 ? t('comment.photo') : t('race.winner') + ' ' + winner.name, 'gold');

  $('resTitle').textContent = t('result.title');
  $('resWinner').textContent = '🏆 ' + winner.name + ' ' + t('race.winner');
  $('resTime').textContent = t('result.time') + ': ' + winner.finishTime + 's';
  $('resVerdict').textContent = t('result.stewards') + (margin !== null ? ' · ' + t('result.margin') + ' ' + margin.toFixed(3) + 's' : '');
  renderResults(race, settlements, net, margin, t);
  $('resultModal').classList.add('on');
  $('startBtn').disabled = false;
}

function openReplay() {
  if (!samples.length) return;
  $('resultModal').classList.remove('on');
  $('finishPanel').classList.add('on');
  finish.setSamples(samples, race);
  finish.show();
  finish.setSpeed(Number($('replaySpeed').value));
  finish.setAngle($('replayAngle').value);
  $('replayPlay').textContent = '❚❚';
  requestAnimationFrame(replayLoop);
}
let replayRaf = 0;
function replayLoop(now) {
  if (!$('finishPanel').classList.contains('on')) return;
  finish.render(now, 1 / 60);
  $('replayProgress').value = String(Math.round(finish.progress() * 100));
  replayRaf = requestAnimationFrame(replayLoop);
}
function closeReplay() {
  $('finishPanel').classList.remove('on');
  finish.hide();
  cancelAnimationFrame(replayRaf);
  $('resultModal').classList.add('on');
}

function exportResult() {
  if (!resultData) return;
  const canvas = document.createElement('canvas');
  canvas.width = 1200; canvas.height = 760;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 760);
  gradient.addColorStop(0, '#0e1c33'); gradient.addColorStop(1, '#14382b');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1200, 760);
  ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, 1152, 712);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d4af37'; ctx.font = '700 22px Georgia, serif';
  ctx.fillText('♛  THE ROYAL DERBY  ♛', 600, 82);
  ctx.fillStyle = '#f6efdd'; ctx.font = '800 52px Georgia, serif';
  ctx.fillText(resultData.winner.name, 600, 170);
  ctx.fillStyle = '#d4af37'; ctx.font = '24px Georgia, serif';
  ctx.fillText(t('result.title') + ' · ' + race.course.name, 600, 214);
  ctx.font = '20px Georgia, serif';
  ctx.fillText(t('result.time') + ': ' + resultData.winner.finishTime + 's', 600, 260);
  if (resultData.margin !== null) ctx.fillText(t('result.margin') + ': ' + resultData.margin.toFixed(3) + 's', 600, 294);
  try { ctx.drawImage($('finishCanvas'), 150, 320, 900, 300); } catch (e) {}
  ctx.fillStyle = '#f6efdd'; ctx.font = '700 26px Georgia, serif';
  ctx.fillText((resultData.net >= 0 ? '+' : '−') + '€' + Math.abs(Math.round(resultData.net)), 600, 690);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'royal-derby-' + Date.now() + '.png';
  link.click();
}

function refreshTexts() {
  applyStatic(document);
  if (race) {
    renderMeeting(race, t);
    renderBoard(race, bets, betType, t, backHorse);
    renderSlip(bets, race.horses, t, removeBet);
    renderStable(race.horses, profile, t, renameHorse, recolorHorse, SILKS);
    renderSeason(profile.standings, t);
  }
  $('betTypes').innerHTML = betTypeButtons(t);
  bindBetTypes();
  $('startBtn').textContent = '🏇 ' + t('race.start');
  $('resetBtn').textContent = '🔄 ' + t('race.reset');
  $('clearBetsBtn').textContent = '🧹 ' + t('bet.clear');
  $('langToggle').textContent = getLang() === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  $('soundToggle').textContent = audio.enabled ? '🔊' : '🔇';
  $('betHint').textContent = t('bet.hint');
}

function bindBetTypes() {
  document.querySelectorAll('.bet-type').forEach((button) => button.addEventListener('click', () => {
    betType = button.dataset.type;
    document.querySelectorAll('.bet-type').forEach((b) => b.classList.toggle('on', b === button));
    renderAll();
  }));
}

function init() {
  initLang();
  applyStatic(document);
  $('betTypes').innerHTML = betTypeButtons(t);
  bindBetTypes();
  document.querySelectorAll('.stake').forEach((button) => button.addEventListener('click', () => {
    stake = Number(button.dataset.v) || 50;
    document.querySelectorAll('.stake').forEach((b) => b.classList.toggle('on', b === button));
  }));
  document.querySelectorAll('.tab').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('on'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('on'));
    button.classList.add('on');
    $('tab-' + button.dataset.tab).classList.add('on');
  }));
  $('startBtn').addEventListener('click', countdown);
  $('resetBtn').addEventListener('click', () => prepareMeeting());
  $('clearBetsBtn').addEventListener('click', clearBets);
  $('againBtn').addEventListener('click', () => prepareMeeting());
  $('replayBtn').addEventListener('click', openReplay);
  $('replayClose').addEventListener('click', closeReplay);
  $('replayPlay').addEventListener('click', () => {
    const playing = $('replayPlay').textContent === '❚❚';
    if (playing) { finish.pause(); $('replayPlay').textContent = '▶'; }
    else { finish.play(); $('replayPlay').textContent = '❚❚'; }
  });
  $('replaySpeed').addEventListener('change', (e) => finish.setSpeed(e.target.value));
  $('replayAngle').addEventListener('change', (e) => finish.setAngle(e.target.value));
  $('replayProgress').addEventListener('input', (e) => finish.seek(Number(e.target.value) / 100));
  $('exportBtn').addEventListener('click', exportResult);
  $('langToggle').addEventListener('click', () => setLang(getLang() === 'it' ? 'en' : 'it'));
  $('soundToggle').addEventListener('click', () => {
    audio.setEnabled(!audio.enabled);
    profile.sound = audio.enabled;
    persist();
    $('soundToggle').textContent = audio.enabled ? '🔊' : '🔇';
  });
  document.addEventListener('pointerdown', () => audio.unlock(), { once: true });
  window.addEventListener('resize', () => { track.resize(); finish.resize(); });
  onLanguageChange(refreshTexts);
  audio.setEnabled(profile.sound !== false);

  prepareMeeting(false);
  refreshTexts();

  window.__DERBY__ = {
    get race() { return race; },
    get bets() { return bets; },
    get profile() { return profile; },
    get phase() { return phase; },
    step: (dt) => stepRace(race, dt),
    start: beginRace,
    reset: () => prepareMeeting(false),
    toggleBet: backHorse,
    runFull(cb) {
      prepareMeeting(false);
      beginRace();
      let guard = 0;
      const timer = setInterval(() => {
        if (phase === 'finish' || guard++ > 8000) { clearInterval(timer); cb && cb(); }
      }, 10);
    }
  };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
