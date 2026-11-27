/** Shared color tokens for Three.js materials, lighting, and Blender kit baking. */
export const PALETTE = {
  // Nocturnal sky & atmosphere
  duskZenith: 0x1e2544,
  duskHorizon: 0xd97d54,
  nightZenith: 0x05070e,
  nightHorizon: 0x0e1628,
  dawnZenith: 0x263558,
  dawnHorizon: 0xe6a17c,

  // Warm indoor vs cold outdoor
  warmLamp: 0xffcf94,
  warmCandle: 0xffb469,
  moonLight: 0x86a4cc,
  asphaltWet: 0x161b24,
  sidewalk: 0x3b424c,
  grassNight: 0x1c2b21,

  // Apartment & furniture
  wallPlaster: 0xbcb3a4,
  floorOak: 0x5c4232,
  darkWood: 0x453124,
  carpetWarm: 0x5d4b46,
  tileSlate: 0x859296,
  fabricSage: 0x4b635e,
  fabricBlue: 0x3c5266,
  fabricWine: 0x6b3540,
  metalBrushed: 0x9aa5ad,
  glassTint: 0x9fc7d8,
  plasticDark: 0x1d2229,
  paperCream: 0xe3dccb,

  // Emissives (glow = 1 in Blender vertex alpha)
  bulbGlow: 0xffe4b5,
  phoneScreen: 0x4cb8d8,
  neonPink: 0xff5e94,
  neonAmber: 0xffb347,
  shadowCore: 0x040508,
  shadowEye: 0xff2e46,
} as const;
