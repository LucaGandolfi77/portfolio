/**
 * Glossy ABS toy-block color tokens & elemental glow palette.
 */
export const BRICK_PALETTE = {
  // Primary toy plastic colors
  brightRed: 0xe63946,
  sunsetOrange: 0xf46025,
  brightYellow: 0xffca28,
  limeGreen: 0x52b74b,
  forestGreen: 0x2d7d46,
  skyBlue: 0x29a7e8,
  cobaltBlue: 0x1d4ed8,
  royalPurple: 0x7c3aed,
  coralPink: 0xf472b6,
  pureWhite: 0xf6f7f9,
  lightGray: 0xcbd5e1,
  darkGray: 0x475569,
  charcoal: 0x1e293b,
  warmSand: 0xe9c46a,
  terracotta: 0xc85a32,
  barkBrown: 0x6f4518,
  snowWhite: 0xeef6ff,
  iceCyan: 0x7dd3fc,
  obsidian: 0x161b26,
  skinWarm: 0xffd166,

  // Elemental emissive colors
  fireGlow: 0xff5a1f,
  shockGlow: 0x38bdf8,
  frostGlow: 0x99f6e4,
  visorCyan: 0x22d3ee,
  weakPointAmber: 0xffb703,

  // Pip currency colors
  pipSilver: 0xdbeafe,
  pipGold: 0xfbbf24,
  pipCobalt: 0x60a5fa,
} as const;

export const ELEMENT_COLORS = {
  none: BRICK_PALETTE.pureWhite,
  fire: BRICK_PALETTE.fireGlow,
  shock: BRICK_PALETTE.shockGlow,
  frost: BRICK_PALETTE.frostGlow,
} as const;
