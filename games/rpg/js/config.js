/* RPG Adventure — data and bilingual strings */

export const STR = {
  en: {
    title: 'RPG ADVENTURE', subtitle: 'Three zones. One hero. An endless hunger for loot.',
    play: 'NEW GAME', resume: 'CONTINUE', difficulty: 'DIFFICULTY',
    easy: 'ROOKIE', normal: 'HERO', hard: 'LEGEND',
    zone: 'ZONE', zoneNames: ['Whispering Woods', 'Ashen Caves', 'Obsidian Keep'],
    hp: 'HP', atk: 'ATK', def: 'DEF', level: 'LV', xp: 'XP', gold: 'GOLD',
    attack: 'ATTACK', guard: 'GUARD', flee: 'FLEE', potion: 'POTION',
    log: 'BATTLE LOG', inventory: 'INVENTORY', quests: 'QUESTS',
    win: 'VICTORY', lose: 'DEFEATED', nextZone: 'NEXT ZONE', retry: 'RETRY', menu: 'MENU',
    found: 'Found {gold} gold and {xp} XP', levelUp: 'LEVEL UP!', guardMsg: 'You brace for impact',
    fled: 'You escaped', newQuest: 'QUEST COMPLETE', boss: 'BOSS', allClear: 'ALL ZONES CLEARED',
    best: 'BEST STREAK', streak: 'STREAK', sound: 'SOUND', lang: 'IT / EN',
    items: { potion: 'Healing Potion', sword: 'Iron Blade', shield: 'Oak Shield' },
    questList: ['Defeat 3 slimes', 'Defeat a boss', 'Reach level 3']
  },
  it: {
    title: 'AVVENTURA RPG', subtitle: 'Tre zone. Un eroe. Una fame infinita di bottino.',
    play: 'NUOVA PARTITA', resume: 'CONTINUA', difficulty: 'DIFFICOLTÀ',
    easy: 'PRINCIPIANTE', normal: 'EROE', hard: 'LEGGENDA',
    zone: 'ZONA', zoneNames: ['Bosco Sussurrante', 'Grotte di Cenere', 'Fortezza di Ossidiana'],
    hp: 'HP', atk: 'ATT', def: 'DIF', level: 'LIV', xp: 'XP', gold: 'ORO',
    attack: 'ATTACCA', guard: 'DIFENDI', flee: 'FUGGI', potion: 'POZIONE',
    log: 'DIARIO DI BATTAGLIA', inventory: 'INVENTARIO', quests: 'MISSIONI',
    win: 'VITTORIA', lose: 'SCONFITTO', nextZone: 'ZONA SUCCESSIVA', retry: 'RIPROVA', menu: 'MENU',
    found: 'Trovi {gold} oro e {xp} XP', levelUp: 'LIVELLO UP!', guardMsg: 'Ti prepari all’impatto',
    fled: 'Sei fuggito', newQuest: 'MISSIONE COMPLETATA', boss: 'BOSS', allClear: 'TUTTE LE ZONE LIBERATE',
    best: 'MIGLIOR SERIE', streak: 'SERIE', sound: 'AUDIO', lang: 'IT / EN',
    items: { potion: 'Pozione Curativa', sword: 'Lama di Ferro', shield: 'Scudo di Quercia' },
    questList: ['Sconfiggi 3 slime', 'Sconfiggi un boss', 'Raggiungi il livello 3']
  }
};

export const DIFFICULTY = {
  easy: { enemy: 0.8, reward: 0.8 },
  normal: { enemy: 1, reward: 1 },
  hard: { enemy: 1.4, reward: 1.5 }
};

export const ENEMIES = [
  { id: 'slime', name: 'Slime', hp: 22, atk: 6, xp: 12, gold: 8, color: '#5ef0a8' },
  { id: 'bat', name: 'Cave Bat', hp: 30, atk: 9, xp: 18, gold: 12, color: '#a98bff' },
  { id: 'wolf', name: 'Dire Wolf', hp: 42, atk: 12, xp: 26, gold: 18, color: '#4de8ff' },
  { id: 'golem', name: 'Ash Golem', hp: 58, atk: 15, xp: 36, gold: 26, color: '#ff9f68' },
  { id: 'warden', name: 'Obsidian Warden', hp: 95, atk: 19, xp: 70, gold: 60, color: '#ff6b9d', boss: true }
];

export const ZONES = [
  { pool: ['slime', 'slime', 'bat'], encounters: 4 },
  { pool: ['bat', 'wolf', 'golem'], encounters: 5 },
  { pool: ['wolf', 'golem', 'golem'], encounters: 5, boss: 'warden' }
];

export const ITEMS = {
  potion: { price: 20, heal: 35 },
  sword: { price: 60, atk: 4 },
  shield: { price: 50, def: 3 }
};
