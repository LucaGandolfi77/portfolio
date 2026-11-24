/**
 * lenses.js — registry dati delle lenti e degli sticker di Face Lab.
 * Aggiungere una lente = aggiungere un entry: UI e test si generano da qui.
 */

export const CATEGORIES = [
  { id: 'basic', label: 'BASIC', emoji: '✖️' },
  { id: 'classic', label: 'CLASSICS', emoji: '🎈' },
  { id: 'animals', label: 'ANIMALS', emoji: '🐾' },
  { id: 'monsters', label: 'MONSTERS', emoji: '👽' },
  { id: 'psychedelic', label: 'PSYCHEDELIC', emoji: '🌀' },
  { id: 'reactive', label: 'REACTIVE', emoji: '✨' },
  { id: 'retro', label: 'RETRO', emoji: '📼' }
];

export const LENSES = [
  { id: 'none', name: 'None', emoji: '🚫', category: 'basic', kind: 'none' },

  { id: 'giant', name: 'Giant eyes', emoji: '👁️', category: 'classic', kind: 'warp', params: { eyes: 2.1 } },
  { id: 'stretch', name: 'Funhouse', emoji: '↔️', category: 'classic', kind: 'warp', params: { stretchX: 1.42 } },
  { id: 'emoji', name: 'Emoji swap', emoji: '😳', category: 'classic', kind: 'overlay' },
  { id: 'fish', name: 'Fish-eye', emoji: '🔮', category: 'classic', kind: 'warp', params: { fish: 1.15 } },
  { id: 'squash', name: 'Squash', emoji: '🫠', category: 'classic', kind: 'warp', params: { squash: true } },
  { id: 'cartoon', name: 'Cartoon', emoji: '🎨', category: 'classic', kind: 'overlay', params: { filter: 'saturate(1.35) contrast(1.18) brightness(1.02)' } },
  { id: 'swirl', name: 'Swirl', emoji: '🌀', category: 'classic', kind: 'warp', params: { swirl: 1.9 } },
  { id: 'chroma', name: 'Chromatic', emoji: '🌈', category: 'classic', kind: 'warp', params: { chroma: 0.025 } },
  { id: 'pixel', name: 'Pixelate', emoji: '🧊', category: 'classic', kind: 'warp', params: { pixel: 9 } },
  { id: 'neon', name: 'Neon', emoji: '⚡', category: 'classic', kind: 'warp', params: { filter: 'invert(1) saturate(1.9) hue-rotate(180deg) contrast(1.25)' } },

  { id: 'dog', name: 'Doggo', emoji: '🐶', category: 'animals', kind: 'overlay', params: { animal: 'dog' } },
  { id: 'cat', name: 'Kitty', emoji: '🐱', category: 'animals', kind: 'overlay', params: { animal: 'cat' } },
  { id: 'bunny', name: 'Bunny', emoji: '🐰', category: 'animals', kind: 'overlay', params: { animal: 'bunny' } },
  { id: 'frog', name: 'Frog', emoji: '🐸', category: 'animals', kind: 'overlay', params: { animal: 'frog' } },

  { id: 'alien', name: 'Alien', emoji: '👽', category: 'monsters', kind: 'overlay', params: { creature: 'alien', filter: 'hue-rotate(75deg) saturate(1.5) brightness(.92)' } },
  { id: 'zombie', name: 'Zombie', emoji: '🧟', category: 'monsters', kind: 'overlay', params: { creature: 'zombie', filter: 'sepia(.6) hue-rotate(55deg) saturate(1.6) contrast(1.15)' } },
  { id: 'robot', name: 'Robot', emoji: '🤖', category: 'monsters', kind: 'overlay', params: { creature: 'robot', filter: 'grayscale(.85) contrast(1.3) brightness(1.05)' } },
  { id: 'xray', name: 'X-ray', emoji: '💀', category: 'monsters', kind: 'warp', params: { xray: true, filter: 'grayscale(1) invert(1) contrast(1.6)' } },

  { id: 'kaleido', name: 'Kaleidoscope', emoji: '🪞', category: 'psychedelic', kind: 'warp', params: { kaleido: 6 } },
  { id: 'glitch', name: 'Glitch TV', emoji: '📺', category: 'psychedelic', kind: 'warp', params: { glitch: true, chroma: 0.035 } },
  { id: 'melting', name: 'Melting', emoji: '🫠', category: 'psychedelic', kind: 'warp', params: { melt: true } },
  { id: 'triple', name: 'Triple face', emoji: '👥', category: 'psychedelic', kind: 'warp', params: { triple: true } },

  { id: 'confetti', name: 'Confetti', emoji: '🎉', category: 'reactive', kind: 'reaction', params: { reaction: 'confetti' } },
  { id: 'sparkles', name: 'Sparkles', emoji: '✨', category: 'reactive', kind: 'reaction', params: { reaction: 'sparkles' } },
  { id: 'rainbow', name: 'Rainbow tilt', emoji: '🌈', category: 'reactive', kind: 'reaction', params: { reaction: 'rainbow' } },
  { id: 'fire', name: 'Fire mouth', emoji: '🔥', category: 'reactive', kind: 'reaction', params: { reaction: 'fire' } },

  { id: 'crt', name: 'CRT / VHS', emoji: '📼', category: 'retro', kind: 'warp', params: { crt: true, filter: 'saturate(1.25) contrast(1.1)' } },
  { id: 'polaroid', name: 'Polaroid', emoji: '🧾', category: 'retro', kind: 'warp', params: { polaroid: true, filter: 'sepia(.35) contrast(.9) brightness(1.08) saturate(.7)' } },
  { id: 'bit8', name: '8-bit', emoji: '👾', category: 'retro', kind: 'warp', params: { bit8: true, pixel: 16, filter: 'saturate(1.5) contrast(1.15)' } }
];

export const STICKERS = [
  { id: 'glasses', emoji: '👓', name: 'Glasses' },
  { id: 'crown', emoji: '👑', name: 'Crown' },
  { id: 'moustache', emoji: '🥸', name: 'Moustache' },
  { id: 'hat', emoji: '🎩', name: 'Top hat' },
  { id: 'blush', emoji: '😊', name: 'Blush' },
  { id: 'beard', emoji: '🧔', name: 'Beard' },
  { id: 'halo', emoji: '😇', name: 'Halo' },
  { id: 'bone', emoji: '🦴', name: 'Bone' },
  { id: 'paws', emoji: '🐾', name: 'Paws' },
  { id: 'tears', emoji: '💧', name: 'Tears' },
  { id: 'shades3d', emoji: '🥽', name: '3D shades' },
  { id: 'bow', emoji: '🎀', name: 'Bow' },
  { id: 'bolt', emoji: '⚡', name: 'Lightning' },
  { id: 'cherries', emoji: '🍒', name: 'Cherries' },
  { id: 'flowers', emoji: '🌸', name: 'Flowers' }
];

/** Offset normalizzato rispetto al volto, limitato per evitare sticker fuori schermo. */
export function clampOffset(dx, dy) {
  return { dx: Math.max(-0.6, Math.min(0.6, Number(dx) || 0)), dy: Math.max(-0.6, Math.min(0.6, Number(dy) || 0)) };
}

export function findLens(id) {
  return LENSES.find((lens) => lens.id === id) || LENSES[0];
}

export function lensesFor(category) {
  return LENSES.filter((lens) => lens.category === category);
}

export function findSticker(id) {
  return STICKERS.find((sticker) => sticker.id === id) || null;
}
