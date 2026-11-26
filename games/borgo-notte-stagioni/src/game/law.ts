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

/** Seconds a passer-by takes to get the police on the phone. */
export const REPORT_DELAY = 8;
/** Farther than this from the scene when the call goes through: lost track. */
export const REPORT_RANGE = 150;

export type Witness = 'police' | 'people' | 'nobody';

interface Report {
  offence: Offence;
  x: number;
  z: number;
  due: number;
}

export class Law {
  readonly alert = new Alert();
  private bustTimer = 0;
  readonly pending: Report[] = [];

  /**
   * An offence at (x, z). Seen by a patrol: the alert rises now. Seen only by
   * people: a call reaches the police after a few seconds, if you are still
   * around. Seen by nobody: nothing happens. Returns the message to show.
   */
  witness(o: Offence, x: number, z: number, now: number, seen: Witness): string | null {
    if (seen === 'police') return this.offence(o, now);
    if (seen === 'nobody') return null;
    if (this.pending.some((r) => r.offence === o && now - (r.due - REPORT_DELAY) < 3)) return null;
    this.pending.push({ offence: o, x, z, due: now + REPORT_DELAY });
    return `${OFFENCE_WORDS[o]}: un passante chiama la polizia…`;
  }

  /** Delivers the calls that are due; returns the messages to show. */
  reports(now: number, player: { x: number; z: number }): string[] {
    const out: string[] = [];
    for (const r of [...this.pending]) {
      if (now < r.due) continue;
      this.pending.splice(this.pending.indexOf(r), 1);
      if (Math.hypot(player.x - r.x, player.z - r.z) > REPORT_RANGE) {
        out.push('La segnalazione arriva tardi: sei già lontano');
        continue;
      }
      const msg = this.offence(r.offence, now);
      if (msg) out.push(`Segnalazione: ${msg}`);
    }
    return out;
  }

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
