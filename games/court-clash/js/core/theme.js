/* Arena Broadcast design tokens and team-color helpers */

import { RARITIES } from '../sim/career-mode.js';

const clamp255 = v => Math.max(0, Math.min(255, Math.round(v)));

export function hexToRgb(hex) {
  const s = String(hex || '#00d4ff').replace('#', '');
  const full = s.length === 3 ? s.split('').map(c => c + c).join('') : s;
  return [
    clamp255(parseInt(full.slice(0, 2), 16) || 0),
    clamp255(parseInt(full.slice(2, 4), 16) || 0),
    clamp255(parseInt(full.slice(4, 6), 16) || 0)
  ];
}

export function mix(hexA, hexB, t = 0.5) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  const k = Math.max(0, Math.min(1, t));
  return '#' + a.map((v, i) => clamp255(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join('');
}

export function shade(hex, amount = 0.2) {
  return mix(hex, amount >= 0 ? '#ffffff' : '#000000', Math.abs(amount));
}

export function rarityColor(rarity) {
  return (RARITIES[rarity] || RARITIES.common).color;
}

export function applyTeamTheme(home, away) {
  const root = document.documentElement;
  const h = (home && home.color) || '#00d4ff';
  const a = (away && away.color) || '#7c5cff';
  root.style.setProperty('--team', h);
  root.style.setProperty('--team-2', a);
  root.style.setProperty('--team-soft', mix(h, '#070c1c', 0.72));
  root.style.setProperty('--team-2-soft', mix(a, '#070c1c', 0.78));
  root.style.setProperty('--team-glow', mix(h, '#ffffff', 0.25));
}

export function teamGradient(home, away) {
  const h = (home && home.color) || '#00d4ff';
  const a = (away && away.color) || '#7c5cff';
  return `linear-gradient(120deg, ${shade(h, -0.55)} 0%, ${shade(h, -0.2)} 40%, ${shade(a, -0.25)} 100%)`;
}
