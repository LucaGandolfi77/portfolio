/**
 * config.js — registry dei dati di Memory Garden (puro).
 */

export const MODES = [
  { id: 'classic', name: 'Classic', emoji: '🌸', time: 0, desc: 'Match all pairs at your pace' },
  { id: 'time', name: 'Time Attack', emoji: '⏱️', time: 60, desc: 'Finish before the clock' },
  { id: 'zen', name: 'Zen', emoji: '🧘', time: 0, desc: 'No pressure, no timer' },
  { id: 'streak', name: 'Streak', emoji: '🔥', time: 0, desc: 'Build the longest combo' },
  { id: 'matrix', name: 'Matrix', emoji: '🧠', time: 0, desc: 'Remember the sequence' },
  { id: 'daily', name: 'Daily', emoji: '📅', time: 0, seeded: true, desc: 'Same board for everyone today' },
  { id: 'quest', name: 'Quest', emoji: '🗺️', time: 0, desc: '20 story levels with stars' },
  { id: 'chaos', name: 'Chaos', emoji: '🌀', time: 0, desc: 'Random events on every pair' },
  { id: 'mirror', name: 'Mirror', emoji: '🪞', time: 0, desc: 'Mirrored grid and hidden cards' },
  { id: 'rush', name: 'Rush', emoji: '⚡', time: 45, desc: 'Multiple boards, limited moves' },
  { id: 'duo', name: 'Pass & Play', emoji: '👥', time: 0, desc: 'Two players, take turns' }
];

export const DIFFICULTIES = [
  { id: 'easy', name: '4×4', rows: 4, cols: 4 },
  { id: 'medium', name: '4×6', rows: 4, cols: 6 },
  { id: 'hard', name: '4×8', rows: 4, cols: 8 }
];

export const DECKS = {
  animals: { name: 'Animals', emoji: '🐶', icons: ['🐶', '🐱', '🦊', '🐼', '🦁', '🐯', '🐸', '🐵', '🐔', '🐧', '🦄', '🐝', '🦋', '🐙', '🦉', '🐴', '🐨', '🐗'] },
  food: { name: 'Food', emoji: '🍕', icons: ['🍎', '🍌', '🍕', '🍔', '🍟', '🌮', '🍣', '🍩', '🍪', '🍰', '🥑', '🍓', '🍇', '🍉', '🥐', '🍦', '🌽', '🧁'] },
  space: { name: 'Space', emoji: '🚀', icons: ['🚀', '🪐', '🌙', '⭐', '☄️', '🌍', '🛸', '👽', '🔭', '🌟', '🛰️', '🌌', '☀️', '🌠', '👩‍🚀', '🪨', '🔮', '🌗'] },
  symbols: { name: 'Symbols', emoji: '✨', icons: ['⭐', '❤️', '🔥', '💎', '🎈', '🎁', '🏆', '⚡', '🌈', '🎨', '🎵', '🎮', '🍀', '✨', '🔔', '💖', '🎯', '🪄'] },
  flags: { name: 'Flags', emoji: '🚩', icons: ['🇮🇹', '🇫🇷', '🇩🇪', '🇪🇸', '🇬🇧', '🇺🇸', '🇯🇵', '🇨🇳', '🇧🇷', '🇨🇦', '🇦🇺', '🇰🇷', '🇳🇱', '🇸🇪', '🇲🇽', '🇮🇳', '🇿🇦', '🇳🇴'] },
  myth: { name: 'Mythology', emoji: '🏛️', icons: ['🐉', '🦄', '🧚', '🧙', '⚔️', '🛡️', '👑', '💫', '🔮', '🌊', '🌋', '🦅', '🐺', '🦂', '🐍', '🦖', '🎭', '🏹'] },
  art: { name: 'Art', emoji: '🎨', icons: ['🖌️', '🎨', '🖼️', '✏️', '🗿', '🏛️', '🕯️', '🎭', '🧿', '💠', '🔷', '🟠', '🟣', '🟢', '🟥', '⬛', '◽', '🫧'] },
  travel: { name: 'Travel', emoji: '🧳', icons: ['✈️', '🚂', '🚢', '🗼', '🗽', '🏰', '🌋', '🏔️', '🏝️', '🚗', '🚲', '🛵', '⛵', '🎒', '🗺️', '🧭', '📸', '🌍'] }
};

export const THEMES = [
  { id: 'candy', name: 'Candy', emoji: '🍬', accent: '#ff8fb3', accent2: '#67e8f9', bg: '#12102a' },
  { id: 'aurora', name: 'Aurora', emoji: '🌌', accent: '#4de8ff', accent2: '#a98bff', bg: '#091426' },
  { id: 'neon', name: 'Neon', emoji: '💫', accent: '#ff5d9e', accent2: '#4de8ff', bg: '#080812' },
  { id: 'nature', name: 'Nature', emoji: '🌿', accent: '#8fe28a', accent2: '#ffd166', bg: '#0d1f18' },
  { id: 'retro', name: 'Retro', emoji: '🕹️', accent: '#ffcf5c', accent2: '#ff6b9e', bg: '#1a1229' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊', accent: '#38bdf8', accent2: '#7cf5b4', bg: '#06263a' }
];

export const POWERS = [
  { id: 'peek', name: 'Peek', emoji: '👁️', count: 2, desc: 'Reveal a card' },
  { id: 'shuffle', name: 'Shuffle', emoji: '🔀', count: 2, desc: 'Shuffle unmatched cards' },
  { id: 'freeze', name: 'Freeze', emoji: '🧊', count: 1, desc: 'Stop the timer for 6s' },
  { id: 'hint', name: 'Hint', emoji: '💡', count: 3, desc: 'Highlight a matching pair' }
];

export const EVENTS = [
  { id: 'shuffle', name: 'Shuffle!', emoji: '🌀', desc: 'Unmatched cards shuffle' },
  { id: 'gold', name: 'Golden card!', emoji: '🌟', desc: 'Next pair scores double' },
  { id: 'fog', name: 'Fog!', emoji: '🌫️', desc: 'Cards blur for 5 seconds' },
  { id: 'swap', name: 'Swap!', emoji: '🔀', desc: 'Two cards trade places' },
  { id: 'freeze', name: 'Freeze!', emoji: '🧊', desc: 'Timer frozen for 6s' },
  { id: 'bloom', name: 'Bloom!', emoji: '🌸', desc: '+1 of each power' }
];

export const QUESTS = Array.from({ length: 20 }, (_, index) => ({
  id: 'q' + String(index + 1).padStart(2, '0'),
  name: ['First Bloom', 'Golden Path', 'Twin Stars', 'Hidden Garden', 'Coral Reef', 'Moonlit Cards', 'Crystal Cave', 'Sunset Match', 'Whispering Woods', 'Starlight',
    'Clockwork', 'Mirror Lake', 'Frozen Pond', 'Dragon Flight', 'Ancient Runes', 'Ocean Deep', 'Aurora Peak', 'Lost City', 'Celestial Gate', 'Eternal Garden'][index],
  pairs: 4 + Math.min(8, index),
  goal: index < 10 ? 'complete' : index < 17 ? 'moves' : 'combo',
  target: index < 10 ? 1 : 16 + index,
  stars: [10 + index * 3, 20 + index * 5, 35 + index * 8],
  deck: DECKS[Object.keys(DECKS)[index % Object.keys(DECKS).length]] ? Object.keys(DECKS)[index % Object.keys(DECKS).length] : 'animals'
}));

export const ACHIEVEMENTS = [
  { id: 'first', name: 'First flower', emoji: '🌱', desc: 'Complete a game' },
  { id: 'combo5', name: 'On fire', emoji: '🔥', desc: 'Reach a ×5 combo' },
  { id: 'perfect', name: 'Perfect', emoji: '💎', desc: 'Win with no mistakes' },
  { id: 'daily7', name: 'Devoted', emoji: '📅', desc: '7-day daily streak' },
  { id: 'quest10', name: 'Explorer', emoji: '🗺️', desc: 'Clear 10 quests' },
  { id: 'collector', name: 'Collector', emoji: '📖', desc: 'Collect 30 rare cards' }
];

export const DEFAULT_SETTINGS = {
  mode: 'classic', diff: 'easy', deck: 'animals', theme: 'candy',
  sound: true, haptics: true, particles: true, locale: 'it'
};

export const STORAGE_KEY = 'memory-garden-v2';

export function findMode(id) { return MODES.find((item) => item.id === id) || MODES[0]; }
export function findDeck(id) { return DECKS[id] || DECKS.animals; }
export function findTheme(id) { return THEMES.find((item) => item.id === id) || THEMES[0]; }
export function findQuest(id) { return QUESTS.find((item) => item.id === id) || QUESTS[0]; }
