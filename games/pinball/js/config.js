/* Pinball — tables, physics constants and EN/IT strings */
export const VERSION = 1;
export const PHYSICS = Object.freeze({
  SUBSTEPS:4, GRAVITY:0.21, FRICTION:0.9955, WALL_REST:0.55,
  MAX_SPEED:22, FLIPPER_SPEED:0.3, MULT_STEPS:[1,2,3,5,10]
});

export const TABLES = [
                {
                    id: 'space', name: 'NEON SPACE CADET', tag: 'Deep space training program', icon: '🚀',
                    features: ['SKILL SHOT', 'WARP PORTALS', 'NEON JACKPOT', 'MULTIBALL', '\u00d710 MULT'],
                    palette: {
                        bg: ['#0b1030', '#080618', '#050310'],
                        neb: [['rgba(64,26,120,0.32)', 0.25, 0.22, 0.55], ['rgba(10,70,110,0.30)', 0.78, 0.55, 0.5], ['rgba(120,20,80,0.16)', 0.5, 0.9, 0.5]],
                        grid: 'rgba(0,229,255,0.05)',
                        wall: 'rgba(0,229,255,0.8)', soft: 'rgba(255,43,214,0.55)',
                        flipper: '#ff2bd6', trail: '#00e5ff', accent: '#00e5ff'
                    },
                    bumpers: [[0.30, 0.295, 0.062, '#ff2bd6'], [0.63, 0.27, 0.062, '#ff2bd6'], [0.465, 0.185, 0.062, '#57ff9a']],
                    targets: { letters: 'NEON', y: 0.47, r: 0.034 },
                    star: { x: 0.185, y: 0.20, r: 0.035, color: '#00e5ff', points: 750, trigger: 0, jackpotName: '', jackpot: 0 },
                    portals: { entry: [0.105, 0.68], exit: [0.72, 0.30], color: '#b78bff' },
                    spinner: { x: 0.46, y: 0.615, len: 0.115, color: '#b78bff' },
                    bankName: 'NEON JACKPOT', rageCount: 0, rageName: '', special: null
                },
                {
                    id: 'dragon', name: 'DRAGON FORGE', tag: 'Forge the runes, wake the wyrm', icon: '🐉',
                    features: ['RUNE RITUAL', 'MANA ORB', 'FIREBALL', 'POTION MADNESS', 'DRAGON BONUS'],
                    palette: {
                        bg: ['#200a06', '#140705', '#080302'],
                        neb: [['rgba(160,60,10,0.30)', 0.3, 0.25, 0.55], ['rgba(120,20,40,0.28)', 0.75, 0.55, 0.5], ['rgba(240,180,60,0.10)', 0.5, 0.9, 0.55]],
                        grid: 'rgba(255,150,60,0.05)',
                        wall: 'rgba(255,140,50,0.85)', soft: 'rgba(255,200,80,0.5)',
                        flipper: '#ff8a3d', trail: '#ff5b3d', accent: '#ffb84d'
                    },
                    bumpers: [[0.30, 0.30, 0.062, '#b84dff'], [0.63, 0.28, 0.062, '#b84dff'], [0.465, 0.19, 0.062, '#57ff9a']],
                    targets: { letters: 'RUNE', y: 0.48, r: 0.034 },
                    star: { x: 0.82, y: 0.20, r: 0.036, color: '#ffd166', points: 1000, trigger: 5, jackpotName: 'FIREBALL', jackpot: 25000 },
                    portals: { entry: [0.12, 0.70], exit: [0.28, 0.30], color: '#ffb84d' },
                    spinner: { x: 0.5, y: 0.60, len: 0.13, color: '#ffd166' },
                    bankName: 'DRAGON BONUS', rageCount: 6, rageName: 'POTION MADNESS', special: null
                },
                {
                    id: 'sakura', name: 'SAKURA GARDEN', tag: 'Bloom the petals, wake the koi', icon: '🌸',
                    features: ['FULL BLOOM', 'KOI POND', 'MOONLIT', 'FESTIVAL \u00d72', 'PETAL RAIN'],
                    palette: {
                        bg: ['#1c0f1e', '#140a18', '#08040c'],
                        neb: [['rgba(200,90,150,0.30)', 0.28, 0.2, 0.55], ['rgba(90,140,200,0.22)', 0.75, 0.6, 0.5], ['rgba(255,180,200,0.10)', 0.5, 0.9, 0.5]],
                        grid: 'rgba(255,150,190,0.05)',
                        wall: 'rgba(255,140,180,0.8)', soft: 'rgba(120,200,255,0.45)',
                        flipper: '#ff8fc2', trail: '#ffb3d1', accent: '#ffd6e8'
                    },
                    bumpers: [[0.30, 0.28, 0.062, '#ff8fc2'], [0.63, 0.30, 0.062, '#7fd4ff'], [0.465, 0.18, 0.062, '#b8ffb0']],
                    targets: { letters: 'PETAL', y: 0.47, r: 0.032 },
                    star: { x: 0.18, y: 0.20, r: 0.036, color: '#ffd6e8', points: 1000, trigger: 4, jackpotName: 'MOONLIT', jackpot: 20000 },
                    portals: { entry: [0.12, 0.72], exit: [0.78, 0.28], color: '#ff9ec7' },
                    spinner: { x: 0.44, y: 0.60, len: 0.12, color: '#b8ffb0' },
                    bankName: 'FULL BLOOM', rageCount: 8, rageName: 'FESTIVAL',
                    special: { type: 'koi', x: 0.5, y: 0.80, r: 0.055, bonus: 1500, jackpot: 15000, jackpotName: 'KOI SPLASH' }
                },
                {
                    id: 'arcade', name: 'NEON ARCADE', tag: 'Eat pellets, bust ghosts', icon: '👾',
                    features: ['PAC-MODE', 'GHOST BUST', 'MEGA PELLET', 'ELECTRO \u00d72', '1UP TARGETS'],
                    palette: {
                        bg: ['#06060f', '#0a0a18', '#020208'],
                        neb: [['rgba(20,80,220,0.28)', 0.3, 0.25, 0.55], ['rgba(220,20,80,0.22)', 0.75, 0.5, 0.5], ['rgba(240,220,60,0.08)', 0.5, 0.9, 0.5]],
                        grid: 'rgba(80,160,255,0.05)',
                        wall: 'rgba(80,160,255,0.8)', soft: 'rgba(255,60,120,0.5)',
                        flipper: '#ff4d6d', trail: '#ffd166', accent: '#ffd166'
                    },
                    bumpers: [[0.30, 0.28, 0.062, '#ff4d6d'], [0.63, 0.28, 0.062, '#4dc9ff'], [0.465, 0.19, 0.062, '#ffd166']],
                    targets: { letters: 'PAC', y: 0.47, r: 0.036 },
                    star: { x: 0.5, y: 0.20, r: 0.034, color: '#ffd166', points: 800, trigger: 3, jackpotName: 'MEGA PELLET', jackpot: 18000 },
                    portals: null,
                    spinner: { x: 0.46, y: 0.62, len: 0.12, color: '#4dc9ff' },
                    bankName: 'PAC-MODE', rageCount: 6, rageName: 'ELECTRO',
                    special: { type: 'ghost', x: 0.5, y: 0.55, r: 0.05, range: 0.26, bonus: 8000, name: 'GHOST BUST' }
                }
            ];

export const STR = {
  it:{
    skip:'Vai al contenuto', title:'SPACE CADET PINBALL', tagline:'Quattro tavoli, un solo obiettivo: il record',
    score:'Punteggio', best:'Record', balls:'Palline', mult:'Moltiplicatore', table:'Tavolo',
    launch:'Lancia la missione', again:'Gioca ancora', pause:'Pausa', resume:'Riprendi',
    settings:'Impostazioni', sound:'Suono', vibration:'Vibrazione', motion:'Effetti ridotti',
    quality:'Qualità', low:'Bassa', high:'Alta', lang:'IT / EN', theme:'Tema', close:'Chiudi',
    achievements:'Obiettivi', stats:'Statistiche', games:'Partite', challenge:'Sfida',
    challengeDesc:'Una sola pallina, punteggio target, seed deterministica.', start:'Inizia',
    records:'Classifica locale', empty:'Nessun punteggio', reset:'Cancella dati',
    help:'Guida', helpText:'Tieni premuto il plunger per caricare e rilascia per lanciare. Sinistra/Z e Destra/M controllano i flipper. Colpisci la stella lampeggiante per lo SKILL SHOT e completa le lettere per il jackpot. P mette in pausa; AUTO lascia giocare l’IA senza perdere.',
    newRecord:'Nuovo record galattico!', auto:'Auto', on:'Attivo', off:'Disattivo', win:'Sfida completata!', confirmReset:'Conferma cancellazione?'
  },
  en:{
    skip:'Skip to content', title:'SPACE CADET PINBALL', tagline:'Four tables, one goal: the high score',
    score:'Score', best:'Best', balls:'Balls', mult:'Multiplier', table:'Table',
    launch:'Launch mission', again:'Play again', pause:'Pause', resume:'Resume',
    settings:'Settings', sound:'Sound', vibration:'Vibration', motion:'Reduced motion',
    quality:'Quality', low:'Low', high:'High', lang:'IT / EN', theme:'Theme', close:'Close',
    achievements:'Achievements', stats:'Statistics', games:'Games', challenge:'Challenge',
    challengeDesc:'One ball, a target score and a deterministic seed.', start:'Start',
    records:'Local leaderboard', empty:'No scores yet', reset:'Delete data',
    help:'Help', helpText:'Hold the plunger to charge and release to launch. Left/Z and Right/M control the flippers. Hit the flashing star for the SKILL SHOT and complete the letters for the jackpot. P pauses; AUTO lets the AI play without losing.',
    newRecord:'New galactic record!', auto:'Auto', on:'On', off:'Off', win:'Challenge complete!', confirmReset:'Confirm delete?'
  }
};

export const OBJECTIVES = [
  {id:'games10', en:'Ten missions', it:'Dieci missioni', goal:10},
  {id:'score100k', en:'Century club', it:'Club del cento', goal:100000},
  {id:'tables4', en:'All tables', it:'Tutti i tavoli', goal:4}
];
