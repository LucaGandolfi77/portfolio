/* ================= RENDER ================= */
const canvas=$('game'),ctx=canvas.getContext('2d');
let lightCv=null; /* canvas per il light-mask notturno */
let CW=0,CH=0;
function resize(){const dpr=Math.min(devicePixelRatio||1,2);CW=innerWidth;CH=innerHeight;canvas.width=CW*dpr;canvas.height=CH*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
function drawPalShape(ctx,x,y,r,col,shape,rot,eyeR){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot||0);
  ctx.fillStyle=col;
  if(shape===0)ctx.beginPath(),ctx.arc(0,0,r,0,6.283),ctx.fill();
  else if(shape===1){ctx.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283;const rr=r*(0.7+0.3*Math.sin(a*3));i?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();}
  else if(shape===2){ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*0.9,r*0.7);ctx.lineTo(-r*0.9,r*0.7);ctx.closePath();ctx.fill();}
  else if(shape===3){ctx.fillRect(-r*0.8,-r*0.8,r*1.6,r*1.6);}
  else if(shape===4){ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*0.8,0);ctx.lineTo(0,r);ctx.lineTo(-r*0.8,0);ctx.closePath();ctx.fill();}
  else{ctx.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*1.2566;const rr=i%2?r*0.45:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();}
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(-r*0.3,-r*0.15,r*0.22*eyeR,0,6.283);ctx.fill();
  ctx.beginPath();ctx.arc(r*0.3,-r*0.15,r*0.22*eyeR,0,6.283);ctx.fill();
  ctx.fillStyle='#111';
  ctx.beginPath();ctx.arc(-r*0.3,-r*0.15,r*0.1*eyeR,0,6.283);ctx.fill();
  ctx.beginPath();ctx.arc(r*0.3,-r*0.15,r*0.1*eyeR,0,6.283);ctx.fill();
  ctx.restore();
}
function render(){
  ctx.fillStyle='#0b1020';ctx.fillRect(0,0,CW,CH);
  const season=curSeason();
  const sCols=SEASONS[season].tint;
  const camX=G.player.x-CW/2,camY=G.player.y-CH/2;
  /* tiles */
  const t0x=Math.floor(camX/TILE),t0y=Math.floor(camY/TILE),t1x=Math.ceil((camX+CW)/TILE),t1y=Math.ceil((camY+CH)/TILE);
  for(let ty=t0y;ty<=t1y;ty++)for(let tx=t0x;tx<=t1x;tx++){
    const bm=biomeAt(tx,ty);
    ctx.fillStyle=sCols[bm];
    ctx.fillRect(tx*TILE-camX,ty*TILE-camY,TILE+0.5,TILE+0.5);
    const o=tileObj(tx,ty);
    const px=tx*TILE+8-camX,py=ty*TILE+8-camY;
    if(o==='tree'){ctx.fillStyle='#1d4a2e';ctx.beginPath();ctx.arc(px,py,7,0,6.283);ctx.fill();ctx.fillStyle='#3f8f52';ctx.beginPath();ctx.arc(px,py-3,5,0,6.283);ctx.fill();}
    else if(o==='rock'){ctx.fillStyle='#5a6478';ctx.fillRect(px-6,py-4,12,8);}
    else if(o==='berry'){ctx.fillStyle='#2e6b3f';ctx.beginPath();ctx.arc(px,py,5,0,6.283);ctx.fill();ctx.fillStyle='#ff5f9e';ctx.beginPath();ctx.arc(px-2,py-1,2.2,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(px+2,py+1,2.2,0,6.283);ctx.fill();}
    else if(o==='bush'){ctx.fillStyle='#2f9e5a';ctx.beginPath();ctx.arc(px,py,5,0,6.283);ctx.fill();ctx.fillStyle='#52c96b';ctx.beginPath();ctx.arc(px-2,py-2,3,0,6.283);ctx.fill();}
    /* decorazioni biomi nuovi: fessure laviche e cristalli */
    const dec2=hash2(tx,ty,SEED^0xabc123);
    if(bm==='volcano'&&dec2<0.07){
      ctx.strokeStyle='#ff7a3f';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(px-4,py+4);ctx.lineTo(px,py-2);ctx.lineTo(px+4,py+1);ctx.stroke();
    }else if(bm==='crystal'&&dec2<0.1){
      ctx.fillStyle='#a06bff';
      ctx.beginPath();ctx.moveTo(px,py-6);ctx.lineTo(px+4,py);ctx.lineTo(px,py+4);ctx.lineTo(px-4,py);ctx.closePath();ctx.fill();
      ctx.fillStyle='#c8b0ff';ctx.beginPath();ctx.moveTo(px,py-4);ctx.lineTo(px+2,py);ctx.lineTo(px,py+2);ctx.lineTo(px-2,py);ctx.closePath();ctx.fill();
    }
    /* decorazioni stagionali: fiori in primavera, foglie in autunno */
    const dec=hash2(tx,ty,SEED^0x5eed);
    if(season===0&&dec<0.055&&!o&&bm!=='snow'&&bm!=='ocean'){
      ctx.fillStyle='#ffb8dc';ctx.beginPath();ctx.arc(px,py-2,2.4,0,6.283);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(px,py-2,1,0,6.283);ctx.fill();
    }else if(season===2&&dec<0.06&&!o&&(bm==='grass'||bm==='forest')){
      ctx.fillStyle='#ff9e3f';ctx.beginPath();ctx.arc(px+1,py-1,1.8,0,6.283);ctx.fill();
      ctx.fillStyle='#e2573f';ctx.beginPath();ctx.arc(px-1,py+1,1.4,0,6.283);ctx.fill();
    }
  }
  /* buildings */
  for(const b of G.buildings){
    const px=b.x-camX,py=b.y-camY;
    if(b.id==='campfire'){ctx.fillStyle='#7a4a22';ctx.fillRect(px-8,py-6,16,12);ctx.fillStyle=G.time>0.68?'#ff9e3f':'#c96a2a';ctx.beginPath();ctx.arc(px,py-4,6,0,6.283);ctx.fill();}
    else if(b.id==='lantern'){ctx.fillStyle='#4a3a5a';ctx.fillRect(px-2,py-2,4,10);ctx.fillStyle=G.time>0.68?'#ffd166':'#b8a0e8';ctx.beginPath();ctx.arc(px,py-5,5+Math.sin(performance.now()/160)*0.8,0,6.283);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(px-1,py-6,1.2,0,6.283);ctx.fill();}
    else if(b.id==='bed'){ctx.fillStyle='#4a6fb8';ctx.fillRect(px-10,py-5,20,10);ctx.fillStyle='#eef0ff';ctx.fillRect(px-10,py-8,20,4);}
    else if(b.id==='workbench'){ctx.fillStyle='#8a5a2a';ctx.fillRect(px-8,py-6,16,12);ctx.fillStyle='#c9a35f';ctx.fillRect(px-8,py-8,16,3);}
    else if(b.id==='chest'){ctx.fillStyle='#5a3a20';ctx.fillRect(px-8,py-6,16,12);ctx.fillStyle='#ffd166';ctx.fillRect(px-8,py-6,16,3);}
  }
  /* wild pals */
  for(const w of G.wilds){
    const sp=speciesOf(w.id);
    const px=w.x-camX,py=w.y-camY;
    const r=w.isFinal?26:(w.isBoss?14:9);
    if(w.isFinal){
      const p=Math.sin(performance.now()/180);
      ctx.fillStyle='rgba(110,60,255,'+(0.12+0.1*(p+1)/2)+')';
      ctx.beginPath();ctx.arc(px,py,r+14+3*p,0,6.283);ctx.fill();
      ctx.strokeStyle='rgba(194,107,255,'+(0.5+0.4*(p+1)/2)+')';ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(px,py,r+9+2*p,0,6.283);ctx.stroke();
    }
    drawPalShape(ctx,px,py,r,w.isFinal?'#c26bff':(w.isBoss?'#ff3355':sp.col),sp.shape,w.dir,1);
    ctx.fillStyle='rgba(0,0,0,.4)';
    ctx.fillRect(px-r,py+r+3,r*2,3);
    ctx.fillStyle=w.hp/w.maxHp>0.5?'#52ff9e':'#ff5f6d';
    ctx.fillRect(px-r,py+r+7,r*2*(w.hp/w.maxHp),2);
    if(w.isFinal){ctx.fillStyle='#ff5f6d';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('VOID SOVEREIGN',px,py-r-14);}
    else if(w.isChamp){ctx.fillStyle='#ffd166';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('CHAMPION',px,py-r-10);ctx.strokeStyle='rgba(255,209,102,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,r+4,0,6.283);ctx.stroke();}
    else if(w.isBoss){ctx.fillStyle='#ffd166';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText('ALPHA',px,py-r-8);}
    if(w.echo){ctx.globalAlpha=0.55;ctx.fillStyle='rgba(194,107,255,.35)';ctx.beginPath();ctx.arc(px,py,r+3,0,6.283);ctx.fill();ctx.fillStyle='#c26bff';ctx.font='8px sans-serif';ctx.textAlign='center';ctx.fillText('ECHO',px,py-r-6);ctx.globalAlpha=1;}
    if(w.isCustom){
      ctx.strokeStyle='rgba(255,209,102,.85)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(px,py,r+4,0,6.283);ctx.stroke();
      ctx.fillStyle='#ffd166';ctx.font='8px sans-serif';ctx.textAlign='center';
      ctx.fillText('CUSTOM',px,py-r-6);
    }
    if(w.fx>0){w.fx-=0.02;ctx.strokeStyle='rgba(255,255,255,'+w.fx+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,r+3,0,6.283);ctx.stroke();}
  }
  /* projectiles */
  for(const pr of G.projectiles){
    if(pr.kind==='arrow'){
      ctx.strokeStyle='#ffd166';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(pr.x-camX-pr.vx*0.04,pr.y-camY-pr.vy*0.04);ctx.lineTo(pr.x-camX,pr.y-camY);ctx.stroke();
    }else{
      ctx.fillStyle=SPHERE_TIERS[pr.tier].col;
      ctx.beginPath();ctx.arc(pr.x-camX,pr.y-camY,5+Math.sin(pr.t*20)*1.5,0,6.283);ctx.fill();
    }
  }
  /* bobber pesca (usa G.player: p è dichiarato più sotto) */
  if(G.fishing){
    const bx=G.player.x-camX,by=G.player.y-camY-10;
    ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+14);ctx.stroke();
    const bob=G.fishing.bitten?Math.sin(performance.now()/80)*3:Math.sin(performance.now()/400)*1.5;
    ctx.fillStyle=G.fishing.bitten?'#ff5f6d':'#ffd166';
    ctx.beginPath();ctx.arc(bx,by+16+bob,3.5,0,6.283);ctx.fill();
    if(G.fishing.bitten){
      ctx.strokeStyle='rgba(255,95,109,.8)';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(bx,by+16+bob,7,0,6.283);ctx.stroke();
    }
  }
  /* player */
  const p=G.player;
  if(G.flying){
    /* ombra proiettata a terra sotto il volo */
    ctx.fillStyle='rgba(0,0,0,.35)';
    ctx.beginPath();ctx.ellipse(p.x-camX,p.y-camY+26,10,4,0,0,6.283);ctx.fill();
  }
  const pBob=G.flying?Math.sin(performance.now()/180)*3:0;
  drawPalShape(ctx,p.x-camX,p.y-camY+pBob,10,'#3ee6ff',0,p.dir,1.2);
  ctx.strokeStyle='#fff';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(p.x-camX,p.y-camY+pBob);
  ctx.lineTo(p.x+Math.cos(p.dir)*14-camX,p.y+Math.sin(p.dir)*14-camY+pBob);
  ctx.stroke();
  /* active pal */
  const ap=G.team[G.active];
  if(ap){
    const sp=speciesOf(ap.id);
    if(G.flying){
      ctx.fillStyle='rgba(0,0,0,.3)';
      ctx.beginPath();ctx.ellipse(ap.x-camX,ap.y-camY+20,9,3.5,0,0,6.283);ctx.fill();
      const ab=Math.sin(performance.now()/140)*4;
      drawPalShape(ctx,ap.x-camX,ap.y-camY-6+ab,8,ap.spliceCol||sp.col,sp.shape,Math.atan2(ap.y-p.y,ap.x-p.x),1);
      /* ali */
      ctx.strokeStyle='rgba(194,107,255,.9)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(ap.x-camX-6,ap.y-camY-4+ab);ctx.lineTo(ap.x-camX-16,ap.y-camY-14+ab);ctx.stroke();
      ctx.beginPath();ctx.moveTo(ap.x-camX+6,ap.y-camY-4+ab);ctx.lineTo(ap.x-camX+16,ap.y-camY-14+ab);ctx.stroke();
    }else{
      drawPalShape(ctx,ap.x-camX,ap.y-camY,7,ap.spliceCol||sp.col,sp.shape,Math.atan2(ap.y-p.y,ap.x-p.x),1);
    }
  }
  /* work pals: piccolo sacco dorato sopra */
  for(const wp of G.team){
    if(wp.work==='gather'){
      ctx.fillStyle='#ffd166';
      ctx.beginPath();ctx.arc(wp.x-camX,wp.y-camY-14,3,0,6.283);ctx.fill();
    }
  }
  /* farms: seme → germoglio → pronto */
  for(const f of G.farms){
    const px=f.x-camX,py=f.y-camY;
    if(f.t<20){ctx.fillStyle='#8a5a2a';ctx.fillRect(px-4,py-1,8,3);ctx.fillStyle='#52c96b';ctx.beginPath();ctx.arc(px,py-3,2,0,6.283);ctx.fill();}
    else if(f.t<45){ctx.fillStyle='#5a3a20';ctx.fillRect(px-6,py-2,12,4);ctx.fillStyle='#52ff9e';ctx.beginPath();ctx.arc(px,py-6,3.5,0,6.283);ctx.fill();}
    else{ctx.fillStyle='#5a3a20';ctx.fillRect(px-6,py-2,12,4);ctx.fillStyle='#ff5f9e';ctx.beginPath();ctx.arc(px,py-7,4+Math.sin(performance.now()/200)*1,0,6.283);ctx.fill();ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(px-2,py-8,1.5,0,6.283);ctx.fill();}
  }
  /* rovine: cerchio di pietra + ingresso */
  for(const r of G.ruins){
    const px=r.x-camX,py=r.y-camY;
    ctx.fillStyle='rgba(90,100,120,.35)';
    ctx.beginPath();ctx.arc(px,py,12,0,6.283);ctx.fill();
    ctx.strokeStyle='#6a7488';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(px,py,12,0,6.283);ctx.stroke();
    ctx.fillStyle='#3ee6ff';
    ctx.font='9px sans-serif';ctx.textAlign='center';
    ctx.fillText('🏛',px,py+3);
  }
  /* mercante ambulante */
  if(G.trader){
    const px=G.trader.x-camX,py=G.trader.y-camY;
    ctx.fillStyle='#ffd166';
    ctx.beginPath();ctx.arc(px,py,9,0,6.283);ctx.fill();
    ctx.fillStyle='#8a5a2a';
    ctx.beginPath();ctx.arc(px,py,5,0,6.283);ctx.fill();
    ctx.fillStyle='#111';
    ctx.beginPath();ctx.arc(px-2,py-1,1.2,0,6.283);ctx.fill();
    ctx.beginPath();ctx.arc(px+2,py-1,1.2,0,6.283);ctx.fill();
    ctx.fillStyle='#ff5f9e';ctx.font='bold 11px sans-serif';ctx.textAlign='center';
    ctx.fillText('!',px,py-14);
  }
  /* allenatore errante */
  if(G.trainer){
    const px=G.trainer.x-camX,py=G.trainer.y-camY;
    ctx.fillStyle=G.trainer.col;
    ctx.beginPath();ctx.arc(px,py-5,5,0,6.283);ctx.fill();
    ctx.fillRect(px-6,py+1,12,9);
    ctx.fillStyle='#0b1020';
    ctx.beginPath();ctx.arc(px-2,py-6,1.2,0,6.283);ctx.fill();
    ctx.beginPath();ctx.arc(px+2,py-6,1.2,0,6.283);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
    ctx.fillText('⚔️',px,py-12);
    if(G.trainer.defeated)ctx.fillStyle='#ffd166';
    else ctx.fillStyle='#ff5f6d';
    ctx.font='bold 8px sans-serif';
    ctx.fillText(G.trainer.defeated?'REMATCH':'BATTLE',px,py+16);
  }
  /* void rift (final boss gate) */
  if(G.rift){
    const px=G.rift.x-camX,py=G.rift.y-camY;
    const p=Math.sin(performance.now()/140);
    ctx.fillStyle='rgba(110,60,255,'+(0.18+0.14*(p+1)/2)+')';
    ctx.beginPath();ctx.arc(px,py,16+2*p,0,6.283);ctx.fill();
    ctx.strokeStyle='rgba(194,107,255,'+(0.6+0.4*(p+1)/2)+')';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(px,py,12+2*p,0,6.283);ctx.stroke();
    ctx.fillStyle='#c26bff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';
    ctx.fillText('VOID RIFT — press E',px,py-22);
  }
  /* Elder Mira: figura viola incappucciata */
  if(G.mira){
    const px=G.mira.x-camX,py=G.mira.y-camY;
    ctx.fillStyle='#7a48d8';
    ctx.beginPath();ctx.arc(px,py-5,6,0,6.283);ctx.fill();
    ctx.fillRect(px-7,py,14,10);
    ctx.fillStyle='#b28dff';
    ctx.beginPath();ctx.arc(px,py-5,3,0,6.283);ctx.fill();
    ctx.fillStyle='#ffb8dc';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
    ctx.fillText('🌙',px,py-12);
    if(G.mira.cd<=0){ctx.fillStyle='#ffd166';ctx.font='bold 8px sans-serif';ctx.fillText('TALK',px,py+17);}
  }
  /* Bram: figura di ferro con martello */
  if(G.bram){
    const px=G.bram.x-camX,py=G.bram.y-camY;
    ctx.fillStyle='#5a6478';
    ctx.fillRect(px-6,py-8,12,7);
    ctx.fillRect(px-7,py-1,14,10);
    ctx.fillStyle='#8a92c8';
    ctx.fillRect(px-4,py-6,8,3);
    ctx.fillStyle='#ffd166';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
    ctx.fillText('🔨',px,py-14);
    ctx.fillStyle='#52ff9e';ctx.font='bold 8px sans-serif';
    ctx.fillText('UPGRADE',px,py+16);
  }
  /* dungeon: mura + trappole + segreto + volta */
  const d=G.dungeon;
  if(d){
    ctx.strokeStyle='rgba(110,140,255,.4)';ctx.lineWidth=3;
    ctx.strokeRect(d.x-d.R-camX,d.y-d.R-camY,d.R*2,d.R*2);
    for(const tr of d.traps){
      const px=tr.x-camX,py=tr.y-camY;
      const armed=tr.t<=0;
      ctx.fillStyle=armed?'#ff5f6d':'#5a6478';
      const b=armed?1+Math.sin(performance.now()/120)*0.15:0;
      ctx.beginPath();ctx.moveTo(px,py-7*b);ctx.lineTo(px-6*b,py+6);ctx.lineTo(px+6*b,py+6);ctx.closePath();ctx.fill();
    }
    if(d.secret&&!d.secretFound){
      const px=d.secret.x-camX,py=d.secret.y-camY;
      const p=Math.sin(performance.now()/160);
      ctx.fillStyle='rgba(255,255,255,'+(0.15+0.2*(p+1)/2)+')';
      ctx.beginPath();ctx.arc(px,py,9+2*p,0,6.283);ctx.fill();
      ctx.strokeStyle='#ffd166';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(px,py,9+2*p,0,6.283);ctx.stroke();
      ctx.fillStyle='#ffd166';ctx.font='10px sans-serif';ctx.textAlign='center';
      ctx.fillText('✨',px,py+3);
    }
    if(d.vault){
      const px=d.vault.x-camX,py=d.vault.y-camY;
      const p=Math.sin(performance.now()/140);
      ctx.fillStyle='#8a5a20';
      ctx.fillRect(px-8,py-6,16,12);
      ctx.fillStyle='#ffd166';
      ctx.fillRect(px-8,py-6,16,4);
      ctx.strokeStyle='rgba(255,209,102,'+(0.5+0.4*(p+1)/2)+')';ctx.lineWidth=2;
      ctx.strokeRect(px-11,py-9,22,18);
      ctx.fillStyle='#ffd166';ctx.font='bold 10px sans-serif';ctx.textAlign='center';
      ctx.fillText('VAULT',px,py-13);
    }
  }
  /* ranch (recinto + uovo) e arena */
  for(const b of G.buildings){
    const px=b.x-camX,py=b.y-camY;
    if(b.id==='ranch'){
      ctx.strokeStyle='#8a5a2a';ctx.lineWidth=2;
      ctx.strokeRect(px-11,py-11,22,22);
      ctx.fillStyle='#6a4a2a';
      ctx.fillRect(px-13,py-13,26,3);ctx.fillRect(px-13,py+10,26,3);
      if(b.b){
        const grow=b.b.ready?1:Math.min(1,b.b.t/30);
        ctx.fillStyle='#f0e6d8';
        ctx.beginPath();ctx.ellipse(px,py,4+grow*3,3+grow*2.4,0,0,6.283);ctx.fill();
        ctx.fillStyle='#ffd166';
        ctx.beginPath();ctx.arc(px,py,1.5,0,6.283);ctx.fill();
      }
    }else if(b.id==='arena'){
      ctx.fillStyle='rgba(120,120,140,.25)';
      ctx.beginPath();ctx.arc(px,py,13,0,6.283);ctx.fill();
      ctx.strokeStyle='#ff5f6d';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(px,py,13,0,6.283);ctx.stroke();
      ctx.fillStyle='#ff5f6d';ctx.font='9px sans-serif';ctx.textAlign='center';
      ctx.fillText('⚔️',px,py+3);
    }else if(b.id==='tower'){
      ctx.fillStyle='#6a4a2a';
      ctx.fillRect(px-9,py-2,18,12);
      ctx.fillStyle='#8a5a2a';
      ctx.fillRect(px-6,py-10,12,9);
      ctx.fillStyle='#ffd166';
      ctx.fillRect(px-6,py-12,12,3);
      ctx.fillStyle='#ffd166';ctx.font='9px sans-serif';ctx.textAlign='center';
      ctx.fillText('🗼',px,py+4);
    }
  }
  /* torre: confine */
  if(G.tower){
    const d=G.tower;
    ctx.strokeStyle='rgba(255,209,102,.5)';ctx.lineWidth=2;ctx.setLineDash([6,5]);
    ctx.beginPath();ctx.arc(d.x-camX,d.y-camY,d.R,0,6.283);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#ffd166';ctx.font='12px sans-serif';ctx.textAlign='center';
    ctx.fillText('🗼 Floor '+d.floor+' · '+G.wilds.filter(w=>w.tower).length+' left',d.x-camX,d.y-camY-d.R-10);
  }
  /* dungeon: confine */
  if(G.dungeon){
    const d=G.dungeon;
    ctx.strokeStyle='rgba(178,141,255,.5)';ctx.lineWidth=2;ctx.setLineDash([8,6]);
    ctx.beginPath();ctx.arc(d.x-camX,d.y-camY,d.R,0,6.283);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#b28dff';ctx.font='12px sans-serif';ctx.textAlign='center';
    ctx.fillText('🏛 Floor '+d.floor+' · '+G.wilds.filter(w=>w.dungeon).length+' left',d.x-camX,d.y-camY-d.R-10);
  }
  /* nemico duello: anello rosso */
  if(G.duel&&G.duel.e){
    const e=G.duel.e;
    ctx.strokeStyle='rgba(255,95,109,.6)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(e.x-camX,e.y-camY,15,0,6.283);ctx.stroke();
    ctx.fillStyle='#ff5f6d';ctx.font='10px sans-serif';ctx.textAlign='center';
    ctx.fillText('DUEL',e.x-camX,e.y-camY-20);
  }
  /* player weapon hint */
  if(G.equip==='sword'){
    const px2=p.x+Math.cos(p.dir)*15-camX,py2=p.y+Math.sin(p.dir)*15-camY;
    ctx.strokeStyle='#c8d6ff';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(p.x+Math.cos(p.dir)*11-camX,p.y+Math.sin(p.dir)*11-camY);
    ctx.lineTo(px2,py2);ctx.stroke();
  }else if(G.equip==='bow'){
    const bx=p.x+Math.cos(p.dir)*13-camX,by=p.y+Math.sin(p.dir)*13-camY;
    ctx.strokeStyle='#ffd166';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(bx,by,5,Math.atan2(-Math.sin(p.dir),-Math.cos(p.dir))-1,Math.atan2(-Math.sin(p.dir),-Math.cos(p.dir))+1);ctx.stroke();
  }
  if(G.player.attackFx>0){G.player.attackFx-=0.02;ctx.strokeStyle='rgba(255,255,255,'+G.player.attackFx*4+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x-camX,p.y-camY,18,0,6.283);ctx.stroke();}
  /* build ghost */
  if(G.buildMode){
    ctx.fillStyle='rgba(62,230,255,.25)';
    const tx=Math.floor(p.x/TILE),ty=Math.floor(p.y/TILE);
    ctx.fillRect(tx*TILE-camX,ty*TILE-camY,TILE,TILE);
  }
  /* night overlay — light mask: le luci (giocatore, pal, falò, lanterne, bed, boss, rift) bucano l'oscurità */
  if(G.time>0.6){
    const a=clamp((G.time-0.6)/0.4,0,1)*0.78;
    if(!lightCv){lightCv=document.createElement('canvas');}
    lightCv.width=CW;lightCv.height=CH;
    const lc=lightCv.getContext('2d');
    lc.clearRect(0,0,CW,CH);
    lc.fillStyle='rgba(6,8,26,'+a.toFixed(2)+')';
    lc.fillRect(0,0,CW,CH);
    lc.globalCompositeOperation='destination-out';
    const light=(x,y,r)=>{
      if(x<-r||y<-r||x>CW+r||y>CH+r)return;
      const g=lc.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,'rgba(0,0,0,1)');
      g.addColorStop(0.55,'rgba(0,0,0,0.9)');
      g.addColorStop(1,'rgba(0,0,0,0)');
      lc.fillStyle=g;lc.beginPath();lc.arc(x,y,r,0,6.283);lc.fill();
    };
    light(p.x-camX,p.y-camY,150);
    const ap2=G.team[G.active];
    if(ap2)light(ap2.x-camX,ap2.y-camY,110);
    for(const b of G.buildings){
      if(b.id==='campfire')light(b.x-camX,b.y-camY,135);
      else if(b.id==='lantern')light(b.x-camX,b.y-camY,120);
      else if(b.id==='bed')light(b.x-camX,b.y-camY,70);
      else if(b.id==='workbench')light(b.x-camX,b.y-camY,55);
      else if(b.id==='chest')light(b.x-camX,b.y-camY,45);
    }
    if(G.rift)light(G.rift.x-camX,G.rift.y-camY,95);
    for(const w of G.wilds)if(w.isBoss)light(w.x-camX,w.y-camY,85);
    lc.globalCompositeOperation='source-over';
    ctx.drawImage(lightCv,0,0);
  }
  /* weather overlays */
  const wt=performance.now()/1000;
  if(G.weather==='rain'){
    ctx.strokeStyle='rgba(120,170,255,.28)';ctx.lineWidth=1;
    for(let i=0;i<60;i++){
      const sx=(i*97+(wt*700)%CW)%CW,sy=(i*53+(wt*900)%CH)%CH;
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-8,sy+18);ctx.stroke();
    }
  }else if(G.weather==='sandstorm'){
    ctx.fillStyle='rgba(201,163,95,.16)';ctx.fillRect(0,0,CW,CH);
    ctx.strokeStyle='rgba(240,200,130,.25)';ctx.lineWidth=2;
    for(let i=0;i<30;i++){
      const sx=((i*173+(wt*1000)%CW)%CW),sy=((i*61+(wt*600)%CH)%CH);
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+40,sy+4);ctx.stroke();
    }
  }else if(G.weather==='aurora'){
    const g=ctx.createLinearGradient(0,0,0,CH*0.5);
    g.addColorStop(0,'rgba(62,230,255,.20)');g.addColorStop(0.5,'rgba(255,95,158,.10)');g.addColorStop(1,'rgba(82,255,158,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH*0.5);
    ctx.strokeStyle='rgba(160,240,255,.35)';ctx.lineWidth=3;
    for(let i=0;i<5;i++){
      ctx.beginPath();
      for(let x=0;x<=CW;x+=40){
        const y=CH*0.12+i*22+Math.sin(x*0.01+wt*0.5+i)*8;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
  }
  /* eclissi: velo viola pulsante + sole morso */
  if(G.event&&G.event.type==='eclipse'){
    const p=Math.sin(performance.now()/250);
    ctx.fillStyle='rgba(40,10,60,'+(0.28+0.12*(p+1)/2)+')';
    ctx.fillRect(0,0,CW,CH);
    const ex=CW*0.82,ey=CH*0.14;
    ctx.fillStyle='#3a1020';
    ctx.beginPath();ctx.arc(ex,ey,34,0,6.283);ctx.fill();
    ctx.fillStyle='#ff7a3f';
    ctx.beginPath();ctx.arc(ex+14,ey,30,0,6.283);ctx.fill();
    ctx.strokeStyle='rgba(255,122,63,.7)';ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(ex+14,ey,34+p*3,0,6.283);ctx.stroke();
  }
  /* meteore (evento) */
  if(G.event&&G.event.type==='meteor'){
    for(let i=0;i<8;i++){
      const mx=((i*211+wt*1400)%CW),my=((i*97+(wt*1800)%CH)%CH);
      ctx.strokeStyle='rgba(255,209,102,.7)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx-22,my+34);ctx.stroke();
      ctx.fillStyle='#ffd166';
      ctx.beginPath();ctx.arc(mx,my,2.5,0,6.283);ctx.fill();
    }
  }
}
/* minimap */
const mm=$('minimap'),mmx=mm.getContext('2d');
function renderMinimap(){
  const S=mm.width,scale=G.flying?1.5:3;
  mmx.clearRect(0,0,S,S);
  const cxp=clamp(G.player.x/TILE/WORLD_T,0,1),cyp=clamp(G.player.y/TILE/WORLD_T,0,1);
  const half=S/2/scale;
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const tx=Math.floor(G.player.x/TILE+(x-S/2)/scale);
    const ty=Math.floor(G.player.y/TILE+(y-S/2)/scale);
    if(tx<0||ty<0||tx>=WORLD_T||ty>=WORLD_T){mmx.fillStyle='#0b1020';mmx.fillRect(x,y,1,1);continue;}
    mmx.fillStyle=BIOME_COL[biomeAt(tx,ty)];
    mmx.fillRect(x,y,1,1);
  }
  mmx.fillStyle='#fff';
  mmx.fillRect(S/2-1,S/2-1,2,2);
  const mark=(x,y,col,sz)=>{
    const bx=S/2+(x-G.player.x)/TILE/scale,by=S/2+(y-G.player.y)/TILE/scale;
    if(bx>-sz&&bx<S+sz&&by>-sz&&by<S+sz){mmx.fillStyle=col;mmx.fillRect(bx-sz,by-sz,sz*2+1,sz*2+1);}
  };
  for(const b of G.buildings)mark(b.x,b.y,'#ffd166',1);
  for(const r of G.ruins)mark(r.x,r.y,'#b28dff',1);
  for(const b of G.bosses)mark(b.x,b.y,'#ff3355',2);
  if(G.trader)mark(G.trader.x,G.trader.y,'#ffd166',2);
  if(G.trainer)mark(G.trainer.x,G.trainer.y,'#ff5f6d',2);
  if(G.rift)mark(G.rift.x,G.rift.y,'#c26bff',2);
  if(G.dungeon)mark(G.dungeon.x,G.dungeon.y,'#8a5a20',2);
}

