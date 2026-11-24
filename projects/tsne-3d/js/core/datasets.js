/* T-SNE 3D — pure synthetic dataset generators */

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function csv(header, rows) { return [header.join(','), ...rows.map(r => r.join(','))].join('\n'); }

export function genIris(seed = 7) {
  const r = rng(seed), rows = [];
  const specs = [
    { n: 50, m: [5.0, 3.4, 1.5, 0.2], s: [0.35, 0.38, 0.15, 0.06], label: 'setosa' },
    { n: 50, m: [5.9, 2.8, 4.3, 1.3], s: [0.52, 0.32, 0.48, 0.2], label: 'versicolor' },
    { n: 50, m: [6.6, 3.0, 5.6, 2.0], s: [0.6, 0.35, 0.55, 0.24], label: 'virginica' }
  ];
  specs.forEach(sp => {
    for (let i = 0; i < sp.n; i++) {
      const v = sp.m.map((m, j) => (m + gauss(r) * sp.s[j]).toFixed(2));
      rows.push([...v, sp.label]);
    }
  });
  return csv(['sepal_len','sepal_wid','petal_len','petal_wid','species'], rows);
}

export function genMeteo(seed = 11) {
  const r = rng(seed), cities = ['Milano','Roma','Napoli','Torino','Palermo','Bologna','Firenze','Genova','Bari','Venezia','Verona','Perugia'];
  const rows = cities.map((c, i) => {
    const north = i % 3 === 0;
    return [c, (north ? 8 : 18 + r() * 8).toFixed(1), (55 + r() * 35).toFixed(0),
      (1005 + r() * 20).toFixed(0), (2 + r() * 6).toFixed(1), north ? 'nord' : (i % 3 === 1 ? 'centro' : 'sud')];
  });
  return csv(['city','temp','humidity','pressure','wind','area'], rows);
}

export function genCalcio(seed = 13) {
  const r = rng(seed), leagues = ['Serie A','Premier','La Liga','Bundesliga','Ligue 1'], rows = [];
  leagues.forEach((lg, li) => {
    for (let i = 0; i < 10; i++) {
      rows.push(['T' + li + i, (50 + li * 6 + r() * 25).toFixed(0), (30 + r() * 30).toFixed(0),
        (20 + r() * 25).toFixed(0), (10 + r() * 20).toFixed(0), lg]);
    }
  });
  return csv(['team','attack','midfield','defense','form','league'], rows);
}

/* Tiny deterministic digit-like 8×8 patches. */
export function genMNIST(seed = 17, perDigit = 12) {
  const r = rng(seed), rows = [];
  for (let d = 0; d < 10; d++) {
    for (let k = 0; k < perDigit; k++) {
      const grid = [];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const cy = 1 + (d % 3), cx = 1 + Math.floor(d / 3);
          const on = (y === cy && x >= cx && x <= cx + 4) || (x === cx && y >= cy && y <= cy + 5) ||
            (d === 8 && (y === 1 || y === 6) && x >= 2 && x <= 5) ? 1 : 0;
          grid.push(Math.max(0, Math.min(1, on * 0.8 + r() * 0.2)).toFixed(2));
        }
      }
      rows.push([...grid, String(d)]);
    }
  }
  const header = Array.from({ length: 64 }, (_, i) => 'p' + i).concat('digit');
  return csv(header, rows);
}

export function genBlobs(seed = 19, k = 4, n = 60) {
  const r = rng(seed), rows = [], centers = [];
  for (let c = 0; c < k; c++) centers.push([(r() - 0.5) * 8, (r() - 0.5) * 8]);
  for (let i = 0; i < n; i++) {
    const c = i % k, p = centers[c];
    rows.push([(p[0] + gauss(r) * 0.5).toFixed(3), (p[1] + gauss(r) * 0.5).toFixed(3),
      (gauss(r)).toFixed(3), 'c' + c]);
  }
  return csv(['x','y','noise','cluster'], rows);
}

export function genWine(seed = 23) {
  const r = rng(seed), rows = [];
  for (let c = 0; c < 3; c++) {
    for (let i = 0; i < 40; i++) {
      rows.push([(12 + c * 1.5 + gauss(r) * 0.8).toFixed(2),
        (2 + r() * 3).toFixed(2), (2.2 + r() * 0.6).toFixed(2),
        (20 + r() * 10).toFixed(1), 'q' + c]);
    }
  }
  return csv(['alcohol','sugar','ph','body','quality'], rows);
}

export function genNested(seed = 29) {
  const r = rng(seed), rows = [];
  for (let outer = 0; outer < 3; outer++) {
    const ox = (outer - 1) * 5, oy = (outer - 1) * 3;
    for (let inner = 0; inner < 3; inner++) {
      const a = inner * Math.PI * 2 / 3;
      for (let i = 0; i < 12; i++) {
        rows.push([(ox + Math.cos(a) * 1.6 + gauss(r) * 0.25).toFixed(3),
          (oy + Math.sin(a) * 1.6 + gauss(r) * 0.25).toFixed(3),
          (gauss(r)).toFixed(3), `o${outer}i${inner}`]);
      }
    }
  }
  return csv(['x','y','z','group'], rows);
}

export function byId(id) {
  switch (id) {
    case 'iris': return genIris();
    case 'meteo': return genMeteo();
    case 'calcio': return genCalcio();
    case 'mnist': return genMNIST();
    case 'blobs': return genBlobs();
    case 'wine': return genWine();
    case 'nested': return genNested();
    default: return genIris();
  }
}
