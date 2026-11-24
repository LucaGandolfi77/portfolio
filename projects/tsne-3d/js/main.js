/* T-SNE 3D — bootstrap, Web Worker orchestration and fixed-step rendering */
import { SAMPLES } from './config.js';
import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { profile, setSettings, addRecent } from './storage.js';
import { parseCSV, detectSep, classifyColumns, toMatrix } from './core/csv.js';
import { byId, genIris } from './core/datasets.js';
import { kmeans, clusterMetrics, optimalK } from './core/kmeans.js';
import { computeP, initY, gradient, normalizeY } from './core/tsne.js';
import { encodeHash, decodeHash } from './core/share.js';
import { Scene } from './scene.js';
import { ui } from './ui.js';
import * as glass from './glass.js';

const $ = id => document.getElementById(id);
const scene = new Scene($('scene'));
scene.buildStars();

const state = {
  data: null, X: null, N: 0, D: 0, labels: null, labelNames: [], rows: [],
  Y: null, Y0: null, V: null, P: null,
  level: 0, target: 0.5, playing: false, totalIter: 240,
  perch: profile.settings.perplexity, exag: profile.settings.exaggeration,
  k: profile.settings.k, view: profile.settings.view, focused: -1,
  metrics: {}, cohHistory: [], timeline: [], replay: false, replayIdx: 0,
  sample: '', worker: null, busy: false, lastTime: 0, autoOrbit: false
};

/* ---------- worker ---------- */
const workerCode = `
var X,N,D,P,Y,V,iter=0,perplexity=30,exag=12,gain=200;
onmessage=function(e){var m=e.data;
 if(m.type==='init'){
   X=new Float32Array(m.X);N=m.N;D=m.D;perplexity=m.perplexity;exag=m.exag;
   P=computeP();Y=new Float32Array(N*3);V=new Float32Array(N*3);
   for(var z=0;z<Y.length;z++)Y[z]=(Math.random()-0.5)*0.001;iter=0;
   postMessage({type:'ready',Y:Array.from(Y)});
 }
 if(m.type==='step'){
   var target=Math.max(0,Math.min(m.target||0,5000));
   if(target<iter){Y=new Float32Array(N*3);V=new Float32Array(N*3);
     for(var r=0;r<Y.length;r++)Y[r]=(Math.random()-0.5)*0.001;iter=0;}
   while(iter<target){gradientStep();iter++;}
   normalize();postMessage({type:'progress',Y:Array.from(Y),iter:iter});
 }
};
function computeP(){
 var P=new Float32Array(N*N),dist=new Float64Array(N*N);
 for(var i=0;i<N;i++)for(var j=i+1;j<N;j++){var d=0;for(var k=0;k<D;k++){var v=X[i*D+k]-X[j*D+k];d+=v*v;}dist[i*N+j]=dist[j*N+i]=d;}
 var target=Math.log(perplexity);
 for(i=0;i<N;i++){var beta=1,bmin=-Infinity,bmax=Infinity;
  for(var it=0;it<50;it++){var sum=0,row=new Float64Array(N);
   for(j=0;j<N;j++){if(j===i)continue;row[j]=Math.exp(-dist[i*N+j]*beta);sum+=row[j];}
   var H=0;for(j=0;j<N;j++){if(j===i||!row[j])continue;var p=row[j]/sum;H-=p*Math.log(p);}
   var diff=H-target;if(Math.abs(diff)<1e-5)break;
   if(diff>0){bmin=beta;beta=bmax===Infinity?beta*2:(beta+bmax)/2;}
   else{bmax=beta;beta=bmin===-Infinity?beta/2:(beta+bmin)/2;}
  }
  var s=0;for(j=0;j<N;j++)if(j!==i)s+=Math.exp(-dist[i*N+j]*beta);
  for(j=0;j<N;j++)if(j!==i)P[i*N+j]=Math.exp(-dist[i*N+j]*beta)/s;
 }
 for(i=0;i<N;i++)for(j=i+1;j<N;j++){var v=(P[i*N+j]+P[j*N+i])/(2*N);P[i*N+j]=P[j*N+i]=v;}
 return P;
}
function gradientStep(){
 var Q=new Float64Array(N*N),sum=0;
 for(var i=0;i<N;i++)for(var j=i+1;j<N;j++){var d=0;for(var k=0;k<3;k++){var v=Y[i*3+k]-Y[j*3+k];d+=v*v;}
  var q=1/(1+d);Q[i*N+j]=Q[j*N+i]=q;sum+=2*q;}
 var dY=new Float64Array(N*3);
 var factor=iter<100?exag:1;
 for(i=0;i<N;i++)for(var j=0;j<N;j++){if(i===j)continue;
  var pq=(factor*P[i*N+j]-Q[i*N+j]/Math.max(1e-12,sum)),q2=Q[i*N+j];
  for(k=0;k<3;k++)dY[i*3+k]+=pq*q2*(Y[i*3+k]-Y[j*3+k]);}
 var m=iter<100?0.5:0.8;
 for(i=0;i<Y.length;i++){V[i]=m*V[i]-gain*dY[i];Y[i]+=V[i];}
}
function normalize(){var mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
 for(var i=0;i<N;i++)for(var k=0;k<3;k++){mn[k]=Math.min(mn[k],Y[i*3+k]);mx[k]=Math.max(mx[k],Y[i*3+k]);}
 for(k=0;k<3;k++){var sp=mx[k]-mn[k]||1,mid=(mx[k]+mn[k])/2;
  for(i=0;i<N;i++)Y[i*3+k]=(Y[i*3+k]-mid)/sp*3;}}
`;

function makeWorker() {
  try {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const w = new Worker(URL.createObjectURL(blob));
    w.onmessage = e => {
      const m = e.data;
      if (m.type === 'ready') { state.Y = Float32Array.from(m.Y); state.Y0 = state.Y.slice(); onReady(); }
      if (m.type === 'progress') {
        state.Y = Float32Array.from(m.Y);
        state.iter = m.iter;
        const pct = Math.min(1, m.iter / state.totalIter);
        state.level = pct;
        ui.setProgress(pct, `${t('loading')} · ${m.iter}/${state.totalIter}`);
        applyPositions();
      }
    };
    return w;
  } catch (e) { return null; }
}

function load(text, name, sample = '') {
  const parsed = parseCSV(text, detectSep(text));
  const cls = classifyColumns(parsed.header, parsed.rows, parsed.sep);
  const labelIdx = state.labelOverride != null ? state.labelOverride : (cls.labels[0] ?? -1);
  const m = toMatrix(parsed.header, parsed.rows, cls.features, labelIdx, parsed.sep);
  if (!m.N || !m.D) { ui.toast(t('errors') + ': CSV non valido', 'var(--ts-pink)'); return; }
  Object.assign(state, {
    data: parsed, N: m.N, D: m.D, X: m.X, labels: m.labels, labelNames: m.labelNames,
    rows: m.rows, raw: String(text), dataHash: String(text).length < 4000 ? String(text) : '',
    sample, level: 0, target: 0.5, iter: 0, playing: false,
    metrics: {}, cohHistory: [], timeline: [], replay: false, focused: -1
  });
  addRecent(name || sample);
  ui.renderLabels(m.labelNames, labelIdx);
  ui.renderSamples(sample);
  ui.toast(`${m.N} ${t('points')} · ${m.D} ${t('features')}`);
  ui.hero(false);
  setPlaying(false);
  state.worker?.terminate();
  state.worker = makeWorker();
  if (state.worker) state.worker.postMessage({
    type: 'init', X: Array.from(m.X), N: m.N, D: m.D,
    perplexity: state.perch, exag: state.exag
  });
  else {
    state.P = computeP(m.X, m.N, m.D, state.perch);
    state.Y = initY(m.N); state.V = new Float32Array(m.N * 3);
    state.Y0 = state.Y.slice(); onReady();
  }
  updateHash();
}

function onReady() {
  scene.buildPoints(state.Y, state.N, state.labels);
  scene.buildGhost(state.Y0, state.N);
  ui.renderLegend(state.labelNames, counts(), -1);
  applyPositions();
  ui.setProgress(state.level, t('ready'));
}

function counts() {
  const c = new Array(state.labelNames.length).fill(0);
  state.labels?.forEach(l => c[l]++);
  return c;
}

function applyPositions() {
  if (!state.Y) return;
  scene.updatePositions(state.Y);
  const maxIter = Math.max(1, state.totalIter);
  const iter = Math.round(state.level * maxIter);
  const metrics = clusterMetrics(state.Y, state.N, 3, state.labels);
  state.metrics = metrics;
  const value = metrics.silhouette;
  ui.setCoherence(value, t('coherence'));
  state.cohHistory.push(value);
  if (state.cohHistory.length > 100) state.cohHistory.shift();
  ui.sparkline(state.cohHistory);
  ui.renderMetrics(metrics, profile.settings.metric);
  if (state.k) {
    const r = kmeans(state.Y, state.N, 3, state.k, 10, 42);
    scene.buildPoints(state.Y, state.N, r.labels, state.focused);
  }
  if (iter % 4 === 0 && state.timeline.at(-1)?.iter !== iter)
    state.timeline.push({ Y: state.Y.slice(), coh: value, iter });
  updateHUDData();
}

function updateHUDData() {
  $('sliderVal').textContent = Math.round(state.level * 100) + '%';
  $('perpVal').textContent = String(state.perch);
  $('exagVal').textContent = String(state.exag);
  $('kVal').textContent = String(state.k);
  const stats = $('dataStats');
  if (stats && state.N) {
    stats.innerHTML = `<div class="statrow"><span>${t('points')}</span><b>${state.N}</b></div>
      <div class="statrow"><span>${t('features')}</span><b>${state.D}</b></div>
      <div class="statrow"><span>${t('labels')}</span><b>${state.labelNames.length}</b></div>
      <div class="statrow"><span>Iter</span><b>${Math.round(state.level * state.totalIter)}</b></div>`;
  }
}

/* ---------- control actions ---------- */
function setTarget(level) {
  state.target = Math.max(0, Math.min(1, level));
  state.level = state.target;
  const target = Math.round(state.target * state.totalIter);
  state.worker?.postMessage({ type: 'step', target });
  if (!state.worker && state.Y) {
    const step = iter => {
      const factor = iter < 100 ? state.exag : 1;
      const dY = gradient(state.P, state.Y, state.N, factor);
      const m = iter < 100 ? 0.5 : 0.8;
      for (let i = 0; i < state.V.length; i++) { state.V[i] = m * state.V[i] - 200 * dY[i]; state.Y[i] += state.V[i]; }
    };
    while (state.iter < target) { step(state.iter); state.iter++; }
    normalizeY(state.Y, state.N);
    applyPositions();
  }
  updateHash();
}
function setPlaying(v) {
  state.playing = !!v;
  $('btnPlay').classList.toggle('on', state.playing);
  $('btnPlay').textContent = (state.playing ? '❚❚ ' + t('pause') : '▶ ' + t('play'));
}
function play() {
  if (!state.Y) return;
  setPlaying(!state.playing);
  if (state.playing && state.level < 1) setTarget(Math.min(1, state.level + 0.08));
}
function unfold() { setPlaying(true); setTarget(1); }
function reset() { setPlaying(false); setTarget(0); }
function setView(mode) {
  state.view = mode; scene.setView(mode);
  document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === mode));
  updateHash();
}
function focus(c) {
  state.focused = state.focused === c ? -1 : c;
  scene.buildPoints(state.Y, state.N, state.k ? kmeans(state.Y, state.N, 3, state.k, 10, 42).labels : state.labels, state.focused);
  ui.renderLegend(state.labelNames, counts(), state.focused);
  if (state.focused >= 0) {
    ui.focusTag(state.labelNames[state.focused]);
    const idx = state.labels.findIndex(l => l === state.focused);
    if (idx >= 0) scene.flyTo(state.Y[idx * 3], state.Y[idx * 3 + 1], state.Y[idx * 3 + 2]);
  } else ui.clearFocusTag();
}
function label(i) {
  state.labelOverride = i;
  if (state.data) load(state.data.raw || serializeCSV(state.data), state.sample ? SAMPLES.find(s => s.id === state.sample)?.en : 'custom', state.sample);
}
function serializeCSV(p) {
  if (!p) return '';
  return [p.header.join(','), ...p.rows.map(r => r.join(','))].join('\n');
}

/* ---------- export & share ---------- */
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function updateHash() {
  const h = encodeHash({ sample: state.sample, data: state.sample ? null : (state.dataHash || ''),
    perplexity: state.perch, exaggeration: state.exag, label: state.labelOverride,
    view: state.view, level: state.level, k: state.k });
  history.replaceState(null, '', '#' + h);
}
function applyHash() {
  const cfg = decodeHash(location.hash);
  if (!cfg) return false;
  Object.assign(state, { perch: cfg.perplexity || 30, exag: cfg.exaggeration || 12,
    k: cfg.k || 0, view: cfg.view || 'cloud', labelOverride: cfg.label });
  const text = cfg.sample ? byId(cfg.sample) : cfg.data;
  if (text) { state.sample = cfg.sample || ''; load(text, cfg.sample || 'custom', cfg.sample || ''); setTarget(cfg.level ?? 1); }
  setView(state.view);
  return true;
}

/* ---------- loop ---------- */
function frame(now) {
  requestAnimationFrame(frame);
  if (state.autoOrbit && scene.controls) scene.controls.autoRotate = true;
  if (state.playing && state.level >= 1) setPlaying(false);
  if (state.playing && state.level < 1) {
    if (now - state.lastTime > 500) {
      state.lastTime = now;
      setTarget(Math.min(1, state.level + 0.05));
    }
  }
  scene.render();
}

initLang(detect());
ui.initUI({
  level: setTarget, play, unfold, reset, replay: enterReplay,
  perplexity: v => { state.perch = v; updateHash(); },
  exaggeration: v => { state.exag = v; updateHash(); },
  k: v => { state.k = v; if (state.Y) applyPositions(); updateHash(); },
  autoK: () => {
    if (!state.X) return;
    const k = optimalK(state.X, state.N, state.D, 10, 42);
    state.k = k; $('kSlider').value = String(k); applyPositions();
    ui.toast('K = ' + k);
  },
  view: setView,
  orbit: () => { state.autoOrbit = !state.autoOrbit; scene.controls.autoRotate = state.autoOrbit; $('btnOrbit').classList.toggle('on', state.autoOrbit); },
  ghost: () => { if (scene.ghost) scene.ghost.visible = $('ghostBtn').checked; },
  sample: id => { if (!id) return; const txt = byId(id); state.sample = id; load(txt, SAMPLES.find(s => s.id === id)?.[getLang()] || id, id); },
  label,
  file: async f => { const txt = await f.text(); state.sample = ''; load(txt, f.name, ''); },
  paste: txt => { ui.closeDialog('pasteModal'); state.sample = ''; load(txt, 'custom', ''); },
  focus, clearFocus: () => { state.focused = -1; applyPositions(); ui.clearFocusTag(); ui.renderLegend(state.labelNames, counts(), -1); },
  copy: async () => { try { await navigator.clipboard.writeText(location.href); ui.toast(t('copied')); } catch (e) {} },
  png: () => { scene.renderer.domElement.toBlob(b => download(b, 'tsne-3d.png')); },
  json: () => download(new Blob([JSON.stringify({ Y: Array.from(state.Y || []), labels: Array.from(state.labels || []), names: state.labelNames, metrics: state.metrics, params: state }, null, 2)], { type: 'application/json' }), 'tsne-3d.json'),
  csv: () => {
    const head = 'x,y,z,label';
    const lines = state.Y ? Array.from({ length: state.N }, (_, i) =>
      [state.Y[i * 3], state.Y[i * 3 + 1], state.Y[i * 3 + 2], state.labelNames[state.labels[i]]].join(',')) : [];
    download(new Blob([[head, ...lines].join('\n')], { type: 'text/csv' }), 'tsne-3d.csv');
  },
  lang: () => setLang(getLang() === 'en' ? 'it' : 'en'),
  theme: () => { setSettings({ theme: (profile.settings.theme === 'dark' ? 'light' : 'dark') }); document.body.dataset.theme = profile.settings.theme; },
  metric: id => { setSettings({ metric: id }); ui.renderMetrics(state.metrics, id); },
  renderAll: () => {
    updateHUDData();
    ui.renderMetrics(state.metrics, profile.settings.metric);
    $('btnPlay').textContent = (state.playing ? '❚❚ ' + t('pause') : '▶ ' + t('play'));
  },
  sampleId: () => state.sample
});

/* ---------- inspection, tooltip and replay ---------- */
function inspect(i) {
  if (i < 0 || !state.Y || !state.rows[i]) return;
  const name = state.labelNames[state.labels[i]] || t('row') + ' ' + (i + 1);
  const entries = [];
  state.data.header.forEach((h, c) => entries.push([h, state.rows[i][c]]));
  entries.push(['x / y / z', [0, 1, 2].map(k => state.Y[i * 3 + k].toFixed(2)).join(' · ')]);
  ui.inspector(name, entries);
}
$('inspector').querySelector('.x').onclick = () => ui.hideInspector();
$('scene').addEventListener('click', e => {
  const i = scene.pick(e.clientX, e.clientY, state.Y, state.N || 0);
  if (i >= 0) inspect(i); else ui.hideInspector();
});
$('scene').addEventListener('pointermove', e => {
  const tip = $('tip');
  const i = scene.pick(e.clientX, e.clientY, state.Y, state.N || 0, 14);
  if (i < 0) { tip.style.display = 'none'; return; }
  tip.textContent = `${state.labelNames[state.labels[i]] || t('row') + ' ' + (i + 1)} · #${i + 1}`;
  tip.style.display = 'block';
  tip.style.left = (e.clientX + 12) + 'px';
  tip.style.top = (e.clientY + 12) + 'px';
});

let replayTimer = null;
function replayFrame() {
  const frames = state.timeline;
  if (!frames.length) return;
  const f = frames[state.replayIdx];
  state.Y = Float32Array.from(f.Y);
  scene.updatePositions(state.Y);
  state.level = f.iter / Math.max(1, state.totalIter);
  $('slider').value = String(Math.round(state.level * 100));
  $('sliderVal').textContent = Math.round(state.level * 100) + '%';
  $('replaySlider').value = String(Math.round(state.replayIdx / Math.max(1, frames.length - 1) * 100));
  $('replayLabel').textContent = `${state.replayIdx + 1} / ${frames.length}`;
}
function replayStop() {
  clearInterval(replayTimer); replayTimer = null;
  $('replayPlay').textContent = '▶';
}
$('replayPlay').onclick = () => {
  if (replayTimer) { replayStop(); return; }
  $('replayPlay').textContent = '❚❚';
  const speed = +(document.querySelector('.chip.active[data-speed]')?.dataset.speed || 1);
  replayTimer = setInterval(() => {
    state.replayIdx++;
    if (state.replayIdx >= state.timeline.length) { state.replayIdx = state.timeline.length - 1; replayStop(); }
    replayFrame();
  }, 180 / speed);
};
$('replaySlider').oninput = e => {
  replayStop();
  state.replayIdx = Math.round(+e.target.value / 100 * Math.max(0, state.timeline.length - 1));
  replayFrame();
};
$('replayExit').onclick = () => { replayStop(); $('replayBar').classList.add('hidden'); };
document.querySelectorAll('[data-speed]').forEach(b => b.onclick = () => {
  document.querySelectorAll('[data-speed]').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  if (replayTimer) { replayStop(); $('replayPlay').click(); }
});
function enterReplay() {
  if (!state.timeline.length) { ui.toast(t('loading')); return; }
  state.replayIdx = 0;
  $('replayBar').classList.remove('hidden');
  replayFrame();
}

document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => ui.closeDialog(b.dataset.close));
ui.renderSamples('');
ui.setTab('data');
glass.enable(document.querySelector('.topbar'), 20, 14);
glass.enable(document.querySelector('#controls'), 24, 18);

const loaded = applyHash();
if (!loaded) load(genIris(), SAMPLES[0].en, 'iris');
setTimeout(() => ui.hero(true), 500);
requestAnimationFrame(frame);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
