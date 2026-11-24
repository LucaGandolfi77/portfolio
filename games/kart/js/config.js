/* Neon Kart — karts, tracks, modes, power-ups and EN/IT strings */
export const VERSION = 1;
export const WORLD = { w: 1600, h: 1200 };
export const STEP = 1 / 60;

export const KARTS = [
  { id:'spark', en:'Spark', it:'Spark', color:'#00d4ff', speed:45.0, accel:24.0, handling:3.4, grip:0.86, nitro:100, stars:0 },
  { id:'comet', en:'Comet', it:'Comet', color:'#b28dff', speed:48.0, accel:25.5, handling:3.1, grip:0.84, nitro:110, stars:0 },
  { id:'ember', en:'Ember', it:'Ember', color:'#ff6b4a', speed:51.0, accel:27.0, handling:2.9, grip:0.80, nitro:115, stars:2 },
  { id:'frost', en:'Frost', it:'Frost', color:'#8ad4ff', speed:48.0, accel:24.0, handling:3.3, grip:0.90, nitro:105, stars:2 },
  { id:'volt', en:'Volt', it:'Volt', color:'#ffd166', speed:52.5, accel:28.5, handling:2.7, grip:0.78, nitro:125, stars:4 },
  { id:'mint', en:'Mint', it:'Mint', color:'#5ef0a8', speed:46.5, accel:28.5, handling:3.2, grip:0.88, nitro:110, stars:4 },
  { id:'ruby', en:'Ruby', it:'Ruby', color:'#ff5d8f', speed:54.0, accel:27.0, handling:2.5, grip:0.76, nitro:130, stars:6 },
  { id:'onyx', en:'Onyx', it:'Onyx', color:'#7d8cff', speed:55.5, accel:25.5, handling:2.4, grip:0.74, nitro:135, stars:8 },
  { id:'solar', en:'Solar', it:'Solar', color:'#ffb347', speed:57.0, accel:30.0, handling:2.2, grip:0.72, nitro:140, stars:10 },
  { id:'nova', en:'Nova', it:'Nova', color:'#ff7bff', speed:58.5, accel:31.5, handling:2.1, grip:0.70, nitro:145, stars:12 },
  { id:'phantom', en:'Phantom', it:'Phantom', color:'#d6e9ff', speed:60.0, accel:33.0, handling:2.0, grip:0.68, nitro:150, stars:15 },
  { id:'apex', en:'Apex', it:'Apex', color:'#ff3d5a', speed:63.0, accel:34.5, handling:1.9, grip:0.66, nitro:160, stars:18 }
];

/* Track generators return closed centerline waypoints. */
const ellipse = (cx, cy, rx, ry, n = 24, phase = 0) =>
  Array.from({ length:n }, (_, i) => ({ x:cx + Math.cos(phase + i / n * Math.PI * 2) * rx,
    y:cy + Math.sin(phase + i / n * Math.PI * 2) * ry }));
const stadium = (cx, cy, w, h, n = 6) => {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = Math.PI + i / n * Math.PI;
    pts.push({ x:cx + Math.cos(a) * w / 2, y:cy - h / 2 + Math.sin(a) * h / 2 });
  }
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI;
    pts.push({ x:cx + Math.cos(a) * w / 2, y:cy + h / 2 + Math.sin(a) * h / 2 });
  }
  return pts;
};
const figure8 = (cx, cy, s = 340) =>
  Array.from({ length:40 }, (_, i) => {
    const t = i / 40 * Math.PI * 2;
    return { x:cx + Math.sin(t) * s, y:cy + Math.sin(t * 2) * s * 0.55 };
  });
const spiral = (cx, cy) =>
  Array.from({ length:44 }, (_, i) => {
    const t = i / 44 * Math.PI * 2, r = 180 + t * 95;
    return { x:cx + Math.cos(t) * r, y:cy + Math.sin(t) * r * 0.72 };
  });
const wavy = (cx, cy) =>
  Array.from({ length:36 }, (_, i) => {
    const t = i / 36 * Math.PI * 2;
    return { x:cx + Math.cos(t) * (380 + Math.sin(t * 3) * 100),
      y:cy + Math.sin(t) * (300 + Math.cos(t * 2) * 80) };
  });

export const TRACKS = [
  { id:'meadow', en:'Green Meadow', it:'Prato Verde', theme:'grass', ground:'#123b22', road:'#59636b', width:104, stars:0, points:ellipse(800,600,520,360,28) },
  { id:'desert', en:'Dusty Desert', it:'Deserto Polveroso', theme:'desert', ground:'#4a3218', road:'#b09367', width:100, stars:0, points:stadium(800,600,1000,620,10) },
  { id:'night', en:'Neon Night', it:'Notte Neon', theme:'night', ground:'#0b1030', road:'#39406a', width:110, stars:2, points:wavy(800,600) },
  { id:'figure8', en:'Figure Eight', it:'Otto', theme:'ice', ground:'#163b4a', road:'#a9c4d4', width:96, stars:4, points:figure8(800,600,360) },
  { id:'city', en:'City Circuit', it:'Circuito Cittadino', theme:'city', ground:'#1c2230', road:'#4d5563', width:116, stars:6, points:stadium(800,600,1080,540,10) },
  { id:'spiral', en:'Spiral Coil', it:'Spirale', theme:'lava', ground:'#2a1210', road:'#6a4a44', width:92, stars:8, points:spiral(800,600) },
  { id:'canyon', en:'Canyon Run', it:'Canyon Run', theme:'desert', ground:'#3b2116', road:'#a67952', width:94, stars:10, points:ellipse(800,600,540,300,24,0.4) },
  { id:'storm', en:'Storm Track', it:'Pista Tempesta', theme:'night', ground:'#111a2e', road:'#3d4f70', width:104, stars:12, points:figure8(800,600,400) },
  { id:'apex', en:'Apex Ring', it:'Anello Apex', theme:'city', ground:'#241832', road:'#5a4d70', width:88, stars:15, points:ellipse(800,600,560,420,32,0.2) }
];

export const MODES = [
  { id:'grandprix', en:'Grand Prix', it:'Gran Premio', laps:3, rivals:6, powerups:false, stars:0 },
  { id:'time', en:'Time Trial', it:'Prova a Tempo', laps:3, rivals:0, powerups:false, stars:0 },
  { id:'knockout', en:'Knockout', it:'Knockout', laps:5, rivals:5, powerups:true, stars:3 },
  { id:'rush', en:'Turbo Rush', it:'Turbo Rush', laps:2, rivals:5, powerups:true, stars:5 }
];

export const POWERUPS = [
  { id:'turbo', en:'Turbo', it:'Turbo', icon:'🔥', color:'#ff9d3d' },
  { id:'shield', en:'Shield', it:'Scudo', icon:'🛡️', color:'#5aa9ff' },
  { id:'freeze', en:'Freeze', it:'Gelo', icon:'❄️', color:'#9be7ff' },
  { id:'rocket', en:'Rocket', it:'Razzo', icon:'🚀', color:'#ff5d6c' },
  { id:'oil', en:'Oil', it:'Olio', icon:'🛢️', color:'#2b2b35' }
];

export const STR = {
  it: {
    skip:'Vai al contenuto', title:'NEON KART', tagline:'Corri, deriva, vinci',
    garage:'Garage', tracks:'Piste', modes:'Modalità', start:'Parti!', back:'Indietro',
    speed:'KM/H', lap:'Giro', position:'Pos', time:'Tempo', best:'Record', nitro:'Nitro',
    pause:'Pausa', resume:'Riprendi', restart:'Riavvia', menu:'Menu', settings:'Impostazioni', settingsTitle:'Impostazioni',
    help:'Guida', lang:'IT / EN', theme:'Tema', sound:'Suono', vibration:'Vibrazione',
    quality:'Qualità', low:'Bassa', high:'Alta', motion:'Effetti ridotti',
    ready:'Preparati…', go:'VIA!', finish:'Finito!', win:'Vittoria!', lost:'Sconfitta',
    lapTime:'Giro', total:'Totale', newBest:'Nuovo record!', stars:'Stelle',
    unlock:'Sbloccato!', locked:'Bloccato', select:'Seleziona', drift:'Deriva',
    brake:'Freno', boost:'Nitro', steer:'Sterzo', hold:'Tieni premuto',
    helpText:'Sterza con A/D o con i pulsanti a schermo. Tieni premuto DRIFT in curva per caricare il mini-turbo. Tocca NITRO per lo scatto. Spazio = drift, Shift = nitro, Esc = pausa.',
    arrow:'Freccia', left:'Sinistra', right:'Destra', ok:'OK', close:'Chiudi',
    rank:'Classifica', ghost:'Ghost', split:'Split', tryAgain:'Riprova',
    champions:'Campionato', unlocked:'sbloccati', none:'—'
  },
  en: {
    skip:'Skip to content', title:'NEON KART', tagline:'Race, drift, win',
    garage:'Garage', tracks:'Tracks', modes:'Modes', start:'Race!', back:'Back',
    speed:'KM/H', lap:'Lap', position:'Pos', time:'Time', best:'Best', nitro:'Nitro',
    pause:'Pause', resume:'Resume', restart:'Restart', menu:'Menu', settings:'Settings', settingsTitle:'Settings',
    help:'Help', lang:'IT / EN', theme:'Theme', sound:'Sound', vibration:'Vibration',
    quality:'Quality', low:'Low', high:'High', motion:'Reduced motion',
    ready:'Get ready…', go:'GO!', finish:'Finished!', win:'Victory!', lost:'Defeat',
    lapTime:'Lap', total:'Total', newBest:'New record!', stars:'Stars',
    unlock:'Unlocked!', locked:'Locked', select:'Select', drift:'Drift',
    brake:'Brake', boost:'Nitro', steer:'Steer', hold:'Hold',
    helpText:'Steer with A/D or the on-screen buttons. Hold DRIFT in corners to charge a mini-turbo. Tap NITRO for a speed burst. Space = drift, Shift = nitro, Esc = pause.',
    arrow:'Arrow', left:'Left', right:'Right', ok:'OK', close:'Close',
    rank:'Standings', ghost:'Ghost', split:'Split', tryAgain:'Try again',
    champions:'Championship', unlocked:'unlocked', none:'—'
  }
};

export const KART_BY_ID = id => KARTS.find(k => k.id === id) || KARTS[0];
export const TRACK_BY_ID = id => TRACKS.find(t => t.id === id) || TRACKS[0];
export const MODE_BY_ID = id => MODES.find(m => m.id === id) || MODES[0];
