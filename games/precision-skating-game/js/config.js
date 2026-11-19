/* Precision Skating — data, formations, programs and championship */

export const STR = {
  en: {
    title:'PRECISION SKATING', subtitle:'Coach a 16-skater roller team through choreographed routines',
    play:'PLAY', championship:'CHAMPIONSHIP', practice:'PRACTICE ROUTINE', lang:'IT / EN',
    pause:'PAUSE', resume:'RESUME', restart:'RESTART', quit:'QUIT', score:'SCORE', time:'TIME',
    combo:'COMBO', element:'ELEMENT', perfect:'PERFECT', good:'GOOD', miss:'MISS',
    drift:'DRIFT', corrected:'CORRECTED', elementDone:'ELEMENT DONE', routineDone:'ROUTINE COMPLETE',
    technical:'Technical', execution:'Execution', artistic:'Artistic', penalties:'Penalties',
    comboBonus:'Combo Bonus', total:'TOTAL', tapHint:'TAP ON THE BEAT', tapSkater:'TAP DRIFTING SKATERS',
    spaceHint:'SPACE = tap', clickHint:'CLICK = tap', ok:'OK', formation:'Formation',
    line:'Line', block:'Block', pivotLine:'Pivoting Line', circle:'Circle', wheel:'Wheel',
    travelCircle:'Traveling Circle', lift:'Lift', whip:'Whip Intersection', dfm:'Difficult Move', noHold:'No Hold',
    easy:'EASY', medium:'MEDIUM', hard:'HARD', difficulty:'DIFFICULTY', standings:'STANDINGS',
    round:'ROUND', medal:'MEDAL', gold:'GOLD', silver:'SILVER', bronze:'BRONZE',
    champion:'CHAMPION!', nextRound:'NEXT ROUND', backMenu:'BACK TO MENU', best:'BEST',
    tutorial:'TUTORIAL', tutorialText:'Tap the screen or press SPACE on every beat. Tap a skater with a pink warning ring to fix a drift. Keep the combo alive!',
    preview:'FORMATION PREVIEW', view:'VIEW', stats:'STATISTICS', skaters:'SKATERS', wins:'WINS',
    records:'RECORDS', newRecord:'NEW RECORD!', points:'POINTS', rank:'RANK', team:'TEAM',
    controls:'SPACE / CLICK = tap · P = pause'
  },
  it: {
    title:'PATTINAGGIO DI PRECISIONE', subtitle:'Allena una squadra di 16 pattinatrici in coreografie sincronizzate',
    play:'GIOCA', championship:'CAMPIONATO', practice:'ROUTINE LIBERA', lang:'IT / EN',
    pause:'PAUSA', resume:'RIPRENDI', restart:'RICOMINCIA', quit:'ESCI', score:'PUNTEGGIO', time:'TEMPO',
    combo:'COMBO', element:'ELEMENTO', perfect:'PERFETTO', good:'BUONO', miss:'MANCATO',
    drift:'SCARTO', corrected:'CORRETTO', elementDone:'ELEMENTO COMPLETATO', routineDone:'ROUTINE COMPLETATA',
    technical:'Tecnico', execution:'Esecuzione', artistic:'Artistico', penalties:'Penalità',
    comboBonus:'Bonus Combo', total:'TOTALE', tapHint:'TOCCA SUL RITMO', tapSkater:'TOCCA LE PATTINATRICI CHE SI SPOSTANO',
    spaceHint:'SPAZIO = tocca', clickHint:'CLIC = tocca', ok:'OK', formation:'Formazione',
    line:'Linea', block:'Blocco', pivotLine:'Linea Pivottante', circle:'Cerchio', wheel:'Ruota',
    travelCircle:'Cerchio Viaggiante', lift:'Lift', whip:'Incrocio a Frusta', dfm:'Movimento Difficile', noHold:'Senza Presa',
    easy:'FACILE', medium:'MEDIO', hard:'DIFFICILE', difficulty:'DIFFICOLTÀ', standings:'CLASSIFICA',
    round:'ROUND', medal:'MEDAGLIA', gold:'ORO', silver:'ARGENTO', bronze:'BRONZO',
    champion:'CAMPIONE!', nextRound:'PROSSIMO ROUND', backMenu:'TORNA AL MENU', best:'RECORD',
    tutorial:'TUTORIAL', tutorialText:'Tocca lo schermo o premi SPAZIO a ogni battito. Tocca la pattinatrice con l’anello rosa per correggere uno scarto. Mantieni il combo!',
    preview:'ANTEPRIMA FORMAZIONE', view:'VEDI', stats:'STATISTICHE', skaters:'PATTINATRICI', wins:'VITTORIE',
    records:'RECORD', newRecord:'NUOVO RECORD!', points:'PUNTI', rank:'POSIZIONE', team:'SQUADRA',
    controls:'SPAZIO / CLIC = tocca · P = pausa'
  }
};

export const SKATERS = [
  {id:1,name:'Arianna',role:'captain',precision:90,timing:88,speed:82,flow:91,balance:87,synchro:94,stamina:84,recovery:90},
  {id:2,name:'Beatrice',role:'skater',precision:86,timing:91,speed:84,flow:88,balance:85,synchro:92,stamina:82,recovery:87},
  {id:3,name:'Chiara',role:'skater',precision:88,timing:84,speed:89,flow:86,balance:90,synchro:89,stamina:83,recovery:85},
  {id:4,name:'Diletta',role:'skater',precision:83,timing:90,speed:86,flow:89,balance:82,synchro:88,stamina:88,recovery:91},
  {id:5,name:'Elena',role:'skater',precision:91,timing:87,speed:80,flow:90,balance:92,synchro:93,stamina:81,recovery:88},
  {id:6,name:'Francesca',role:'skater',precision:85,timing:86,speed:92,flow:84,balance:87,synchro:86,stamina:89,recovery:84},
  {id:7,name:'Giulia',role:'skater',precision:89,timing:93,speed:85,flow:92,balance:88,synchro:95,stamina:86,recovery:90},
  {id:8,name:'Irene',role:'skater',precision:82,timing:89,speed:90,flow:85,balance:84,synchro:87,stamina:90,recovery:88},
  {id:9,name:'Laura',role:'skater',precision:87,timing:85,speed:88,flow:89,balance:91,synchro:90,stamina:84,recovery:86},
  {id:10,name:'Martina',role:'skater',precision:84,timing:92,speed:83,flow:87,balance:86,synchro:91,stamina:87,recovery:89},
  {id:11,name:'Noemi',role:'skater',precision:90,timing:88,speed:86,flow:93,balance:89,synchro:92,stamina:80,recovery:85},
  {id:12,name:'Olivia',role:'skater',precision:81,timing:87,speed:91,flow:83,balance:85,synchro:86,stamina:92,recovery:90},
  {id:13,name:'Paola',role:'skater',precision:86,timing:90,speed:84,flow:88,balance:90,synchro:89,stamina:85,recovery:87},
  {id:14,name:'Rebecca',role:'skater',precision:88,timing:84,speed:93,flow:90,balance:86,synchro:94,stamina:83,recovery:89},
  {id:15,name:'Sara',role:'skater',precision:85,timing:89,speed:87,flow:86,balance:88,synchro:90,stamina:91,recovery:91},
  {id:16,name:'Valentina',role:'skater',precision:92,timing:91,speed:81,flow:94,balance:93,synchro:96,stamina:82,recovery:90}
];

export const SKATER_COLORS = [
  '#4de8ff','#a98bff','#5ef0a8','#ffd166','#ff7da8','#ff9f68',
  '#6ee7ff','#c084fc','#34d399','#fbbf24','#f472b6','#fb923c',
  '#22d3ee','#8b5cf6','#10b981','#f59e0b'
];

export const FORMATIONS = {
  LINE() {
    const pts = [];
    for (let i = 0; i < 16; i++) pts.push({ x: 0.5 + ((i % 8) - 3.5) * 0.055, y: 0.48 + (i < 8 ? 0 : 0.06) });
    return pts;
  },
  BLOCK() {
    const pts = [];
    for (let i = 0; i < 16; i++) pts.push({ x: 0.44 + (i % 4) * 0.044, y: 0.42 + Math.floor(i / 4) * 0.055 });
    return pts;
  },
  CIRCLE() {
    return Array.from({ length: 16 }, (_, i) => {
      const a = i / 16 * Math.PI * 2 - Math.PI / 2;
      return { x: 0.5 + Math.cos(a) * 0.18, y: 0.5 + Math.sin(a) * 0.16 };
    });
  },
  WHEEL() {
    const pts = [{ x: 0.5, y: 0.5 }];
    for (let s = 0; s < 4; s++) {
      const angle = s / 4 * Math.PI * 2 - Math.PI / 2;
      for (let j = 0; j < 3; j++) {
        const r = 0.06 + j * 0.06;
        pts.push({ x: 0.5 + Math.cos(angle) * r, y: 0.5 + Math.sin(angle) * r });
      }
    }
    while (pts.length < 16) pts.push({ x: 0.5, y: 0.5 });
    return pts;
  },
  INTERSECTION() {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      if (i < 8) pts.push({ x: 0.2 + i / 7 * 0.6, y: 0.5 });
      else pts.push({ x: 0.5, y: 0.2 + (i - 8) / 7 * 0.6 });
    }
    return pts;
  },
  TRAVELING() {
    return Array.from({ length: 16 }, (_, i) => {
      const a = i / 16 * Math.PI * 2 - Math.PI / 2;
      return { x: 0.55 + Math.cos(a) * 0.15, y: 0.5 + Math.sin(a) * 0.14 };
    });
  }
};

export function formationFor(variant, progress = 0) {
  const points = (FORMATIONS[variant] || FORMATIONS.LINE)();
  if (variant === 'TRAVELING') {
    return points.map(p => ({ x: p.x + progress * 0.12, y: p.y }));
  }
  return points;
}

export const PROGRAM = [
  {seq:1,variant:'BLOCK',name_en:'Block',name_it:'Blocco',diff:'medium',level:2,startMs:0,durMs:28000},
  {seq:2,variant:'LINE',name_en:'Pivoting Line',name_it:'Linea Pivottante',diff:'medium',level:2,startMs:30000,durMs:26000},
  {seq:3,variant:'CIRCLE',name_en:'Circle',name_it:'Cerchio',diff:'medium',level:2,startMs:58000,durMs:30000},
  {seq:4,variant:'WHEEL',name_en:'Lift',name_it:'Lift',diff:'very_hard',level:1,startMs:92000,durMs:18000},
  {seq:5,variant:'TRAVELING',name_en:'Traveling Circle',name_it:'Cerchio Viaggiante',diff:'hard',level:2,startMs:112000,durMs:30000},
  {seq:6,variant:'INTERSECTION',name_en:'Whip Intersection',name_it:'Incrocio a Frusta',diff:'very_hard',level:3,startMs:146000,durMs:26000},
  {seq:7,variant:'CIRCLE',name_en:'Difficult Move',name_it:'Movimento Difficile',diff:'hard',level:2,startMs:176000,durMs:26000},
  {seq:8,variant:'BLOCK',name_en:'No Hold 4x4 Block',name_it:'Blocco 4x4 Senza Presa',diff:'hard',level:2,startMs:206000,durMs:30000}
];

export const DIFF_MULT = { easy: 0.55, medium: 1, hard: 1.6, very_hard: 2.2 };
export const DIFFICULTIES = ['easy','medium','hard'];

export const CHAMPIONSHIP = [
  { id:'r1', name_en:'Neon Open', name_it:'Neon Open', opponent:'Sparkle Stars', power:0.82, program:0 },
  { id:'r2', name_en:'City Cup', name_it:'Coppa Città', opponent:'Velocity Crew', power:0.92, program:1 },
  { id:'r3', name_en:'Aurora Trophy', name_it:'Trofeo Aurora', opponent:'Aurora Angels', power:1.04, program:2 },
  { id:'r4', name_en:'Velocity Finals', name_it:'Finali Velocity', opponent:'Turbo Dynamics', power:1.16, program:3 }
];

export function beatsForElement(element, difficulty = 'medium') {
  const baseBpm = 120 * (difficulty === 'hard' ? 1.15 : difficulty === 'easy' ? 0.88 : 1);
  const beatsPerSecond = baseBpm / 60;
  return Math.max(4, Math.round(element.durMs / 1000 * beatsPerSecond * 0.5));
}

export function programFor(index) {
  if (index === 0) return PROGRAM;
  // Varianti di campionato: riducono/estendono il programma base
  const scale = [1, 0.85, 1.1, 1.2][index % 4];
  return PROGRAM.slice(0, Math.max(5, Math.round(PROGRAM.length * Math.min(1, scale))))
    .map(el => ({ ...el, durMs: Math.round(el.durMs * (index === 3 ? 1.1 : 1)) }));
}
