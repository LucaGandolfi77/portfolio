/* ================= WORLD ================= */
const TILE=16, WORLD_T=2200, WORLD_PX=WORLD_T*TILE;
let SEED=1;
function setSeed(v){SEED=(v>>>0)||1;}
function hash2(x,y,s){let h=s^Math.imul(x,374761393)^Math.imul(y,668265263);h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296;}
const BIOMES=['grass','forest','desert','snow','ocean','volcano','crystal'];
const BIOME_COL={grass:'#3d8f4f',forest:'#2e6b3f',desert:'#c9a35f',snow:'#dbe6f2',ocean:'#2456a8',volcano:'#8a3a24',crystal:'#7a5ac8'};

/* Valore di rumore interpolato: i biomi formano REGIONI continue invece di
   cambiare ad ogni tile (che produceva una scacchiera illegibile). */
function vnoise(x,y,salt,cell){
  const gx=x/cell,gy=y/cell,x0=Math.floor(gx),y0=Math.floor(gy);
  const fx=gx-x0,fy=gy-y0;
  const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  const a=hash2(x0,y0,salt),b=hash2(x0+1,y0,salt);
  const c=hash2(x0,y0+1,salt),d=hash2(x0+1,y0+1,salt);
  const top=a+(b-a)*sx,bot=c+(d-c)*sx;
  return top+(bot-top)*sy;
}
function biomeAt(tx,ty){
  const n=vnoise(tx,ty,SEED,40)*0.97+hash2(tx,ty,SEED^0x77)*0.03;
  if(n>0.66)return'ocean';
  if(n<0.41)return'grass';
  if(n<0.46)return'forest';
  if(n<0.51)return'desert';
  if(n<0.56)return'snow';
  if(n<0.61)return'volcano';
  return'crystal';
}
function tileObj(tx,ty){
  if(biomeAt(tx,ty)==='ocean')return null;
  /* Radure: le risorse crescono in piccoli gruppi, non su ogni tile. */
  if(vnoise(tx,ty,SEED^0x1234,8)<0.42)return null;
  const n=hash2(tx,ty,SEED^0x9e3779b9);
  if(n<0.04)return'tree';
  if(n<0.06)return'rock';
  if(n<0.08)return'berry';
  if(n<0.10)return'bush';
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

