import { CONFIG } from '../game/GameConfig';
import type { GameState } from '../game/GameState';

export type ThreatLevel = 'SAFE' | 'WATCHED' | 'APPROACHING' | 'INSIDE' | 'CRITICAL' | 'CAPTURE';

export function threatLevel(value: number): ThreatLevel {
  if (value >= 100) return 'CAPTURE';
  if (value >= 80) return 'CRITICAL';
  if (value >= 60) return 'INSIDE';
  if (value >= 40) return 'APPROACHING';
  if (value >= 20) return 'WATCHED';
  return 'SAFE';
}

export const THREAT_TEXT: Record<ThreatLevel, string> = {
  SAFE: 'The street is quiet. For now.',
  WATCHED: 'Something is watching from the dark.',
  APPROACHING: 'It is getting closer. Stay in the light or keep talking.',
  INSIDE: 'They are right behind you. Keep the line open.',
  CRITICAL: 'Footsteps at your heels. Do NOT hang up.',
  CAPTURE: 'It found you.',
};

export const THREAT_WARNINGS: Record<ThreatLevel, string> = {
  SAFE: '',
  WATCHED: 'A silhouette slips past the edge of the light.',
  APPROACHING: 'Something scrapes along the glass outside.',
  INSIDE: 'They are inside the perimeter. Lock doors and stay lit.',
  CRITICAL: 'Breathing right behind your shoulder. Talk. Now.',
  CAPTURE: 'A cold hand closes over the phone.',
};

export class ThreatSystem {
  lastLevel: ThreatLevel = 'SAFE';

  update(dt: number, state: GameState, connected: boolean, proximity = 0): ThreatLevel | null {
    if (state.phase !== 'playing') return null;
    if (state.shieldSec > 0) state.shieldSec = Math.max(0, state.shieldSec - dt);

    const protected_ = connected || state.shieldSec > 0;
    let rate = state.chapterData.threatRate * state.difficultyFactor.threat;
    if (protected_) rate *= connected ? 0.12 : 0.32;
    if (state.lightExposure >= 0.5) rate *= 0.7;
    if (state.panic >= 85) rate *= 1.35;
    if (state.hasFlag('watcher_knowledge') && protected_) rate *= 0.85;
    rate += proximity * 0.28;

    state.threat = Math.min(CONFIG.threatMax, Math.max(0, state.threat + rate * dt));
    const level = threatLevel(state.threat);
    const changed = level !== this.lastLevel;
    this.lastLevel = level;
    return changed ? level : null;
  }

  change(state: GameState, delta: number) {
    state.threat = Math.min(CONFIG.threatMax, Math.max(0, state.threat + delta));
  }

  shield(state: GameState, seconds: number) {
    state.shieldSec = Math.max(state.shieldSec, Math.min(seconds, 90));
  }
}
