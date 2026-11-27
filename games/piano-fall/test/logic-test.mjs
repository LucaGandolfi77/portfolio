/* Piano Fall — logic tests (node games/piano-fall/test/logic-test.mjs) */
import { readFileSync, readdirSync } from 'node:fs';
import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import * as M from '../js/music.js';
import { backingFor, STYLE_NAMES } from '../js/backing.js';
import { SONGS, CATEGORIES } from '../js/songs.js';
import { STRINGS } from '../js/strings.js';
import { parseMidi } from '../js/midi.js';

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

run('note names → MIDI numbers', () => {
  eq(M.noteToMidi('C4'), 60); eq(M.noteToMidi('A4'), 69); eq(M.noteToMidi('F#3'), 54); eq(M.noteToMidi('Bb4'), 70);
  eq(M.midiName(61), 'C#4'); eq(M.midiName(67, 'doremi'), 'Sol');
});

run('lengths: decimals and fractions', () => {
  eq(M.parseLen('2', 1), 2); eq(M.parseLen('.5', 1), 0.5); near(M.parseLen('2/3', 1), 2 / 3); eq(M.parseLen(undefined, 0.5), 0.5);
});

run('melody notation: rests, chords, bars', () => {
  const m = M.parseMelody('C4 E4:2 | r:.5 G4+B4:1.5', 1);
  eq(m.beats, 5);
  eq(m.notes.length, 4);
  eq(m.notes[2].beat, 3.5); eq(m.notes[3].beat, 3.5); eq(m.notes[3].midi, 71);
});

run('chords: qualities and slash bass', () => {
  const c = M.parseChord('F#m7/C#');
  eq(c.root, 6); eq(c.bass, 1); eq(c.tones.join(), '0,3,7,10');
  const seq = M.parseChords('Am F:2 G:2 -', 4);
  eq(seq.beats, 12); eq(seq.chords[3].chord, null);
});

run('swing moves only straight off-beats', () => {
  near(M.swingBeat(1.5, 0.66), 1.66); eq(M.swingBeat(2, 0.66), 2); eq(M.swingBeat(1.25, 0.66), 1.25);
});

run('form tempo marks speed parts up', () => {
  const def = { id: 't', bpm: 60, parts: { A: { m: 'C4 C4 C4 C4', c: 'C' } }, form: 'A A@2' };
  const b = M.buildSong(def);
  near(b.length, 4 + 2); near(b.notes[5].t, 4.5);
});

run('the library: 50+ songs, unique ids, every category filled', () => {
  ok(SONGS.length >= 50, `only ${SONGS.length} songs`);
  eq(new Set(SONGS.map((s) => s.id)).size, SONGS.length, 'duplicate id');
  for (const c of CATEGORIES) ok(SONGS.some((s) => s.cat === c), `empty category ${c}`);
  ok(SONGS.filter((s) => s.cat === 'pop').length >= 15, 'fewer than 15 original pop songs');
});

run('every part: melody and chords have the same length', () => {
  for (const s of SONGS) {
    const bad = M.partMismatches(s);
    ok(!bad.length, `${s.id}: ${JSON.stringify(bad)}`);
  }
});

run('every song builds, has a backing band and fits a 37-key keyboard', () => {
  for (const s of SONGS) {
    const b = M.buildSong(s);
    ok(b.notes.length >= 20, `${s.id}: ${b.notes.length} notes`);
    ok(b.length > 10 && b.length < 150, `${s.id}: ${b.length.toFixed(0)} s`);
    ok(b.backing.length + b.drums.length > 0, `${s.id}: silent band`);
    ok(STYLE_NAMES.includes(s.style), `${s.id}: unknown style ${s.style}`);
    eq(M.fitNotes(b.notes, M.makeLayout(M.keysNeeded(b.notes))).dropped, 0, `${s.id} dropped notes`);
    for (const n of b.notes) ok(n.dur > 0 && n.t >= 0, `${s.id}: bad note`);
    ok(typeof s.title === 'string' || (s.title.it && s.title.en), `${s.id}: title`);
  }
});

run('most songs fit the default 17-key keyboard', () => {
  const small = SONGS.filter((s) => M.keysNeeded(M.buildSong(s).notes) === 10).length;
  ok(small / SONGS.length > 0.7, `${small}/${SONGS.length}`);
});

run('every style plays something in 4/4 and 3/4', () => {
  const chords = M.parseChords('C Am', 4).chords;
  const waltz = M.parseChords('C Am', 3).chords;
  for (const st of STYLE_NAMES) {
    if (st === 'none') continue;
    ok(backingFor(st, chords, 4).length > 0, `${st} 4/4`);
    ok(backingFor(st, waltz, 3).length > 0, `${st} 3/4`);
  }
});

run('backing never spills past its chord', () => {
  for (const st of STYLE_NAMES) {
    for (const e of backingFor(st, M.parseChords('C:2 G:2', 4).chords, 4)) ok(e.beat < 4 && e.beat >= 0, `${st} at ${e.beat}`);
  }
});

run('fitting: octave shift and smallest keyboard', () => {
  const notes = [{ midi: 84, t: 0 }, { midi: 86, t: 1 }];
  const f = M.fitNotes(notes, M.makeLayout(10));
  eq(f.shift, -12); eq(f.dropped, 0);
  eq(M.keysNeeded([{ midi: 60 }, { midi: 79 }]), 12);
});

run('difficulty separates nursery rhymes from virtuoso pieces', () => {
  const diff = (id) => M.difficultyOf(M.buildSong(SONGS.find((s) => s.id === id)).notes);
  eq(diff('twinkle'), 'easy'); eq(diff('william-tell'), 'hard'); eq(diff('elise'), 'hard');
});

run('judging, combo and scoring', () => {
  eq(M.judge(0.05), 'perfect'); eq(M.judge(-0.12), 'good'); eq(M.judge(0.3), null);
  eq(M.multiplier(0), 1); eq(M.multiplier(25), 3); eq(M.multiplier(99), 4);
  eq(M.hitPoints('perfect', 10), 200); eq(M.hitPoints('good', 0), 60);
  eq(M.holdPoints(1, 0), 50); eq(M.holdPoints(-1, 5), 0);
  eq(M.accuracy(9, 1), 90); eq(M.accuracy(0, 0), 100);
  eq(M.starsFor(96), 3); eq(M.starsFor(85), 2); eq(M.starsFor(61), 1); eq(M.starsFor(10), 0);
  eq(M.gradeFor(100, 0.9), 'S'); eq(M.gradeFor(93, 0.2), 'A'); eq(M.gradeFor(50, 0), 'D');
});

run('MIDI split: the top line is yours, the rest is backing', () => {
  const notes = [
    { midi: 48, t: 0, dur: 1 }, { midi: 72, t: 0.01, dur: 0.5 }, { midi: 55, t: 0, dur: 1 },
    { midi: 74, t: 0.5, dur: 0.5 }, { midi: 67, t: 0.52, dur: 0.1 }, { midi: 76, t: 0.55, dur: 0.1 },
  ];
  const { melody, backing } = M.splitMelody(notes);
  eq(melody.map((n) => n.midi).join(), '72,74');
  eq(backing.length, 4);   // 76 comes 50 ms after 74: an ornament, left to the band
});

run('MIDI parser reads a generated file', () => {
  const vlq = (n) => { const b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; };
  const ev = [];
  [60, 62, 64].forEach((m, i) => { ev.push([i * 480, [0x90, m, 100]], [i * 480 + 400, [0x80, m, 0]]); });
  ev.push([0, [0x99, 36, 100]], [100, [0x89, 36, 0]]);   // drums: ignored
  ev.sort((a, b) => a[0] - b[0]);
  const data = [0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20];
  let last = 0;
  for (const [tick, bytes] of ev) { data.push(...vlq(tick - last), ...bytes); last = tick; }
  data.push(0x00, 0xff, 0x2f, 0x00);
  const file = new Uint8Array([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0,
    0x4d, 0x54, 0x72, 0x6b, 0, 0, (data.length >> 8) & 255, data.length & 255, ...data]);
  const p = parseMidi(file.buffer, 'Scala.mid');
  eq(p.notes.length, 3); eq(p.name, 'Scala'); near(p.bpm, 120, 0.01); near(p.notes[1].t, 0.5, 0.001);
});

run('Italian and English strings match', () => {
  const keys = (o, pre = '') => Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v, pre + k + '.') : [pre + k])).sort();
  eq(keys(STRINGS.it).join(), keys(STRINGS.en).join());
});

run('the service worker precaches every module', () => {
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  for (const f of readdirSync(new URL('../js/', import.meta.url))) ok(sw.includes(`./js/${f}`), `sw misses ${f}`);
});

summary(passed, total);
