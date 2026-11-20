export const STR = {
  en: {
    title: 'AVIATOR PRO', subtitle: 'Watch the multiplier. Cash out before the crash.',
    play: 'FLY', retry: 'RETRY', menu: 'MENU', score: 'SCORE', combo: 'COMBO',
    best: 'BEST', lang: 'IT / EN', win: 'MISSION CLEAR', lose: 'CRASHED',
    easy: 'ROOKIE', normal: 'PILOT', hard: 'ACE',
    modes: { classic: 'CLASSIC', mission: 'MISSIONS', survival: 'SURVIVAL' },
    cashout: 'CASH OUT', round: 'ROUND', target: 'TARGET', fuel: 'FUEL',
    missions: ['Cash out above ×2', 'Reach ×5', 'Survive 5 rounds']
  },
  it: {
    title: 'AVIATOR PRO', subtitle: 'Osserva il moltiplicatore. Incassa prima dello schianto.',
    play: 'VOLA', retry: 'RIPROVA', menu: 'MENU', score: 'PUNTEGGIO', combo: 'COMBO',
    best: 'RECORD', lang: 'IT / EN', win: 'MISSIONE COMPLETATA', lose: 'SCHIANTATO',
    easy: 'ESORDIENTE', normal: 'PILOTA', hard: 'ASSO',
    modes: { classic: 'CLASSICA', mission: 'MISSIONI', survival: 'SOPRAVVIVENZA' },
    cashout: 'INCASSA', round: 'ROUND', target: 'OBIETTIVO', fuel: 'CARBURANTE',
    missions: ['Incassa sopra ×2', 'Raggiungi ×5', 'Sopravvivi 5 round']
  }
};

export const MODES = [
  { id: 'classic', label: 'modes.classic' },
  { id: 'mission', label: 'modes.mission' },
  { id: 'survival', label: 'modes.survival' }
];

export const CRASH_RATE = { easy: 0.055, normal: 0.085, hard: 0.13 };
export const GROWTH = 0.55;
export const TARGET = { easy: 3, normal: 5, hard: 8 };
