/* ============================================================
   Seba — the wardrobe: shapes × colours, layered on the rig
   ============================================================ */
export const SLOTS = ['hat', 'glasses', 'neck', 'top', 'acc', 'crest'];

export const COLORS = {
  nero: { hex: '#17151c', it: 'nero', en: 'black' },
  rosso: { hex: '#e5384f', it: 'rosso', en: 'red' },
  blu: { hex: '#2f6bff', it: 'blu', en: 'blue' },
  verde: { hex: '#2fd18a', it: 'verde acido', en: 'acid green' },
  rosa: { hex: '#ff62c0', it: 'rosa shocking', en: 'hot pink' },
  oro: { hex: '#f4c24b', it: 'oro', en: 'gold' },
  viola: { hex: '#8e55e8', it: 'viola', en: 'purple' },
  bianco: { hex: '#f4efe6', it: 'bianco', en: 'white' },
};

/** [shape, slot, base price, level, Italian name, English name, colours] */
const SHAPES = [
  ['cappellino', 'hat', 12, 1, 'Cappellino', 'Cap', ['rosso', 'nero', 'verde']],
  ['pescatore', 'hat', 18, 2, 'Cappello da pescatore', 'Bucket hat', ['rosa', 'blu', 'bianco']],
  ['cilindro', 'hat', 45, 5, 'Cilindro', 'Top hat', ['nero', 'viola']],
  ['corona', 'hat', 120, 7, 'Corona da re dell’after', 'After-party crown', ['oro']],
  ['cuffie', 'hat', 30, 3, 'Cuffie', 'Headphones', ['nero', 'rosa', 'verde']],
  ['goccia', 'glasses', 10, 1, 'Occhiali a goccia', 'Aviators', ['nero', 'oro', 'blu']],
  ['barra', 'glasses', 22, 2, 'Occhiali a barra', 'Visor shades', ['verde', 'rosa', 'rosso']],
  ['cuore', 'glasses', 26, 3, 'Occhiali a cuore', 'Heart glasses', ['rosa', 'rosso']],
  ['tondi', 'glasses', 14, 2, 'Occhialini tondi', 'Round specs', ['nero', 'oro']],
  ['papillon', 'neck', 6, 1, 'Papillon', 'Bow tie', ['rosso', 'nero', 'blu', 'verde', 'oro']],
  ['foulard', 'neck', 16, 2, 'Foulard', 'Scarf', ['viola', 'rosso', 'bianco']],
  ['catena', 'neck', 55, 4, 'Catenona', 'Big chain', ['oro', 'bianco']],
  ['gilet', 'top', 8, 1, 'Gilet da barman', 'Bartender vest', ['nero', 'rosso', 'blu', 'viola']],
  ['rete', 'top', 28, 3, 'Canotta a rete', 'Mesh top', ['nero', 'verde', 'rosa']],
  ['hawaii', 'top', 34, 3, 'Camicia floreale', 'Flower shirt', ['blu', 'rosso', 'verde']],
  ['giacca', 'top', 60, 5, 'Giacca catarifrangente', 'Hi-vis jacket', ['verde', 'oro']],
  ['mantello', 'top', 90, 6, 'Mantello da after', 'After cape', ['viola', 'rosso', 'nero']],
  ['braccialetti', 'acc', 9, 1, 'Braccialetti fluo', 'Glow bracelets', ['verde', 'rosa', 'blu']],
  ['fischietto', 'acc', 15, 2, 'Fischietto', 'Whistle', ['oro', 'rosso']],
  ['shaker', 'acc', 24, 3, 'Shaker personale', 'Personal shaker', ['bianco', 'oro']],
  ['glowstick', 'acc', 7, 1, 'Stecca luminosa', 'Glow stick', ['verde', 'rosa', 'blu', 'oro']],
  ['cresta', 'crest', 20, 2, 'Tinta per la cresta', 'Crest dye', ['rosa', 'blu', 'verde', 'viola', 'rosso', 'bianco', 'oro', 'nero']],
];

export const WARDROBE = SHAPES.flatMap(([shape, slot, price, level, it, en, colors]) =>
  colors.map((color, i) => ({
    id: `${shape}-${color}`, shape, slot, color, level,
    price: price + i * 2,
    name: { it: `${it} ${COLORS[color].it}`, en: `${COLORS[color].en} ${en.toLowerCase()}` },
  })));

export const itemById = (id) => WARDROBE.find((w) => w.id === id);

export const STARTER = ['gilet-nero', 'papillon-rosso'];
export const DEFAULT_OUTFIT = { hat: null, glasses: null, neck: 'papillon-rosso', top: 'gilet-nero', acc: null, crest: null };
