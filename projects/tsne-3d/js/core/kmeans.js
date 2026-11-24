/* T-SNE 3D — pure k-means, metrics and optimal-k search */
const seedRng = (seed) => {
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
};

export function kmeans(X, N, D, k, iters = 30, seed = 42) {
  if (!N || !D || k < 1) return { labels: new Uint32Array(N), centers: [], inertia: 0 };
  const r = seedRng(seed);
  k = Math.min(k, N);
  const centers = new Float32Array(k * D);
  const used = new Set();
  for (let c = 0; c < k; c++) {
    let i = Math.floor(r() * N);
    while (used.has(i)) i = (i + 1) % N;
    used.add(i);
    for (let d = 0; d < D; d++) centers[c * D + d] = X[i * D + d];
  }
  const labels = new Uint32Array(N);
  for (let it = 0; it < iters; it++) {
    let changed = false;
    for (let i = 0; i < N; i++) {
      let best = 0, bd = Infinity;
      for (let c = 0; c < k; c++) {
        let d = 0;
        for (let j = 0; j < D; j++) { const v = X[i * D + j] - centers[c * D + j]; d += v * v; }
        if (d < bd) { bd = d; best = c; }
      }
      if (labels[i] !== best) { labels[i] = best; changed = true; }
    }
    const sums = new Float64Array(k * D), counts = new Uint32Array(k);
    for (let i = 0; i < N; i++) {
      const c = labels[i]; counts[c]++;
      for (let d = 0; d < D; d++) sums[c * D + d] += X[i * D + d];
    }
    for (let c = 0; c < k; c++) {
      if (!counts[c]) continue;
      for (let d = 0; d < D; d++) centers[c * D + d] = sums[c * D + d] / counts[c];
    }
    if (!changed && it > 2) break;
  }
  let inertia = 0;
  for (let i = 0; i < N; i++) {
    const c = labels[i];
    for (let d = 0; d < D; d++) { const v = X[i * D + d] - centers[c * D + d]; inertia += v * v; }
  }
  return { labels, centers, inertia, k };
}

function dist2(Y, i, j, D) {
  let s = 0;
  for (let d = 0; d < D; d++) { const v = Y[i * D + d] - Y[j * D + d]; s += v * v; }
  return s;
}

export function silhouette(Y, N, D, labels) {
  if (N < 3) return 0;
  const groups = new Map();
  for (let i = 0; i < N; i++) {
    const l = labels[i]; if (!groups.has(l)) groups.set(l, []); groups.get(l).push(i);
  }
  const k = groups.size;
  if (k < 2 || k >= N) return 0;
  let total = 0, counted = 0;
  const sample = Math.min(N, 400);
  const step = Math.max(1, Math.floor(N / sample));
  for (let i = 0; i < N; i += step) {
    const own = labels[i], same = groups.get(own);
    if (same.length < 2) continue;
    let a = 0;
    for (const j of same) if (j !== i) a += Math.sqrt(dist2(Y, i, j, D));
    a /= same.length - 1;
    let b = Infinity;
    for (const [l, idx] of groups) {
      if (l === own) continue;
      let s = 0;
      for (const j of idx) s += Math.sqrt(dist2(Y, i, j, D));
      b = Math.min(b, s / idx.length);
    }
    if (!isFinite(b)) continue;
    total += (b - a) / Math.max(a, b);
    counted++;
  }
  return counted ? total / counted : 0;
}

export function clusterMetrics(Y, N, D, labels) {
  const groups = new Map();
  for (let i = 0; i < N; i++) { const l = labels[i]; if (!groups.has(l)) groups.set(l, []); groups.get(l).push(i); }
  const k = groups.size;
  if (k < 2) return { silhouette: 0, davies: Infinity, calinski: 0 };
  const centroids = [];
  for (const idx of groups.values()) {
    const c = new Float64Array(D);
    for (const i of idx) for (let d = 0; d < D; d++) c[d] += Y[i * D + d];
    for (let d = 0; d < D; d++) c[d] /= idx.length;
    centroids.push(c);
  }
  let within = 0, between = 0;
  const overall = new Float64Array(D);
  for (let c = 0; c < k; c++) for (let d = 0; d < D; d++) overall[d] += centroids[c][d] / k;
  for (let i = 0; i < N; i++) {
    const c = labels[i], idx = [...groups.keys()].indexOf(c);
    for (let d = 0; d < D; d++) {
      within += (Y[i * D + d] - centroids[idx][d]) ** 2;
      between += (centroids[idx][d] - overall[d]) ** 2;
    }
  }
  const sep = new Float64Array(k * k);
  for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) {
    if (a === b) continue;
    let s = 0; for (let d = 0; d < D; d++) s += (centroids[a][d] - centroids[b][d]) ** 2;
    sep[a * k + b] = Math.sqrt(s);
  }
  let davies = 0;
  for (let a = 0; a < k; a++) {
    let worst = 0;
    for (let b = 0; b < k; b++) if (a !== b) worst = Math.max(worst, (within / Math.max(1, N)) / Math.max(1e-9, sep[a * k + b]));
    davies += worst;
  }
  const calinski = (between / Math.max(1, k - 1)) / Math.max(1e-9, within / Math.max(1, N - k));
  return {
    silhouette: silhouette(Y, N, D, labels),
    davies: davies / k,
    calinski,
    variance: between / Math.max(1e-9, between + within),
    k
  };
}

export function optimalK(X, N, D, maxK = 8, seed = 42) {
  let bestK = 2, bestScore = -Infinity;
  for (let k = 2; k <= Math.min(maxK, N - 1); k++) {
    const r = kmeans(X, N, D, k, 20, seed + k);
    const m = clusterMetrics(r.centers, k, D, new Uint32Array(Array.from({ length: k }, (_, i) => i)));
    const score = -r.inertia / Math.max(1, N) - 0.01 * k;
    if (score > bestScore) { bestScore = score; bestK = k; }
  }
  return bestK;
}
