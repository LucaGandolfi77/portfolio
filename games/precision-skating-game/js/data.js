/*  precision-skating-game/js/data.js  */
'use strict';

/* ── bilingual strings ── */
var STR = {
  en: {
    title: 'PRECISION SKATING',
    subtitle: 'Coach a 16-skater roller team through choreographed routines',
    play: 'PLAY',
    lang: 'IT / EN',
    pause: 'PAUSE',
    resume: 'RESUME',
    restart: 'RESTART',
    quit: 'QUIT',
    score: 'SCORE',
    time: 'TIME',
    combo: 'COMBO',
    element: 'ELEMENT',
    perfect: 'PERFECT',
    good: 'GOOD',
    miss: 'MISS',
    drift: 'DRIFT',
    corrected: 'CORRECTED',
    elementDone: 'ELEMENT DONE',
    routineDone: 'ROUTINE COMPLETE',
    technical: 'Technical',
    execution: 'Execution',
    artistic: 'Artistic',
    penalties: 'Penalties',
    comboBonus: 'Combo Bonus',
    total: 'TOTAL',
    tapHint: 'TAP THE BEAT',
    tapSkater: 'TAP DRIFTING SKATERS',
    spaceHint: 'SPACE = tap',
    clickHint: 'CLICK = tap',
    ok: 'OK',
    formation: 'Formation',
    line: 'Line',
    block: 'Block',
    pivotLine: 'Pivoting Line',
    circle: 'Circle',
    wheel: 'Wheel',
    travelCircle: 'Traveling Circle',
    lift: 'Lift',
    whip: 'Whip Intersection',
    dfm: 'Difficult Move',
    noHold: 'No Hold'
  },
  it: {
    title: 'PATTINAGGIO DI PRECISIONE',
    subtitle: 'Allena una squadra di 16 pattinatrici in coreografie sincronizzate',
    play: 'GIOCA',
    lang: 'IT / EN',
    pause: 'PAUSA',
    resume: 'RIPRENDI',
    restart: 'RICOMINCIA',
    quit: 'ESCI',
    score: 'PUNTEGGIO',
    time: 'TEMPO',
    combo: 'COMBO',
    element: 'ELEMENTO',
    perfect: 'PERFETTO',
    good: 'BUONO',
    miss: 'MANCATO',
    drift: 'SCARTO',
    corrected: 'CORRETTO',
    elementDone: 'ELEMENTO COMPLETATO',
    routineDone: 'ROUTINE COMPLETATA',
    technical: 'Tecnico',
    execution: 'Esecuzione',
    artistic: 'Artistico',
    penalties: 'Penalità',
    comboBonus: 'Bonus Combo',
    total: 'TOTALE',
    tapHint: 'TOCCA SUL RITMO',
    tapSkater: 'TOCCA LE PATTINATRICI CHE SI SPOSTANO',
    spaceHint: 'SPAZIO = tocca',
    clickHint: 'CLIC = tocca',
    ok: 'OK',
    formation: 'Formazione',
    line: 'Linea',
    block: 'Blocco',
    pivotLine: 'Linea Pivottante',
    circle: 'Cerchio',
    wheel: 'Ruota',
    travelCircle: 'Cerchio Viaggiante',
    lift: 'Lift',
    whip: 'Incrocio a Frusta',
    dfm: 'Movimento Difficile',
    noHold: 'Senza Presa'
  }
};

/* ── 16 skaters with stats ── */
var SKATERS = [
  { id:1,  name:'Arianna',    role:'captain', precision:90, timing:88, speed:82, flow:91, balance:87, synchro:94, stamina:84, recovery:90 },
  { id:2,  name:'Beatrice',   role:'skater',  precision:86, timing:91, speed:84, flow:88, balance:85, synchro:92, stamina:82, recovery:87 },
  { id:3,  name:'Chiara',     role:'skater',  precision:88, timing:84, speed:89, flow:86, balance:90, synchro:89, stamina:83, recovery:85 },
  { id:4,  name:'Diletta',    role:'skater',  precision:83, timing:90, speed:86, flow:89, balance:82, synchro:88, stamina:88, recovery:91 },
  { id:5,  name:'Elena',      role:'skater',  precision:91, timing:87, speed:80, flow:90, balance:92, synchro:93, stamina:81, recovery:88 },
  { id:6,  name:'Francesca',  role:'skater',  precision:85, timing:86, speed:92, flow:84, balance:87, synchro:86, stamina:89, recovery:84 },
  { id:7,  name:'Giulia',     role:'skater',  precision:89, timing:93, speed:85, flow:92, balance:88, synchro:95, stamina:86, recovery:90 },
  { id:8,  name:'Irene',      role:'skater',  precision:82, timing:89, speed:90, flow:85, balance:84, synchro:87, stamina:90, recovery:88 },
  { id:9,  name:'Laura',      role:'skater',  precision:87, timing:85, speed:88, flow:89, balance:91, synchro:90, stamina:84, recovery:86 },
  { id:10, name:'Martina',    role:'skater',  precision:84, timing:92, speed:83, flow:87, balance:86, synchro:91, stamina:87, recovery:89 },
  { id:11, name:'Noemi',      role:'skater',  precision:90, timing:88, speed:86, flow:93, balance:89, synchro:92, stamina:80, recovery:85 },
  { id:12, name:'Olivia',     role:'skater',  precision:81, timing:87, speed:91, flow:83, balance:85, synchro:86, stamina:92, recovery:90 },
  { id:13, name:'Paola',      role:'skater',  precision:86, timing:90, speed:84, flow:88, balance:90, synchro:89, stamina:85, recovery:87 },
  { id:14, name:'Rebecca',    role:'skater',  precision:88, timing:84, speed:93, flow:90, balance:86, synchro:94, stamina:83, recovery:89 },
  { id:15, name:'Sara',       role:'skater',  precision:85, timing:89, speed:87, flow:86, balance:88, synchro:90, stamina:91, recovery:91 },
  { id:16, name:'Valentina',  role:'skater',  precision:92, timing:91, speed:81, flow:94, balance:93, synchro:96, stamina:82, recovery:90 }
];

/* skater pastel palette (roller rink vibes) */
var SKATER_COLORS = [
  '#ff6b9d','#c084fc','#60a5fa','#34d399','#fbbf24','#fb923c',
  '#f472b6','#a78bfa','#38bdf8','#4ade80','#facc15','#fb7185',
  '#e879f9','#818cf8','#2dd4bf','#fca5a5'
];

/* ── formation templates ──
   Each returns an array of {x,y} targets (normalized 0-1) for 16 skaters.
   The engine interpolates from current position toward these targets. */

var FORMATIONS = {

  LINE: function () {
    /* 2 rows of 8 */
    var pts = [];
    for (var i = 0; i < 16; i++) {
      var row = i < 8 ? 0 : 1;
      var col = i % 8;
      pts.push({ x: 0.5 + (col - 3.5) * 0.055, y: 0.48 + row * 0.06 });
    }
    return pts;
  },

  BLOCK: function () {
    /* 4 rows x 4 cols closed block */
    var pts = [];
    for (var i = 0; i < 16; i++) {
      var row = Math.floor(i / 4);
      var col = i % 4;
      pts.push({ x: 0.44 + col * 0.044, y: 0.42 + row * 0.055 });
    }
    return pts;
  },

  CIRCLE: function () {
    var pts = [];
    for (var i = 0; i < 16; i++) {
      var a = (i / 16) * Math.PI * 2 - Math.PI / 2;
      pts.push({ x: 0.5 + Math.cos(a) * 0.18, y: 0.5 + Math.sin(a) * 0.16 });
    }
    return pts;
  },

  WHEEL: function () {
    /* center + spokes */
    var pts = [];
    var spokes = 4;
    var perSpoke = 4;
    /* center = skater 0 */
    pts.push({ x: 0.5, y: 0.5 });
    for (var s = 0; s < spokes; s++) {
      var baseAngle = (s / spokes) * Math.PI * 2 - Math.PI / 2;
      for (var j = 0; j < perSpoke - 1; j++) {
        var r = 0.06 + j * 0.06;
        pts.push({ x: 0.5 + Math.cos(baseAngle) * r, y: 0.5 + Math.sin(baseAngle) * r });
      }
    }
    /* pad to 16 if needed */
    while (pts.length < 16) {
      var a = (pts.length / 16) * Math.PI * 2;
      pts.push({ x: 0.5 + Math.cos(a) * 0.05, y: 0.5 + Math.sin(a) * 0.05 });
    }
    return pts;
  },

  INTERSECTION: function () {
    /* two lines crossing from left/right and top/bottom */
    var pts = [];
    for (var i = 0; i < 16; i++) {
      if (i < 8) {
        var t = i / 7;
        pts.push({ x: 0.2 + t * 0.6, y: 0.5 });
      } else {
        var t2 = (i - 8) / 7;
        pts.push({ x: 0.5, y: 0.2 + t2 * 0.6 });
      }
    }
    return pts;
  },

  TRAVELING: function () {
    /* moving circle (offset x for travel direction) */
    var pts = [];
    for (var i = 0; i < 16; i++) {
      var a = (i / 16) * Math.PI * 2 - Math.PI / 2;
      pts.push({ x: 0.55 + Math.cos(a) * 0.15, y: 0.5 + Math.sin(a) * 0.14 });
    }
    return pts;
  }
};

/* ── sample routine (90 seconds, 8 elements) ── */
var PROGRAM = [
  { seq:1, variant:'BLOCK',       name_en:'Block',             name_it:'Blocco',             diff:'medium',    level:2, startMs:0,    durMs:28000 },
  { seq:2, variant:'LINE',        name_en:'Pivoting Line',     name_it:'Linea Pivottante',   diff:'medium',    level:2, startMs:30000, durMs:26000 },
  { seq:3, variant:'CIRCLE',      name_en:'Circle',            name_it:'Cerchio',            diff:'medium',    level:2, startMs:58000, durMs:30000 },
  { seq:4, variant:'WHEEL',       name_en:'Lift',              name_it:'Lift',               diff:'very_hard', level:1, startMs:92000, durMs:18000 },
  { seq:5, variant:'TRAVELING',   name_en:'Traveling Circle',  name_it:'Cerchio Viaggiante', diff:'hard',      level:2, startMs:112000, durMs:30000 },
  { seq:6, variant:'INTERSECTION',name_en:'Whip Intersection',  name_it:'Incrocio a Frusta',  diff:'very_hard', level:3, startMs:146000, durMs:26000 },
  { seq:7, variant:'CIRCLE',      name_en:'Difficult Move',    name_it:'Movimento Difficile',diff:'hard',      level:2, startMs:176000, durMs:26000 },
  { seq:8, variant:'BLOCK',       name_en:'No Hold 4x4 Block', name_it:'Blocco 4x4 Senza Presa', diff:'hard', level:2, startMs:206000, durMs:30000 }
];

/* beats per element (auto-generated from duration) */
function beatsForElement(el) {
  var bpm = 120;
  var beatsPerSec = bpm / 60;
  var durSec = el.durMs / 1000;
  return Math.max(4, Math.round(durSec * beatsPerSec * 0.5)); /* half-beats for rhythm */
}

/* difficulty multiplier for error probability */
var DIFF_MULT = { easy: 0.6, medium: 1.0, hard: 1.5, very_hard: 2.2 };
