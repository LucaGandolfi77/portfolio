import { ERRANDS, ERRAND_BY_ID } from '../data/errands';
import type { ErrandDef } from '../data/types';
import type { GameState } from '../game/GameState';

export class ErrandSystem {
  complete(state: GameState, id: string): ErrandDef | null {
    const def = ERRAND_BY_ID[id];
    if (!def) return null;
    if (!state.completeErrand(id)) return null;
    state.addComposure(def.composureReward);
    state.panic = Math.max(0, state.panic - def.panicRelief);
    return def;
  }

  activeForChapter(state: GameState): ErrandDef[] {
    return ERRANDS.filter((e) => e.chapter <= state.chapter && !state.errandsDone.has(e.id));
  }

  nextObjective(state: GameState): ErrandDef | null {
    const active = this.activeForChapter(state);
    return active.find((e) => !e.optional) ?? active[0] ?? null;
  }

  allMandatoryDone(state: GameState): boolean {
    return ERRANDS.filter((e) => !e.optional).every((e) => state.errandsDone.has(e.id));
  }
}
