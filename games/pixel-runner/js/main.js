/* Pixel Runner — arcade kit bootstrap, profile, stages and glass overlay */

import { STR, MODES, STAGES } from './config.js';
import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { loadProfile, saveProfile, loadPrefs, savePrefs, recordRun, recordChallenge, initialProfile } from './storage.js';
import { createArcade } from '../../_kit/arcade.js';
import { api } from './game.js';
import { ui } from './ui.js';
import * as glass from './glass.js';

const root = document.getElementById('app');
let profile = loadProfile();
let prefs = loadPrefs();
let deleteArmed = false;

initLang(detect());
document.body.dataset.theme = prefs.theme || 'dark';
document.body.classList.toggle('reduced', !!prefs.reducedMotion);

const arcade = createArcade({
  root, canvas:document.createElement('canvas'), str:STR,
  key:'pixelrunner.save.v1', modes:MODES, startLives:3, ...api
});
const game = arcade.game;

const seed = (() => {
  const day = new Date().toISOString().slice(0, 10);
  let h = 2166136261;
  for (let i = 0; i < day.length; i++) { h ^= day.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 100000;
})();
const target = 12000 + (seed % 9) * 2500;
let daily = null;
let lastStatus = game.status;

ui.buildOverlay(root);
glass.enable(root.querySelector('.topbar'), 18, 12);

function applyQuality(q) {
  const base = window.devicePixelRatio || 1;
  try {
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable:true, get:() => base * (q === 'low' ? 0.65 : 1)
    });
  } catch (e) {}
  arcade.view.resize();
}
applyQuality(prefs.quality || 'high');

function watchRun() {
  requestAnimationFrame(watchRun);
  if (game.status === lastStatus) return;
  lastStatus = game.status;
  if (game.status === 'gameover' || game.status === 'victory') {
    const d = game.data || {};
    const res = recordRun(profile, {
      mode:game.mode, difficulty:game.difficulty, score:game.score,
      bosses:d.bossesDefeated || 0, stage:d.stage || 0,
      won:game.status === 'victory'
    });
    profile = res.profile;
    if (daily) {
      profile = recordChallenge(profile, { seed, target, score:game.score, won:game.score >= target });
      daily = null;
      if (game.score >= target) ui.toast(t('win'));
    }
    saveProfile(profile);
    if (res.record) ui.toast(t('newRecord'));
    if (navigator.vibrate && prefs.vibration) navigator.vibrate(game.status === 'victory' ? [40, 40, 80] : 60);
  }
}

ui.initUI({
  profile:() => profile,
  prefs:() => prefs,
  seed:() => seed,
  target:() => target,
  stage: index => {
    if (index >= profile.stages) return;
    ui.closeModal('stagesModal');
    game.mode = 'classic';
    arcade.start();
    const d = game.data;
    d.stage = index;
    d.passed = 0;
    d.obstacles = [];
    d.boss = null;
    d.speed = STAGES[index].speed;
    ui.toast(`${t('stage')} ${index + 1} · ${STAGES[index].name}`);
  },
  daily: () => {
    daily = { seed, target };
    game.mode = 'classic';
    arcade.start();
    ui.toast(`${t('daily')} · ${target.toLocaleString('en-US')}`);
  },
  setPrefs: patch => {
    prefs = { ...prefs, ...patch };
    savePrefs(prefs);
    document.body.classList.toggle('reduced', !!prefs.reducedMotion);
    if (patch.quality) applyQuality(patch.quality);
  },
  lang: () => {
    const next = getLang() === 'en' ? 'it' : 'en';
    arcade.i18n.setLang(next);
    setLang(next);
  },
  theme: () => {
    prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = prefs.theme;
    savePrefs(prefs);
  },
  deleteSave: () => {
    if (!deleteArmed) {
      deleteArmed = true;
      const btn = document.getElementById('btnDeleteSave');
      btn.textContent = t('confirmReset');
      setTimeout(() => { deleteArmed = false; btn.textContent = t('reset'); }, 3500);
      return;
    }
    profile = initialProfile();
    saveProfile(profile);
    deleteArmed = false;
    document.getElementById('btnDeleteSave').textContent = t('reset');
    ui.toast(t('reset'));
  }
});

addEventListener('pagehide', () => saveProfile(profile));
requestAnimationFrame(watchRun);
