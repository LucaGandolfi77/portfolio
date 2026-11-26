import * as THREE from 'three';
import { FIDENZA } from '../data/fidenza';
import { nearestOnGraph, type RoadGraph } from '../data/roads';
import { Marker } from '../world/markers';
import type { Blip } from '../ui/radar';
import type { SeasonEvent } from './calendar';
import { Missions } from './missions';

/*
 * The free jobs between story missions: offers on the map (with extra ones
 * during seasonal events), their beacons and their radar blips.
 */

const EVENT_KIND: Record<SeasonEvent['id'], 'consegna' | 'taxi'> = {
  fiori: 'consegna',
  'notte-bianca': 'taxi',
  'san-donnino': 'taxi',
  natale: 'consegna',
  capodanno: 'taxi'
};

export class JobsBoard {
  private markers = new Map<number, Marker>();
  private target = new Marker(0xffd23f, 3.6);

  constructor(private scene: THREE.Scene, private graph: RoadGraph, readonly missions: Missions) {
    this.target.group.visible = false;
    scene.add(this.target.group);
  }

  /** Keeps three regular offers, plus one per running event at its square. */
  refresh(player: { x: number; z: number }, events: SeasonEvent[]): void {
    const m = this.missions;
    m.refresh(player);
    for (const e of events) {
      if (m.offers.some((o) => o.special === e.name) || m.active?.offer.special === e.name) continue;
      const n = nearestOnGraph(this.graph, e.place.x + 14, e.place.z + 10, true);
      const from = { x: n.x, z: n.z, name: e.place.name };
      const pool = FIDENZA.places.filter((p) => Math.hypot(p.x - from.x, p.z - from.z) > 250);
      const dest = pool[Math.floor(Math.random() * pool.length)] ?? FIDENZA.places[0];
      const d = nearestOnGraph(this.graph, dest.x, dest.z, true);
      m.offers.push({ id: 10_000 + Math.floor(Math.random() * 1e6), kind: EVENT_KIND[e.id], x: from.x, z: from.z, from, to: { x: d.x, z: d.z, name: dest.name }, special: e.name });
    }
    /* Event jobs disappear when the event ends. */
    m.offers = m.offers.filter((o) => !o.special || events.some((e) => e.name === o.special));
  }

  /** Beacons: offers hidden during any job or story mission. */
  sync(storyRunning: boolean): void {
    const t = performance.now() / 1000;
    const active = this.missions.active;
    const hide = !!active || storyRunning;
    const live = new Set<number>();
    for (const o of this.missions.offers) {
      live.add(o.id);
      let m = this.markers.get(o.id);
      if (!m) {
        m = new Marker(o.special ? 0xff4fa0 : 0xff8a3d).at(o.x, o.z);
        this.markers.set(o.id, m);
        this.scene.add(m.group);
      }
      m.group.visible = !hide;
      m.update(t);
    }
    for (const [id, m] of this.markers) {
      if (!live.has(id)) {
        this.scene.remove(m.group);
        this.markers.delete(id);
      }
    }
    if (active && active.stage !== 'escape' && !storyRunning) {
      this.target.group.visible = true;
      this.target.at(active.target.x, active.target.z).update(t);
    } else {
      this.target.group.visible = false;
    }
  }

  blips(storyRunning: boolean): Blip[] {
    const out: Blip[] = [];
    const active = this.missions.active;
    if (active && active.stage !== 'escape' && !storyRunning) out.push({ x: active.target.x, z: active.target.z, kind: 'target' });
    if (!active && !storyRunning) {
      for (const o of this.missions.offers) out.push({ x: o.x, z: o.z, kind: 'offer', label: o.special ? '★' : o.kind === 'consegna' ? 'C' : o.kind === 'taxi' ? 'T' : 'R' });
    }
    return out;
  }
}
