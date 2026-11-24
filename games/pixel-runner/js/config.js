/* Pixel Runner — stages, modes, power-ups, objectives and EN/IT strings */
export const VERSION = 1;

export const STR = {
  en: {
    title:'PIXEL RUNNER', subtitle:'Five stages, four bosses. Jump, dash and survive the run.',
    play:'RUN', start:'START', retry:'RETRY', menu:'MENU', score:'SCORE', combo:'COMBO', best:'BEST',
    lang:'IT / EN', win:'ALL CLEAR', lose:'GAME OVER', easy:'ROOKIE', normal:'RUNNER', hard:'LEGEND',
    modes:{ classic:'CLASSIC', speedrun:'SPEEDRUN', survival:'SURVIVAL', bossrush:'BOSS RUSH' },
    stage:'STAGE', boss:'BOSS', distance:'DISTANCE', dash:'DASH', powerups:'POWER-UPS',
    jump:'JUMP', shield:'SHIELD', skip:'Skip to content', stats:'Stats', settings:'Settings',
    help:'Help', close:'Close', records:'Local top 5', runs:'Runs', total:'Total score',
    achievements:'Achievements', stages:'Stages', locked:'Locked', current:'Current',
    enter:'Enter', daily:'Daily challenge', seed:'Seed', target:'Target', dailyDesc:'One deterministic run with a score target.',
    sound:'Sound', vibration:'Vibration', motion:'Reduced motion', quality:'Quality', low:'Low', high:'High',
    theme:'Theme', reset:'Delete data', confirmReset:'Confirm delete?', newRecord:'New record!',
    magnet:'Magnet', double:'Double score', slow:'Slow motion', repair:'Repair shield',
    helpText:'Tap or Space to jump, D/Shift to dash, F to attack bosses. Collect shields and coins; near-misses build your combo. Clear five stages and beat all four bosses.',
    ok:'OK', none:'—', of:'of', unlocked:'Unlocked', settingsTitle:'Settings', statsTitle:'Statistics'
  },
  it: {
    title:'PIXEL RUNNER', subtitle:'Cinque stage, quattro boss. Salta, scatta e sopravvivi.',
    play:'CORRI', start:'INIZIA', retry:'RIPROVA', menu:'MENU', score:'PUNTEGGIO', combo:'COMBO', best:'RECORD',
    lang:'IT / EN', win:'TUTTO COMPLETATO', lose:'FINE PARTITA', easy:'ESORDIENTE', normal:'CORRIDORE', hard:'LEGGENDA',
    modes:{ classic:'CLASSICA', speedrun:'SPEEDRUN', survival:'SOPRAVVIVENZA', bossrush:'BOSS RUSH' },
    stage:'STAGE', boss:'BOSS', distance:'DISTANZA', dash:'SCATTO', powerups:'POTENZIAMENTI',
    jump:'SALTO', shield:'SCUDO', skip:'Vai al contenuto', stats:'Statistiche', settings:'Impostazioni',
    help:'Guida', close:'Chiudi', records:'Classifica locale', runs:'Partite', total:'Punteggio totale',
    achievements:'Obiettivi', stages:'Stage', locked:'Bloccato', current:'Attuale',
    enter:'Entra', daily:'Sfida giornaliera', seed:'Seed', target:'Obiettivo', dailyDesc:'Una partita deterministica con un punteggio target.',
    sound:'Suono', vibration:'Vibrazione', motion:'Effetti ridotti', quality:'Qualità', low:'Bassa', high:'Alta',
    theme:'Tema', reset:'Cancella dati', confirmReset:'Conferma cancellazione?', newRecord:'Nuovo record!',
    magnet:'Magnete', double:'Punteggio ×2', slow:'Slow motion', repair:'Ripara scudo',
    helpText:'Tocca o Spazio per saltare, D/Shift per scattare, F per attaccare i boss. Raccogli scudi e monete; i quasi-schivi aumentano la combo. Completa cinque stage e sconfiggi i quattro boss.',
    ok:'OK', none:'—', of:'di', unlocked:'Sbloccato', settingsTitle:'Impostazioni', statsTitle:'Statistiche'
  }
};

export const MODES = [
  { id:'classic', label:'modes.classic' },
  { id:'speedrun', label:'modes.speedrun' },
  { id:'survival', label:'modes.survival' },
  { id:'bossrush', label:'modes.bossrush' }
];

export const STAGES = [
  { name:'Neon City', color:'#4de8ff', obstacles:10, speed:260, bossHp:8 },
  { name:'Sunset Strip', color:'#ff9f68', obstacles:12, speed:300, bossHp:12 },
  { name:'Violet Grid', color:'#a98bff', obstacles:14, speed:340, bossHp:16 },
  { name:'Storm Line', color:'#5ef0a8', obstacles:16, speed:380, bossHp:20 },
  { name:'Final Circuit', color:'#ff6b9d', obstacles:18, speed:420, bossHp:28 }
];

export const POWERUPS = [
  { id:'shield', icon:'🛡️', en:'Shield', it:'Scudo' },
  { id:'coin', icon:'🪙', en:'Coin', it:'Moneta' },
  { id:'magnet', icon:'🧲', en:'Magnet', it:'Magnete' },
  { id:'double', icon:'✨', en:'Double score', it:'Punteggio ×2' },
  { id:'slow', icon:'🐢', en:'Slow motion', it:'Slow motion' },
  { id:'repair', icon:'🔧', en:'Repair shield', it:'Ripara scudo' }
];

export const OBJECTIVES = [
  { id:'runs10', en:'Ten runs', it:'Dieci partite', goal:10 },
  { id:'boss4', en:'Boss breaker', it:'Distruttore di boss', goal:4 },
  { id:'allclear', en:'Full clear', it:'Completa tutto', goal:1 }
];

export const GRAVITY = 1600, JUMP = 620;
