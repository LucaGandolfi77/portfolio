/**
 * config.js — registry dati di Virtual Puppeteer (puro).
 */

export const CHARACTERS = [
  { id: 'sock', name: 'Socky', emoji: '🧦', body: '#ff8fb3', dark: '#7a2440', inner: '#3d1020', tongue: '#ff5d73', eye: 'googly', mouth: 'soft', voice: { base: 340, wave: 'triangle', gap: 110, rate: 1.15, pitch: 1.5 } },
  { id: 'monster', name: 'Monster', emoji: '👾', body: '#7ae06a', dark: '#20451d', inner: '#07130a', tongue: '#c9ff8a', eye: 'slit', mouth: 'spiky', voice: { base: 150, wave: 'sawtooth', gap: 130, rate: 0.85, pitch: 0.7 } },
  { id: 'robot', name: 'Robo', emoji: '🤖', body: '#00d4ff', dark: '#1d4a63', inner: '#0a1622', tongue: '#00d4ff', eye: 'rect', mouth: 'jaw', voice: { base: 220, wave: 'square', gap: 150, rate: 1, pitch: 0.8 } },
  { id: 'ghost', name: 'Ghosty', emoji: '👻', body: '#dfe7ff', dark: '#6c77ad', inner: '#141a33', tongue: '#8f9fe0', eye: 'roundGlow', mouth: 'oooh', voice: { base: 520, wave: 'sine', gap: 160, rate: 1.1, pitch: 1.8 } },
  { id: 'froggy', name: 'Froggy', emoji: '🐸', body: '#57d98a', dark: '#1f6b3a', inner: '#12331f', tongue: '#ff8fa8', eye: 'frog', mouth: 'wide', voice: { base: 260, wave: 'square', gap: 170, rate: 1, pitch: 1.1 } },
  { id: 'unicorn', name: 'Uni', emoji: '🦄', body: '#ffd166', dark: '#a8632c', inner: '#4a1140', tongue: '#ff7ab8', eye: 'lash', mouth: 'rainbow', voice: { base: 430, wave: 'sine', gap: 120, rate: 1.3, pitch: 1.7 } },
  { id: 'alien', name: 'Zorg', emoji: '👽', body: '#b6ff6a', dark: '#3f6b23', inner: '#0d1a08', tongue: '#e6ff9e', eye: 'alien', mouth: 'oooh', voice: { base: 190, wave: 'sine', gap: 100, rate: 0.9, pitch: 0.6 } },
  { id: 'cat', name: 'Miao', emoji: '🐱', body: '#ffb56b', dark: '#8a4b1d', inner: '#2a1206', tongue: '#ff8fa8', eye: 'cat', mouth: 'soft', voice: { base: 600, wave: 'triangle', gap: 95, rate: 1.4, pitch: 1.9 } },
  { id: 'pirate', name: "Cap'n", emoji: '🏴‍☠️', body: '#d94b4b', dark: '#5c1b1b', inner: '#160606', tongue: '#ff7a7a', eye: 'patch', mouth: 'spiky', voice: { base: 170, wave: 'sawtooth', gap: 140, rate: 0.9, pitch: 0.65 } },
  { id: 'dragon', name: 'Drako', emoji: '🐉', body: '#7c9cff', dark: '#2b3d84', inner: '#0a1030', tongue: '#ff8fb3', eye: 'slit', mouth: 'spiky', voice: { base: 130, wave: 'sawtooth', gap: 120, rate: 0.8, pitch: 0.55 } },
  { id: 'disco', name: 'Disco', emoji: '🕺', body: '#ff8fe0', dark: '#7a2470', inner: '#260626', tongue: '#67e8f9', eye: 'star', mouth: 'rainbow', voice: { base: 380, wave: 'triangle', gap: 90, rate: 1.25, pitch: 1.6 } },
  { id: 'yeti', name: 'Yeti', emoji: '🦍', body: '#d7f0ff', dark: '#5c7c96', inner: '#132538', tongue: '#ff9ec4', eye: 'roundGlow', mouth: 'jaw', voice: { base: 120, wave: 'square', gap: 180, rate: 0.75, pitch: 0.5 } }
];

export const PROPS = [
  { id: 'hat', emoji: '🎩', name: 'Top hat' },
  { id: 'crown', emoji: '👑', name: 'Crown' },
  { id: 'glasses', emoji: '🕶️', name: 'Shades' },
  { id: 'bow', emoji: '🎀', name: 'Bow' },
  { id: 'halo', emoji: '😇', name: 'Halo' },
  { id: 'party', emoji: '🎉', name: 'Party' }
];

export const SCENES = [
  { id: 'theater', name: 'Royal Theater', sky: ['#2a0f24', '#0a0a1c'], floor: '#4a1f2c', curtain: '#8b1f3a', accent: '#ffd166' },
  { id: 'cosmic', name: 'Cosmic Stage', sky: ['#101a4a', '#050716'], floor: '#1c2752', curtain: '#3b3b8c', accent: '#67e8f9' },
  { id: 'garden', name: 'Moonlit Garden', sky: ['#10382a', '#061610'], floor: '#20452f', curtain: '#2f6b4a', accent: '#b6ff6a' },
  { id: 'snow', name: 'Winter Stage', sky: ['#1c3556', '#081324'], floor: '#2e4b6b', curtain: '#4e76a8', accent: '#dfe7ff' }
];

export const PARTICLES = [
  { id: 'confetti', name: 'Confetti', colors: ['#ff8fb3', '#ffd166', '#67e8f9', '#b6ff6a'], gravity: 0.06, count: 8 },
  { id: 'bubbles', name: 'Bubbles', colors: ['#a5e8ff', '#ffffff'], gravity: -0.02, count: 5 },
  { id: 'stars', name: 'Stars', colors: ['#ffd166', '#fff7c2'], gravity: 0.01, count: 7 },
  { id: 'sparkles', name: 'Sparkles', colors: ['#67e8f9', '#ffffff'], gravity: 0, count: 6 }
];

export const GESTURES = [
  { id: 'pinch', name: 'Pinch', emoji: '🤏', action: 'talk' },
  { id: 'peace', name: 'Peace', emoji: '✌️', action: 'nextCharacter' },
  { id: 'wave', name: 'Wave', emoji: '👋', action: 'wave' },
  { id: 'fist', name: 'Fist', emoji: '✊', action: 'pause' },
  { id: 'open', name: 'Open hand', emoji: '🖐️', action: 'idle' }
];

export const DEFAULT_SETTINGS = {
  character: 'sock',
  scene: 'theater',
  particles: 'confetti',
  props: [],
  sfx: true,
  speech: false,
  director: false,
  gesture: true,
  dpr: 2
};

export const STORAGE_KEY = 'virtual_puppeteer_v2';

export function findCharacter(id) {
  return CHARACTERS.find((item) => item.id === id) || CHARACTERS[0];
}
export function findScene(id) {
  return SCENES.find((item) => item.id === id) || SCENES[0];
}
export function findParticles(id) {
  return PARTICLES.find((item) => item.id === id) || PARTICLES[0];
}
