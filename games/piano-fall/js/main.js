/* ============================================================
   PIANO FALL — falling-note piano (app)
   ------------------------------------------------------------
   Library → song card (mode, speed, backing band) → play.
   · Play: Perfect / Good / Miss, combo ×4, long notes to hold,
     stars, grade and records per song
   · Practice: the song stops at each note until you play it
   · Listen: the piano plays the song by itself
   · Free play, MIDI files (melody for you, the rest as backing),
     USB/Bluetooth MIDI keyboards through Web MIDI
   The song clock is the audio clock (or performance.now when
   there is no audio), so the band, the tiles and your timing
   always agree.
   ============================================================ */
import { createI18n } from '../../_kit/i18n.js';
import { load, store } from '../../_kit/storage.js';
import { registerSW } from '../../_kit/pwa.js';
import * as M from './music.js';
import * as A from './synth.js';
import { SONGS, CATEGORIES } from './songs.js';
import { STRINGS } from './strings.js';
import { parseMidi } from './midi.js';

const $ = (id) => document.getElementById(id);
const i18n = createI18n(STRINGS, 'it');
const t = (key, vars) => i18n.t(key, vars);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const TAU = Math.PI * 2;

/* ---------------- saved data ---------------- */

const SAVE_KEY = 'piano-fall-v2';
const MIDI_KEY = 'piano-fall-midis-v1';          // shared with the first Piano Fall
const MAX_MIDI_SONGS = 6;
const MAX_MIDI_STORE = 2_400_000;
const MAX_MIDI_BYTES = 5 * 1024 * 1024;

const save = load(SAVE_KEY, {
  records: {},
  settings: { keys: 'auto', labels: null, hints: true, backing: 0.75, speed: 1, band: true, mode: 'play', midiMode: 'melody', sound: true },
  cat: 'all',
});
save.settings = { keys: 'auto', labels: null, hints: true, backing: 0.75, speed: 1, band: true, mode: 'play', midiMode: 'melody', sound: true, ...save.settings };
(function migrate() {
  try {
    const old = JSON.parse(localStorage.getItem('piano-fall-bests') || 'null');
    if (old && !save.migrated) {
      for (const [id, score] of Object.entries(old)) {
        if (!save.records[id] && Number(score) > 0) save.records[id] = { score: Number(score), stars: 0, acc: 0, plays: 1 };
      }
    }
    const oldSize = JSON.parse(localStorage.getItem('piano-fall-settings') || 'null');
    if (oldSize && !save.migrated && M.KEY_SIZES.includes(Number(oldSize.whiteKeys))) save.settings.keys = Number(oldSize.whiteKeys);
  } catch (e) { /* nothing to migrate */ }
  save.migrated = true;
})();
if (!save.settings.labels) save.settings.labels = i18n.getLang() === 'it' ? 'doremi' : 'abc';
const persist = () => store(SAVE_KEY, save);
A.audioState.enabled = save.settings.sound !== false;
A.setBackingVolume(save.settings.backing);

/* ---------------- song entries ---------------- */

const titleOf = (e) => (typeof e.title === 'object' ? e.title[i18n.getLang()] || e.title.en : e.title);

function entryFromDef(def) {
  const build = M.buildSong(def);
  return { id: def.id, cat: def.cat, def, title: def.title, by: def.by, build, keys: M.keysNeeded(build.notes), diff: M.difficultyOf(build.notes) };
}

const ENTRIES = SONGS.map(entryFromDef);
let midiEntries = loadMidiLibrary().map(midiEntry);

function allEntries() { return [...ENTRIES, ...midiEntries]; }
function findEntry(id) { return allEntries().find((e) => e.id === id); }

/* ---------------- MIDI library ---------------- */

function loadMidiLibrary() {
  let raw;
  try { raw = JSON.parse(localStorage.getItem(MIDI_KEY) || '[]'); } catch (e) { raw = []; }
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    if (!item || !Array.isArray(item.notes)) continue;
    const notes = [];
    for (const p of item.notes) {
      if (!Array.isArray(p)) continue;
      const midi = Number(p[0]), ms = Number(p[1]), dur = Number(p[2]);
      if (Number.isFinite(midi) && midi >= 0 && midi <= 127 && Number.isFinite(ms) && ms >= 0) {
        notes.push({ midi, t: ms / 1000, dur: Number.isFinite(dur) && dur > 0 ? dur / 1000 : 0.3 });
      }
    }
    if (!notes.length) continue;
    notes.sort((a, b) => a.t - b.t);
    out.push({ id: String(item.id || 'midi-' + Math.random().toString(36).slice(2)), name: String(item.name || 'MIDI').slice(0, 80), bpm: Number(item.bpm) || 120, savedAt: Number(item.savedAt) || 0, notes });
  }
  return out.sort((a, b) => b.savedAt - a.savedAt).slice(0, MAX_MIDI_SONGS);
}

function saveMidiLibrary() {
  const stored = [];
  let total = 0;
  for (const e of midiEntries) {
    const raw = e.raw;
    const item = { id: raw.id, name: raw.name, bpm: raw.bpm, savedAt: raw.savedAt, notes: raw.notes.map((n) => [n.midi, Math.round(n.t * 1000), Math.round(n.dur * 1000)]) };
    const size = JSON.stringify(item).length;
    if (total + size > MAX_MIDI_STORE) continue;
    stored.push(item);
    total += size;
  }
  try { localStorage.setItem(MIDI_KEY, JSON.stringify(stored)); return stored.length === midiEntries.length; } catch (e) { return false; }
}

function midiEntry(raw) {
  const split = save.settings.midiMode === 'all' ? { melody: raw.notes, backing: [] } : M.splitMelody(raw.notes);
  const notes = split.melody.map((n) => ({ midi: n.midi, t: n.t, dur: n.dur }));
  const length = raw.notes.reduce((a, n) => Math.max(a, n.t + n.dur), 0);
  const spb = 60 / raw.bpm;
  const bars = [];
  for (let b = 0; b < length; b += spb * 4) bars.push(b);
  const backing = split.backing.map((n) => ({ t: n.t, inst: n.midi < 52 ? 'bass' : 'keys', midi: n.midi, dur: Math.max(0.12, n.dur), vel: 0.8 }));
  const build = { notes, backing, drums: [], bars, length };
  return { id: raw.id, cat: 'midi', isMidi: true, raw, title: raw.name, by: 'MIDI', build, keys: M.keysNeeded(notes), diff: M.difficultyOf(notes) };
}

/* ---------------- UI refs ---------------- */

const ui = {
  fall: $('fall'), keys: $('keys'), hud: $('hud'), score: $('score'), songName: $('songName'), progress: $('progressFill'),
  combo: $('combo'), acc: $('acc'), btnSound: $('btnSound'), btnPause: $('btnPause'),
  menu: $('menu'), search: $('search'), tabs: $('tabs'), list: $('songList'), starsTotal: $('starsTotal'),
  btnLang: $('btnLang'), btnSoundMenu: $('btnSoundMenu'), btnSettings: $('btnSettings'),
  btnFreestyle: $('btnFreestyle'), btnMidi: $('btnMidi'), midiFile: $('midiFile'), midiStatus: $('midiStatus'),
  detail: $('detail'), dCat: $('dCat'), dTitle: $('dTitle'), dBy: $('dBy'), dMeta: $('dMeta'), modes: $('modes'),
  speeds: $('speeds'), band: $('bandSeg'), btnStart: $('btnStart'), btnDetailBack: $('btnDetailBack'), btnDelete: $('btnDelete'),
  settings: $('settings'), sizes: $('sizeChoices'), sizeNote: $('sizeNote'), labelsSeg: $('labelsSeg'), hintsSeg: $('hintsSeg'),
  volume: $('volume'), midiMode: $('midiModeSeg'), langSeg: $('langSeg'), btnMidiIn: $('btnMidiIn'), midiInStatus: $('midiInStatus'),
  btnSettingsClose: $('btnSettingsClose'),
  paused: $('paused'), btnResume: $('btnResume'), btnQuit: $('btnQuit'),
  results: $('results'), rTitle: $('rTitle'), rNew: $('rNew'), rStars: $('rStars'), rGrade: $('rGrade'), rScore: $('rScore'), rGrid: $('rGrid'),
  btnRetry: $('btnRetry'), btnNext: $('btnNext'), btnMenu: $('btnMenu'),
  rotate: $('rotate'), toast: $('toast'),
};
const ctx = ui.fall.getContext('2d');

/* ---------------- keyboard layout ---------------- */

const WHITE_CODES = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon',
  'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'Quote', 'BracketLeft'];
const BLACK_CODES = ['KeyW', 'KeyE', 'KeyT', 'KeyY', 'KeyU', 'KeyO', 'KeyP', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8'];
const CODE_LABEL = (code) => ({ Semicolon: ';', Comma: ',', Period: '.', Slash: '/', Quote: "'", BracketLeft: '[' }[code] || code.replace(/^(Key|Digit)/, ''));

let layout = M.makeLayout(10);
let keyMap = new Map();
let keyEls = new Map();

function laneX(midi, W) {
  const wi = layout.white.indexOf(midi);
  if (wi >= 0) return (wi + 0.5) * W / layout.whiteCount;
  const bk = layout.black.find((k) => k.midi === midi);
  return bk ? bk.b * W / layout.whiteCount : W / 2;
}
const laneW = (midi, W) => (M.isBlackKey(midi) ? 0.5 : 0.78) * W / layout.whiteCount;

function setLayout(white) {
  if (layout.whiteCount === white && keyEls.size) return;
  layout = M.makeLayout(white);
  keyMap = new Map();
  layout.white.forEach((m, i) => WHITE_CODES[i] && keyMap.set(WHITE_CODES[i], m));
  layout.black.forEach((k, i) => BLACK_CODES[i] && keyMap.set(BLACK_CODES[i], k.midi));
  buildKeys();
}

function buildKeys() {
  ui.keys.innerHTML = '';
  keyEls = new Map();
  const codeOf = new Map([...keyMap].map(([c, m]) => [m, c]));
  const frag = document.createDocumentFragment();
  const labels = save.settings.labels;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const add = (midi, black, b) => {
    const k = document.createElement('div');
    k.className = 'key' + (black ? ' black' : '');
    k.dataset.midi = midi;
    if (black) {
      const w = 58 / layout.whiteCount;
      k.style.left = (b * 100 / layout.whiteCount - w / 2) + '%';
      k.style.width = w + '%';
    }
    if (labels !== 'off' && (!black || layout.whiteCount <= 15)) {
      const l = document.createElement('span');
      l.className = 'key-label';
      l.textContent = M.midiName(midi, labels).replace(/\d+$/, (o) => (midi % 12 === 0 ? o : ''));
      k.appendChild(l);
    }
    if (save.settings.hints && fine && codeOf.has(midi)) {
      const h = document.createElement('span');
      h.className = 'key-hint';
      h.textContent = CODE_LABEL(codeOf.get(midi));
      k.appendChild(h);
    }
    keyEls.set(midi, k);
    frag.appendChild(k);
  };
  for (const midi of layout.white) add(midi, false);
  for (const { midi, b } of layout.black) add(midi, true, b);
  ui.keys.appendChild(frag);
  guideCache = '';
}

/* ---------------- canvas ---------------- */

const LEAD = 2.4;   // song-seconds of tiles visible above the line
const view = { w: 0, h: 0, dpr: 1, hitY: 0, pps: 100 };

function resize() {
  const r = ui.fall.getBoundingClientRect();
  view.dpr = Math.min(window.devicePixelRatio || 1, 2);
  view.w = r.width;
  view.h = r.height;
  ui.fall.width = Math.round(view.w * view.dpr);
  ui.fall.height = Math.round(view.h * view.dpr);
  view.hitY = view.h - 14;
  view.pps = (view.hitY - 8) / LEAD;
}

/* ---------------- session ---------------- */

const S = {
  mode: 'menu',            // menu | play | paused | results
  kind: 'play',            // play | practice | listen | free
  entry: null, notes: [], backing: [], drums: [], bars: [], length: 0, shift: 0,
  time: 0, speed: 1, band: true, waiting: false,
  bi: 0, di: 0, mi: 0, pi: 0,
  score: 0, combo: 0, maxCombo: 0, hits: 0, misses: 0, perfect: 0, good: 0, wrong: 0,
};
const down = new Map();      // midi → press count (touch + keyboard + MIDI)
const voices = new Map();    // midi → piano voice
const autoUp = [];           // listen/autoplay key releases: { midi, at }
const fx = { parts: [], rings: [], pops: [] };

let selected = null;         // entry shown on the song card
let clockLast = null;

function clockSample() {
  return A.running() ? { src: 'a', v: A.now() } : { src: 'p', v: performance.now() / 1000 };
}
/** Real seconds since the last frame, from the audio clock when it runs. */
function clockDelta() {
  const c = clockSample();
  if (!clockLast || clockLast.src !== c.src) { clockLast = c; return 0; }
  const d = c.v - clockLast.v;
  clockLast = c;
  return clamp(d, 0, 0.25);
}
/** Song time right now, between two frames. */
function songNow() {
  if (S.mode !== 'play' || S.waiting) return S.time;
  const c = clockSample();
  return clockLast && clockLast.src === c.src ? S.time + clamp(c.v - clockLast.v, 0, 0.25) * S.speed : S.time;
}

function layoutFor(entry) {
  const k = save.settings.keys;
  if (k !== 'auto') return Number(k);
  return entry ? Math.max(10, entry.keys) : view.w >= 760 ? 15 : 10;
}

function startSong(entry, kind = save.settings.mode) {
  A.unlock();
  setLayout(layoutFor(entry));
  const fit = M.fitNotes(entry.build.notes, layout);
  if (!fit.notes.length) { toast(t('fitDrop', { p: 0 })); return; }
  S.entry = entry;
  S.kind = kind;
  S.notes = fit.notes.map((n) => ({ midi: n.midi, t: n.t, dur: n.dur, hit: false, missed: false, hold: 0 }));
  S.shift = fit.shift;
  S.backing = entry.build.backing;
  S.drums = entry.build.drums;
  S.bars = entry.build.bars;
  S.length = Math.max(entry.build.length, S.notes.length ? S.notes[S.notes.length - 1].t + S.notes[S.notes.length - 1].dur : 0);
  S.speed = save.settings.speed;
  S.band = save.settings.band && kind !== 'practice';
  S.time = -LEAD - 0.4;
  S.waiting = false;
  S.bi = S.di = S.mi = S.pi = 0;
  S.score = S.combo = S.maxCombo = S.hits = S.misses = S.perfect = S.good = S.wrong = 0;
  S.mode = 'play';
  clockLast = null;
  releaseAll();
  clearFx();
  hideOverlays();
  ui.hud.classList.remove('hidden');
  ui.songName.textContent = titleOf(entry) + (kind === 'practice' ? ' · ' + t('practice') : kind === 'listen' ? ' · ' + t('listen') : '');
  syncHud(true);
  if (fit.dropped) toast(t('fitDrop', { p: Math.round((fit.notes.length / entry.build.notes.length) * 100) }), 3600);
  else if (fit.shift && entry.isMidi) toast(t('fitShift', { n: (fit.shift > 0 ? '+' : '') + fit.shift / 12 }), 2600);
}

function startFree() {
  A.unlock();
  setLayout(layoutFor(null));
  S.entry = null;
  S.kind = 'free';
  S.notes = []; S.backing = []; S.drums = []; S.bars = [];
  S.mode = 'play';
  S.time = 0;
  S.score = S.combo = S.hits = S.misses = 0;
  releaseAll();
  hideOverlays();
  ui.hud.classList.remove('hidden');
  ui.songName.textContent = t('freestyle');
  syncHud(true);
}

/* ---------------- notes in, judging ---------------- */

function press(midi, vel = 0.62) {
  if (!keyEls.has(midi)) return;
  const n = (down.get(midi) || 0) + 1;
  down.set(midi, n);
  keyEls.get(midi).classList.add('down');
  voices.get(midi)?.release();
  voices.set(midi, A.piano(midi, vel));
  const x = laneX(midi, view.w);
  const color = M.isBlackKey(midi) ? '#c9b8ff' : '#ffe9b0';
  burst(x, view.hitY, color, 6, 100);
  ring(x, view.hitY, color);
  if (S.mode !== 'play' || S.kind === 'free' || S.kind === 'listen') return;
  judgePress(midi, songNow());
}

function release(midi) {
  const n = (down.get(midi) || 0) - 1;
  if (n > 0) { down.set(midi, n); return; }
  down.delete(midi);
  keyEls.get(midi)?.classList.remove('down');
  voices.get(midi)?.release();
  voices.delete(midi);
}

function clearFx() { fx.parts.length = 0; fx.rings.length = 0; fx.pops.length = 0; }

function releaseAll() {
  for (const m of [...down.keys()]) { down.set(m, 1); release(m); }
  autoUp.length = 0;
}

function judgePress(midi, now) {
  let best = null, bestDt = Infinity;
  for (let i = S.mi; i < S.notes.length; i++) {
    const n = S.notes[i];
    if (n.t - now > M.WIN_GOOD) break;
    if (n.hit || n.missed || n.midi !== midi) continue;
    const dt = n.t - now;
    if (Math.abs(dt) < Math.abs(bestDt)) { best = n; bestDt = dt; }
  }
  if (!best || Math.abs(bestDt) > M.WIN_GOOD) {
    S.wrong++;
    return;
  }
  const kind = S.kind === 'practice' ? 'perfect' : M.judge(bestDt);
  registerHit(best, kind);
}

function registerHit(n, kind) {
  n.hit = true;
  n.holding = n.dur >= 0.45;
  n.holdFrom = n.t;
  S.hits++;
  S.combo++;
  S.maxCombo = Math.max(S.maxCombo, S.combo);
  if (kind === 'perfect') S.perfect++; else S.good++;
  const x = laneX(n.midi, view.w);
  if (S.kind === 'play') {
    const pts = M.hitPoints(kind, S.combo);
    S.score += pts;
    pop(x, view.hitY - 44, (kind === 'perfect' ? 'PERFECT +' : 'GOOD +') + pts, kind === 'perfect' ? '#ffe08a' : '#b8c4ff', kind === 'perfect' ? 15 : 13);
  } else if (S.kind === 'practice') {
    pop(x, view.hitY - 40, '✓', '#9fe08f', 18);
  }
  if (kind === 'perfect') burst(x, view.hitY, '#ffe08a', 9, 150);
  if (navigator.vibrate && kind === 'perfect' && S.kind === 'play') try { navigator.vibrate(8); } catch (e) { /* no haptics */ }
  syncHud();
}

/* ---------------- update ---------------- */

function update(dt) {
  if (S.mode !== 'play') return;
  if (S.kind === 'free') return;
  if (!S.waiting) S.time += dt * S.speed;
  const now = S.time;

  // practice: stop at the first note still to play
  if (S.kind === 'practice') {
    while (S.pi < S.notes.length && S.notes[S.pi].hit) S.pi++;
    const next = S.notes[S.pi];
    if (next && now >= next.t) { S.time = next.t; S.waiting = true; }
    else if (S.waiting && (!next || next.t > S.time)) S.waiting = false;
  }

  // listen + test autoplay: the piano plays every note on time
  if (S.kind === 'listen' || hooks.autoplay) {
    for (let i = S.mi; i < S.notes.length && S.notes[i].t <= S.time; i++) {
      const n = S.notes[i];
      if (n.hit || n.missed) continue;
      press(n.midi, 0.6);
      if (S.kind === 'listen') { n.hit = true; S.hits++; }
      autoUp.push({ midi: n.midi, at: n.t + Math.max(0.12, n.dur * 0.92) });
    }
  }
  for (let i = autoUp.length - 1; i >= 0; i--) {
    if (S.time >= autoUp[i].at) { release(autoUp[i].midi); autoUp.splice(i, 1); }
  }

  // long notes: points while the key stays down
  for (let i = S.mi; i < S.notes.length && S.notes[i].t <= now; i++) {
    const n = S.notes[i];
    if (!n.holding) continue;
    const end = n.t + n.dur;
    if (down.has(n.midi) && now < end) continue;
    n.holding = false;
    const held = Math.min(now, end) - n.t;
    if (S.kind === 'play' && held > 0.2) {
      const pts = M.holdPoints(held, S.combo);
      S.score += pts;
      if (held >= n.dur * 0.85) pop(laneX(n.midi, view.w), view.hitY - 62, t('hold') + ' +' + pts, '#ffd27a', 12);
    }
  }

  // misses
  if (S.kind === 'play') {
    for (let i = S.mi; i < S.notes.length; i++) {
      const n = S.notes[i];
      if (n.t > now - M.WIN_GOOD) break;
      if (n.hit || n.missed) continue;
      n.missed = true;
      S.misses++;
      S.combo = 0;
      if (!S.band) A.piano(n.midi, 0.12).release(A.now() + 0.3);
      pop(laneX(n.midi, view.w), view.hitY - 28, 'MISS', 'rgba(255,255,255,0.45)', 12);
    }
  }
  while (S.mi < S.notes.length && (S.notes[S.mi].hit || S.notes[S.mi].missed) && !S.notes[S.mi].holding && S.notes[S.mi].t < now - 1) S.mi++;

  scheduleBand();
  guideKeys(now);
  if (now > S.length + 1.2 && !autoUp.length) finish();
  syncHud();
}

/** Hands the next ~0.2 s of band events to the audio clock. */
function scheduleBand() {
  const horizon = S.time + 0.22 * S.speed;
  const ok = S.band && !S.waiting && A.running();
  while (S.bi < S.backing.length && S.backing[S.bi].t < horizon) {
    const e = S.backing[S.bi++];
    if (ok && e.t >= S.time - 0.03) A.instrument(e.inst, e.midi, A.now() + (e.t - S.time) / S.speed, e.dur / S.speed, e.vel);
  }
  while (S.di < S.drums.length && S.drums[S.di].t < horizon) {
    const e = S.drums[S.di++];
    if (ok && e.t >= S.time - 0.03) A.drum(e.drum, A.now() + (e.t - S.time) / S.speed, e.vel);
  }
}

let guideCache = '';
/** Lights the keys of the notes about to arrive. */
function guideKeys(now) {
  if (S.kind === 'listen') return;
  const next = new Set();
  for (let i = S.mi; i < S.notes.length; i++) {
    const n = S.notes[i];
    if (n.t > now + 0.45) break;
    if (!n.hit && !n.missed) next.add(n.midi);
  }
  const key = [...next].sort().join(',');
  if (key === guideCache) return;
  guideCache = key;
  for (const [midi, el] of keyEls) el.classList.toggle('next', next.has(midi));
}

function finish() {
  releaseAll();
  clearFx();
  for (const el of keyEls.values()) el.classList.remove('next');
  const e = S.entry;
  if (S.kind === 'listen') { S.mode = 'menu'; ui.hud.classList.add('hidden'); openDetail(e); return; }
  S.mode = 'results';
  ui.hud.classList.add('hidden');
  const acc = S.kind === 'practice'
    ? Math.round((S.hits / Math.max(1, S.hits + S.wrong)) * 100)
    : M.accuracy(S.hits, S.misses);
  const stars = S.kind === 'play' ? M.starsFor(acc) : 0;
  let isBest = false;
  if (S.kind === 'play') {
    const rec = save.records[e.id] || { score: 0, stars: 0, acc: 0, plays: 0 };
    isBest = S.score > rec.score;
    save.records[e.id] = { score: Math.max(rec.score, S.score), stars: Math.max(rec.stars, stars), acc: Math.max(rec.acc, acc), plays: rec.plays + 1 };
    persist();
  }
  A.blip(880, 0.15); setTimeout(() => A.blip(1175, 0.2), 120);
  ui.rTitle.textContent = titleOf(e);
  ui.rNew.classList.toggle('hidden', !isBest);
  ui.rStars.textContent = S.kind === 'play' ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
  ui.rGrade.textContent = S.kind === 'play' ? M.gradeFor(acc, S.perfect / Math.max(1, S.hits)) : '✓';
  ui.rScore.textContent = S.kind === 'play' ? S.score.toLocaleString() : acc + '%';
  const rows = S.kind === 'play'
    ? [[t('accuracy'), acc + '%'], [t('maxCombo'), S.maxCombo], [t('best'), (save.records[e.id]?.score || 0).toLocaleString()], [t('perfect'), S.perfect], [t('good'), S.good], [t('miss'), S.misses]]
    : [[t('practiceDone'), '✓'], [t('wrong'), S.wrong], [t('accuracy'), acc + '%']];
  ui.rGrid.innerHTML = '';
  for (const [k, v] of rows) {
    const d = document.createElement('div');
    d.innerHTML = '<span class="lbl"></span><b></b>';
    d.firstChild.textContent = k;
    d.lastChild.textContent = v;
    ui.rGrid.appendChild(d);
  }
  ui.results.classList.remove('hidden');
  hooks.lastResult = { kind: S.kind, score: S.score, acc, stars, hits: S.hits, misses: S.misses };
}

/* ---------------- effects ---------------- */

function burst(x, y, color, n, spd) {
  for (let i = 0; i < n; i++) {
    fx.parts.push({ x, y, vx: (Math.random() - 0.5) * spd, vy: -Math.random() * spd * 0.8 - 30, life: 1, decay: 1.8 + Math.random(), size: 1.6 + Math.random() * 2.2, color });
  }
  if (fx.parts.length > 220) fx.parts.splice(0, fx.parts.length - 220);
}
function ring(x, y, color) { fx.rings.push({ x, y, r: 6, life: 1, color }); }
function pop(x, y, txt, color, size) {
  fx.pops.push({ x: clamp(x, 44, view.w - 44), y, txt, color, size, life: 1 });
  if (fx.pops.length > 14) fx.pops.shift();
}
function updateFx(dt) {
  for (let i = fx.parts.length - 1; i >= 0; i--) {
    const p = fx.parts[i];
    p.life -= p.decay * dt;
    if (p.life <= 0) { fx.parts.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 240 * dt;
  }
  for (let i = fx.rings.length - 1; i >= 0; i--) {
    const r = fx.rings[i];
    r.life -= dt * 2.6; r.r += 90 * dt;
    if (r.life <= 0) fx.rings.splice(i, 1);
  }
  for (let i = fx.pops.length - 1; i >= 0; i--) {
    fx.pops[i].life -= dt * 1.2;
    if (fx.pops[i].life <= 0) fx.pops.splice(i, 1);
  }
}

/* ---------------- rendering ---------------- */

function roundRect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function render() {
  const W = view.w, H = view.h;
  if (!W || !H) return;
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  const g0 = ctx.createLinearGradient(0, 0, 0, H);
  g0.addColorStop(0, '#0a0812');
  g0.addColorStop(1, '#151024');
  ctx.fillStyle = g0;
  ctx.fillRect(0, 0, W, H);
  for (const midi of layout.white) {
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(laneX(midi, W) - laneW(midi, W) / 2, 0, laneW(midi, W), H);
  }
  for (const { midi } of layout.black) {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(laneX(midi, W) - laneW(midi, W) / 2, 0, laneW(midi, W), H);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.045)';
  for (let i = 0; i <= layout.whiteCount; i++) ctx.fillRect(Math.round(i * W / layout.whiteCount), 0, 1, H);

  const playing = S.mode === 'play' || S.mode === 'paused';
  const now = playing ? songNow() : 0;
  const lineY = view.hitY;

  // bar lines falling with the music
  if (playing && S.entry) {
    ctx.fillStyle = 'rgba(232,193,90,0.08)';
    for (const b of S.bars) {
      const y = lineY - (b - now) * view.pps;
      if (y < -2) break;
      if (y <= lineY) ctx.fillRect(0, y, W, 1);
    }
  }

  // gold line, pulsing on the beat
  let pulse = 0;
  if (playing && S.bars.length > 1) {
    let i = 0;
    while (i + 1 < S.bars.length && S.bars[i + 1] <= now) i++;
    const barLen = (S.bars[i + 1] ?? S.bars[i] + 2) - S.bars[i];
    const beat = barLen / ((S.entry?.def?.sig) || 4);
    const frac = (((now - S.bars[i]) / beat) % 1 + 1) % 1;
    pulse = now > 0 ? Math.max(0, 1 - frac * 3.2) : 0;
  }
  const glowH = 26 + pulse * 16;
  const gl = ctx.createLinearGradient(0, lineY - glowH, 0, lineY);
  gl.addColorStop(0, 'rgba(232,193,90,0)');
  gl.addColorStop(1, `rgba(232,193,90,${(0.1 + pulse * 0.14).toFixed(3)})`);
  ctx.fillStyle = gl;
  ctx.fillRect(0, lineY - glowH, W, glowH);
  ctx.fillStyle = '#e8c15a';
  ctx.fillRect(0, lineY - 1.5, W, 3 + pulse * 1.5);

  // tiles
  if (playing && S.entry) {
    const labels = save.settings.labels;
    for (let i = S.mi; i < S.notes.length; i++) {
      const n = S.notes[i];
      const bottom = lineY - (n.t - now) * view.pps;
      if (bottom < -4) break;
      const fullH = Math.max(18, n.dur * view.pps - 3);
      let top = bottom - fullH;
      if (top > H) continue;
      let bot = bottom;
      const x = laneX(n.midi, W), w = laneW(n.midi, W);
      const black = M.isBlackKey(n.midi);
      const soon = !n.hit && !n.missed && n.t - now < 0.25;
      let alpha = 1;
      if (n.hit) {
        if (n.holding || (n.dur >= 0.45 && now < n.t + n.dur)) bot = Math.min(bot, lineY);
        else alpha = Math.max(0, 1 - (now - n.t) / 0.22);
        if (bot - top < 2 || alpha <= 0) continue;
      } else if (n.missed) alpha = 0.3;
      ctx.globalAlpha = alpha;
      const g = ctx.createLinearGradient(0, top, 0, bot);
      if (n.hit && n.holding) { g.addColorStop(0, '#fff3c8'); g.addColorStop(1, '#ffd36b'); }
      else if (black) { g.addColorStop(0, soon ? '#7a62c8' : '#4b3d78'); g.addColorStop(1, '#2a2148'); }
      else { g.addColorStop(0, soon ? '#fff3c8' : '#f3e6c4'); g.addColorStop(1, '#d6c290'); }
      ctx.fillStyle = g;
      roundRect(x - w / 2, top, w, bot - top, 5);
      ctx.fill();
      if (!n.hit) {
        ctx.fillStyle = soon ? '#ffe08a' : black ? 'rgba(201,184,255,0.7)' : 'rgba(184,145,47,0.85)';
        ctx.fillRect(x - w / 2 + 2, bot - 4, w - 4, 3);
        if (labels !== 'off' && w >= 15 && bot - top >= 16) {
          ctx.fillStyle = black ? 'rgba(235,228,255,0.9)' : 'rgba(60,44,12,0.8)';
          ctx.font = `800 ${Math.min(12, w * 0.42)}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(M.midiName(n.midi, labels).replace(/-?\d+$/, ''), x, bot - 13);
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  // pressed-key glow
  for (const midi of down.keys()) {
    const x = laneX(midi, W), w = laneW(midi, W);
    const g = ctx.createLinearGradient(0, lineY - 90, 0, lineY);
    g.addColorStop(0, 'rgba(232,193,90,0)');
    g.addColorStop(1, 'rgba(232,193,90,0.3)');
    ctx.fillStyle = g;
    ctx.fillRect(x - w / 2, lineY - 90, w, 90);
  }

  // practice: "waiting" hint
  if (S.mode === 'play' && S.waiting) {
    ctx.fillStyle = 'rgba(159,224,143,0.85)';
    ctx.font = '800 13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▼', laneX(S.notes[S.pi]?.midi ?? 60, W), lineY - 26 - pulse * 4);
  }

  for (const r of fx.rings) {
    ctx.strokeStyle = r.color;
    ctx.globalAlpha = r.life * 0.6;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'lighter';
  for (const p of fx.parts) {
    ctx.globalAlpha = clamp(p.life, 0, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.4, p.size * p.life), 0, TAU); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const p of fx.pops) {
    const a = clamp(p.life, 0, 1);
    const y = p.y - (1 - a) * 30;
    ctx.font = `800 ${p.size}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.globalAlpha = a;
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(5,4,10,0.65)';
    ctx.strokeText(p.txt, p.x, y);
    ctx.fillStyle = p.color;
    ctx.fillText(p.txt, p.x, y);
  }
  ctx.globalAlpha = 1;
}

/* ---------------- HUD ---------------- */

const hud = { score: -1, combo: '', acc: '', prog: -1 };
function syncHud(force) {
  if (force || hud.score !== S.score) { hud.score = S.score; ui.score.textContent = S.kind === 'play' ? S.score.toLocaleString() : '—'; }
  const c = S.kind === 'play' && S.combo >= 10 ? '×' + M.multiplier(S.combo) : '';
  if (c !== hud.combo) { hud.combo = c; ui.combo.textContent = c; ui.combo.classList.toggle('hidden', !c); }
  const total = S.hits + S.misses;
  const acc = S.kind === 'play' && total ? M.accuracy(S.hits, S.misses) + '%' : '—';
  if (acc !== hud.acc) { hud.acc = acc; ui.acc.textContent = acc; }
  const prog = S.entry && S.length ? clamp(S.time / S.length, 0, 1) : 0;
  if (force || Math.abs(prog - hud.prog) > 0.003) { hud.prog = prog; ui.progress.style.width = (prog * 100).toFixed(1) + '%'; }
}

/* ---------------- menus ---------------- */

function hideOverlays() {
  for (const el of [ui.menu, ui.detail, ui.settings, ui.paused, ui.results]) el.classList.add('hidden');
}

let toastTimer = 0;
function toast(msg, ms = 2400) {
  ui.toast.textContent = msg;
  ui.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.add('hidden'), ms);
}

function setMidiStatus(text, kind) {
  ui.midiStatus.textContent = text || '';
  ui.midiStatus.className = 'midi-status' + (kind ? ' ' + kind : '');
}

function starsText(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }

function buildTabs() {
  ui.tabs.innerHTML = '';
  const cats = ['all', ...CATEGORIES, ...(midiEntries.length ? ['midi'] : [])];
  if (!cats.includes(save.cat)) save.cat = 'all';
  for (const c of cats) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab' + (c === save.cat ? ' active' : '');
    b.textContent = c === 'all' ? t('all') : t('cat.' + c);
    b.addEventListener('click', () => { A.blip(620); save.cat = c; persist(); buildTabs(); buildList(); });
    ui.tabs.appendChild(b);
  }
}

const DIFF_RANK = { easy: 0, medium: 1, hard: 2 };
function visibleEntries() {
  const q = ui.search.value.trim().toLowerCase();
  return allEntries()
    .filter((e) => save.cat === 'all' || e.cat === save.cat)
    .filter((e) => {
      if (!q) return true;
      const titles = typeof e.title === 'object' ? Object.values(e.title).join(' ') : e.title;
      return `${titles} ${e.by}`.toLowerCase().includes(q);
    })
    .sort((a, b) => (save.cat === 'all' ? CATEGORIES.indexOf(a.cat) - CATEGORIES.indexOf(b.cat) : 0)
      || DIFF_RANK[a.diff] - DIFF_RANK[b.diff] || titleOf(a).localeCompare(titleOf(b)));
}

function buildList() {
  ui.list.innerHTML = '';
  const list = visibleEntries();
  if (!list.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = t('noResults');
    ui.list.appendChild(p);
  }
  for (const e of list) {
    const rec = save.records[e.id];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'song-card cat-' + e.cat;
    b.dataset.id = e.id;
    b.innerHTML = '<span class="sc-main"><span class="sc-title"></span><span class="sc-by"></span></span><span class="sc-side"><span class="diff"></span><span class="sc-stars"></span></span>';
    b.querySelector('.sc-title').textContent = titleOf(e);
    b.querySelector('.sc-by').textContent = e.cat === 'pop' ? e.by.replace('Piano Fall · ', '') : e.by;
    const d = b.querySelector('.diff');
    d.className = 'diff ' + e.diff;
    d.textContent = t('diff.' + e.diff);
    b.querySelector('.sc-stars').textContent = rec ? starsText(rec.stars || 0) : M.makeLayout(e.keys).total > 17 ? M.makeLayout(e.keys).total + ' ' + t('keys') : '';
    b.addEventListener('click', () => { A.unlock(); A.blip(660); openDetail(e); });
    ui.list.appendChild(b);
  }
  const stars = Object.values(save.records).reduce((a, r) => a + (r.stars || 0), 0);
  ui.starsTotal.textContent = `★ ${stars} / ${ENTRIES.length * 3}`;
}

function gotoMenu() {
  S.mode = 'menu';
  S.entry = null;
  releaseAll();
  clearFx();
  hideOverlays();
  ui.hud.classList.add('hidden');
  ui.menu.classList.remove('hidden');
  buildTabs();
  buildList();
}

function segmented(container, options, value, onPick) {
  container.innerHTML = '';
  for (const [val, label] of options) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'seg-btn' + (String(val) === String(value) ? ' active' : '');
    b.textContent = label;
    b.setAttribute('aria-pressed', String(val) === String(value));
    b.addEventListener('click', () => { A.blip(620); onPick(val); });
    container.appendChild(b);
  }
}

function openDetail(e) {
  selected = e;
  hideOverlays();
  ui.detail.classList.remove('hidden');
  ui.dCat.textContent = t('cat.' + e.cat);
  ui.dTitle.textContent = titleOf(e);
  ui.dBy.textContent = e.by;
  const rec = save.records[e.id];
  const secs = Math.round(e.build.length);
  ui.dMeta.innerHTML = '';
  const chips = [
    [t('diff.' + e.diff), 'diff ' + e.diff],
    [M.makeLayout(e.keys).total + ' ' + t('keys'), 'chip'],
    [Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'), 'chip'],
    [rec ? starsText(rec.stars || 0) + ' · ' + rec.score.toLocaleString() : starsText(0), 'chip stars'],
  ];
  for (const [txt, cls] of chips) {
    const s = document.createElement('span');
    s.className = cls;
    s.textContent = txt;
    ui.dMeta.appendChild(s);
  }
  ui.btnDelete.classList.toggle('hidden', !e.isMidi);
  renderDetailOptions();
}

function renderDetailOptions() {
  ui.modes.innerHTML = '';
  for (const [kind, icon] of [['play', '🎯'], ['practice', '🐢'], ['listen', '🎧']]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mode-btn' + (save.settings.mode === kind ? ' active' : '');
    b.innerHTML = '<span class="mi"></span><b></b><small></small>';
    b.querySelector('.mi').textContent = icon;
    b.querySelector('b').textContent = t(kind);
    b.querySelector('small').textContent = t(kind + 'Hint');
    b.addEventListener('click', () => { A.blip(620); save.settings.mode = kind; persist(); renderDetailOptions(); });
    ui.modes.appendChild(b);
  }
  segmented(ui.speeds, [[0.5, '50%'], [0.75, '75%'], [1, '100%'], [1.25, '125%']], save.settings.speed, (v) => { save.settings.speed = Number(v); persist(); renderDetailOptions(); });
  segmented(ui.band, [[true, t('on')], [false, t('off')]], save.settings.band, (v) => { save.settings.band = v === true || v === 'true'; persist(); renderDetailOptions(); });
  ui.btnStart.textContent = '▶  ' + t('start');
}

function openSettings() {
  hideOverlays();
  ui.settings.classList.remove('hidden');
  renderSettings();
}

function renderSettings() {
  ui.sizes.innerHTML = '';
  const choices = ['auto', ...M.KEY_SIZES];
  for (const c of choices) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'size-chip' + (String(save.settings.keys) === String(c) ? ' active' : '');
    if (c === 'auto') b.innerHTML = '<b>A</b><small></small><em>17–37</em>';
    else {
      const l = M.makeLayout(c);
      b.innerHTML = `<b>${l.total}</b><small></small><em>${M.midiName(l.min)}–${M.midiName(l.max)}</em>`;
    }
    b.querySelector('small').textContent = c === 'auto' ? t('auto') : t('keys');
    b.addEventListener('click', () => { A.blip(620); save.settings.keys = c; persist(); renderSettings(); if (S.mode === 'menu') setLayout(layoutFor(null)); });
    ui.sizes.appendChild(b);
  }
  ui.sizeNote.textContent = t('autoHint');
  const relabel = (k, v) => { save.settings[k] = v; persist(); buildKeys(); renderSettings(); };
  segmented(ui.labelsSeg, [['off', t('labelsOff')], ['abc', t('labelsAbc')], ['doremi', t('labelsDoremi')]], save.settings.labels, (v) => relabel('labels', v));
  segmented(ui.hintsSeg, [[true, t('on')], [false, t('off')]], save.settings.hints, (v) => relabel('hints', v === true || v === 'true'));
  segmented(ui.midiMode, [['melody', t('midiMelody')], ['all', t('midiAll')]], save.settings.midiMode, (v) => {
    save.settings.midiMode = v; persist();
    midiEntries = midiEntries.map((e) => midiEntry(e.raw));
    renderSettings();
  });
  segmented(ui.langSeg, [['it', 'Italiano'], ['en', 'English']], i18n.getLang(), (v) => i18n.setLang(v));
  ui.volume.value = Math.round(save.settings.backing * 100);
}

/* ---------------- MIDI files ---------------- */

async function handleMidiFile(file) {
  if (!file) return;
  ui.midiFile.value = '';
  A.unlock();
  if (file.size > MAX_MIDI_BYTES) { setMidiStatus(t('tooLarge'), 'error'); return; }
  try {
    const parsed = parseMidi(await file.arrayBuffer(), file.name);
    const name = parsed.name;
    const existing = midiEntries.find((e) => e.raw.name.toLowerCase() === name.toLowerCase());
    const raw = {
      id: existing ? existing.raw.id : 'midi-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      name, bpm: parsed.bpm, savedAt: Date.now(),
      notes: parsed.notes.map((n) => ({ midi: n.midi, t: n.t, dur: n.dur })),
    };
    midiEntries = [midiEntry(raw), ...midiEntries.filter((e) => e !== existing)].slice(0, MAX_MIDI_SONGS);
    const persisted = saveMidiLibrary();
    setMidiStatus(t('loaded', { name, n: raw.notes.length }) + (persisted ? '' : ' · session'), 'ok');
    save.cat = 'midi';
    persist();
    buildTabs();
    buildList();
    openDetail(midiEntries[0]);
  } catch (err) {
    setMidiStatus(err && err.message ? err.message : 'MIDI?', 'error');
  }
}

function deleteMidi(e) {
  if (!window.confirm(t('remove', { name: e.raw.name }))) return;
  midiEntries = midiEntries.filter((x) => x !== e);
  delete save.records[e.id];
  persist();
  saveMidiLibrary();
  gotoMenu();
}

/* ---------------- Web MIDI keyboards ---------------- */

let midiAccess = null;
function foldToLayout(note) {
  let n = note;
  while (n < layout.min) n += 12;
  while (n > layout.max) n -= 12;
  return n;
}
async function connectMidiInput() {
  if (!navigator.requestMIDIAccess) { ui.midiInStatus.textContent = t('midiUnsupported'); return; }
  try {
    midiAccess = midiAccess || await navigator.requestMIDIAccess();
    const bind = () => {
      const names = [];
      for (const input of midiAccess.inputs.values()) {
        names.push(input.name);
        input.onmidimessage = (msg) => {
          const [st, note, vel] = msg.data;
          const cmd = st & 0xf0;
          if (cmd === 0x90 && vel > 0) { A.unlock(); press(foldToLayout(note), 0.25 + (vel / 127) * 0.7); }
          else if (cmd === 0x80 || (cmd === 0x90 && vel === 0)) release(foldToLayout(note));
        };
      }
      ui.midiInStatus.textContent = names.length ? t('midiReady', { name: names.join(', ') }) : t('midiNone');
    };
    bind();
    midiAccess.onstatechange = bind;
  } catch (e) {
    ui.midiInStatus.textContent = t('midiNone');
  }
}

/* ---------------- pause ---------------- */

function pause() {
  if (S.mode !== 'play') return;
  S.mode = 'paused';
  releaseAll();
  A.suspend();
  ui.paused.classList.remove('hidden');
}
function resume() {
  if (S.mode !== 'paused') return;
  S.mode = 'play';
  clockLast = null;
  A.unlock();
  ui.paused.classList.add('hidden');
}

/* ---------------- input ---------------- */

const pointers = new Map();   // pointerId → midi
function keyAt(x, y) {
  const el = document.elementFromPoint(x, y);
  const k = el && el.closest && el.closest('.key');
  return k ? Number(k.dataset.midi) : null;
}

function setupInput() {
  ui.keys.addEventListener('pointerdown', (e) => {
    const midi = keyAt(e.clientX, e.clientY);
    if (midi == null) return;
    e.preventDefault();
    try { ui.keys.releasePointerCapture(e.pointerId); } catch (err) { /* not captured */ }
    A.unlock();
    pointers.set(e.pointerId, midi);
    press(midi);
  });
  ui.keys.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const midi = keyAt(e.clientX, e.clientY);
    const was = pointers.get(e.pointerId);
    if (midi == null || midi === was) return;
    release(was);
    pointers.set(e.pointerId, midi);
    press(midi);
  });
  const up = (e) => {
    if (!pointers.has(e.pointerId)) return;
    release(pointers.get(e.pointerId));
    pointers.delete(e.pointerId);
  };
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  ui.keys.addEventListener('contextmenu', (e) => e.preventDefault());

  const held = new Set();
  window.addEventListener('keydown', (e) => {
    if (e.target === ui.search) return;
    if (e.code === 'Escape') {
      if (!ui.settings.classList.contains('hidden')) closeSettings();
      else if (!ui.detail.classList.contains('hidden')) gotoMenu();
      else if (S.mode === 'play') pause();
      else if (S.mode === 'paused') resume();
      return;
    }
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    const midi = keyMap.get(e.code);
    if (midi === undefined || held.has(e.code)) return;
    if (S.mode !== 'play' && !ui.menu.classList.contains('hidden')) return;
    e.preventDefault();
    held.add(e.code);
    A.unlock();
    press(midi);
  });
  window.addEventListener('keyup', (e) => {
    if (!held.has(e.code)) return;
    held.delete(e.code);
    const midi = keyMap.get(e.code);
    if (midi !== undefined) release(midi);
  });
  window.addEventListener('blur', () => { held.clear(); releaseAll(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') pause(); });
  for (const type of ['pointerdown', 'touchend', 'keydown']) document.addEventListener(type, () => A.unlock(), { capture: true, passive: true });
}

function closeSettings() {
  ui.settings.classList.add('hidden');
  if (selected && settingsFrom === 'detail') openDetail(selected);
  else gotoMenu();
}
let settingsFrom = 'menu';

function syncSound() {
  const on = A.audioState.enabled;
  for (const b of [ui.btnSound, ui.btnSoundMenu]) {
    b.textContent = on ? '🔊' : '🔇';
    b.setAttribute('aria-pressed', on);
    b.setAttribute('aria-label', on ? 'Mute' : 'Sound on');
  }
}

function setupButtons() {
  ui.search.addEventListener('input', buildList);
  ui.btnFreestyle.addEventListener('click', startFree);
  ui.btnMidi.addEventListener('click', () => { A.unlock(); ui.midiFile.click(); });
  ui.midiFile.addEventListener('change', () => handleMidiFile(ui.midiFile.files && ui.midiFile.files[0]));
  ui.btnSettings.addEventListener('click', () => { settingsFrom = 'menu'; openSettings(); });
  ui.btnSettingsClose.addEventListener('click', closeSettings);
  ui.btnStart.addEventListener('click', () => selected && startSong(selected));
  ui.btnDetailBack.addEventListener('click', gotoMenu);
  ui.btnPause.addEventListener('click', () => (S.mode === 'play' ? pause() : resume()));
  ui.btnResume.addEventListener('click', resume);
  ui.btnQuit.addEventListener('click', gotoMenu);
  ui.btnRetry.addEventListener('click', () => (S.entry ? startSong(S.entry, S.kind) : gotoMenu()));
  ui.btnMenu.addEventListener('click', gotoMenu);
  ui.btnNext.addEventListener('click', () => {
    const list = visibleEntries();
    const i = list.findIndex((e) => e === S.entry);
    openDetail(list[(i + 1) % list.length] || list[0]);
  });
  ui.btnMidiIn.addEventListener('click', connectMidiInput);
  ui.volume.addEventListener('input', () => { A.setBackingVolume(ui.volume.value / 100); save.settings.backing = ui.volume.value / 100; persist(); });
  const toggleSound = () => {
    A.audioState.enabled = !A.audioState.enabled;
    save.settings.sound = A.audioState.enabled;
    persist();
    syncSound();
    if (A.audioState.enabled) { A.unlock(); A.blip(660); }
  };
  ui.btnSound.addEventListener('click', toggleSound);
  ui.btnSoundMenu.addEventListener('click', toggleSound);
  ui.btnLang.addEventListener('click', () => i18n.setLang(i18n.getLang() === 'it' ? 'en' : 'it'));
  ui.btnDelete.addEventListener('click', () => selected?.isMidi && deleteMidi(selected));
  syncSound();
}

function applyLang() {
  document.documentElement.lang = i18n.getLang();
  i18n.apply();
  ui.search.placeholder = t('search');
  ui.btnLang.textContent = i18n.getLang().toUpperCase();
  if (!ui.menu.classList.contains('hidden')) { buildTabs(); buildList(); }
  if (!ui.detail.classList.contains('hidden') && selected) openDetail(selected);
  if (!ui.settings.classList.contains('hidden')) renderSettings();
}

function checkOrientation() {
  const portrait = window.innerHeight > window.innerWidth;
  const touch = window.matchMedia('(pointer: coarse)').matches;
  ui.rotate.classList.toggle('hidden', !(portrait && touch));
}

/* ---------------- loop & boot ---------------- */

let lastTs = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016);
  lastTs = ts;
  updateFx(dt);
  if (S.mode === 'play') update(clockDelta());
  render();
  requestAnimationFrame(frame);
}

/* Test hooks (Playwright): fast-forward the song clock and auto-play notes. */
const hooks = {
  autoplay: false,
  lastResult: null,
  get state() { return S; },
  get layout() { return layout; },
  audio: () => A.context()?.state || 'none',
  songs: () => allEntries().map((e) => ({ id: e.id, cat: e.cat, diff: e.diff, keys: M.makeLayout(e.keys).total, notes: e.build.notes.length })),
  start(id, kind = 'play') { const e = findEntry(id); if (e) startSong(e, kind); return !!e; },
  ff(seconds) {
    const step = 1 / 60;
    for (let s = 0; s < seconds && S.mode === 'play'; s += step) { update(step); clockLast = null; }
    render();
  },
  press, release,
};
window.__piano = hooks;

function boot() {
  resize();
  setLayout(layoutFor(null));
  window.addEventListener('resize', () => { resize(); checkOrientation(); });
  window.addEventListener('orientationchange', () => setTimeout(() => { resize(); checkOrientation(); }, 250));
  checkOrientation();
  setupInput();
  setupButtons();
  i18n.onChange(applyLang);
  applyLang();
  gotoMenu();
  registerSW('./sw.js');
  document.documentElement.dataset.ready = '1';
  requestAnimationFrame((ts) => { lastTs = ts; requestAnimationFrame(frame); });
}

boot();
