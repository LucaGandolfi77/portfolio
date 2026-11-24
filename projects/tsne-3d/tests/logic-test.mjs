import { test, eq, ok, near, summary } from '../../../games/_kit/test-harness.js';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const csv = await import(join(ROOT, 'js/core/csv.js'));
const ds = await import(join(ROOT, 'js/core/datasets.js'));
const km = await import(join(ROOT, 'js/core/kmeans.js'));
const tsne = await import(join(ROOT, 'js/core/tsne.js'));
const share = await import(join(ROOT, 'js/core/share.js'));
const { STR, SAMPLES, METRICS, DEFAULT_SETTINGS, PALETTE } = await import(join(ROOT, 'js/config.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, fn) => cases.push([n, fn]);
const matrix = text => {
  const p = csv.parseCSV(text, csv.detectSep(text));
  const c = csv.classifyColumns(p.header, p.rows, p.sep);
  return { p, c, m: csv.toMatrix(p.header, p.rows, c.features, c.labels[0] ?? -1, p.sep) };
};

// ---- CSV ----
run('detectSep handles comma, semicolon and tab', () => {
  eq(csv.detectSep('a,b,c\n1,2,3'), ',');
  eq(csv.detectSep('a;b;c\n1;2;3'), ';');
  eq(csv.detectSep('a\tb\tc\n1\t2\t3'), '\t');
});
run('parseCSV supports quoted fields and numeric headers', () => {
  const p = csv.parseCSV('"a,b",c\n"1,5",2\n3,4');
  eq(p.header.length, 2);
  eq(p.rows[0][0], '1,5');
  const q = csv.parseCSV('1,2\n3,4');
  eq(q.header[0], 'col1');
  eq(q.rows.length, 2);
});
run('toMatrix z-scores features', () => {
  const { m } = matrix('a,b,label\n1,10,x\n2,20,x\n3,30,y\n4,40,y');
  eq(m.N, 4); eq(m.D, 2);
  eq(m.labelNames.length, 2);
  for (let d = 0; d < m.D; d++) {
    let sum = 0;
    for (let i = 0; i < m.N; i++) sum += m.X[i * m.D + d];
    near(sum / m.N, 0, 1e-5);
  }
});
run('classifyColumns finds label columns', () => {
  const { c } = matrix('sepal,petal,species\n1.2,0.3,setosa\n2.1,0.4,virginica\n3.0,0.5,setosa');
  ok(c.features.length >= 1);
  ok(c.labels.includes(2));
});

// ---- datasets ----
run('all 7 datasets are deterministic CSVs', () => {
  eq(SAMPLES.length, 7);
  SAMPLES.forEach(s => {
    const a = ds.byId(s.id), b = ds.byId(s.id);
    eq(a, b, s.id);
    ok(a.split('\n').length > 10, s.id);
    ok(csv.parseCSV(a).header.length >= 3, s.id);
  });
});
run('MNIST has 64 features and 10 digits', () => {
  const { p, m } = matrix(ds.genMNIST());
  eq(p.header.length, 65);
  eq(m.D, 64);
  eq(m.labelNames.length, 10);
});

// ---- k-means and metrics ----
run('k-means recovers blob structure', () => {
  const { m } = matrix(ds.genBlobs(19, 4, 40));
  const r = km.kmeans(m.X, m.N, m.D, 4, 30, 42);
  eq(r.labels.length, m.N);
  let correct = 0;
  for (let i = 0; i < m.N; i++) if (r.labels[i] === m.labels[i]) correct++;
  ok(correct / m.N > 0.6, 'purity ' + (correct / m.N).toFixed(2));
});
run('clusterMetrics returns finite values', () => {
  const { m } = matrix(ds.genIris());
  const r = km.kmeans(m.X, m.N, m.D, 3, 30, 42);
  const y = new Float32Array(m.N * 3);
  for (let i = 0; i < m.N; i++) for (let k = 0; k < 3; k++) y[i * 3 + k] = m.X[i * m.D + k];
  const v = km.clusterMetrics(y, m.N, 3, r.labels);
  eq(v.k, 3);
  ok(v.silhouette >= -1 && v.silhouette <= 1);
  ok(isFinite(v.davies) && isFinite(v.calinski) && isFinite(v.variance));
  ok(v.variance >= 0 && v.variance <= 1);
});
run('optimalK stays within bounds', () => {
  const { m } = matrix(ds.genBlobs(19, 4, 40));
  const k = km.optimalK(m.X, m.N, m.D, 8, 42);
  ok(k >= 2 && k <= 8, 'k=' + k);
});

// ---- t-SNE ----
run('computeP is symmetric and normalised as a joint distribution', () => {
  const { m } = matrix(ds.genIris());
  const P = tsne.computeP(m.X, m.N, m.D, 20);
  eq(P.length, m.N * m.N);
  let total = 0;
  for (const v of P) total += v;
  near(total, 1, 0.02);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) near(P[i * m.N + j], P[j * m.N + i], 1e-6);
  }
});
run('gradient and normalization produce finite 3D coordinates', () => {
  const { m } = matrix(ds.genIris());
  const P = tsne.computeP(m.X, m.N, m.D, 30);
  const Y = tsne.initY(m.N), V = new Float32Array(m.N * 3);
  tsne.runChunk(P, Y, V, m.N, 20, 12);
  tsne.normalizeY(Y, m.N);
  ok(Y.every(Number.isFinite));
  let mn = Infinity, mx = -Infinity;
  for (const v of Y) { mn = Math.min(mn, v); mx = Math.max(mx, v); }
  ok(mn >= -1.6 && mx <= 1.6, `${mn}..${mx}`);
});

// ---- share ----
run('share codec round-trips configuration', () => {
  const cfg = { sample: 'iris', data: null, perplexity: 42, exaggeration: 8, label: 2, view: 'planet', level: 0.5, k: 3 };
  const d = share.decodeHash('#' + share.encodeHash(cfg));
  eq(d.sample, 'iris'); eq(d.perplexity, 42); eq(d.exaggeration, 8);
  eq(d.label, 2); eq(d.view, 'planet'); eq(d.k, 3);
});
run('share codec round-trips embedded CSV data', () => {
  const h = share.encodeHash({ data: 'a,b\n1,2' });
  eq(share.decodeHash('#' + h).data, 'a,b\n1,2');
  eq(share.decodeHash('garbage%%'), null);
});

// ---- structure / i18n ----
run('EN/IT dictionaries aligned', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('every i18n key used by main.js exists', () => {
  const src = readFileSync(join(ROOT, 'js/main.js'), 'utf8');
  const keys = [...src.matchAll(/\bt\('([a-zA-Z]+)'\)/g)].map(m => m[1]);
  keys.forEach(k => ok(STR.en[k], 'missing ' + k));
});
run('default settings are consistent', () => {
  ok(SAMPLES.some(s => s.id === 'iris'));
  ok(METRICS.length === 4);
  ok(PALETTE.length >= 12);
  eq(DEFAULT_SETTINGS.perplexity, 30);
});
run('all modules, vendors, docs and assets exist', () => {
  ['config','i18n','storage','glass','scene','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n));
  ['csv','datasets','kmeans','tsne','share'].forEach(n =>
    ok(existsSync(join(ROOT, 'js/core', n + '.js')), 'core/' + n));
  ['vendor/three.module.js','vendor/OrbitControls.js','css/app.css',
   'manifest.webmanifest','icon.svg','icons/icon-192.png','icons/icon-512.png',
   'docs/API.md','docs/ALGORITHM.md','legacy-tsne-3d.html'].forEach(p =>
    ok(existsSync(join(ROOT, p)), p));
});
run('HTML is offline-ready and uses local Three.js', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(html.includes('data-project-shell'));
  ok(html.includes('"three":"./vendor/three.module.js"'));
  ok(!html.includes('unpkg.com') && !html.includes('jsdelivr'));
  ok(!html.includes('fonts.googleapis.com'));
  ok(html.indexOf('<script src="../_shared/shell.js"') < html.indexOf('</html>'));
});
run('SW precaches every local module', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  ok(sw.includes('pf-tsne-shell-v1'));
  ['vendor/three.module.js','js/core/kmeans.js','js/core/tsne.js','js/main.js','css/app.css'].forEach(f =>
    ok(sw.includes(f), f));
});
run('catalog and root SW point to the new app', () => {
  const data = readFileSync(join(ROOT, '..', '..', 'assets/js/projects-data.js'), 'utf8');
  ok(data.includes('"href": "projects/tsne-3d/index.html"'));
  ok(!data.includes('projects/tsne-3d/legacy-tsne-3d.html"'));
  const root = readFileSync(join(ROOT, '..', '..', 'sw.js'), 'utf8');
  ok(root.includes("cacheName.indexOf('pf-tsne-') === 0"));
});

for (const [n, fn] of cases) { total++; if (test(n, fn)) passed++; }
summary(passed, total);
