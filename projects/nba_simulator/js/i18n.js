/* NBA Sim — EN/IT interface dictionary */

const EN = {
  title: 'NBA Broadcast Simulator', subtitle: '30 franchises. Real tactics. On-device simulation.',
  match: 'Game', season: 'Season', playoffs: 'Playoffs', teams: 'Teams', stats: 'Analytics',
  career: 'Career', history: 'History', home: 'Home', away: 'Away', prediction: 'Prediction',
  tipoff: 'TIP OFF', random: 'Random', pause: 'Pause', resume: 'Resume', speed: 'Speed',
  sound: 'Sound', box: 'Box score', teamStats: 'Team', replay: 'Replay', download: 'Download',
  share: 'Share', standings: 'Standings', week: 'Week', playWeek: 'Simulate week',
  bracket: 'Bracket', createBracket: 'Create bracket', champion: 'Champion', roster: 'Roster',
  strategy: 'Strategy', save: 'Save team', createTeam: 'Create team', trade: 'Trade',
  freeAgents: 'Free agents', draft: 'Draft', advance: 'Advance season', quickSim: 'Quick sim',
  advanced: 'Advanced metrics', leaders: 'Leaders', winProb: 'Win probability',
  shotChart: 'Shot chart', daily: 'Daily challenge', xp: 'XP', level: 'Level', badges: 'Badges',
  newSeason: 'New season', simToEnd: 'Sim to end', final: 'Final', overtime: 'OT',
  clutch: 'Clutch', possession: 'Possession', quarter: 'Q', settings: 'Settings',
  quality: 'Graphics', high: 'High', low: 'Low', model: 'Model', offense: 'Offense',
  defense: 'Defense', rotation: 'Rotation', pace: 'Pace', threeRate: '3PT rate',
  publish: 'Publish', selectTwo: 'Select two teams', noGames: 'No games yet',
  player: 'Player', pts: 'PTS', reb: 'REB', ast: 'AST', stl: 'STL', blk: 'BLK',
  ts: 'TS%', efg: 'eFG%', eff: 'EFF', contracts: 'Contracts', salary: 'Salary',
  chemistry: 'Chemistry', morale: 'Morale', injury: 'Injury', progress: 'Progress',
  close: 'Close', year: 'Year', rotate: 'Rotate', seasonAvg: 'Season averages', trivia: 'Trivia',
  height: 'Height', weight: 'Weight', hair: 'Hair', face: 'Face shape', jersey: 'Jersey',
  howTitle: 'How it works',
  howText: 'Every possession is simulated locally with deterministic randomness, tactics, fatigue and injuries. Use the tabs to run games, manage your franchise and explore analytics. Nothing is uploaded.'
};

const IT = {
  title: 'NBA Broadcast Simulator', subtitle: '30 franchigie. Tattiche reali. Simulazione on-device.',
  match: 'Partita', season: 'Stagione', playoffs: 'Playoff', teams: 'Squadre', stats: 'Statistiche',
  career: 'Carriera', history: 'Storico', home: 'Casa', away: 'Ospiti', prediction: 'Pronostico',
  tipoff: 'TIP OFF', random: 'Casuale', pause: 'Pausa', resume: 'Riprendi', speed: 'Velocità',
  sound: 'Audio', box: 'Box score', teamStats: 'Squadra', replay: 'Replay', download: 'Scarica',
  share: 'Condividi', standings: 'Classifica', week: 'Settimana', playWeek: 'Simula settimana',
  bracket: 'Tabellone', createBracket: 'Crea tabellone', champion: 'Campione', roster: 'Roster',
  strategy: 'Tattica', save: 'Salva squadra', createTeam: 'Crea squadra', trade: 'Scambio',
  freeAgents: 'Free agent', draft: 'Draft', advance: 'Avanza stagione', quickSim: 'Sim rapida',
  advanced: 'Metriche avanzate', leaders: 'Leader', winProb: 'Probabilità vittoria',
  shotChart: 'Mappa tiri', daily: 'Sfida giornaliera', xp: 'XP', level: 'Livello', badges: 'Badge',
  newSeason: 'Nuova stagione', simToEnd: 'Sim fino alla fine', final: 'Finale', overtime: 'OT',
  clutch: 'Clutch', possession: 'Possesso', quarter: 'Q', settings: 'Impostazioni',
  quality: 'Grafica', high: 'Alta', low: 'Bassa', model: 'Modello', offense: 'Attacco',
  defense: 'Difesa', rotation: 'Rotazione', pace: 'Ritmo', threeRate: 'Tiri da 3',
  publish: 'Pubblica', selectTwo: 'Seleziona due squadre', noGames: 'Nessuna partita',
  player: 'Giocatore', pts: 'PTS', reb: 'RIM', ast: 'AST', stl: 'REC', blk: 'STP',
  ts: 'TS%', efg: 'eFG%', eff: 'EFF', contracts: 'Contratti', salary: 'Stipendio',
  chemistry: 'Chimica', morale: 'Morale', injury: 'Infortunio', progress: 'Progresso',
  close: 'Chiudi', year: 'Anno', rotate: 'Ruota', seasonAvg: 'Medie stagionali', trivia: 'Curiosità',
  height: 'Altezza', weight: 'Peso', hair: 'Capelli', face: 'Forma viso', jersey: 'Numero',
  howTitle: 'Come funziona',
  howText: 'Ogni possesso è simulato localmente con RNG deterministico, tattiche, stanchezza e infortuni. Usa le schede per giocare, gestire la franchigia e esplorare le statistiche. Nessun dato viene caricato.'
};

export class I18n {
  constructor() {
    let lang = 'en';
    try { lang = (localStorage.getItem('pf.shell.lang') || localStorage.getItem('site_lang') || 'en').slice(0, 2); }
    catch (e) { /* ignore */ }
    this.lang = lang === 'it' ? 'it' : 'en';
  }

  t(key, vars = {}) {
    let text = (this.lang === 'it' ? IT : EN)[key] || EN[key] || key;
    for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
    return text;
  }

  apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = this.t(el.dataset.i18n); });
    document.documentElement.lang = this.lang;
  }

  setLang(lang) { this.lang = lang === 'it' ? 'it' : 'en'; return this; }
}
