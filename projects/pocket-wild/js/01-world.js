/* ================= WORLD ================= */
const TILE=16, WORLD_T=2200, WORLD_PX=WORLD_T*TILE;
let SEED=1;
function setSeed(v){SEED=(v>>>0)||1;}
function hash2(x,y,s){let h=s^Math.imul(x,374761393)^Math.imul(y,668265263);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296;}
const BIOMES=['grass','forest','desert','snow','ocean','volcano','crystal'];
const BIOME_COL={grass:'#3d8f4f',forest:'#2e6b3f',desert:'#c9a35f',snow:'#dbe6f2',ocean:'#2456a8',volcano:'#8a3a24',crystal:'#7a5ac8'};
function biomeAt(tx,ty){
  const n=hash2(tx,ty,SEED);
  if(n>0.86)return'ocean';
  if(n<0.28)return'grass';
  if(n<0.46)return'forest';
  if(n<0.62)return'desert';
  if(n<0.74)return'snow';
  if(n<0.82)return'volcano';
  return'crystal';
}
function tileObj(tx,ty){
  if(biomeAt(tx,ty)==='ocean')return null;
  const n=hash2(tx,ty,SEED^0x9e3779b9);
  if(n<0.09)return'tree';
  if(n<0.15)return'rock';
  if(n<0.21)return'berry';
  if(n<0.26)return'bush';
  return null;
}
function solidAt(px,py){
  const tx=Math.floor(px/TILE),ty=Math.floor(py/TILE);
  if(biomeAt(tx,ty)==='ocean')return true;
  const o=tileObj(tx,ty);
  return o==='tree'||o==='rock';
}
function circleHitsSolid(x,y,r){
  for(let tx=Math.floor((x-r)/TILE);tx<=Math.floor((x+r)/TILE);tx++)
    for(let ty=Math.floor((y-r)/TILE);ty<=Math.floor((y+r)/TILE);ty++)
      if(solidAt(tx*TILE,ty*TILE)){ /* AABB vs circle approx */
        const cx=clamp(x,tx*TILE,(tx+1)*TILE),cy=clamp(y,ty*TILE,(ty+1)*TILE);
        if(Math.hypot(x-cx,y-cy)<r)return true;
      }
  return false;
}

