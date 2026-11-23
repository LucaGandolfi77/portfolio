/* Italy 3D Flight Sim — lightweight AI traffic (pure logic) */

import { AIRPORTS } from './config.js';
import { geoToWorld, terrainHeight } from './geo.js';

const ROUTES = [
  ['MXP', 'VCE'], ['FCO', 'NAP'], ['LIN', 'BLQ'], ['PMO', 'CTA'],
  ['BRI', 'BDS'], ['FLR', 'FCO'], ['CAG', 'OLB'], ['GOA', 'MXP']
];

export function createTraffic(count = ROUTES.length) {
  return ROUTES.slice(0, count).map(([from, to], i) => {
    const a = geoToWorld(AIRPORTS.find(x => x.code === from).lon, AIRPORTS.find(x => x.code === from).lat);
    const b = geoToWorld(AIRPORTS.find(x => x.code === to).lon, AIRPORTS.find(x => x.code === to).lat);
    const ground = Math.max(terrainHeight(a.x, a.z), terrainHeight(b.x, b.z));
    return {
      from, to, a, b,
      x: a.x, z: a.z, y: ground + 320 + i * 60,
      heading: Math.atan2(b.x - a.x, -(b.z - a.z)),
      speed: 70 + (i % 3) * 18,
      t: i / count,
      dir: 1,
      color: ['#ffd166', '#8ce99a', '#74c0fc', '#ffa8a8'][i % 4]
    };
  });
}

export function stepTraffic(traffic, dt) {
  for (const t of traffic) {
    const dx = t.b.x - t.a.x, dz = t.b.z - t.a.z;
    const len = Math.hypot(dx, dz) || 1;
    t.t += t.dir * (t.speed / len) * dt * 0.55;
    if (t.t > 1) { t.t = 1; t.dir = -1; }
    if (t.t < 0) { t.t = 0; t.dir = 1; }
    t.x = t.a.x + dx * t.t;
    t.z = t.a.z + dz * t.t;
    t.heading = Math.atan2(dx * t.dir, -dz * t.dir);
    t.y = Math.max(terrainHeight(t.x, t.z) + 220, t.y);
  }
  return traffic;
}
