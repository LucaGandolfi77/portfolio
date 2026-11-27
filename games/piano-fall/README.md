# Piano Fall

A falling-note piano: tiles slide down the lanes and you play each one as it
reaches the golden line. It began as `piano-pwa` in the random2 repository;
this version adds a backing band, long notes, practice and listen modes, and
a library of 54 songs.

## Songs

| Category | Songs |
| --- | --- |
| Original pop | 17 songs written for Piano Fall in today's styles: synthwave, reggaeton, lo-fi, house, indie pop, nu-disco, trap, K-pop, afrobeats, future bass, pop-punk, chiptune, amapiano, a summer song and a ballad, plus a blues in F |
| Classical | Für Elise, Ode to Joy, Canon in D, Minuet in G, Brahms' Lullaby, In the Hall of the Mountain King (it speeds up), Turkish March, Can-can, Bridal Chorus, Swan Lake, Spring, Fifth Symphony, Prelude in C, Gymnopédie No. 1, Largo, William Tell |
| Folk & kids | Twinkle Twinkle, Mary Had a Little Lamb, Happy Birthday, Frère Jacques, London Bridge, Row Your Boat, Old MacDonald, Amazing Grace, Greensleeves, Drunken Sailor, Aura Lee, La Cucaracha, Yankee Doodle |
| Christmas | Jingle Bells, Silent Night, We Wish You a Merry Christmas, Deck the Halls, Joy to the World, Carol of the Bells |
| Jazz & ragtime | The Entertainer, When the Saints Go Marching In |

Only two kinds of music are included:

- original songs;
- public-domain melodies, whose composers died long ago.

Copyrighted hits are not transcribed. To play one, load its MIDI file instead.

Each song has chords and a backing style, chosen from 27 styles. The synth turns these into:

- bass;
- chords and arpeggios;
- drums, all synthesised live.

## How to play

| Mode | What it does |
| --- | --- |
| **Play** | Hits are judged Perfect (±70 ms) or Good (±160 ms), with a combo multiplier up to ×4. Long notes give extra points while you hold the key. Your best score, stars (1–3) and grade (S–D) are saved for each song. |
| **Practice** | The song stops at every note until you play it. Wrong notes are counted, but nothing is scored. |
| **Listen** | The piano plays the song by itself. |

On every song card you can also set:

- the speed: 50%, 75%, 100% or 125%;
- whether the backing band plays.

You can play with:

- touch, with multi-touch and glissando;
- the computer keyboard (`A S D F G H J K L ;` plus `W E T Y U O P` on 17 keys, and more rows on larger keyboards);
- a USB or Bluetooth MIDI keyboard, connected from Settings through Web MIDI.

**Free play** gives you the bare piano, with no song.

**MIDI files:**

- At every moment, the highest note becomes your melody and the rest goes to the band. Settings can switch this to "play every note".
- Up to six files are kept in the browser.
- Files never leave your device.

**Settings:**

- **Keyboard size:** Auto, or 17 to 37 keys. Auto picks the smallest keyboard that holds the song.
- **Note names:** off, C D E, or Do Re Mi. They show on the keys and on the falling tiles.
- **Computer-keyboard letters** on the keys.
- **Backing volume.**
- **Language:** Italian or English.

## Files

```
js/music.js    notation parser, song builder, keyboards, difficulty, judging (pure)
js/backing.js  the backing styles: chords → bass, chords, arpeggios, drums (pure)
js/songs.js    the song library
js/synth.js    WebAudio piano, band instruments, drum kit, iOS unlock
js/midi.js     Standard MIDI File parser
js/main.js     the app: library, song card, game loop, rendering, input
js/strings.js  Italian and English text
```

## Song notation

```js
{ id: 'my-song', cat: 'pop', title: { it: '…', en: '…' }, by: '…', bpm: 120, style: 'pop',
  parts: { V: { m: 'E4 D4:.5 C4:.5 G4:2 | …', c: 'C G Am F' } }, form: 'V V' }
```

- `E4:2` is a note lasting two beats, and `E4:2/3` is a triplet.
- `r` is a rest and `C4+E4` is a chord.
- `|` separates bars, but only to make the line easier to read.
- A chord lasts one bar unless it gives a length, as in `Am:2`.
- `-` means no chord.
- `A@1.2` in `form` plays part A 20% faster.

## Checks

```bash
node games/piano-fall/test/logic-test.mjs
npm --prefix tools/quality test -- e2e/piano-fall.spec.mjs
```

The logic tests check that every part's melody and chords have the same
length, that every song fits a keyboard, and that every backing style plays.

The E2E tests cover:

- playing a song through to its result;
- practice mode;
- MIDI import;
- every song starting with its band;
- the PWA.

The PNG icons are rendered from `icons/icon.svg` by
`node tools/quality/generate-piano-icons.mjs`.
