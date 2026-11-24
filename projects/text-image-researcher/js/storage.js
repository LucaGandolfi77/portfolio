/** storage.js — impostazioni persistenti. */

const KEY = 'tir.settings_v1';
export const DEFAULTS = {
  theme: 'dark',
  lang: 'it',
  maxPages: 10,
  deepScan: true,
  caseSensitive: false,
  regex: false,
  mode: 'or',
  includeProxies: true
};

export function loadSettings() {
  try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || '{}') || {}) }; }
  catch (e) { return { ...DEFAULTS }; }
}
export function saveSettings(patch = {}) {
  const next = { ...loadSettings(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
  return next;
}
