/* ============================================================
   Ultimo Colore — the road of Act I (pure data)
   ------------------------------------------------------------
   at: where it happens in the open lagoon (world/layout.js). A node
   opens when one of the nodes that lead to it is done; optional
   ones can be skipped. auto: starts without walking there.
   join: who enters the party before the node's fight or after
   its story. reward: memories found there.
   ============================================================ */

const N = (id, type, art, at, next, it, en, extra = {}) => ({ id, type, art, at: { x: at[0], y: at[1] }, next, name: { it, en }, scene: id, ...extra });

export const NODES = [
  N('casa', 'story', 'forno', [860, 2900], ['ponte'], 'Il forno di Ada', 'Ada’s bakery', { auto: true, diary: null }),
  N('ponte', 'battle', 'ponte', [1003, 2625], ['darsena'], 'Ponte delle Lanterne', 'Bridge of Lanterns', { goal: { it: 'Il ponte delle Lanterne, a nord di casa', en: 'The Bridge of Lanterns, north of home' }, enemies: ['cocci', 'cocci'], join: ['tecla'], reward: ['pane'], tutorial: true }),
  N('darsena', 'story', 'darsena', [1640, 2412], ['stiva'], 'La darsena', 'The harbour', { goal: { it: 'La darsena, a est: la barca aspetta', en: 'The harbour, to the east: the boat is waiting' }, reward: ['alba'] }),
  N('stiva', 'story', 'stiva', [1815, 2408], ['canale'], 'La stiva', 'The hold', { goal: { it: 'Sali sulla Pazienza, in fondo al molo', en: 'Board Patience, at the end of the pier' }, joinAfter: ['nora'], reward: ['nodo'], diary: 'd1' }),
  N('canale', 'battle', 'canale', [975, 2185], ['reti', 'campanaro'], 'Canale dei Panni', 'Laundry Canal', { goal: { it: 'Passa il Canale dei Panni, a nord', en: 'Pass the Laundry Canal, to the north' }, enemies: ['granchio', 'cocci'], reward: ['passi', 'ago'] }),
  N('reti', 'battle', 'secche', [330, 1790], ['campanaro'], 'Isola delle Reti', 'Isle of Nets', { goal: { it: 'La luce sull’Isola delle Reti, a ovest', en: 'The light on the Isle of Nets, to the west' }, enemies: ['spenta', 'granchio'], reward: ['rete', 'mira', 'tasca'], optional: true }),
  N('campanaro', 'story', 'campanile', [1600, 1745], ['campanile'], 'San Brizio', 'San Brizio', { goal: { it: 'Una campana a est: San Brizio', en: 'A bell to the east: San Brizio' }, joinAfter: ['bastiano'], reward: ['cera'] }),
  N('campanile', 'battle', 'campanile', [1430, 1640], ['campo1'], 'Il campanile sommerso', 'The sunken tower', { goal: { it: 'Le lanterne spente attorno al campanile', en: 'The dead lanterns around the tower' }, enemies: ['spenta', 'spenta'], reward: ['campana', 'respiro'] }),
  N('campo1', 'camp', 'campo', [1000, 1430], ['secche'], 'Primo campo', 'First camp', { goal: { it: 'Accampatevi sull’isolotto in mezzo alla laguna', en: 'Make camp on the islet mid-lagoon' }, diary: 'd2', reward: ['miele', 'coperta'] }),
  N('secche', 'battle', 'secche', [1005, 1150], ['statua', 'airone'], 'Secche dei Salici', 'Willow Shallows', { goal: { it: 'A nord, oltre le canne: le Secche dei Salici', en: 'North, past the reeds: the Willow Shallows' }, enemies: ['alga', 'granchio'], reward: ['pozzanghera', 'controcanto'] }),
  N('statua', 'story', 'secche', [330, 900], ['airone'], 'L’uomo con la bussola', 'The man with the compass', { goal: { it: 'Qualcosa brilla tra i salici, a ovest', en: 'Something shines among the willows, to the west' }, optional: true, reward: ['lettera', 'fame'] }),
  N('airone', 'boss', 'secche', [1285, 745], ['campo2'], 'L’Airone di vetro', 'The Glass Heron', { goal: { it: 'L’airone, alle canne di nord-est', en: 'The heron, by the north-eastern reeds' }, enemies: ['airone', 'cocci'], reward: ['occhi', 'fiammifero'], diary: 'd3' }),
  N('campo2', 'camp', 'campo', [1285, 505], ['cervo'], 'Secondo campo', 'Second camp', { goal: { it: 'Il secondo campo, oltre le canne', en: 'The second camp, past the reeds' }, reward: ['filo'] }),
  N('cervo', 'boss', 'cervo', [960, 235], ['tramonto'], 'Il Cervo di Vetro', 'The Glass Stag', { goal: { it: 'La radura del Cervo, all’estremo nord', en: 'The Stag’s clearing, far north' }, enemies: ['cervo'] }),
  N('tramonto', 'story', 'secche', [960, 235], [], 'Il tramonto del verde', 'The sunset of green', { auto: true, diary: 'd4', end: true, fade: true }),
];

export const NODE = Object.fromEntries(NODES.map((n) => [n.id, n]));
export const FIRST = 'casa';
