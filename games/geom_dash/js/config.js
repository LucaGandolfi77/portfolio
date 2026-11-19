/* GEOM DASH — constants, chapters and tuning */

export const W = 960;
export const H = 540;
export const GROUND = 458;
export const STEP = 1 / 120;

export const PHYS = {
  gravity: 2350,
  jumpVelocity: -760,
  jumpCut: 0.42,
  maxFall: 1150,
  coyoteTime: 0.1,
  jumpBuffer: 0.12,
  playerX: 120,
  playerW: 34,
  playerH: 34
};

export const DIFFICULTIES = {
  easy: { label: 'Easy', speed: 300, gap: 340, gravity: 0.92 },
  normal: { label: 'Normal', speed: 390, gap: 285, gravity: 1 },
  hard: { label: 'Hard', speed: 485, gap: 235, gravity: 1.06 }
};

export const CHAPTERS = [
  {
    id: 'neon', name: 'Neon City', subtitle: 'Where the grid never sleeps',
    bg1: '#100a2c', bg2: '#2b1055', grid: 'rgba(0,240,255,.14)', accent: '#5ff5ff',
    obstacle: '#ff4fa3', ground: '#1a0f3d', length: 4200, speed: 1
  },
  {
    id: 'sunset', name: 'Sunset Drive', subtitle: 'Chase the last light',
    bg1: '#2a0f3d', bg2: '#7b2d5e', grid: 'rgba(255,170,90,.16)', accent: '#ffb26b',
    obstacle: '#ff6b6b', ground: '#331544', length: 5000, speed: 1.06
  },
  {
    id: 'matrix', name: 'Green Room', subtitle: 'Follow the falling code',
    bg1: '#041a14', bg2: '#0a3d2a', grid: 'rgba(80,255,160,.14)', accent: '#5ef0a8',
    obstacle: '#b6ff5e', ground: '#062a20', length: 5600, speed: 1.12
  },
  {
    id: 'ice', name: 'Frostbyte', subtitle: 'Cold, fast, unforgiving',
    bg1: '#071a32', bg2: '#184a72', grid: 'rgba(180,230,255,.16)', accent: '#9fe8ff',
    obstacle: '#ff8fd8', ground: '#0d2a48', length: 6200, speed: 1.18
  },
  {
    id: 'void', name: 'The Void', subtitle: 'One last run in the dark',
    bg1: '#0a0618', bg2: '#2a0b3d', grid: 'rgba(190,120,255,.16)', accent: '#c08bff',
    obstacle: '#ff5b78', ground: '#160a2e', length: 7000, speed: 1.25
  }
];

export const SKINS = {
  neon: { name: 'Neon', body: '#5ff5ff', trim: '#ffffff', trail: 'rgba(95,245,255,.35)' },
  ember: { name: 'Ember', body: '#ff9f5a', trim: '#fff1c9', trail: 'rgba(255,159,90,.35)' },
  mint: { name: 'Mint', body: '#5ef0a8', trim: '#eafff4', trail: 'rgba(94,240,168,.35)' },
  rose: { name: 'Rose', body: '#ff7da8', trim: '#ffe6ef', trail: 'rgba(255,125,168,.35)' }
};

export const ACHIEVEMENTS = [
  { id: 'firstJump', icon: '🦘', label: 'Primo salto' },
  { id: 'flow50', icon: '🌊', label: 'Flow 50%' },
  { id: 'flowFull', icon: '⚡', label: 'Flow pieno' },
  { id: 'near10', icon: '😎', label: '10 near-miss' },
  { id: 'winLevel', icon: '🏁', label: 'Livello completato' },
  { id: 'allChapters', icon: '👑', label: 'Tutti i capitoli' },
  { id: 'daily', icon: '📅', label: 'Sfida del giorno' }
];

export function getChapter(index) {
  return CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, index))];
}
