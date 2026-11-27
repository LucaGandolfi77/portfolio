/* ============================================================
   Piano Fall — song library
   ------------------------------------------------------------
   Only two kinds of music live here:
   · original songs written for Piano Fall, in today's pop styles
     (synthwave, reggaeton, lo-fi, trap, K-pop, afrobeats, house…)
   · public-domain melodies: folk songs, carols and classical
     pieces whose composers died long ago.
   Copyrighted hits are NOT transcribed: load their MIDI file
   instead (Menu → Load MIDI).

   Notation (see music.js): "E4:2" = E4 for two beats, "r" = rest,
   "C4+E4" = chord, "|" only for reading. Chords last a bar unless
   given a length ("Am:2"). Every part's melody and chords must have
   the same length: the tests check it.
   ============================================================ */

export const CATEGORIES = ['pop', 'classic', 'trad', 'xmas', 'jazz'];

export const SONGS = [
  /* =================== ORIGINAL POP =================== */
  {
    id: 'neon-mezzanotte', cat: 'pop', title: { it: 'Neon Mezzanotte', en: 'Neon Midnight' },
    by: 'Piano Fall · synthwave', bpm: 108, style: 'synthwave',
    parts: {
      V: { m: 'A4 C5:.5 A4:.5 G4:1.5 E4:.5 | F4 A4:.5 F4:.5 E4:2 | E4 G4:.5 E4:.5 C5:1.5 B4:.5 | B4 A4 G4:2', c: 'Am F C G' },
      W: { m: 'A4 C5:.5 A4:.5 G4:1.5 E4:.5 | F4 A4:.5 C5:.5 D5:2 | E5:1.5 D5:.5 C5 B4 | C5:2 B4:2', c: 'Am F C G' },
      C: { m: 'C5:.5 C5:.5 C5:.5 D5:.5 E5:1.5 D5:.5 | D5:.5 D5:.5 D5:.5 E5:.5 D5 B4 | B4:.5 B4:.5 C5:.5 B4:.5 G4:1.5 E4:.5 | A4:3 r', c: 'F G Em Am' },
      D: { m: 'C5:.5 C5:.5 C5:.5 D5:.5 E5:1.5 D5:.5 | D5:.5 D5:.5 D5:.5 E5:.5 D5 B4 | B4:.5 B4:.5 C5:.5 B4:.5 G4:1.5 E4:.5 | A4:2 C5:.5 B4:.5 A4', c: 'F G Em Am' },
    },
    form: 'V W C D W C D',
  },
  {
    id: 'estate-riccione', cat: 'pop', title: { it: 'Estate a Riccione', en: 'Summer by the Sea' },
    by: 'Piano Fall · reggaeton', bpm: 94, style: 'reggaeton',
    parts: {
      V: { m: 'D5:.75 D5:.75 C5:.5 A4:.5 A4:.5 F4 | D5:.75 D5:.75 C5:.5 Bb4:.5 A4:.5 F4 | C5:.75 C5:.75 A4:.5 C5:.5 D5:.5 C5 | C5:.75 G4:.75 E4:.5 G4:2', c: 'Dm Bb F C' },
      C: { m: 'F4:.5 A4:.5 D5 D5:.5 E5:.5 D5 | D5:.5 C5:.5 Bb4 A4:.5 Bb4:.5 A4 | C5:.5 A4:.5 F4 F4:.5 G4:.5 A4 | G4:1.5 E4:.5 C4:2', c: 'Dm Bb F C' },
    },
    form: 'V V C C V C C',
  },
  {
    id: 'pioggia-lofi', cat: 'pop', title: { it: 'Pioggia Lo-Fi', en: 'Lo-Fi Rain' },
    by: 'Piano Fall · lo-fi', bpm: 78, swing: 0.62, style: 'lofi',
    parts: {
      A: { m: 'A4:1.5 G4:.5 E4 C4 | D4:.5 E4:.5 G4:2 r | F4:1.5 E4:.5 D4 A4 | B4:.5 G4:2.5 r', c: 'Fmaj7 Em7 Dm7 Cmaj7' },
      B: { m: 'C5:1.5 B4:.5 A4 E4 | D5:.5 B4:.5 G4:2 E4 | F4:.5 A4:.5 C5:1.5 A4:.5 F4 | E4:2 D4 C4', c: 'Fmaj7 Em7 Dm7 Cmaj7' },
    },
    form: 'A B A B',
  },
  {
    id: 'cuore-aereo', cat: 'pop', title: { it: 'Cuore in modalità aereo', en: 'Heart in Airplane Mode' },
    by: 'Piano Fall · pop ballad', bpm: 72, style: 'pop',
    parts: {
      V: { m: 'G4:.5 E4:.5 E4 E4:.5 D4:.5 C4 | D4:.5 G4:.5 G4 F4:.5 E4:.5 D4 | C4:.5 E4:.5 E4 D4:.5 C4:.5 E4 | F4:1.5 E4:.5 D4 C4', c: 'C G Am F' },
      C: { m: 'C5:1.5 B4:.5 C5 G4 | B4:1.5 A4:.5 B4 D5 | C5:1.5 B4:.5 A4 E4 | F4:.5 A4:.5 C5 D5 C5', c: 'C G Am F' },
      D: { m: 'C5:1.5 B4:.5 C5 G4 | B4:1.5 A4:.5 B4 D5 | C5:1.5 B4:.5 A4 E4 | A4 B4 C5:2', c: 'C G Am F:2 G:2' },
    },
    form: 'V V C D V C D',
  },
  {
    id: 'drop-mezzanotte', cat: 'pop', title: { it: 'Drop di Mezzanotte', en: 'Midnight Drop' },
    by: 'Piano Fall · house / EDM', bpm: 124, style: 'edm',
    parts: {
      B: { style: 'edmBuild', m: 'E4:.5 E4:.5 B4:.5 E4:.5 E4:.5 B4:.5 E4:.5 B4:.5 | C4:.5 C4:.5 G4:.5 C4:.5 C4:.5 G4:.5 C4:.5 G4:.5 | D4:.5 D4:.5 B4:.5 D4:.5 D4:.5 B4:.5 D4:.5 B4:.5 | D4:.5 D4:.5 A4:.5 D4:.5 D4:.5 A4:.5 F#4:.5 A4:.5', c: 'Em C G D' },
      D: { m: 'B4:.5 B4:.5 r:.5 B4:.5 r:.5 A4:.5 G4:.5 E4:.5 | G4:.5 G4:.5 r:.5 G4:.5 r:.5 A4:.5 G4:.5 E4:.5 | D5:.5 D5:.5 r:.5 D5:.5 r:.5 C5:.5 B4:.5 G4:.5 | A4:.5 A4:.5 r:.5 F#4:.5 r:.5 A4:.5 B4:.5 A4:.5', c: 'Em C G D' },
    },
    form: 'B D D B D D',
  },
  {
    id: 'vespa-rossa', cat: 'pop', title: { it: 'Vespa Rossa', en: 'Red Scooter' },
    by: 'Piano Fall · indie pop', bpm: 116, style: 'pop',
    parts: {
      V: { m: 'F#4:.5 F#4:.5 F#4:.5 A4:.5 A4 F#4 | E4:.5 E4:.5 E4:.5 A4:.5 A4 C#5 | D5:.5 C#5:.5 B4 F#4 D4 | D4:.5 E4:.5 G4 B4 A4', c: 'D A Bm G' },
      C: { m: 'A4 D5:1.5 C#5:.5 D5 | E5:1.5 C#5:.5 A4 E4 | D5 B4:.5 C#5:.5 D5 F#4 | G4:1.5 A4:.5 B4 A4', c: 'D A Bm G' },
    },
    form: 'V V C C V C C',
  },
  {
    id: 'glitter', cat: 'pop', title: 'Glitter',
    by: 'Piano Fall · nu-disco', bpm: 118, style: 'disco',
    parts: {
      A: { m: 'A4:.5 C5:.5 r:.5 A4:.5 r:.5 C5:.5 D5 | B4:.5 D5:.5 r:.5 B4:.5 r:.5 G4:.5 F4 | E4:.5 G4:.5 r:.5 B4:.5 r:.5 C5:.5 E5 | D5:.5 C5:.5 A4:.5 G4:.5 E4:2', c: 'Dm7 G7 Cmaj7 Am7' },
      B: { m: 'F4:2 E4 D4 | D4 F4 G4:2 | E4:1.5 G4:.5 B4:2 | A4:2 r:2', c: 'Dm7 G7 Cmaj7 Am7' },
    },
    form: 'A A B A A',
  },
  {
    id: 'trap-lunedi', cat: 'pop', title: { it: 'Trap del Lunedì', en: 'Monday Trap' },
    by: 'Piano Fall · trap', bpm: 140, style: 'trap',
    parts: {
      A: { m: 'G4:2/3 G4:2/3 G4:2/3 Eb4 C4 | Ab4:2/3 Ab4:2/3 Ab4:2/3 G4 Eb4 | F4:2/3 F4:2/3 Ab4:2/3 C5 Bb4:.5 Ab4:.5 | G4:2 r D4:.5 Eb4:.5', c: 'Cm Ab Fm G' },
      B: { m: 'C5:2/3 C5:2/3 C5:2/3 Bb4 G4 | Eb5:2/3 Eb5:2/3 C5:2/3 Ab4 C5 | Ab4:2/3 Ab4:2/3 F4:2/3 C5:2 | B4 D5 G4:2', c: 'Cm Ab Fm G' },
    },
    form: 'A B A B',
  },
  {
    id: 'fiori-seoul', cat: 'pop', title: { it: 'Fiori di Seoul', en: 'Seoul Blossoms' },
    by: 'Piano Fall · K-pop', bpm: 128, style: 'kpop',
    parts: {
      V: { m: 'B4:.5 B4:.5 D5:.5 B4:.5 A4:.5 F#4:.5 A4 | G4:.5 G4:.5 B4:.5 G4:.5 F#4:.5 D4:.5 E4 | F#4:.5 A4:.5 D5 C#5:.5 D5:.5 E5 | C#5:2 r A4:.5 B4:.5', c: 'Bm G D A' },
      C: { m: 'D5:.5 D5:.5 D5:.5 C#5:.5 B4 F#4 | B4:.5 B4:.5 B4:.5 A4:.5 G4 D4 | D4:.5 F#4:.5 A4:.5 D5:.5 E5:.5 D5:.5 C#5:.5 A4:.5 | A4:1.5 B4:.5 C#5 E5', c: 'Bm G D A' },
    },
    form: 'V V C C V C C',
  },
  {
    id: 'sole-lagos', cat: 'pop', title: { it: 'Sole di Lagos', en: 'Lagos Sun' },
    by: 'Piano Fall · afrobeats', bpm: 104, style: 'afro',
    parts: {
      V: { m: 'E4:.75 G4:.75 A4:.5 C5 A4 | D4:.75 F4:.75 A4:.5 C5 A4 | B4:.75 A4:.75 G4:.5 D4 G4 | E4:.75 D4:.75 C4:.5 E4:2', c: 'Am7 Dm7 G C' },
      C: { m: 'C5:.5 C5:.5 r:.25 C5:.75 A4:.5 G4:.5 A4 | A4:.5 A4:.5 r:.25 A4:.75 F4:.5 E4:.5 D4 | D5:.5 D5:.5 r:.25 B4:.75 G4:.5 A4:.5 B4 | C5:3 r', c: 'Am7 Dm7 G C' },
    },
    form: 'V C V C C',
  },
  {
    id: 'ultimo-treno', cat: 'pop', title: { it: 'Ultimo Treno', en: 'Last Train' },
    by: 'Piano Fall · piano ballad', bpm: 66, style: 'ballad',
    parts: {
      A: { m: 'B4:1.5 G4:.5 E4:2 | E4:.5 G4:.5 C5:1.5 B4:.5 G4 | D5:1.5 B4:.5 G4 D4 | F#4:1.5 E4:.5 D4:2', c: 'Em C G D' },
      B: { m: 'E5:1.5 D5:.5 B4:2 | C5 B4 G4 E4 | D5:1.5 B4:.5 G4:2 | A4:2 F#4 A4', c: 'Em C G D' },
      Z: { m: 'E4+B4:4', c: 'Em' },
    },
    form: 'A B A B Z',
  },
  {
    id: 'skyline', cat: 'pop', title: 'Skyline',
    by: 'Piano Fall · future bass', bpm: 75, style: 'futurebass',
    parts: {
      A: { m: 'B4 D5 B4:.5 A4:.5 G4 | A4 C#5 E5 C#5 | C#5:1.5 A4:.5 F#4 A4 | B4:3 r', c: 'G A F#m Bm' },
      B: { m: 'D5:.5 D5:.5 B4:.5 D5:.5 r:.5 D5:.5 E5 | C#5:.5 C#5:.5 A4:.5 C#5:.5 r:.5 C#5:.5 E5 | C#5:.5 C#5:.5 A4:.5 F#4:.5 r:.5 A4:.5 C#5 | D5:2 B4:2', c: 'G A F#m Bm' },
    },
    form: 'A B A B B',
  },
  {
    id: 'garage-sabato', cat: 'pop', title: { it: 'Garage del Sabato', en: 'Saturday Garage' },
    by: 'Piano Fall · pop-punk', bpm: 168, style: 'rock',
    parts: {
      V: { m: 'E4:.5 E4:.5 E4:.5 G#4:.5 B4 G#4 | D#4:.5 D#4:.5 D#4:.5 F#4:.5 B4 F#4 | E4:.5 E4:.5 E4:.5 G#4:.5 C#5 B4 | C#5 B4 A4:2', c: 'E B C#m A' },
      C: { m: 'B4 B4 B4:.5 C#5:.5 B4 | D#5 C#5:.5 B4:.5 B4:2 | C#5 C#5 C#5:.5 D#5:.5 E5 | E5:1.5 C#5:.5 A4:2', c: 'E B C#m A' },
    },
    form: 'V V C C V C C',
  },
  {
    id: 'carillon-digitale', cat: 'pop', title: { it: 'Carillon Digitale', en: 'Digital Music Box' },
    by: 'Piano Fall · chiptune pop', bpm: 150, style: 'chip',
    parts: {
      A: { m: 'C5:.5 G4:.5 E4:.5 G4:.5 C5:.5 D5:.5 E5:.5 D5:.5 | C5:.5 A4:.5 E4:.5 A4:.5 C5:.5 D5:.5 E5:.5 C5:.5 | A4:.5 F4:.5 C4:.5 F4:.5 A4:.5 C5:.5 D5:.5 C5:.5 | B4:.5 G4:.5 D4:.5 G4:.5 B4 D5', c: 'C Am F G' },
      B: { m: 'E5 E5:.5 D5:.5 C5 G4 | C5 C5:.5 B4:.5 A4 E4 | A4 A4:.5 B4:.5 C5 D5 | D5:1.5 C5:.5 B4 G4', c: 'C Am F G' },
    },
    form: 'A B A B',
  },
  {
    id: 'amapiano-tramonto', cat: 'pop', title: { it: 'Amapiano al Tramonto', en: 'Amapiano Sunset' },
    by: 'Piano Fall · amapiano', bpm: 112, style: 'amapiano',
    parts: {
      A: { m: 'F4 A4 C5:1.5 A4:.5 | B4 G4 F4:2 | G4 B4 D5:1.5 B4:.5 | C5 A4 E4:2', c: 'Dm7 G7 Em7 Am7' },
      B: { m: 'D5:.5 C5:.5 A4 C5 A4 | B4:.5 A4:.5 G4 D4:2 | E4:.5 G4:.5 B4 D5 B4 | C5:2 A4:2', c: 'Dm7 G7 Em7 Am7' },
    },
    form: 'A B A B',
  },
  {
    id: 'ritornello-estate', cat: 'pop', title: { it: "Ritornello d'Estate", en: 'Summer Chorus' },
    by: 'Piano Fall · tormentone', bpm: 120, style: 'kpop',
    parts: {
      V: { m: 'A4:.5 A4:.5 A4:.5 Bb4:.5 C5 A4 | G4:.5 G4:.5 G4:.5 A4:.5 G4 E4 | F4:.5 F4:.5 F4:.5 G4:.5 A4 D5 | D5:1.5 C5:.5 Bb4 F4', c: 'F C Dm Bb' },
      C: { m: 'C5:.5 C5:.5 C5 D5:.5 C5:.5 A4 | G4:.5 G4:.5 G4 A4:.5 G4:.5 E4 | D5:.5 E5:.5 D5 C5:.5 A4:.5 F4 | D5 C5 Bb4 A4', c: 'F C Dm Bb' },
    },
    form: 'V V C C V C C',
  },
  {
    id: 'swing-navile', cat: 'jazz', title: { it: 'Swing del Navile', en: 'Canal Swing' },
    by: 'Piano Fall · blues in Fa', bpm: 132, swing: 0.66, style: 'swing',
    parts: {
      A: {
        m: 'F4:.5 Ab4:.5 A4:.5 C5:.5 r:.5 A4:.5 F4 | Bb4:.5 C5:.5 D5:.5 Bb4:.5 r:.5 Ab4:.5 F4 | F4:.5 Ab4:.5 A4:.5 C5:.5 r:.5 A4:.5 F4 | C5:.5 A4:.5 F4:.5 Eb4:.5 F4:2 | '
          + 'Bb4:.5 C5:.5 D5:.5 Bb4:.5 r:.5 Ab4:.5 F4 | Bb4:2 Ab4 F4 | F4:.5 Ab4:.5 A4:.5 C5:.5 r:.5 A4:.5 F4 | F4:2 r:2 | '
          + 'G4:.5 Bb4:.5 C5:.5 E5:.5 r:.5 C5:.5 G4 | F4:.5 Ab4:.5 Bb4:.5 D5:.5 r:.5 Bb4:.5 F4 | A4 C5 F4:2 | E4 G4 Bb4 C5',
        c: 'F7 Bb7 F7 F7 Bb7 Bb7 F7 F7 C7 Bb7 F7 C7',
      },
      Z: { m: 'F4+A4+C5+Eb5:4', c: 'F7' },
    },
    form: 'A A Z',
  },

  /* =================== CLASSICAL (public domain) =================== */
  {
    id: 'elise', cat: 'classic', title: { it: 'Per Elisa', en: 'Für Elise' },
    by: 'L. van Beethoven · 1810', bpm: 150, sig: 3, style: 'arp',
    parts: {
      P: { m: 'E5:.5 D#5:.5', c: '-:1' },
      A: { m: 'E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 | A4 r:.5 C4:.5 E4:.5 A4:.5 | B4 r:.5 E4:.5 G#4:.5 B4:.5 | C5 r:.5 E4:.5 E5:.5 D#5:.5 | E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 | A4 r:.5 C4:.5 E4:.5 A4:.5 | B4 r:.5 E4:.5 C5:.5 B4:.5', c: '- Am E Am - Am E' },
      E1: { m: 'A4 r:.5 B4:.5 C5:.5 D5:.5', c: 'Am' },
      B: { m: 'E5:1.5 G4:.5 F5:.5 E5:.5 | D5:1.5 F4:.5 E5:.5 D5:.5 | C5:1.5 E4:.5 D5:.5 C5:.5 | B4 r:.5 E4:.5 E5:.5 D#5:.5', c: 'C G Am E' },
      E2: { m: 'A4:3', c: 'Am' },
    },
    form: 'P A E1 B A E2',
  },
  {
    id: 'ode', cat: 'classic', title: { it: "Inno alla gioia", en: 'Ode to Joy' },
    by: 'L. van Beethoven · 1824', bpm: 120, style: 'march',
    parts: {
      A: { m: 'A4 A4 Bb4 C5 | C5 Bb4 A4 G4 | F4 F4 G4 A4 | A4:1.5 G4:.5 G4:2', c: 'F C F C' },
      E: { m: 'A4 A4 Bb4 C5 | C5 Bb4 A4 G4 | F4 F4 G4 A4 | G4:1.5 F4:.5 F4:2', c: 'F C F C:2 F:2' },
      B: { m: 'G4 G4 A4 F4 | G4 A4:.5 Bb4:.5 A4 F4 | G4 A4:.5 Bb4:.5 A4 G4 | F4 G4 C4:2', c: 'C C:2 F:2 C F:2 C:2' },
    },
    form: 'A E B E',
  },
  {
    id: 'canon', cat: 'classic', title: { it: 'Canone in Re', en: 'Canon in D' },
    by: 'J. Pachelbel · c. 1680', bpm: 72, style: 'ballad',
    parts: {
      A: { m: 'E5:2 D5:2 | C5:2 B4:2 | A4:2 G4:2 | A4:2 B4:2', c: 'C:2 G:2 Am:2 Em:2 F:2 C:2 F:2 G:2' },
      B: { m: 'C5:2 B4:2 | A4:2 G4:2 | F4:2 E4:2 | F4:2 D4:2', c: 'C:2 G:2 Am:2 Em:2 F:2 C:2 F:2 G:2' },
      C: { m: 'C5 E5 G5 F5 | E5 C5 E5 D5 | C5 A4 C5 G5 | F5 A5 G5 F5', c: 'C:2 G:2 Am:2 Em:2 F:2 C:2 F:2 G:2' },
      Z: { m: 'E5:4', c: 'C' },
    },
    form: 'A B C C A Z',
  },
  {
    id: 'minuet', cat: 'classic', title: { it: 'Minuetto in Sol', en: 'Minuet in G' },
    by: 'C. Petzold · c. 1725', bpm: 126, sig: 3, style: 'alberti',
    parts: {
      A: { m: 'D5 G4:.5 A4:.5 B4:.5 C5:.5 | D5 G4 G4 | E5 C5:.5 D5:.5 E5:.5 F#5:.5 | G5 G4 G4 | C5 D5:.5 C5:.5 B4:.5 A4:.5 | B4 C5:.5 B4:.5 A4:.5 G4:.5 | F#4 G4:.5 A4:.5 B4:.5 G4:.5 | A4:3', c: 'G G C G C G D D' },
      B: { m: 'D5 G4:.5 A4:.5 B4:.5 C5:.5 | D5 G4 G4 | E5 C5:.5 D5:.5 E5:.5 F#5:.5 | G5 G4 G4 | C5 D5:.5 C5:.5 B4:.5 A4:.5 | B4 C5:.5 B4:.5 A4:.5 G4:.5 | A4 B4:.5 A4:.5 G4:.5 F#4:.5 | G4:3', c: 'G G C G C G D G' },
    },
    form: 'A B',
  },
  {
    id: 'brahms', cat: 'classic', title: { it: 'Ninna nanna', en: 'Lullaby' },
    by: 'J. Brahms · 1868', bpm: 84, sig: 3, style: 'ballad',
    parts: {
      A: {
        m: 'E4:.5 E4:.5 | G4:2 E4:.5 E4:.5 | G4:2 E4:.5 G4:.5 | C5 B4:1.5 A4:.5 | A4 G4 D4:.5 E4:.5 | F4 D4 D4:.5 E4:.5 | F4:2 D4:.5 F4:.5 | B4:.5 A4:.5 G4 B4 | C5:2 C4:.5 C4:.5 | '
          + 'C5:2 A4:.5 F4:.5 | G4:2 E4:.5 C4:.5 | F4 G4 A4 | G4:2 C4:.5 C4:.5 | C5:2 A4:.5 F4:.5 | G4:2 E4:.5 C4:.5 | F4 E4 D4 | C4:2',
        c: '-:1 C C G G G G G C F C F C F C G C:2',
      },
    },
    form: 'A',
  },
  {
    id: 'mountain-king', cat: 'classic', title: { it: 'Nell’antro del re della montagna', en: 'In the Hall of the Mountain King' },
    by: 'E. Grieg · 1875 · sempre più veloce', bpm: 100, style: 'march',
    parts: {
      A: { m: 'E4:.5 F#4:.5 G4:.5 A4:.5 B4:.5 G4:.5 B4 | A#4:.5 F#4:.5 A#4 A4:.5 F4:.5 A4 | E4:.5 F#4:.5 G4:.5 A4:.5 B4:.5 G4:.5 B4:.5 E5:.5 | D5:.5 B4:.5 G4:.5 B4:.5 D5:2', c: 'Em F#:2 F:2 Em G' },
    },
    form: 'A A@1.15 A@1.3 A@1.5 A@1.75',
  },
  {
    id: 'turkish-march', cat: 'classic', title: { it: 'Marcia turca', en: 'Turkish March' },
    by: 'W. A. Mozart · 1783', bpm: 120, sig: 2, style: 'march',
    parts: {
      A: { m: 'B4:.25 A4:.25 G#4:.25 A4:.25 C5 | D5:.25 C5:.25 B4:.25 C5:.25 E5 | F5:.25 E5:.25 D#5:.25 E5:.25 B5:.25 A5:.25 G#5:.25 A5:.25 | B5:.25 A5:.25 G#5:.25 A5:.25 C6 | A5:.5 B5:.5 C6:.5 B5:.5 | A5:.5 G#5:.5 A5:.5 E5:.5 | F5:.5 D5:.5 C5:.5 B4:.5 | A4:2', c: 'Am Am Am Am Am Am Dm:1 E:1 Am' },
    },
    form: 'A A',
  },
  {
    id: 'can-can', cat: 'classic', title: 'Can-can',
    by: 'J. Offenbach · 1858', bpm: 150, style: 'gallop',
    parts: {
      A: { m: 'C4:2 D4:.5 F4:.5 E4:.5 D4:.5 | G4 G4 G4:.5 A4:.5 E4:.5 F4:.5 | F4 F4 F4:.5 G4:.5 D4:.5 E4:.5 | E4 E4 E4:.5 F4:.5 D4:.5 C4:.5', c: 'C G G7 C' },
      B: { m: 'C4:2 D4:.5 F4:.5 E4:.5 D4:.5 | G4 G4 G4:.5 A4:.5 E4:.5 F4:.5 | D4:.5 G4:.5 G4:.5 A4:.5 B4:.5 C5:.5 D5:.5 E5:.5 | C5:2 r:2', c: 'C G G7 C' },
    },
    form: 'A B A B',
  },
  {
    id: 'bridal-chorus', cat: 'classic', title: { it: 'Marcia nuziale (Lohengrin)', en: 'Bridal Chorus' },
    by: 'R. Wagner · 1850', bpm: 72, style: 'hymn',
    parts: {
      A: { m: 'C4 F4:.75 F4:.25 F4:2 | C4 G4:.75 E4:.25 F4:2 | C4 F4:.75 Bb4:.25 Bb4 A4:.75 G4:.25 | F4:.75 E4:.25 F4:.75 G4:.25 F4:2', c: 'F C:2 F:2 Bb:2 C:2 C:2 F:2' },
      Z: { m: 'C4 F4:.75 F4:.25 F4:2 | C4 G4:.75 E4:.25 F4:2 | F4:4', c: 'F C:2 F:2 F' },
    },
    form: 'A A Z',
  },
  {
    id: 'swan-lake', cat: 'classic', title: { it: 'Il lago dei cigni', en: 'Swan Lake' },
    by: 'P. I. Čajkovskij · 1876', bpm: 70, style: 'strings',
    parts: {
      A: { m: 'B4:2 E4:.5 F#4:.5 G4:.5 A4:.5 | B4:1.5 G4:.5 B4:1.5 G4:.5 | B4:1.5 E4:.5 G4:.5 E4:.5 C4:.5 G4:.5 | E4:4', c: 'Em Em Em:2 C:2 Em' },
    },
    form: 'A A',
  },
  {
    id: 'spring', cat: 'classic', title: { it: 'La primavera', en: 'Spring' },
    by: 'A. Vivaldi · 1725', bpm: 100, style: 'strings',
    parts: {
      P: { m: 'C4:.5', c: '-:.5' },
      A: { m: 'E4:.5 E4:.5 E4:.5 D4:.25 C4:.25 G4:1.5 G4:.25 F4:.25 | E4:.5 E4:.5 E4:.5 D4:.25 C4:.25 G4:1.5 G4:.25 F4:.25 | E4:.5 F4:.25 G4:.25 F4:.5 E4:.5 D4:1.5 C4:.5', c: 'C C C:2 G:2' },
      Z: { m: 'E4:.5 E4:.5 E4:.5 D4:.25 C4:.25 G4:1.5 G4:.25 F4:.25 | E4:.5 F4:.25 G4:.25 F4:.5 E4:.5 D4:2 | C4+E4+G4:4', c: 'C C:2 G:2 C' },
    },
    form: 'P A A Z',
  },
  {
    id: 'fifth', cat: 'classic', title: { it: 'Quinta sinfonia', en: 'Fifth Symphony' },
    by: 'L. van Beethoven · 1808', bpm: 108, sig: 2, style: 'strings',
    parts: {
      A: { m: 'r:.5 G4:.5 G4:.5 G4:.5 | Eb4:2 | r:.5 F4:.5 F4:.5 F4:.5 | D4:2', c: '- - - -' },
      B: { m: 'r:.5 G4:.5 G4:.5 G4:.5 | Eb4:.5 Ab4:.5 Ab4:.5 Ab4:.5 | G4:.5 Eb5:.5 Eb5:.5 Eb5:.5 | C5:2 | r:.5 G4:.5 G4:.5 G4:.5 | D4:.5 Ab4:.5 Ab4:.5 Ab4:.5 | G4:.5 F5:.5 F5:.5 F5:.5 | D5:2', c: 'Cm Fm Cm Cm G7 G7 G7 G' },
    },
    form: 'A B A B',
  },
  {
    id: 'prelude-c', cat: 'classic', title: { it: 'Preludio in Do', en: 'Prelude in C' },
    by: 'J. S. Bach · 1722', bpm: 66, style: 'bassonly',
    parts: {
      A: {
        m: 'r:.5 G4:.25 C5:.25 E5:.25 G4:.25 C5:.25 E5:.25 r:.5 G4:.25 C5:.25 E5:.25 G4:.25 C5:.25 E5:.25 | '
          + 'r:.5 A4:.25 D5:.25 F5:.25 A4:.25 D5:.25 F5:.25 r:.5 A4:.25 D5:.25 F5:.25 A4:.25 D5:.25 F5:.25 | '
          + 'r:.5 G4:.25 D5:.25 F5:.25 G4:.25 D5:.25 F5:.25 r:.5 G4:.25 D5:.25 F5:.25 G4:.25 D5:.25 F5:.25 | '
          + 'r:.5 G4:.25 C5:.25 E5:.25 G4:.25 C5:.25 E5:.25 r:.5 G4:.25 C5:.25 E5:.25 G4:.25 C5:.25 E5:.25 | '
          + 'r:.5 A4:.25 E5:.25 A5:.25 A4:.25 E5:.25 A5:.25 r:.5 A4:.25 E5:.25 A5:.25 A4:.25 E5:.25 A5:.25 | '
          + 'r:.5 F#4:.25 A4:.25 D5:.25 F#4:.25 A4:.25 D5:.25 r:.5 F#4:.25 A4:.25 D5:.25 F#4:.25 A4:.25 D5:.25 | '
          + 'r:.5 G4:.25 D5:.25 G5:.25 G4:.25 D5:.25 G5:.25 r:.5 G4:.25 D5:.25 G5:.25 G4:.25 D5:.25 G5:.25 | '
          + 'r:.5 E4:.25 G4:.25 C5:.25 E4:.25 G4:.25 C5:.25 r:.5 E4:.25 G4:.25 C5:.25 E4:.25 G4:.25 C5:.25 | '
          + 'r:.5 E4:.25 G4:.25 C5:.25 E4:.25 G4:.25 C5:.25 r:.5 E4:.25 G4:.25 C5:.25 E4:.25 G4:.25 C5:.25 | '
          + 'r:.5 D4:.25 F#4:.25 C5:.25 D4:.25 F#4:.25 C5:.25 r:.5 D4:.25 F#4:.25 C5:.25 D4:.25 F#4:.25 C5:.25 | '
          + 'r:.5 D4:.25 G4:.25 B4:.25 D4:.25 G4:.25 B4:.25 r:.5 D4:.25 G4:.25 B4:.25 D4:.25 G4:.25 B4:.25 | '
          + 'C4+E4+G4+C5:4',
        c: 'C Dm/C G7/B C Am/C D7/C G/B Cmaj7/B Am7 D7 G C',
      },
    },
    form: 'A',
  },
  {
    id: 'gymnopedie', cat: 'classic', title: { it: 'Gymnopédie n. 1', en: 'Gymnopédie No. 1' },
    by: 'E. Satie · 1888', bpm: 72, sig: 3, style: 'hymn',
    parts: {
      I: { m: 'r:6', c: 'Fmaj7 Cmaj7' },
      A: { m: 'r E5 G5 | F5 E5 B4 | A4 B4 C5 | G4:3 | E4:3 | r:3', c: 'Fmaj7 Cmaj7 Fmaj7 Cmaj7 Fmaj7 Cmaj7' },
      Z: { m: 'r E5 G5 | F5 E5 B4 | A4 B4 C5 | G4:3 | E4+G4+C5:3', c: 'Fmaj7 Cmaj7 Fmaj7 Cmaj7 C' },
    },
    form: 'I A A Z',
  },
  {
    id: 'largo', cat: 'classic', title: { it: 'Largo (Sinfonia dal Nuovo Mondo)', en: 'Largo (New World)' },
    by: 'A. Dvořák · 1893', bpm: 60, style: 'strings',
    parts: {
      A: { m: 'E4:1.5 G4:.5 G4:2 | E4:1.5 D4:.5 C4:2 | D4 E4 G4 E4 | D4:4 | E4:1.5 G4:.5 G4:2 | E4:1.5 D4:.5 C4:2 | D4 E4 D4 C4 | C4:4', c: 'C C:2 G:2 C G C C:2 G:2 G:2 C:2 C' },
    },
    form: 'A A',
  },
  {
    id: 'william-tell', cat: 'classic', title: { it: 'Guglielmo Tell (finale)', en: 'William Tell Overture' },
    by: 'G. Rossini · 1829', bpm: 160, style: 'gallop', repeat: 3, chords: 'E E:2 B:2 E E:2 B:2 E B:2 E:2',
    notes: [
      [64, 0, .4], [64, 0.5, .4], [64, 1, .4], [64, 1.5, .4], [64, 2, .4], [64, 2.5, .4], [64, 3, .4], [66, 3.5, .4], [68, 4], [68, 4.5], [66, 5], [64, 5.5],
      [64, 6], [66, 6.5], [64, 7], [62, 7.5], [64, 8], [64, 8.5], [64, 9], [64, 9.5], [64, 10], [66, 10.5], [68, 11], [68, 11.5], [66, 12], [64, 12.5],
      [64, 13], [66, 13.5], [64, 14], [62, 14.5], [60, 15], [62, 15.5], [64, 16], [64, 16.5], [64, 17], [66, 17.5], [68, 18], [68, 18.5], [66, 19], [64, 19.5],
      [64, 20], [66, 20.5], [64, 21], [62, 21.5], [60, 22], [62, 22.5], [64, 23, 1],
    ],
  },

  /* =================== JAZZ & RAGTIME =================== */
  {
    id: 'entertainer', cat: 'jazz', title: 'The Entertainer',
    by: 'S. Joplin · 1902', bpm: 76, style: 'stride',
    parts: {
      A: { m: 'D4:.25 D#4:.25 E4:.25 C5:.5 E4:.25 C5:.5 E4:.25 C5:1.5 C5:.25 | D5:.25 D#5:.25 E5:.25 C5:.25 D5:.25 E5:.5 B4:.25 D5:.5 C5:1.5', c: 'C G7:2 C:2' },
      B: { m: 'D4:.25 D#4:.25 E4:.25 C5:.5 E4:.25 C5:.5 E4:.25 C5:1.5 r:.25 | A4:.25 G4:.25 F#4:.25 A4:.25 C5:.25 E5:.5 D5:.25 C5:.25 A4:.25 D5:1.5', c: 'C D7:2 G:2' },
    },
    form: 'A B A A',
  },
  {
    id: 'saints', cat: 'jazz', title: 'When the Saints Go Marching In',
    by: 'Spiritual · tradizionale', bpm: 150, style: 'stride',
    parts: {
      A: { m: 'r C4 E4 F4 | G4:4 | r C4 E4 F4 | G4:4 | r C4 E4 F4 | G4:2 E4:2 | C4:2 E4:2 | D4:4 | r E4 E4 D4 | C4:3 C4 | E4:2 G4:2 | G4 F4:3 | r E4 F4 G4 | E4:2 C4:2 | D4:4 | C4:4', c: 'C C C C C C C G C C7 F F C C G C' },
    },
    form: 'A A',
  },

  /* =================== TRADITIONAL & KIDS =================== */
  {
    id: 'twinkle', cat: 'trad', title: { it: 'Brilla brilla la stellina', en: 'Twinkle Twinkle Little Star' },
    by: 'Tradizionale · 1761', bpm: 100, style: 'folk',
    parts: {
      A: { m: 'C4 C4 G4 G4 | A4 A4 G4:2 | F4 F4 E4 E4 | D4 D4 C4:2', c: 'C F:2 C:2 F:2 C:2 G:2 C:2' },
      B: { m: 'G4 G4 F4 F4 | E4 E4 D4:2 | G4 G4 F4 F4 | E4 E4 D4:2', c: 'C:2 F:2 C:2 G:2 C:2 F:2 C:2 G:2' },
    },
    form: 'A B A',
  },
  {
    id: 'mary', cat: 'trad', title: { it: 'Mary aveva un agnellino', en: 'Mary Had a Little Lamb' },
    by: 'Tradizionale · 1830', bpm: 108, style: 'folk',
    parts: { A: { m: 'E4 D4 C4 D4 | E4 E4 E4:2 | D4 D4 D4:2 | E4 G4 G4:2 | E4 D4 C4 D4 | E4 E4 E4 E4 | D4 D4 E4 D4 | C4:4', c: 'C C G C C C G C' } },
    form: 'A A',
  },
  {
    id: 'birthday', cat: 'trad', title: { it: 'Tanti auguri a te', en: 'Happy Birthday' },
    by: 'Tradizionale', bpm: 110, sig: 3, style: 'folk',
    parts: { A: { m: 'r:2 D4:.75 D4:.25 | E4 D4 G4 | F#4:2 D4:.75 D4:.25 | E4 D4 A4 | G4:2 D4:.75 D4:.25 | D5 B4 G4 | F#4 E4 C5:.75 C5:.25 | B4 G4 A4 | G4:3', c: '- G D D G G C G:2 D:1 G' } },
    form: 'A',
  },
  {
    id: 'frere', cat: 'trad', title: { it: 'Fra Martino', en: 'Frère Jacques' },
    by: 'Tradizionale', bpm: 120, style: 'folk',
    parts: { A: { m: 'F4 G4 A4 F4 | F4 G4 A4 F4 | A4 Bb4 C5:2 | A4 Bb4 C5:2 | C5:.5 D5:.5 C5:.5 Bb4:.5 A4 F4 | C5:.5 D5:.5 C5:.5 Bb4:.5 A4 F4 | F4 C4 F4:2 | F4 C4 F4:2', c: 'F F F F F F F:2 C:1 F:1 F:2 C:1 F:1' } },
    form: 'A A',
  },
  {
    id: 'london', cat: 'trad', title: { it: 'Il ponte di Londra', en: 'London Bridge' },
    by: 'Tradizionale', bpm: 112, style: 'folk',
    parts: { A: { m: 'G4:1.5 A4:.5 G4 F4 | E4 F4 G4:2 | D4 E4 F4:2 | E4 F4 G4:2 | G4:1.5 A4:.5 G4 F4 | E4 F4 G4:2 | D4:2 G4:2 | E4 C4:3', c: 'C C G C C C G C' } },
    form: 'A A',
  },
  {
    id: 'row-boat', cat: 'trad', title: { it: 'Rema rema la barchetta', en: 'Row, Row, Row Your Boat' },
    by: 'Tradizionale · 1852', bpm: 220, sig: 6, style: 'folk',
    parts: { A: { m: 'C4:3 C4:3 | C4:2 D4 E4:3 | E4:2 D4 E4:2 F4 | G4:6 | C5 C5 C5 G4 G4 G4 | E4 E4 E4 C4 C4 C4 | G4:2 F4 E4:2 D4 | C4:6', c: 'C C C C C C G C' } },
    form: 'A A',
  },
  {
    id: 'old-macdonald', cat: 'trad', title: { it: 'Nella vecchia fattoria', en: 'Old MacDonald' },
    by: 'Tradizionale', bpm: 120, style: 'folk',
    parts: {
      A: { m: 'G4 G4 G4 D4 | E4 E4 D4:2 | B4 B4 A4 A4 | G4:3 D4 | G4 G4 G4 D4 | E4 E4 D4:2 | B4 B4 A4 A4 | G4:4', c: 'G C:2 G:2 D G G C:2 G:2 D G' },
      B: { m: 'D4:.5 D4:.5 G4 G4 G4 | D4:.5 D4:.5 G4 G4:2 | G4:.5 G4:.5 G4 G4:.5 G4:.5 G4 | G4:.5 G4:.5 G4:.5 G4:.5 G4 G4', c: 'G G G D' },
    },
    form: 'A B A',
  },
  {
    id: 'amazing-grace', cat: 'trad', title: 'Amazing Grace',
    by: 'Inno · 1779', bpm: 90, sig: 3, style: 'hymn',
    parts: { A: { m: 'r:2 D4 | G4:2 B4:.5 G4:.5 | B4:2 A4 | G4:2 E4 | D4:2 D4 | G4:2 B4:.5 G4:.5 | B4:2 A4 | D5:2 B4 | D5:2 B4:.5 G4:.5 | B4:2 A4 | G4:2 E4 | D4:2 D4 | G4:2 B4:.5 G4:.5 | B4:2 A4 | G4:3', c: '- G G C G G Em D G G7 C G Em D G' } },
    form: 'A',
  },
  {
    id: 'greensleeves', cat: 'trad', title: 'Greensleeves',
    by: 'Tradizionale inglese · XVI sec.', bpm: 112, sig: 3, style: 'ballad',
    parts: {
      A: { m: 'r:2 A4 | C5:2 D5 | E5:1.5 F5:.5 E5 | D5:2 B4 | G4:1.5 A4:.5 B4 | C5:2 A4 | A4:1.5 G#4:.5 A4 | B4:2 G#4 | E4:2 A4 | C5:2 D5 | E5:1.5 F5:.5 E5 | D5:2 B4 | G4:1.5 A4:.5 B4 | C5:1.5 B4:.5 A4 | G#4:1.5 F#4:.5 G#4 | A4:3', c: '- Am C G Em Am Am E E Am C G Em Am E Am' },
      B: { m: 'G5:3 | G5:1.5 F#5:.5 E5 | D5:2 B4 | G4:1.5 A4:.5 B4 | C5:2 A4 | A4:1.5 G#4:.5 A4 | B4:2 G#4 | E4:3 | G5:3 | G5:1.5 F#5:.5 E5 | D5:2 B4 | G4:1.5 A4:.5 B4 | C5:1.5 B4:.5 A4 | G#4:1.5 F#4:.5 G#4 | A4:3', c: 'C C G Em Am Am E E C C G Em Am E Am' },
    },
    form: 'A B',
  },
  {
    id: 'drunken-sailor', cat: 'trad', title: { it: 'Il marinaio ubriaco', en: 'Drunken Sailor' },
    by: 'Canto marinaresco', bpm: 132, style: 'folk',
    parts: {
      V: { m: 'A4 A4:.5 A4:.5 A4 A4:.5 A4:.5 | A4 D4 F4 A4 | G4 G4:.5 G4:.5 G4 G4:.5 G4:.5 | G4 C4 E4 G4 | A4 A4:.5 A4:.5 A4 A4:.5 A4:.5 | A4 B4 C5 D5 | C5 A4 G4 E4 | D4:2 D4:2', c: 'Dm Dm C C Dm Dm C Dm' },
      C: { m: 'A4:2 A4:2 | A4 D4 F4 A4 | G4:2 G4:2 | G4 C4 E4 G4 | A4:2 A4:2 | A4 B4 C5 D5 | C5 A4 G4 E4 | D4:2 D4:2', c: 'Dm Dm C C Dm Dm C Dm' },
    },
    form: 'V C V C',
  },
  {
    id: 'aura-lee', cat: 'trad', title: 'Aura Lee',
    by: 'G. R. Poulton · 1861', bpm: 80, style: 'ballad',
    parts: { A: { m: 'C4 F4 E4 F4 | G4 D4 G4:2 | F4 E4 D4 E4 | F4:4 | C4 F4 E4 F4 | G4 D4 G4:2 | F4 E4 D4 E4 | F4:4 | A4 A4 A4:2 | A4 A4 A4:2 | A4 G4 F4 G4 | A4:4 | A4 A4 Bb4 A4 | G4 D4 G4:2 | F4 E4 A4 G4 | F4:4', c: 'F G7 C7 F F G7 C7 F A7 Dm G7 C7 F G7 C7 F' } },
    form: 'A',
  },
  {
    id: 'cucaracha', cat: 'trad', title: 'La Cucaracha',
    by: 'Tradizionale messicano', bpm: 150, style: 'gallop',
    parts: { A: { m: 'C4:.5 C4:.5 C4:.5 F4:1.5 A4 | C4:.5 C4:.5 C4:.5 F4:1.5 A4 | F4 F4:.5 E4:.5 E4:.5 D4:.5 D4:.5 C4:.5 | C4:2 r:2 | C4:.5 C4:.5 C4:.5 E4:1.5 G4 | C4:.5 C4:.5 C4:.5 E4:1.5 G4 | C5 D5:.5 C5:.5 Bb4:.5 A4:.5 G4:.5 F4:.5 | F4:2 r:2', c: 'F F C C7 C7 C7 C7:2 F:2 F' } },
    form: 'A A',
  },
  {
    id: 'yankee-doodle', cat: 'trad', title: 'Yankee Doodle',
    by: 'Tradizionale · XVIII sec.', bpm: 126, style: 'march',
    parts: { A: { m: 'F4 F4 G4 A4 | F4 A4 G4 C4 | F4 F4 G4 A4 | F4:2 E4:2 | F4 F4 G4 A4 | Bb4 A4 G4 F4 | E4 C4 D4 E4 | F4:2 F4:2', c: 'F C F C F Bb C F' } },
    form: 'A A',
  },

  /* =================== CHRISTMAS =================== */
  {
    id: 'jingle', cat: 'xmas', title: 'Jingle Bells',
    by: 'J. Pierpont · 1857', bpm: 132, style: 'jingle',
    parts: { A: { m: 'E4 E4 E4:2 | E4 E4 E4:2 | E4 G4 C4:1.5 D4:.5 | E4:4 | F4 F4 F4:1.5 F4:.5 | F4 E4 E4 E4:.5 E4:.5 | E4 D4 D4 E4 | D4:2 G4:2 | E4 E4 E4:2 | E4 E4 E4:2 | E4 G4 C4:1.5 D4:.5 | E4:4 | F4 F4 F4:1.5 F4:.5 | F4 E4 E4 E4:.5 E4:.5 | G4 G4 F4 D4 | C4:4', c: 'C C C C F C D7 G C C C C F C G C' } },
    form: 'A A',
  },
  {
    id: 'silent-night', cat: 'xmas', title: { it: 'Astro del ciel', en: 'Silent Night' },
    by: 'F. X. Gruber · 1818', bpm: 76, sig: 3, style: 'ballad',
    parts: { A: { m: 'G4:1.5 A4:.5 G4 | E4:3 | G4:1.5 A4:.5 G4 | E4:3 | D5:2 D5 | B4:3 | C5:2 C5 | G4:3 | A4:2 A4 | C5:1.5 B4:.5 A4 | G4:1.5 A4:.5 G4 | E4:3 | A4:2 A4 | C5:1.5 B4:.5 A4 | G4:1.5 A4:.5 G4 | E4:3 | D5:2 D5 | F5:1.5 D5:.5 B4 | C5:3 | E5:3 | C5:1.5 G4:.5 E4 | G4:1.5 F4:.5 D4 | C4:3', c: 'C C C C G G C C F F C C F F C C G G7 C C C G C' } },
    form: 'A',
  },
  {
    id: 'we-wish', cat: 'xmas', title: { it: 'Vi auguriamo buon Natale', en: 'We Wish You a Merry Christmas' },
    by: 'Tradizionale inglese', bpm: 132, sig: 3, style: 'jingle',
    parts: {
      A: { m: 'D4 | G4 G4:.5 A4:.5 G4:.5 F#4:.5 | E4 E4 E4 | A4 A4:.5 B4:.5 A4:.5 G4:.5 | F#4 D4 D4 | B4 B4:.5 C5:.5 B4:.5 A4:.5 | G4 E4 D4:.5 D4:.5 | E4 A4 F#4 | G4:2', c: '-:1 G C D D B7 Em C:1 D:2 G:2' },
      B: { m: 'D4 | G4 G4 G4 | F#4:2 F#4 | G4 F#4 E4 | D4:2 A4 | B4 A4:.5 A4:.5 G4:.5 G4:.5 | D5 D4 D4:.5 D4:.5 | E4 A4 F#4 | G4:2', c: '-:1 G D Em D G C C:1 D:2 G:2' },
    },
    form: 'A A B A',
  },
  {
    id: 'deck-halls', cat: 'xmas', title: { it: 'Addobbiam la casa', en: 'Deck the Halls' },
    by: 'Tradizionale gallese', bpm: 124, style: 'jingle',
    parts: {
      A: { m: 'C5:1.5 Bb4:.5 A4 G4 | F4 G4 A4 F4 | G4:.5 A4:.5 Bb4:.5 G4:.5 A4:1.5 G4:.5 | F4 E4 F4:2', c: 'F F C:2 F:2 C:2 F:2' },
      B: { m: 'G4:1.5 A4:.5 Bb4 G4 | A4:1.5 Bb4:.5 C5 G4 | A4:.5 B4:.5 C5 D5:.5 E5:.5 F5 | E5 D5 C5:2', c: 'C F C:2 G:2 C' },
    },
    form: 'A A B A',
  },
  {
    id: 'joy-world', cat: 'xmas', title: { it: 'Gioia nel mondo', en: 'Joy to the World' },
    by: 'G. F. Händel (attr.) · 1839', bpm: 110, style: 'hymn',
    parts: { A: { m: 'C5:2 B4:1.5 A4:.5 | G4:3 F4 | E4:2 D4:2 | C4:3 G4 | A4:3 A4 | B4:3 B4 | C5:3 C5 | C5 B4 A4 G4 | G4:1.5 F4:.5 E4 C5 | C5 B4 A4 G4 | G4:1.5 F4:.5 E4 E4 | E4 E4 E4 E4:.5 F4:.5 | G4:3 F4:.5 E4:.5 | D4 D4 D4 D4:.5 E4:.5 | F4:3 E4:.5 D4:.5 | C4 C5:2 A4 | G4:1.5 F4:.5 E4 F4 | E4:2 D4:2 | C4:4', c: 'C C F:2 G:2 C F G C C C C C C C G G C:2 F:2 C:2 F:2 C:2 G:2 C' } },
    form: 'A',
  },
  {
    id: 'carol-bells', cat: 'xmas', title: { it: 'Canto delle campane', en: 'Carol of the Bells' },
    by: 'M. Leontovyč · 1914', bpm: 170, sig: 3, style: 'strings',
    parts: {
      A: { m: 'Bb4 A4:.5 Bb4:.5 G4 | Bb4 A4:.5 Bb4:.5 G4 | Bb4 A4:.5 Bb4:.5 G4 | Bb4 A4:.5 Bb4:.5 G4', c: 'Gm Gm Cm D' },
      B: { m: 'D5 C5:.5 D5:.5 Bb4 | D5 C5:.5 D5:.5 Bb4 | D5 C5:.5 D5:.5 Bb4 | D5 C5:.5 D5:.5 Bb4', c: 'Gm Gm Cm D' },
      Z: { m: 'G4+Bb4+D5:3', c: 'Gm' },
    },
    form: 'A A B B A A Z',
  },
];
