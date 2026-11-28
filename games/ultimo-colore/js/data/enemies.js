/* ============================================================
   Ultimo Colore — the Faded of Act I (pure data)
   ------------------------------------------------------------
   Every move is a rhythm: hits at fixed milliseconds from the
   start of the wind-up. kind 'strike' can be dodged or parried,
   'low' must be jumped. feint: a false start at that time.
   ============================================================ */

const hit = (at, mult = 1, kind = 'strike') => ({ at, mult, kind });
const mv = (id, it, en, target, hits, extra = {}) => ({ id, name: { it, en }, target, hits, ...extra });

export const ENEMIES = {
  cocci: {
    name: { it: 'Cocci di bottiglia', en: 'Bottle shards' }, hp: 74, atk: 13, spd: 12, brk: 40, xp: 16, light: 8,
    lore: { it: 'Vetro verde che ricorda di essere stato un brindisi.', en: 'Green glass that remembers being a toast.' },
    moves: [
      mv('taglio', 'Taglio', 'Cut', 'one', [hit(1100)]),
      mv('doppio', 'Doppio taglio', 'Double cut', 'one', [hit(1000, 0.65), hit(1550, 0.65)]),
    ],
  },
  granchio: {
    name: { it: 'Granchio di muschio', en: 'Moss crab' }, hp: 112, atk: 15, spd: 8, brk: 60, xp: 24, light: 12,
    lore: { it: 'Porta sul guscio il prato di un cortile che non c’è più.', en: 'It carries on its shell the lawn of a yard that is gone.' },
    moves: [
      mv('pinza', 'Pinza', 'Pincer', 'one', [hit(1300, 1.25)]),
      mv('spazzata', 'Spazzata', 'Sweep', 'all', [hit(1150, 0.75, 'low')]),
    ],
  },
  spenta: {
    name: { it: 'Lanterna spenta', en: 'Dead lantern' }, hp: 94, atk: 16, spd: 11, brk: 46, xp: 24, light: 14,
    lore: { it: 'Cerca ancora qualcuno che la accenda.', en: 'It is still looking for someone to light it.' },
    moves: [
      mv('finta', 'Finta', 'Feint', 'one', [hit(1750, 1.2)], { feint: 950 }),
      mv('soffio', 'Soffio', 'Gust', 'all', [hit(1400, 0.65)]),
    ],
  },
  alga: {
    name: { it: 'Nodo d’alghe', en: 'Weed knot' }, hp: 134, atk: 15, spd: 9, brk: 70, xp: 30, light: 16,
    lore: { it: 'I capelli verdi della laguna, quando era viva.', en: 'The green hair of the lagoon, when it was alive.' },
    moves: [
      mv('frusta', 'Tre fruste', 'Three lashes', 'one', [hit(950, 0.5), hit(1450, 0.5), hit(2250, 0.6)]),
      mv('onda', 'Onda bassa', 'Low wave', 'all', [hit(1600, 0.85, 'low')]),
    ],
  },
  airone: {
    name: { it: 'Airone di vetro', en: 'Glass heron' }, hp: 420, atk: 20, spd: 12, brk: 110, xp: 80, light: 45, boss: true,
    lore: { it: 'Stava immobile nelle secche. Qualcuno lo guardava ogni mattina.', en: 'It stood still in the shallows. Someone watched it every morning.' },
    moves: [
      mv('becco', 'Becco', 'Beak', 'one', [hit(1000, 0.7), hit(1450, 0.75)]),
      mv('ali', 'Ali', 'Wings', 'all', [hit(1500, 0.8)]),
      mv('passi', 'Tre passi', 'Three steps', 'one', [hit(900, 0.5, 'low'), hit(1500, 0.5, 'low'), hit(2150, 0.8)]),
    ],
  },
  cervo: {
    name: { it: 'Il Cervo di Vetro', en: 'The Glass Stag' }, hp: 1150, atk: 25, spd: 11, brk: 210, xp: 220, light: 120, boss: true,
    lore: { it: 'Tutto il verde che resta, con le corna.', en: 'All the green that is left, with antlers.' },
    moves: [
      mv('carica', 'Carica', 'Charge', 'one', [hit(1650, 1.35)]),
      mv('corna', 'Corna', 'Antlers', 'one', [hit(950, 0.55), hit(1350, 0.55), hit(1750, 0.65)]),
      mv('zoccoli', 'Zoccoli', 'Hooves', 'all', [hit(1100, 0.6, 'low'), hit(1750, 0.65, 'low')]),
    ],
    // below half health the stag remembers it can break
    phase: {
      at: 0.5, atk: 1.12,
      line: { it: 'Il vetro si incrina. Il Cervo si alza sulle zampe.', en: 'The glass cracks. The Stag rears.' },
      moves: [
        mv('pioggia', 'Pioggia di vetro', 'Glass rain', 'all', [hit(1050, 0.35), hit(1500, 0.35), hit(1950, 0.35), hit(2800, 0.55)], { feint: 2350 }),
        mv('lamento', 'Lamento', 'Lament', 'all', [hit(2000, 0.9, 'low')], { feint: 1200 }),
      ],
    },
  },
};
