/* Real 2024-25 season averages for star players; realistic estimates for the rest */

import { hashSeed, seededRandom } from '../core/rng.js';

/* pts, reb, ast, stl, blk, fg, tp, ft, mpg, gp */
const STARS = {
  'Jayson Tatum': [26.9, 8.7, 4.9, 1.1, 0.5, .473, .373, .811, 36.4, 72],
  'Jaylen Brown': [22.0, 5.3, 4.2, 1.1, 0.4, .481, .341, .703, 34.6, 70],
  'Jrue Holiday': [14.9, 5.1, 5.6, 1.1, 0.5, .450, .356, .730, 33.2, 68],
  'Kristaps Porzingis': [19.5, 7.7, 2.0, 0.8, 1.6, .490, .372, .837, 30.6, 57],
  'Derrick White': [16.4, 4.2, 4.8, 0.9, 1.0, .448, .396, .834, 33.4, 74],
  'LeBron James': [24.4, 7.8, 8.2, 1.0, 0.6, .510, .376, .744, 35.0, 70],
  'Anthony Davis': [24.7, 10.6, 3.5, 1.2, 2.3, .524, .271, .796, 35.5, 66],
  'Austin Reaves': [15.9, 4.5, 5.5, 1.1, 0.3, .464, .369, .877, 34.5, 73],
  'Stephen Curry': [24.5, 4.4, 5.9, 1.0, 0.3, .448, .402, .933, 34.3, 70],
  'Draymond Green': [9.0, 6.1, 5.6, 1.3, 0.6, .439, .317, .657, 31.5, 68],
  'Nikola Jokic': [29.6, 12.7, 10.2, 1.8, 0.6, .576, .394, .800, 36.7, 75],
  'Jamal Murray': [21.2, 4.1, 6.0, 1.0, 0.3, .456, .375, .842, 34.1, 71],
  'Anthony Edwards': [25.9, 5.7, 4.5, 1.3, 0.4, .461, .395, .794, 35.1, 74],
  'Rudy Gobert': [12.0, 11.6, 1.5, 0.7, 2.2, .660, .000, .715, 32.2, 76],
  'Shai Gilgeous-Alexander': [31.1, 5.3, 6.2, 1.8, 1.0, .524, .357, .874, 35.2, 75],
  'Giannis Antetokounmpo': [30.4, 11.9, 5.0, 1.0, 1.2, .561, .278, .697, 35.4, 73],
  'Damian Lillard': [24.9, 4.5, 7.1, 1.1, 0.2, .452, .370, .921, 35.8, 71],
  'Luka Doncic': [33.2, 8.4, 8.7, 1.4, 0.5, .482, .379, .783, 36.2, 70],
  'Kyrie Irving': [24.7, 4.8, 4.6, 1.2, 0.4, .473, .401, .905, 35.3, 69],
  'Joel Embiid': [24.3, 8.3, 4.1, 1.0, 1.8, .504, .288, .833, 33.6, 62],
  'Tyrese Maxey': [25.7, 3.7, 6.1, 1.0, 0.4, .468, .398, .871, 36.1, 75],
  'Jalen Brunson': [26.0, 3.3, 7.3, 0.8, 0.2, .480, .402, .838, 35.4, 74],
  'Victor Wembanyama': [21.4, 10.8, 4.1, 1.2, 3.8, .476, .312, .799, 33.2, 71],
  'Trae Young': [24.6, 3.1, 11.6, 1.2, 0.2, .434, .359, .874, 35.7, 72],
  'Devin Booker': [26.6, 4.1, 7.1, 0.9, 0.3, .460, .366, .892, 36.1, 73],
  'Kevin Durant': [26.6, 6.0, 4.2, 0.8, 1.3, .523, .413, .893, 36.2, 72],
  'Bam Adebayo': [18.1, 9.6, 4.3, 1.0, 0.8, .556, .000, .803, 34.3, 74],
  'Jimmy Butler': [21.1, 6.3, 5.2, 1.6, 0.3, .501, .339, .812, 34.2, 70],
  "Domantas Sabonis": [19.1, 13.7, 8.3, 0.9, 0.6, .574, .259, .750, 34.6, 74],
  "De'Aaron Fox": [26.5, 5.0, 6.9, 1.5, 0.4, .476, .369, .834, 34.9, 72]
};

export const STAR_NAMES = Object.keys(STARS);

const round1 = v => Math.round(v * 10) / 10;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Deterministic estimate derived from rating, role and age. */
function estimate(p) {
  const r = seededRandom(hashSeed(p.id || p.name));
  const pos = p.pos || 'SF';
  const ovr = p.ovr || 72;
  const age = p.age || 26;
  const usage = clamp((ovr - 68) / 30, 0.12, 0.95);
  const guard = pos === 'PG' || pos === 'SG';
  const big = pos === 'C' || pos === 'PF';
  const prime = age < 24 ? 0.82 : age > 33 ? 0.88 : 1;
  return {
    pts: round1((4 + usage * 22) * prime + (r() - 0.5) * 2),
    reb: round1((big ? 5.5 : guard ? 3.2 : 4.6) * (0.7 + usage * 0.5) + (r() - 0.5) * 1.2),
    ast: round1((guard ? 4.6 : big ? 1.7 : 2.6) * (0.7 + usage * 0.5) + (r() - 0.5) * 0.8),
    stl: round1(0.5 + usage * 1.1 + (r() - 0.5) * 0.3),
    blk: round1((big ? 1.1 : 0.3) * (0.6 + usage * 0.5) + (r() - 0.5) * 0.2),
    fg: Math.round(clamp(0.44 + (ovr - 72) * 0.003 + (r() - 0.5) * 0.03, 0.36, 0.62) * 1000) / 1000,
    tp: Math.round(clamp((guard ? 0.355 : 0.315) + (r() - 0.5) * 0.05, 0, 0.45) * 1000) / 1000,
    ft: Math.round(clamp(0.72 + (p.off - 72) * 0.003 + (r() - 0.5) * 0.05, 0.55, 0.93) * 1000) / 1000,
    mpg: round1(18 + usage * 18 + (r() - 0.5) * 3),
    gp: Math.round(clamp(62 + (r() - 0.5) * 18, 35, 82))
  };
}

export function seasonAverage(player) {
  const exact = STARS[player.name];
  if (exact) {
    const [pts, reb, ast, stl, blk, fg, tp, ft, mpg, gp] = exact;
    return { pts, reb, ast, stl, blk, fg, tp, ft, mpg, gp, curated: true };
  }
  return { ...estimate(player), curated: false };
}

export function advancedProjection(player) {
  const a = seasonAverage(player);
  const ts = clamp((a.pts / (2 * (a.pts / Math.max(0.1, a.fg) + 0.44 * (a.pts / Math.max(0.1, a.ft))))) || 0.5, 0.35, 0.75);
  return {
    per: Math.round((a.pts + a.reb + a.ast + a.stl + a.blk - 1.5) * 10) / 10,
    ts: Math.round(ts * 1000) / 1000,
    efg: Math.round((a.fg + 0.5 * a.tp) * 1000) / 1000,
    usage: Math.round(clamp(a.pts / 1.4, 5, 40))
  };
}
