/* ============================================================
   Shake Me — the bench: what the player has done so far (pure)
   ------------------------------------------------------------
   A plain object changed by small functions. Each returns an
   error key (a string) when the move is not allowed, else null.
   ============================================================ */
import { BY_ID, UNIT_ML } from './data/ingredients.js';
import { ACTIONS, GLASSES } from './data/bar.js';

export function newBench() {
  return {
    glass: null, glassIce: 'none', rim: null,
    tool: null, toolIce: false,
    pours: [], muddle: { tool: 0, glass: 0 },
    acts: {}, strained: false, garnish: [], served: false,
  };
}

const inGlass = (b) => b.pours.some((p) => p.target === 'glass');
const inTool = (b) => b.pours.some((p) => p.target === 'tool');

export function chooseGlass(b, id) {
  if (!GLASSES.some((g) => g.id === id)) return 'unknown';
  if (inGlass(b) || b.strained) return 'glassBusy';
  b.glass = id;
  return null;
}

export function setGlassIce(b, kind) {
  if (!b.glass) return 'noGlass';
  if (inGlass(b) || b.strained) return 'glassBusy';
  b.glassIce = kind;
  return null;
}

export function setRim(b, kind) {
  if (!b.glass) return 'noGlass';
  b.rim = kind || null;
  return null;
}

export function chooseTool(b, id) {
  if (inTool(b) || b.strained) return 'toolBusy';
  if (id === 'glass' && b.pours.length) return 'toolBusy';
  b.tool = id;
  b.toolIce = false;
  return null;
}

export function setToolIce(b, on) {
  if (!b.tool || b.tool === 'glass') return 'noTool';
  if (b.strained) return 'strained';
  b.toolIce = !!on;
  return null;
}

/** Where a pour goes when the player does not say. */
export function defaultTarget(b) {
  return !b.tool || b.tool === 'glass' || b.strained ? 'glass' : 'tool';
}

export function pour(b, id, amount, unit, target = defaultTarget(b)) {
  if (!BY_ID[id]) return 'unknown';
  if (!(amount > 0) && unit !== 'some') return 'empty';
  if (!b.tool) return 'noTool';
  if (target === 'glass' && !b.glass) return 'noGlass';
  if (target === 'tool' && (b.tool === 'glass' || b.strained)) return 'strained';
  b.pours.push({ id, amount: unit === 'some' ? 1 : amount, unit, target, afterStrain: b.strained, n: b.pours.length });
  return null;
}

/** The vessel the hands are working in. */
const vessel = (b) => (b.tool === 'glass' || b.strained || !b.tool ? 'glass' : 'tool');

export function muddle(b, taps = 1) {
  if (!b.tool) return 'noTool';
  const v = vessel(b);
  if (!b.pours.some((p) => p.target === v && BY_ID[p.id].muddle)) return 'nothingToMuddle';
  b.muddle[v] += taps;
  return null;
}

/** progress 0…1 of a hold action (shake, stir, blend, swizzle). */
export function act(b, kind, progress) {
  const a = ACTIONS[kind];
  if (!a) return 'unknown';
  if (b.tool !== a.tool) return 'wrongTool';
  if (b.strained && a.tool !== 'glass') return 'strained';
  const v = a.tool === 'glass' ? 'glass' : 'tool';
  if (!b.pours.some((p) => p.target === v)) return 'empty';
  b.acts[kind] = { progress: Math.max(0, Math.min(1.2, progress)), ice: a.tool === 'glass' ? b.glassIce !== 'none' : b.toolIce };
  return null;
}

export function strain(b) {
  if (!b.tool || b.tool === 'glass') return 'noTool';
  if (b.strained) return 'strained';
  if (!b.glass) return 'noGlass';
  if (!inTool(b)) return 'empty';
  b.strained = true;
  return null;
}

export function toggleGarnish(b, id) {
  const i = b.garnish.indexOf(id);
  if (i >= 0) b.garnish.splice(i, 1);
  else b.garnish.push(id);
  return null;
}

export const mlOf = (p) => p.amount * (UNIT_ML[p.unit] ?? 1);

/** What is in the glass and in the tool right now, for drawing. */
export function contents(b) {
  const tool = b.strained ? [] : b.pours.filter((p) => p.target === 'tool');
  const glass = b.pours.filter((p) => p.target === 'glass' || (b.strained && p.target === 'tool'));
  // shaking or stirring adds melted ice
  const kind = Object.keys(b.acts).find((k) => k !== 'swizzle');
  const water = kind && b.acts[kind].ice ? b.acts[kind].progress * 0.28 : 0;
  const sum = (list) => list.reduce((n, p) => n + mlOf(p), 0);
  const toolMl = sum(tool) * (b.strained ? 0 : 1 + water);
  const glassMl = sum(glass) + (b.strained ? sum(b.pours.filter((p) => p.target === 'tool')) * water : 0);
  return { tool, glass, toolMl, glassMl };
}

/** Mixed colour of a list of pours (dense ones that came last sink apart). */
export function colourOf(list) {
  let r = 0, g = 0, bl = 0, n = 0;
  for (const p of list) {
    const c = BY_ID[p.id].color;
    const w = Math.max(0.3, mlOf(p)) * (BY_ID[p.id].abv > 0 || BY_ID[p.id].kind !== 'mixer' ? 1 : 0.8);
    r += parseInt(c.slice(1, 3), 16) * w; g += parseInt(c.slice(3, 5), 16) * w; bl += parseInt(c.slice(5, 7), 16) * w; n += w;
  }
  if (!n) return null;
  const h = (v) => Math.round(v / n).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(bl)}`;
}
