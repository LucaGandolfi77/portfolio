/* I DUE LUMI — Mondo: tile, zone, stanze, memorie */
const TILES = {};
const MAPLEGEND = {
  '.': { name:'grass' }, ',': { name:'path' },
  '#': { name:'tree', solid:1 }, '~': { name:'water', solid:1 },
  's': { name:'sand' }, 'w': { name:'wall', solid:1 },
  'f': { name:'floor' }, 'r': { name:'rock', solid:1 },
  '*': { name:'flower' }, 'o': { name:'void', solid:1 },
  'n': { name:'snow' }, 'd': { name:'dark' }
};
function tileSolid(ch){
  const t = MAPLEGEND[ch];
  return t ? (t.solid ? 1 : 0) : 1;
}

function tile(name, fn){
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16;
  fn(c.getContext('2d'));
  TILES[name] = c;
}
tile('grass', g => {
  g.fillStyle = hex(PAL.leaf); g.fillRect(0,0,16,16);
  g.fillStyle = hex(PAL.sage);
  [[2,3],[9,2],[5,10],[13,12]].forEach(p => g.fillRect(p[0],p[1],2,1));
});
tile('path', g => {
  g.fillStyle = hex(PAL.wheat); g.fillRect(0,0,16,16);
  g.fillStyle = hex(PAL.dirt);
  [[1,4],[7,11],[12,3],[4,14]].forEach(p => g.fillRect(p[0],p[1],2,1));
});
tile('tree', g => {
  g.fillStyle = hex(PAL.leaf); g.fillRect(0,0,16,13);
  g.fillStyle = hex(PAL.moss);
  g.fillRect(2,1,4,3); g.fillRect(9,4,4,3); g.fillRect(4,9,5,2);
  g.fillStyle = hex(PAL.cocoa); g.fillRect(6,12,4,4);
});
tile('water', g => {
  g.fillStyle = hex(PAL.dusk); g.fillRect(0,0,16,16);
  g.fillStyle = hex(PAL.sky);
  g.fillRect(2,4,5,1); g.fillRect(9,10,5,1); g.fillRect(5,13,3,1);
});
tile('sand', g => {
  g.fillStyle = hex(PAL.wheat); g.fillRect(0,0,16,16);
  g.fillStyle = hex(PAL.cream);
  [[3,5],[10,2],[6,12]].forEach(p => g.fillRect(p[0],p[1],2,1));
});
tile('wall', g => {
  g.fillStyle = hex(PAL.slate); g.fillRect(0,0,16,16);
  g.fillStyle = hex(PAL.inkSoft);
  for(let y=0;y<16;y+=4) g.fillRect(0,y,16,1);
  for(let y=0;y<16;y+=4){ g.fillRect(4,y,1,4); g.fillRect(12,y+2,1,4); }
});
tile('floor', g => {
  g.fillStyle = hex(PAL.face2 || '#d4d0c8'); g.fillRect(0,0,16,16);
  g.fillStyle = hex(PAL.slate);
  for(let y=0;y<16;y+=8) g.fillRect(0,y,16,1);
  g.fillRect(8,0,1,8); g.fillRect(0,8,1,8);
});
tile('rock', g => {
  g.fillStyle = hex(PAL.slate); g.fillRect(1,3,14,11);
  g.fillStyle = hex(PAL.dirt); g.fillRect(3,5,5,3); g.fillRect(10,8,3,3);
});
tile('flower', g => {
  g.fillStyle = hex(PAL.leaf); g.fillRect(0,0,16,16);
  g.fillStyle = hex(PAL.rose); g.fillRect(7,3,2,2);
  g.fillStyle = hex(PAL.butter); g.fillRect(5,5,6,2);
  g.fillStyle = hex(PAL.moss); g.fillRect(7,7,1,3);
});
tile('void', g => {
  g.fillStyle = hex(PAL.night); g.fillRect(0,0,16,16);
  g.fillStyle = hex(PAL.dusk); g.fillRect(2,2,2,2); g.fillRect(11,10,2,2);
});
tile('snow', g => {
  g.fillStyle = hex(PAL.mist); g.fillRect(0,0,16,16);
  g.fillStyle = hex(PAL.milk); g.fillRect(3,4,4,1); g.fillRect(10,11,4,1);
});
tile('dark', g => {
  g.fillStyle = hex(PAL.ink); g.fillRect(0,0,16,16);
  g.fillStyle = hex(PAL.slate); g.fillRect(2,3,2,1); g.fillRect(11,9,2,1);
});

const ZONES = {
  hub:     { sky:['sky','butter'], song:'hub', fog:0 },
  meadow:  { sky:['sky','cream'], song:'meadow', fog:0 },
  forest:  { sky:['mist','fog'], song:'forest', fog:0.35 },
  coast:   { sky:['sky','mist'], song:'coast', fog:0.15 },
  wind:    { sky:['dusk','mist'], song:'wind', fog:0.5 },
  crisis:  { sky:['night','dusk'], song:'crisis', fog:0.25 },
  finale:  { sky:['dusk','fog'], song:'finale', fog:0.1 },
};

const ROOMS = {};
const MAP_COLS = 30, MAP_ROWS = 12;
function mapOf(base, rects){
  const rows = [];
  for(let y=0;y<MAP_ROWS;y++) rows.push(new Array(MAP_COLS).fill(base).join(''));
  (rects||[]).forEach(r => {
    const ch = r[0], x0 = r[1], y0 = r[2], rw = r[3], rh = r[4];
    for(let y=y0;y<y0+rh;y++) for(let x=x0;x<x0+rw;x++){
      if(rows[y] && x>=0 && x<MAP_COLS) rows[y] = rows[y].slice(0,x) + ch + rows[y].slice(x+1);
    }
  });
  return rows;
}
function addRoom(id, zone, base, rects, opts){
  const o = Object.assign({}, opts||{});
  ROOMS[id] = Object.assign({ id, zone, map:mapOf(base,rects), w:MAP_COLS*16, h:MAP_ROWS*16,
    spawn:{x:48,y:96}, exits:{}, npcs:[], enemies:[], mem:[], switches:[], doors:[] }, o);
  return ROOMS[id];
}

/* --- hub: la casa di nonna --- */
addRoom('hubA','hub','.',[
  ['#',0,0,30,1],['#',0,11,30,1],['#',0,0,1,12],['#',29,0,1,12],
  [',',1,5,28,2],[',',14,1,2,4],['~',22,8,4,3],['*',4,3,2,1],['*',17,9,2,1]
],{
  spawn:{x:48,y:96},
  npcs:[{id:'nonna',x:120,y:80,active:true,animFrame:0}],
  mem:[{id:1,x:320,y:96}],
  switches:[{tx:25,ty:2,flag:'sw_forest'}],
  doors:[{tx:27,ty:2,switch:'sw_forest',to:'forest1',spawn:{x:40,y:96}}],
  exits:{ right:{to:'meadow1',x:24,y:96}, down:{to:'meadow2',x:80,y:24} }
});

/* --- prati --- */
addRoom('meadow1','meadow','.',[
  ['#',0,0,30,1],['#',0,11,30,1],['#',0,0,1,12],['#',29,0,1,12],
  [',',1,5,28,2],['*',5,3,3,1],['*',20,8,3,1],['s',24,1,4,3]
],{
  spawn:{x:32,y:96},
  npcs:[{id:'contadina',x:176,y:80,active:true,animFrame:0}],
  enemies:[{id:'lucciola',x:300,y:64,active:true,animFrame:0}],
  mem:[{id:2,x:96,y:48},{id:10,x:384,y:128}],
  exits:{ left:{to:'hubA',x:440,y:96}, right:{to:'meadow2',x:24,y:96} }
});
addRoom('meadow2','meadow','.',[
  ['#',0,0,30,1],['#',0,11,30,1],['#',0,0,1,12],['#',29,0,1,12],
  [',',1,6,28,1],['*',8,9,4,1],['r',18,3,2,2]
],{
  spawn:{x:32,y:112},
  npcs:[{id:'bambina',x:160,y:112,active:true,animFrame:0}],
  enemies:[{id:'ombra',x:320,y:96,active:true,animFrame:0}],
  mem:[{id:3,x:240,y:48}],
  exits:{ left:{to:'meadow1',x:440,y:96}, down:{to:'forest1',x:120,y:24}, up:{to:'hubA',x:80,y:136} }
});

/* --- foresta --- */
addRoom('forest1','forest','.',[
  ['#',0,0,30,1],['#',0,11,30,1],['#',0,0,1,12],['#',29,0,1,12],
  ['#',4,2,3,2],['#',22,7,3,2],[',',1,5,28,2],
  ['f',25,2,1,3],['d',24,2,3,1]
],{
  spawn:{x:48,y:96},
  npcs:[{id:'custode',x:192,y:96,active:true,animFrame:0}],
  enemies:[{id:'ramenta',x:352,y:48,active:true,animFrame:0}],
  mem:[{id:4,x:80,y:48}],
  switches:[{tx:6,ty:9,flag:'sw_coast'}],
  doors:[{tx:25,ty:2,switch:'sw_coast',to:'coast1',spawn:{x:40,y:96}}],
  exits:{ up:{to:'meadow2',x:120,y:136}, right:{to:'forest2',x:24,y:96} }
});
addRoom('forest2','forest','.',[
  ['#',0,0,30,1],['#',0,11,30,1],['#',0,0,1,12],['#',29,0,1,12],
  ['#',6,3,4,2],['#',20,8,4,2],[',',1,5,28,2]
],{
  spawn:{x:32,y:96},
  npcs:[{id:'custodeeco',x:176,y:96,active:true,animFrame:0}],
  enemies:[{id:'ombra',x:288,y:48,active:true,animFrame:0},{id:'lucciola',x:400,y:128,active:true,animFrame:0}],
  mem:[{id:5,x:112,y:32},{id:11,x:384,y:64}],
  exits:{ left:{to:'forest1',x:440,y:96}, down:{to:'coast1',x:96,y:24} }
});

/* --- costa --- */
addRoom('coast1','coast','s',[
  ['~',0,0,30,2],['~',27,0,3,12],['~',0,10,30,2],
  [',',1,4,26,2],['r',12,7,2,1]
],{
  spawn:{x:48,y:96},
  npcs:[{id:'focascena',x:176,y:80,active:true,animFrame:0}],
  enemies:[{id:'foca',x:336,y:80,active:true,animFrame:0}],
  mem:[{id:6,x:96,y:112}],
  exits:{ up:{to:'forest1',x:408,y:136}, right:{to:'coast2',x:24,y:96} }
});
addRoom('coast2','coast','s',[
  ['~',0,0,30,2],['~',0,10,30,2],['~',0,0,1,12],['~',29,0,1,12],
  [',',1,4,28,2],['w',18,2,2,2]
],{
  spawn:{x:32,y:96},
  npcs:[{id:'signora',x:128,y:96,active:true,animFrame:0}],
  enemies:[{id:'specchio',x:304,y:96,active:true,animFrame:0}],
  mem:[{id:7,x:240,y:48},{id:12,x:400,y:128}],
  exits:{ left:{to:'coast1',x:440,y:96}, up:{to:'wind1',x:144,y:136} }
});

/* --- vento --- */
addRoom('wind1','wind','.',[
  ['#',0,0,30,1],['o',0,11,30,1],['#',0,0,1,12],['#',29,0,1,12],
  [',',1,5,28,2],['r',10,2,2,2],['r',20,8,2,2]
],{
  spawn:{x:48,y:96},
  npcs:[{id:'falco',x:208,y:80,active:true,animFrame:0}],
  enemies:[{id:'vento',x:320,y:48,active:true,animFrame:0}],
  mem:[{id:8,x:112,y:112}],
  exits:{ down:{to:'coast2',x:144,y:24}, right:{to:'crisis',x:24,y:96} }
});

/* --- crisi --- */
addRoom('crisis','crisis','d',[
  ['o',0,0,30,1],['o',0,11,30,1],['o',0,0,1,12],['o',29,0,1,12],
  ['f',1,4,28,4],['w',14,2,2,2],['#',6,8,3,2],['#',21,8,3,2]
],{
  spawn:{x:40,y:96},
  enemies:[{id:'specchio',x:176,y:96,active:true,animFrame:0},{id:'custode',x:352,y:96,active:true,animFrame:0}],
  mem:[{id:9,x:96,y:64}],
  exits:{ left:{to:'wind1',x:440,y:96}, right:{to:'finale',x:24,y:96} }
});

/* --- finale --- */
addRoom('finale','finale','.',[
  ['#',0,0,30,1],['#',0,11,30,1],['#',0,0,1,12],['#',29,0,1,12],
  [',',1,5,28,2],['*',6,3,4,1],['*',20,8,4,1]
],{
  spawn:{x:48,y:96},
  npcs:[{id:'nonna',x:208,y:96,active:true,animFrame:0}],
  exits:{ left:{to:'crisis',x:440,y:96} }
});
