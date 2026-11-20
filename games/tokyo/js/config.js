export const STR = {
  en: {
    title: 'TOKYO DICE', subtitle: 'Roll, bank, survive. Tap left to roll, tap right to bank.',
    play: 'PLAY', retry: 'RETRY', menu: 'MENU', score: 'SCORE', combo: 'COMBO',
    best: 'BEST', lang: 'IT / EN', win: 'YOU WIN', lose: 'YOU LOSE',
    easy: 'ROOKIE', normal: 'ACE', hard: 'LEGEND',
    modes: { classic: 'DUEL', survival: 'SURVIVAL', streak: 'STREAK' },
    roll: 'ROLL', bank: 'BANK', turn: 'TURN', rival: 'RIVAL', target: 'TARGET',
    bust: 'BUST!', double: 'DOUBLE!', mission: 'MISSIONS',
    missions: ['Roll a double', 'Bank 15+ in one turn', 'Survive 3 turns'],
    controls: 'SPACE = roll · B = bank'
  },
  it: {
    title: 'DADI TOKYO', subtitle: 'Tira, incassa, sopravvivi. Tocca a sinistra per tirare, a destra per incassare.',
    play: 'GIOCA', retry: 'RIPROVA', menu: 'MENU', score: 'PUNTEGGIO', combo: 'COMBO',
    best: 'RECORD', lang: 'IT / EN', win: 'HAI VINTO', lose: 'HAI PERSO',
    easy: 'ESORDIENTE', normal: 'ASSO', hard: 'LEGGENDA',
    modes: { classic: 'DUELLO', survival: 'SOPRAVVIVENZA', streak: 'SERIE' },
    roll: 'TIRA', bank: 'INCASSA', turn: 'TURNO', rival: 'RIVALE', target: 'OBIETTIVO',
    bust: 'FALLITO!', double: 'DOPPIO!', mission: 'MISSIONI',
    missions: ['Tira un doppio', 'Incassa 15+ in un turno', 'Sopravvivi 3 turni'],
    controls: 'SPAZIO = tira · B = incassa'
  }
};

export const MODES = [
  { id: 'classic', label: 'modes.classic' },
  { id: 'survival', label: 'modes.survival' },
  { id: 'streak', label: 'modes.streak' }
];

export const TARGET = { easy: 25, normal: 40, hard: 60 };
