/* ============================================================
   Shake Me — Tobia's verdict (pure)
   ------------------------------------------------------------
   Ingredients 35 · doses 25 · technique 15 · glass and ice 15 ·
   garnish and rim 10. Every point lost leaves a defect behind,
   so the result screen can say exactly what went wrong.
   ============================================================ */
import { TOOL_FOR, ACTIONS, MUDDLE } from './data/bar.js';
import { UNIT_ML } from './data/ingredients.js';
import { mlOf } from './workbench.js';

/**
 * tol: dose margin · lines: marks on the jigger · target: the green dose line
 * guide: next-step hints and highlighted choices · snap: a pour close to the
 * dose settles on it · slack: how much wider the green zone of shaking is.
 */
export const TIERS = {
  easy: { tol: 0.35, lines: 'numbers', target: true, guide: true, snap: 0.25, slack: 0.15, pass: 45 },
  medium: { tol: 0.18, lines: 'plain', target: false, guide: false, snap: 0, slack: 0.05, pass: 55 },
  hard: { tol: 0.08, lines: 'none', target: false, guide: false, snap: 0, slack: 0, pass: 55 },
};

/** The green zone of a hold action at a tier. */
export function bandOf(action, tier = 'easy') {
  const [lo, hi] = ACTIONS[action].band;
  const s = (TIERS[tier] || TIERS.easy).slack;
  return [Math.max(0.05, lo - s), Math.min(1.2, hi + s)];
}

export const STARS = [55, 75, 90];
export const starsOf = (score) => STARS.filter((s) => score >= s).length;

const round = (v) => Math.round(v * 10) / 10;

/** Amount the player put in, in the recipe's unit. */
function amountIn(pours, unit) {
  if (unit === 'some') return pours.length ? 1 : 0;
  return pours.reduce((n, p) => n + (p.unit === unit ? p.amount : mlOf(p) / (UNIT_ML[unit] ?? 1)), 0);
}

export function judge(recipe, bench, tier = 'easy') {
  const tol = (TIERS[tier] || TIERS.easy).tol;
  const defects = [];
  const parts = { ing: 0, dose: 0, tech: 0, glass: 0, garnish: 0 };
  const isBuild = recipe.method === 'build' || recipe.method === 'swizzle';
  // what made it into the glass (a tool that was never emptied counts for nothing)
  const counted = bench.pours.filter((p) => p.target === 'glass' || bench.strained);
  const known = new Set(recipe.ings.flatMap((l) => l.ids));

  /* ingredients */
  const required = recipe.ings.filter((l) => !l.optional);
  let found = 0;
  const present = [];
  for (const line of recipe.ings) {
    const pours = counted.filter((p) => line.ids.includes(p.id));
    if (pours.length) present.push({ line, pours });
    if (line.optional) continue;
    if (pours.length) found++;
    else defects.push({ key: 'missing', ing: line.ids[0] });
  }
  const extras = [...new Set(counted.filter((p) => !known.has(p.id)).map((p) => p.id))];
  extras.forEach((id) => defects.push({ key: 'extra', ing: id }));
  parts.ing = Math.max(0, 35 * (required.length ? found / required.length : 1) - 6 * extras.length);

  /* doses */
  const measured = present.filter(({ line }) => !line.optional && line.unit !== 'some');
  if (measured.length) {
    let sum = 0;
    for (const { line, pours } of measured) {
      const got = amountIn(pours, line.unit);
      const err = Math.abs(got - line.amount) / line.amount;
      sum += err <= tol ? 1 : Math.max(0, 1 - (err - tol) / (2 * tol));
      if (err > tol) defects.push({ key: got > line.amount ? 'doseHigh' : 'doseLow', ing: line.ids[0], got: round(got), want: line.amount, unit: line.unit });
    }
    parts.dose = (25 * sum) / measured.length;
  } else parts.dose = found === required.length ? 25 : 0;
  // nothing right means no dose points either
  parts.dose *= required.length ? found / required.length : 1;

  /* technique: tool 6 · action 4 · muddle 2 · order 3 */
  const wantTool = TOOL_FOR[recipe.method];
  let tech = 0;
  if (bench.tool === wantTool) tech += 6;
  else defects.push({ key: 'tool', want: wantTool, got: bench.tool });
  const action = recipe.method === 'build' ? null : recipe.method;
  if (!action) tech += 4;
  else if (bench.tool === wantTool) {
    const done = bench.acts[action];
    const spec = ACTIONS[action];
    if (!done) defects.push({ key: 'noAction', action });
    else {
      const [lo, hi] = bandOf(action, tier);
      const p = done.progress;
      const miss = p < lo ? lo - p : p > hi ? p - hi : 0;
      let pts = 4 * Math.max(0, 1 - miss / 0.3);
      if (miss) defects.push({ key: p < lo ? 'actionShort' : 'actionLong', action });
      if (spec.needsIce && !done.ice) { pts = Math.max(0, pts - 2); defects.push({ key: 'noIce', action }); }
      tech += pts;
    }
  }
  if (recipe.muddle) {
    const v = isBuild ? 'glass' : 'tool';
    if (bench.muddle[v] >= MUDDLE.min) tech += 2;
    else defects.push({ key: 'muddle' });
  } else tech += 2;
  // where and when each ingredient went in
  const checks = [];
  const lastBase = Math.max(-1, ...bench.pours.filter((p) => recipe.ings.some((l) => l.stage === 'base' && l.ids.includes(p.id))).map((p) => p.n));
  for (const { line, pours } of present) {
    for (const p of pours) {
      let ok;
      if (line.stage === 'base') ok = isBuild ? p.target === 'glass' : p.target === 'tool';
      else if (line.stage === 'rinse') ok = p.target === 'glass' && !p.afterStrain && (isBuild || !bench.pours.some((q) => q.target === 'glass' && q.n < p.n));
      else ok = p.target === 'glass' && (isBuild ? p.n > lastBase : p.afterStrain);
      checks.push(ok);
      if (!ok) defects.push({ key: line.stage === 'base' ? 'place' : line.stage, ing: p.id });
    }
  }
  tech += checks.length ? (3 * checks.filter(Boolean).length) / checks.length : 3;
  parts.tech = tech;

  /* glass 10 · ice 5 */
  if (recipe.glass.includes(bench.glass)) parts.glass += 10;
  else defects.push({ key: 'glass', want: recipe.glass[0], got: bench.glass });
  if (recipe.ice === '*' || recipe.ice === bench.glassIce) parts.glass += 5;
  else defects.push({ key: 'ice', want: recipe.ice, got: bench.glassIce });

  /* garnish 7 · rim 3 */
  const groups = recipe.garnish;
  const needed = groups.filter((g) => !g.optional);
  const hit = needed.filter((g) => g.ids.some((id) => bench.garnish.includes(id))).length;
  needed.filter((g) => !g.ids.some((id) => bench.garnish.includes(id))).forEach((g) => defects.push({ key: 'garnishMissing', garnish: g.ids[0] }));
  const allowed = new Set(groups.flatMap((g) => g.ids));
  const wrong = bench.garnish.filter((id) => !allowed.has(id));
  wrong.forEach((id) => defects.push({ key: 'garnishExtra', garnish: id }));
  let garnish = Math.max(0, 7 * (needed.length ? hit / needed.length : 1) - 2 * wrong.length);
  if (recipe.rim) {
    if (bench.rim === recipe.rim || (recipe.rimOptional && !bench.rim)) garnish += 3;
    else defects.push({ key: bench.rim ? 'rimWrong' : 'rimMissing', rim: recipe.rim });
  } else if (bench.rim) defects.push({ key: 'rimExtra', rim: bench.rim });
  else garnish += 3;
  parts.garnish = garnish;

  for (const k of Object.keys(parts)) parts[k] = round(parts[k]);
  const score = Math.round(Object.values(parts).reduce((a, b) => a + b, 0));
  return { score, stars: starsOf(score), parts, defects };
}
