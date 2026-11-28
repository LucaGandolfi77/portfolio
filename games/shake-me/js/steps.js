/* ============================================================
   Shake Me — the method, written by the game from the data
   ------------------------------------------------------------
   Also `perfectPlay`: the moves that make a recipe exactly, used
   by the tests and by the "show me" button of the school.
   ============================================================ */
import { BY_ID } from './data/ingredients.js';
import { GLASSES, GARNISH, TOOL_FOR, ACTIONS, MUDDLE } from './data/bar.js';
import * as W from './workbench.js';

const T = {
  it: {
    unit: { ml: 'ml', dash: 'spruzzi', drop: 'gocce', bs: 'bar spoon', tsp: 'cucchiaini', tbsp: 'cucchiai', pc: 'pz', pinch: 'pizzichi', some: 'un goccio di' },
    one: { dash: 'spruzzo', drop: 'goccia', tsp: 'cucchiaino', tbsp: 'cucchiaio', pc: 'pz', pinch: 'pizzico' },
    of: 'di',
    rim: { salt: 'Bagna il bordo del bicchiere e passalo nel sale.', sugar: 'Bagna il bordo del bicchiere e passalo nello zucchero.' },
    rimOpt: 'Se vuoi, fai mezzo bordo di sale.',
    glassIce: { cubes: 'Bicchiere: {g}, pieno di ghiaccio a cubetti.', crushed: 'Bicchiere: {g}, pieno di ghiaccio tritato.', none: 'Bicchiere: {g}, ben freddo e senza ghiaccio.', any: 'Bicchiere: {g}, col ghiaccio che preferisci.' },
    rinse: 'Profuma il bicchiere vuoto con {i}.',
    into: { shaker: 'Nello shaker', mixing: 'Nel mixing glass', blender: 'Nel frullatore', glass: 'Nel bicchiere' },
    muddle: 'Pesta con il pestello: {i}.',
    act: {
      shake: 'Aggiungi ghiaccio e shakera con energia per qualche secondo.',
      stir: 'Aggiungi ghiaccio e mescola con il bar spoon finché è freddo.',
      blend: 'Aggiungi ghiaccio tritato e frulla finché è liscio.',
      swizzle: 'Frulla con lo swizzle stick, il bastoncino tra le mani, finché il bicchiere si appanna.',
      build: 'Dai una mescolata leggera.',
    },
    strain: { shaker: 'Filtra nel bicchiere.', mixing: 'Filtra nel bicchiere.', blender: 'Versa nel bicchiere.' },
    top: 'Colma con {i}.',
    float: 'Versa piano {i} sul dorso del cucchiaio, che resti in superficie.',
    sink: 'Versa {i} piano: scende sul fondo, non mescolare.',
    garnish: 'Guarnisci con {g}.',
    garnishOpt: 'A piacere: {g}.',
    or: ' o ',
    and: ', ',
    opt: '(facoltativo)',
  },
  en: {
    unit: { ml: 'ml', dash: 'dashes', drop: 'drops', bs: 'bar spoon', tsp: 'teaspoons', tbsp: 'tablespoons', pc: 'pc', pinch: 'pinches', some: 'a splash of' },
    one: { dash: 'dash', drop: 'drop', tsp: 'teaspoon', tbsp: 'tablespoon', pc: 'pc', pinch: 'pinch' },
    of: '',
    rim: { salt: 'Wet the rim of the glass and dip it in salt.', sugar: 'Wet the rim of the glass and dip it in sugar.' },
    rimOpt: 'If you like, give it half a salt rim.',
    glassIce: { cubes: 'Fill the {g} with ice cubes.', crushed: 'Fill the {g} with crushed ice.', none: 'Take a well-chilled {g}.', any: 'Take the {g}, with ice as you like.' },
    rinse: 'Rinse the empty glass with {i}.',
    into: { shaker: 'In the shaker', mixing: 'In the mixing glass', blender: 'In the blender', glass: 'In the glass' },
    muddle: 'Muddle: {i}.',
    act: {
      shake: 'Add ice and shake hard for a few seconds.',
      stir: 'Add ice and stir with the bar spoon until cold.',
      blend: 'Add crushed ice and blend until smooth.',
      swizzle: 'Swizzle, spinning the stick between your hands, until the glass frosts.',
      build: 'Give it a gentle stir.',
    },
    strain: { shaker: 'Strain into the glass.', mixing: 'Strain into the glass.', blender: 'Pour into the glass.' },
    top: 'Top up with {i}.',
    float: 'Pour {i} slowly over the back of a spoon so it floats.',
    sink: 'Pour {i} slowly: it sinks, do not stir.',
    garnish: 'Garnish with {g}.',
    garnishOpt: 'If you like: {g}.',
    or: ' or ',
    and: ', ',
    opt: '(optional)',
  },
};

const fmt = (n) => (Number.isInteger(n) ? String(n) : String(n).replace('.', ','));
const nameOf = (id, lang) => (lang === 'it' ? lower(BY_ID[id].name.it) : BY_ID[id].name.en);
/** Italian common nouns go lower case inside a sentence; names that start with a capital in the middle stay. */
const KEEP = /^(Old Tom|Cognac|Calvados|Scotch|Irish|Porto|Champagne|Prosecco|Crème|Curaçao|Cachaça|Pisco|Salsa Worcestershire)/;
const lower = (s) => (KEEP.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));
const glassName = (id, lang) => GLASSES.find((g) => g.id === id)[lang].toLowerCase();

export function doseText(line, lang) {
  const t = T[lang];
  const names = line.ids.map((id) => nameOf(id, lang)).join(t.or);
  let s;
  if (line.unit === 'some') s = `${t.unit.some} ${names}`;
  else if (line.unit === 'ml') s = `${fmt(line.amount)} ml ${t.of} ${names}`.replace('  ', ' ');
  else {
    const u = line.amount === 1 && t.one[line.unit] ? t.one[line.unit] : t.unit[line.unit];
    s = `${fmt(line.amount)} ${u} ${t.of} ${names}`.replace('  ', ' ');
  }
  return line.optional ? `${s} ${t.opt}` : s;
}

/** The numbered method, in the player's language. */
export function stepsOf(recipe, lang) {
  const t = T[lang];
  const out = [];
  const tool = TOOL_FOR[recipe.method];
  const glass = glassName(recipe.glass[0], lang) + (recipe.glass[1] ? t.or + glassName(recipe.glass[1], lang) : '');
  if (recipe.rim) out.push(recipe.rimOptional ? t.rimOpt : t.rim[recipe.rim]);
  out.push(t.glassIce[recipe.ice === '*' ? 'any' : recipe.ice].replace('{g}', glass));
  const rinse = recipe.ings.filter((l) => l.stage === 'rinse');
  for (const l of rinse) out.push(t.rinse.replace('{i}', doseText(l, lang)));
  const base = recipe.ings.filter((l) => l.stage === 'base');
  const muddled = base.filter((l) => l.ids.some((id) => BY_ID[id].muddle));
  if (recipe.muddle && muddled.length) out.push(t.muddle.replace('{i}', muddled.map((l) => doseText(l, lang)).join(t.and)));
  const rest = recipe.muddle ? base.filter((l) => !muddled.includes(l)) : base;
  if (rest.length) out.push(`${t.into[tool]}: ${rest.map((l) => doseText(l, lang)).join(t.and)}.`);
  out.push(t.act[recipe.method]);
  if (tool !== 'glass') out.push(t.strain[tool]);
  for (const l of recipe.ings.filter((x) => x.stage === 'top' || x.stage === 'float')) {
    const key = l.stage === 'top' ? 'top' : BY_ID[l.ids[0]].dense ? 'sink' : 'float';
    out.push(t[key].replace('{i}', doseText(l, lang)));
  }
  const g = recipe.garnish.filter((x) => !x.optional), go = recipe.garnish.filter((x) => x.optional);
  const gName = (x) => x.ids.map((id) => GARNISH[id][lang].toLowerCase()).join(t.or);
  if (g.length) out.push(t.garnish.replace('{g}', g.map(gName).join(t.and)));
  if (go.length) out.push(t.garnishOpt.replace('{g}', go.map(gName).join(t.and)));
  return out;
}

/**
 * The exact moves for a recipe: [ [fn, ...args] ].
 * Optional ingredients and garnishes are left out.
 */
export function perfectPlay(recipe) {
  const moves = [];
  const tool = TOOL_FOR[recipe.method];
  const isBuild = tool === 'glass';
  moves.push(['chooseGlass', recipe.glass[0]]);
  moves.push(['setGlassIce', recipe.ice === '*' ? 'cubes' : recipe.ice]);
  if (recipe.rim && !recipe.rimOptional) moves.push(['setRim', recipe.rim]);
  moves.push(['chooseTool', tool]);
  const add = (l, target) => moves.push(['pour', l.ids[0], l.unit === 'some' ? 1 : l.amount, l.unit, target]);
  const lines = recipe.ings.filter((l) => !l.optional);
  for (const l of lines.filter((x) => x.stage === 'rinse')) add(l, 'glass');
  const base = lines.filter((x) => x.stage === 'base');
  const muddled = base.filter((l) => l.ids.some((id) => BY_ID[id].muddle));
  if (recipe.muddle) {
    for (const l of muddled) add(l, isBuild ? 'glass' : 'tool');
    moves.push(['muddle', MUDDLE.min + 2]);
  }
  for (const l of recipe.muddle ? base.filter((x) => !muddled.includes(x)) : base) add(l, isBuild ? 'glass' : 'tool');
  if (!isBuild) {
    moves.push(['setToolIce', true]);
    const band = ACTIONS[recipe.method].band;
    moves.push(['act', recipe.method, (band[0] + band[1]) / 2]);
    moves.push(['strain']);
  } else if (recipe.method === 'swizzle') {
    const band = ACTIONS.swizzle.band;
    moves.push(['act', 'swizzle', (band[0] + band[1]) / 2]);
  }
  for (const l of lines.filter((x) => x.stage === 'top' || x.stage === 'float')) add(l, 'glass');
  for (const g of recipe.garnish.filter((x) => !x.optional)) moves.push(['toggleGarnish', g.ids[0]]);
  return moves;
}

export function play(bench, moves) {
  for (const [fn, ...args] of moves) {
    const err = W[fn](bench, ...args);
    if (err) throw new Error(`${fn}(${args.join(', ')}): ${err}`);
  }
  return bench;
}
