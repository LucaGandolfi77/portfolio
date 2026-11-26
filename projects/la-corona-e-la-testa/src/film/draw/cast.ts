/* Who is who: costume, hair and colours of every character. */
export type Hair = 'cropped' | 'short' | 'long' | 'shorn' | 'curly' | 'bun' | 'balding' | 'messy' | 'flow' | 'none';
export type Hat = 'tophat' | 'bicorne' | 'cap' | 'skull' | 'bonnet' | 'shako' | 'hood' | 'judge' | 'galea' | 'laurel' | 'diadem' | 'veil' | 'coif';
export type Beard = 'stubble' | 'full' | 'side' | 'mustache';

export interface Look {
  skin: string;
  hair: Hair;
  hairColor: string;
  coat: string;
  legs: string;
  /** 0 = short jacket, 1 = down to the ankles. */
  coatLen: number;
  dress?: boolean;
  hat?: Hat;
  hatColor?: string;
  beard?: Beard;
  beardColor?: string;
  shirt?: string;
  vest?: string;
  sash?: string;
  apron?: string;
  scarf?: string;
  cross?: boolean;
  /** Roman dress: a cloak behind the body, a toga drape, a cuirass with leather strips. */
  cape?: string;
  toga?: string;
  armor?: string;
  /** A gold border at the hem and the cuffs (imperial and court dress). */
  trim?: string;
  /** Sacred light round the head. */
  halo?: boolean;
  /** Shoulder width factor and body height factor. */
  build?: number;
  size?: number;
  /** Children have bigger heads and eyes. */
  child?: boolean;
  blush?: boolean;
  lashes?: boolean;
  nose?: number;
  gap?: boolean;
}

const base: Look = { skin: '#dca88a', hair: 'short', hairColor: '#3a2a1e', coat: '#8a7a64', legs: '#6a4a34', coatLen: 0.45 };
const look = (o: Partial<Look>): Look => ({ ...base, ...o });
const woman = (o: Partial<Look>): Look => look({ dress: true, coatLen: 1, blush: true, lashes: true, build: 0.86, size: 0.95, nose: 0.75, ...o });
const child = (o: Partial<Look>): Look => look({ child: true, size: 0.6, build: 0.8, blush: true, nose: 0.55, ...o });
const legionary = (o: Partial<Look> = {}): Look => look({ coat: '#9a2a24', armor: '#b8b4aa', cape: '#7a1c1a', hat: 'galea', hatColor: '#c8c4b8', legs: '#7a5a3a', coatLen: 0.32, beard: 'stubble', build: 1.12, ...o });

export const CAST = {
  /* Domninus: the emperor's chamberlain, then the fugitive, then the saint. */
  donCourt: look({ hair: 'short', hairColor: '#3a2618', coat: '#e8dcc4', toga: '#f4ecdc', trim: '#c8962e', legs: '#c8a878', beard: 'full', beardColor: '#3a2618', coatLen: 0.85, build: 1.08, size: 1.05, nose: 1.05 }),
  donTravel: look({ hair: 'short', hairColor: '#3a2618', coat: '#8a7458', cape: '#5a4a3a', legs: '#6a5038', beard: 'full', beardColor: '#3a2618', coatLen: 0.62, build: 1.08, size: 1.05, nose: 1.05 }),
  donSaint: look({ skin: '#f0dcc4', hair: 'short', hairColor: '#4a3220', coat: '#f8f2e4', cape: '#e8c878', trim: '#f0c860', legs: '#e8dcc0', beard: 'full', beardColor: '#4a3220', coatLen: 0.95, build: 1.08, size: 1.05, nose: 1.05, halo: true }),
  maximian: look({ skin: '#d8a080', hair: 'curly', hairColor: '#4a3a30', coat: '#5a1c5e', cape: '#6a1a68', trim: '#e8b840', armor: '#d8b458', legs: '#8a6a3a', hat: 'diadem', hatColor: '#f0c050', beard: 'full', beardColor: '#4a3a30', coatLen: 0.4, build: 1.28, size: 1.1, nose: 1.3 }),
  eutychius: look({ skin: '#d8b098', hair: 'balding', hairColor: '#d8d2c8', coat: '#a89878', legs: '#7a6a54', beard: 'full', beardColor: '#e0dad0', coatLen: 0.8, size: 0.94 }),
  valerius: legionary({ hair: 'short', hairColor: '#5a3418', beard: 'stubble', beardColor: '#5a3418', hatColor: '#d8b458', cape: '#a01e1c', armor: '#c8c0b0', size: 1.06, build: 1.18 }),
  valeriusBare: legionary({ hat: undefined, hair: 'short', hairColor: '#5a3418', beard: 'stubble', beardColor: '#5a3418', cape: '#a01e1c', armor: '#c8c0b0', size: 1.06, build: 1.18 }),
  valeriusPilgrim: look({ hair: 'short', hairColor: '#8a7a6a', coat: '#6a5a44', cape: '#4a3c30', legs: '#5a4a36', beard: 'full', beardColor: '#8a7a6a', coatLen: 0.9, size: 1.06, build: 1.14 }),
  legionary: legionary(),
  guard: legionary({ cape: '#5a1a4a', hatColor: '#d8b458', armor: '#d8b458' }),
  courtier: look({ coat: '#c8b8a0', toga: '#efe6d4', trim: '#9a2a2a', legs: '#b8a080', coatLen: 0.85, hair: 'curly', hairColor: '#2a1a12' }),
  courtier2: look({ coat: '#9ab0b8', toga: '#e6ecee', legs: '#8a9a9a', coatLen: 0.85, hair: 'balding', hairColor: '#8a8070', beard: 'full', beardColor: '#8a8070' }),
  lady: woman({ hair: 'bun', hairColor: '#1e140e', coat: '#3a6a8a', cape: '#c89a40', trim: '#e8c060' }),
  priest: look({ coat: '#f4f0e8', toga: '#fbf8f0', trim: '#c84a2a', legs: '#d8d0c0', coatLen: 1, hat: 'laurel', hatColor: '#6a8a3a', hair: 'balding', hairColor: '#c8c0b0', beard: 'full', beardColor: '#d8d0c8' }),
  sabinus: look({ skin: '#d8ac94', hair: 'flow', hairColor: '#eeeae2', coat: '#6a6a5a', legs: '#4a4a3c', beard: 'full', beardColor: '#eeeae2', coatLen: 0.9, size: 0.97 }),
  marcella: woman({ hair: 'long', hairColor: '#5a3018', coat: '#b88a6a', scarf: '#6a8a9a' }),
  hostess: woman({ skin: '#e0aa88', hair: 'bun', hairColor: '#7a4a2a', coat: '#7a4a38', apron: '#d8ccb0', hat: 'veil', hatColor: '#c8b8a0', build: 1.1, size: 0.98 }),
  presbyter: look({ hair: 'balding', hairColor: '#8a7a6a', coat: '#7a6a5a', legs: '#5a4a3a', beard: 'full', beardColor: '#9a8a7a', coatLen: 1, size: 0.98 }),
  faithfulA: woman({ hair: 'long', hairColor: '#2a1810', coat: '#8a5a4a', hat: 'veil', hatColor: '#6a5a6a' }),
  faithfulB: look({ hair: 'curly', hairColor: '#4a2a18', coat: '#5a6a4a', legs: '#4a4030', beard: 'stubble', coatLen: 0.5 }),
  farmer: look({ skin: '#d09870', hair: 'messy', hairColor: '#6a4a24', coat: '#8a7a4a', legs: '#5a4a30', beard: 'full', beardColor: '#6a4a24', apron: '#a89068', coatLen: 0.4, build: 1.12 }),
  lucius: child({ hair: 'curly', hairColor: '#7a4a24', coat: '#c8b890', legs: '#8a7a5a', coatLen: 0.55 }),
  widow: woman({ hair: 'long', hairColor: '#3a2a22', coat: '#3c3448', hat: 'veil', hatColor: '#2a2430', blush: false, size: 0.96 }),
  master: look({ hair: 'short', hairColor: '#8a8478', coat: '#6a4a3a', legs: '#4a3428', apron: '#c8b898', hat: 'coif', hatColor: '#e8e0d0', beard: 'full', beardColor: '#9a9488', coatLen: 0.75, size: 1.0 }),
  apprentice: look({ hair: 'messy', hairColor: '#c8902e', coat: '#4a6a8a', legs: '#6a4a3a', apron: '#d8ccb0', coatLen: 0.45, size: 0.88, nose: 0.8 }),
  pilgrim: woman({ hair: 'bun', hairColor: '#5a3a22', coat: '#6a5a6a', cape: '#5a4838', hat: 'veil', hatColor: '#d8ccb8' }),
  pilgrimBoy: child({ hair: 'short', hairColor: '#4a2a18', coat: '#8a6a4a', legs: '#5a4a3a', coatLen: 0.5 }),
  pilgrimMan: look({ hair: 'short', hairColor: '#2a2018', coat: '#5a4a3a', cape: '#3a3028', legs: '#3a3028', beard: 'full', coatLen: 0.9 }),
  hercules: look({ hair: 'curly', hairColor: '#3a2a1e', coat: '#c89a5a', cape: '#a8803a', legs: '#8a6a4a', beard: 'full', beardColor: '#3a2a1e', coatLen: 0.3, build: 1.4, size: 1.1 }),
  statue: look({ skin: '#d8ccb4', hair: 'short', hairColor: '#b8aa90', coat: '#cfc2a8', cape: '#bfb298', legs: '#c0b49a', beard: 'full', beardColor: '#b8aa90', coatLen: 0.95, build: 1.05, halo: true }),
  modernA: woman({ hair: 'long', hairColor: '#2a1c14', coat: '#c84a3a', legs: '#2a3048', coatLen: 0.55, dress: false }),
  modernB: look({ hair: 'short', hairColor: '#3a2a20', coat: '#3a5a7a', legs: '#2c2c34', coatLen: 0.45 }),
  modernKid: child({ hair: 'curly', hairColor: '#6a4024', coat: '#e8b040', legs: '#3a4a6a', coatLen: 0.4 }),
} satisfies Record<string, Look>;

export type CastId = keyof typeof CAST;
