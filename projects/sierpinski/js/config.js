/* Fractal Observatory — forms, palettes, presets and bilingual strings */

export const PALETTES = {
  rainbow: { en: 'Rainbow', it: 'Arcobaleno', fn: (l, m) => `hsl(${l / Math.max(1, m) * 300},90%,58%)` },
  ice: { en: 'Ice', it: 'Ghiaccio', fn: (l, m) => `hsl(${185 + l / Math.max(1, m) * 55},85%,${42 + l / Math.max(1, m) * 30}%)` },
  ember: { en: 'Ember', it: 'Braci', fn: (l, m) => `hsl(${8 + l / Math.max(1, m) * 44},92%,${30 + l / Math.max(1, m) * 34}%)` },
  mono: { en: 'Mono', it: 'Monocromo', fn: (l, m) => `hsl(210,55%,${88 - l / Math.max(1, m) * 52}%)` },
  candy: { en: 'Candy', it: 'Caramella', fn: l => `hsl(${[320, 270, 300, 340, 200][((l % 5) + 5) % 5]},88%,62%)` },
  neon: { en: 'Neon', it: 'Neon', fn: (l, m) => `hsl(${(l / Math.max(1, m) * 180 + 280) % 360},100%,${55 + (l % 2) * 15}%)` }
};

export const FORMS = [
  { id:'tri', name:'Sierpinski Triangle', icon:'🔺', color:'#00e5ff',
    params:[{k:'depth',en:'Depth',it:'Profondità',min:0,max:12,val:8,step:1},
            {k:'skewX',en:'Skew X',it:'Skew X',min:-45,max:45,val:0,step:1},
            {k:'skewY',en:'Skew Y',it:'Skew Y',min:-45,max:45,val:0,step:1},
            {k:'jitter',en:'Jitter %',it:'Jitter %',min:0,max:60,val:0,step:1}],
    defaults:{depth:8,skewX:0,skewY:0,jitter:0} },
  { id:'chaos', name:'Chaos Game', icon:'✨', color:'#b388ff',
    params:[{k:'verts',en:'Vertices',it:'Vertici',min:3,max:12,val:3,step:1},
            {k:'pull',en:'Vertex pull %',it:'Attrazione %',min:10,max:90,val:50,step:1},
            {k:'speed',en:'Points / frame',it:'Punti / frame',min:20,max:3000,val:600,step:20},
            {k:'jitter',en:'Weight variance',it:'Varianza peso',min:0,max:90,val:0,step:1}],
    flags:['noRepeat','orbitTrap'],
    defaults:{verts:3,pull:50,speed:600,jitter:0,noRepeat:false,orbitTrap:false} },
  { id:'carpet', name:'Sierpinski Carpet', icon:'⬛', color:'#ff7ab8',
    params:[{k:'depth',en:'Depth',it:'Profondità',min:0,max:7,val:5,step:1},
            {k:'twist',en:'Per-iteration rotate',it:'Rotazione per iterazione',min:-45,max:45,val:0,step:1}],
    defaults:{depth:5,twist:0} },
  { id:'vicsek', name:'Vicsek Cross', icon:'✚', color:'#57d98a',
    params:[{k:'depth',en:'Depth',it:'Profondità',min:0,max:8,val:6,step:1}],
    defaults:{depth:6} },
  { id:'dust', name:'Cantor Dust', icon:'⁙', color:'#f6c453',
    params:[{k:'depth',en:'Depth',it:'Profondità',min:0,max:8,val:6,step:1}],
    defaults:{depth:6} },
  { id:'tsquare', name:'T-Square', icon:'▦', color:'#c9a6ff',
    params:[{k:'depth',en:'Depth',it:'Profondità',min:0,max:9,val:7,step:1}],
    defaults:{depth:7} },
  { id:'koch', name:'Koch Snowflake', icon:'❄️', color:'#7ad0c0',
    params:[{k:'depth',en:'Iterations',it:'Iterazioni',min:0,max:7,val:4,step:1},
            {k:'angle',en:'Peak angle',it:'Angolo picco',min:20,max:80,val:60,step:1}],
    defaults:{depth:4,angle:60} },
  { id:'htree', name:'H-Tree', icon:'🌳', color:'#85b8f0',
    params:[{k:'depth',en:'Depth',it:'Profondità',min:0,max:10,val:7,step:1},
            {k:'ratio',en:'Length ratio',it:'Rapporto lunghezza',min:40,max:75,val:63,step:1}],
    defaults:{depth:7,ratio:63} },
  { id:'ftree', name:'Fractal Tree', icon:'🌿', color:'#ffd166',
    params:[{k:'depth',en:'Depth',it:'Profondità',min:0,max:13,val:10,step:1},
            {k:'spread',en:'Branch angle',it:'Angolo rami',min:5,max:85,val:26,step:1},
            {k:'ratio',en:'Length ratio',it:'Rapporto lunghezza',min:50,max:85,val:72,step:1},
            {k:'asym',en:'Asymmetry',it:'Asimmetria',min:0,max:60,val:0,step:1}],
    defaults:{depth:10,spread:26,ratio:72,asym:0} },
  { id:'dragon', name:'Dragon Curve', icon:'🐉', color:'#ff8fa8',
    params:[{k:'iters',en:'Iterations',it:'Iterazioni',min:0,max:16,val:12,step:1},
            {k:'turn',en:'Turn angle',it:'Angolo curva',min:45,max:120,val:90,step:1}],
    defaults:{iters:12,turn:90} },
  { id:'sierpinski', name:'Arrowhead (Chaos)', icon:'➤', color:'#4de8ff',
    params:[{k:'verts',en:'Vertices',it:'Vertici',min:3,max:10,val:3,step:1},
            {k:'pull',en:'Pull',it:'Attrazione',min:20,max:80,val:50,step:1}],
    defaults:{verts:3,pull:50} }
];

export const PRESETS = [
  { id:'sierpinski', en:'Classic Triangle', it:'Triangolo classico', form:'chaos', params:{verts:3,pull:50,noRepeat:false} },
  { id:'pentagon', en:'Pentagon Star', it:'Stella a pentagono', form:'chaos', params:{verts:5,pull:63,noRepeat:true} },
  { id:'hexaweb', en:'Hexa Web', it:'Rete esagonale', form:'chaos', params:{verts:6,pull:66,noRepeat:true} },
  { id:'hepta', en:'Hepta Bloom', it:'Fiore a sette', form:'chaos', params:{verts:7,pull:56,noRepeat:true} },
  { id:'snowflake', en:'Infinite Snow', it:'Neve infinita', form:'koch', params:{depth:5,angle:60} },
  { id:'spiraltri', en:'Spiral Triangle', it:'Triangolo a spirale', form:'tri', params:{depth:8,skewX:12,skewY:8,jitter:0} },
  { id:'twistcarpet', en:'Twisted Carpet', it:'Tappeto attorcigliato', form:'carpet', params:{depth:5,twist:15} },
  { id:'windtree', en:'Windswept Tree', it:'Albero ventoso', form:'ftree', params:{depth:10,spread:31,ratio:74,asym:18} }
];

export const DEFAULT_SETTINGS = Object.freeze({
  form: 'tri', palette: 'neon', glow: 12, spin: false, blend: 'lighter',
  symmetry: 1, bg: 'stars', reveal: true, reduced: false
});

export const STR = {
  it: {
    title:'FRACTAL OBSERVATORY', tagline:'Esplora la geometria infinita — 11 frattali, parametri creativi, export.', skip:'Vai al contenuto',
    forms:'Forme', params:'Parametri', style:'Stile', actions:'Azioni', presets:'Preset',
    depth:'Profondità', palette:'Palette', glow:'Glow', spin:'Rotazione auto', symmetry:'Simmetria',
    blend:'Blend mode', background:'Sfondo', stars:'Stelle', grid:'Griglia', plain:'Semplice',
    reveal:'Rivelazione animata', random:'Randomizza', reset:'Reset camera', save:'Salva preset',
    exportPng:'Esporta PNG', exportSvg:'Esporta SVG', copy:'Copia link', copied:'Link copiato',
    favorite:'Preferiti', fps:'FPS', elems:'elementi', points:'punti', zoom:'zoom', rot:'rotazione',
    drag:'Trascina', pinch:'pizza', twist:'ruota a due dita', resetHint:'doppio tap = reset',
    stopSpin:'Tocca per fermare la rotazione', how:'Come usare', howText:'Trascina per spostare, pizza per zoomare, ruota a due dita per ruotare. I parametri cambiano il frattale in tempo reale. Esporta in PNG o SVG.',
    lang:'IT / EN', sound:'Audio', ok:'OK', resetAll:'Azzera impostazioni',
    quality:'Qualità', high:'Alta', medium:'Media', low:'Bassa', share:'Condividi'
  },
  en: {
    title:'FRACTAL OBSERVATORY', tagline:'Explore infinite geometry — 11 fractals, creative parameters, export.', skip:'Skip to content',
    forms:'Forms', params:'Parameters', style:'Style', actions:'Actions', presets:'Presets',
    depth:'Depth', palette:'Palette', glow:'Glow', spin:'Auto-spin', symmetry:'Symmetry',
    blend:'Blend mode', background:'Background', stars:'Stars', grid:'Grid', plain:'Plain',
    reveal:'Animated reveal', random:'Randomize', reset:'Reset camera', save:'Save preset',
    exportPng:'Export PNG', exportSvg:'Export SVG', copy:'Copy link', copied:'Link copied',
    favorite:'Favorites', fps:'FPS', elems:'elements', points:'points', zoom:'zoom', rot:'rotation',
    drag:'Drag', pinch:'pinch', twist:'two-finger twist', resetHint:'double-tap = reset',
    stopSpin:'Touch to stop spin', how:'How to use', howText:'Drag to pan, pinch to zoom, twist to rotate. Parameters change the fractal in real time. Export to PNG or SVG.',
    lang:'IT / EN', sound:'Sound', ok:'OK', resetAll:'Reset settings',
    quality:'Quality', high:'High', medium:'Medium', low:'Low', share:'Share'
  }
};
