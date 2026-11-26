/* Who is who: costume, hair and colours of every character. */
export type Hair = 'cropped' | 'short' | 'long' | 'shorn' | 'curly' | 'bun' | 'balding' | 'messy' | 'flow' | 'none';
export type Hat = 'tophat' | 'bicorne' | 'cap' | 'skull' | 'bonnet' | 'shako' | 'hood' | 'judge';
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

const base: Look = { skin: '#e0b093', hair: 'short', hairColor: '#3a2a1e', coat: '#4a3e34', legs: '#2c2622', coatLen: 0.45 };
const look = (o: Partial<Look>): Look => ({ ...base, ...o });
const woman = (o: Partial<Look>): Look => look({ dress: true, coatLen: 1, blush: true, lashes: true, build: 0.86, size: 0.95, nose: 0.75, ...o });
const child = (o: Partial<Look>): Look => look({ child: true, size: 0.6, build: 0.8, blush: true, nose: 0.55, ...o });

export const CAST = {
  valConvict: look({ hair: 'cropped', hairColor: '#4a3626', coat: '#8c6a3c', legs: '#4c3a2a', beard: 'stubble', beardColor: '#3a2a1e', build: 1.22, size: 1.06, shirt: '#a89a80', coatLen: 0.35, nose: 1.1 }),
  valMayor: look({ hair: 'short', hairColor: '#6a5a50', coat: '#4b2e2a', legs: '#24201e', vest: '#c9a45a', shirt: '#efe6d4', coatLen: 0.75, beard: 'side', beardColor: '#6a5a50', build: 1.18, size: 1.06 }),
  val: look({ hair: 'short', hairColor: '#c9c2b6', coat: '#a07c2e', legs: '#2c2622', shirt: '#e6dcc8', coatLen: 0.9, beard: 'side', beardColor: '#c9c2b6', build: 1.18, size: 1.05 }),
  valOld: look({ skin: '#d9bfae', hair: 'flow', hairColor: '#eeeae2', coat: '#34303a', legs: '#242228', shirt: '#e8e2d6', coatLen: 0.9, beard: 'full', beardColor: '#e8e4dc', build: 1.02, size: 1.0 }),
  valGuard: look({ hair: 'short', hairColor: '#d6d0c4', coat: '#25406e', legs: '#d8d0c0', sash: '#e8e0d0', hat: 'shako', hatColor: '#171b26', beard: 'side', beardColor: '#d6d0c4', coatLen: 0.35, build: 1.18, size: 1.05 }),
  myriel: look({ skin: '#e6bfa6', hair: 'flow', hairColor: '#f2eee6', coat: '#4a2a62', legs: '#2c1c3a', coatLen: 1, hat: 'skull', hatColor: '#7a3a9a', cross: true, shirt: '#f0ece2', build: 1.05, size: 0.98 }),
  magloire: woman({ hair: 'bun', hairColor: '#8a7a6a', coat: '#5a5048', apron: '#e4dccb', hat: 'bonnet', hatColor: '#efe8da', blush: false, lashes: false, build: 1.05 }),
  guard: look({ coat: '#3c4652', legs: '#242a32', hat: 'cap', hatColor: '#252c36', beard: 'mustache', build: 1.15, coatLen: 0.4, nose: 1.2 }),
  gendarme: look({ coat: '#26427a', legs: '#e2dac8', sash: '#f0e8d8', hat: 'bicorne', hatColor: '#121522', beard: 'mustache', coatLen: 0.4, build: 1.1, size: 1.03 }),
  innkeeper: look({ hair: 'balding', hairColor: '#4a3020', coat: '#7a4a2e', legs: '#3a2c22', apron: '#d8ceb8', beard: 'mustache', build: 1.35, size: 0.98, nose: 1.3, coatLen: 0.2 }),
  woman: woman({ hair: 'bun', hairColor: '#5a4030', coat: '#4e5a52', scarf: '#8a4a44', hat: 'hood', hatColor: '#3a443e' }),
  gervais: child({ hair: 'messy', hairColor: '#2e2018', coat: '#5a4a36', legs: '#3a3028', hat: 'cap', hatColor: '#6a3a2a', coatLen: 0.25 }),
  fantine: woman({ hair: 'long', hairColor: '#f0c25a', coat: '#e8d4c0', scarf: '#d97a6a' }),
  fantineWork: woman({ hair: 'long', hairColor: '#dcb052', coat: '#5a7088', apron: '#e0d8c8' }),
  fantinePoor: woman({ skin: '#dcc3b4', hair: 'shorn', hairColor: '#b89050', coat: '#7a3a3c', gap: true, blush: false }),
  forewoman: woman({ hair: 'bun', hairColor: '#2a2020', coat: '#2e2a34', blush: false, lashes: false, nose: 1.2, size: 1.0 }),
  barber: look({ hair: 'curly', hairColor: '#2a1c14', coat: '#5c6a48', apron: '#d8d0bc', beard: 'mustache', build: 0.95, size: 0.97 }),
  dandy: look({ hair: 'curly', hairColor: '#8a5a2a', coat: '#3a6a6a', legs: '#c8b898', hat: 'tophat', hatColor: '#242028', vest: '#d8a040', coatLen: 0.7, build: 0.95 }),
  thenardier: look({ skin: '#d8a888', hair: 'messy', hairColor: '#6a4a28', coat: '#6a6e32', legs: '#3c3424', vest: '#8a3a2a', beard: 'stubble', beardColor: '#4a3418', build: 0.84, size: 0.97, nose: 1.5 }),
  mmeT: woman({ skin: '#d89a80', hair: 'bun', hairColor: '#a0442a', coat: '#6e3a2e', apron: '#b8a888', blush: true, lashes: false, build: 1.55, size: 1.04, nose: 1.15 }),
  javert: look({ skin: '#d0a890', hair: 'short', hairColor: '#17161a', coat: '#1e2638', legs: '#12151e', hat: 'tophat', hatColor: '#0e1018', beard: 'side', beardColor: '#17161a', shirt: '#d8d4cc', coatLen: 1, build: 1.1, size: 1.1, nose: 1.15 }),
  javertBare: look({ skin: '#d0a890', hair: 'short', hairColor: '#17161a', coat: '#1e2638', legs: '#12151e', beard: 'side', beardColor: '#17161a', shirt: '#d8d4cc', coatLen: 1, build: 1.1, size: 1.1, nose: 1.15 }),
  fauchelevent: look({ skin: '#d8a080', hair: 'balding', hairColor: '#d0c8b8', coat: '#5a6040', legs: '#443828', beard: 'full', beardColor: '#c8c0b0', hat: 'cap', hatColor: '#4a3a2a', size: 0.96 }),
  judge: look({ hair: 'flow', hairColor: '#e8e4da', coat: '#8a1e26', legs: '#2a1416', coatLen: 1, hat: 'judge', hatColor: '#161216', shirt: '#f4f0e8' }),
  champ: look({ hair: 'messy', hairColor: '#8a8074', coat: '#6a6258', legs: '#4a443c', beard: 'stubble', beardColor: '#6a6258', build: 1.0 }),
  cosChild: child({ hair: 'messy', hairColor: '#7a4a28', coat: '#7a6a58', dress: true, coatLen: 0.7, lashes: true }),
  cosDoll: child({ hair: 'long', hairColor: '#7a4a28', coat: '#46607e', dress: true, coatLen: 0.8, lashes: true, scarf: '#c8584a', size: 0.64 }),
  littleT: child({ hair: 'curly', hairColor: '#a0442a', coat: '#d8788a', dress: true, coatLen: 0.75, lashes: true, size: 0.56 }),
  cosette: woman({ hair: 'long', hairColor: '#8a5230', coat: '#7ab0d8', scarf: '#f0e6d8', size: 0.94 }),
  cosetteDark: woman({ hair: 'long', hairColor: '#8a5230', coat: '#3a3a46', size: 0.9 }),
  cosetteBride: woman({ hair: 'bun', hairColor: '#8a5230', coat: '#f8f2e6', hat: 'bonnet', hatColor: '#ffffff', size: 0.95 }),
  marius: look({ hair: 'curly', hairColor: '#1e1410', coat: '#2e5a46', legs: '#c0ac8a', vest: '#d8c8a0', shirt: '#f0e8d8', coatLen: 0.65, build: 0.98, nose: 0.9 }),
  mariusPale: look({ skin: '#d8c0b4', hair: 'curly', hairColor: '#1e1410', coat: '#e4dcd0', legs: '#8a8478', shirt: '#f0e8d8', coatLen: 0.5, build: 0.94, nose: 0.9 }),
  mariusGroom: look({ hair: 'curly', hairColor: '#1e1410', coat: '#1c1a24', legs: '#18161e', vest: '#f0e8d8', shirt: '#ffffff', coatLen: 0.7, nose: 0.9 }),
  gillenormand: look({ skin: '#e2b0a0', hair: 'flow', hairColor: '#f4f0e8', coat: '#8a5a8a', legs: '#d8ccb0', vest: '#d8b060', shirt: '#f4f0e8', coatLen: 0.75, build: 1.15, size: 0.96, nose: 1.25 }),
  eponine: woman({ skin: '#d0a088', hair: 'messy', hairColor: '#2e1c14', coat: '#5a4448', scarf: '#6a7a5a', size: 0.92, build: 0.8, blush: false }),
  eponineBoy: look({ skin: '#d0a088', hair: 'messy', hairColor: '#2e1c14', coat: '#4a4a3a', legs: '#33302a', hat: 'cap', hatColor: '#2e2a24', lashes: true, size: 0.9, build: 0.82, nose: 0.75 }),
  enjolras: look({ hair: 'flow', hairColor: '#f2d078', coat: '#2a2630', legs: '#c8b898', vest: '#d8301e', shirt: '#f4ece0', coatLen: 0.55, size: 1.05, nose: 0.85 }),
  grantaire: look({ skin: '#d89a82', hair: 'messy', hairColor: '#4a2c18', coat: '#6a5236', legs: '#3c3228', scarf: '#4a6a5a', beard: 'stubble', beardColor: '#3a2414', nose: 1.25 }),
  student: look({ hair: 'short', hairColor: '#5a3a22', coat: '#44506a', legs: '#2c2a30', shirt: '#e8dcc8', hat: 'cap', hatColor: '#38303a' }),
  worker: look({ hair: 'balding', hairColor: '#2a2018', coat: '#6a4a38', legs: '#34302c', beard: 'full', beardColor: '#2a2018', apron: '#5a4a3a', build: 1.2 }),
  gavroche: child({ hair: 'messy', hairColor: '#b07a30', coat: '#6a5a48', legs: '#4a4038', hat: 'cap', hatColor: '#a03020', coatLen: 0.5, scarf: '#d8a030', size: 0.66 }),
  soldier: look({ coat: '#1c2c52', legs: '#8a2a24', hat: 'shako', hatColor: '#101218', sash: '#e8e0d0', beard: 'mustache', coatLen: 0.3 }),
  nun: woman({ coat: '#26242a', hat: 'hood', hatColor: '#e8e4dc', hair: 'none', lashes: false }),
  coachman: look({ coat: '#4a3a2a', hat: 'tophat', hatColor: '#2a2018', scarf: '#8a3a2a', coatLen: 0.9, build: 1.15 }),
} satisfies Record<string, Look>;

export type CastId = keyof typeof CAST;
