/* Shake Me — glasses, tools, ice, garnishes (pure data) */

export const GLASSES = [
  { id: 'cocktail', cap: 180, it: 'Coppetta', en: 'Cocktail glass' },
  { id: 'rocks', cap: 300, it: 'Old fashioned', en: 'Rocks glass' },
  { id: 'highball', cap: 350, it: 'Tumbler alto', en: 'Highball' },
  { id: 'flute', cap: 200, it: 'Flûte', en: 'Flute' },
  { id: 'wine', cap: 450, it: 'Calice', en: 'Wine glass' },
  { id: 'goblet', cap: 350, it: 'Coppa a stelo', en: 'Goblet' },
  { id: 'mule', cap: 400, it: 'Tazza di rame', en: 'Copper mug' },
  { id: 'irish', cap: 280, it: 'Tazza da Irish coffee', en: 'Irish coffee glass' },
  { id: 'julep', cap: 320, it: 'Coppa da julep', en: 'Julep cup' },
  { id: 'tiki', cap: 450, it: 'Bicchiere tiki', en: 'Tiki glass' },
];

export const ICES = ['none', 'cubes', 'crushed'];

/** Every method has a tool; build and swizzle happen in the glass. */
export const TOOLS = [
  { id: 'shaker', method: 'shake' },
  { id: 'mixing', method: 'stir' },
  { id: 'blender', method: 'blend' },
  { id: 'glass', method: 'build' },
];
export const TOOL_FOR = { shake: 'shaker', stir: 'mixing', blend: 'blender', build: 'glass', swizzle: 'glass' };

/** Hold actions: seconds to fill the meter, and the good band. */
export const ACTIONS = {
  shake: { tool: 'shaker', full: 6, band: [0.45, 0.85], needsIce: true },
  stir: { tool: 'mixing', full: 8, band: [0.4, 0.85], needsIce: true },
  blend: { tool: 'blender', full: 5, band: [0.4, 0.85], needsIce: true },
  swizzle: { tool: 'glass', full: 5, band: [0.4, 0.9], needsIce: false },
};
export const MUDDLE = { min: 4, max: 12 };

export const GARNISHES = [
  { id: 'lemon-zest', icon: '🍋', it: 'Scorza di limone', en: 'Lemon zest' },
  { id: 'orange-zest', icon: '🍊', it: 'Scorza d’arancia', en: 'Orange zest' },
  { id: 'lime-zest', icon: '🟢', it: 'Scorza di lime', en: 'Lime peel' },
  { id: 'lemon-spiral', icon: '🌀', it: 'Spirale di limone', en: 'Lemon spiral' },
  { id: 'lemon-slice', icon: '🍋', it: 'Fetta di limone', en: 'Lemon slice' },
  { id: 'lemon-wedge', icon: '🍋', it: 'Spicchio di limone', en: 'Lemon wedge' },
  { id: 'orange-slice', icon: '🍊', it: 'Fetta d’arancia', en: 'Orange slice' },
  { id: 'lime-slice', icon: '🟢', it: 'Fetta di lime', en: 'Lime slice' },
  { id: 'cherry', icon: '🍒', it: 'Ciliegina', en: 'Cherry' },
  { id: 'olive', icon: '🫒', it: 'Oliva verde', en: 'Green olive' },
  { id: 'mint', icon: '🌿', it: 'Rametto di menta', en: 'Mint sprig' },
  { id: 'nutmeg', icon: '🟤', it: 'Noce moscata grattugiata', en: 'Grated nutmeg' },
  { id: 'raspberries', icon: '🍓', it: 'Lamponi', en: 'Raspberries' },
  { id: 'blackberries', icon: '🫐', it: 'More', en: 'Blackberries' },
  { id: 'pineapple', icon: '🍍', it: 'Ananas', en: 'Pineapple' },
  { id: 'coffee-beans', icon: '☕', it: 'Tre chicchi di caffè', en: 'Three coffee beans' },
  { id: 'celery', icon: '🥬', it: 'Gambo di sedano', en: 'Celery stalk' },
  { id: 'chili', icon: '🌶️', it: 'Peperoncino', en: 'Chili' },
  { id: 'ginger', icon: '🫚', it: 'Zenzero candito', en: 'Candied ginger' },
  { id: 'passion-fruit', icon: '🟡', it: 'Mezzo frutto della passione', en: 'Half passion fruit' },
  { id: 'grapes', icon: '🍇', it: 'Acini d’uva bianca', en: 'White grapes' },
  { id: 'bitters-drops', icon: '🟥', it: 'Gocce di bitter sulla schiuma', en: 'Bitters drops on the foam' },
];
export const GARNISH = Object.fromEntries(GARNISHES.map((g) => [g.id, g]));
export const RIMS = ['salt', 'sugar'];
