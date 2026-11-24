/* Mystic Quest — versioned save and preferences */
import { initialState, normalize } from './core/progression.js';
const SAVE = 'pf.mystic.save.v1';
const PREFS = 'pf.mystic.prefs.v1';
const defaults = { sound:true, vibration:true, reducedMotion:false, quality:'high', theme:'dark' };

export function loadGame() {
  try { return normalize(JSON.parse(localStorage.getItem(SAVE) || 'null')); }
  catch (e) { return initialState(); }
}
export function saveGame(s) { try { localStorage.setItem(SAVE, JSON.stringify(s)); return true; } catch (e) { return false; } }
export function clearGame() { try { localStorage.removeItem(SAVE); } catch (e) {} }
export function loadPrefs() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(PREFS) || '{}') }; }
  catch (e) { return { ...defaults }; }
}
export function savePrefs(p) { try { localStorage.setItem(PREFS, JSON.stringify(p)); } catch (e) {} }
