/* ============================================================
   Piano Fall — music core (pure: no DOM, no audio)
   ------------------------------------------------------------
   · a tiny text notation for melodies and chords
   · song builder: parts + form → timed notes, backing, bar lines
   · keyboard layouts, octave fitting, difficulty, judging, grades
   Imported by the browser app and by test/logic-test.mjs.
   ============================================================ */
import { backingFor } from './backing.js';

/* ---------------- notes ---------------- */

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export const NAMES_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NAMES_IT = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

/** "C4" → 60, "F#3" → 54, "Bb4" → 70 */
export function noteToMidi(name) {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!m) throw new Error(`bad note "${name}"`);
  return 12 * (Number(m[3]) + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}

export function midiName(midi, style = 'abc') {
  const pc = ((midi % 12) + 12) % 12;
  const names = style === 'doremi' ? NAMES_IT : NAMES_EN;
  return names[pc] + (style === 'doremi' ? '' : Math.floor(midi / 12) - 1);
}

export function isBlackKey(midi) {
  return [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);
}

/** "2" → 2, ".5" → 0.5, "2/3" → 0.666… */
export function parseLen(text, fallback) {
  if (text === undefined || text === '') return fallback;
  let v;
  if (text.includes('/')) {
    const [a, b] = text.split('/');
    v = (a === '' ? 1 : Number(a)) / Number(b);
  } else v = Number(text);
  if (!(v > 0) || !Number.isFinite(v)) throw new Error(`bad length "${text}"`);
  return v;
}

/**
 * Melody notation, one token per event, bars ("|") are only for the eye:
 *   E4        a note of `unit` beats      E4:2   two beats     E4:1/3  a triplet
 *   r  r:2    rests                       C4+E4+G4:4         a chord
 */
export function parseMelody(text, unit = 1) {
  const notes = [];
  let beat = 0;
  for (const tok of String(text).trim().split(/\s+/)) {
    if (!tok || tok === '|') continue;
    const [head, lenText] = tok.split(':');
    const len = parseLen(lenText, unit);
    if (head !== 'r') {
      for (const n of head.split('+')) notes.push({ midi: noteToMidi(n), beat, len });
    }
    beat += len;
  }
  return { notes, beats: beat };
}

/* ---------------- chords ---------------- */

const QUALITY = {
  '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10],
  dim: [0, 3, 6], dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10], aug: [0, 4, 8],
  sus2: [0, 2, 7], sus4: [0, 5, 7], 6: [0, 4, 7, 9], m6: [0, 3, 7, 9],
  9: [0, 4, 7, 10, 14], add9: [0, 4, 7, 14], m9: [0, 3, 7, 10, 14],
};

/** "F#m7/C#" → { root: 6, tones: [0,3,7,10], bass: 1, name } */
export function parseChord(name) {
  const m = /^([A-G])(#|b)?([a-z0-9]*)(?:\/([A-G])(#|b)?)?$/.exec(name);
  if (!m || !(m[3] in QUALITY)) throw new Error(`bad chord "${name}"`);
  const acc = (s) => (s === '#' ? 1 : s === 'b' ? -1 : 0);
  const root = (PC[m[1]] + acc(m[2]) + 12) % 12;
  const bass = m[4] ? (PC[m[4]] + acc(m[5]) + 12) % 12 : root;
  return { root, tones: QUALITY[m[3]], bass, name };
}

/** "Am F C:2 G:2 -" — a chord lasts one bar (`sig` beats) unless told; "-" is no chord. */
export function parseChords(text, sig = 4) {
  const chords = [];
  let beat = 0;
  for (const tok of String(text || '').trim().split(/\s+/)) {
    if (!tok || tok === '|') continue;
    const [head, lenText] = tok.split(':');
    const len = parseLen(lenText, sig);
    chords.push({ beat, len, chord: head === '-' ? null : parseChord(head) });
    beat += len;
  }
  return { chords, beats: beat };
}

/* ---------------- songs ---------------- */

const EPS = 1e-6;

/** Moves straight 8th off-beats to the swung position (0.5 → swing). */
export function swingBeat(beat, swing) {
  if (!swing || swing === 0.5) return beat;
  const whole = Math.floor(beat + EPS);
  const frac = beat - whole;
  return Math.abs(frac - 0.5) < 1e-4 ? whole + swing : beat;
}

/** Splits "A A@1.2 B" into [{ part:'A', tempo:1 }, { part:'A', tempo:1.2 }, …] */
export function parseForm(form) {
  return String(form).trim().split(/\s+/).filter(Boolean).map((tok) => {
    const [part, tempo] = tok.split('@');
    return { part, tempo: tempo ? Number(tempo) : 1 };
  });
}

/**
 * Builds a playable timeline from a song definition:
 *   { bpm, sig, u, swing, style, parts: { A: { m, c, u?, style? } }, form }
 * or a legacy one: { bpm, notes: [[midi, beat, len?], …] }.
 * Times are in seconds at 100 % speed.
 */
export function buildSong(def) {
  const sig = def.sig || 4;
  const notes = [];
  const backing = [];
  const drums = [];
  const bars = [];
  let t0 = 0;

  if (Array.isArray(def.notes)) {
    const spb = 60 / def.bpm;
    const last = def.notes.reduce((a, n) => Math.max(a, n[1] + (n[2] || 1)), 0);
    const beats = Math.ceil(last / sig - EPS) * sig;
    for (let r = 0; r < (def.repeat || 1); r++) {
      for (const [midi, beat, len] of def.notes) notes.push({ midi, t: t0 + beat * spb, dur: (len || 0.9) * spb });
      for (let b = 0; b < beats - EPS; b += sig) bars.push(t0 + b * spb);
      if (def.chords) {
        const { chords } = parseChords(def.chords, sig);
        pushBacking(backingFor(def.style || 'none', chords, sig), t0, spb, backing, drums, def.swing);
      }
      t0 += beats * spb;
    }
  } else {
    for (const { part, tempo } of parseForm(def.form)) {
      const p = def.parts[part];
      if (!p) throw new Error(`song "${def.id}": unknown part "${part}"`);
      const spb = 60 / (def.bpm * tempo);
      const mel = parseMelody(p.m || '', p.u ?? def.u ?? 1);
      const ch = parseChords(p.c || '', sig);
      const swing = p.swing ?? def.swing;
      const beats = Math.max(mel.beats, ch.beats);
      for (const n of mel.notes) {
        notes.push({ midi: n.midi, t: t0 + swingBeat(n.beat, swing) * spb, dur: n.len * spb });
      }
      for (let b = 0; b < beats - EPS; b += sig) bars.push(t0 + b * spb);
      pushBacking(backingFor(p.style || def.style || 'none', ch.chords, sig), t0, spb, backing, drums, swing);
      t0 += beats * spb;
    }
  }
  notes.sort((a, b) => a.t - b.t || a.midi - b.midi);
  backing.sort((a, b) => a.t - b.t);
  drums.sort((a, b) => a.t - b.t);
  return { notes, backing, drums, bars, length: t0 };
}

function pushBacking(events, t0, spb, backing, drums, swing) {
  for (const e of events) {
    const t = t0 + swingBeat(e.beat, swing) * spb;
    if (e.drum) drums.push({ t, drum: e.drum, vel: e.vel ?? 1 });
    else backing.push({ t, inst: e.inst, midi: e.midi, dur: e.len * spb, vel: e.vel ?? 1 });
  }
}

/** Per-part length check used by the tests: melody and chords must line up. */
export function partMismatches(def) {
  if (!def.parts) return [];
  const sig = def.sig || 4;
  const out = [];
  for (const [name, p] of Object.entries(def.parts)) {
    if (!p.m || !p.c) continue;
    const a = parseMelody(p.m, p.u ?? def.u ?? 1).beats;
    const b = parseChords(p.c, sig).beats;
    if (Math.abs(a - b) > 1e-3) out.push({ part: name, melody: a, chords: b });
  }
  return out;
}

/* ---------------- keyboard layouts ---------------- */

export const BASE_MIDI = 60;                       // C4
export const KEY_SIZES = [10, 12, 15, 17, 22];     // white keys → 17/20/25/29/37 keys
const WHITE_STEPS = [0, 2, 4, 5, 7, 9, 11];

export function makeLayout(whiteCount, base = BASE_MIDI) {
  const white = [];
  for (let i = 0; i < whiteCount; i++) white.push(base + Math.floor(i / 7) * 12 + WHITE_STEPS[i % 7]);
  const black = [];
  for (let i = 0; i < whiteCount - 1; i++) {
    if (white[i + 1] - white[i] === 2) black.push({ midi: white[i] + 1, b: i + 1 });
  }
  return { white, black, whiteCount, total: white.length + black.length, min: white[0], max: white[white.length - 1] };
}

/** Best whole-octave shift so that as many notes as possible land on the keyboard. */
export function fitNotes(notes, layout) {
  let best = { shift: 0, count: -1 };
  for (let oct = -4; oct <= 4; oct++) {
    const shift = oct * 12;
    let count = 0;
    for (const n of notes) if (n.midi + shift >= layout.min && n.midi + shift <= layout.max) count++;
    if (count > best.count || (count === best.count && Math.abs(shift) < Math.abs(best.shift))) best = { shift, count };
  }
  const kept = [];
  for (const n of notes) {
    const midi = n.midi + best.shift;
    if (midi >= layout.min && midi <= layout.max) kept.push({ ...n, midi });
  }
  return { notes: kept, dropped: notes.length - kept.length, shift: best.shift };
}

/** Smallest keyboard (white-key count) that plays every note; the largest if none does. */
export function keysNeeded(notes) {
  for (const w of KEY_SIZES) if (fitNotes(notes, makeLayout(w)).dropped === 0) return w;
  return KEY_SIZES[KEY_SIZES.length - 1];
}

/* ---------------- difficulty ---------------- */

/** 0 … ~10: note rate, leaps, black keys and chords all make a song harder. */
export function difficultyScore(notes) {
  if (notes.length < 2) return 0;
  const span = Math.max(1, notes[notes.length - 1].t - notes[0].t);
  const rate = notes.length / span;
  let leaps = 0, black = 0, chords = 0, fast = 0;
  for (let i = 0; i < notes.length; i++) {
    if (isBlackKey(notes[i].midi)) black++;
    if (i) {
      leaps += Math.min(12, Math.abs(notes[i].midi - notes[i - 1].midi));
      const gap = notes[i].t - notes[i - 1].t;
      if (gap < 0.02) chords++;
      else if (gap < 0.2) fast++;
    }
  }
  const n = notes.length;
  return rate * 1.15 + (leaps / n) * 0.35 + (black / n) * 2 + (chords / n) * 3 + (fast / n) * 3;
}

export function difficultyOf(notes) {
  const s = difficultyScore(notes);
  return s < 3.2 ? 'easy' : s < 5 ? 'medium' : 'hard';
}

/* ---------------- judging & scoring ---------------- */

export const WIN_PERFECT = 0.07;
export const WIN_GOOD = 0.16;

export function judge(dt) {
  const a = Math.abs(dt);
  return a <= WIN_PERFECT ? 'perfect' : a <= WIN_GOOD ? 'good' : null;
}

export function multiplier(combo) {
  return Math.min(4, 1 + Math.floor(combo / 10));
}

export function hitPoints(kind, combo) {
  return (kind === 'perfect' ? 100 : 60) * multiplier(combo);
}

/** Bonus for holding a long note: up to 50 points per second, times the combo multiplier. */
export function holdPoints(heldSeconds, combo) {
  return Math.round(Math.max(0, heldSeconds) * 50 * multiplier(combo));
}

export function accuracy(hits, misses) {
  const total = hits + misses;
  return total ? Math.round((hits / total) * 100) : 100;
}

export function starsFor(acc) {
  return acc >= 95 ? 3 : acc >= 80 ? 2 : acc >= 60 ? 1 : 0;
}

export function gradeFor(acc, perfectShare) {
  if (acc >= 98 && perfectShare >= 0.85) return 'S';
  return acc >= 92 ? 'A' : acc >= 80 ? 'B' : acc >= 65 ? 'C' : 'D';
}

/* ---------------- MIDI import ---------------- */

/**
 * Splits a full MIDI arrangement into the line you play and the rest.
 * At every onset (notes within `window` s) the highest note is the melody
 * ("skyline"); notes closer than `minGap` to the previous melody note,
 * and everything else, become backing played by the synth.
 */
export function splitMelody(notes, { window = 0.035, minGap = 0.09 } = {}) {
  const sorted = [...notes].sort((a, b) => a.t - b.t || b.midi - a.midi);
  const melody = [];
  const backing = [];
  for (let i = 0; i < sorted.length;) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1].t - sorted[i].t <= window) j++;
    let top = i;
    for (let k = i; k <= j; k++) if (sorted[k].midi > sorted[top].midi) top = k;
    for (let k = i; k <= j; k++) {
      const prev = melody[melody.length - 1];
      if (k === top && (!prev || sorted[k].t - prev.t >= minGap)) melody.push(sorted[k]);
      else backing.push(sorted[k]);
    }
    i = j + 1;
  }
  return { melody, backing };
}
