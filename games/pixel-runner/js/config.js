export const STR = {
  en: {
    title: 'PIXEL RUNNER', subtitle: 'Five stages, four bosses. Jump, dash and survive the run.',
    play: 'RUN', retry: 'RETRY', menu: 'MENU', score: 'SCORE', combo: 'COMBO',
    best: 'BEST', lang: 'IT / EN', win: 'ALL CLEAR', lose: 'GAME OVER',
    easy: 'ROOKIE', normal: 'RUNNER', hard: 'LEGEND',
    modes: { classic: 'CLASSIC', speedrun: 'SPEEDRUN', survival: 'SURVIVAL' },
    stage: 'STAGE', boss: 'BOSS', distance: 'DISTANCE', dash: 'DASH',
    powerups: 'POWER-UPS', jump: 'JUMP', shield: 'SHIELD'
  },
  it: {
    title: 'PIXEL RUNNER', subtitle: 'Cinque stage, quattro boss. Salta, scatta e sopravvivi.',
    play: 'CORRI', retry: 'RIPROVA', menu: 'MENU', score: 'PUNTEGGIO', combo: 'COMBO',
    best: 'RECORD', lang: 'IT / EN', win: 'TUTTO COMPLETATO', lose: 'FINE PARTITA',
    easy: 'ESORDIENTE', normal: 'CORRIDORE', hard: 'LEGGENDA',
    modes: { classic: 'CLASSICA', speedrun: 'SPEEDRUN', survival: 'SOPRAVVIVENZA' },
    stage: 'STAGE', boss: 'BOSS', distance: 'DISTANZA', dash: 'SCATTO',
    powerups: 'POTENZIAMENTI', jump: 'SALTO', shield: 'SCUDO'
  }
};

export const MODES = [
  { id: 'classic', label: 'modes.classic' },
  { id: 'speedrun', label: 'modes.speedrun' },
  { id: 'survival', label: 'modes.survival' }
];

export const STAGES = [
  { name: 'Neon City', color: '#4de8ff', obstacles: 10, speed: 260, bossHp: 8 },
  { name: 'Sunset Strip', color: '#ff9f68', obstacles: 12, speed: 300, bossHp: 12 },
  { name: 'Violet Grid', color: '#a98bff', obstacles: 14, speed: 340, bossHp: 16 },
  { name: 'Storm Line', color: '#5ef0a8', obstacles: 16, speed: 380, bossHp: 20 },
  { name: 'Final Circuit', color: '#ff6b9d', obstacles: 18, speed: 420, bossHp: 28 }
];

export const GRAVITY = 1600, JUMP = 620;
