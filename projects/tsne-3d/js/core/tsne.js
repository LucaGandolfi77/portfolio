/* T-SNE 3D — pure t-SNE core (worker-safe, no DOM) */

const rand = (rng) => rng ? rng() : Math.random();

export function computeP(X, N, D, perplexity = 30) {
  const P = new Float32Array(N * N);
  const distances = new Float64Array(N * N);
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      let d = 0;
      for (let k = 0; k < D; k++) { const v = X[i * D + k] - X[j * D + k]; d += v * v; }
      distances[i * N + j] = distances[j * N + i] = d;
    }
  }
  const target = Math.log(perplexity);
  for (let i = 0; i < N; i++) {
    let beta = 1, betaMin = -Infinity, betaMax = Infinity;
    for (let tries = 0; tries < 60; tries++) {
      let sum = 0;
      const row = new Float64Array(N);
      for (let j = 0; j < N; j++) {
        if (j === i) continue;
        row[j] = Math.exp(-distances[i * N + j] * beta);
        sum += row[j];
      }
      let H = 0;
      for (let j = 0; j < N; j++) {
        if (j === i || !row[j]) continue;
        const p = row[j] / sum;
        H -= p * Math.log(p);
      }
      const diff = H - target;
      if (Math.abs(diff) < 1e-5) break;
      if (diff > 0) { betaMin = beta; beta = betaMax === Infinity ? beta * 2 : (beta + betaMax) / 2; }
      else { betaMax = beta; beta = betaMin === -Infinity ? beta / 2 : (beta + betaMin) / 2; }
    }
    let sum = 0;
    for (let j = 0; j < N; j++) if (j !== i) sum += Math.exp(-distances[i * N + j] * beta);
    for (let j = 0; j < N; j++) if (j !== i) P[i * N + j] = Math.exp(-distances[i * N + j] * beta) / sum;
  }
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const v = (P[i * N + j] + P[j * N + i]) / (2 * N);
    P[i * N + j] = P[j * N + i] = v;
  }
  return P;
}

export function initY(N, rng) {
  const Y = new Float32Array(N * 3);
  for (let i = 0; i < Y.length; i++) Y[i] = (rand(rng) - 0.5) * 1e-3;
  return Y;
}

export function gradient(P, Y, N, exaggeration = 12) {
  const Q = new Float64Array(N * N);
  let sum = 0;
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      let d = 0;
      for (let k = 0; k < 3; k++) { const v = Y[i * 3 + k] - Y[j * 3 + k]; d += v * v; }
      const q = 1 / (1 + d);
      Q[i * N + j] = Q[j * N + i] = q; sum += 2 * q;
    }
  }
  const dY = new Float64Array(N * 3);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      const pq = (exaggeration * P[i * N + j] - Q[i * N + j] / Math.max(1e-12, sum));
      const q = Q[i * N + j];
      for (let k = 0; k < 3; k++) dY[i * 3 + k] += pq * q * (Y[i * 3 + k] - Y[j * 3 + k]);
    }
  }
  return dY;
}

export function stepY(P, Y, V, N, iter, exaggeration = 12, gain = 200, momentum = 0.5) {
  const m = iter < 100 ? 0.5 : 0.8;
  const dY = gradient(P, Y, N, exaggeration);
  for (let i = 0; i < V.length; i++) {
    V[i] = m * V[i] - gain * dY[i];
    Y[i] += V[i];
  }
  return Y;
}

export function normalizeY(Y, N) {
  let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < N; i++) for (let k = 0; k < 3; k++) {
    min[k] = Math.min(min[k], Y[i * 3 + k]);
    max[k] = Math.max(max[k], Y[i * 3 + k]);
  }
  for (let k = 0; k < 3; k++) {
    const span = (max[k] - min[k]) || 1, mid = (max[k] + min[k]) / 2;
    for (let i = 0; i < N; i++) Y[i * 3 + k] = (Y[i * 3 + k] - mid) / span * 3;
  }
  return Y;
}

export function runChunk(P, Y, V, N, iters, exaggeration, startIter = 0) {
  for (let t = 0; t < iters; t++) stepY(P, Y, V, N, startIter + t, exaggeration);
  normalizeY(Y, N);
  return Y;
}
