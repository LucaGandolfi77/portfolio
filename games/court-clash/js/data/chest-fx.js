/* Chest reveal effect presets (pure, testable) */

export const RARITY_FX = {
  common: {
    color: '#9fb3c7', beam: '#c9d6e4', particles: 26, particleSpeed: 0.5,
    shake: 180, open: 320, beamMs: 300, cardMs: 420, celebrate: 380,
    sound: 'click', haptic: 10, flash: 0, confetti: false, stamp: 'COMMON'
  },
  rare: {
    color: '#4de8ff', beam: '#4de8ff', particles: 60, particleSpeed: 0.8,
    shake: 220, open: 360, beamMs: 420, cardMs: 520, celebrate: 520,
    sound: 'rise', haptic: 20, flash: 0.05, confetti: false, stamp: 'RARE'
  },
  epic: {
    color: '#a78bfa', beam: '#a78bfa', particles: 120, particleSpeed: 1.2,
    shake: 280, open: 420, beamMs: 520, cardMs: 620, celebrate: 700,
    sound: 'epic', haptic: [20, 30, 20], flash: 0.14, confetti: false, stamp: 'EPIC'
  },
  legendary: {
    color: '#ffd166', beam: '#fff0a8', particles: 220, particleSpeed: 1.7,
    shake: 340, open: 520, beamMs: 700, cardMs: 760, celebrate: 950,
    sound: 'legend', haptic: [30, 40, 30, 60], flash: 0.3, confetti: true, stamp: 'LEGENDARY'
  }
};

export const PHASES = ['idle', 'shake', 'open', 'beam', 'card', 'celebrate', 'done'];

export function fxFor(tier) { return RARITY_FX[tier] || RARITY_FX.common; }

export function phaseDurations(tier, reduced = false) {
  const fx = fxFor(tier);
  if (reduced) return { shake: 0, open: 0, beam: 0, card: 120, celebrate: 0 };
  return { shake: fx.shake, open: fx.open, beam: fx.beamMs, card: fx.cardMs, celebrate: fx.celebrate };
}

export function nextPhase(phase) {
  const i = PHASES.indexOf(phase);
  return i < 0 || i >= PHASES.length - 1 ? 'done' : PHASES[i + 1];
}

export function totalDuration(tier, reduced = false) {
  const d = phaseDurations(tier, reduced);
  return d.shake + d.open + d.beam + d.card + d.celebrate;
}

export function confettiCount(tier, reduced = false) {
  if (reduced) return 0;
  return fxFor(tier).confetti ? 90 : 0;
}
