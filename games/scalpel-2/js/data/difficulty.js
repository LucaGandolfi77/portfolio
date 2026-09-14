/* ═══════════════════════════════════════════════════════════════
   SCALPEL-2 — Difficulty Settings
   ═══════════════════════════════════════════════════════════════ */

var S2 = S2 || {};

S2.Difficulty = {
  1:  { timeMod: 1.0,  compChance: 0,    compMax: 0, label: 'Easy' },
  2:  { timeMod: 0.95, compChance: 0.05, compMax: 1, label: 'Easy' },
  3:  { timeMod: 0.9,  compChance: 0.1,  compMax: 1, label: 'Easy' },
  4:  { timeMod: 0.85, compChance: 0.1,  compMax: 2, label: 'Medium' },
  5:  { timeMod: 0.8,  compChance: 0.15, compMax: 2, label: 'Medium' },
  6:  { timeMod: 0.78, compChance: 0.15, compMax: 3, label: 'Medium' },
  7:  { timeMod: 0.76, compChance: 0.2,  compMax: 3, label: 'Medium' },
  8:  { timeMod: 0.74, compChance: 0.2,  compMax: 4, label: 'Hard' },
  9:  { timeMod: 0.72, compChance: 0.25, compMax: 4, label: 'Hard' },
  10: { timeMod: 0.7,  compChance: 0.25, compMax: 5, label: 'Hard' },
  11: { timeMod: 0.68, compChance: 0.3,  compMax: 5, label: 'Expert' },
  12: { timeMod: 0.66, compChance: 0.3,  compMax: 5, label: 'Expert' },
  13: { timeMod: 0.64, compChance: 0.3,  compMax: 5, label: 'Expert' },
  14: { timeMod: 0.62, compChance: 0.35, compMax: 5, label: 'Expert' },
  15: { timeMod: 0.6,  compChance: 0.35, compMax: 5, label: 'Legendary' },
  16: { timeMod: 0.58, compChance: 0.35, compMax: 5, label: 'Legendary' },
  17: { timeMod: 0.56, compChance: 0.35, compMax: 5, label: 'Legendary' },
  18: { timeMod: 0.54, compChance: 0.35, compMax: 5, label: 'Legendary' },
  19: { timeMod: 0.52, compChance: 0.35, compMax: 5, label: 'Legendary' },
  20: { timeMod: 0.5,  compChance: 0.4,  compMax: 5, label: 'Legendary' },

  getDifficulty: function(level) {
    return this[level] || this[1];
  },

  getGrade: function(accuracy) {
    if (accuracy >= 95) return { letter: 'S', color: '#f1c40f', label: 'SUPERB' };
    if (accuracy >= 85) return { letter: 'A', color: '#27ae60', label: 'EXCELLENT' };
    if (accuracy >= 70) return { letter: 'B', color: '#3498db', label: 'GOOD' };
    if (accuracy >= 50) return { letter: 'C', color: '#f39c12', label: 'FAIR' };
    return { letter: 'D', color: '#e74c3c', label: 'POOR' };
  }
};

window.S2 = window.S2 || {};
window.S2.Difficulty = S2.Difficulty;
