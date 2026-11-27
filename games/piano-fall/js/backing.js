/* ============================================================
   Piano Fall — backing band (pure)
   ------------------------------------------------------------
   Turns a chord timeline into bass, chords, arpeggios and drums
   for one of ~25 styles. Events are in beats, relative to the
   part; the synth plays them under the melody you perform.
   A pattern is written for a 4-beat bar; other metres use their
   own pattern or a generic oom-pah.
   ============================================================ */

const E8 = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5];
const S16 = Array.from({ length: 16 }, (_, i) => i / 4);
const at = (positions, len, extra = {}) => positions.map((p) => [p, len, extra]);

/* bass: [pos, len, degree] — r root (or slash bass), o octave, 5 fifth, 3 third, 6 sixth */
/* chord/arp/drum entries likewise; vel scales each layer. */
const STYLES = {
  none: {},

  pop: {
    bass: { inst: 'bass', hits: [[0, 1.4], [1.5, 0.45], [2, 1.4], [3.5, 0.45]] },
    chord: { inst: 'ep', hits: [[0, 1.9], [2, 1.9]], vel: 0.42 },
    drums: { k: [0, 2, 2.5], s: [1, 3], h: E8 },
  },
  kpop: {
    bass: { inst: 'bass', hits: at([0, 0.75, 1.5, 2, 2.75, 3.5], 0.45) },
    chord: { inst: 'pluck', hits: at([0, 1, 2, 3], 0.45), vel: 0.4 },
    pad: { inst: 'pad', vel: 0.22 },
    drums: { k: [0, 1.5, 2, 2.75], c: [1, 3], h: S16, hv: 0.22 },
  },
  rock: {
    bass: { inst: 'bass', hits: at(E8, 0.45) },
    chord: { inst: 'gtr', hits: at(E8, 0.42), power: true, vel: 0.36 },
    drums: { k: [0, 1.5, 2, 2.5], s: [1, 3], h: E8 },
  },
  edm: {
    bass: { inst: 'bass', hits: at([0.5, 1.5, 2.5, 3.5], 0.38) },
    pad: { inst: 'pad', vel: 0.3 },
    chord: { inst: 'pluck', hits: at([0.5, 1.5, 2.5, 3.5], 0.25), vel: 0.28 },
    drums: { k: [0, 1, 2, 3], c: [1, 3], oh: [0.5, 1.5, 2.5, 3.5] },
  },
  edmBuild: {
    pad: { inst: 'pad', vel: 0.34 },
    drums: { k: [0, 1, 2, 3], s: E8, sv: 0.5 },
  },
  synthwave: {
    bass: { inst: 'bass', hits: at(E8, 0.42), octaves: true },
    pad: { inst: 'pad', vel: 0.34 },
    drums: { k: [0, 2], s: [1, 3], h: E8 },
  },
  futurebass: {
    bass: { inst: 'sub', hits: [[0, 2], [2.5, 1.4]] },
    chord: { inst: 'saw', hits: [[0, 0.45], [0.75, 0.45], [1.5, 0.9], [2.5, 0.45], [3, 0.9]], vel: 0.3 },
    drums: { k: [0, 2.5], c: [2], h: E8, hv: 0.3 },
  },
  lofi: {
    bass: { inst: 'bass', hits: [[0, 1.4], [2.5, 1.2]] },
    chord: { inst: 'ep', hits: [[0, 3.8]], vel: 0.4 },
    drums: { k: [0, 2.5], s: [1, 3], sv: 0.55, h: E8, hv: 0.28 },
  },
  reggaeton: {
    bass: { inst: 'bass', hits: [[0, 0.7], [0.75, 0.7], [1.5, 0.45], [2, 0.7], [2.75, 0.7], [3.5, 0.45]] },
    chord: { inst: 'pluck', hits: at([0, 0.75, 1.5, 2, 2.75, 3.5], 0.3), vel: 0.32 },
    drums: { k: [0, 1, 2, 3], s: [0.75, 1.5, 2.75, 3.5], sv: 0.7, h: E8, hv: 0.25 },
  },
  trap: {
    bass: { inst: 'sub', hits: [[0, 1.7], [2.5, 1.4]] },
    pad: { inst: 'pad', vel: 0.24 },
    drums: { k: [0, 2.5, 3.25], c: [2], h: S16, hv: 0.26, roll: true },
  },
  afro: {
    bass: { inst: 'bass', hits: [[0, 0.7], [1, 0.45], [2, 0.7], [3, 0.45], [3.5, 0.45]] },
    chord: { inst: 'pluck', hits: at([0.5, 1.5, 2.5, 3.5], 0.35), vel: 0.34 },
    drums: { k: [0, 1.5, 2, 3.5], rim: [0.75, 1.75, 2.75], c: [3], sh: S16 },
  },
  amapiano: {
    bass: { inst: 'log', hits: [[0, 0.45], [1.75, 0.45], [2.5, 0.45], [3.25, 0.45]] },
    chord: { inst: 'ep', hits: [[0.5, 1.4], [2.5, 1.4]], vel: 0.36 },
    drums: { k: [0, 1, 2, 3], kv: 0.6, c: [3], sh: S16, rim: [1.5, 3.75] },
  },
  disco: {
    bass: { inst: 'bass', hits: at(E8, 0.42), octaves: true },
    pad: { inst: 'str', vel: 0.24 },
    chord: { inst: 'ep', hits: [[1.5, 0.3], [3.5, 0.3]], vel: 0.36 },
    drums: { k: [0, 1, 2, 3], s: [1, 3], oh: [0.5, 1.5, 2.5, 3.5] },
  },
  chip: {
    bass: { inst: 'sq', hits: [[0, 0.45, 'r'], [0.5, 0.45, 'o'], [1, 0.45, '5'], [1.5, 0.45, 'o'], [2, 0.45, 'r'], [2.5, 0.45, 'o'], [3, 0.45, '5'], [3.5, 0.45, 'o']] },
    drums: { k: [0, 2], s: [1, 3], h: E8, hv: 0.3 },
  },
  swing: {
    bass: { inst: 'bass', hits: [[0, 0.95, 'r'], [1, 0.95, '3'], [2, 0.95, '5'], [3, 0.95, '6']] },
    chord: { inst: 'ep', hits: [[1.5, 0.45], [3.5, 0.45]], vel: 0.34 },
    drums: { ride: [0, 1, 1.5, 2, 3, 3.5], h: [1, 3], hv: 0.3, k: [0], kv: 0.3 },
  },
  stride: {
    bass: { inst: 'keys', hits: [[0, 0.9, 'r'], [2, 0.9, '5']], low: 36, vel: 0.7 },
    chord: { inst: 'keys', hits: [[1, 0.45], [3, 0.45]], vel: 0.32, low: 53 },
  },
  march: {
    bass: { inst: 'bass', hits: [[0, 0.9, 'r'], [2, 0.9, '5']] },
    chord: { inst: 'keys', hits: [[1, 0.45], [3, 0.45]], vel: 0.3, low: 53 },
    drums: { s: [0, 2], sv: 0.25 },
  },
  gallop: {
    bass: { inst: 'bass', hits: [[0, 0.45, 'r'], [1, 0.45, '5'], [2, 0.45, 'r'], [3, 0.45, '5']] },
    chord: { inst: 'keys', hits: at([0.5, 1.5, 2.5, 3.5], 0.35), vel: 0.3, low: 53 },
  },
  habanera: {
    bass: { inst: 'bass', hits: [[0, 0.7, 'r'], [0.75, 0.25, '5'], [1, 0.45, 'r'], [1.5, 0.45, '5'], [2, 0.7, 'r'], [2.75, 0.25, '5'], [3, 0.45, 'r'], [3.5, 0.45, '5']] },
    chord: { inst: 'str', hits: [[0, 1.9], [2, 1.9]], vel: 0.22 },
  },
  folk: {
    bass: { inst: 'bass', hits: [[0, 0.9, 'r'], [2, 0.9, '5']] },
    chord: { inst: 'gtrc', hits: [[0, 0.9], [1, 0.4], [1.5, 0.4], [2, 0.9], [3, 0.4], [3.5, 0.4]], vel: 0.3 },
  },
  jingle: {
    bass: { inst: 'bass', hits: [[0, 0.9, 'r'], [2, 0.9, '5']] },
    chord: { inst: 'gtrc', hits: [[0, 0.9], [1, 0.4], [2, 0.9], [3, 0.4]], vel: 0.28 },
    drums: { sh: E8, k: [0, 2], kv: 0.45 },
  },
  strings: {
    pad: { inst: 'str', vel: 0.3 },
    bass: { inst: 'bass', hits: at([0, 1, 2, 3], 0.4), vel: 0.6 },
  },
  hymn: {
    pad: { inst: 'organ', vel: 0.24 },
    bass: { inst: 'bass', hits: [[0, 3.9]], vel: 0.5 },
  },
  ballad: {
    bass: { inst: 'keys', hits: [[0, 3.9]], low: 36, vel: 0.5 },
    arp: { inst: 'keys', step: 0.5, order: [0, 1, 2, 3, 2, 1, 2, 1], vel: 0.3 },
  },
  alberti: {
    arp: { inst: 'keys', step: 0.5, order: [0, 2, 1, 2], triad: true, vel: 0.3 },
  },
  arp: {
    arp: { inst: 'keys', step: 1, order: [0, 1, 2], low: 45, vel: 0.34 },
  },
  bassonly: {
    bass: { inst: 'keys', hits: [[0, 3.9]], low: 43, vel: 0.45 },
  },
};

/* Patterns for other metres: 3 = waltz, 2 = march, 6 = compound 6/8 (beats are 8ths). */
const METRE = {
  3: { bass: [[0, 0.95, 'r']], chord: [[1, 0.6], [2, 0.6]], arp: [0, 1, 2, 3, 2, 1], drums: { k: [0], h: [1, 2] } },
  2: { bass: [[0, 0.9, 'r']], chord: [[1, 0.45]], arp: [0, 1, 2, 3], drums: { k: [0], h: [0.5, 1, 1.5] } },
  6: { bass: [[0, 2.5, 'r'], [3, 2.5, '5']], chord: [[1, 0.8], [2, 0.8], [4, 0.8], [5, 0.8]], arp: [0, 1, 2, 3, 2, 1], drums: { k: [0, 3], h: [0, 1, 2, 3, 4, 5] } },
};

export const STYLE_NAMES = Object.keys(STYLES);

/** Chord voicing: tones stacked above the root, placed in the octave starting at `low`. */
function voicing(chord, low) {
  const root = low + ((chord.root - low) % 12 + 12) % 12;
  return chord.tones.map((t) => root + t);
}

function bassNote(chord, degree, low = 36) {
  const base = low + ((chord.bass - low) % 12 + 12) % 12;
  const third = chord.tones[1] ?? 4;
  switch (degree) {
    case 'o': return base + 12;
    case '5': return base + 7;
    case '3': return base + third;
    case '6': return base + (third === 3 ? 10 : 9);
    default: return base;
  }
}

function arpTones(chord, low, triad) {
  const v = voicing(chord, low);
  if (triad) return [v[0], v[1], v[2]];
  return [v[0], v[0] + 7, v[0] + 12, v[0] + 12 + (chord.tones[1] ?? 4)];
}

/**
 * @param style  style name
 * @param chords [{ beat, len, chord|null }]
 * @param sig    beats per bar
 * @returns [{ beat, len, inst, midi, vel } | { beat, drum, vel }]
 */
export function backingFor(styleName, chords, sig = 4) {
  const st = STYLES[styleName] || STYLES.none;
  const metre = sig === 4 ? null : METRE[sig] || METRE[3];
  const out = [];
  for (const seg of chords) {
    if (!seg.chord) continue;
    for (let bar = 0; bar < seg.len - 1e-6; bar += sig) {
      const room = Math.min(sig, seg.len - bar);
      const base = seg.beat + bar;
      const emit = (pos, len, data) => {
        if (pos < room - 1e-6) out.push({ beat: base + pos, len: Math.min(len, room - pos), ...data });
      };

      if (st.pad) {
        for (const midi of voicing(seg.chord, st.pad.low || 55)) emit(0, room * 0.98, { inst: st.pad.inst, midi, vel: st.pad.vel });
      }

      if (st.bass) {
        const hits = metre ? metre.bass : st.bass.hits;
        hits.forEach(([pos, len, deg], i) => {
          let degree = deg || 'r';
          if (st.bass.octaves && !deg) degree = i % 2 ? 'o' : 'r';
          const l = metre && st.bass.hits.length === 1 ? room * 0.97 : len;
          emit(pos, l, { inst: st.bass.inst, midi: bassNote(seg.chord, degree, st.bass.low || 36), vel: st.bass.vel ?? 0.8 });
        });
      }

      if (st.chord) {
        const hits = metre ? metre.chord : st.chord.hits;
        const low = st.chord.low || 55;
        const notes = st.chord.power
          ? [bassNote(seg.chord, 'r', 48), bassNote(seg.chord, '5', 48), bassNote(seg.chord, 'r', 48) + 12]
          : voicing(seg.chord, low);
        for (const [pos, len] of hits) for (const midi of notes) emit(pos, len, { inst: st.chord.inst, midi, vel: st.chord.vel ?? 0.4 });
      }

      if (st.arp) {
        const tones = arpTones(seg.chord, st.arp.low || 48, st.arp.triad);
        const order = metre ? metre.arp : st.arp.order;
        const step = metre ? (sig === 6 ? 1 : 0.5) : st.arp.step;
        let i = 0;
        for (let pos = 0; pos < room - 1e-6; pos += step, i++) {
          emit(pos, step * 1.6, { inst: st.arp.inst, midi: tones[order[i % order.length] % tones.length], vel: st.arp.vel });
        }
      }

      if (st.drums) {
        const d = metre ? { ...metre.drums, kv: st.drums.kv, hv: st.drums.hv } : st.drums;
        const lanes = [['k', d.kv ?? 1], ['s', d.sv ?? 0.8], ['c', 0.75], ['h', d.hv ?? 0.4], ['oh', 0.45], ['sh', 0.3], ['rim', 0.5], ['ride', 0.4]];
        for (const [kind, vel] of lanes) for (const pos of d[kind] || []) emit(pos, 0, { drum: kind, vel: kind === 's' && st === STYLES.edmBuild ? 0.35 + pos * 0.12 : vel });
        if (d.roll && Math.round(seg.beat + bar) % (sig * 2) === sig) {
          for (let p = 3; p < 4 - 1e-6; p += 1 / 6) emit(p, 0, { drum: 'h', vel: 0.3 });
        }
      }
    }
  }
  return out;
}
