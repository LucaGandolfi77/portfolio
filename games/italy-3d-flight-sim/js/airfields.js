/* Italy 3D Flight Sim — airfields: flat ground, runway geometry and approach guidance (pure logic)
 *
 * The map is compressed, so runways are game-sized: much longer than life
 * compared with the distances between cities.
 */

import { AIRPORTS } from './config.js';

export const RUNWAY = { half: 90, width: 20, aim: 25 };
/* Height gained per unit of distance on the guided approach (about 5.7 degrees). */
export const GLIDE_SLOPE = 0.1;

const FLAT = { along: 125, across: 28, fadeAlong: 150, fadeAcross: 55 };
const CORRIDOR = { start: 110, end: 520, across: 30, fade: 35, slope: 0.065 };
const MIN_ELEVATION = 2.5;
const SHARED_RADIUS = 150;

let fields = [];

const clamp01 = v => Math.max(0, Math.min(1, v));
const smooth = t => { const c = clamp01(t); return c * c * (3 - 2 * c); };

function placement(airport, toWorld) {
  const { x, z } = toWorld(airport.lon, airport.lat);
  const heading = airport.rwy * Math.PI / 180;
  return { airport, code: airport.code, x, z, heading, dir: { x: Math.sin(heading), z: -Math.cos(heading) } };
}

/* Rectangles that must be dry land, so coastal runways are not flooded. */
export function airfieldPads(toWorld) {
  return AIRPORTS.map(airport => ({
    ...placement(airport, toWorld),
    along: FLAT.along + FLAT.fadeAlong * 0.4, across: FLAT.across + FLAT.fadeAcross * 0.7
  }));
}

export function initAirfields(naturalHeight, toWorld) {
  const built = AIRPORTS.map(airport => {
    const field = placement(airport, toWorld);
    field.natural = Math.max(MIN_ELEVATION, naturalHeight(field.x, field.z));
    return field;
  });
  /* Neighbouring fields share one elevation so their flat areas join cleanly. */
  for (const f of built) {
    if (f.elevation !== undefined) continue;
    const cluster = [f];
    for (let i = 0; i < cluster.length; i++) {
      for (const g of built) {
        if (!cluster.includes(g) && Math.hypot(g.x - cluster[i].x, g.z - cluster[i].z) < SHARED_RADIUS) cluster.push(g);
      }
    }
    const elevation = cluster.reduce((sum, g) => sum + g.natural, 0) / cluster.length;
    for (const g of cluster) g.elevation = elevation;
  }
  fields = built;
}

export const airfields = () => fields;
export const airfield = code => fields.find(f => f.code === code);

/* Runway-aligned coordinates: along the runway heading, and to its right. */
export function runwayCoords(field, x, z) {
  const dx = x - field.x, dz = z - field.z;
  return {
    along: dx * field.dir.x + dz * field.dir.z,
    across: -dx * field.dir.z + dz * field.dir.x
  };
}

export function flattenHeight(x, z, natural) {
  let weight = 0, level = 0;
  const cuts = [];
  for (const f of fields) {
    if (Math.abs(x - f.x) > CORRIDOR.end || Math.abs(z - f.z) > CORRIDOR.end) continue;
    const { along, across } = runwayCoords(f, x, z);
    const a = Math.abs(along), c = Math.abs(across);
    const w = (1 - smooth((a - FLAT.along) / FLAT.fadeAlong)) * (1 - smooth((c - FLAT.across) / FLAT.fadeAcross));
    if (w > weight) { weight = w; level = f.elevation; }
    if (a < CORRIDOR.end && c < CORRIDOR.across + CORRIDOR.fade) {
      cuts.push({
        limit: f.elevation + Math.max(0, a - CORRIDOR.start) * CORRIDOR.slope,
        weight: (1 - smooth((c - CORRIDOR.across) / CORRIDOR.fade)) * (1 - smooth((a - (CORRIDOR.end - 100)) / 100))
      });
    }
  }
  let height = weight > 0 ? natural + (level - natural) * weight : natural;
  /* Keep every approach path clear of exaggerated hills, without cutting into a runway pad. */
  if (weight < 0.999) {
    for (const cut of cuts) if (height > cut.limit) height += (cut.limit - height) * cut.weight;
  }
  return height;
}

export function onAirfield(x, z, alongMargin = 190, acrossMargin = 34) {
  return fields.some(f => {
    if (Math.abs(x - f.x) > 260 || Math.abs(z - f.z) > 260) return false;
    const { along, across } = runwayCoords(f, x, z);
    return Math.abs(along) < alongMargin && Math.abs(across) < acrossMargin;
  });
}

export function runwayAt(x, z, margin = 4) {
  return fields.find(f => {
    const { along, across } = runwayCoords(f, x, z);
    return Math.abs(along) <= RUNWAY.half + margin && Math.abs(across) <= RUNWAY.width / 2 + margin;
  }) || null;
}

export const angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

/* The runway end (1 or -1 along the stored heading) that best matches a heading. */
export const runwayEnd = (field, heading) => Math.abs(angleDiff(heading, field.heading)) <= Math.PI / 2 ? 1 : -1;

/* Start position for a take-off roll in the given direction. */
export function threshold(field, end = 1) {
  const back = RUNWAY.half - 6;
  return {
    x: field.x - field.dir.x * back * end,
    z: field.z - field.dir.z * back * end,
    heading: (field.heading + (end > 0 ? 0 : Math.PI)) % (Math.PI * 2)
  };
}

/* Localiser / glide-slope deviation for the runway being approached, or null.
 * lateral > 0: right of the centreline. vertical > 0: above the path. Both -1..1. */
export function approachGuidance(x, y, z, heading) {
  let best = null;
  for (const f of fields) {
    for (const end of [1, -1]) {
      const course = f.heading + (end > 0 ? 0 : Math.PI);
      const off = Math.abs(angleDiff(heading, course));
      if (off > Math.PI / 3) continue;
      const local = runwayCoords(f, x, z);
      const along = local.along * end, across = local.across * end;
      const distance = RUNWAY.aim - RUNWAY.half - along;
      if (distance < -30 || distance > 600 || Math.abs(across) > 40 + Math.max(0, distance) * 0.35) continue;
      const score = Math.abs(across) + Math.max(0, distance) * 0.2 + off * 60;
      if (best && score >= best.score) continue;
      const target = f.elevation + 1.5 + Math.max(0, distance) * GLIDE_SLOPE;
      const height = y - (f.elevation + 1.5);
      const wanted = target - (f.elevation + 1.5);
      best = {
        score, code: f.code, end, course: course % (Math.PI * 2), distance, across,
        targetHeight: target,
        lateral: Math.max(-1, Math.min(1, across / (6 + Math.max(0, distance) * 0.12))),
        vertical: Math.max(-1, Math.min(1, (height - wanted) / (3 + wanted * 0.35)))
      };
    }
  }
  return best;
}

/* Grade a touchdown 0..100 from sink rate, centreline, alignment and touchdown zone. */
export function gradeLanding(field, touch) {
  const end = runwayEnd(field, touch.heading);
  const local = runwayCoords(field, touch.x, touch.z);
  const course = field.heading + (end > 0 ? 0 : Math.PI);
  const centre = Math.abs(local.across);
  const angle = Math.abs(angleDiff(touch.heading, course)) * 180 / Math.PI;
  const zone = Math.abs(local.along * end - (RUNWAY.aim - RUNWAY.half));
  const penalty = Math.max(0, touch.sink - 0.8) * 12 + Math.max(0, centre - 1) * 4
    + Math.max(0, angle - 2) * 2 + Math.max(0, zone - 20) * 0.35;
  return {
    score: Math.round(Math.max(0, Math.min(100, 100 - penalty))),
    sink: touch.sink, feetPerMinute: Math.round(touch.sink * 196.85), centre, angle, zone
  };
}
