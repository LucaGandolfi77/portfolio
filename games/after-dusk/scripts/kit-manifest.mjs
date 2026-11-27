import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const palette = {
  warmLamp: 0xffcf94,
  asphaltWet: 0x161b24,
  wallPlaster: 0xbcb3a4,
  floorOak: 0x5c4232,
  darkWood: 0x453124,
  fabricBlue: 0x3c5266,
  fabricWine: 0x6b3540,
  metalBrushed: 0x9aa5ad,
  glassTint: 0x9fc7d8,
  plasticDark: 0x1d2229,
  paperCream: 0xe3dccb,
  bulbGlow: 0xffe4b5,
  neonPink: 0xff5e94,
  neonAmber: 0xffb347,
  shadowCore: 0x040508,
  shadowEye: 0xff2e46,
};

writeFileSync(join(root, 'blender', 'palette.json'), JSON.stringify(palette, null, 2) + '\n');
console.log('Wrote blender/palette.json');
