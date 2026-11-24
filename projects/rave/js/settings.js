/**
 * settings.js — impostazioni persistenti di RAVE (puro + localStorage).
 */

import { isValidStyle } from './styles.js';

const KEY = 'rave.settings_v1';
export const DEFAULTS = { style: 'none', intensity: 1, lang: 'it', mirror: true, split: 1 };

export function normalizeSettings(value = {}) {
  const style = isValidStyle(value.style) ? value.style : DEFAULTS.style;
  const intensity = Number(value.intensity);
  const split = Number(value.split);
  return {
    style,
    intensity: Number.isFinite(intensity) ? Math.max(0, Math.min(1, intensity)) : 1,
    lang: value.lang === 'en' ? 'en' : 'it',
    mirror: value.mirror !== false,
    split: Number.isFinite(split) ? Math.max(0, Math.min(1, split)) : 1
  };
}

export function loadSettings() {
  try { return normalizeSettings(JSON.parse(localStorage.getItem(KEY) || '{}')); }
  catch (e) { return { ...DEFAULTS }; }
}

export function saveSettings(patch = {}) {
  const next = normalizeSettings({ ...loadSettings(), ...patch });
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
  return next;
}
