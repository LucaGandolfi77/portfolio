/* ============================================================
   Ultimo Colore — the road of Act I (pure data)
   ------------------------------------------------------------
   pos: percent on the painted map. A node opens when one of the
   nodes that lead to it is done; optional ones can be skipped.
   join: who enters the party before the node's fight or after
   its story. reward: memories found there.
   ============================================================ */

const N = (id, type, art, pos, next, it, en, extra = {}) => ({ id, type, art, pos, next, name: { it, en }, scene: id, ...extra });

export const NODES = [
  N('casa', 'story', 'forno', [50, 88], ['ponte'], 'Il forno di Ada', 'Ada’s bakery', { diary: null }),
  N('ponte', 'battle', 'ponte', [38, 81], ['darsena'], 'Ponte delle Lanterne', 'Bridge of Lanterns', { enemies: ['cocci', 'cocci'], join: ['tecla'], reward: ['pane'], tutorial: true }),
  N('darsena', 'story', 'darsena', [55, 74], ['stiva'], 'La darsena', 'The harbour', { reward: ['alba'] }),
  N('stiva', 'story', 'stiva', [62, 68], ['canale'], 'La stiva', 'The hold', { joinAfter: ['nora'], reward: ['nodo'], diary: 'd1' }),
  N('canale', 'battle', 'canale', [44, 62], ['reti', 'campanaro'], 'Canale dei Panni', 'Laundry Canal', { enemies: ['granchio', 'cocci'], reward: ['passi', 'ago'] }),
  N('reti', 'battle', 'secche', [18, 57], ['campanaro'], 'Isola delle Reti', 'Isle of Nets', { enemies: ['spenta', 'granchio'], reward: ['rete', 'mira', 'tasca'], optional: true }),
  N('campanaro', 'story', 'campanile', [57, 52], ['campanile'], 'San Brizio', 'San Brizio', { joinAfter: ['bastiano'], reward: ['cera'] }),
  N('campanile', 'battle', 'campanile', [73, 45], ['campo1'], 'Il campanile sommerso', 'The sunken tower', { enemies: ['spenta', 'spenta'], reward: ['campana', 'respiro'] }),
  N('campo1', 'camp', 'campo', [58, 39], ['secche'], 'Primo campo', 'First camp', { diary: 'd2', reward: ['miele', 'coperta'] }),
  N('secche', 'battle', 'secche', [37, 33], ['statua', 'airone'], 'Secche dei Salici', 'Willow Shallows', { enemies: ['alga', 'granchio'], reward: ['pozzanghera', 'controcanto'] }),
  N('statua', 'story', 'secche', [17, 27], ['airone'], 'L’uomo con la bussola', 'The man with the compass', { optional: true, reward: ['lettera', 'fame'] }),
  N('airone', 'boss', 'secche', [47, 24], ['campo2'], 'L’Airone di vetro', 'The Glass Heron', { enemies: ['airone', 'cocci'], reward: ['occhi', 'fiammifero'], diary: 'd3' }),
  N('campo2', 'camp', 'campo', [64, 18], ['cervo'], 'Secondo campo', 'Second camp', { reward: ['filo'] }),
  N('cervo', 'boss', 'cervo', [47, 11], ['tramonto'], 'Il Cervo di Vetro', 'The Glass Stag', { enemies: ['cervo'] }),
  N('tramonto', 'story', 'secche', [58, 5], [], 'Il tramonto del verde', 'The sunset of green', { diary: 'd4', end: true, fade: true }),
];

export const NODE = Object.fromEntries(NODES.map((n) => [n.id, n]));
export const FIRST = 'casa';
