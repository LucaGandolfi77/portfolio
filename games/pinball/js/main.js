/* Pinball — bootstrap, profile, challenge mode and glass UI glue */

import { STR, TABLES } from './config.js';
import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { loadProfile, saveProfile, loadPrefs, savePrefs, recordScore, recordChallenge, initialProfile } from './storage.js';
import { challengeSeed, seededRandom, formatScore } from './engine/scoring.js';
import { bootPinball } from './engine/core.js';
import { ui } from './ui.js';
import * as glass from './glass.js';

let profile = loadProfile();
let prefs = loadPrefs();
let deleteArmed = false;
let lastTable = profile.table;
let runRecorded = false;
let challenge = null;

const seed = challengeSeed();
const rand = seededRandom(seed);
const target = 40000 + Math.floor(rand() * 40000);

initLang(detect());
document.body.dataset.theme = prefs.theme || 'dark';
window.__pinQuality = prefs.quality || 'high';
document.body.classList.toggle('reduced', !!prefs.reducedMotion);

bootPinball();

function watchGame() {
  requestAnimationFrame(watchGame);
  const D = window.__pinDebug;
  if (!D) return;
  const table = TABLES[D.tableIdx] || TABLES[0];
  if (table.id !== lastTable) {
    lastTable = table.id;
    profile.table = table.id;
    saveProfile(profile);
  }
  if (D.state === 'playing') runRecorded = false;
  if (D.state === 'gameover' && !runRecorded) {
    runRecorded = true;
    const score = D.scoreVal || 0;
    const res = recordScore(profile, table.id, score);
    profile = res.profile;
    if (challenge) {
      profile = recordChallenge(profile, { seed, tableId:table.id, score, target, won:score >= target });
      if (score >= target) ui.toast(t('win') || 'Challenge complete!');
    }
    saveProfile(profile);
    if (res.record) ui.toast(t('newRecord'));
  }
}

ui.initUI({
  profile: () => profile,
  seed: () => seed,
  target: () => target,
  challenge: () => {
    challenge = { seed, target, started:Date.now() };
    ui.toast(`${t('challenge')} · ${formatScore(target)}`);
    window.__pinDebug?.startGame?.();
  },
  cancelChallenge: () => { challenge = null; },
  prefs: patch => {
    prefs = { ...prefs, ...patch };
    savePrefs(prefs);
    window.__pinQuality = prefs.quality;
    document.body.classList.toggle('reduced', !!prefs.reducedMotion);
    dispatchEvent(new Event('resize'));
  },
  lang: () => setLang(getLang() === 'en' ? 'it' : 'en'),
  theme: () => {
    prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = prefs.theme;
    savePrefs(prefs);
  },
  deleteSave: () => {
    if (!deleteArmed) {
      deleteArmed = true;
      const btn = document.getElementById('btnDeleteSave');
      btn.textContent = t('confirmReset') || t('reset');
      setTimeout(() => { deleteArmed = false; btn.textContent = t('reset'); }, 3500);
      return;
    }
    profile = initialProfile();
    saveProfile(profile);
    Object.keys(localStorage).filter(k => k.startsWith('pb_high_')).forEach(k => localStorage.removeItem(k));
    deleteArmed = false;
    document.getElementById('btnDeleteSave').textContent = t('reset');
    ui.toast(t('reset'));
  },
  renderAll: () => {}
});

glass.enable(document.querySelector('.cabinet'), 32, 20);
glass.enable(document.querySelector('.topbar'), 18, 12);

requestAnimationFrame(watchGame);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
