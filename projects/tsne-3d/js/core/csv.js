/* T-SNE 3D — pure CSV parser and column classifier */

export function detectSep(text) {
  const f = String(text || '').slice(0, 2000);
  const sc = (f.match(/;/g) || []).length, tb = (f.match(/\t/g) || []).length, cm = (f.match(/,/g) || []).length;
  if (sc > tb && sc > cm) return ';';
  if (tb > cm) return '\t';
  return ',';
}

function splitLine(line, sep) {
  const out = []; let cur = '', quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; }
      else quoted = !quoted;
    } else if (c === sep && !quoted) { out.push(cur.trim()); cur = ''; }
    else cur += c;
  }
  out.push(cur.trim());
  return out;
}

export function parseCSV(text, sep = null) {
  const s = sep || detectSep(text);
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n').filter(l => l.trim());
  if (!lines.length) return { header: [], rows: [], sep: s };
  const first = splitLine(lines[0], s);
  const numericFirst = first.every(v => v === '' || isFinite(Number(v.replace(',', '.'))));
  const header = numericFirst ? first.map((_, i) => 'col' + (i + 1)) : first;
  const start = numericFirst ? 0 : 1;
  const rows = lines.slice(start).map(l => splitLine(l, s));
  return { header, rows: rows.filter(r => r.length === header.length), sep: s };
}

export function isNum(v, sep = ',') {
  if (v == null) return false;
  const s = String(v).trim();
  if (!s) return false;
  return isFinite(sep === ',' ? Number(s) : Number(s.replace(',', '.')));
}

export function classifyColumns(header, rows, sep = ',') {
  const features = [], labels = [], idLike = [];
  if (!header.length) return { features, labels, idLike };
  const n = header.length;
  for (let c = 0; c < n; c++) {
    const vals = rows.map(r => r[c]);
    const unique = new Set(vals).size;
    const numeric = vals.filter(v => isNum(v, sep)).length / Math.max(1, vals.length);
    if (numeric > 0.9) {
      /* Only treat a numeric column as a label when its name looks categorical;
         otherwise even a 4-value feature would be mistaken for a class. */
      const labelish = /label|class|species|target|digit|category|type|quality|group|cluster|league|area|outcome|label/i.test(header[c]);
      if (labelish && unique <= 24 && unique > 1) labels.push(c);
      else features.push(c);
    } else {
      if (unique <= 24) labels.push(c);
      else idLike.push(c);
    }
  }
  if (!features.length && labels.length > 1) features.push(...labels.splice(0, 1));
  if (!labels.length && features.length > 1) {
    const last = features[features.length - 1];
    const uniq = new Set(rows.map(r => r[last])).size;
    if (uniq > 1 && uniq <= 12) labels.push(features.pop());
  }
  return { features, labels, idLike };
}

export function toMatrix(header, rows, featureIdx, labelIdx = -1, sep = ',') {
  const clean = rows.filter(r => r.length === header.length && featureIdx.every(c => isNum(r[c], sep)));
  const N = clean.length, D = featureIdx.length;
  const raw = new Float32Array(N * D);
  const values = new Array(N);
  for (let i = 0; i < N; i++) {
    for (let d = 0; d < D; d++) {
      let v = clean[i][featureIdx[d]];
      raw[i * D + d] = sep === ',' ? Number(v) : Number(v.replace(',', '.'));
    }
    values[i] = labelIdx >= 0 ? String(clean[i][labelIdx] || '?') : (i < 26 ? String.fromCharCode(65 + i) : 'g' + i);
  }
  /* z-score each feature */
  const X = new Float32Array(N * D);
  for (let d = 0; d < D; d++) {
    let mean = 0;
    for (let i = 0; i < N; i++) mean += raw[i * D + d];
    mean /= Math.max(1, N);
    let sd = 0;
    for (let i = 0; i < N; i++) sd += (raw[i * D + d] - mean) ** 2;
    sd = Math.sqrt(sd / Math.max(1, N)) || 1;
    for (let i = 0; i < N; i++) X[i * D + d] = (raw[i * D + d] - mean) / sd;
  }
  const labelNames = [...new Set(values)];
  const labelIdxArr = new Uint32Array(N);
  const map = new Map(labelNames.map((v, i) => [v, i]));
  for (let i = 0; i < N; i++) labelIdxArr[i] = map.get(values[i]) || 0;
  return { X, N, D, labels: labelIdxArr, labelNames, rows: clean };
}
