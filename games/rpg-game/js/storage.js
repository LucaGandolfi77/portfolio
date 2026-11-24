/* RPG Adventure — versioned save and preferences */
import { initialState, normalize } from './core/progression.js';

const KEY = 'pf.rpg-game.save.v1';
const PREFS = 'pf.rpg-game.prefs.v1';
const defaultPrefs = { sound:true, vibration:true, reducedMotion:false, showFps:false, theme:'dark' };

export function loadGame() {
  try { return normalize(JSON.parse(localStorage.getItem(KEY) || 'null')); }
  catch (e) { return initialState(); }
}
export function saveGame(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
}
export function clearGame() { try { localStorage.removeItem(KEY); } catch (e) {} }
export function loadPrefs() {
  try { return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREFS) || '{}') }; }
  catch (e) { return { ...defaultPrefs }; }
}
export function savePrefs(p) { try { localStorage.setItem(PREFS, JSON.stringify(p)); } catch (e) {} }
