import { P } from './palette.js';
import { box, cyl, cone, sph, ico, tor, wedge, part, merge, stripedDome } from './geometry.js';

/**
 * Oggetti dei due scenari nuovi: Colline del Vino e Base Lunare.
 *
 * Queste geometrie procedurali sono il backup: il gioco usa i modelli
 * scolpiti in Blender (blender/props_new.py → models/kit-<tema>.glb) e torna
 * a queste solo se il kit non c'è o non si carica.
 */
const D = [];
const def = (o) => (D.push(o), o);

/* ======================================================== COLLINE DEL VINO */

def({
  id: 'cipresso',
  label: 'Cipresso',
  r: 0.5,
  mass: 0.35,
  zone: 'any',
  count: 70,
  themes: ['vigneto'],
  build: () =>
    merge([
      part(cyl(0.1, 0.14, 0.5, 6), P.chocolate, { y: 0.25 }),
      part(sph(0.5, 8, 8), P.palmDark, { y: 1.9, sx: 0.85, sz: 0.85, sy: 3.4 }),
    ]),
});

def({
  id: 'filare',
  label: 'Filare',
  r: 1.3,
  mass: 0.45,
  zone: 'any',
  count: 60,
  themes: ['vigneto'],
  build: () =>
    merge([
      ...[-1.2, 0, 1.2].map((x) => part(box(0.08, 1.3, 0.08), P.chocolate, { x, y: 0.65 })),
      part(box(2.5, 0.5, 0.36), P.palm, { y: 1.0 }),
      ...[-0.8, -0.25, 0.3, 0.85].map((x) => part(ico(0.12, 0), 0x5a2a5e, { x, y: 0.7, z: 0.16 })),
    ]),
});

def({
  id: 'botte',
  label: 'Botte',
  r: 0.55,
  mass: 0.12,
  zone: 'any',
  count: 50,
  themes: ['vigneto'],
  build: () =>
    merge([
      part(cyl(0.38, 0.38, 0.9, 10), P.terraDark, { y: 0.45, rz: Math.PI / 2 }),
      part(tor(0.39, 0.03, 4, 12), P.stoneDark, { x: 0.3, y: 0.45, ry: Math.PI / 2 }),
      part(tor(0.39, 0.03, 4, 12), P.stoneDark, { x: -0.3, y: 0.45, ry: Math.PI / 2 }),
      part(box(0.8, 0.1, 0.6), P.chocolate, { y: 0.05 }),
    ]),
});

def({
  id: 'casale',
  label: 'Casale',
  r: 2.6,
  mass: 3.4,
  zone: 'town',
  count: 14,
  themes: ['vigneto'],
  build: () =>
    merge([
      part(box(4.0, 2.6, 3.0), P.stone, { y: 1.3 }),
      part(wedge(4.4, 1.0, 3.4), P.terra, { y: 2.6 }),
      part(box(1.4, 1.4, 1.4), P.stone, { x: 1.2, y: 3.3 }),
      part(cone(1.1, 0.6, 4), P.terra, { x: 1.2, y: 4.3, ry: Math.PI / 4 }),
      part(box(0.8, 1.4, 0.1), P.chocolate, { y: 0.7, z: 1.52 }),
      part(box(0.5, 0.6, 0.1), P.palmDark, { x: -1.2, y: 1.8, z: 1.52 }),
      part(box(0.5, 0.6, 0.1), P.palmDark, { x: 0.9, y: 1.8, z: 1.52 }),
    ]),
});

def({
  id: 'torre',
  label: 'Torre del borgo',
  r: 1.9,
  mass: 2.8,
  zone: 'town',
  count: 8,
  themes: ['vigneto'],
  build: () =>
    merge([
      part(box(2.4, 6.5, 2.4), P.stone, { y: 3.25 }),
      ...[-0.8, 0, 0.8].flatMap((x) => [
        part(box(0.5, 0.5, 0.5), P.stone, { x, y: 6.75, z: 0.95 }),
        part(box(0.5, 0.5, 0.5), P.stone, { x, y: 6.75, z: -0.95 }),
      ]),
      part(box(0.5, 0.9, 0.1), P.ink, { y: 5.2, z: 1.22 }),
      part(box(0.9, 1.5, 0.1), P.chocolate, { y: 0.75, z: 1.22 }),
    ]),
});

def({
  id: 'trattore',
  label: 'Trattore',
  r: 1.3,
  mass: 0.9,
  zone: 'any',
  count: 14,
  themes: ['vigneto'],
  build: () =>
    merge([
      part(cyl(0.6, 0.6, 0.35, 10), P.ink, { x: -0.5, y: 0.6, z: 0.55, rx: Math.PI / 2 }),
      part(cyl(0.6, 0.6, 0.35, 10), P.ink, { x: -0.5, y: 0.6, z: -0.55, rx: Math.PI / 2 }),
      part(cyl(0.35, 0.35, 0.25, 10), P.ink, { x: 0.8, y: 0.35, z: 0.45, rx: Math.PI / 2 }),
      part(cyl(0.35, 0.35, 0.25, 10), P.ink, { x: 0.8, y: 0.35, z: -0.45, rx: Math.PI / 2 }),
      part(box(1.4, 0.6, 0.7), P.coral, { x: 0.35, y: 0.8 }),
      part(box(0.8, 1.0, 0.9), P.coral, { x: -0.45, y: 1.4 }),
      part(box(0.9, 0.08, 1.0), P.ink, { x: -0.45, y: 1.94 }),
    ]),
});

def({
  id: 'balla',
  label: 'Balla di fieno',
  r: 0.8,
  mass: 0.25,
  zone: 'any',
  count: 50,
  themes: ['vigneto'],
  build: () => merge([part(cyl(0.65, 0.65, 0.9, 12), P.sandDark, { y: 0.65, rx: Math.PI / 2 })]),
});

def({
  id: 'pecora',
  label: 'Pecora',
  r: 0.5,
  mass: 0.1,
  zone: 'any',
  count: 40,
  themes: ['vigneto'],
  build: () =>
    merge([
      part(ico(0.38, 1), P.white, { y: 0.55, sx: 1.3 }),
      part(sph(0.16, 6, 5), P.ink, { x: 0.5, y: 0.65 }),
      ...[-0.2, 0.2].flatMap((x) => [-0.15, 0.15].map((z) => part(box(0.07, 0.35, 0.07), P.ink, { x, z, y: 0.17 }))),
    ]),
});

def({
  id: 'ulivo',
  label: 'Ulivo',
  r: 0.9,
  mass: 0.45,
  zone: 'any',
  count: 50,
  themes: ['vigneto'],
  build: () =>
    merge([
      part(cyl(0.16, 0.26, 1.2, 6), P.stoneDark, { y: 0.6, rz: 0.15 }),
      part(ico(0.75, 0), 0x8a9a6a, { y: 1.7, sy: 0.7 }),
      part(ico(0.5, 0), 0x9aab7a, { x: 0.5, y: 1.5, sy: 0.7 }),
    ]),
});

def({
  id: 'carretto',
  label: 'Carretto dell\'uva',
  r: 1.0,
  mass: 0.4,
  zone: 'any',
  count: 16,
  themes: ['vigneto'],
  build: () =>
    merge([
      part(tor(0.4, 0.05, 4, 10), P.chocolate, { y: 0.4, z: 0.55 }),
      part(tor(0.4, 0.05, 4, 10), P.chocolate, { y: 0.4, z: -0.55 }),
      part(box(1.4, 0.4, 1.0), P.terra, { y: 0.75 }),
      part(ico(0.4, 0), 0x5a2a5e, { y: 1.05, sx: 1.6 }),
      part(box(1.0, 0.06, 0.06), P.chocolate, { x: 1.1, y: 0.6, z: 0.3 }),
    ]),
});

def({
  id: 'girasole',
  label: 'Girasole',
  r: 0.3,
  mass: 0.04,
  zone: 'any',
  count: 80,
  themes: ['vigneto'],
  build: () =>
    merge([
      part(cyl(0.03, 0.04, 1.3, 5), P.palm, { y: 0.65 }),
      part(cyl(0.26, 0.26, 0.05, 10), P.lemon, { y: 1.35, z: 0.05, rx: 1.2 }),
      part(cyl(0.12, 0.12, 0.07, 8), P.chocolate, { y: 1.36, z: 0.07, rx: 1.2 }),
    ]),
});

def({
  id: 'oro-grappolo',
  label: 'Grappolo d\'oro',
  r: 1.4,
  mass: 2.2,
  zone: 'any',
  count: 1,
  gold: true,
  rarity: 3,
  themes: ['vigneto'],
  build: () =>
    merge([
      ...[0, 1, 2, 3].flatMap((row) =>
        [...Array(4 - row)].map((_, i) => part(ico(0.3, 0), P.gold, { x: (i - (3 - row) / 2) * 0.5, y: 2.2 - row * 0.45 }))
      ),
      part(cyl(0.05, 0.06, 0.5, 5), P.chocolate, { y: 2.6 }),
      part(cone(0.4, 0.2, 5), P.palm, { x: 0.3, y: 2.6, rz: -1 }),
      part(cyl(0.5, 0.6, 0.3, 8), P.stone, { y: 0.15 }),
    ]),
});

def({
  id: 'oro-damigiana',
  label: 'Damigiana d\'oro',
  r: 1.3,
  mass: 2.0,
  zone: 'any',
  count: 1,
  gold: true,
  rarity: 3,
  themes: ['vigneto'],
  build: () =>
    merge([
      part(sph(0.9, 10, 8), P.gold, { y: 0.9 }),
      part(cyl(0.2, 0.3, 0.5, 8), P.gold, { y: 1.9 }),
      part(cyl(0.15, 0.15, 0.2, 8), P.chocolate, { y: 2.2 }),
    ]),
});

/* ============================================================== BASE LUNARE */

def({
  id: 'cupola',
  label: 'Cupola abitativa',
  r: 2.6,
  mass: 3.4,
  zone: 'town',
  count: 14,
  themes: ['luna'],
  build: () =>
    merge([
      part(cyl(2.3, 2.4, 0.5, 14), P.stone, { y: 0.25 }),
      part(stripedDome(2.2, 2.0, 14, P.white, P.glass, { droop: 0 }), P.white, { y: 0.5 }),
      part(box(1.0, 1.3, 1.2), P.stone, { y: 0.65, z: 2.3 }),
      part(box(0.6, 0.9, 0.1), P.ink, { y: 0.6, z: 2.92 }),
    ]),
});

def({
  id: 'modulo',
  label: 'Modulo della base',
  r: 2.2,
  mass: 2.6,
  zone: 'town',
  count: 14,
  themes: ['luna'],
  build: () =>
    merge([
      part(cyl(0.9, 0.9, 3.6, 12), P.white, { y: 1.1, rz: Math.PI / 2 }),
      part(cyl(0.95, 0.95, 0.15, 12), P.coral, { x: 1.8, y: 1.1, rz: Math.PI / 2 }),
      part(cyl(0.95, 0.95, 0.15, 12), P.coral, { x: -1.8, y: 1.1, rz: Math.PI / 2 }),
      part(box(3.0, 0.2, 1.2), P.stoneDark, { y: 0.1 }),
      part(box(1.6, 0.4, 0.1), P.glass, { y: 1.3, z: 0.88 }),
    ]),
});

def({
  id: 'razzo',
  label: 'Razzo',
  r: 2.0,
  mass: 3.0,
  zone: 'town',
  count: 5,
  themes: ['luna'],
  build: () =>
    merge([
      part(cyl(0.7, 0.8, 5.0, 12), P.white, { y: 3.0 }),
      part(cone(0.7, 1.6, 12), P.coral, { y: 6.3 }),
      ...[0, 1, 2, 3].map((k) =>
        part(box(0.12, 1.4, 1.0), P.coral, { x: Math.cos((k * Math.PI) / 2) * 0.9, z: Math.sin((k * Math.PI) / 2) * 0.9, y: 1.2, ry: -(k * Math.PI) / 2 })
      ),
      part(cone(0.6, 0.6, 10), P.stoneDark, { y: 0.3, rx: Math.PI }),
    ]),
});

def({
  id: 'rover',
  label: 'Rover',
  r: 1.2,
  mass: 0.7,
  zone: 'any',
  count: 34,
  themes: ['luna'],
  build: () =>
    merge([
      ...[-0.6, 0, 0.6].flatMap((x) =>
        [-0.6, 0.6].map((z) => part(cyl(0.25, 0.25, 0.2, 8), P.stoneDark, { x, z, y: 0.25, rx: Math.PI / 2 }))
      ),
      part(box(1.7, 0.4, 1.0), P.white, { y: 0.65 }),
      part(box(0.7, 0.4, 0.8), P.glass, { x: 0.3, y: 1.05 }),
      part(box(0.9, 0.05, 0.9), P.navy, { x: -0.5, y: 1.0 }),
    ]),
});

def({
  id: 'astronauta',
  label: 'Astronauta',
  r: 0.4,
  mass: 0.1,
  zone: 'any',
  count: 170,
  themes: ['luna'],
  build: () =>
    merge([
      part(box(0.12, 0.45, 0.14), P.white, { x: -0.1, y: 0.22 }),
      part(box(0.12, 0.45, 0.14), P.white, { x: 0.1, y: 0.22 }),
      part(box(0.42, 0.5, 0.3), P.white, { y: 0.72 }),
      part(box(0.36, 0.4, 0.2), P.stone, { y: 0.75, z: -0.24 }),
      part(sph(0.2, 8, 6), P.white, { y: 1.15 }),
      part(box(0.26, 0.14, 0.05), 0xffc93c, { y: 1.16, z: 0.18 }),
    ]),
});

def({
  id: 'antenna',
  label: 'Antenna parabolica',
  r: 1.0,
  mass: 0.5,
  zone: 'any',
  count: 36,
  themes: ['luna'],
  build: () =>
    merge([
      part(cyl(0.3, 0.4, 0.3, 8), P.stoneDark, { y: 0.15 }),
      part(cyl(0.07, 0.07, 1.4, 6), P.stone, { y: 1.0 }),
      part(cone(0.9, 0.4, 12), P.white, { y: 1.9, rx: Math.PI * 0.8 }),
      part(cyl(0.02, 0.02, 0.6, 4), P.stoneDark, { y: 2.0, z: 0.2, rx: 0.6 }),
    ]),
});

def({
  id: 'pannello',
  label: 'Pannello solare',
  r: 1.1,
  mass: 0.4,
  zone: 'any',
  count: 90,
  themes: ['luna'],
  build: () =>
    merge([
      part(cyl(0.06, 0.06, 0.9, 5), P.stone, { y: 0.45 }),
      part(box(2.0, 0.05, 1.1), P.navy, { y: 0.95, rx: -0.4 }),
      part(box(2.06, 0.03, 0.04), P.stone, { y: 0.97, rx: -0.4 }),
    ]),
});

def({
  id: 'roccia-lunare',
  label: 'Roccia lunare',
  r: 0.8,
  mass: 0.3,
  zone: 'any',
  count: 200,
  themes: ['luna'],
  build: () =>
    merge([
      part(ico(0.6, 0), P.stone, { y: 0.3, sy: 0.6 }),
      part(ico(0.3, 0), P.stoneDark, { x: 0.45, y: 0.15, z: 0.2 }),
    ]),
});

def({
  id: 'serbatoio',
  label: 'Serbatoi',
  r: 0.9,
  mass: 0.45,
  zone: 'any',
  count: 40,
  themes: ['luna'],
  build: () =>
    merge([
      part(cyl(0.35, 0.35, 1.3, 10), P.white, { x: -0.38, y: 0.75 }),
      part(cyl(0.35, 0.35, 1.3, 10), P.coral, { x: 0.38, y: 0.75 }),
      part(box(1.6, 0.12, 0.8), P.stoneDark, { y: 0.06 }),
    ]),
});

def({
  id: 'lander',
  label: 'Modulo d\'atterraggio',
  r: 1.5,
  mass: 1.0,
  zone: 'any',
  count: 12,
  themes: ['luna'],
  build: () =>
    merge([
      ...[0, 1, 2, 3].map((k) =>
        part(box(0.08, 1.3, 0.08), P.stone, { x: Math.cos((k * Math.PI) / 2 + 0.78) * 1.0, z: Math.sin((k * Math.PI) / 2 + 0.78) * 1.0, y: 0.6 })
      ),
      part(box(1.4, 0.8, 1.4), P.gold, { y: 1.3 }),
      part(cyl(0.6, 0.7, 0.8, 8), P.stone, { y: 2.1 }),
      part(box(0.3, 0.3, 0.1), P.ink, { y: 2.1, z: 0.66 }),
    ]),
});

def({
  id: 'bandiera',
  label: 'Bandiera della colonia',
  r: 0.4,
  mass: 0.05,
  zone: 'any',
  count: 30,
  themes: ['luna'],
  build: () =>
    merge([
      part(cyl(0.03, 0.03, 2.0, 5), P.stone, { y: 1.0 }),
      part(box(0.8, 0.5, 0.03), P.coral, { x: 0.4, y: 1.7 }),
      part(box(0.3, 0.3, 0.04), P.white, { x: 0.4, y: 1.7 }),
    ]),
});

def({
  id: 'cristallo-lunare',
  label: 'Cristallo',
  r: 0.5,
  mass: 0.08,
  zone: 'any',
  count: 130,
  themes: ['luna'],
  build: () =>
    merge([
      part(cone(0.18, 0.8, 5), 0x8fd8ff, { y: 0.4 }),
      part(cone(0.12, 0.5, 5), 0xc8a8ff, { x: 0.2, y: 0.25, rz: -0.4 }),
    ]),
});

def({
  id: 'sonda',
  label: 'Sonda',
  r: 0.35,
  mass: 0.05,
  zone: 'any',
  count: 120,
  themes: ['luna'],
  build: () =>
    merge([
      part(box(0.3, 0.25, 0.3), P.gold, { y: 0.25 }),
      part(box(0.7, 0.03, 0.25), P.navy, { y: 0.3 }),
      ...[-0.12, 0.12].map((x) => part(box(0.03, 0.15, 0.03), P.stone, { x, y: 0.07 })),
    ]),
});

def({
  id: 'oro-capsula',
  label: 'Capsula d\'oro',
  r: 1.5,
  mass: 2.4,
  zone: 'any',
  count: 1,
  gold: true,
  rarity: 3,
  themes: ['luna'],
  build: () =>
    merge([
      part(cone(1.0, 1.6, 10), P.gold, { y: 1.1 }),
      part(cyl(1.05, 1.05, 0.3, 10), P.stoneDark, { y: 0.3 }),
      part(box(0.4, 0.4, 0.1), P.glass, { y: 1.0, z: 0.7 }),
    ]),
});

export const PROP_DEFS_NEW = D;
