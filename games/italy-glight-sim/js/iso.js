/* Italy Glight Sim — isometric projection helpers (pure, no browser APIs) */

import { clamp, seededRandom } from '../../_kit/core.js';
import { WORLD } from './config.js';
import { LAND } from './map.js';

export const ISO_X = Math.sqrt(3) / 2;
export const ISO_Y = 0.5;
export const ALT_SCALE = 0.12;

export function isoProject(x, y, alt, cam, w, h) {
  const dx = x - cam.x, dy = y - cam.y;
  return {
    x: (dx - dy) * ISO_X * cam.zoom + w / 2,
    y: (dx + dy) * ISO_Y * cam.zoom - alt * ALT_SCALE * cam.zoom + h / 2
  };
}

const LAND_POINTS = LAND.flat();
export const LAND_SPAN = {
  u: Math.max(...LAND_POINTS.map(p => (p.x - p.y) * ISO_X)) - Math.min(...LAND_POINTS.map(p => (p.x - p.y) * ISO_X)),
  v: Math.max(...LAND_POINTS.map(p => (p.x + p.y) * ISO_Y)) - Math.min(...LAND_POINTS.map(p => (p.x + p.y) * ISO_Y))
};

export function cameraIsoFor(view, plane, w, h) {
  if (view === 'overview') {
    return {
      x: WORLD.w / 2, y: WORLD.h / 2,
      zoom: Math.min(w / (LAND_SPAN.u + 70), h / (LAND_SPAN.v + 320)) * 0.95
    };
  }
  const fast = clamp(((plane?.speed || 0) - 110) / 320, 0, 1);
  const base = Math.max(0.45, Math.min(1.35, w / 1100));
  return {
    x: plane ? plane.x : WORLD.w / 2,
    y: plane ? plane.y : WORLD.h / 2,
    zoom: base * (1 - 0.4 * fast)
  };
}

// Canvas rotation angle for a world heading in the isometric frame.
export function screenAngle(heading) {
  const u = (Math.sin(heading) + Math.cos(heading)) * ISO_X;
  const v = (Math.sin(heading) - Math.cos(heading)) * ISO_Y;
  return Math.atan2(u, -v);
}

const rng = seededRandom(1977);
export const TERRAIN = [
  ...Array.from({ length: 14 }, (_, i) => ({
    x: 320 + i * 66 + rng() * 30, y: 150 + rng() * 60,
    h: 45 + rng() * 75, r: 18 + rng() * 15
  })),
  ...Array.from({ length: 16 }, (_, i) => ({
    x: 480 + i * 42 + rng() * 45, y: 320 + i * 24 + rng() * 35,
    h: 35 + rng() * 65, r: 15 + rng() * 12
  }))
];
