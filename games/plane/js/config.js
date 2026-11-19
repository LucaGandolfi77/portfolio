/* Sky Ace — levels, balance, palettes and bilingual strings */

export const STR = {
  en: {
    title: 'SKY ACE', subtitle: 'ACES OF THE NEON FRONT',
    tagline: 'A sidescrolling air combat arcade. Five missions, four bosses, one pilot.',
    campaign: 'START CAMPAIGN', resumeRun: 'CONTINUE', tutorial: 'TUTORIAL',
    stats: 'PILOT RECORD', difficulty: 'DIFFICULTY',
    easy: 'ROOKIE', medium: 'ACE', hard: 'LEGEND',
    lang: 'IT / EN', sound: 'SOUND', on: 'ON', off: 'OFF',
    level: 'MISSION', enemies: 'HOSTILES', health: 'HULL', score: 'SCORE',
    combo: 'COMBO', bombs: 'BOMBS', shield: 'SHIELD', kills: 'KILLS',
    pause: 'PAUSED', resume: 'RESUME', restart: 'RESTART', quit: 'ABORT',
    controls: '↑ ↓ / W S = PITCH  ·  SPACE = FIRE  ·  B = BOMB  ·  F = FLIP  ·  P = PAUSE',
    touchHint: 'Left half = pitch · Right half = fire · Two fingers / hold = bomb',
    mission: 'MISSION', startMission: 'LAUNCH',
    levelComplete: 'AREA CLEARED', nextMission: 'NEXT MISSION',
    victory: 'SKY ACE', victoryText: 'The whole front is yours. Nothing left flying.',
    gameOver: 'SHOT DOWN', gameOverText: 'Your hull gave out over enemy territory.',
    retry: 'RETRY MISSION', playAgain: 'FLY AGAIN', backMenu: 'MAIN MENU',
    best: 'BEST', newRecord: 'NEW RECORD!', accuracy: 'ACCURACY', runs: 'SORTIES',
    wins: 'CAMPAIGNS', totalKills: 'TOTAL KILLS', progress: 'PROGRESS',
    back: 'BACK', ok: 'GOT IT', close: 'CLOSE',
    tutorialTitle: 'FLIGHT SCHOOL',
    t1: 'Pitch with ↑ / ↓ or W / S. The jet always flies in the direction its nose points.',
    t2: 'Hold SPACE (or the FIRE pad) to shoot. Tap F to flip and fly the other way.',
    t3: 'Press B (or two fingers) to drop a bomb: huge radial damage on impact.',
    t4: 'Collect glowing pickups: repair, shield, extra bombs and rapid fire.',
    noBombs: 'NO BOMBS', shieldUp: 'SHIELD UP', repaired: 'HULL REPAIRED',
    rapidUp: 'RAPID FIRE', bombUp: 'BOMB +1', bossDown: 'BOSS DOWN',
    waveClear: 'AREA CLEAR', flipMsg: 'FLIPPED', comboMsg: 'COMBO',
    boss: 'BOSS', target: 'TARGET', locked: 'LOCKED',
    levelNames: ['DAWN PATROL', 'SUNSET RUN', 'NEON CITY', 'STORM FRONT', 'FINAL ORBIT'],
    levelNamesIt: ['PATTUGLIA ALBA', 'CORSATTO AL TRAMONTO', 'CITTÀ NEON', 'FRONTE TEMPETA', 'ORBITA FINALE']
  },
  it: {
    title: 'SKY ACE', subtitle: 'ASSI DEL FRONTE NEON',
    tagline: 'Un arcade di combattimento aereo. Cinque missioni, quattro boss, un solo pilota.',
    campaign: 'INIZIA CAMPAGNA', resumeRun: 'CONTINUA', tutorial: 'TUTORIAL',
    stats: 'RECORD PILOTA', difficulty: 'DIFFICOLTÀ',
    easy: 'ESORDIENTE', medium: 'ASSO', hard: 'LEGGENDA',
    lang: 'IT / EN', sound: 'AUDIO', on: 'ON', off: 'OFF',
    level: 'MISSIONE', enemies: 'NEMICI', health: 'SCARROZZA', score: 'PUNTEGGIO',
    combo: 'COMBO', bombs: 'BOMBE', shield: 'SCUDO', kills: 'ABBATTIMENTI',
    pause: 'IN PAUSA', resume: 'RIPRENDI', restart: 'RICOMINCIA', quit: 'ANNULLA',
    controls: '↑ ↓ / W S = ASSETTO  ·  SPAZIO = SPARA  ·  B = BOMBA  ·  F = INVERTI  ·  P = PAUSA',
    touchHint: 'Metà sinistra = assetto · Metà destra = fuoco · Due dita / tieni premuto = bomba',
    mission: 'MISSIONE', startMission: 'DECOLLA',
    levelComplete: 'AREA LIBERATA', nextMission: 'PROSSIMA MISSIONE',
    victory: 'SKY ACE', victoryText: 'Il fronte è tutto tuo. Non vola più niente.',
    gameOver: 'ABBATTUTO', gameOverText: 'La scarrozza ha ceduto sopra territorio nemico.',
    retry: 'RIPROVA MISSIONE', playAgain: 'VOLA ANCORA', backMenu: 'MENU PRINCIPALE',
    best: 'RECORD', newRecord: 'NUOVO RECORD!', accuracy: 'PRECISIONE', runs: 'SORTITE',
    wins: 'CAMPAGNE', totalKills: 'ABBATTIMENTI TOTALI', progress: 'PROGRESSO',
    back: 'INDIETRO', ok: 'HO CAPITO', close: 'CHIUDI',
    tutorialTitle: 'SCUOLA DI VOLO',
    t1: 'Regola l’assetto con ↑ / ↓ o W / S. L’aereo vola sempre nella direzione del muso.',
    t2: 'Tieni premuto SPAZIO (o il pulsante FUOCO) per sparare. Premi F per invertire la rotta.',
    t3: 'Premi B (o due dita) per lanciare una bomba: enormi danni radiali all’impatto.',
    t4: 'Raccogli i potenziamenti: riparazione, scudo, bombe extra e fuoco rapido.',
    noBombs: 'NESSUNA BOMBA', shieldUp: 'SCUDO ATTIVO', repaired: 'SCARROZZA RIPARATA',
    rapidUp: 'FUOCO RAPIDO', bombUp: 'BOMBA +1', bossDown: 'BOSS ABBATTUTO',
    waveClear: 'AREA LIBERATA', flipMsg: 'INVERSIONE', comboMsg: 'COMBO',
    boss: 'BOSS', target: 'OBIETTIVO', locked: 'BLOCCATO',
    levelNames: ['DAWN PATROL', 'SUNSET RUN', 'NEON CITY', 'STORM FRONT', 'FINAL ORBIT'],
    levelNamesIt: ['PATTUGLIA ALBA', 'CORSATTO AL TRAMONTO', 'CITTÀ NEON', 'FRONTE TEMPETA', 'ORBITA FINALE']
  }
};

/* Difficulty tuning. `fire` > 1 means slower enemy fire; `hp`/`damage` scale linearly. */
export const DIFFICULTY = {
  easy:   { hp: 0.7, fire: 1.35, damage: 0.6, score: 0.8, enemySpeed: 0.85 },
  medium: { hp: 1.0, fire: 1.00, damage: 1.0, score: 1.0, enemySpeed: 1.00 },
  hard:   { hp: 1.4, fire: 0.72, damage: 1.5, score: 1.5, enemySpeed: 1.18 }
};

/* Five missions. Bosses appear from mission 2 onward with escalating patterns. */
export const LEVELS = [
  {
    n: 1,
    sky: ['#050a20', '#122350', '#2a5b86'],
    haze: 'rgba(45,226,230,.10)', horizon: '#123a63', ground: '#0a1b38',
    grid: '#2de2e6', accent: '#2de2e6', enemyAccent: '#ff6b9d',
    parallax: 'clouds', enemyCount: 16, enemyHp: 2, enemyFire: 150,
    enemySpeed: 1, missileChance: 0.25, worldExtra: 2000,
    boss: null
  },
  {
    n: 2,
    sky: ['#1a0826', '#521d4e', '#b5476b'],
    haze: 'rgba(255,107,157,.12)', horizon: '#732b5a', ground: '#1c0e2c',
    grid: '#ff6b9d', accent: '#ff6b9d', enemyAccent: '#ffd166',
    parallax: 'clouds', enemyCount: 22, enemyHp: 3, enemyFire: 125,
    enemySpeed: 1.1, missileChance: 0.32, worldExtra: 2200,
    boss: { hp: 360, fireRate: 105, w: 150, h: 70, color: '#ff6b9d', pattern: 'volley', name: 'CRIMSON WING' }
  },
  {
    n: 3,
    sky: ['#07051f', '#1d1147', '#3b1d7a'],
    haze: 'rgba(169,139,255,.14)', horizon: '#2a1a6b', ground: '#0a0722',
    grid: '#a98bff', accent: '#a98bff', enemyAccent: '#5ef0a8',
    parallax: 'city', enemyCount: 26, enemyHp: 3, enemyFire: 105,
    enemySpeed: 1.18, missileChance: 0.38, worldExtra: 2400,
    boss: { hp: 520, fireRate: 90, w: 170, h: 78, color: '#a98bff', pattern: 'spread', name: 'VIOLET CITADEL' }
  },
  {
    n: 4,
    sky: ['#021318', '#073b40', '#0e6b63'],
    haze: 'rgba(94,240,168,.12)', horizon: '#075c55', ground: '#02191d',
    grid: '#5ef0a8', accent: '#5ef0a8', enemyAccent: '#4de8ff',
    parallax: 'storm', enemyCount: 30, enemyHp: 4, enemyFire: 92,
    enemySpeed: 1.26, missileChance: 0.44, worldExtra: 2600,
    boss: { hp: 700, fireRate: 78, w: 180, h: 84, color: '#5ef0a8', pattern: 'burst', name: 'TEMPEST CORE' }
  },
  {
    n: 5,
    sky: ['#160208', '#4a0a18', '#a32222'],
    haze: 'rgba(255,209,102,.14)', horizon: '#7a1418', ground: '#1a0408',
    grid: '#ffd166', accent: '#ffd166', enemyAccent: '#ff9f68',
    parallax: 'orbit', enemyCount: 34, enemyHp: 5, enemyFire: 80,
    enemySpeed: 1.35, missileChance: 0.5, worldExtra: 2800,
    boss: { hp: 950, fireRate: 66, w: 200, h: 92, color: '#ffd166', pattern: 'omega', name: 'SOLAR OVERLORD' }
  }
];

export const PICKUPS = {
  repair: { color: '#5ef0a8', icon: '+' },
  shield: { color: '#4de8ff', icon: '◇' },
  bomb:   { color: '#ffd166', icon: '✸' },
  rapid:  { color: '#ff6b9d', icon: '»' }
};

export const PLAYER = {
  speed: 6.2,
  pitchSpeed: 0.035,
  maxPitch: 0.92,
  turnSmooth: 0.08,
  muzzleSpeed: 15,
  reload: 10,
  rapidReload: 5,
  maxHealth: 100,
  startBombs: 3,
  bombCooldown: 75,
  radius: 20
};

export function levelName(index, lang) {
  return lang === 'it' ? LEVELS[index].name_it || STR.it.levelNamesIt[index]
                       : STR.en.levelNames[index];
}
