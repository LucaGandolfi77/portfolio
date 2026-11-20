export const STR = {
  en: {
    title: 'MATH DUEL', subtitle: 'Solve faster than your rival. Streaks multiply everything.',
    play: 'START', retry: 'RETRY', menu: 'MENU', score: 'SCORE', combo: 'COMBO',
    best: 'BEST', lang: 'IT / EN', win: 'YOU WIN', lose: 'YOU LOSE',
    easy: 'ROOKIE', normal: 'ACE', hard: 'LEGEND',
    modes: { sprint: 'SPRINT', duel: 'DUEL', survival: 'SURVIVAL' },
    question: 'QUESTION', time: 'TIME', rival: 'RIVAL', streak: 'STREAK', answer: 'YOUR ANSWER'
  },
  it: {
    title: 'DUELLO MATEMATICO', subtitle: 'Risolvi più in fretta del rivale. Le serie moltiplicano tutto.',
    play: 'INIZIA', retry: 'RIPROVA', menu: 'MENU', score: 'PUNTEGGIO', combo: 'COMBO',
    best: 'RECORD', lang: 'IT / EN', win: 'HAI VINTO', lose: 'HAI PERSO',
    easy: 'ESORDIENTE', normal: 'ASSO', hard: 'LEGGENDA',
    modes: { sprint: 'SPRINT', duel: 'DUELLO', survival: 'SOPRAVVIVENZA' },
    question: 'DOMANDA', time: 'TEMPO', rival: 'RIVALE', streak: 'SERIE', answer: 'LA TUA RISPOSTA'
  }
};

export const MODES = [
  { id: 'sprint', label: 'modes.sprint' },
  { id: 'duel', label: 'modes.duel' },
  { id: 'survival', label: 'modes.survival' }
];

export const CONFIG = {
  easy: { ops: ['+', '-'], max: 12, seconds: 12, rival: 0.45 },
  normal: { ops: ['+', '-', '×'], max: 16, seconds: 9, rival: 0.7 },
  hard: { ops: ['+', '-', '×', '÷'], max: 20, seconds: 7, rival: 0.9 }
};

export const ROUNDS = { sprint: 12, duel: 10, survival: 99 };
