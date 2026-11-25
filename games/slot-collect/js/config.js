/* Slot Collect — data-driven configuration (frozen, pure, testable) */

export const REELS = 5;
export const ROWS = 3;
export const MAX_REELS = 6;

export const SYMBOLS = Object.freeze([
  { id:'cherry',  glyph:'🍒', color:'#ff5f6d', weight:26, pay:[0,0,4,10,25,60,120] },
  { id:'lemon',   glyph:'🍋', color:'#ffd166', weight:22, pay:[0,0,5,12,30,70,140] },
  { id:'bell',    glyph:'🔔', color:'#ffe9a8', weight:17, pay:[0,0,8,18,45,100,200] },
  { id:'star',    glyph:'⭐', color:'#4de8ff', weight:13, pay:[0,0,12,28,70,160,320] },
  { id:'gem',     glyph:'💎', color:'#a98bff', weight:9,  pay:[0,0,20,50,120,260,520] },
  { id:'seven',   glyph:'7️⃣', color:'#ff6b9d', weight:6,  pay:[0,0,40,100,250,500,1000] },
  { id:'wild',    glyph:'🃏', color:'#f5f0ff', weight:4,  wild:true },
  { id:'scatter', glyph:'🌟', color:'#52ff9e', weight:3,  scatter:true }
].map(Object.freeze));

export const SYMBOL_IDS = Object.freeze(SYMBOLS.map(s => s.id));
export const COLLECTIBLE = Object.freeze(SYMBOL_IDS.filter(id => id !== 'wild' && id !== 'scatter'));

/* Five paylines on a 3-row grid: array of row indices, one per reel. */
export const PAYLINES = Object.freeze([
  Object.freeze([1,1,1,1,1]),
  Object.freeze([0,0,0,0,0]),
  Object.freeze([2,2,2,2,2]),
  Object.freeze([0,1,2,1,0]),
  Object.freeze([2,1,0,1,2])
]);

export const MODES = Object.freeze([
  { id:'classic',    label:'modes.classic',    icon:'🎰' },
  { id:'collection', label:'modes.collection', icon:'🧩' },
  { id:'endless',    label:'modes.endless',    icon:'♾️' },
  { id:'daily',      label:'modes.daily',      icon:'📅' }
]);

export const DIFFICULTY = Object.freeze({
  easy:   Object.freeze({ energy:30, goal:3,  odds:1.25, reward:0.8, name:'ROOKIE' }),
  normal: Object.freeze({ energy:20, goal:4,  odds:1,    reward:1,   name:'ACE' }),
  hard:   Object.freeze({ energy:14, goal:5,  odds:0.8,  reward:1.6, name:'LEGEND' })
});

export const UPGRADES = Object.freeze([
  { id:'reel',       icon:'🎞️', max:1, cost:l => 700 * (l + 1) },
  { id:'energy',     icon:'🔋', max:4, cost:l => 300 * (l + 1) },
  { id:'luck',       icon:'🍀', max:4, cost:l => 450 * (l + 1) },
  { id:'multiplier', icon:'✨', max:3, cost:l => 600 * (l + 1) },
  { id:'autospin',   icon:'🤖', max:1, cost:() => 900 }
]);

export const FREE_SPINS = 5;
export const SCATTER_MIN = 3;
export const MAX_BET = 5;
export const CASH_OUT_FEE = 0.15;

export const ACHIEVEMENTS = Object.freeze([
  { id:'first-win',   icon:'🎉', label:'First win',        goal:1 },
  { id:'wild-win',    icon:'🃏', label:'Wild line',        goal:1 },
  { id:'free-spins',  icon:'🌟', label:'Free spins',       goal:1 },
  { id:'collector',   icon:'🧩', label:'Set complete',     goal:1 },
  { id:'combo-10',    icon:'🔥', label:'Combo ×10',        goal:10 },
  { id:'high-roller', icon:'💎', label:'Bet 5 win',        goal:1 },
  { id:'daily-3',     icon:'📅', label:'3 day streak',     goal:3 }
]);

export const STR = Object.freeze({
  en: Object.freeze({
    title:'SLOT COLLECT', subtitle:'A neon slot RPG. Spin, collect, upgrade, repeat.',
    play:'PLAY', retry:'PLAY AGAIN', menu:'MENU', score:'SCORE', combo:'COMBO', best:'BEST',
    lang:'IT / EN', win:'JACKPOT!', lose:'OUT OF ENERGY',
    easy:'ROOKIE', normal:'ACE', hard:'LEGEND',
    modes:{ classic:'CLASSIC', collection:'COLLECTION', endless:'ENDLESS', daily:'DAILY' },
    energy:'ENERGY', sets:'SETS', upgrade:'UPGRADES', spin:'SPIN', target:'TARGET',
    bet:'BET', cash:'CASH OUT', bank:'BANKED', free:'FREE SPINS', lines:'LINES',
    level:'LEVEL', xp:'XP', streak:'STREAK', shop:'SHOP', gallery:'COLLECTION',
    help:'HOW TO PLAY', helpText:'Tap SPIN or press Space. Match symbols across the 5 glowing paylines. Wild substitutes any symbol; 3+ Scatters trigger free spins with a 2× multiplier. Raise your bet for bigger wins, or cash out before your energy runs dry.',
    auto:'AUTO', sound:'SOUND', reset:'RESET', yes:'YES', no:'NO',
    bought:'UPGRADE BOUGHT', need:'NOT ENOUGH SCORE', locked:'LOCKED',
    dailyDone:'DAILY COMPLETE', newBest:'NEW BEST!', spinAgain:'SPIN AGAIN',
    achievements:'ACHIEVEMENTS', total:'TOTAL SPINS', winRate:'WIN RATE',
    cashHint:'Bank your run or keep spinning for a bigger multiplier?'
  }),
  it: Object.freeze({
    title:'SLOT COLLECT', subtitle:'Un slot RPG neon. Gira, colleziona, potenzia, ripeti.',
    play:'GIOCA', retry:'RIGIOCA', menu:'MENU', score:'PUNTEGGIO', combo:'COMBO', best:'RECORD',
    lang:'IT / EN', win:'JACKPOT!', lose:'ENERGIA FINITA',
    easy:'ESORDIENTE', normal:'ASSO', hard:'LEGGENDA',
    modes:{ classic:'CLASSICA', collection:'COLLEZIONE', endless:'INFINITA', daily:'GIORNALIERA' },
    energy:'ENERGIA', sets:'SERIE', upgrade:'POTENZIAMENTI', spin:'GIRA', target:'OBIETTIVO',
    bet:'PUNTATA', cash:'INCASSA', bank:'INCASSATO', free:'GIRI GRATIS', lines:'LINEE',
    level:'LIVELLO', xp:'XP', streak:'SERIE GIORNI', shop:'NEGOZIO', gallery:'COLLEZIONE',
    help:'COME GIOCARE', helpText:'Tocca GIRA o premi Spazio. Allinea i simboli sulle 5 linee luminose. Il Jolly sostituisce qualsiasi simbolo; 3+ Scatter attivano giri gratuiti con moltiplicatore ×2. Aumenta la puntata per vincere di più, o incassa prima che finisca l’energia.',
    auto:'AUTO', sound:'AUDIO', reset:'AZZERA', yes:'SÌ', no:'NO',
    bought:'POTENZIAMENTO ACQUISTATO', need:'PUNTEGGIO INSUFFICIENTE', locked:'SBLOCCATO',
    dailyDone:'GIORNATA COMPLETATA', newBest:'NUOVO RECORD!', spinAgain:'GIRA ANCORA',
    achievements:'OBIETTIVI', total:'GIRI TOTALI', winRate:'PERCENTUALE VITTORIE',
    cashHint:'Incassa la partita o continua a girare per un moltiplicatore più alto?'
  })
});
