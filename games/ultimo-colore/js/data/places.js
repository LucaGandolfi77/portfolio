/* ============================================================
   Ultimo Colore — what lives in the open lagoon (pure data)
   ------------------------------------------------------------
   wild: roaming Faded; they come back when the party rests.
   chests: lost lanterns with supplies. statues: people turned
   to salt, each with a few words. `after`: appears only once
   that story point is done.
   ============================================================ */

const W = (id, x, y, enemies, art, roam = 70, after = null) => ({ id, x, y, enemies, art, roam, after });

export const WILD = [
  W('w-molo', 1470, 2240, ['cocci'], 'darsena', 80, 'stiva'),
  W('w-panni', 520, 2300, ['spenta'], 'canale', 80, 'stiva'),
  W('w-sud', 1380, 1960, ['spenta'], 'campanile', 110),
  W('w-reti', 660, 1930, ['cocci', 'cocci'], 'secche', 90),
  W('w-alghe', 860, 1690, ['alga'], 'secche', 100),
  W('w-ovest', 240, 1450, ['granchio', 'cocci'], 'secche', 80),
  W('w-est', 1850, 1920, ['spenta'], 'campanile', 90),
  W('w-centro', 1270, 1400, ['cocci', 'spenta'], 'campanile', 100),
  W('w-salici', 560, 1090, ['alga', 'granchio'], 'secche', 90),
  W('w-banco', 1550, 1010, ['granchio', 'cocci'], 'secche', 90),
  W('w-secca', 780, 830, ['alga', 'cocci'], 'secche', 80),
  W('w-oriente', 1790, 760, ['spenta', 'spenta'], 'secche', 70),
  W('w-nord', 620, 500, ['alga', 'spenta'], 'cervo', 70),
  W('w-vetro', 1760, 490, ['cocci', 'cocci', 'cocci'], 'cervo', 70),
];

const C = (id, x, y, olio, cera, light) => ({ id, x, y, olio, cera, light });

export const CHESTS = [
  C('c-casa', 1472, 2688, 1, 0, 10),
  C('c-porto', 548, 2480, 0, 1, 15),
  C('c-isolotto', 1850, 1420, 1, 0, 30),
  C('c-sud', 160, 2000, 1, 1, 20),
  C('c-reti', 280, 1810, 2, 0, 20),
  C('c-scoglio', 620, 1380, 0, 1, 30),
  C('c-salici', 150, 760, 2, 1, 40),
  C('c-banco', 1870, 1010, 1, 0, 45),
  C('c-nord', 190, 470, 2, 1, 60),
];

const T = (id, x, y, pose, it, en) => ({ id, x, y, pose, it, en });

export const STATUES = [
  T('s-bimbo', 1215, 2900, 'run', 'Un bambino che corre, un piede sollevato. In mano un filo; l’aquilone non c’è più.', 'A child running, one foot in the air. A string in his hand; the kite is gone.'),
  T('s-carte', 640, 2478, 'sit', 'Due vecchi giocano a carte. Uno bara: ha un asso nella manica di sale. L’altro lo sta guardando, e sorride.', 'Two old men at cards. One is cheating: an ace up his sleeve of salt. The other is watching him, smiling.'),
  T('s-salute', 1550, 2490, 'reach', 'Una donna con la mano alzata verso il mare. Qualcuno le ha legato un nastro al polso, e il nastro è ancora giallo.', 'A woman with her hand raised to the sea. Someone tied a ribbon to her wrist, and the ribbon is still yellow.'),
  T('s-pescatore', 455, 1835, 'sit', 'Un pescatore rammenda. L’ago è a metà del punto. La rete accanto a lui è finita: era l’ultimo nodo.', 'A fisherman mending. The needle is half through the stitch. The net beside him is finished: this was the last knot.'),
  T('s-sacrestano', 1748, 1712, 'stand', 'Il sacrestano tiene le chiavi. La porta del campanile è sott’acqua da prima che lui diventasse sale. Le teneva lo stesso.', 'The sexton holds his keys. The tower door was under water before he turned to salt. He kept them all the same.'),
  T('s-sposi', 640, 1362, 'stand', 'Due sposi su uno scoglio troppo piccolo per due. Si sono arrangiati.', 'A bride and groom on a rock too small for two. They managed.'),
  T('s-pittore', 1730, 880, 'reach', 'Un uomo davanti a un cavalletto. Sulla tela ha dipinto solo i salici, e lasciato un buco dove andava il cielo: il blu era già finito.', 'A man at an easel. He painted only the willows, and left a gap where the sky should be: blue had already ended.'),
  T('s-madre', 1140, 262, 'bread', 'Una donna sola nella radura, con una coperta ripiegata fra le braccia. Guarda dove il vetro è più fitto.', 'A woman alone in the clearing, a folded blanket in her arms. She looks toward where the glass grows thickest.'),
];

/** Ada, painted into the world beside her counter. */
export const ADA = { x: 1128, y: 2865, pose: 'bread' };
