/* Privacy Audit — bootstrap, wiring and service worker registration */

import { Audit } from './audit.js';
import { Actions } from './actions.js';
import { downloadReport } from './exporter.js';
import { UI } from './ui.js';

const SETTINGS_KEY = 'pa:settings';
function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); }
  catch (e) { return {}; }
}
function saveSettings(patch) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...loadSettings(), ...patch })); }
  catch (e) { /* ignore */ }
}

const settings = loadSettings();
let snapshot = null;
let refreshing = false;

const audit = new Audit();
const ui = new UI({
  onRefresh: () => refresh(),
  onLang: () => toggleLang(),
  onTheme: () => toggleTheme(),
  onClearCookies: scope => runAction(() => actions.clearCookies(scope, snapshot)),
  onClearLocalStorage: scope => runAction(() => actions.clearLocalStorage(scope, snapshot)),
  onClearIndexedDb: scope => runActionAsync(() => actions.clearIndexedDb(scope, snapshot)),
  onNotif: () => showNotifGuide(),
  onExport: options => {
    if (!snapshot) return;
    downloadReport(snapshot, options);
    ui.toast(ui.t('exported'));
    actions.log('export', `${options.format}, values ${options.includeValues ? 'included' : 'redacted'}`);
  },
  onClearLog: () => { actions.clearLog(); ui.toast(ui.t('logTitle')); }
});

const actions = new Actions(log => ui.renderLog(log));

ui.init();
ui.applyTheme(settings.theme === 'light' ? 'light' : 'dark');
ui.applyLang(settings.lang || ui.lang, true);
ui.renderLog(actions.loadLog());
refresh();
registerServiceWorker();

async function refresh() {
  if (refreshing) return;
  refreshing = true;
  try {
    snapshot = await audit.snapshot();
    ui.renderOverview(snapshot);
  } catch (e) {
    console.error('[PA] audit failed', e);
    ui.toast(String(e && e.message ? e.message : e));
  } finally {
    refreshing = false;
  }
}

function runAction(fn) {
  try {
    const entry = fn();
    ui.toast(entry.detail);
  } catch (e) {
    ui.toast(String(e && e.message ? e.message : e));
  }
  refresh();
}

async function runActionAsync(fn) {
  try {
    const entry = await fn();
    ui.toast(entry.detail);
  } catch (e) {
    ui.toast(String(e && e.message ? e.message : e));
  }
  refresh();
}

function showNotifGuide() {
  actions.notificationGuidance();
  ui.showNotifGuide();
}

function toggleLang() {
  const next = ui.lang === 'en' ? 'it' : 'en';
  saveSettings({ lang: next });
  ui.applyLang(next);
  if (snapshot) ui.renderOverview(snapshot);
  ui.renderLog(actions.loadLog());
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  saveSettings({ theme: next });
  ui.applyTheme(next);
}

setInterval(() => { if (!document.hidden) refresh(); }, 10000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => refresh())
      .catch(err => console.warn('[PA] SW failed', err));
  });
}
