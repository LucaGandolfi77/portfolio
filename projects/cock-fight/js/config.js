/* Cockpit Arena — configuration, breeds, economy and bilingual strings */

export const CURRENCY = '€';
export const START_WALLET = 500;
export const HOUSE_EDGE = 0.08;
export const MAX_ROUNDS = 12;

export const STATS = ['attack', 'defense', 'speed', 'stamina', 'luck'];
export const STAT_LABEL = {
  attack: { en: 'Attack', it: 'Attacco' },
  defense: { en: 'Defense', it: 'Difesa' },
  speed: { en: 'Speed', it: 'Velocità' },
  stamina: { en: 'Stamina', it: 'Resistenza' },
  luck: { en: 'Luck', it: 'Fortuna' }
};

export const BREEDS = [
  { id: 'rosso', name: { en: 'Red Comet', it: 'Cometa Rossa' }, color: '#ff5d5d', accent: '#ffb36b',
    stats: { attack: 12, defense: 8, speed: 10, stamina: 9, luck: 7 } },
  { id: 'oro', name: { en: 'Golden Crest', it: 'Cresta d’Oro' }, color: '#ffd166', accent: '#fff0b8',
    stats: { attack: 9, defense: 11, speed: 8, stamina: 12, luck: 9 } },
  { id: 'ombra', name: { en: 'Shadow Wing', it: 'Ala d’Ombra' }, color: '#a98bff', accent: '#d6c6ff',
    stats: { attack: 10, defense: 9, speed: 13, stamina: 8, luck: 10 } },
  { id: 'reale', name: { en: 'Royal Guard', it: 'Guardia Reale' }, color: '#4de8ff', accent: '#bff3ff',
    stats: { attack: 11, defense: 13, speed: 7, stamina: 11, luck: 6 } },
  { id: 'verde', name: { en: 'Emerald Flash', it: 'Bagliore Smeraldo' }, color: '#5ef0a8', accent: '#c9ffe4',
    stats: { attack: 8, defense: 10, speed: 12, stamina: 10, luck: 11 } }
];

export const EQUIPMENT = {
  spurs: { en: 'Spurs', it: 'Speroni', cost: 120, bonus: { attack: 2 }, icon: '⚔️' },
  comb: { en: 'Crest Guard', it: 'Guardia-cresta', cost: 100, bonus: { defense: 2 }, icon: '🛡️' },
  feed: { en: 'Premium Feed', it: 'Mangime pregiate', cost: 80, bonus: { stamina: 2, speed: 1 }, icon: '🌾' },
  charm: { en: 'Lucky Charm', it: 'Portafortuna', cost: 140, bonus: { luck: 3 }, icon: '🍀' }
};

export const CHAMPIONSHIP = [
  { id: 'r1', en: 'The Rookie', it: 'L’Esordiente', difficulty: 0.82, reward: 120 },
  { id: 'r2', en: 'Iron Beak', it: 'Becco di Ferro', difficulty: 0.95, reward: 180 },
  { id: 'r3', en: 'Storm Feather', it: 'Penna di Tempesta', difficulty: 1.08, reward: 260 },
  { id: 'r4', en: 'Crimson Lord', it: 'Signore Cremisi', difficulty: 1.2, reward: 380 },
  { id: 'r5', en: 'The Champion', it: 'Il Campione', difficulty: 1.34, reward: 600 }
];

export const PERSONALITIES = [
  { id: 'aggressive', en: 'Aggressive', it: 'Aggressivo', weights: [0.62, 0.18, 0.12, 0.08] },
  { id: 'defensive', en: 'Defensive', it: 'Difensivo', weights: [0.25, 0.5, 0.18, 0.07] },
  { id: 'tricky', en: 'Unpredictable', it: 'Imprevedibile', weights: [0.35, 0.25, 0.2, 0.2] }
];

export const ACTIONS = ['attack', 'defend', 'wait', 'special'];

export const STR = {
  it: {
    title: 'COCKPIT ARENA', tagline: 'Allena il tuo gallo. Scommetti. Vinci il campionato.',
    wallet: 'Portafoglio', rooster: 'Il tuo gallo', train: 'Allena', training: 'Allenamento',
    stats: 'Statistiche', equipment: 'Equipaggiamento', buy: 'Acquista', owned: 'Posseduto',
    championship: 'Campionato', round: 'Round', standings: 'Classifica', champion: 'CAMPIONE!',
    nextRound: 'Prossimo round', fight: 'Combatti', simulate: 'Simula', simulator: 'Simulatore AI',
    attack: 'Attacco', defend: 'Difesa', wait: 'Attesa', special: 'Speciale',
    betting: 'Scommesse', bet: 'Punta', stake: 'Puntata', odds: 'Quota', payout: 'Vincita',
    betWin: 'Vince il tuo gallo', betLose: 'Vince l’avversario', betRounds: 'Finito al round',
    bankroll: 'Storico scommesse', placeBet: 'Piazza scommessa', settled: 'Liquidata',
    perfect: 'PERFETTO', good: 'BUONO', miss: 'MANCATO', hp: 'ENERGIA', energy: 'CARICA',
    log: 'Commento', victory: 'VITTORIA!', defeat: 'SCONFITTA', rounds: 'Round',
    level: 'Livello', xp: 'ESPERIENZA', form: 'Forma', reset: 'Nuova stagione',
    results: 'Risultato', net: 'Utile', wins: 'Vittorie', losses: 'Sconfitte',
    simA: 'Gallo A', simB: 'Gallo B', simResult: 'Risultato simulazione',
    daily: 'Sfida giornaliera', dailyText: 'Indovina 5 esiti AI', reward: 'Ricompensa',
    lang: 'IT / EN', sound: 'Audio', theme: 'Tema', ok: 'OK', cancel: 'Annulla',
    noMoney: 'Denaro insufficiente', alreadyOwned: 'Già posseduto', championTitle: 'Titolo',
    medals: 'Medaglie', gold: 'Oro', silver: 'Argento', bronze: 'Bronzo',
    tip: 'Scegli un’azione: ATTACCA, DIFENDI, ASPETTA o SPECIALE. Il tempismo conta!',
    house: 'Commissione bookmaker 8%'
  },
  en: {
    title: 'COCKPIT ARENA', tagline: 'Train your rooster. Bet wisely. Win the championship.',
    wallet: 'Wallet', rooster: 'Your rooster', train: 'Train', training: 'Training',
    stats: 'Stats', equipment: 'Equipment', buy: 'Buy', owned: 'Owned',
    championship: 'Championship', round: 'Round', standings: 'Standings', champion: 'CHAMPION!',
    nextRound: 'Next round', fight: 'Fight', simulate: 'Simulate', simulator: 'AI Simulator',
    attack: 'Attack', defend: 'Defend', wait: 'Wait', special: 'Special',
    betting: 'Betting', bet: 'Bet', stake: 'Stake', odds: 'Odds', payout: 'Payout',
    betWin: 'Your rooster wins', betLose: 'Opponent wins', betRounds: 'Ends at round',
    bankroll: 'Bet history', placeBet: 'Place bet', settled: 'Settled',
    perfect: 'PERFECT', good: 'GOOD', miss: 'MISS', hp: 'HEALTH', energy: 'ENERGY',
    log: 'Commentary', victory: 'VICTORY!', defeat: 'DEFEAT', rounds: 'Rounds',
    level: 'Level', xp: 'EXPERIENCE', form: 'Form', reset: 'New season',
    results: 'Result', net: 'Net', wins: 'Wins', losses: 'Losses',
    simA: 'Rooster A', simB: 'Rooster B', simResult: 'Simulation result',
    daily: 'Daily challenge', dailyText: 'Guess 5 AI outcomes', reward: 'Reward',
    lang: 'IT / EN', sound: 'Sound', theme: 'Theme', ok: 'OK', cancel: 'Cancel',
    noMoney: 'Not enough money', alreadyOwned: 'Already owned', championTitle: 'Title',
    medals: 'Medals', gold: 'Gold', silver: 'Silver', bronze: 'Bronze',
    tip: 'Choose an action: ATTACK, DEFEND, WAIT or SPECIAL. Timing matters!',
    house: 'Bookmaker commission 8%'
  }
};
