/* I DUE LUMI — Sprite procedurali pixel art */
const S = {};

function sprite(name, w, h, fn){
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  fn(g, w, h);
  S[name] = c;
}

function drawEyes(g, x, y, col, blink){
  if(blink){
    g.fillStyle = hex(col);
    g.fillRect(x, y+2, 2, 1);
    g.fillRect(x+5, y+2, 2, 1);
  } else {
    g.fillStyle = '#f7e8c9';
    g.fillRect(x, y, 2, 3);
    g.fillRect(x+5, y, 2, 3);
    g.fillStyle = hex(col);
    g.fillRect(x, y+1, 2, 2);
    g.fillRect(x+5, y+1, 2, 2);
  }
}

function drawLegs(g, y, frame, col){
  g.fillStyle = hex(col);
  if(frame===0){ g.fillRect(5,y,2,4); g.fillRect(9,y,2,4); }
  else if(frame===1){ g.fillRect(4,y,2,4); g.fillRect(10,y,2,4); }
  else if(frame===2){ g.fillRect(6,y+1,2,3); g.fillRect(8,y,2,4); }
  else { g.fillRect(4,y,2,4); g.fillRect(10,y,2,4); }
}

function drawMilo(g, frame, dir){
  g.clearRect(0,0,16,20);
  /* body */
  g.fillStyle = hex(PAL.gold);
  g.fillRect(3,6,10,7);
  g.fillStyle = hex(PAL.honey);
  g.fillRect(4,7,8,5);
  /* head */
  g.fillStyle = hex(PAL.gold);
  g.fillRect(4,1,8,7);
  /* eyes */
  drawEyes(g, 5, 3, PAL.ink, frame===4);
  /* nose */
  g.fillStyle = hex(PAL.pumpkin);
  g.fillRect(7,5,2,1);
  /* smile */
  g.fillStyle = hex(PAL.inkSoft);
  g.fillRect(6,6,4,1);
  /* blush */
  g.fillStyle = hex(PAL.rose);
  g.fillRect(4,5,1,1);
  g.fillRect(11,5,1,1);
  /* ears */
  g.fillStyle = hex(PAL.gold);
  g.fillRect(3,0,3,2);
  g.fillRect(10,0,3,2);
  g.fillStyle = hex(PAL.pumpkin);
  g.fillRect(4,0,1,1);
  g.fillRect(11,0,1,1);
  /* legs */
  drawLegs(g, 13, frame%4, PAL.honey);
  /* tail */
  g.fillStyle = hex(PAL.gold);
  if(frame<4) g.fillRect(13,8+Math.floor((frame%3)/2),2,2);
  else g.fillRect(13,8,2,2);
}

function drawTito(g, frame, dir){
  g.clearRect(0,0,16,20);
  g.fillStyle = hex(PAL.pumpkin);
  g.fillRect(3,6,10,7);
  g.fillStyle = hex(PAL.terracotta);
  g.fillRect(4,7,8,5);
  g.fillStyle = hex(PAL.pumpkin);
  g.fillRect(4,1,8,7);
  drawEyes(g, 5, 3, PAL.ink, frame===4);
  g.fillStyle = hex(PAL.moss);
  g.fillRect(7,5,2,1);
  g.fillStyle = hex(PAL.inkSoft);
  g.fillRect(6,6,4,1);
  g.fillStyle = hex(PAL.rose);
  g.fillRect(4,5,1,1);
  g.fillRect(11,5,1,1);
  g.fillStyle = hex(PAL.pumpkin);
  g.fillRect(3,0,3,2);
  g.fillRect(10,0,3,2);
  g.fillStyle = hex(PAL.gold);
  g.fillRect(4,0,1,1);
  g.fillRect(11,0,1,1);
  drawLegs(g, 13, frame%4, PAL.terracotta);
  g.fillStyle = hex(PAL.pumpkin);
  if(frame<4) g.fillRect(13,8+Math.floor((frame%3)/2),2,2);
  else g.fillRect(13,8,2,2);
}

function drawShadow(g){
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.beginPath();
  g.ellipse(8,18,5,2,0,0,Math.PI*2);
  g.fill();
}

function drawNPC(g, type, frame){
  g.clearRect(0,0,24,24);
  drawShadow(g);
  if(type==='nonna'){
    g.fillStyle = hex(PAL.cream);
    g.fillRect(7,4,10,11);
    g.fillStyle = hex(PAL.wheat);
    g.fillRect(6,3,12,2);
    g.fillStyle = hex(PAL.rose);
    g.fillRect(8,15,8,3);
    drawLegs(g, 18, frame%4, PAL.inkSoft);
    drawEyes(g, 9, 6, PAL.ink, false);
    g.fillStyle = hex(PAL.rose);
    g.fillRect(11,8,2,1);
  } else if(type==='bambina'){
    g.fillStyle = hex(PAL.sky);
    g.fillRect(8,5,8,9);
    g.fillStyle = hex(PAL.mist);
    g.fillRect(9,6,6,7);
    drawEyes(g, 10, 7, PAL.ink, frame===4);
    g.fillStyle = hex(PAL.gold);
    g.fillRect(7,2,10,4);
    drawLegs(g, 14, frame%4, PAL.sky);
  } else if(type==='custode'||type==='custodeeco'){
    g.fillStyle = hex(PAL.moss);
    g.fillRect(6,4,12,12);
    g.fillStyle = hex(PAL.leaf);
    g.fillRect(7,5,10,10);
    g.fillStyle = hex(PAL.inkSoft);
    g.fillRect(9,7,2,2);
    g.fillRect(13,7,2,2);
    g.fillStyle = hex(PAL.rose);
    g.fillRect(11,10,2,1);
    drawLegs(g, 16, frame%4, PAL.moss);
    g.fillStyle = hex(PAL.moss);
    g.fillRect(5,1,14,4);
  } else {
    g.fillStyle = hex(PAL.cream);
    g.fillRect(8,4,8,10);
    drawEyes(g, 10, 6, PAL.ink, false);
    drawLegs(g, 14, frame%4, PAL.cream);
  }
}

function drawEnemy(g, type, frame){
  g.clearRect(0,0,16,16);
  if(type==='ombra'){
    const a = 0.4+Math.sin(frame/4)*0.2;
    g.fillStyle = `rgba(13,11,9,${a})`;
    g.beginPath();
    g.moveTo(8,2);
    g.lineTo(14,14);
    g.lineTo(2,14);
    g.fill();
    g.fillStyle = `rgba(207,106,58,${a+0.3})`;
    g.fillRect(6,6,1,1);
    g.fillRect(9,6,1,1);
  } else if(type==='lucciola'){
    g.fillStyle = hex(PAL.gold);
    g.fillRect(7,7,2,2);
    g.fillStyle = hex(PAL.butter);
    g.fillRect(6+Math.floor(Math.sin(frame/2)*2),6+Math.floor(Math.cos(frame/3)*2),1,1);
  } else if(type==='custode'){
    g.fillStyle = hex(PAL.moss);
    g.fillRect(2,2,12,10);
    g.fillStyle = hex(PAL.leaf);
    g.fillRect(3,3,10,8);
    g.fillStyle = hex(PAL.inkSoft);
    g.fillRect(5,5,2,2);
    g.fillRect(9,5,2,2);
    g.fillStyle = hex(PAL.gold);
    g.fillRect(7,8,2,2);
    g.fillRect(6,12,1,3);
    g.fillRect(9,12,1,3);
  } else if(type==='foca'){
    g.fillStyle = hex(PAL.slate);
    g.fillRect(3,4,10,8);
    g.fillStyle = hex(PAL.inkSoft);
    g.fillRect(4,5,8,6);
    g.fillStyle = hex(PAL.fog);
    g.fillRect(6,6,1,1);
    g.fillRect(9,6,1,1);
    g.fillStyle = hex(PAL.dusk);
    g.fillRect(7,9,2,1);
    g.fillRect(5,12,2,3);
    g.fillRect(9,12,2,3);
  } else if(type==='vento'){
    const a = 0.3+Math.sin(frame/6)*0.2;
    g.fillStyle = `rgba(196,215,224,${a})`;
    for(let i=0;i<5;i++){
      const ox = Math.floor(Math.sin(frame/3+i)*3);
      g.fillRect(4+i*2+ox, 3+i, 2, 1);
    }
  } else if(type==='ramenta'){
    g.fillStyle = hex(PAL.gold);
    g.fillRect(2,2,12,10);
    g.fillStyle = hex(PAL.pumpkin);
    g.fillRect(3,3,10,8);
    g.fillStyle = hex(PAL.ink);
    g.fillRect(5,5,2,2);
    g.fillRect(9,5,2,2);
    g.fillStyle = hex(PAL.milk);
    g.fillRect(7,4,2,1);
  } else if(type==='specchio'){
    g.fillStyle = hex(PAL.fog);
    g.fillRect(3,2,10,12);
    g.fillStyle = hex(PAL.mist);
    g.fillRect(4,3,8,10);
    g.fillStyle = hex(PAL.ink);
    g.fillRect(6,5,1,2);
    g.fillRect(9,5,1,2);
  }
}

/* pre-render sprites for performance */
S.pre = {};
function preRender(){
  for(let f=0;f<5;f++){
    const c = document.createElement('canvas'); c.width=16; c.height=20;
    drawMilo(c.getContext('2d'), f, 0);
    S.pre['milo'+f] = c;
    const c2 = document.createElement('canvas'); c2.width=16; c2.height=20;
    drawTito(c2.getContext('2d'), f, 0);
    S.pre['tito'+f] = c2;
  }
  for(let f=0;f<8;f++){
    ['ombra','lucciola','custode','foca','vento','ramenta','specchio'].forEach(e => {
      const c = document.createElement('canvas'); c.width=16; c.height=16;
      drawEnemy(c.getContext('2d'), e, f);
      S.pre[e+f] = c;
    });
  }
  ['nonna','bambina','custode','signora','focascena','contadina','falco'].forEach(n => {
    for(let f=0;f<8;f++){
      const c = document.createElement('canvas'); c.width=24; c.height=24;
      drawNPC(c.getContext('2d'), n, f);
      S.pre[n+f] = c;
    }
  });
}
