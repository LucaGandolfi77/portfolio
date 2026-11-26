import type { RoadGraph } from '../data/roads';
import { nearestOnGraph, shortestPath } from '../data/roads';

/*
 * Jobs around Fidenza. Offers wait at three spots on the map; driving into
 * one starts it. Pure logic: positions in, events out.
 */

export interface Spot {
  x: number;
  z: number;
  name: string;
}

export type MissionKind = 'consegna' | 'taxi' | 'corsa' | 'fuga';

export interface Offer {
  id: number;
  kind: MissionKind;
  x: number;
  z: number;
  from: Spot;
  to: Spot;
  /** Seasonal-event job title (e.g. 'Mercato dei fiori'). */
  special?: string;
}

export interface Active {
  offer: Offer;
  /** consegna/taxi: 'pickup' then 'deliver'; corsa: 'race'; fuga: 'escape'. */
  stage: 'pickup' | 'deliver' | 'race' | 'escape';
  target: Spot;
  checkpoints: Spot[];
  index: number;
  timeLeft: number;
  timeTotal: number;
  reward: number;
  startHealth: number;
}

export type MissionEvent =
  | { type: 'started'; active: Active }
  | { type: 'stage'; active: Active }
  | { type: 'checkpoint'; active: Active; left: number }
  | { type: 'completed'; active: Active; reward: number; bonus: number }
  | { type: 'failed'; active: Active; reason: 'tempo' | 'auto' | 'polizia' | 'abbandono' };

export interface MissionInput {
  x: number;
  z: number;
  inVehicle: boolean;
  speed: number;
  health: number;
  alert: number;
}

export const RADIUS = 7;
const DRIVE_SPEED = 11;

export const TITLES: Record<MissionKind, string> = {
  consegna: 'Consegna',
  taxi: 'Taxi',
  corsa: 'Corsa',
  fuga: 'Fuga'
};

export class Missions {
  offers: Offer[] = [];
  active: Active | null = null;
  completed = 0;
  private nextId = 1;
  private rand: () => number;

  constructor(private spots: Spot[], private graph: RoadGraph | null, seed = Date.now()) {
    let s = seed >>> 0;
    this.rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  private pick(except?: Spot, minDist = 0): Spot {
    for (let i = 0; i < 30; i++) {
      const s = this.spots[Math.floor(this.rand() * this.spots.length)];
      if (except && (s === except || Math.hypot(s.x - except.x, s.z - except.z) < minDist)) continue;
      return s;
    }
    return this.spots[0];
  }

  /** Fills the board up to three offers, away from the player. */
  refresh(player: { x: number; z: number }): void {
    const kinds: MissionKind[] = ['consegna', 'taxi', 'corsa'];
    while (this.offers.length < 3) {
      const kind = kinds[(this.nextId + this.offers.length) % kinds.length];
      let from = this.pick();
      for (let i = 0; i < 10 && Math.hypot(from.x - player.x, from.z - player.z) < 40; i++) from = this.pick();
      const to = this.pick(from, kind === 'corsa' ? 600 : 300);
      this.offers.push({ id: this.nextId++, kind, x: from.x, z: from.z, from, to });
    }
  }

  private time(a: Spot, b: Spot, slack = 1.35): number {
    return Math.round((Math.hypot(a.x - b.x, a.z - b.z) * 1.3 * slack) / DRIVE_SPEED + 18);
  }

  start(offer: Offer, input: MissionInput): MissionEvent {
    this.offers = this.offers.filter((o) => o !== offer);
    const dist = Math.hypot(offer.from.x - offer.to.x, offer.from.z - offer.to.z);
    let active: Active;
    if (offer.kind === 'corsa') {
      const checkpoints = this.route(offer.from, offer.to);
      const t = Math.round(checkpoints.reduce((acc, c, i) => acc + (i ? Math.hypot(c.x - checkpoints[i - 1].x, c.z - checkpoints[i - 1].z) : 0), 0) / 13 + 12);
      active = { offer, stage: 'race', target: checkpoints[0], checkpoints, index: 0, timeLeft: t, timeTotal: t, reward: Math.round(220 + dist * 0.4), startHealth: input.health };
    } else {
      /* Pickup is right here; the clock starts on the way to the drop. */
      const t = this.time(offer.from, offer.to);
      active = {
        offer,
        stage: 'deliver',
        target: offer.to,
        checkpoints: [],
        index: 0,
        timeLeft: t,
        timeTotal: t,
        reward: Math.round((offer.kind === 'taxi' ? 60 : 110) + dist * (offer.kind === 'taxi' ? 0.42 : 0.35)),
        startHealth: input.health
      };
    }
    this.active = active;
    return { type: 'started', active };
  }

  /** An escape job offered when the alert is high. */
  startEscape(level: number, input: MissionInput): MissionEvent {
    const here: Spot = { x: input.x, z: input.z, name: 'qui' };
    const offer: Offer = { id: this.nextId++, kind: 'fuga', x: input.x, z: input.z, from: here, to: here };
    const t = 60 + level * 15;
    this.active = { offer, stage: 'escape', target: here, checkpoints: [], index: 0, timeLeft: t, timeTotal: t, reward: 150 + level * 120, startHealth: input.health };
    return { type: 'started', active: this.active };
  }

  /** Checkpoints every ~140 m along the shortest road route. */
  route(a: Spot, b: Spot): Spot[] {
    if (!this.graph) return [b];
    const from = nearestOnGraph(this.graph, a.x, a.z);
    const to = nearestOnGraph(this.graph, b.x, b.z);
    const s = from.d < from.edge.length / 2 ? from.edge.a : from.edge.b;
    const t = to.d < to.edge.length / 2 ? to.edge.a : to.edge.b;
    const out: Spot[] = [];
    let node = s;
    let carry = 0;
    let n = 1;
    for (const id of shortestPath(this.graph, s, t)) {
      const e = this.graph.edges[id];
      const forward = e.a === node;
      const pts = e.pts;
      for (let i = 0; i + 3 < pts.length; i += 2) {
        const k = forward ? i : pts.length - 2 - i;
        const k2 = forward ? i + 2 : pts.length - 4 - i;
        const ax = pts[k], az = pts[k + 1], bx = pts[k2], bz = pts[k2 + 1];
        const len = Math.hypot(bx - ax, bz - az);
        carry += len;
        if (carry >= 140) {
          carry = 0;
          out.push({ x: bx, z: bz, name: `Checkpoint ${n++}` });
        }
      }
      node = forward ? e.b : e.a;
    }
    out.push(b);
    return out.slice(-12);
  }

  update(dt: number, input: MissionInput): MissionEvent[] {
    const events: MissionEvent[] = [];
    if (!this.active) {
      if (!input.inVehicle) return events;
      const offer = this.offers.find((o) => Math.hypot(o.x - input.x, o.z - input.z) < RADIUS);
      if (offer && input.speed < 9) events.push(this.start(offer, input));
      return events;
    }
    const a = this.active;
    a.timeLeft -= dt;
    if (a.stage === 'escape') {
      if (input.alert === 0) return this.finish(a, a.reward, Math.round(a.timeLeft * 3));
      if (a.timeLeft <= 0) return this.fail(a, 'tempo');
      return events;
    }
    if (a.timeLeft <= 0) return this.fail(a, 'tempo');
    if (input.health <= 0) return this.fail(a, 'auto');
    const inside = Math.hypot(a.target.x - input.x, a.target.z - input.z) < RADIUS;
    if (!inside || !input.inVehicle) return events;
    if (a.stage === 'race') {
      a.index++;
      if (a.index >= a.checkpoints.length) return this.finish(a, a.reward, Math.round(a.timeLeft * 6));
      a.target = a.checkpoints[a.index];
      events.push({ type: 'checkpoint', active: a, left: a.checkpoints.length - a.index });
      return events;
    }
    if (input.speed > 6) return events;
    /* Delivered: a tip for time left, less for damage done on the way. */
    const damage = Math.max(0, a.startHealth - input.health);
    const bonus = Math.max(0, Math.round(a.timeLeft * (a.offer.kind === 'taxi' ? 2.5 : 1.5) - damage * 2));
    return this.finish(a, a.reward, bonus);
  }

  private finish(a: Active, reward: number, bonus: number): MissionEvent[] {
    this.active = null;
    this.completed++;
    return [{ type: 'completed', active: a, reward, bonus: Math.max(0, bonus) }];
  }

  fail(a: Active, reason: 'tempo' | 'auto' | 'polizia' | 'abbandono'): MissionEvent[] {
    this.active = null;
    return [{ type: 'failed', active: a, reason }];
  }
}
