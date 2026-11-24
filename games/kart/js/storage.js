/* Neon Kart — versioned profile persistence */
import { initialProfile, normalizeProfile } from './core/progression.js';
const KEY = 'pf.kart.profile.v1';
export function loadProfile() {
  try { return normalizeProfile(JSON.parse(localStorage.getItem(KEY) || 'null')); }
  catch (e) { return initialProfile(); }
}
export function saveProfile(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); return true; } catch (e) { return false; } }
