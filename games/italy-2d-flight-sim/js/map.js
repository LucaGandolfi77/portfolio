/* Italy 2D Flight Sim — side-view route data and coordinate helpers (pure) */

import { AIRPORTS, WORLD } from './config.js';
import { clamp, seededRandom } from '../../_kit/core.js';

export const S = (nx, ny) => ({ x: nx * WORLD.scale, y: ny * WORLD.scale });

const MAINLAND_NORM = [
  [250, 110], [340, 90], [450, 105], [540, 95], [630, 120], [710, 110], [760, 150],
  [785, 225], [805, 300], [835, 365], [865, 425], [890, 480], [930, 530], [955, 552],
  [915, 590], [865, 612], [825, 640], [775, 672], [720, 700], [686, 690], [655, 655],
  [625, 610], [600, 565], [570, 520], [545, 485], [510, 445], [470, 395], [425, 345],
  [385, 300], [345, 258], [300, 215], [262, 165]
];
const SICILY_NORM = [
  [450, 700], [530, 688], [610, 705], [655, 730], [620, 770], [530, 782], [465, 758], [440, 725]
];
const SARDINIA_NORM = [
  [180, 430], [220, 412], [250, 450], [258, 515], [232, 565], [195, 552], [170, 495], [172, 452]
];
export const LAND = [MAINLAND_NORM, SICILY_NORM, SARDINIA_NORM].map(poly => poly.map(([x, y]) => S(x, y)));

// Airports become landing strips along the horizontal route. x comes from the
// original design grid; dir is the preferred landing direction (+1 east).
export const AIRPORTS_W = AIRPORTS.map(a => ({
  ...a,
  x: Math.round(a.nx * 1.6 - 60),
  y: WORLD.ground,
  dir: a.rwy % 180 < 90 ? 1 : -1
}));

export const airportByCode = code => AIRPORTS_W.find(a => a.code === code) || null;

const rng = seededRandom(1982);
export const CLOUDS = Array.from({ length: 22 }, () => ({
  x: rng() * WORLD.w,
  alt: 220 + rng() * 900,
  r: 18 + rng() * 30,
  a: 0.05 + rng() * 0.09,
  layer: Math.floor(rng() * 3)
}));

export const distance = (a, b) => Math.hypot(a.x - b.x, (a.y || 0) - (b.y || 0));

export function bearing(a, b) { return Math.atan2(b.x - a.x, -(b.y - a.y)); }
export function normalizeAngle(a) {
  let v = a % (Math.PI * 2);
  if (v < 0) v += Math.PI * 2;
  return v;
}
export function angleDiff(a, b) {
  const d = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(d, Math.PI * 2 - d);
}
export function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export function isLand(x, y) { return LAND.some(poly => pointInPoly(x, y, poly)); }

export function nearestAirport(x, maxDist = Infinity) {
  let best = null, bestD = maxDist;
  for (const a of AIRPORTS_W) {
    const d = Math.abs(a.x - x);
    if (d < bestD) { bestD = d; best = a; }
  }
  return best;
}

// Side-view projection: horizontal position -> screen x, altitude -> screen y.
export function worldToScreen(x, alt, cam, w, h) {
  return { x: (x - cam.x) * cam.zoom + w / 2, y: (cam.y - alt) * cam.zoom + h * 0.72 };
}
export function screenToWorld(sx, sy, cam, w, h) {
  return { x: (sx - w / 2) / cam.zoom + cam.x, alt: cam.y - (sy - h * 0.72) / cam.zoom };
}

export function cameraFor(view, plane, w, h) {
  if (view === 'overview') {
    return {
      x: WORLD.w / 2,
      y: WORLD.ground * 0.55,
      zoom: Math.min(w / WORLD.w, h / (WORLD.ground + 400)) * 0.95
    };
  }
  const alt = plane ? plane.alt : 0;
  const speed = plane ? (plane.speed || 0) : 0;
  const fast = clamp((speed - 110) / 320, 0, 1);
  return {
    x: plane ? plane.x : WORLD.w / 2,
    y: WORLD.ground + alt * 0.82,
    zoom: Math.max(0.45, Math.min(1.4, w / 900)) * (1 - 0.25 * fast)
  };
}

export const AIRPORTS_DATA = AIRPORTS_W;
