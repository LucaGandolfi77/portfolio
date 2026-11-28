/* ============================================================
   Ultimo Colore — memories: passive gifts found on the way
   ------------------------------------------------------------
   `fx` keys are read by the battle engine. A hero who fights
   LEARN battles with one knows it; others can then be taught
   it by spending light.
   ============================================================ */

export const LEARN = 4;
export const SLOTS = 3;
export const TEACH_COST = 30;

const M = (id, fx, it, dit, en, den) => ({ id, fx, it, dit, en, den });

export const MEMORIES = [
  M('pane', { parryHeal: 0.05 }, 'Il pane di Ada', 'Ogni parata cura il 5%.', 'Ada’s bread', 'Each parry heals 5%.'),
  M('alba', { startAp: 2 }, 'La prima luce', 'Si comincia con 2 PA in più.', 'First light', 'Start with 2 extra AP.'),
  M('cera', { hp: 0.15 }, 'Cera sul polso', 'Salute massima +15%.', 'Wax on the wrist', 'Max health +15%.'),
  M('nodo', { atk: 0.1 }, 'Nodo da marinaio', 'Attacco +10%.', 'Sailor’s knot', 'Attack +10%.'),
  M('passi', { spd: 4 }, 'Passi sul ponte', 'Si agisce prima.', 'Steps on the bridge', 'Act sooner.'),
  M('occhi', { perfect: 0.15 }, 'Occhi di Livia', 'I colpi perfetti fanno +15%.', 'Livia’s eyes', 'Perfect hits deal +15%.'),
  M('campana', { parryBreak: 10 }, 'La campana lontana', 'Ogni parata incrina chi attacca.', 'The distant bell', 'Each parry cracks the attacker.'),
  M('filo', { firstBurn: 1 }, 'Il filo rosso', 'Il primo colpo di ogni scontro brucia.', 'The red thread', 'The first blow of a fight burns.'),
  M('tasca', { light: 0.5 }, 'La tasca bucata', 'Più luce dagli scontri (+50%).', 'The torn pocket', 'More light from fights (+50%).'),
  M('coperta', { mend: 0.08 }, 'La coperta di lana', 'Sotto un terzo di salute, recupera a ogni turno.', 'The wool blanket', 'Below a third health, mend each turn.'),
  M('fiammifero', { endure: 1 }, 'L’ultimo fiammifero', 'Una volta per scontro resta in piedi.', 'The last match', 'Once per fight, stays standing.'),
  M('mira', { spark: 0.6 }, 'Mani ferme', 'Le scintille fanno +60%.', 'Steady hands', 'Sparks deal +60%.'),
  M('controcanto', { counter: 0.5 }, 'Il controcanto', 'I contrattacchi fanno +50%.', 'The countersong', 'Counters deal +50%.'),
  M('pozzanghera', { jumpAp: 1 }, 'Saltare le pozzanghere', 'Ogni salto riuscito dà 1 PA.', 'Puddle jumping', 'Each jump grants 1 AP.'),
  M('respiro', { dodgeAp: 0.5 }, 'Un respiro', 'Schivando, a volte si guadagna 1 PA.', 'One breath', 'Dodging sometimes grants 1 AP.'),
  M('miele', { healUp: 0.3 }, 'Miele nel tè', 'Le cure ricevute valgono +30%.', 'Honey in tea', 'Healing received +30%.'),
  M('ago', { shield: 0.1 }, 'Ago e filo', 'Si comincia con un piccolo scudo.', 'Needle and thread', 'Start with a small shield.'),
  M('fame', { killAp: 2 }, 'La fame del mattino', 'Abbattendo un nemico: +2 PA.', 'Morning hunger', 'Defeating an enemy: +2 AP.'),
  M('rete', { guard: 0.12 }, 'La rete rattoppata', 'Danni subiti −12%.', 'The mended net', 'Damage taken −12%.'),
  M('lettera', { fury: 0.25 }, 'La lettera non spedita', 'Sotto un terzo di salute: danni +25%.', 'The unsent letter', 'Below a third health: damage +25%.'),
];

export const MEMORY = Object.fromEntries(MEMORIES.map((m) => [m.id, m]));
