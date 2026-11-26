import { Alert, type Offence } from './police';

/* The alert level, the words for each offence, and the arrest check. */

export const OFFENCE_WORDS: Record<Offence, string> = {
  carjack: 'Auto rubata',
  knock: 'Pedone investito',
  ram: 'Speronamento',
  speeding: 'Eccesso di velocità',
  'police-car': 'Auto della polizia rubata',
  redlight: 'Passaggio col rosso'
};

export class Law {
  readonly alert = new Alert();
  private bustTimer = 0;

  /** Records an offence; returns the message to show, or null if it did not count. */
  offence(o: Offence, now: number): string | null {
    if (!this.alert.add(o, now)) return null;
    return `${OFFENCE_WORDS[o]}: allerta ${this.alert.level}`;
  }

  /**
   * Patrols stopped next to a player who is stopped (or on foot) for a
   * couple of seconds make an arrest. Airborne players cannot be reached.
   */
  checkArrest(dt: number, patrols: Array<{ x: number; z: number; speed: number }>, p: { x: number; z: number; inCar: boolean; speed: number; airborne: boolean }): boolean {
    if (this.alert.level === 0) {
      this.bustTimer = 0;
      return false;
    }
    let close = 0;
    for (const v of patrols) {
      if (Math.hypot(v.x - p.x, v.z - p.z) < (p.inCar ? 7 : 5) && Math.abs(v.speed) < 5) close++;
    }
    if (!p.inCar && p.airborne) close = 0;
    const stopped = p.inCar ? Math.abs(p.speed) < 1.5 : true;
    if (close > 0 && stopped) this.bustTimer += dt;
    else this.bustTimer = Math.max(0, this.bustTimer - dt * 2);
    if (this.bustTimer > (p.inCar ? 2.2 : 1.6)) {
      this.bustTimer = 0;
      return true;
    }
    return false;
  }
}
