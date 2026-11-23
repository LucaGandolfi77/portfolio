/* Advanced box-score metrics (pure) */

const num = v => Number(v) || 0;

export function efficiency(p) {
  return num(p.pts) + num(p.reb) + num(p.ast) + num(p.stl) + num(p.blk)
    - num(p.to) - (num(p.fga) - num(p.fgm)) - (num(p.fta) - num(p.ftm)) * 0.5;
}

export function trueShooting(p) {
  const fga = num(p.fga), fta = num(p.fta), pts = num(p.pts);
  const poss = fga + 0.44 * fta;
  return poss > 0 ? pts / (2 * poss) : 0;
}

export function effectiveFG(p) {
  const fga = num(p.fga);
  return fga > 0 ? (num(p.fgm) + 0.5 * num(p.tpm)) / fga : 0;
}

export function playerImpact(p, minutes = 36) {
  const e = efficiency(p);
  return Math.round((e / Math.max(1, minutes)) * 36 * 10) / 10;
}

export function pace(possessions, minutes = 48) { return Math.round(possessions * (48 / Math.max(1, minutes))); }

export function teamTotals(players) {
  return players.reduce((acc, p) => {
    ['pts', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta', 'orb', 'drb', 'ast', 'stl', 'blk', 'to', 'pf'].forEach(k => { acc[k] = (acc[k] || 0) + num(p[k]); });
    return acc;
  }, {});
}

export function leaders(players, field, count = 5) {
  return players.slice().sort((a, b) => num(b[field]) - num(a[field])).slice(0, count);
}

export function zoneCounts(shots) {
  const zones = { paint: 0, mid: 0, three: 0 };
  for (const s of shots || []) {
    const y = Math.abs(num(s.y) - 250);
    if (num(s.value) === 3) zones.three += 1;
    else if (y < 90) zones.paint += 1;
    else zones.mid += 1;
  }
  return zones;
}
