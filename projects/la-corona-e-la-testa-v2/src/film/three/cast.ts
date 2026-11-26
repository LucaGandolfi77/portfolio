/* The cast: how every figure of the film is dressed. */
import type { Look } from './figure';

const SKIN = { fair: '#e8c4a4', warm: '#d8a882', olive: '#c69472', tan: '#b88262', deep: '#8a5a40', old: '#d4b096' };

const LOOKS = {
  /* Domninus at court: white tunic with purple stripes, gold-trimmed cloak. */
  donCourt: { skin: SKIN.warm, hair: '#3a2416', hairStyle: 'short', beard: 'short', robe: '#ece4d2', robe2: '#6a2a6a', robeLen: 1, cape: '#7a2a3a', trim: '#d8a840', belt: '#d8a840', shoes: '#5a3a24' },
  /* On the road: a brown travelling cloak with a hood. */
  donTravel: { skin: SKIN.warm, hair: '#3a2416', hairStyle: 'short', beard: 'short', robe: '#a89878', robeLen: 0.95, cape: '#5a4632', belt: '#4a3020', shoes: '#4a3020' },
  /* After death: white, with a halo. */
  donSaint: { skin: SKIN.warm, hair: '#3a2416', hairStyle: 'short', beard: 'short', robe: '#f6f0e2', robeLen: 1, cape: '#f0e6cc', trim: '#e8c060', halo: true, shoes: '#c8b898' },
  maximian: { skin: SKIN.olive, hair: '#2a2420', hairStyle: 'short', beard: 'full', robe: '#4a1a5a', robe2: '#d8a840', robeLen: 1, cape: '#6a1a7a', trim: '#e8b850', armor: '#c89a48', hat: 'laurel', build: 1.15, age: 0.4, shoes: '#6a3a1a' },
  eutychius: { skin: SKIN.fair, hair: '#8a6a4a', hairStyle: 'bald', robe: '#c8b48a', robeLen: 1, belt: '#6a4a2a', age: 0.5 },
  valerius: { skin: SKIN.tan, hair: '#2a1a12', hairStyle: 'short', beard: 'short', robe: '#9a2020', robeLen: 0.5, armor: '#b8a070', cape: '#8a1818', hat: 'galea', hatColor: '#c8a050', legs: SKIN.tan, shoes: '#4a2a18', build: 1.08 },
  valeriusBare: { skin: SKIN.tan, hair: '#2a1a12', hairStyle: 'short', beard: 'short', robe: '#9a2020', robeLen: 0.5, armor: '#b8a070', cape: '#8a1818', legs: SKIN.tan, shoes: '#4a2a18', build: 1.08 },
  valeriusOld: { skin: SKIN.tan, hair: '#8a8078', hairStyle: 'short', beard: 'full', robe: '#6a5a48', robeLen: 1, cape: '#4a3a2a', age: 0.8 },
  legionary: { skin: SKIN.olive, hair: '#2a1a12', hairStyle: 'short', robe: '#8a2424', robeLen: 0.5, armor: '#9a9aa4', hat: 'galea', hatColor: '#a0a0a8', legs: SKIN.olive, shoes: '#3a2418' },
  guard: { skin: SKIN.tan, hair: '#1a1210', hairStyle: 'short', beard: 'short', robe: '#7a2020', robeLen: 0.5, armor: '#b0a080', cape: '#5a1414', hat: 'galea', hatColor: '#b09050', legs: SKIN.tan, shoes: '#3a2418' },
  courtier: { skin: SKIN.fair, hair: '#5a3a22', hairStyle: 'short', robe: '#2a4a6a', robe2: '#d8c090', robeLen: 1, toga: '#e8e0cc' },
  courtier2: { skin: SKIN.olive, hair: '#2a2018', hairStyle: 'curly', beard: 'short', robe: '#5a6a3a', robeLen: 1, toga: '#d8ccb0', age: 0.5 },
  lady: { skin: SKIN.fair, hair: '#6a3a1a', hairStyle: 'bun', robe: '#a8506a', robeLen: 1, cape: '#e0c8a0', belt: '#d8a840', hat: 'diadem' },
  priest: { skin: SKIN.olive, hair: '#e8e4dc', hairStyle: 'short', beard: 'full', robe: '#f0ece0', robeLen: 1, toga: '#e8dcc0', hat: 'laurel', age: 0.8 },
  sabinus: { skin: SKIN.old, hair: '#dcd8d0', hairStyle: 'bald', beard: 'full', robe: '#8a7a64', robeLen: 1, belt: '#4a3a2a', age: 0.95 },
  marcella: { skin: SKIN.warm, hair: '#3a2010', hairStyle: 'long', robe: '#6a7aa0', robeLen: 1, hat: 'veil', hatColor: '#c8bca0' },
  prisoner: { skin: SKIN.tan, hair: '#2a1a10', hairStyle: 'curly', beard: 'short', robe: '#7a6a54', robeLen: 0.95 },
  hostess: { skin: SKIN.warm, hair: '#5a2a14', hairStyle: 'bun', robe: '#8a4a2a', robeLen: 1, belt: '#e8dcc0', hat: 'coif', hatColor: '#e8e0cc', build: 1.12 },
  presbyter: { skin: SKIN.olive, hair: '#a8a098', hairStyle: 'short', beard: 'full', robe: '#5a4a3a', robeLen: 1, cape: '#3a3028', age: 0.7 },
  faithfulA: { skin: SKIN.fair, hair: '#4a2a14', hairStyle: 'long', robe: '#7a5a4a', robeLen: 1, hat: 'veil', hatColor: '#9a8a70' },
  faithfulB: { skin: SKIN.tan, hair: '#1a1410', hairStyle: 'short', beard: 'short', robe: '#5a6a5a', robeLen: 0.9 },
  farmer: { skin: SKIN.tan, hair: '#4a3020', hairStyle: 'curly', beard: 'full', robe: '#7a6a3a', robeLen: 0.6, legs: '#5a4a32', belt: '#3a2a1a', build: 1.1 },
  lucius: { skin: SKIN.warm, hair: '#6a4020', hairStyle: 'curly', robe: '#c8a868', robeLen: 0.55, legs: SKIN.warm, size: 0.6 },
  widow: { skin: SKIN.old, hair: '#c8c0b8', hairStyle: 'bun', robe: '#3a3440', robeLen: 1, hat: 'veil', hatColor: '#2a2630', age: 0.8 },
  master: { skin: SKIN.olive, hair: '#7a7068', hairStyle: 'short', beard: 'full', robe: '#6a5a44', robeLen: 0.9, belt: '#3a2a1a', hat: 'coif', hatColor: '#a89878', age: 0.7, build: 1.08 },
  apprentice: { skin: SKIN.fair, hair: '#a86a30', hairStyle: 'short', robe: '#5a7a8a', robeLen: 0.6, legs: '#4a4038', size: 0.86 },
  pilgrim: { skin: SKIN.warm, hair: '#5a3a1a', hairStyle: 'long', robe: '#6a4a5a', robeLen: 1, cape: '#4a3a2e', hat: 'veil', hatColor: '#d8ccb0' },
  pilgrimMan: { skin: SKIN.tan, hair: '#3a2a1a', hairStyle: 'short', beard: 'full', robe: '#6a5a3a', robeLen: 0.95, cape: '#5a4a30', hat: 'hood', hatColor: '#5a4a30' },
  townsman: { skin: SKIN.fair, hair: '#4a3020', hairStyle: 'short', robe: '#7a2a2a', robeLen: 0.7, legs: '#3a3a4a' },
  townswoman: { skin: SKIN.warm, hair: '#3a2010', hairStyle: 'bun', robe: '#3a5a4a', robeLen: 1, hat: 'coif', hatColor: '#e8e0d0' },
  /* Today. */
  kid: { skin: SKIN.fair, hair: '#6a3a1a', hairStyle: 'long', robe: '#d84a4a', robeLen: 0.5, legs: '#2a3a5a', shoes: '#f0f0f0', hat: 'beanie', hatColor: '#f0c040', size: 0.62 },
  mom: { skin: SKIN.fair, hair: '#3a2416', hairStyle: 'long', robe: '#3a4a6a', robeLen: 0.72, legs: '#2a2a30', shoes: '#2a2020', belt: '#2a2a30' },
  passerA: { skin: SKIN.olive, hair: '#1a1410', hairStyle: 'short', robe: '#4a4a4a', robeLen: 0.65, legs: '#2a2a34' },
  passerB: { skin: SKIN.warm, hair: '#8a6a3a', hairStyle: 'bun', robe: '#8a5a3a', robeLen: 0.7, legs: '#2a2a2a' },
} satisfies Record<string, Look>;

export type CastId = keyof typeof LOOKS;
export const CAST: Record<CastId, Look> = LOOKS;
